import React, { useEffect, useState } from 'react';
type Visitor = {user_id:string;email:string;display_name:string|null;first_seen:string;last_seen:string;visit_count:number};
export function AdminUsersPanel({url,apiKey,token,onUnlock,onLock}:{url:string;apiKey:string;token:string;onUnlock:()=>void;onLock:()=>void}) {
 const [password,setPassword]=useState('');
 const [users,setUsers]=useState<Visitor[]|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 useEffect(()=>{ const timer=window.setTimeout(()=>{setUsers(null);onLock();setMessage('Volvé a ingresar la clave para consultar el registro.');},10*60*1000);return ()=>window.clearTimeout(timer);},[users]);
 const unlock=async(event:React.FormEvent)=>{
  event.preventDefault();setBusy(true);setMessage('');
  try {
   const response=await fetch(url+'/rest/v1/rpc/fc_admin_users',{method:'POST',headers:{apikey:apiKey,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({p_password:password})});
   const result=await response.json();
   if(!response.ok||!result.authorized){setUsers(null);setMessage(result.message||'No se pudo verificar el acceso.');return;}
   setUsers(result.users);onUnlock();
  }catch{setMessage('No se pudo conectar. Volvé a intentar.');}finally{setPassword('');setBusy(false);}
 };
 const date=(value:string)=>new Date(value).toLocaleString('es-AR');
 return <section className="mt-4 rounded-xl border bg-white p-4">
  <h2 className="text-xl font-semibold">Administración · Usuarios registrados</h2>
  <p className="my-2 text-sm text-slate-600">Acceso exclusivo del administrador con su cuenta de Google y clave.</p>
  {users===null ? <form onSubmit={unlock} className="flex flex-wrap items-end gap-3"><label>Clave de administración<input aria-label="Clave de administración" required type="password" autoComplete="current-password" value={password} onChange={event=>setPassword(event.target.value)} maxLength={128} className="block rounded border p-2"/></label><button disabled={busy} type="submit" className="rounded bg-[#173a3e] px-4 py-2 text-white disabled:opacity-50">{busy?'Verificando…':'Entrar a Administración'}</button></form> : <><p className="my-3 font-semibold">{users.length} usuarios con cuenta de Google</p><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{['Nombre','Correo','Primer ingreso','Último ingreso','Sesiones'].map(label=><th className="border-b p-2" key={label}>{label}</th>)}</tr></thead><tbody>{users.map(user=><tr key={user.user_id}><td className="p-2">{user.display_name||'Sin nombre'}</td><td className="p-2">{user.email}</td><td className="p-2">{date(user.first_seen)}</td><td className="p-2">{date(user.last_seen)}</td><td className="p-2">{user.visit_count}</td></tr>)}</tbody></table></div><p className="mt-3 text-xs">Para actualizar el registro, ingresá nuevamente la clave.</p><button className="mt-2 underline" onClick={()=>{setUsers(null);window.location.reload();}}>Bloquear Administración</button></>}
  {message&&<p role="status" className="mt-3">{message}</p>}
 </section>;
}
