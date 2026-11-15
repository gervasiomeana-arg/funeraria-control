-- Google visitors are private; only the application administrator can read them,
-- after a server-side password check. The password is provisioned separately.
create table fc_private.app_administrator (
  user_id uuid primary key references auth.users(id),
  password_hash text not null,
  failures integer not null default 0,
  locked_until timestamptz
);
create table fc_private.google_visitors (
  user_id uuid primary key references auth.users(id),
  email text not null,
  display_name text,
  first_seen timestamptz not null,
  last_seen timestamptz not null,
  visit_count bigint not null default 0
);
create table fc_private.visitor_sessions (
  session_id uuid primary key,
  user_id uuid not null references auth.users(id)
);
alter table fc_private.app_administrator enable row level security;
alter table fc_private.google_visitors enable row level security;
alter table fc_private.visitor_sessions enable row level security;
revoke all on fc_private.app_administrator,fc_private.google_visitors,fc_private.visitor_sessions from public,anon,authenticated;

create function public.fc_google_session() returns boolean
language sql stable security invoker set search_path = '' as $$
 select auth.uid() is not null
 and coalesce(auth.jwt()->'app_metadata'->'providers','[]'::jsonb) ? 'google'
 and exists(select 1 from jsonb_array_elements(coalesce(auth.jwt()->'amr','[]'::jsonb)) a where a->>'method'='oauth');
$$;
revoke all on function public.fc_google_session() from public,anon;
grant execute on function public.fc_google_session() to authenticated;

create function public.fc_register_google_user() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u auth.users%rowtype; sid uuid; added integer;
begin
 if not public.fc_google_session() then raise exception 'Ingresá con Google.' using errcode='42501'; end if;
 sid := (auth.jwt()->>'session_id')::uuid;
 if not exists(select 1 from auth.sessions where id=sid and user_id=auth.uid()) then raise exception 'Sesión inválida.' using errcode='42501'; end if;
 select * into strict u from auth.users where id=auth.uid();
 insert into fc_private.visitor_sessions values(sid,u.id) on conflict do nothing;
 get diagnostics added = row_count;
 insert into fc_private.google_visitors(user_id,email,display_name,first_seen,last_seen,visit_count)
 values(u.id,u.email,coalesce(u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name'),now(),now(),added)
 on conflict(user_id) do update set email=excluded.email,display_name=excluded.display_name,last_seen=now(),visit_count=fc_private.google_visitors.visit_count+added;
 if added=1 then insert into public.login_visits(user_id) values(u.id); end if;
 return jsonb_build_object('registered',true);
end; $$;
revoke all on function public.fc_register_google_user() from public,anon;
grant execute on function public.fc_register_google_user() to authenticated;

create function public.fc_admin_users(p_password text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare a fc_private.app_administrator%rowtype; users_data jsonb;
begin
 if not public.fc_google_session() or not exists(select 1 from auth.sessions where id=(auth.jwt()->>'session_id')::uuid and user_id=auth.uid()) then
 return jsonb_build_object('authorized',false,'message','Ingresá con tu cuenta de Google.'); end if;
 select * into a from fc_private.app_administrator where user_id=auth.uid() for update;
 if not found then return jsonb_build_object('authorized',false,'message','Este apartado es exclusivo del administrador.'); end if;
 if a.locked_until>now() then return jsonb_build_object('authorized',false,'message','Demasiados intentos. Esperá 15 minutos.'); end if;
 if p_password is null or length(p_password)>128 or extensions.crypt(p_password,a.password_hash)<>a.password_hash then
 update fc_private.app_administrator set failures=case when locked_until<=now() then 1 else failures+1 end,
 locked_until=case when (case when locked_until<=now() then 1 else failures+1 end)>=5 then now()+interval '15 minutes' else null end where user_id=auth.uid();
 return jsonb_build_object('authorized',false,'message','Clave incorrecta.'); end if;
 update fc_private.app_administrator set failures=0,locked_until=null where user_id=auth.uid();
 select coalesce(jsonb_agg(to_jsonb(v) order by last_seen desc),'[]'::jsonb) into users_data from fc_private.google_visitors v;
 return jsonb_build_object('authorized',true,'users',users_data);
end; $$;
revoke all on function public.fc_admin_users(text) from public,anon;
grant execute on function public.fc_admin_users(text) to authenticated;

-- Preserve and import previous Google sign-in history.
insert into fc_private.google_visitors(user_id,email,display_name,first_seen,last_seen,visit_count)
select u.id,u.email,coalesce(u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name'),coalesce(min(v.visited_at),u.created_at),coalesce(max(v.visited_at),u.last_sign_in_at,u.created_at),count(v.id)
from auth.users u left join public.login_visits v on v.user_id=u.id
where coalesce(u.raw_app_meta_data->'providers','[]'::jsonb) ? 'google'
group by u.id;

-- Business access also requires a Google OAuth session; existing company RLS stays in force.
do $$ declare t text; begin
 foreach t in array array['companies','company_memberships','branches','funeral_services','budgets','budget_payments','operational_records','service_stage_logs','service_documents','operational_record_logs','family_portals'] loop
 execute format('create policy google_session_required on public.%I as restrictive for all to authenticated using ((select public.fc_google_session())) with check ((select public.fc_google_session()))',t);
 end loop;
end; $$;
