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
