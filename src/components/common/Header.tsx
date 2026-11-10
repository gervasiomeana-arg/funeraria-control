import React, { useState } from 'react';
import { useApp, MainViewKey } from '../../context/AppContext';
import { Plus, Sparkles, Building2, UserCircle2, ChevronDown, Check } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-slate-100">
      {/* Zona 1: Brand title, one line wordmark */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-sm shadow-sm">
          FC
        </div>
        <div className="flex flex-col">
          <span className="text-base font-semibold tracking-wide text-white uppercase font-sans">
            Funeraria Control
          </span>
          <span className="text-[11px] text-amber-300/80 font-normal">
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
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Expediente</span>
        </button>
      </div>
    </header>
  );
};
