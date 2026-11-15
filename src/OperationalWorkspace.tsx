import React, { useMemo, useState } from 'react';
import { balanceFor, budgetTotal, currency, csvRows, localDay, type BudgetRecord, type OperationalRecord, type PaymentRecord, type ServiceRecord } from './domain';

interface Props {
  view: string; services: ServiceRecord[]; budgets: BudgetRecord[]; payments: PaymentRecord[];
  records: OperationalRecord[]; onEdit: (record: OperationalRecord) => void;
}
const labels: Record<string,string> = { date:'Fecha',time:'Inicio',end_time:'Cierre',service:'Expediente',responsible:'Responsable',contact:'Contacto',phone:'Teléfono',email:'Correo',sku:'SKU',quantity:'Existencias',minimum:'Mínimo',unit:'Unidad',kind:'Tipo',availability:'Disponibilidad',branch:'Sucursal',period:'Período',category:'Categoría',author:'Autor',setting:'Configuración',value:'Valor' };

function downloadCsv(name: string, rows: unknown[][]) {
  const url=URL.createObjectURL(new Blob([csvRows(rows)],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a'); link.href=url;link.download=name;link.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export function OperationalWorkspace({view,services,budgets,payments,records,onEdit}:Props) {
  const [query,setQuery]=useState('');
  const [month,setMonth]=useState(localDay().slice(0,7));
  const [serviceFilter,setServiceFilter]=useState('');
  const monthStart=useMemo(()=>new Date(`${month || localDay().slice(0,7)}-01T12:00:00`),[month]);
  const days=useMemo(()=>Array.from({length:new Date(monthStart.getFullYear(),monthStart.getMonth()+1,0).getDate()},(_,i)=>localDay(new Date(monthStart.getFullYear(),monthStart.getMonth(),i+1,12))),[monthStart]);
  const visible=records.filter(r=>r.module===view && `${r.title} ${JSON.stringify(r.details)}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()) && (!serviceFilter||r.details.service===serviceFilter));
  const received=payments.reduce((sum,p)=>sum+Number(p.amount_mxn),0);
  const pending=budgets.filter(b=>b.status!=='cancelled').reduce((sum,b)=>sum+Math.max(0,balanceFor(b,payments)),0);
  const lowStock=records.filter(r=>r.module==='inventario'&&Number(r.details.quantity)<Number(r.details.minimum));
  const resourceName=(id:unknown)=>records.find(r=>r.id===id)?.title||String(id||'Sin recurso');
  const print=()=>window.print();

  if (view==='dashboard'||view==='reportes') return <div className="fc-workspace space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['Servicios activos',services.filter(s=>s.status!=='finalizado').length],['Cobros registrados',currency(received)],['Saldo por cobrar',currency(pending)],['Stock bajo',lowStock.length]].map(([name,value])=><article key={name} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{name}</p><strong className="mt-2 block text-2xl">{value}</strong></article>)}</div>
    {lowStock.length>0&&<div role="status" className="rounded-xl bg-amber-50 p-4">Reabastecimiento: {lowStock.map(r=>`${r.title} (${r.details.quantity} ${r.details.unit||'unidades'})`).join(' · ')}</div>}
    <section className="rounded-2xl border bg-white p-5"><h3 className="text-lg font-semibold">Cuentas por servicio</h3><p className="my-2 text-sm text-slate-500">Acumulado de los registros cargados. Las notas de informe no reemplazan los movimientos contables.</p>
      <div className="my-3 flex flex-wrap gap-2 print:hidden"><button type="button" onClick={()=>downloadCsv(`cuentas-${localDay()}.csv`,[['Folio','Fallecido','Etapa','Total MXN','Pagado MXN','Saldo MXN'],...services.map(s=>{const bs=budgets.filter(b=>b.service_id===s.id&&b.status!=='cancelled');const total=bs.reduce((sum,b)=>sum+budgetTotal(b),0);const balance=bs.reduce((sum,b)=>sum+balanceFor(b,payments),0);return[s.reference,s.deceased_name,s.status,total,total-balance,balance];})])} className="rounded-lg bg-[#173a3e] px-4 py-2 text-white">Exportar cuentas CSV</button><button type="button" onClick={print} className="rounded-lg border px-4 py-2">Imprimir informe / PDF</button></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{['Folio','Persona','Etapa','Total','Cobrado','Saldo'].map(h=><th className="p-3" key={h}>{h}</th>)}</tr></thead><tbody>{services.map(s=>{const bs=budgets.filter(b=>b.service_id===s.id&&b.status!=='cancelled');const total=bs.reduce((sum,b)=>sum+budgetTotal(b),0);const balance=bs.reduce((sum,b)=>sum+balanceFor(b,payments),0);return <tr className="border-t" key={s.id}><td className="p-3">{s.reference}</td><td className="p-3">{s.deceased_name}</td><td className="p-3">{s.status.replaceAll('_',' ')}</td><td className="p-3">{currency(total)}</td><td className="p-3">{currency(total-balance)}</td><td className="p-3">{currency(balance)}</td></tr>;})}</tbody></table></div>
    </section>
    <section className="rounded-2xl border bg-white p-5"><h3 className="font-semibold">Seguimiento de etapas</h3><div className="mt-3 flex flex-wrap gap-2">{['nuevo','documentacion','preparacion','traslado','velacion','cremacion_inhumacion','finalizado'].map(stage=><div key={stage} className="rounded-lg bg-slate-50 p-3"><strong>{services.filter(s=>s.status===stage).length}</strong> {stage.replaceAll('_',' ')}</div>)}</div></section>
  </div>;

  if(!['agenda','familias','inventario','recursos','admin'].includes(view))return null;
  return <section className="fc-workspace mb-6 space-y-4">
    <div className="flex flex-wrap items-end gap-3 print:hidden"><label className="flex flex-1 flex-col gap-1 text-sm">Buscar registros<input type="search" value={query} onChange={e=>setQuery(e.target.value)} className="rounded-lg border bg-white p-2"/></label>
      {['agenda','familias'].includes(view)&&<label className="text-sm">Filtrar expediente<select value={serviceFilter} onChange={e=>setServiceFilter(e.target.value)} className="ml-2 rounded-lg border p-2"><option value="">Todos</option>{services.map(s=><option key={s.id} value={s.reference}>{s.reference}</option>)}</select></label>}
      <button type="button" onClick={()=>downloadCsv(`${view}-${localDay()}.csv`,[['Título','Datos'],...visible.map(r=>[r.title,JSON.stringify(r.details)])])} className="rounded-lg border bg-white px-3 py-2">Exportar CSV</button><button type="button" onClick={print} className="rounded-lg border bg-white px-3 py-2">Imprimir</button>
    </div>
    {view==='agenda'&&<div className="rounded-2xl border bg-white p-4"><label className="print:hidden">Mes de agenda <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="ml-2 rounded border p-2"/></label><h3 className="my-3 font-semibold">{monthStart.toLocaleDateString('es-AR',{month:'long',year:'numeric'})}</h3><div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">{days.map(day=>{const events=visible.filter(r=>r.details.date===day).sort((a,b)=>String(a.details.time).localeCompare(String(b.details.time)));return <div key={day} className={`min-h-24 rounded-xl border p-3 ${day===localDay()?'border-amber-500 bg-amber-50':''}`}><strong>{new Date(day+'T12:00:00').toLocaleDateString('es-AR',{weekday:'short',day:'numeric'})}</strong>{events.map(r=><button key={r.id} type="button" onClick={()=>onEdit(r)} className="mt-2 block w-full rounded bg-[#e7efea] p-2 text-left text-xs"><b>{String(r.details.time)}</b> {r.title}<br/>{resourceName(r.details.resource)}</button>)}</div>;})}</div></div>}
    <div className="grid gap-3 lg:grid-cols-2">{visible.map(r=><article key={r.id} className="rounded-2xl border bg-white p-5"><div className="flex items-start justify-between gap-3"><h3 className="font-semibold">{r.title}</h3><button type="button" onClick={()=>onEdit(r)} className="text-sm underline print:hidden">Editar registro</button></div><dl className="mt-3 grid grid-cols-2 gap-2 text-sm">{Object.entries(r.details).filter(([k])=>k!=='description').map(([k,v])=><React.Fragment key={k}><dt className="text-slate-500">{k==='resource'?'Recurso':labels[k]||k}</dt><dd className="break-words">{k==='resource'?resourceName(v):String(v)}</dd></React.Fragment>)}</dl><p className="mt-3 text-sm text-slate-600">{String(r.details.description||'')}</p>{view==='inventario'&&Number(r.details.quantity)<Number(r.details.minimum)&&<p className="mt-2 font-semibold text-amber-700">Stock bajo: necesita reabastecimiento</p>}</article>)}</div>
    {!visible.length&&<p className="rounded-xl border border-dashed p-5 text-slate-500">No hay registros para estos filtros.</p>}
  </section>;
}
