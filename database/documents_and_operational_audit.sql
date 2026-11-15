create table public.service_documents (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id),
 service_id uuid not null, name text not null check(length(btrim(name)) between 1 and 200),
 status text not null default 'pendiente' check(status in ('pendiente','en_revision','aprobado')),
 updated_at timestamptz not null default now(),
 foreign key(service_id,company_id) references public.funeral_services(id,company_id)
);
create index service_documents_service_idx on public.service_documents(company_id,service_id);
alter table public.service_documents enable row level security;
grant select,insert,update on public.service_documents to authenticated;
create policy service_documents_member_read on public.service_documents for select to authenticated using (exists(select 1 from public.company_memberships m where m.company_id=service_documents.company_id and m.user_id=(select auth.uid()) and m.active));
create policy service_documents_member_insert on public.service_documents for insert to authenticated with check (exists(select 1 from public.company_memberships m where m.company_id=service_documents.company_id and m.user_id=(select auth.uid()) and m.active));
create policy service_documents_member_update on public.service_documents for update to authenticated using (exists(select 1 from public.company_memberships m where m.company_id=service_documents.company_id and m.user_id=(select auth.uid()) and m.active)) with check (exists(select 1 from public.company_memberships m where m.company_id=service_documents.company_id and m.user_id=(select auth.uid()) and m.active));

create table public.operational_record_logs (
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.companies(id),
 record_id uuid not null references public.operational_records(id),
 previous_details jsonb,details jsonb not null,changed_by uuid references auth.users(id),created_at timestamptz not null default now()
);
create index operational_record_logs_record_idx on public.operational_record_logs(company_id,record_id,created_at);
alter table public.operational_record_logs enable row level security;
grant select,insert on public.operational_record_logs to authenticated;
create policy operational_logs_read on public.operational_record_logs for select to authenticated using(exists(select 1 from public.company_memberships m where m.company_id=operational_record_logs.company_id and m.user_id=(select auth.uid()) and m.active));
create policy operational_logs_trigger_insert on public.operational_record_logs for insert to authenticated with check(pg_trigger_depth()>0 and changed_by=(select auth.uid()) and exists(select 1 from public.company_memberships m where m.company_id=operational_record_logs.company_id and m.user_id=(select auth.uid()) and m.active));
create or replace function fc_private.audit_operational_record() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if TG_OP='INSERT' or new.details is distinct from old.details or new.title is distinct from old.title then
    insert into public.operational_record_logs(company_id,record_id,previous_details,details,changed_by)
    values(new.company_id,new.id,case when TG_OP='UPDATE' then old.details else null end,new.details,auth.uid());
  end if;
  return new;
end $$;
revoke all on function fc_private.audit_operational_record() from public;
create trigger fc_operational_audit after insert or update on public.operational_records for each row execute function fc_private.audit_operational_record();

create or replace function fc_private.restrict_admin_record() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.module='admin' and auth.uid() is not null and not exists(select 1 from public.company_memberships m where m.company_id=new.company_id and m.user_id=(select auth.uid()) and m.active and m.role='owner') then
   raise exception 'Solo el propietario puede modificar la configuración administrativa.';
 end if;
 return new;
end $$;
revoke all on function fc_private.restrict_admin_record() from public;
create trigger fc_admin_record_guard before insert or update on public.operational_records for each row execute function fc_private.restrict_admin_record();
