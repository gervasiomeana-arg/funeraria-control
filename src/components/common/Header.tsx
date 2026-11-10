import React, { useState } from 'react';
import { useApp, MainViewKey } from '../../context/AppContext';
import { Plus, Sparkles, Building2, UserCircle2, ChevronDown, Check, Menu, X, LayoutDashboard, FolderHeart, CalendarDays, HeartHandshake, Receipt, Boxes, UsersRound, BarChart3, Sliders } from 'lucide-react';
import { UserRole } from '../../types';

export const Header: React.FC = () => {
  const {
    activeCompany,
    setActiveCompanyId,
    companies,
    currentUser,
    setCurrentUserRole,
    setIsNewServiceModalOpen,
    setIsAiModalOpen,
    activeBranchId,
    setActiveBranchId,
    branches,
    currentView,
    setCurrentView,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useApp();

  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roles: { key: UserRole; label: string }[] = [
    { key: 'admin_funeraria', label: 'Director / Administrador Funeraria' },
    { key: 'gerente', label: 'Gerente de Operaciones' },
    { key: 'recepcionista', label: 'Recepcionista y Trámites' },
    { key: 'operador', label: 'Operador / Tanatopraxia' },
    { key: 'superadmin', label: 'Superadministrador SaaS' },
  ];

  const navItems = [
    { key: 'dashboard', label: '1. Inicio', icon: LayoutDashboard },
    { key: 'servicios', label: '2. Servicios', icon: FolderHeart },
    { key: 'agenda', label: '3. Agenda', icon: CalendarDays },
    { key: 'familias', label: '4. Familias', icon: HeartHandshake },
    { key: 'presupuestos', label: '5. Presupuestos', icon: Receipt },
    { key: 'inventario', label: '6. Inventario', icon: Boxes },
    { key: 'recursos', label: '7. Personal y recursos', icon: UsersRound },
    { key: 'reportes', label: '8. Reportes', icon: BarChart3 },
    { key: 'admin', label: '9. Administración', icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 md:gap-8 px-4 md:px-6 py-3 bg-slate-900 border-b border-slate-800 text-slate-100">
      {/* Zona 1: Brand title, one line wordmark + mobile hamburger */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Abrir menú"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-sm shadow-sm">
          FC
        </div>
        <div className="flex flex-col">
          <span className="text-sm md:text-base font-semibold tracking-wide text-white uppercase font-sans">
            Funeraria Control
          </span>
          <span className="text-[10px] md:text-[11px] text-amber-300/80 font-normal">
            Plataforma Integral Exequial
          </span>
        </div>
      </div>

      {/* Zona 2: Selectores de contexto (Empresa y Sucursal) y Asistente IA */}
      <div className="hidden md:flex items-center gap-5 text-xs text-slate-300">
        {/* Selector de Funeraria (Multi-tenant SaaS) */}
        <div className="relative">
          <button
            onClick={() => {
              setCompanyDropdownOpen(!companyDropdownOpen);
              setRoleDropdownOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 transition-colors"
            title="Conmutar funeraria activa"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="max-w-[180px] truncate font-medium">{activeCompany.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {companyDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-64 rounded-lg bg-slate-900 border border-slate-700 shadow-xl py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
                Funerarias Registradas (SaaS)
              </div>
              {companies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveCompanyId(c.id);
                    setCompanyDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs hover:bg-slate-800 transition-colors ${
                    c.id === activeCompany.id ? 'text-amber-400 font-medium' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <p className="truncate font-medium">{c.name}</p>
                    <p className="text-[10px] text-slate-400">{c.city}, {c.state} · Plan {c.plan}</p>
                  </div>
                  {c.id === activeCompany.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filtro de Sucursal */}
        <div className="flex items-center gap-1.5 bg-slate-800/50 px-2.5 py-1 rounded border border-slate-800">
          <span className="text-slate-400">Sucursal:</span>
          <select
            value={activeBranchId}
            onChange={(e) => setActiveBranchId(e.target.value)}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value="todas" className="bg-slate-900 text-slate-200">Todas las sucursales</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Rol */}
        <div className="relative">
          <button
            onClick={() => {
              setRoleDropdownOpen(!roleDropdownOpen);
              setCompanyDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60"
            title="Cambiar rol para probar permisos"
          >
            <UserCircle2 className="w-3.5 h-3.5 text-slate-300" />
            <span className="capitalize">{currentUser.role.replace('_', ' ')}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-60 rounded-lg bg-slate-900 border border-slate-700 shadow-xl py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
                Cambiar Rol de Demostración
              </div>
              {roles.map((r) => (
                <button
                  key={r.key}
                  onClick={() => {
                    setCurrentUserRole(r.key);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs hover:bg-slate-800 transition-colors ${
                    currentUser.role === r.key ? 'text-amber-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  <span>{r.label}</span>
                  {currentUser.role === r.key && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Asistente IA (Fase 2) */}
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-amber-300 hover:text-amber-200 hover:bg-amber-400/10 rounded border border-amber-500/30 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Asistente Ético IA</span>
        </button>
      </div>

      {/* Zona 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setIsNewServiceModalOpen(true)}
          className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo Expediente</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {/* Menú Móvil Desplegable (Mobile Drawer) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col p-4 shadow-2xl z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-white text-sm">Menú Funeraria Control</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de Empresa en Móvil */}
            <div className="py-3 border-b border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Funeraria Activa:</span>
              <select
                value={activeCompany.id}
                onChange={(e) => setActiveCompanyId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-amber-300 font-medium"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Rol en Móvil */}
            <div className="py-3 border-b border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Rol de Demostración:</span>
              <select
                value={currentUser.role}
                onChange={(e) => setCurrentUserRole(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
              >
                {roles.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Enlaces de los 9 Módulos */}
            <nav className="py-3 space-y-1 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setCurrentView(item.key as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-amber-400/20 text-amber-300 font-bold border-l-2 border-amber-400'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Asistente IA en móvil */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsAiModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium"
              >
                <Sparkles className="w-4 h-4" />
                <span>Asistente Ético IA</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
