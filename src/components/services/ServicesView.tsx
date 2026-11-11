import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FuneralService, ServiceStageKey, ServiceType } from '../../types';
import {
  Search,
  Filter,
  Plus,
  Building,
  Car,
  Clock,
  ArrowRight,
  FolderHeart,
  HeartHandshake,
  FileCheck2,
} from 'lucide-react';
import { ServiceDetailModal } from './ServiceDetailModal';
import { ServiceFormModal } from './ServiceFormModal';

export const ServicesView: React.FC = () => {
  const {
    services,
    selectedService,
    setSelectedService,
    isNewServiceModalOpen,
    setIsNewServiceModalOpen,
    rooms,
    vehicles,
    setViewingFamilyServiceCode,
    setCurrentView,
    activeBranchId,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('todos');
  const [typeFilter, setTypeFilter] = useState<string>('todos');

  // Filtered services
  const filteredServices = services.filter((s) => {
    if (activeBranchId !== 'todas' && s.branchId !== activeBranchId) return false;
    if (stageFilter === 'activos' && s.currentStage === 'finalizado') return false;
    if (stageFilter !== 'todos' && stageFilter !== 'activos' && s.currentStage !== stageFilter) return false;
    if (typeFilter !== 'todos' && s.serviceType !== typeFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDeceased = s.deceased.fullName.toLowerCase().includes(q);
      const matchFolio = s.id.toLowerCase().includes(q);
      const matchFamily = s.familyContact.fullName.toLowerCase().includes(q);
      return matchDeceased || matchFolio || matchFamily;
    }
    return true;
  });

  const activeCount = services.filter(service => (activeBranchId === 'todas' || service.branchId === activeBranchId) && service.currentStage !== 'finalizado').length;
  const finishedCount = services.filter(service => (activeBranchId === 'todas' || service.branchId === activeBranchId) && service.currentStage === 'finalizado').length;
  const hasFilters = Boolean(searchQuery.trim()) || stageFilter !== 'todos' || typeFilter !== 'todos';
  const resetFilters = () => { setSearchQuery(''); setStageFilter('todos'); setTypeFilter('todos'); };

  const getStageBadge = (stage: ServiceStageKey) => {
    switch (stage) {
      case 'nuevo':
        return <span className="text-amber-700 font-medium">Nuevo</span>;
      case 'documentacion':
        return <span className="text-blue-700 font-medium">Documentación</span>;
      case 'preparacion':
        return <span className="text-purple-700 font-medium">Preparación</span>;
      case 'traslado':
        return <span className="text-indigo-700 font-medium">En Traslado</span>;
      case 'velacion':
        return <span className="text-amber-800 font-bold">En Velación</span>;
      case 'cremacion_inhumacion':
        return <span className="text-orange-700 font-medium">Cortejo / Destino</span>;
      case 'finalizado':
        return <span className="text-emerald-700 font-medium">Finalizado</span>;
      default:
        return <span>{stage}</span>;
    }
  };

  const getServiceTypeLabel = (type: ServiceType) => {
    switch (type) {
      case 'velacion_inhumacion':
        return 'Velación + Inhumación';
      case 'velacion_cremacion':
        return 'Velación + Cremación';
      case 'cremacion_directa':
        return 'Cremación Directa';
      case 'inhumacion_directa':
        return 'Inhumación Directa';
      case 'traslado_nacional':
        return 'Traslado Nacional';
      case 'traslado_internacional':
        return 'Repatriación Internacional';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Módulo 2</span>
            <span aria-hidden="true">·</span>
            <span>Servicios Funerarios y Expedientes</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Expedientes de Servicios Funerarios
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Control de etapas, documentación médica y civil, capillas, traslados y comunicación familiar.
          </p>
        </div>

        <button
          onClick={() => setIsNewServiceModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Expediente</span>
        </button>
      </div>

      {/* Resumen operativo: refleja los expedientes visibles de la sucursal elegida. */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3" aria-label="Resumen de expedientes">
        <div className="rounded-xl border border-[#e5dfd3] bg-white p-4"><p className="text-xs text-slate-500">Expedientes activos</p><p className="mt-1 text-2xl font-semibold text-[#15383b]">{activeCount}</p></div>
        <div className="rounded-xl border border-[#e5dfd3] bg-white p-4"><p className="text-xs text-slate-500">Finalizados</p><p className="mt-1 text-2xl font-semibold text-[#15383b]">{finishedCount}</p></div>
        <div className="col-span-2 rounded-xl border border-[#e5dfd3] bg-white p-4 md:col-span-1"><p className="text-xs text-slate-500">Resultados de búsqueda</p><p className="mt-1 text-2xl font-semibold text-[#15383b]">{filteredServices.length}</p></div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre del fallecido, familiar responsable o número de expediente..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-500">Etapa:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium focus:outline-none"
            >
              <option value="todos">Todas las etapas</option>
              <option value="activos">Solo servicios activos</option>
              <option value="nuevo">Nuevo</option>
              <option value="documentacion">Documentación</option>
              <option value="preparacion">Preparación</option>
              <option value="velacion">Velación</option>
              <option value="cremacion_inhumacion">Cremación / Inhumación</option>
              <option value="finalizado">Finalizados</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-500">Tipo:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium focus:outline-none"
            >
              <option value="todos">Todos los tipos</option>
              <option value="velacion_inhumacion">Velación + Inhumación</option>
              <option value="velacion_cremacion">Velación + Cremación</option>
              <option value="cremacion_directa">Cremación Directa</option>
              <option value="inhumacion_directa">Inhumación Directa</option>
              <option value="traslado_nacional">Traslado Nacional</option>
              <option value="traslado_internacional">Repatriación Internacional</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500" aria-live="polite">
        <span>Mostrando {filteredServices.length} expediente{filteredServices.length === 1 ? '' : 's'}{hasFilters ? ' con los filtros seleccionados' : ''}.</span>
        {hasFilters && <button type="button" onClick={resetFilters} className="rounded-lg border border-[#d6cbb6] bg-white px-3 py-2 font-semibold text-[#15383b] hover:bg-[#f7f2e8]">Limpiar filtros</button>}
      </div>

      {/* Lista de Expedientes */}
      <div className="space-y-3">
        {filteredServices.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs space-y-3">
            <FolderHeart className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-medium text-slate-800">No se encontraron expedientes con los filtros seleccionados.</p>
            <p className="text-slate-500 max-w-sm mx-auto">
              Intenta cambiar los términos de búsqueda o registra un nuevo servicio con el botón superior.
            </p>
          </div>
        ) : (
          filteredServices.map((service) => {
            const assignedRoom = rooms.find((r) => r.id === service.roomId);
            const assignedVehicle = vehicles.find((v) => v.id === service.vehicleId);
            const pendingDocs = service.documents.filter((d) => d.status === 'pendiente').length;

            return (
              <div
                key={service.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Datos Principales */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-semibold text-slate-900">{service.id}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-slate-700">{getServiceTypeLabel(service.serviceType)}</span>
                    <span aria-hidden="true">·</span>
                    <span>Etapa: {getStageBadge(service.currentStage)}</span>
                  </div>

                  <h3
                    onClick={() => setSelectedService(service)}
                    className="text-base font-bold text-slate-900 hover:text-amber-800 cursor-pointer transition-colors"
                  >
                    {service.deceased.fullName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span>
                      Familiar: <strong className="text-slate-800 font-medium">{service.familyContact.fullName}</strong> ({service.familyContact.relationship})
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Tel: {service.familyContact.phone}</span>
                    <span aria-hidden="true">·</span>
                    <span>Fecha: {service.scheduledServiceDate}</span>
                  </div>

                  {/* Asignaciones operativas */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      {assignedRoom ? assignedRoom.name : 'Sin capilla'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Car className="w-3 h-3 text-slate-400" />
                      {assignedVehicle ? assignedVehicle.model : 'Sin vehículo'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <FileCheck2 className="w-3 h-3 text-slate-400" />
                      {pendingDocs > 0 ? (
                        <span className="text-amber-700 font-medium">{pendingDocs} docs pendientes</span>
                      ) : (
                        <span className="text-emerald-700 font-medium">Documentación completa</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                  <button
                    onClick={() => {
                      setViewingFamilyServiceCode(service.familyPortalCode);
                      setCurrentView('familias');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                    title="Ver cómo lo ve la familia"
                  >
                    <HeartHandshake className="w-3.5 h-3.5 text-amber-700" />
                    <span>Portal Familiar</span>
                  </button>

                  <button
                    onClick={() => setSelectedService(service)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400/80 hover:bg-amber-400 rounded-lg transition-colors"
                  >
                    <span>Ver Expediente</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modales */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}

      {isNewServiceModalOpen && (
        <ServiceFormModal onClose={() => setIsNewServiceModalOpen(false)} />
      )}
    </div>
  );
};
