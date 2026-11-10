import React, { useState } from 'react';
import { FuneralService, ServiceStageKey, DocStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  Calendar,
  Building,
  Car,
  FileText,
  Clock,
  Printer,
  HeartHandshake,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  AlertCircle,
  FileCheck,
  ChevronRight,
} from 'lucide-react';

interface Props {
  service: FuneralService;
  onClose: () => void;
}

export const ServiceDetailModal: React.FC<Props> = ({ service, onClose }) => {
  const {
    updateServiceStage,
    updateDocumentStatus,
    rooms,
    vehicles,
    staff,
    setCurrentView,
    setViewingFamilyServiceCode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'etapas' | 'documentos' | 'recursos' | 'historial'>('etapas');
  const [transitionStage, setTransitionStage] = useState<ServiceStageKey | null>(null);
  const [transitionNote, setTransitionNote] = useState('');
  const [isPrintMode, setIsPrintMode] = useState(false);

  const assignedRoom = rooms.find((r) => r.id === service.roomId);
  const assignedVehicle = vehicles.find((v) => v.id === service.vehicleId);
  const assignedDirector = staff.find((s) => s.id === service.directorStaffId);

  const ALL_STAGES: { key: ServiceStageKey; label: string; desc: string }[] = [
    { key: 'nuevo', label: '1. Nuevo', desc: 'Recepción y apertura de expediente' },
    { key: 'documentacion', label: '2. Documentación', desc: 'Certificado médico y registro civil' },
    { key: 'preparacion', label: '3. Preparación', desc: 'Tanatopraxia y acondicionado' },
    { key: 'traslado', label: '4. Traslado', desc: 'Movilización inicial o de cortejo' },
    { key: 'velacion', label: '5. Velación', desc: 'Homenaje y capilla familiar' },
    { key: 'cremacion_inhumacion', label: '6. Destino Final', desc: 'Inhumación en panteón o crematorio' },
    { key: 'finalizado', label: '7. Finalizado', desc: 'Expediente cerrado y liquidado' },
  ];

  const handleAdvanceStage = () => {
    if (!transitionStage) return;
    updateServiceStage(service.id, transitionStage, transitionNote);
    setTransitionStage(null);
    setTransitionNote('');
  };

  const handleOpenFamilyPortal = () => {
    setViewingFamilyServiceCode(service.familyPortalCode);
    setCurrentView('familias');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto">
        {/* Cabecera del Expediente */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-300 font-mono mb-1">
              <span>{service.id}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{service.serviceType.replace('_', ' ')}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300">Etapa actual: {service.currentStage.toUpperCase()}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
              {service.deceased.fullName}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Familiar: {service.familyContact.fullName} ({service.familyContact.relationship}) · Tel: {service.familyContact.phone}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
              title="Imprimir ficha de servicio"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Ficha</span>
            </button>
            <button
              onClick={handleOpenFamilyPortal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
              title="Abrir portal familiar"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Portal Familiar</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pestañas de navegación interna */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200 bg-slate-50 text-xs font-medium">
          <button
            onClick={() => setActiveTab('etapas')}
            className={`py-3 px-2 border-b-2 transition-colors ${
              activeTab === 'etapas'
                ? 'border-amber-600 text-amber-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Flujo de Etapas ({service.currentStage})
          </button>
          <button
            onClick={() => setActiveTab('documentos')}
            className={`py-3 px-2 border-b-2 transition-colors ${
              activeTab === 'documentos'
                ? 'border-amber-600 text-amber-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Documentación ({service.documents.filter((d) => d.status === 'aprobado').length}/{service.documents.length})
          </button>
          <button
            onClick={() => setActiveTab('recursos')}
            className={`py-3 px-2 border-b-2 transition-colors ${
              activeTab === 'recursos'
                ? 'border-amber-600 text-amber-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Capilla, Carroza y Personal
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`py-3 px-2 border-b-2 transition-colors ${
              activeTab === 'historial'
                ? 'border-amber-600 text-amber-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Trazabilidad y Auditoría ({service.history.length})
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'etapas' && (
            <div className="space-y-6">
              <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-4 text-xs text-amber-950">
                <p className="font-semibold mb-1">Trazabilidad y Control de Etapas:</p>
                <p className="text-amber-900 leading-relaxed">
                  Las etapas son configurables según el tipo de servicio. Haz clic en cualquier etapa disponible para registrar el cambio con fecha, hora y usuario responsable.
                </p>
              </div>

              {/* Pipeline interactivo de etapas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ALL_STAGES.map((st) => {
                  const isRequired = service.requiredStages.includes(st.key);
                  const isCurrent = service.currentStage === st.key;
                  const isPast =
                    service.requiredStages.indexOf(st.key) !== -1 &&
                    service.requiredStages.indexOf(st.key) < service.requiredStages.indexOf(service.currentStage);

                  return (
                    <div
                      key={st.key}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500 text-slate-900'
                          : isPast
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                          : isRequired
                          ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-xs text-slate-900">{st.label}</h4>
                            {isCurrent && (
                              <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-semibold uppercase">
                                En Curso
                              </span>
                            )}
                            {isPast && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                                Concluida
                              </span>
                            )}
                            {!isRequired && (
                              <span className="text-[10px] text-slate-400">
                                (Opcional / No requerida)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{st.desc}</p>
                        </div>

                        {!isCurrent && (
                          <button
                            onClick={() => setTransitionStage(st.key)}
                            className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors shrink-0"
                          >
                            Mover aquí
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal de confirmación de transición de etapa */}
              {transitionStage && (
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-amber-300">
                      Confirmar cambio de etapa a: {transitionStage.toUpperCase()}
                    </h4>
                    <button
                      onClick={() => setTransitionStage(null)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">
                      Nota u observación para la bitácora de trazabilidad:
                    </label>
                    <input
                      type="text"
                      value={transitionNote}
                      onChange={(e) => setTransitionNote(e.target.value)}
                      placeholder="Ej. Trámite de acta completado, cortejo en movimiento hacia capilla..."
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setTransitionStage(null)}
                      className="px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                    >
                      Descartar
                    </button>
                    <button
                      onClick={handleAdvanceStage}
                      className="px-4 py-1.5 text-xs font-semibold bg-amber-400 text-slate-950 rounded-lg hover:bg-amber-300"
                    >
                      Guardar Cambio de Etapa
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documentos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Expediente Jurídico y Sanitario
                  </h3>
                  <p className="text-xs text-slate-500">
                    Documentos requeridos conforme a la legislación funeraria mexicana (SSA / Registro Civil).
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                {service.documents.map((doc) => (
                  <div key={doc.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{doc.name}</span>
                        {doc.required && (
                          <span className="text-[10px] text-red-600 font-medium">Requerido</span>
                        )}
                      </div>
                      {doc.notes && <p className="text-amber-800 text-[11px]">{doc.notes}</p>}
                      {doc.updatedAt && (
                        <p className="text-slate-400 text-[10px]">Actualizado: {new Date(doc.updatedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={doc.status}
                        onChange={(e) =>
                          updateDocumentStatus(
                            service.id,
                            doc.id,
                            e.target.value as 'aprobado' | 'en_revision' | 'pendiente'
                          )
                        }
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium focus:outline-none cursor-pointer ${
                          doc.status === 'aprobado'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : doc.status === 'en_revision'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-red-50 text-red-800 border-red-300'
                        }`}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_revision">En Revisión</option>
                        <option value="aprobado">Aprobado / Validado</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recursos' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Building className="w-4 h-4 text-slate-700" />
                  <span>Capilla de Velación</span>
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">
                  {assignedRoom ? assignedRoom.name : 'Sin capilla asignada'}
                </h4>
                {assignedRoom && (
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>Capacidad: {assignedRoom.capacityPeople} personas</p>
                    <p>Horario: {service.wakeStartTime} a {service.wakeEndTime || 'Cierre'}</p>
                    <div className="pt-1">
                      {assignedRoom.amenities.map((a, i) => (
                        <span key={i} className="inline-block text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 mr-1 mb-1">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Car className="w-4 h-4 text-slate-700" />
                  <span>Vehículo Asignado</span>
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">
                  {assignedVehicle ? assignedVehicle.model : 'Sin vehículo asignado'}
                </h4>
                {assignedVehicle && (
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>Placas: <span className="font-mono">{assignedVehicle.plate}</span></p>
                    <p>Destino: {service.destinationPlace}</p>
                    <p>Salida estimada: {service.departureTime || 'Por confirmar'}</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <User className="w-4 h-4 text-slate-700" />
                  <span>Personal Responsable</span>
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">
                  {assignedDirector ? assignedDirector.name : 'Director de Guardia'}
                </h4>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>Función: Director de Cortejo</p>
                  {assignedDirector && <p>Contacto interno: {assignedDirector.phone}</p>}
                  <p className="text-[11px] text-slate-500 pt-1">
                    Supervisa: Traslado, capilla, atención de familia y salida de carroza.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'historial' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Bitácora de Trazabilidad Legal y Operativa
              </h3>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                {service.history.map((h) => (
                  <div key={h.id} className="p-3.5 flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 uppercase tracking-wide text-[11px]">
                          {h.stage}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-700">{h.userName} ({h.userRole})</span>
                      </div>
                      <p className="text-slate-600 text-xs">{h.note}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      {new Date(h.timestamp).toLocaleString('es-MX', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
