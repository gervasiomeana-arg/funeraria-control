import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building,
  Car,
  Users,
  Handshake,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { Room, Vehicle } from '../../types';

export const ResourcesView: React.FC = () => {
  const { rooms, updateRoomStatus, vehicles, updateVehicleStatus, staff, providers, services } = useApp();
  const [activeTab, setActiveTab] = useState<'salas' | 'vehiculos' | 'personal' | 'proveedores'>('salas');

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Módulo 7</span>
          <span aria-hidden="true">·</span>
          <span>Personal, Capillas, Vehículos y Proveedores</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 font-sans">
          Gestión de Recursos e Infraestructura
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Disponibilidad en tiempo real de capillas, flotilla de carrozas, turnos de personal y convenios externos.
        </p>
      </div>

      {/* Pestañas */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-medium">
        <button
          onClick={() => setActiveTab('salas')}
          className={`py-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'salas'
              ? 'border-amber-600 text-amber-900 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Capillas de Velación ({rooms.length})
        </button>
        <button
          onClick={() => setActiveTab('vehiculos')}
          className={`py-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'vehiculos'
              ? 'border-amber-600 text-amber-900 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Flotilla Vehicular ({vehicles.length})
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`py-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'personal'
              ? 'border-amber-600 text-amber-900 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Personal y Turnos ({staff.length})
        </button>
        <button
          onClick={() => setActiveTab('proveedores')}
          className={`py-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'proveedores'
              ? 'border-amber-600 text-amber-900 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Proveedores y Convenios ({providers.length})
        </button>
      </div>

      {/* 1. Salas de Velación */}
      {activeTab === 'salas' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rooms.map((room) => {
            const currentService = services.find((s) => s.id === room.currentServiceId);

            return (
              <div
                key={room.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{room.name}</h3>
                    <p className="text-xs text-slate-500">Capacidad: {room.capacityPeople} personas</p>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
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

                {room.status === 'ocupada' && (
                  <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-lg text-xs space-y-1">
                    <span className="text-[10px] font-mono text-amber-800 font-semibold block">
                      En velación activa · {room.currentServiceId}
                    </span>
                    <strong className="text-slate-900 block font-semibold">
                      {room.currentServiceDeceasedName}
                    </strong>
                    <span className="text-slate-600 text-[11px] block">{room.occupiedUntil}</span>
                  </div>
                )}

                <div className="space-y-1 text-xs text-slate-600">
                  <span className="text-[11px] text-slate-400 font-medium block">Servicios de la Capilla:</span>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.map((amenity, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Cambiar Estatus:</span>
                  <select
                    value={room.status}
                    onChange={(e) => updateRoomStatus(room.id, e.target.value as any)}
                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded font-medium focus:outline-none"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="ocupada">Ocupada</option>
                    <option value="reservada">Reservada</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Vehículos y Flota */}
      {activeTab === 'vehiculos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-slate-700" />
                    <h3 className="font-bold text-slate-900 text-sm">{v.model}</h3>
                  </div>
                  <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                    Placas: <strong className="text-slate-800">{v.plate}</strong> · Tipo: {v.type.replace('_', ' ').toUpperCase()}
                  </p>
                </div>

                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    v.status === 'en_servicio'
                      ? 'bg-amber-100 text-amber-900'
                      : v.status === 'taller'
                      ? 'bg-red-100 text-red-900'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {v.status.replace('_', ' ')}
                </span>
              </div>

              {v.status === 'en_servicio' && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-950">
                  <span className="font-semibold block text-[11px]">En Cortejo Activo ({v.currentServiceId}):</span>
                  <p className="text-slate-700">{v.currentDestination}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 tabular-nums">
                <div>
                  <span className="text-[10px] text-slate-400 block">Kilometraje:</span>
                  <span className="font-bold text-slate-800">{v.mileageKm.toLocaleString()} km</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Último Servicio:</span>
                  <span className="text-slate-700">{v.lastMaintenanceDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Próx. Servicio:</span>
                  <span className="text-slate-700">{v.nextMaintenanceDueKm.toLocaleString()} km</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Estatus Operativo:</span>
                <select
                  value={v.status}
                  onChange={(e) => updateVehicleStatus(v.id, e.target.value as any)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded font-medium focus:outline-none"
                >
                  <option value="disponible">Disponible en Base</option>
                  <option value="en_servicio">En Servicio / Cortejo</option>
                  <option value="taller">En Taller / Mantenimiento</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Personal y Turnos */}
      {activeTab === 'personal' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3.5">Nombre del Empleado</th>
                <th className="p-3.5">Función Exequial</th>
                <th className="p-3.5">Teléfono Directo</th>
                <th className="p-3.5">Turno Asignado</th>
                <th className="p-3.5 text-center">Estatus</th>
                <th className="p-3.5">Servicio Actual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/70">
                  <td className="p-3.5 font-bold text-slate-900">{st.name}</td>
                  <td className="p-3.5 text-slate-700 capitalize">{st.role.replace('_', ' ')}</td>
                  <td className="p-3.5 text-slate-600 font-mono">{st.phone}</td>
                  <td className="p-3.5 text-slate-700 capitalize">{st.shift.replace('_', ' ')}</td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        st.status === 'en_servicio'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {st.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-600">
                    {st.currentServiceId || <span className="text-slate-400 italic">Sin asignación</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Proveedores Externos */}
      {activeTab === 'proveedores' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providers.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">{p.serviceCategory.replace('_', ' ')}</span>
                <h3 className="font-bold text-slate-900 text-sm mt-0.5">{p.name}</h3>
              </div>

              <div className="space-y-1 text-slate-600">
                <p>Contacto: <strong className="text-slate-800">{p.contactName}</strong></p>
                <p>Teléfono: <span className="font-mono text-slate-800">{p.phone}</span></p>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 text-[11px]">
                <strong className="block text-slate-800 mb-0.5">Acuerdo / Convenio:</strong>
                {p.contractAgreement}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
