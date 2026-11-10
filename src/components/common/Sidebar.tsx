import React from 'react';
import { useApp, MainViewKey } from '../../context/AppContext';
import {
  LayoutDashboard,
  FolderHeart,
  CalendarDays,
  HeartHandshake,
  Receipt,
  Boxes,
  UsersRound,
  BarChart3,
  Sliders,
  AlertTriangle,
  Building,
} from 'lucide-react';

interface NavItem {
  key: MainViewKey;
  label: string;
  icon: React.ElementType;
  badgeCount?: number;
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, services, alerts, inventory, activeCompany } = useApp();

  const activeServicesCount = services.filter((s) => s.currentStage !== 'finalizado').length;
  const lowStockCount = inventory.filter((i) => i.status === 'bajo_stock' || i.status === 'agotado').length;
  const pendingAlertsCount = alerts.filter((a) => !a.resolved).length;

  const navItems: NavItem[] = [
    { key: 'dashboard', label: '1. Inicio', icon: LayoutDashboard },
    { key: 'servicios', label: '2. Servicios', icon: FolderHeart, badgeCount: activeServicesCount },
    { key: 'agenda', label: '3. Agenda', icon: CalendarDays },
    { key: 'familias', label: '4. Familias', icon: HeartHandshake },
    { key: 'presupuestos', label: '5. Presupuestos', icon: Receipt },
    { key: 'inventario', label: '6. Inventario', icon: Boxes, badgeCount: lowStockCount > 0 ? lowStockCount : undefined },
    { key: 'recursos', label: '7. Personal y recursos', icon: UsersRound },
    { key: 'reportes', label: '8. Reportes', icon: BarChart3 },
    { key: 'admin', label: '9. Administración', icon: Sliders },
  ];

  return (
    <aside className="fc-premium-sidebar hidden md:flex w-64 border-r text-slate-300 flex-col shrink-0 min-h-[calc(100vh-57px)]">
      {/* Información de la funeraria */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
          <Building className="w-3.5 h-3.5" />
          <span className="truncate">{activeCompany.name}</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">RFC: {activeCompany.rfc}</p>
      </div>

      {/* Menú de navegación principal (9 módulos) */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setCurrentView(item.key)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-amber-400/15 text-amber-300 font-semibold border-l-2 border-amber-400'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badgeCount !== undefined && item.badgeCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-semibold ${
                    item.key === 'inventario'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Alertas operativas rápidas */}
      {pendingAlertsCount > 0 && (
        <div className="p-3 mx-3 mb-3 bg-red-950/40 border border-red-800/40 rounded-lg">
          <div className="flex items-center justify-between text-xs text-red-300 font-medium">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              Alertas operativas
            </span>
            <span className="text-[10px] bg-red-900/60 text-red-200 px-1.5 py-0.5 rounded-full font-mono">
              {pendingAlertsCount}
            </span>
          </div>
          <p className="text-[11px] text-red-400/90 mt-1 line-clamp-2">
            {alerts[0]?.title}
          </p>
        </div>
      )}

      {/* Pie del menú: Versión e indicación técnica */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span>Versión v1.0 Demostración</span>
          <span className="text-emerald-400">En línea</span>
        </div>
        <span className="text-[10px] text-slate-400">
          PostgreSQL / Supabase Ready
        </span>
      </div>
    </aside>
  );
};
