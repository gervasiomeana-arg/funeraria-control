-- Additive guards: existing rows are preserved. Trigger functions never bypass RLS.
create schema if not exists fc_private;

create or replace function fc_private.guard_operational_record()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare field_name text; field_value text; linked_service text; resource_key text;
begin
  if TG_OP = 'UPDATE' and (new.company_id <> old.company_id or new.module <> old.module) then
    raise exception 'No se puede cambiar la funeraria ni el módulo de un registro.';
  end if;
  if jsonb_typeof(new.details) <> 'object' or length(btrim(new.title)) = 0 then
    raise exception 'El título y los datos del registro son obligatorios.';
  end if;
  new.updated_at := now();
  if new.module = 'inventario' then
    foreach field_name in array array['quantity','minimum'] loop
      field_value := new.details ->> field_name;
      if field_value is null or field_value !~ '^[0-9]+$' then
        raise exception 'Existencias y mínimo deben ser enteros mayores o iguales a cero.';
      end if;
      if length(field_value) > 9 then raise exception 'Cantidad fuera de rango.'; end if;
    end loop;
    if coalesce(btrim(new.details ->> 'sku'),'') = '' then raise exception 'El código SKU es obligatorio.'; end if;
  end if;
  linked_service := new.details ->> 'service';
  if new.module in ('agenda','familias') and coalesce(linked_service,'') <> '' and not exists (
    select 1 from public.funeral_services s where s.company_id = new.company_id and s.reference = linked_service
  ) then raise exception 'El expediente no pertenece a esta funeraria.'; end if;
  if new.module = 'agenda' then
    if coalesce(new.details ->> 'date','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
       or coalesce(new.details ->> 'time','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
      raise exception 'Indicá una fecha y hora válidas.';
    end if;
    perform (new.details ->> 'date')::date;
    if coalesce(new.details ->> 'end_time','') <> '' and (
      (new.details ->> 'end_time') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
      or (new.details ->> 'end_time') <= (new.details ->> 'time')
    ) then raise exception 'La hora de cierre debe ser posterior al inicio del mismo día.'; end if;
    resource_key := new.details ->> 'resource';
    if coalesce(resource_key,'') <> '' then
      perform pg_advisory_xact_lock(hashtextextended(new.company_id::text || resource_key, 0));
      if not exists (select 1 from public.operational_records r where r.id::text=resource_key and r.company_id=new.company_id and r.module='recursos') then
        raise exception 'Recurso no válido para esta funeraria.';
      end if;
      if coalesce(new.details ->> 'end_time','') = '' then raise exception 'Indicá la hora de cierre al reservar un recurso.'; end if;
      if exists (select 1 from public.operational_records r where r.company_id=new.company_id and r.module='agenda' and r.id <> new.id
        and r.details ->> 'resource' = resource_key and r.details ->> 'date' = new.details ->> 'date'
        and coalesce(r.details ->> 'time','00:00') < new.details ->> 'end_time'
        and coalesce(nullif(r.details ->> 'end_time',''),'23:59') > new.details ->> 'time') then
        raise exception 'El recurso ya tiene una reserva en ese horario.';
      end if;
    end if;
  end if;
  return new;
end $$;
revoke all on function fc_private.guard_operational_record() from public;
create trigger fc_operational_guard before insert or update on public.operational_records
for each row execute function fc_private.guard_operational_record();

create or replace function fc_private.audit_service_stage()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if TG_OP='INSERT' or new.status is distinct from old.status then
    insert into public.service_stage_logs(company_id,service_id,stage,changed_by)
    values(new.company_id,new.id,new.status,auth.uid());
  end if;
  return new;
end $$;
revoke all on function fc_private.audit_service_stage() from public;
grant insert on public.service_stage_logs to authenticated;
create policy fc_stage_log_trigger_insert on public.service_stage_logs for insert to authenticated
with check (pg_trigger_depth() > 0 and changed_by=(select auth.uid()) and exists (
  select 1 from public.company_memberships m where m.company_id=service_stage_logs.company_id and m.user_id=(select auth.uid()) and m.active
));
create trigger fc_service_stage_audit after insert or update of status on public.funeral_services
for each row execute function fc_private.audit_service_stage();

create or replace function fc_private.guard_service()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if TG_OP='UPDATE' and new.company_id <> old.company_id then raise exception 'La funeraria del expediente no se puede cambiar.'; end if;
  if new.status not in ('nuevo','documentacion','preparacion','traslado','velacion','cremacion_inhumacion','finalizado') then raise exception 'Etapa inválida.'; end if;
  if TG_OP='UPDATE' and new.reference<>old.reference and exists(select 1 from public.operational_records r where r.company_id=old.company_id and r.details->>'service'=old.reference) then raise exception 'El folio tiene registros vinculados y no se puede cambiar.'; end if;
  if btrim(new.reference)='' then raise exception 'Folio obligatorio.'; end if;
  new.updated_at := now();
  return new;
end $$;
revoke all on function fc_private.guard_service() from public;
create trigger fc_service_guard before insert or update on public.funeral_services
for each row execute function fc_private.guard_service();

-- Serialize payment writers per budget, including concurrent browser sessions.
create or replace function fc_private.guard_payment()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare target public.budgets%rowtype; paid numeric;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.budget_id::text,1));
  select * into target from public.budgets where id=new.budget_id and company_id=new.company_id;
  if not found then raise exception 'Presupuesto no disponible para esta funeraria.'; end if;
  if target.status='cancelled' then raise exception 'No se puede cobrar un presupuesto cancelado.'; end if;
  if new.method not in ('efectivo','tarjeta_debito','tarjeta_credito','transferencia_spei') then raise exception 'Método de pago inválido.'; end if;
  if new.amount_mxn <= 0 or new.amount_mxn <> round(new.amount_mxn,2) then raise exception 'Importe de pago inválido.'; end if;
  select coalesce(sum(amount_mxn),0) into paid from public.budget_payments where budget_id=new.budget_id and id<>new.id;
  if paid+new.amount_mxn > target.subtotal_mxn-target.discount_mxn+target.tax_mxn then raise exception 'El abono supera el saldo pendiente.'; end if;
  return new;
end $$;
revoke all on function fc_private.guard_payment() from public;
create trigger fc_payment_guard before insert or update on public.budget_payments
for each row execute function fc_private.guard_payment();

create or replace function fc_private.guard_budget()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare paid numeric;
begin
  if TG_OP='UPDATE' and (new.company_id<>old.company_id or new.service_id<>old.service_id) then raise exception 'No se puede reasignar un presupuesto existente.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(new.id::text,1));
  select coalesce(sum(amount_mxn),0) into paid from public.budget_payments where budget_id=new.id;
  if new.discount_mxn > new.subtotal_mxn or new.subtotal_mxn-new.discount_mxn+new.tax_mxn < paid then raise exception 'El total no puede ser inferior al descuento ni a los pagos recibidos.'; end if;
  if new.status='paid' and paid<>new.subtotal_mxn-new.discount_mxn+new.tax_mxn then raise exception 'No se puede marcar liquidado mientras exista saldo.'; end if;
  if new.status='cancelled' and paid>0 then raise exception 'Este presupuesto tiene abonos; requiere un proceso de devolución antes de cancelar.'; end if;
  return new;
end $$;
revoke all on function fc_private.guard_budget() from public;
create trigger fc_budget_guard before insert or update on public.budgets
for each row execute function fc_private.guard_budget();
