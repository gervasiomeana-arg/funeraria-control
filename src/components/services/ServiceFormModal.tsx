import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceType, ServiceStageKey, FuneralService } from '../../types';
import { X, ArrowRight, ArrowLeft, Check, User, Calendar, MapPin, Building, Car } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ServiceFormModal: React.FC<Props> = ({ onClose }) => {
  const { createService, rooms, vehicles, staff, activeCompany, activeBranchId, branches } = useApp();

  const [step, setStep] = useState(1);

  // Form states
  const nextExpNumber = `EXP-2026-${Math.floor(100 + Math.random() * 900)}`;

  // Deceased
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(70);
  const [gender, setGender] = useState<'masculino' | 'femenino' | 'otro'>('masculino');
  const [deathDateTime, setDeathDateTime] = useState('2026-11-10T08:00');
  const [deathPlace, setDeathPlace] = useState('Hospital General de México, CDMX');
  const [causeOfDeath, setCauseOfDeath] = useState('Causa médica no traumática');

  // Family
  const [familyName, setFamilyName] = useState('');
  const [relationship, setRelationship] = useState('Hijo(a)');
  const [familyPhone, setFamilyPhone] = useState('55-');
  const [familyEmail, setFamilyEmail] = useState('');

  // Service details
  const [serviceType, setServiceType] = useState<ServiceType>('velacion_inhumacion');
  const [branchId, setBranchId] = useState(activeBranchId === 'todas' ? branches[0]?.id || 'br-roma' : activeBranchId);
  const [roomId, setRoomId] = useState(rooms.find((r) => r.status === 'disponible')?.id || rooms[0]?.id);
  const [vehicleId, setVehicleId] = useState(vehicles.find((v) => v.status === 'disponible')?.id || vehicles[0]?.id);
  const [directorStaffId, setDirectorStaffId] = useState(staff[0]?.id || 'st-1');
  const [scheduledServiceDate, setScheduledServiceDate] = useState('2026-11-10');
  const [wakeStartTime, setWakeStartTime] = useState('12:00');
  const [wakeEndTime, setWakeEndTime] = useState('20:00');
  const [destinationPlace, setDestinationPlace] = useState('Panteón Francés de San Joaquín');
  const [internalNotes, setInternalNotes] = useState('');

  const handleSave = () => {
    if (!fullName || !familyName) return;

    const accessCode = `${familyName.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const requiredStages: ServiceStageKey[] =
      serviceType === 'cremacion_directa' || serviceType === 'inhumacion_directa'
        ? ['nuevo', 'documentacion', 'preparacion', 'cremacion_inhumacion', 'finalizado']
        : ['nuevo', 'documentacion', 'preparacion', 'traslado', 'velacion', 'cremacion_inhumacion', 'finalizado'];

    createService({
      id: nextExpNumber,
      companyId: activeCompany.id,
      branchId,
      deceased: {
        fullName,
        age: Number(age) || 0,
        gender,
        deathDateTime,
        deathPlace,
        causeOfDeath,
      },
      familyContact: {
        fullName: familyName,
        relationship,
        phone: familyPhone,
        email: familyEmail,
        isLegalResponsible: true,
      },
      serviceType,
      currentStage: 'nuevo',
      requiredStages,
      roomId: (serviceType === 'cremacion_directa' || serviceType === 'inhumacion_directa') ? undefined : roomId,
      vehicleId,
      directorStaffId,
      scheduledServiceDate,
      wakeStartTime: (serviceType === 'cremacion_directa' || serviceType === 'inhumacion_directa') ? undefined : wakeStartTime,
      wakeEndTime: (serviceType === 'cremacion_directa' || serviceType === 'inhumacion_directa') ? undefined : wakeEndTime,
      destinationPlace,
      documents: [
        { id: `doc-${Date.now()}-1`, name: 'Certificado Médico de Defunción (SSA)', required: true, status: 'en_revision' },
        { id: `doc-${Date.now()}-2`, name: 'Acta de Defunción Registro Civil', required: true, status: 'pendiente' },
        { id: `doc-${Date.now()}-3`, name: 'Identificación INE Familiar Responsable', required: true, status: 'aprobado' },
        { id: `doc-${Date.now()}-4`, name: 'Permiso Sanitario o Título de Fosa', required: true, status: 'pendiente' },
      ],
      budgetTotalMxn: 35000,
      budgetPaidMxn: 0,
      internalNotes,
      familyPortalCode: accessCode,
      familyPortalEnabled: true,
      obituaryPublished: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto">
        {/* Cabecera */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-300 font-mono">
              <span>{nextExpNumber}</span>
              <span>·</span>
              <span>Paso {step} de 3</span>
            </div>
            <h2 className="text-lg font-bold text-white font-sans mt-0.5">
              Alta de Nuevo Expediente Funerario
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario con Pasos */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 text-sm">
                1. Datos de la Persona Fallecida
              </h3>

              <div>
                <label className="block font-medium mb-1">Nombre Completo del Finado(a) *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Don Manuel Sánchez Orozco"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Edad</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Género</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Lugar de Defunción</label>
                <input
                  type="text"
                  value={deathPlace}
                  onChange={(e) => setDeathPlace(e.target.value)}
                  placeholder="Hospital o domicilio particular"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Causa Inmediata / Diagnóstico Médico</label>
                <input
                  type="text"
                  value={causeOfDeath}
                  onChange={(e) => setCauseOfDeath(e.target.value)}
                  placeholder="Conforme al certificado médico"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 text-sm">
                2. Familiar Responsable y Tipo de Servicio
              </h3>

              <div>
                <label className="block font-medium mb-1">Nombre Completo del Familiar / Responsable *</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Ej. Sra. Elena Sánchez Ruiz"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Parentesco</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="Hijo(a)">Hijo(a)</option>
                    <option value="Cónyuge / Pareja">Cónyuge / Pareja</option>
                    <option value="Padre / Madre">Padre / Madre</option>
                    <option value="Hermano(a)">Hermano(a)</option>
                    <option value="Albacea / Titular legal">Albacea / Titular legal</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Teléfono Móvil (WhatsApp)</label>
                  <input
                    type="text"
                    value={familyPhone}
                    onChange={(e) => setFamilyPhone(e.target.value)}
                    placeholder="55-1234-5678"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Tipo de Servicio Funerario</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as ServiceType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="velacion_inhumacion">Velación en Capilla + Inhumación en Panteón</option>
                  <option value="velacion_cremacion">Velación en Capilla + Cremación</option>
                  <option value="cremacion_directa">Cremación Directa (Sin Velación)</option>
                  <option value="inhumacion_directa">Inhumación Directa (Sin Velación)</option>
                  <option value="traslado_nacional">Traslado Foráneo / Nacional</option>
                  <option value="traslado_internacional">Traslado Internacional / Repatriación</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Correo Electrónico (Opcional)</label>
                <input
                  type="email"
                  value={familyEmail}
                  onChange={(e) => setFamilyEmail(e.target.value)}
                  placeholder="familia@correo.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 text-sm">
                3. Logística, Capilla y Asignación de Recursos
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Fecha Programada</label>
                  <input
                    type="date"
                    value={scheduledServiceDate}
                    onChange={(e) => setScheduledServiceDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Sucursal</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {serviceType !== 'cremacion_directa' && serviceType !== 'inhumacion_directa' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Capilla de Velación</label>
                    <select
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500 bg-white"
                    >
                      <option value="">Sin capilla de velación</option>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} {r.status === 'ocupada' ? '(Ocupada)' : r.status === 'reservada' ? '(Reservada)' : '(Disponible)'}
                        </option>
                      ))}
                    </select>
                    {rooms.find((r) => r.id === roomId)?.status === 'ocupada' && (
                      <p className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded mt-1 border border-amber-200">
                        Atención: Capilla ocupada por otro servicio ({rooms.find((r) => r.id === roomId)?.currentServiceDeceasedName}).
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Horario Inicio</label>
                    <input
                      type="time"
                      value={wakeStartTime}
                      onChange={(e) => setWakeStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Horario Cierre</label>
                    <input
                      type="time"
                      value={wakeEndTime}
                      onChange={(e) => setWakeEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Vehículo de Cortejo / Carroza</label>
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="">Sin vehículo asignado</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.model} {v.status === 'en_servicio' ? '(En servicio)' : '(Disponible)'}
                      </option>
                    ))}
                  </select>
                  {vehicles.find((v) => v.id === vehicleId)?.status === 'en_servicio' && (
                    <p className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded mt-1 border border-amber-200">
                      Atención: La unidad está actualmente asignada a otro cortejo.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-medium mb-1">Director Funerario Coordinador</label>
                  <select
                    value={directorStaffId}
                    onChange={(e) => setDirectorStaffId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  >
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.shift})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Destino Final (Panteón o Crematorio)</label>
                <input
                  type="text"
                  value={destinationPlace}
                  onChange={(e) => setDestinationPlace(e.target.value)}
                  placeholder="Ej. Panteón Francés, Crematorio Santa Mónica..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Observaciones Internas</label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Detalles sobre familiares, cortejo, protocolo de capilla..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Pie con navegación */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !fullName}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg disabled:opacity-50"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 rounded-lg shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Crear Expediente</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
