import React, { useEffect, useRef, useState } from 'react';
import type { ServiceRecord } from './domain';
type Doc = { id:string;name:string;status:string;updated_at:string };
type Stage = { id:string;stage:string;created_at:string;changed_by:string|null };
export function ServiceEvidence({services,token,companyId,apiUrl,apiKey}:{services:ServiceRecord[];token:string;companyId:string;apiUrl:string;apiKey:string}) {
  const [serviceId,setServiceId]=useState('');
  const [docs,setDocs]=useState<Doc[]>([]);
  const [stages,setStages]=useState<Stage[]>([]);
  const [name,setName]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const loadSequence=useRef(0);
  const headers={apikey:apiKey,Authorization:'Bearer '+token,'Content-Type':'application/json'};
  const load=async(id=serviceId)=>{
    const sequence=++loadSequence.current;
    if(!id){setDocs([]);setStages([]);return;}
    const results=await Promise.all(['service_documents','service_stage_logs'].map(table=>fetch(`${apiUrl}/rest/v1/${table}?select=*&company_id=eq.${encodeURIComponent(companyId)}&service_id=eq.${encodeURIComponent(id)}&order=${table==='service_documents'?'updated_at':'created_at'}.desc`,{headers})));
    if(results.some(r=>!r.ok))throw new Error('No se pudo cargar documentación o bitácora.');
    const [documents,history]=await Promise.all(results.map(r=>r.json()));if(sequence===loadSequence.current){setDocs(documents);setStages(history);}
  };
  useEffect(()=>{let cancelled=false;const selected=serviceId||services[0]?.id||'';if(!serviceId&&selected)setServiceId(selected);if(!cancelled)void load(selected).catch(e=>setMessage(e.message));return()=>{cancelled=true;loadSequence.current++;};},[serviceId,token,companyId,services]);
  const save=async(id:string|null,status='pendiente')=>{
    if(!serviceId||(!id&&!name.trim()))return;
    setBusy(true);setMessage('');
    try {
      const response=await fetch(`${apiUrl}/rest/v1/service_documents${id?'?id=eq.'+encodeURIComponent(id)+'&company_id=eq.'+encodeURIComponent(companyId):''}`,{method:id?'PATCH':'POST',headers,body:JSON.stringify(id?{status,updated_at:new Date().toISOString()}:{company_id:companyId,service_id:serviceId,name:name.trim(),status:'pendiente'})});
      if(!response.ok){const error=await response.json().catch(()=>({}));throw new Error(error.message||'No se pudo guardar el documento.');}
      await load();setName('');setMessage('Documentación actualizada.');
    }catch(e){setMessage(e instanceof Error?e.message:String(e));}finally{setBusy(false);}
  };
  return <section className="mb-6 rounded-2xl border bg-white p-5"><h3 className="text-lg font-semibold">Documentación y bitácora</h3><label className="my-3 block text-sm">Expediente para seguimiento<select className="ml-2 rounded border p-2" value={serviceId} disabled={busy} onChange={e=>setServiceId(e.target.value)}><option value="">Seleccionar expediente</option>{services.map(s=><option key={s.id} value={s.id}>{s.reference} · {s.deceased_name}</option>)}</select></label>
    {serviceId&&<div className="grid gap-5 lg:grid-cols-2"><div><h4 className="font-semibold">Lista de documentación</h4><p className="mt-1 text-sm text-slate-500">Registrá recepción y revisión. Ningún documento se aprueba automáticamente.</p><form className="my-3 flex gap-2" onSubmit={e=>{e.preventDefault();void save(null);}}><label className="flex-1 text-sm">Nombre del documento<input required maxLength={200} value={name} onChange={e=>setName(e.target.value)} className="block w-full rounded border p-2" placeholder="Acta, certificado o permiso"/></label><button disabled={busy} className="self-end rounded bg-[#173a3e] px-3 py-2 text-white">Agregar documento</button></form>{docs.map(d=><div key={d.id} className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-3"><span>{d.name}</span><select aria-label={'Estado de '+d.name} disabled={busy} value={d.status} onChange={e=>void save(d.id,e.target.value)} className="rounded border p-2">{['pendiente','en_revision','aprobado'].map(s=><option key={s} value={s}>{s.replaceAll('_',' ')}</option>)}</select></div>)}{!docs.length&&<p className="text-sm text-slate-500">Todavía no hay documentos registrados.</p>}</div>
    <div><h4 className="font-semibold">Historial de etapas</h4><p className="mt-1 text-sm text-slate-500">Cada nueva transición se registra automáticamente junto con el usuario y la fecha.</p><ol className="mt-3 space-y-2">{stages.map(s=><li key={s.id} className="rounded-lg border p-3"><b>{s.stage.replaceAll('_',' ')}</b><p className="text-sm">{new Date(s.created_at).toLocaleString('es-AR')}</p><small>Usuario registrado: {s.changed_by?'Sí':'Operación del sistema'}</small></li>)}</ol>{!stages.length&&<p className="mt-3 text-sm text-slate-500">Sin transiciones registradas desde la activación de la bitácora. No se reconstruye historial anterior.</p>}<button type="button" disabled={busy} onClick={()=>void load().catch(e=>setMessage(e.message))} className="mt-3 underline">Actualizar seguimiento</button></div></div>}
    <p role="status" className="mt-3 text-sm">{message}</p>
  </section>;
}
