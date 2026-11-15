-- Deliberately scoped public RPCs: no direct anonymous table access.
create table public.family_portals (
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.companies(id),
 service_id uuid not null,code_hash text not null unique check(length(code_hash)=64),
 expires_at timestamptz not null,enabled boolean not null default true,
 unique(service_id,company_id),foreign key(service_id,company_id) references public.funeral_services(id,company_id)
);
alter table public.family_portals enable row level security;
grant select,insert,update on public.family_portals to authenticated;
create policy family_portals_read on public.family_portals for select to authenticated using(exists(select 1 from public.company_memberships m where m.company_id=family_portals.company_id and m.user_id=(select auth.uid()) and m.active and m.role in ('owner','manager')));
create policy family_portals_insert on public.family_portals for insert to authenticated with check(exists(select 1 from public.company_memberships m where m.company_id=family_portals.company_id and m.user_id=(select auth.uid()) and m.active and m.role in ('owner','manager')));
create policy family_portals_update on public.family_portals for update to authenticated using(exists(select 1 from public.company_memberships m where m.company_id=family_portals.company_id and m.user_id=(select auth.uid()) and m.active and m.role in ('owner','manager'))) with check(exists(select 1 from public.company_memberships m where m.company_id=family_portals.company_id and m.user_id=(select auth.uid()) and m.active and m.role in ('owner','manager')));
create table public.family_condolences (
 id uuid primary key default gen_random_uuid(),portal_id uuid not null references public.family_portals(id),
 author text not null check(length(btrim(author)) between 2 and 120),message text not null check(length(btrim(message)) between 2 and 2000),
 candle boolean not null default false,created_at timestamptz not null default now()
);
create index family_condolences_portal_date_idx on public.family_condolences(portal_id,created_at);
alter table public.family_condolences enable row level security;
-- No grants/policies expose condolences directly. Only the token-scoped RPC reads/writes them.

create or replace function public.fc_family_view(access_code text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare portal public.family_portals%rowtype; result jsonb;
begin
 if length(access_code)<>36 then return null; end if;
 select * into portal from public.family_portals where code_hash=encode(sha256(convert_to(access_code,'UTF8')),'hex') and enabled and expires_at>now();
 if not found then return null; end if;
 select jsonb_build_object('name',s.deceased_name,'reference',s.reference,
   'schedule',coalesce((select jsonb_agg(jsonb_build_object('date',r.details->>'date','time',r.details->>'time','end_time',r.details->>'end_time')) from public.operational_records r where r.company_id=portal.company_id and r.module='agenda' and r.details->>'service'=s.reference),'[]'::jsonb),
   'condolences',coalesce((select jsonb_agg(jsonb_build_object('author',c.author,'message',c.message,'candle',c.candle,'created_at',c.created_at)) from (select * from public.family_condolences where portal_id=portal.id order by created_at desc limit 100) c),'[]'::jsonb)) into result
 from public.funeral_services s where s.id=portal.service_id and s.company_id=portal.company_id;
 return result;
end $$;
revoke all on function public.fc_family_view(text) from public;
grant execute on function public.fc_family_view(text) to anon,authenticated;

create or replace function public.fc_family_condolence(access_code text,author_name text,condolence_message text,light_candle boolean default false)
returns boolean language plpgsql security definer set search_path='' as $$
declare portal public.family_portals%rowtype;
begin
 if length(access_code)<>36 or length(btrim(author_name)) not between 2 and 120 or length(btrim(condolence_message)) not between 2 and 2000 then raise exception 'Código o mensaje inválido.'; end if;
 select * into portal from public.family_portals where code_hash=encode(sha256(convert_to(access_code,'UTF8')),'hex') and enabled and expires_at>now() for update;
 if not found then raise exception 'El acceso familiar no está disponible.'; end if;
 if (select count(*) from public.family_condolences where portal_id=portal.id and created_at>now()-interval '1 day')>=100 then raise exception 'Se alcanzó el límite diario de mensajes. Intentá mañana.'; end if;
 insert into public.family_condolences(portal_id,author,message,candle) values(portal.id,btrim(author_name),btrim(condolence_message),coalesce(light_candle,false));
 return true;
end $$;
revoke all on function public.fc_family_condolence(text,text,text,boolean) from public;
grant execute on function public.fc_family_condolence(text,text,text,boolean) to anon,authenticated;
