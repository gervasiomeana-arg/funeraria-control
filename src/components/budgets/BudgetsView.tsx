import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Budget, BudgetItem } from '../../types';
import {
  Receipt,
  Plus,
  Printer,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Package,
  Layers,
  X,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const BudgetsView: React.FC = () => {
  const { budgets, createBudget, addPaymentToBudget, services, activeCompany } = useApp();

  const [activeTab, setActiveTab] = useState<'presupuestos' | 'paquetes' | 'contrato'>('presupuestos');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const selectedBudget = budgets.find((b) => b.id === selectedBudgetId) || budgets[0] || null;

  // Modal para registrar abono / pago
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta_debito' | 'tarjeta_credito' | 'transferencia_spei'>('transferencia_spei');
  const [paymentRef, setPaymentRef] = useState('SPEI-BBVA-');

  // Modal para nuevo presupuesto
  const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newDeceasedName, setNewDeceasedName] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState('');
  const [budgetError, setBudgetError] = useState('');

  // Items for new budget
  const [newItems, setNewItems] = useState<BudgetItem[]>([
    { id: '1', category: 'ataud_urna', description: 'Ataúd Madera Cedro Real con Acabado Satinado', unitPriceMxn: 22000, quantity: 1, totalMxn: 22000 },
    { id: '2', category: 'sala_velacion', description: 'Capilla de Velación Premier (12 horas)', unitPriceMxn: 9500, quantity: 1, totalMxn: 9500 },
    { id: '3', category: 'traslados', description: 'Carroza Presidencial y Chofer de Cortejo', unitPriceMxn: 4800, quantity: 1, totalMxn: 4800 },
    { id: '4', category: 'preparacion', description: 'Tratamiento tanatológico y arreglo estético', unitPriceMxn: 5500, quantity: 1, totalMxn: 5500 },
  ]);

  const calculateSubtotal = () => newItems.reduce((acc, it) => acc + it.totalMxn, 0);
  const calculateTotal = () => {
    const sub = calculateSubtotal() - discountAmount;
    const iva = sub * 0.16;
    return sub + iva;
  };

  const handleSaveBudget = () => {
    if (!newClientName.trim() || !newDeceasedName.trim()) { setBudgetError('Completá los nombres del contratante y de la persona fallecida.'); return; }
    if (!services.some(service => service.id === selectedServiceId)) { setBudgetError('Seleccioná un expediente válido.'); return; }
    if (discountAmount < 0 || !Number.isFinite(discountAmount) || discountAmount > calculateSubtotal()) { setBudgetError('El descuento no puede ser negativo ni superar el subtotal.'); return; }
    if (discountAmount > 0 && !discountReason.trim()) { setBudgetError('Indicá el motivo del descuento.'); return; }
    setBudgetError('');

    const sub = calculateSubtotal();
    const iva = (sub - discountAmount) * 0.16;
    const total = sub - discountAmount + iva;

    createBudget({
      id: `bgt-${Date.now()}`,
      serviceId: selectedServiceId,
      companyId: activeCompany.id,
      folio: `COT-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientName: newClientName,
      deceasedName: newDeceasedName,
      date: new Date().toISOString().split('T')[0],
      items: newItems,
      subtotalMxn: sub,
      discountMxn: discountAmount,
      discountReason: discountReason || undefined,
      taxIvaMxn: iva,
      totalMxn: total,
      status: 'aprobado_familia',
      payments: [],
      notes: 'COTIZACIÓN DE DEMOSTRACIÓN. Precios ilustrativos sujetos a verificación de catálogo, impuestos y condiciones. No constituye contrato ni comprobante fiscal.',
    });

    setIsNewBudgetModalOpen(false);
  };

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudget || paymentAmount <= 0) return;

    addPaymentToBudget(selectedBudget.id, paymentAmount, paymentMethod, paymentRef);
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Módulo 5</span>
            <span aria-hidden="true">·</span>
            <span>Presupuestos y Cobranza en Pesos Mexicanos</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Presupuestos, Cobranza y Comprobantes
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Administración de costos, anticipos, saldos pendientes y comprobantes internos de operación.
          </p>
        </div>

        <button
          onClick={() => setIsNewBudgetModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Elaborar Presupuesto</span>
        </button>
      </div>

      <section className="rounded-xl border border-[#d9c8a7] bg-[#fbf8f0] p-4 text-xs leading-5 text-[#554a38]">
        <strong className="block text-sm text-[#15383b]">Información comercial y cumplimiento en México</strong>
        <p className="mt-1">Referencia: NOM-036-SCFI-2016 y disposiciones de PROFECO aplicables. Los importes de esta demostración son ilustrativos, no tarifas oficiales ni precios máximos. Antes de cotizar realmente, verificá catálogo vigente, impuestos, conceptos incluidos y adicionales, cancelaciones y contrato de adhesión cuando corresponda.</p>
        <p className="mt-1 font-medium">Un presupuesto no equivale a la aceptación del cliente ni sustituye el contrato o comprobante fiscal.</p>
      </section>
      {/* Pestañas del Módulo */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-medium">
        <button
          onClick={() => setActiveTab('presupuestos')}
          className={`py-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'presupuestos'
              ? 'border-amber-600 text-amber-900 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Cotizaciones y Pagos ({budgets.length})
        </button>
        <button
          onClick={() => setActiveTab('paquetes')}
          className={`py-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'paquetes'
              ? 'border-amber-600 text-amber-900 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Paquetes Funerarios Configurados
        </button>
        <button
          onClick={() => setActiveTab('contrato')}
          className={`py-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'contrato'
              ? 'border-amber-600 text-amber-900 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Plantilla de Contrato Exequial
        </button>
      </div>

      {activeTab === 'presupuestos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lista de Presupuestos (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Presupuestos Registrados
            </h3>

            <div className="space-y-2.5">
              {budgets.map((b) => {
                const totalPaid = b.payments.reduce((sum, p) => sum + p.amountMxn, 0);
                const pendingBalance = Math.max(0, b.totalMxn - totalPaid);
                const isSelected = selectedBudget?.id === b.id;

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBudgetId(b.id)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-400 shadow-2xs ring-1 ring-amber-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">{b.folio}</span>
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          b.status === 'liquidado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pendingBalance === 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {pendingBalance === 0 ? 'Liquidado' : 'Abono Parcial'}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mt-1">{b.deceasedName}</h4>
                    <p className="text-slate-500 text-[11px]">Cliente: {b.clientName} · Ref: {b.serviceId}</p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between tabular-nums">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total con IVA:</span>
                        <span className="font-bold text-slate-900 text-xs">
                          ${b.totalMxn.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Saldo Pendiente:</span>
                        <span className={`font-bold text-xs ${pendingBalance > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                          ${pendingBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detalle y Comprobante Imprimible (7 cols) */}
          <div className="lg:col-span-7">
            {selectedBudget ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
                {/* Cabecera del comprobante */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-xs font-mono font-semibold text-amber-800">
                      {selectedBudget.folio}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      Presupuesto de Servicios Exequiales
                    </h3>
                    <p className="text-xs text-slate-500">{activeCompany.name} · RFC: {activeCompany.rfc}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Registrar Abono</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir</span>
                    </button>
                  </div>
                </div>

                {/* Datos del Cliente y Servicio */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Titular / Contratante:</span>
                    <strong className="text-slate-900">{selectedBudget.clientName}</strong>
                    <span className="text-slate-400 block text-[10px] mt-1">Expediente Asignado:</span>
                    <span className="font-mono text-slate-700">{selectedBudget.serviceId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">En Memoria de:</span>
                    <strong className="text-slate-900">{selectedBudget.deceasedName}</strong>
                    <span className="text-slate-400 block text-[10px] mt-1">Fecha de Cotización:</span>
                    <span className="text-slate-700">{selectedBudget.date}</span>
                  </div>
                </div>

                {/* Desglose de Conceptos */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    Conceptos Contratados
                  </h4>
                  <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="p-2.5 font-semibold">Descripción del Concepto</th>
                        <th className="p-2.5 font-semibold text-center">Cant.</th>
                        <th className="p-2.5 font-semibold text-right">Precio Unitario</th>
                        <th className="p-2.5 font-semibold text-right">Total MXN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedBudget.items.map((it) => (
                        <tr key={it.id}>
                          <td className="p-2.5 text-slate-800">{it.description}</td>
                          <td className="p-2.5 text-center tabular-nums text-slate-600">{it.quantity}</td>
                          <td className="p-2.5 text-right tabular-nums text-slate-600">
                            ${it.unitPriceMxn.toLocaleString('es-MX')}
                          </td>
                          <td className="p-2.5 text-right tabular-nums font-medium text-slate-900">
                            ${it.totalMxn.toLocaleString('es-MX')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totales y Descuentos */}
                <div className="flex justify-end pt-2 text-xs">
                  <div className="w-64 space-y-1.5 tabular-nums text-right">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span>${selectedBudget.subtotalMxn.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                    </div>
                    {selectedBudget.discountMxn > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Descuento autorizado:</span>
                        <span>-${selectedBudget.discountMxn.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>I.V.A. (16%):</span>
                      <span>${selectedBudget.taxIvaMxn.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                      <span>Total Neto:</span>
                      <span>${selectedBudget.totalMxn.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                    </div>
                  </div>
                </div>

                {/* Historial de Pagos y Abonos */}
                <div className="pt-3 border-t border-slate-200">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    Historial de Anticipos y Pagos Registrados
                  </h4>
                  {selectedBudget.payments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No se han registrado abonos para este folio.</p>
                  ) : (
                    <div className="space-y-1.5 text-xs">
                      {selectedBudget.payments.map((p) => (
                        <div key={p.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-900">{p.receiptFolio}</span>
                            <span className="text-slate-400 text-[11px] block">
                              Método: {p.method.replace('_', ' ').toUpperCase()} · Ref: {p.reference} · Recibió: {p.receivedBy}
                            </span>
                          </div>
                          <span className="font-bold text-emerald-700 font-mono text-sm">
                            +${p.amountMxn.toLocaleString('es-MX')} MXN
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Nota Fiscal Requerida por Prompt */}
                <div className="p-3 bg-amber-500/10 border border-amber-300 rounded-lg text-[11px] text-amber-900 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Aviso Legal Administrativo:</strong> Este documento es un comprobante interno de cotización y recepción de pagos exequiales. Conforme a las directrices de la plataforma, no constituye factura fiscal CFDI. Las facturas timbradas por el SAT se emiten mediante el módulo de timbrado autorizado por el PAC correspondiente.
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-xl">
                Selecciona un presupuesto de la lista para ver su desglose.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'paquetes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Paquete Presidencial</span>
            <h3 className="font-bold text-slate-900 text-base">Homenaje Cedro Imperial</h3>
            <p className="text-2xl font-bold text-slate-900 font-mono">$46,800 <span className="text-xs text-slate-500 font-sans">MXN + IVA</span></p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
              <li>✓ Ataúd Madera de Cedro Mexicano Satinado</li>
              <li>✓ Uso ilimitado de Capilla Imperial (12h)</li>
              <li>✓ Carroza Lincoln Continental Presidencial</li>
              <li>✓ Preparación y embalsamamiento de alta estética</li>
              <li>✓ Gestoría de acta de defunción ante Registro Civil</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Paquete Cremación</span>
            <h3 className="font-bold text-slate-900 text-base">Cremación Dignidad</h3>
            <p className="text-2xl font-bold text-slate-900 font-mono">$38,500 <span className="text-xs text-slate-500 font-sans">MXN + IVA</span></p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
              <li>✓ Urna de Mármol Blanco Tepeaca con placa</li>
              <li>✓ Capilla San Pedro para homenaje íntimo</li>
              <li>✓ Cremación ecológica con certificado oficial</li>
              <li>✓ Traslados sanitarios en unidad médica</li>
              <li>✓ Permisos de salubridad y derechos incluidos</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Paquete Básico</span>
            <h3 className="font-bold text-slate-900 text-base">Inhumación Tradicional</h3>
            <p className="text-2xl font-bold text-slate-900 font-mono">$28,900 <span className="text-xs text-slate-500 font-sans">MXN + IVA</span></p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
              <li>✓ Ataúd Metálico Plata Calibre 18</li>
              <li>✓ Capilla La Esperanza (hasta 40 personas)</li>
              <li>✓ Carroza Cadillac Clásica hacia panteón</li>
              <li>✓ Arreglo estético básico y preservación</li>
              <li>✓ Asesoría para trámite de fosa</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'contrato' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 max-w-3xl mx-auto text-xs text-slate-800 leading-relaxed">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">
              Plantilla Marco de Contrato de Prestación de Servicios Funerarios (Sujeto a Revisión Jurídica)
            </h3>
            <p className="text-[11px] text-slate-500">
              Conforme a los lineamientos de la Norma Oficial Mexicana (NOM-036-SCFI) y Procuraduría Federal del Consumidor (PROFECO).
            </p>
          </div>

          <p>
            <strong>CLÁUSULA PRIMERA (OBJETO):</strong> El prestador de servicios se compromete a proporcionar los servicios funerarios especificados en el folio presupuestal correspondiente, incluyendo recolección del cuerpo, acondicionamiento, uso de sala de velación autorizada y conducción al destino final señalado por el cliente.
          </p>
          <p>
            <strong>CLÁUSULA SEGUNDA (DOCUMENTACIÓN LEGAL):</strong> El familiar o contratante declara bajo protesta de decir verdad que posee la legitimidad legal para solicitar el presente servicio y se compromete a entregar oportunamente el Certificado Médico de Defunción original, debidamente expedido por médico con cédula profesional.
          </p>
          <p>
            <strong>CLÁUSULA TERCERA (TÉRMINOS DE PAGO):</strong> Los precios están fijados en Pesos Mexicanos (MXN). Todo servicio debe liquidarse en su totalidad previo a la salida del cortejo o traslado a horno crematorio.
          </p>
        </div>
      )}

      {/* Modal Registrar Abono */}
      {isPaymentModalOpen && selectedBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Registrar Pago o Anticipo</h3>
              <button onClick={() => setIsPaymentModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleRegisterPayment} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Folio del Presupuesto</label>
                <input type="text" readOnly value={selectedBudget.folio} className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded font-mono" />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Monto a Abonar (MXN) *</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold font-mono focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Forma de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="transferencia_spei">Transferencia Electrónica SPEI</option>
                  <option value="tarjeta_debito">Tarjeta de Débito (Terminal)</option>
                  <option value="tarjeta_credito">Tarjeta de Crédito</option>
                  <option value="efectivo">Efectivo en Caja</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Número de Autorización o Referencia</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="Ej. SPEI-192837 o Folio Terminal"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              {budgetError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">{budgetError}</p>}
              <p className="text-[11px] leading-5 text-slate-600">Precios ilustrativos en MXN. Esta demostración calcula IVA del 16% como supuesto; verificá la tasa y el tratamiento fiscal aplicables antes de emitir cotizaciones reales.</p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                >
                  Confirmar y Generar Recibo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Presupuesto */}
      {isNewBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 border border-slate-200 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Nuevo Presupuesto Exequial</h3>
              <button onClick={() => setIsNewBudgetModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Vincular a Expediente Funerario</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => {
                    setSelectedServiceId(e.target.value);
                    const s = services.find((serv) => serv.id === e.target.value);
                    if (s) {
                      setNewDeceasedName(s.deceased.fullName);
                      setNewClientName(s.familyContact.fullName);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} · {s.deceased.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Nombre del Titular / Cliente *</label>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Nombre familiar"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Nombre del Fallecido(a) *</label>
                  <input
                    type="text"
                    value={newDeceasedName}
                    onChange={(e) => setNewDeceasedName(e.target.value)}
                    placeholder="Nombre finado"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50">
                <span className="font-semibold text-slate-800 block">Conceptos Incluidos (Paquete Tradicional):</span>
                {newItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-[11px] text-slate-700">
                    <span className="truncate pr-2">{item.description}</span>
                    <span className="font-mono font-medium">${item.totalMxn.toLocaleString('es-MX')}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Descuento Autorizado (MXN)</label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Motivo del Descuento</label>
                  <input
                    type="text"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    placeholder="Convenio médico / Previsión"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg text-right font-mono font-bold text-slate-900 text-sm">
                Total Calculado: ${calculateTotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewBudgetModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveBudget}
                  className="px-4 py-2 font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg shadow-sm"
                >
                  Generar y Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
