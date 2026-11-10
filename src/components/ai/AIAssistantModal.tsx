import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  X,
  ShieldCheck,
  FileText,
  Send,
  MessageSquare,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

export const AIAssistantModal: React.FC = () => {
  const { isAiModalOpen, setIsAiModalOpen, services, alerts, rooms } = useApp();

  const [promptKey, setPromptKey] = useState<string>('resumen');
  const [copied, setCopied] = useState(false);

  if (!isAiModalOpen) return null;

  const activeServices = services.filter((s) => s.currentStage !== 'finalizado');

  const getResponseContent = () => {
    switch (promptKey) {
      case 'resumen':
        return `RESUMEN DE PRIORIDADES Y OPERACIONES FUNERARIAS DE HOY
Fecha: 10 de Noviembre de 2026 · Funeraria Control

1. ATENCIÓN INMEDIATA (ALERTAS CRÍTICAS):
• Permiso sanitario para cremación pendiente en expediente EXP-2026-091 (Sra. Beatriz Ramos). El servicio en horno está programado; la Jurisdicción Sanitaria debe validar el documento antes de las 14:00 hrs.
• Stock bajo en ataúdes metálicos plata (2 unidades en almacén; el inventario de seguridad exige mínimo 3).

2. CAPILLAS DE VELACIÓN ACTIVAS:
• Capilla Imperial: Don Alejandro Valenzuela Mendoza (EXP-2026-089). Homenaje de cuerpo presente en curso; misa solemne a las 16:00 hrs. Salida del cortejo hacia Panteón Francés programada para las 18:45 hrs con Carroza Lincoln Continental.
• Capilla San Pedro: Homenaje a Sra. Beatriz Ramos Escobedo inicia a las 15:00 hrs. Confirmar acondicionamiento previo y flores.

3. RECOMENDACIÓN DE GESTIÓN:
• Verificar con el chofer Don Mario Mendoza la ruta vehicular hacia San Joaquín previendo el tránsito vespertino en Periférico.`;

      case 'esquela':
        return `PROPUESTA DE ESQUELA CONMEMORATIVA Y NOTA LUCTUOSA
(Estilo sobrio, digno y respetuoso conforme a las tradiciones mexicanas)

───────────────────────────────────────────────────────
"Rogad a Dios por el eterno descanso de quien en vida fue:

DON ALEJANDRO VALENZUELA MENDOZA
(1948 – 2026)

Su amada hija Lic. Claudia Valenzuela Treviño, sus hermanos, nietos y demás familiares, participan con profunda pena su sensible fallecimiento acaecido el 9 de noviembre del presente año en la Ciudad de México.

Agradecen elevar una oración por su eterno descanso y acompañarnos en las solemnes honras fúnebres que se oficiarán en la Capilla Imperial de Capillas Santa María Memorial (Av. Álvaro Obregón 185, Roma Norte).

La Santa Misa de cuerpo presente se celebrará hoy a las 16:00 horas, partiendo posteriormente el cortejo hacia el Panteón Francés de San Joaquín.

Descanse en paz en los brazos del Creador."
───────────────────────────────────────────────────────`;

      case 'whatsapp':
        return `PLANTILLA RESPETUOSA DE MENSAJE VÍA WHATSAPP PARA LA FAMILIA
(Para enviar al familiar responsable o coordinadores de cortejo)

"Estimada Lic. Claudia Valenzuela:

A nombre de la Dirección y todo el equipo de Capillas Santa María, le reiteramos nuestro más sentido pésame y total apoyo solidario en estos momentos difíciles.

Le confirmamos los horarios coordinados para el homenaje de Don Alejandro:
• Capilla Imperial: Disponible para familiares y acompañantes.
• Ceremonia de Misa en Capilla: 16:00 hrs.
• Salida de la Carroza hacia el Panteón Francés: 18:45 hrs.

Contamos con servicio de estacionamiento con valet en la entrada principal y cafetería de cortesía para sus acompañantes. El Director Funerario Lic. Roberto Morales se encuentra a sus órdenes directas en el teléfono 55-4192-8811 para cualquier necesidad particular.

Un abrazo con todo nuestro respeto y consideración."`;

      case 'legal':
        return `GUÍA INFORMATIVA DE TRÁMITES LEGALES (MÉXICO - CDMX)
Conforme a la Ley General de Salud y Reglamento del Registro Civil

1. CERTIFICADO MÉDICO DE DEFUNCIÓN:
• Debe estar firmado en original por médico con cédula profesional registrada ante la SSA.
• Es indispensable verificar que el nombre completo, edad, estado civil y causa coincidan de forma exacta con el acta de nacimiento e INE del fallecido.

2. ACTA DE DEFUNCIÓN (REGISTRO CIVIL):
• Requisitos: Certificado médico de defunción original, acta de nacimiento del finado, identificación INE vigente y presencia del declarante responsable.

3. AUTORIZACIÓN DE CREMACIÓN:
• La legislación mexicana exige que transcurran un mínimo de 12 horas desde el fallecimiento y un máximo de 48 horas para inhumación o cremación ordinaria, salvo dispensa o disposición sanitaria especial.
• Requiere carta responsiva firmada por los deudos con mayor parentesco legal en línea directa.`;

      default:
        return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getResponseContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto text-xs">
        {/* Cabecera */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans">
                Asistente Ético Funerario · Funeraria Control
              </h2>
              <p className="text-[11px] text-amber-300">
                Fase 2 de Inteligencia Artificial · Orientación Operativa y Redacción Solemne
              </p>
            </div>
          </div>
          <button onClick={() => setIsAiModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Salvaguarda Ética Requerida por Prompt */}
        <div className="bg-amber-500/10 border-b border-amber-300/80 px-4 py-2.5 text-[11px] text-amber-950 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Política de Privacidad y Salvaguarda Ética:</strong> Este asistente nunca inventa datos de personas fallecidas, no modifica expedientes legales ni sustituye resoluciones oficiales del Registro Civil o SSA. No se envían datos confidenciales de familias a servidores no autorizados.
          </div>
        </div>

        {/* Selector de Herramientas IA */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-2">
          <button
            onClick={() => setPromptKey('resumen')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              promptKey === 'resumen'
                ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Prioridades Operativas de Hoy
          </button>
          <button
            onClick={() => setPromptKey('esquela')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              promptKey === 'esquela'
                ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Redacción de Esquela Solemne
          </button>
          <button
            onClick={() => setPromptKey('whatsapp')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              promptKey === 'whatsapp'
                ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Mensaje WhatsApp para Familiares
          </button>
          <button
            onClick={() => setPromptKey('legal')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              promptKey === 'legal'
                ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Guía de Trámites Legales CDMX
          </button>
        </div>

        {/* Área de Respuesta */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span>Resultado Asistido por Modelo de Lenguaje</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-slate-700 hover:text-slate-950 font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Texto copiado!' : 'Copiar texto'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
            {getResponseContent()}
          </pre>
        </div>

        {/* Pie */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsAiModalOpen(false)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium text-xs"
          >
            Cerrar Asistente
          </button>
        </div>
      </div>
    </div>
  );
};
