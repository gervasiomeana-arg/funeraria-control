import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Heart,
  Clock,
  MapPin,
  Calendar,
  FileText,
  Flame,
  MessageSquare,
  ShieldCheck,
  Phone,
  Send,
  Sparkles,
} from 'lucide-react';

export const FamilyPortalView: React.FC = () => {
  const {
    services,
    condolences,
    addCondolence,
    viewingFamilyServiceCode,
    setViewingFamilyServiceCode,
    rooms,
  } = useApp();

  const [inputCode, setInputCode] = useState(viewingFamilyServiceCode || 'VAL-7890');
  const [guestName, setGuestName] = useState('');
  const [relationship, setRelationship] = useState('Amigo(a) de la familia');
  const [condolenceText, setCondolenceText] = useState('');
  const [lightCandle, setLightCandle] = useState(true);

  // Find matching service by code
  const currentService = services.find(
    (s) => s.familyPortalCode.toLowerCase() === inputCode.trim().toLowerCase()
  ) || services[0];

  const assignedRoom = rooms.find((r) => r.id === currentService?.roomId);
  const serviceCondolences = condolences.filter((c) => c.serviceId === currentService?.id);

  const handlePostCondolence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !condolenceText.trim() || !currentService) return;

    addCondolence(currentService.id, guestName, relationship, condolenceText, lightCandle);
    setCondolenceText('');
    setGuestName('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Selector de Expediente Familiar (Demostración) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold text-slate-900">
            Portal Privado de Acompañamiento Familiar
          </span>
          <span className="text-slate-400">· Acceso seguro por código</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Código familiar (ej. VAL-7890)"
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => setViewingFamilyServiceCode(inputCode)}
            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium shrink-0"
          >
            Consultar
          </button>
        </div>
      </div>

      {/* Hero del Portal Familiar con Fotografía Serena */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-950 text-white">
        <img
          src="/src/assets/images/family_portal_serene_dawn_1794336944001.jpg"
          alt="Amanecer sereno en memoria"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 p-8 md:p-12 text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest text-amber-300 font-medium">
            En Memoria y Homenaje
          </span>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white font-sans">
            {currentService?.deceased.fullName}
          </h1>
          <p className="text-sm text-slate-200 font-light italic">
            "Su amor, legado y bondad perdurarán por siempre en nuestros corazones."
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-amber-200/90 pt-2 font-mono">
            <span>Expediente: {currentService?.id}</span>
            <span aria-hidden="true">·</span>
            <span>Servicio Exequial Conmemorativo</span>
          </div>
        </div>
      </div>

      {/* Bloque de Información del Servicio: Lugar, Horarios y Ubicación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Capilla y Ceremonia */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase tracking-wide">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Horarios y Ceremonia</span>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div>
              <span className="text-slate-400 block text-[11px]">Capilla de Velación:</span>
              <strong className="text-slate-900 text-sm font-semibold">
                {assignedRoom ? assignedRoom.name : 'Capilla asignada en recepción'}
              </strong>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">Horario de velación:</span>
                <span className="font-medium text-slate-800">
                  {currentService?.wakeStartTime || '09:00'} - {currentService?.wakeEndTime || '18:30'} hrs
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Ceremonia religiosa / homenaje:</span>
                <span className="font-medium text-slate-800">
                  {currentService?.ceremonyTime || 'Por confirmar con la familia'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 block text-[11px]">Destino final / Inhumación:</span>
              <span className="font-medium text-slate-800">
                {currentService?.destinationPlace}
              </span>
            </div>
          </div>
        </div>

        {/* Ubicación y Cómo Llegar */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase tracking-wide">
            <MapPin className="w-4 h-4 text-amber-600" />
            <span>Ubicación y Atención</span>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div>
              <span className="text-slate-400 block text-[11px]">Dirección de las Capillas:</span>
              <p className="font-semibold text-slate-900">
                Capillas Santa María Memorial (Sede Roma Norte)
              </p>
              <p className="text-slate-600 text-[11px]">
                Av. Álvaro Obregón 185, Col. Roma Norte, Cuauhtémoc, Ciudad de México.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-700" />
                <span>Abrir en Google Maps</span>
              </a>

              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Coordinador de sala:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 text-xs">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  55-4192-8811
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentación Solicitada a la Familia */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase tracking-wide">
            <FileText className="w-4 h-4 text-slate-700" />
            <span>Documentación e Insumos Entregados por la Familia</span>
          </div>
          <span className="text-xs text-slate-500">
            {currentService?.documents.filter((d) => d.status === 'aprobado').length} de {currentService?.documents.length} validados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {currentService?.documents.map((doc) => (
            <div
              key={doc.id}
              className={`p-2.5 rounded-lg border flex items-center justify-between ${
                doc.status === 'aprobado'
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span className="font-medium truncate mr-2">{doc.name}</span>
              <span
                className={`text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded shrink-0 ${
                  doc.status === 'aprobado'
                    ? 'bg-emerald-200/80 text-emerald-950'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {doc.status === 'aprobado' ? 'Recibido' : 'Pendiente'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Libro Digital de Condolencias y Homenaje */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Libro de Condolencias y Acompañamiento
            </h3>
            <p className="text-xs text-slate-500">
              Expresa tus condolencias y enciende una vela conmemorativa en su honor.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 text-amber-900 text-xs font-medium">
            <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>{serviceCondolences.filter((c) => c.virtualCandleLit).length} Velas Encendidas</span>
          </div>
        </div>

        {/* Formulario para dejar mensaje */}
        <form onSubmit={handlePostCondolence} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Tu Nombre Completo *</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Ej. Familia González López"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Parentesco o Relación</label>
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="Ej. Amigo de la infancia, Colega de trabajo"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1 text-xs">Mensaje de Respeto o Condolencia *</label>
            <textarea
              rows={2}
              value={condolenceText}
              onChange={(e) => setCondolenceText(e.target.value)}
              placeholder="Escribe tus palabras de cariño y aliento para la familia..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={lightCandle}
                onChange={(e) => setLightCandle(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="flex items-center gap-1 font-medium">
                <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                Encender una vela virtual en su memoria
              </span>
            </label>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Condolencia</span>
            </button>
          </div>
        </form>

        {/* Lista de Condolencias Publicadas */}
        <div className="space-y-3 pt-2">
          {serviceCondolences.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-white border border-slate-100 shadow-2xs space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{c.authorName}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{c.relationship}</span>
                  {c.virtualCandleLit && (
                    <span className="flex items-center gap-1 text-amber-700 text-[11px] font-medium ml-1">
                      <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
                      Vela encendida
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(c.timestamp).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed italic">
                "{c.message}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
