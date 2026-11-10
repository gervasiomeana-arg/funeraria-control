import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarDays,
  Clock,
  Building,
  Car,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
} from 'lucide-react';

export const ScheduleView: React.FC = () => {
  const { services, rooms, vehicles, setSelectedService, setCurrentView, setIsNewServiceModalOpen } = useApp();
  const [viewMode, setViewMode] = useState<'dia' | 'semana'>('dia');
  const [selectedDate, setSelectedDate] = useState('2026-11-10');

  // Time slots for daily view (from 08:00 to 22:00)
  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const weekDays = [
    { label: 'Lun 10 Nov', date: '2026-11-10', isToday: true },
    { label: 'Mar 11 Nov', date: '2026-11-11', isToday: false },
    { label: 'Mié 12 Nov', date: '2026-11-12', isToday: false },
    { label: 'Jue 13 Nov', date: '2026-11-13', isToday: false },
    { label: 'Vie 14 Nov', date: '2026-11-14', isToday: false },
    { label: 'Sáb 15 Nov', date: '2026-11-15', isToday: false },
    { label: 'Dom 16 Nov', date: '2026-11-16', isToday: false },
  ];

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Módulo 3</span>
            <span aria-hidden="true">·</span>
            <span>Agenda y Cronograma Operativo</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Agenda de Capillas, Cortejos y Homenajes
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Supervisión horaria para evitar empalmes de salas, vehículos o personal de acompañamiento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('dia')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'dia'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vista Diaria
            </button>
            <button
              onClick={() => setViewMode('semana')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'semana'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vista Semanal
            </button>
          </div>

          <button
            onClick={() => setIsNewServiceModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Servicio</span>
          </button>
        </div>
      </div>

      {/* Selector de Fecha */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <button className="p-1 rounded hover:bg-slate-100 text-slate-600">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-900 text-sm">
            {viewMode === 'dia' ? 'Martes, 10 de Noviembre de 2026' : 'Semana del 10 al 16 de Noviembre de 2026'}
          </span>
          <button className="p-1 rounded hover:bg-slate-100 text-slate-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Velación en Capilla</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Cortejo / Traslado</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Cremación Programada</span>
          </span>
        </div>
      </div>

      {/* Grid de Capillas y Bloques Horarios (Vista Diaria) */}
      {viewMode === 'dia' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
              Disponibilidad de Capillas de Velación · CDMX Matriz Roma
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {rooms.map((room) => {
              const activeService = services.find((s) => s.roomId === room.id && s.currentStage !== 'finalizado');

              return (
                <div key={room.id} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Info de Sala */}
                  <div className="md:col-span-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-slate-700" />
                      <h4 className="font-bold text-slate-900 text-xs">{room.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Capacidad: {room.capacityPeople} personas · Planta baja
                    </p>
                    <span
                      className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        room.status === 'ocupada'
                          ? 'bg-amber-100 text-amber-900'
                          : room.status === 'reservada'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>

                  {/* Línea de tiempo visual del día */}
                  <div className="md:col-span-9 bg-slate-50 border border-slate-200/60 rounded-xl p-3">
                    {activeService ? (
                      <div
                        onClick={() => {
                          setSelectedService(activeService);
                          setCurrentView('servicios');
                        }}
                        className="bg-amber-500/15 border border-amber-400/80 rounded-lg p-3 hover:bg-amber-500/20 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-amber-950 font-bold block">
                              {activeService.id} · {activeService.wakeStartTime || '09:00'} - {activeService.wakeEndTime || '18:30'} hrs
                            </span>
                            <h5 className="font-bold text-slate-950 text-xs mt-0.5">
                              {activeService.deceased.fullName}
                            </h5>
                            <p className="text-[11px] text-slate-700">
                              Ceremonia: {activeService.ceremonyTime || 'Misa familiar'}
                            </p>
                          </div>
                          <span className="text-xs text-amber-900 font-semibold underline">
                            Ver expediente
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2.5 text-center text-xs text-slate-400 italic">
                        Capilla disponible para asignación inmediata.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Vista Semanal */
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dayServices = services.filter((s) => s.scheduledServiceDate === day.date);

            return (
              <div
                key={day.date}
                className={`bg-white border rounded-xl p-3 shadow-2xs space-y-2.5 ${
                  day.isToday ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-200'
                }`}
              >
                <div className="border-b border-slate-100 pb-1.5 flex items-center justify-between text-xs">
                  <span className={`font-semibold ${day.isToday ? 'text-amber-900' : 'text-slate-800'}`}>
                    {day.label}
                  </span>
                  {day.isToday && (
                    <span className="text-[9px] uppercase tracking-wider bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-bold">
                      Hoy
                    </span>
                  )}
                </div>

                <div className="space-y-2 min-h-[140px]">
                  {dayServices.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center pt-8">Sin servicios agendados</p>
                  ) : (
                    dayServices.map((ds) => (
                      <div
                        key={ds.id}
                        onClick={() => {
                          setSelectedService(ds);
                          setCurrentView('servicios');
                        }}
                        className="p-2 rounded bg-slate-50 hover:bg-amber-50 border border-slate-200 text-xs cursor-pointer transition-colors space-y-0.5"
                      >
                        <span className="font-mono text-[10px] text-slate-500 block">{ds.id}</span>
                        <p className="font-bold text-slate-900 truncate">{ds.deceased.fullName}</p>
                        <p className="text-[10px] text-slate-600 truncate">{ds.serviceType.replace('_', ' ')}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
