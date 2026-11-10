import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderHeart,
  Calendar,
  Users,
  Building,
  Car,
  FileCheck2,
  Receipt,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { FuneralService } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    services,
    rooms,
    vehicles,
    staff,
    budgets,
    alerts,
    dismissAlert,
    setCurrentView,
    setSelectedService,
    setIsNewServiceModalOpen,
    setIsAiModalOpen,
  } = useApp();

  const [agendaTab, setAgendaTab] = useState<'hoy' | 'semana'>('hoy');

  // Metrics calculations
  const activeServices = services.filter((s) => s.currentStage !== 'finalizado');
  const scheduledServices = services.filter((s) => s.currentStage === 'nuevo' || s.currentStage === 'documentacion');
  const finishedServices = services.filter((s) => s.currentStage === 'finalizado');

  const availableStaff = staff.filter((st) => st.status === 'disponible');
  const occupiedRooms = rooms.filter((r) => r.status === 'ocupada');
  const availableRooms = rooms.filter((r) => r.status === 'disponible');
  const assignedVehicles = vehicles.filter((v) => v.status === 'en_servicio');

  // Pending documentation count across active services
  const pendingDocsCount = services.reduce((acc, s) => {
    return acc + s.documents.filter((d) => d.status === 'pendiente').length;
  }, 0);

  // Unapproved or partially paid budgets
  const pendingBudgets = budgets.filter((b) => b.status === 'borrador');
  const pendingReceivablesMxn = budgets.reduce((acc, b) => {
    const totalPaid = b.payments.reduce((sum, p) => sum + p.amountMxn, 0);
    return acc + Math.max(0, b.totalMxn - totalPaid);
  }, 0);

  const getStageBadgeLabel = (stage: string) => {
    switch (stage) {
      case 'nuevo':
        return 'Nuevo Expediente';
      case 'documentacion':
        return 'Trámite Documental';
      case 'preparacion':
        return 'En Preparación';
      case 'traslado':
        return 'En Traslado';
      case 'velacion':
        return 'En Velación';
      case 'cremacion_inhumacion':
        return 'Cortejo / Destino';
      case 'finalizado':
        return 'Concluido';
      default:
        return stage;
    }
  };

  const handleOpenService = (service: FuneralService) => {
    setSelectedService(service);
    setCurrentView('servicios');
  };

  return (
    <div className="fc-dashboard-premium space-y-7">
      {/* Premium editorial hero — existing actions and business data preserved */}
      <div className="fc-dashboard-hero relative rounded-[24px] overflow-hidden border border-[#29474c] shadow-xl text-white">
        <img
          src="/src/assets/images/memorial_chapel_interior_1794336944272.jpg"
          alt="Capilla Memorial Funeraria Control"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 px-7 py-10 md:px-11 md:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-7 bg-gradient-to-r from-[#102b34] via-[#102b34]/95 to-[#1e3c40]/80">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
              <span className="uppercase tracking-[0.19em]">FUNERARIA CONTROL</span>
              <span aria-hidden="true">·</span>
              <span>Resumen ejecutivo</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300">CDMX</span>
            </div>
            <h1 className="text-3xl md:text-[38px] leading-tight font-semibold tracking-tight text-white font-sans text-balance">
              Gestión que acompaña cada momento
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Supervisión de capillas de velación, cortejos programados, expedientes legales y coordinación con familiares.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsNewServiceModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Servicio</span>
            </button>
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Resumen de Prioridades (IA)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alertas Operativas Urgentes */}
      {alerts.length > 0 && (
        <div className="fc-premium-alerts bg-[#fffaf7] border border-[#ead7cd] rounded-[20px] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-red-900 font-semibold text-sm">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Alertas Operativas Prioritarias ({alerts.length})</span>
            </div>
            <span className="text-xs text-red-700 font-medium">Atención requerida</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white border border-red-100 rounded-lg p-3 text-xs flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                    <span className="font-medium text-red-700 uppercase tracking-wider">{alert.type}</span>
                    <span>{alert.timestamp}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-xs mb-1">{alert.title}</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{alert.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  {alert.relatedServiceId ? (
                    <button
                      onClick={() => {
                        const target = services.find((s) => s.id === alert.relatedServiceId);
                        if (target) handleOpenService(target);
                      }}
                      className="text-amber-800 hover:text-amber-950 font-medium text-[11px] flex items-center gap-1"
                    >
                      <span>Ver {alert.relatedServiceId}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  ) : <span />}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-slate-500 hover:text-slate-800 text-[11px] underline"
                  >
                    Resolver
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métricas Operativas Clave (KPI Grid - Single Elevation) */}
      <div className="fc-premium-kpis grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Servicios Activos</span>
            <FolderHeart className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {activeServices.length}
            </span>
            <span className="text-xs text-slate-500">en proceso</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>{scheduledServices.length} programados</span>
            <span aria-hidden="true">·</span>
            <span>{finishedServices.length} concluidos</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Capillas / Salas</span>
            <Building className="w-4 h-4 text-slate-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {occupiedRooms.length} / {rooms.length}
            </span>
            <span className="text-xs text-amber-700 font-medium">ocupadas</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>{availableRooms.length} capillas disponibles</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Vehículos / Flota</span>
            <Car className="w-4 h-4 text-slate-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {assignedVehicles.length} / {vehicles.length}
            </span>
            <span className="text-xs text-slate-600">en cortejo</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>{vehicles.length - assignedVehicles.length} unidades en base</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Documentación</span>
            <FileCheck2 className="w-4 h-4 text-slate-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {pendingDocsCount}
            </span>
            <span className="text-xs text-amber-700 font-medium">por validar</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>Actas, certificados y permisos</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Saldos por Cobrar</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-tight text-slate-900 tabular-nums">
              ${(pendingReceivablesMxn / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-500">MXN</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>{pendingBudgets.length} cotizaciones pendientes</span>
          </div>
        </div>
      </div>

      {/* 2 Columnas de Detalle Operativo */}
      <div className="fc-premium-columns grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Columna Izquierda: Servicios Funerarios en Curso (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Expedientes en seguimiento
            </h2>
            <button
              onClick={() => setCurrentView('servicios')}
              className="text-xs text-amber-800 hover:text-amber-950 font-medium flex items-center gap-1"
            >
              <span>Ver todos ({services.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeServices.map((service) => {
              const assignedRoom = rooms.find((r) => r.id === service.roomId);
              const assignedVehicle = vehicles.find((v) => v.id === service.vehicleId);

              return (
                <div
                  key={service.id}
                  onClick={() => handleOpenService(service)}
                  className="bg-white border border-slate-200 hover:border-amber-400/80 rounded-xl p-4 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono font-medium text-slate-800">{service.id}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{service.serviceType.replace('_', ' ')}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-800 font-medium">{getStageBadgeLabel(service.currentStage)}</span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 hover:text-amber-800 transition-colors">
                        {service.deceased.fullName}
                      </h3>
                      <p className="text-xs text-slate-600">
                        Familiar responsable: {service.familyContact.fullName} ({service.familyContact.relationship}) · Tel: {service.familyContact.phone}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-500 block">Horario de capilla</span>
                      <span className="text-xs font-semibold text-slate-800 font-mono">
                        {service.wakeStartTime ? `${service.wakeStartTime} - ${service.wakeEndTime || 'Cierre'}` : 'Sin velación'}
                      </span>
                    </div>
                  </div>

                  {/* Asignaciones de recursos y destino */}
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 truncate">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{assignedRoom ? assignedRoom.name : 'Sin capilla asignada'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{assignedVehicle ? assignedVehicle.model : 'Sin vehículo asignado'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{service.destinationPlace}</span>
                    </div>
                  </div>

                  {/* Barra de progreso de etapas */}
                  <div className="mt-3 flex items-center gap-1.5">
                    {service.requiredStages.map((stageKey, idx) => {
                      const stageIdx = service.requiredStages.indexOf(service.currentStage);
                      const isCompleted = idx < stageIdx;
                      const isCurrent = stageKey === service.currentStage;

                      return (
                        <div
                          key={stageKey}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            isCompleted
                              ? 'bg-amber-600'
                              : isCurrent
                              ? 'bg-amber-400 animate-pulse'
                              : 'bg-slate-100'
                          }`}
                          title={`Etapa: ${stageKey}`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Agenda y Actividades Prioritarias (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Agenda y próximos compromisos
            </h2>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setAgendaTab('hoy')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  agendaTab === 'hoy'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setAgendaTab('semana')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  agendaTab === 'semana'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semana
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span className="font-medium text-slate-800">
                {agendaTab === 'hoy' ? 'Horario de Hoy (10 Nov 2026)' : 'Vista de la Semana (10 - 16 Nov)'}
              </span>
              <button
                onClick={() => setCurrentView('agenda')}
                className="text-amber-800 hover:text-amber-950 font-medium"
              >
                Ver calendario completo
              </button>
            </div>

            <div className="space-y-3">
              {/* Evento 1 */}
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div className="flex flex-col items-center justify-center w-12 py-1 bg-white border border-slate-200 rounded text-center shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase">Inicio</span>
                  <span className="font-bold text-slate-800 font-mono">09:00</span>
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-900">Capilla Imperial en Velación</p>
                  <p className="text-slate-600">Don Alejandro Valenzuela Mendoza</p>
                  <p className="text-[11px] text-slate-500">Misa programada a las 16:00 hrs · Salida cortejo 18:45 hrs</p>
                </div>
              </div>

              {/* Evento 2 */}
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div className="flex flex-col items-center justify-center w-12 py-1 bg-white border border-slate-200 rounded text-center shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase">Apertura</span>
                  <span className="font-bold text-slate-800 font-mono">15:00</span>
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-900">Capilla San Pedro: Homenaje</p>
                  <p className="text-slate-600">Sra. Beatriz Ramos Escobedo</p>
                  <p className="text-[11px] text-amber-700">Verificar llegada de ataúd y flores a las 14:30 hrs</p>
                </div>
              </div>

              {/* Evento 3 */}
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div className="flex flex-col items-center justify-center w-12 py-1 bg-white border border-slate-200 rounded text-center shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase">Traslado</span>
                  <span className="font-bold text-slate-800 font-mono">18:45</span>
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-900">Salida de Cortejo a Panteón Francés</p>
                  <p className="text-slate-600">Carroza Lincoln Continental Presidencial (Don Mario Mendoza)</p>
                  <p className="text-[11px] text-slate-500">Expediente EXP-2026-089</p>
                </div>
              </div>
            </div>

            {/* Lista de Actividades Prioritarias */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-800 mb-2">
                Tareas Prioritarias de Personal
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Recolectar acta de defunción certificada en Registro Civil 14</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <span>Coordinar prueba de audio y streaming en Capilla San Pedro</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <span>Recepción de flores de condolencia de Arte Floral San Ángel</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
