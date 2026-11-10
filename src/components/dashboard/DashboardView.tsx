import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FolderHeart, CalendarDays, Building2, CarFront, FileCheck2, Wallet, AlertTriangle, ArrowUpRight, Plus, Sparkles, ChevronRight, Clock3, MapPin, CheckCircle2, ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { FuneralService } from '../../types';

const money = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);

export const DashboardView: React.FC = () => {
  const { services, rooms, vehicles, budgets, alerts, dismissAlert, setCurrentView, setSelectedService, setIsNewServiceModalOpen, setIsAiModalOpen } = useApp();
  const [agendaTab, setAgendaTab] = useState<'hoy' | 'semana'>('hoy');
  const active = services.filter(s => s.currentStage !== 'finalizado');
  const scheduled = services.filter(s => s.currentStage === 'nuevo' || s.currentStage === 'documentacion');
  const completed = services.filter(s => s.currentStage === 'finalizado');
  const occupied = rooms.filter(r => r.status === 'ocupada');
  const available = rooms.filter(r => r.status === 'disponible');
  const assigned = vehicles.filter(v => v.status === 'en_servicio');
  const pendingDocs = services.reduce((n,s) => n + s.documents.filter(d => d.status === 'pendiente').length, 0);
  const receivables = budgets.reduce((n,b) => n + Math.max(0, b.totalMxn - b.payments.reduce((p,x) => p+x.amountMxn,0)),0);
  const pendingBudgets = budgets.filter(b => b.status === 'borrador').length;
  const openService = (s: FuneralService) => { setSelectedService(s); setCurrentView('servicios'); };
  const stageLabel = (s: string) => ({nuevo:'Nuevo',documentacion:'Documentación',preparacion:'Preparación',traslado:'Traslado',velacion:'Velación',cremacion_inhumacion:'Cortejo / Destino',finalizado:'Concluido'} as Record<string,string>)[s] || s;
  const kpis = [
    {title:'Servicios activos',value:String(active.length).padStart(2,'0'),detail:`${scheduled.length} programados · ${completed.length} concluidos`,icon:FolderHeart},
    {title:'Capillas ocupadas',value:`${occupied.length} / ${rooms.length}`,detail:`${available.length} disponibles`,icon:Building2},
    {title:'Flota en servicio',value:`${assigned.length} / ${vehicles.length}`,detail:`${vehicles.length-assigned.length} unidades en base`,icon:CarFront},
    {title:'Documentos pendientes',value:String(pendingDocs).padStart(2,'0'),detail:'Actas, certificados y permisos',icon:FileCheck2},
    {title:'Saldo por cobrar',value:money(receivables),detail:`${pendingBudgets} presupuestos pendientes`,icon:Wallet}
  ];
  return (
    <div className="fc-dashboard-v2 space-y-7 pb-12">
      <section className="relative overflow-hidden rounded-[26px] bg-[#102d34] text-white px-7 py-9 md:px-11 md:py-12 shadow-[0_18px_45px_rgba(14,43,49,.16)]">
        <div aria-hidden="true" className="absolute right-[-110px] top-[-190px] h-[480px] w-[480px] rounded-full border border-[#c4a66e]/25 shadow-[0_0_0_65px_rgba(196,166,110,.035),0_0_0_135px_rgba(196,166,110,.025)]" />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.22em] text-[#d3b77c]"><span className="h-[1px] w-9 bg-[#d3b77c]" /> PANEL EJECUTIVO <span className="text-white/45">/</span> OPERACIÓN DIARIA</div>
            <h1 className="max-w-[620px] text-3xl md:text-[43px] leading-[1.12] font-semibold tracking-[-.04em]">Gestión que acompaña <span className="text-[#e2c992]">cada momento.</span></h1>
            <p className="mt-5 max-w-xl text-sm md:text-base leading-7 text-[#c7d5d4]">Toda la operación de tu funeraria, organizada con claridad, respeto y atención a cada detalle.</p>
            <div className="mt-7 flex flex-wrap items-center gap-4 text-xs text-[#c9d7d5]"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#9bd0b0]"/> Panel operativo</span><span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#d3b77c]"/> Vista de demostración</span></div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setIsNewServiceModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#d5b67b] px-5 py-3.5 text-sm font-semibold text-[#17323a] hover:bg-[#e9ce9a] transition-colors shadow-md"><Plus className="h-4 w-4"/> Nuevo expediente</button>
            <button onClick={() => setIsAiModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3.5 text-sm font-medium text-white hover:bg-white/20 transition-colors"><Sparkles className="h-4 w-4 text-[#e2c992]"/> Asistente IA</button>
          </div>
        </div>
      </section>

      <section aria-label="Indicadores operativos" className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {kpis.map(({title,value,detail,icon:Icon},i) => (
          <div key={title} className="group relative overflow-hidden rounded-[19px] border border-[#e7e1d5] bg-white px-5 py-5 shadow-[0_5px_22px_rgba(18,47,52,.055)]">
            <div className="flex items-center justify-between gap-2"><span className="text-xs font-medium text-[#64777a]">{title}</span><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f2f0e9] text-[#6c786c]"><Icon className="h-4 w-4"/></span></div>
            <div className={`mt-4 font-semibold tracking-[-.05em] text-[#17353b] ${i===4?'text-xl md:text-[25px]':'text-3xl md:text-[35px]'}`}>{value}</div>
            <div className="mt-3 text-[11px] leading-5 text-[#85908f]">{detail}</div>
            <div className="absolute bottom-0 left-5 h-[3px] w-12 rounded-t-full bg-[#c4a66e]" />
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-8 overflow-hidden rounded-[22px] border border-[#e6e1d8] bg-white shadow-[0_8px_32px_rgba(18,47,52,.045)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eee9e0] px-6 py-6 md:px-7">
            <div><div className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#ae9060]">SEGUIMIENTO</div><h2 className="text-xl font-semibold tracking-tight text-[#17353b]">Expedientes en curso</h2><p className="mt-1 text-xs text-[#7b8887]">Servicios activos y su avance operativo</p></div>
            <button onClick={() => setCurrentView('servicios')} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e6e1d8] px-3.5 py-2 text-xs font-semibold text-[#31565a] hover:bg-[#f4f5f0]">Ver todos <ArrowUpRight className="h-4 w-4"/></button>
          </div>
          <div className="divide-y divide-[#eeeae3]">
            {active.length===0 && <div className="p-8 text-sm text-[#718080]">No hay expedientes activos.</div>}
            {active.slice(0,5).map(s => {
              const room=rooms.find(r=>r.id===s.roomId);
              const vehicle=vehicles.find(v=>v.id===s.vehicleId);
              const stageIdx=s.requiredStages.indexOf(s.currentStage);
              return <button key={s.id} onClick={()=>openService(s)} className="block w-full px-6 py-6 md:px-7 text-left transition-colors hover:bg-[#faf9f5] focus-visible:outline-2 focus-visible:outline-[#c4a66e]">
                <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-[11px] font-semibold tracking-wider text-[#b08c50]">{s.id}</span><span className="rounded-full bg-[#edf3ef] px-3 py-1 text-[11px] font-medium text-[#326259]">{stageLabel(s.currentStage)}</span></div>
                <div className="mt-2 flex items-start justify-between gap-3"><div><h3 className="text-base font-semibold text-[#1c3940]">{s.deceased.fullName}</h3><p className="mt-1 text-xs text-[#81908f]">{s.familyContact.fullName} · {s.familyContact.relationship}</p></div><ChevronRight className="h-5 w-5 shrink-0 text-[#9ca8a4]"/></div>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[#677b7a]"><span className="inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5"/>{room?.name || 'Sin capilla'}</span><span className="inline-flex items-center gap-1.5"><CarFront className="h-3.5 w-3.5"/>{vehicle?.model || 'Sin vehículo'}</span><span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5"/>{s.destinationPlace}</span></div>
                <div className="mt-4 flex gap-1.5">{s.requiredStages.map((stage,i)=><span key={stage} title={stageLabel(stage)} className={`h-1.5 flex-1 rounded-full ${i<stageIdx?'bg-[#326b61]':i===stageIdx?'bg-[#c4a66e]':'bg-[#edf0ed]'}`}/>)}</div>
              </button>;
            })}
          </div>
        </section>
        <div className="xl:col-span-4 space-y-6">
          <section className="rounded-[22px] border border-[#e6e1d8] bg-white p-6 shadow-[0_8px_32px_rgba(18,47,52,.045)]">
            <div className="flex items-start justify-between gap-3"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#ae9060]">PLANIFICACIÓN</div><h2 className="text-xl font-semibold text-[#17353b]">Agenda operativa</h2></div><CalendarDays className="h-5 w-5 text-[#a68b5d]"/></div>
            <div className="mt-5 flex gap-2 rounded-xl bg-[#f4f3ee] p-1"><button onClick={()=>setAgendaTab('hoy')} className={`flex-1 rounded-lg py-2 text-xs font-semibold ${agendaTab==='hoy'?'bg-white text-[#17353b] shadow-sm':'text-[#82908b]'}`}>Hoy</button><button onClick={()=>setAgendaTab('semana')} className={`flex-1 rounded-lg py-2 text-xs font-semibold ${agendaTab==='semana'?'bg-white text-[#17353b] shadow-sm':'text-[#82908b]'}`}>Semana</button></div>
            <div className="mt-5 space-y-0 border-l border-[#e4e4d9] pl-5">
              {active.slice(0,3).map((s,i)=><button key={s.id} onClick={()=>openService(s)} className="relative block w-full border-b border-[#efeee7] py-4 text-left last:border-0"><span className="absolute -left-[26px] top-5 h-3 w-3 rounded-full border-[3px] border-white bg-[#b99b68] shadow-sm"/><span className="text-[11px] font-semibold text-[#a88b5b]">{agendaTab==='hoy'?'SERVICIO':'EN SEGUIMIENTO'} {String(i+1).padStart(2,'0')}</span><span className="mt-1 block text-sm font-semibold text-[#254047]">{s.deceased.fullName}</span><span className="mt-1 block text-xs text-[#8b9794]">{stageLabel(s.currentStage)} · {s.wakeStartTime || 'Horario a confirmar'}</span></button>)}
              {active.length===0 && <p className="py-4 text-xs text-[#7c8a86]">Sin actividades registradas.</p>}
            </div>
            <button onClick={()=>setCurrentView('agenda')} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#eff3ef] py-3 text-xs font-semibold text-[#315b57] hover:bg-[#e2eae3]">Abrir agenda completa <ArrowRight className="h-4 w-4"/></button>
          </section>
          <section className="rounded-[22px] bg-[#193b40] p-6 text-white shadow-lg"><div className="flex items-center gap-2 text-[#d9c08b]"><Activity className="h-4 w-4"/><span className="text-[10px] font-bold uppercase tracking-[.2em]">ESTADO OPERATIVO</span></div><h2 className="mt-4 text-xl font-semibold">Atención a los detalles</h2><p className="mt-2 text-xs leading-6 text-[#c1d0cd]">{alerts.length} alertas activas requieren seguimiento. Consultá las prioridades para mantener cada servicio coordinado.</p><button onClick={()=>setIsAiModalOpen(true)} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#e1c58f]">Ver prioridades con IA <ArrowUpRight className="h-4 w-4"/></button></section>
        </div>
      </div>
      {alerts.length>0 && <section className="rounded-[22px] border border-[#e9ded1] bg-[#fcfaf6] p-6 md:p-7"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-[#ae784c]"/><h2 className="text-lg font-semibold text-[#27434a]">Alertas que requieren atención</h2><span className="rounded-full bg-[#efe4d5] px-2.5 py-1 text-xs font-semibold text-[#8d6647]">{alerts.length}</span></div></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{alerts.map(a=><article key={a.id} className="rounded-2xl border border-[#eee6db] bg-white p-5"><div className="flex justify-between gap-2 text-[10px] uppercase tracking-wider text-[#b27e53]"><span className="font-bold">{a.type}</span><span className="normal-case tracking-normal text-[#9aa4a0]">{a.timestamp}</span></div><h3 className="mt-3 text-sm font-semibold text-[#25434a]">{a.title}</h3><p className="mt-2 text-xs leading-5 text-[#75827f]">{a.description}</p><div className="mt-4 flex items-center justify-between gap-2 border-t border-[#f1ede7] pt-3">{a.relatedServiceId?<button onClick={()=>{const s=services.find(x=>x.id===a.relatedServiceId);if(s)openService(s);}} className="text-xs font-semibold text-[#a38350]">Ver expediente <ChevronRight className="inline h-3 w-3"/></button>:<span/>}<button onClick={()=>dismissAlert(a.id)} className="inline-flex items-center gap-1 text-xs text-[#607c73] hover:underline"><CheckCircle2 className="h-3.5 w-3.5"/> Resolver</button></div></article>)}</div></section>}
      <div className="flex items-center justify-center gap-2 text-[11px] text-[#9ba6a0]"><Clock3 className="h-3.5 w-3.5"/> Datos de demostración · Panel de gestión funeraria</div>
    </div>
  );
};
