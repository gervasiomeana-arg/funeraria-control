import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Building,
  Car,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { services, budgets, rooms, vehicles, inventory, activeCompany } = useApp();

  const [dateRange, setDateRange] = useState<'este_mes' | 'trimestre' | 'anual'>('este_mes');

  // Metrics
  const totalServices = services.length;
  const totalRevenueMxn = budgets.reduce((acc, b) => {
    return acc + b.payments.reduce((sum, p) => sum + p.amountMxn, 0);
  }, 0);
  const totalBudgetedMxn = budgets.reduce((acc, b) => acc + b.totalMxn, 0);
  const totalPendingMxn = Math.max(0, totalBudgetedMxn - totalRevenueMxn);

  // Export CSV function
  const handleExportCSV = () => {
    const headers = ['Expediente', 'Fallecido', 'Tipo Servicio', 'Fecha', 'Capilla', 'Total MXN', 'Pagado MXN', 'Saldo Pendiente', 'Etapa Actual'];
    const rows = services.map((s) => {
      const budget = budgets.find((b) => b.serviceId === s.id);
      const total = budget ? budget.totalMxn : s.budgetTotalMxn;
      const paid = budget ? budget.payments.reduce((sum, p) => sum + p.amountMxn, 0) : s.budgetPaidMxn;
      const balance = Math.max(0, total - paid);
      const room = rooms.find((r) => r.id === s.roomId);

      return [
        `"${s.id}"`,
        `"${s.deceased.fullName}"`,
        `"${s.serviceType}"`,
        `"${s.scheduledServiceDate}"`,
        `"${room ? room.name : 'Sin capilla'}"`,
        total,
        paid,
        balance,
        `"${s.currentStage}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_funeraria_control_${dateRange}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Módulo 8</span>
            <span aria-hidden="true">·</span>
            <span>Reportes Gerenciales y Operativos</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Informes de Operación y Finanzas (MXN)
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Análisis consolidado de servicios realizados, ocupación de salas, ingresos y saldos por cobrar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs font-medium text-slate-800"
          >
            <option value="este_mes">Mes en curso (Noviembre 2026)</option>
            <option value="trimestre">Último Trimestre (Sep - Nov 2026)</option>
            <option value="anual">Año Fiscal 2026</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-medium transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards de Finanzas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-500 text-xs">Total de Servicios Atendidos</span>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">{totalServices}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Expedientes en el período</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-500 text-xs">Ingresos Recaudados (Caja)</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1 font-mono tabular-nums">
            ${totalRevenueMxn.toLocaleString('es-MX')} <span className="text-xs text-slate-500">MXN</span>
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Anticipos y liquidaciones</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-500 text-xs">Saldos Pendientes por Cobrar</span>
          <p className="text-2xl font-bold text-amber-700 mt-1 font-mono tabular-nums">
            ${totalPendingMxn.toLocaleString('es-MX')} <span className="text-xs text-slate-500">MXN</span>
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Cuentas corrientes activas</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-500 text-xs">Valor del Inventario en Bodega</span>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            ${inventory.reduce((acc, i) => acc + (i.stockCurrent * i.salePriceMxn), 0).toLocaleString('es-MX')} <span className="text-xs text-slate-500">MXN</span>
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Ataúdes, urnas y suministros</span>
        </div>
      </div>

      {/* Gráficos Operativos y Distribuciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Tipo de Servicio */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">
            Distribución por Tipo de Servicio
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Velación + Inhumación en Panteón</span>
                <span className="font-mono font-bold">50% (2 servicios)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '50%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Velación + Cremación Ecológica</span>
                <span className="font-mono font-bold">25% (1 servicio)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Cremación Directa / Sin Capilla</span>
                <span className="font-mono font-bold">25% (1 servicio)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tasa de Ocupación de Capillas de Velación */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">
            Ocupación de Capillas de Velación
          </h3>

          <div className="space-y-3">
            {rooms.map((room) => {
              const occupancy = room.status === 'ocupada' ? 85 : room.status === 'reservada' ? 50 : 15;

              return (
                <div key={room.id}>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span className="font-medium text-slate-900">{room.name}</span>
                    <span className="font-mono font-bold">{occupancy}% ocupación</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        occupancy >= 80 ? 'bg-amber-600' : occupancy >= 50 ? 'bg-amber-400' : 'bg-slate-300'
                      }`}
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
