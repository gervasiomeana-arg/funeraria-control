-- Transactional regression test: no persistent session, password or visit changes.
begin;
do $$
declare uid uuid; sid uuid:=gen_random_uuid(); result jsonb; count_before bigint;
begin
 select user_id into strict uid from fc_private.app_administrator limit 1;
 insert into auth.sessions(id,user_id) values(sid,uid);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',uid,'role','authenticated','session_id',sid,'app_metadata',jsonb_build_object('providers',jsonb_build_array('google')),'amr',jsonb_build_array(jsonb_build_object('method','oauth')))::text,true);
 update fc_private.app_administrator set password_hash=extensions.crypt('test-only-password',extensions.gen_salt('bf',4)),failures=0,locked_until=null where user_id=uid;
 if not (public.fc_admin_users('test-only-password')->>'authorized')::boolean then raise exception 'Correct password rejected'; end if;
 if (public.fc_admin_users('incorrect')->>'authorized')::boolean then raise exception 'Incorrect password accepted'; end if;
 for i in 1..4 loop perform public.fc_admin_users('incorrect'); end loop;
 if (public.fc_admin_users('test-only-password')->>'authorized')::boolean then raise exception 'Rate limit bypassed'; end if;
 perform public.fc_register_google_user();
 select visit_count into count_before from fc_private.google_visitors where user_id=uid;
 perform public.fc_register_google_user();
 if (select visit_count<>count_before from fc_private.google_visitors where user_id=uid) then raise exception 'Reload counted twice'; end if;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',uid,'role','authenticated','session_id',sid,'app_metadata',jsonb_build_object('providers',jsonb_build_array('google')),'amr',jsonb_build_array(jsonb_build_object('method','password')))::text,true);
 if public.fc_google_session() then raise exception 'Password session accepted'; end if;
 if (public.fc_admin_users('test-only-password')->>'authorized')::boolean then raise exception 'Password session read registry'; end if;
end; $$;
select 'PASS: correct key, wrong key, lockout, Google session, idempotent registration' as checks;
rollback;
