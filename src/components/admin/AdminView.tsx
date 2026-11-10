import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Database,
  Shield,
  CreditCard,
  Copy,
  Check,
  Power,
  Users,
  Server,
  Layers,
} from 'lucide-react';
import { SUPABASE_ARCHITECTURE_OVERVIEW, SUPABASE_SQL_MIGRATION } from '../../data/supabaseSchema';

export const AdminView: React.FC = () => {
  const { companies, updateCompanyStatus, setActiveCompanyId, activeCompany } = useApp();

  const [activeTab, setActiveTab] = useState<'tenants' | 'planes' | 'supabase' | 'metricas'>('tenants');
  const [copiedSql, setCopiedSql] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_MIGRATION);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Módulo 9</span>
            <span aria-hidden="true">·</span>
            <span>Panel del Propietario SaaS Funeraria Control</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Administración SaaS Multiempresa
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Supervisión de funerarias afiliadas, suscripciones, arquitectura PostgreSQL/Supabase y políticas RLS.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <span className="text-slate-500 pl-2">Aislamiento de Datos:</span>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
            Multi-Tenant Activo
          </span>
        </div>
      </div>

      {/* Pestañas del Panel de Superadministrador */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-medium">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`py-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'tenants'
              ? 'border-amber-600 text-amber-900 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Funerarias Registradas ({companies.length})
        </button>
        <button
          onClick={() => setActiveTab('planes')}
          className={`py-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'planes'
              ? 'border-amber-600 text-amber-900 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Planes y Precios SaaS
        </button>
        <button
          onClick={() => setActiveTab('supabase')}
          className={`py-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'supabase'
              ? 'border-amber-600 text-amber-900 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Esquema PostgreSQL / Supabase
        </button>
        <button
          onClick={() => setActiveTab('metricas')}
          className={`py-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'metricas'
              ? 'border-amber-600 text-amber-900 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Métricas de la Plataforma
        </button>
      </div>

      {/* 1. Funerarias Registradas */}
      {activeTab === 'tenants' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3.5">Empresa Funeraria</th>
                  <th className="p-3.5">Ubicación / RFC</th>
                  <th className="p-3.5">Plan Contratado</th>
                  <th className="p-3.5">Límite Sucursales / Usuarios</th>
                  <th className="p-3.5 text-center">Estatus Suscripción</th>
                  <th className="p-3.5 text-right">Acciones de Cuenta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="p-3.5">
                      <strong className="text-slate-900 font-bold block">{c.name}</strong>
                      <span className="text-[11px] text-slate-500">{c.legalName}</span>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      <span>{c.city}, {c.state}</span>
                      <span className="font-mono text-[11px] text-slate-400 block">{c.rfc}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="capitalize font-medium text-slate-800">Plan {c.plan}</span>
                      {c.trialEndsAt && (
                        <span className="text-[10px] text-amber-700 block">Prueba vence: {c.trialEndsAt}</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600 tabular-nums font-mono">
                      {c.maxBranches} sucursales · {c.maxUsers} usuarios
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          c.status === 'activa'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'prueba'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.status !== 'activa' ? (
                          <button
                            onClick={() => updateCompanyStatus(c.id, 'activa')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-medium text-[11px]"
                          >
                            Habilitar
                          </button>
                        ) : (
                          <button
                            onClick={() => updateCompanyStatus(c.id, 'suspendida')}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded font-medium text-[11px]"
                          >
                            Suspender
                          </button>
                        )}
                        <button
                          onClick={() => setActiveCompanyId(c.id)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-[11px]"
                        >
                          Administrar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Planes y Precios SaaS */}
      {activeTab === 'planes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500">Para Funerarias Pequeñas</span>
            <h3 className="text-xl font-bold text-slate-900">Plan Básico</h3>
            <p className="text-3xl font-bold text-slate-900 font-mono">
              $2,490 <span className="text-xs text-slate-500 font-sans">MXN / mes</span>
            </p>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li>✓ 1 Sucursal incluida</li>
              <li>✓ Hasta 5 usuarios simultáneos</li>
              <li>✓ Expedientes y control de salas ilimitados</li>
              <li>✓ Portal familiar de condolencias</li>
              <li>✓ Soporte técnico por correo</li>
            </ul>
          </div>

          <div className="bg-white border-2 border-amber-400 rounded-xl p-6 shadow-2xs space-y-4 relative">
            <span className="text-xs uppercase tracking-wider font-bold text-amber-700">Más Popular</span>
            <h3 className="text-xl font-bold text-slate-900">Plan Profesional</h3>
            <p className="text-3xl font-bold text-slate-900 font-mono">
              $4,990 <span className="text-xs text-slate-500 font-sans">MXN / mes</span>
            </p>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li>✓ Hasta 3 Sucursales</li>
              <li>✓ Hasta 15 usuarios con roles diferenciados</li>
              <li>✓ Control de flotilla vehicular y kilometraje</li>
              <li>✓ Módulo de inventario y alertas de stock</li>
              <li>✓ Exportación de reportes financieros</li>
              <li>✓ Soporte prioritario por WhatsApp</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500">Cadenas Funerarias</span>
            <h3 className="text-xl font-bold text-slate-900">Plan Enterprise</h3>
            <p className="text-3xl font-bold text-slate-900 font-mono">
              $8,900 <span className="text-xs text-slate-500 font-sans">MXN / mes</span>
            </p>
            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              <li>✓ Sucursales ilimitadas</li>
              <li>✓ Usuarios ilimitados</li>
              <li>✓ Multi-empresa con consolidación contable</li>
              <li>✓ Base de datos PostgreSQL dedicada (Supabase)</li>
              <li>✓ Acceso a API REST y Webhooks</li>
              <li>✓ Gerente de cuenta dedicado 24/7</li>
            </ul>
          </div>
        </div>
      )}

      {/* 3. Arquitectura Supabase / PostgreSQL */}
      {activeTab === 'supabase' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Arquitectura PostgreSQL & Supabase (RLS Ready)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Esquema relacional DDL preparado para conectar con la cadena de conexión provista:
                <code className="text-amber-800 ml-1 font-mono">postgresql://USUARIO:PASSWORD@HOST:PUERTO/NOMBRE_BD?sslmode=require</code>
              </p>
            </div>

            <button
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>¡SQL Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Script SQL</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-800 block">Motor de Persistencia:</span>
              <span className="text-slate-600">{SUPABASE_ARCHITECTURE_OVERVIEW.dbEngine}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-800 block">Autenticación Prevista:</span>
              <span className="text-slate-600">{SUPABASE_ARCHITECTURE_OVERVIEW.authProvider}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-800 block">Modelo de Aislamiento:</span>
              <span className="text-slate-600">{SUPABASE_ARCHITECTURE_OVERVIEW.multiTenancyModel}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-1">
              Script DDL y Políticas de Seguridad Row Level Security (RLS):
            </span>
            <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed">
              {SUPABASE_SQL_MIGRATION}
            </pre>
          </div>
        </div>
      )}

      {/* 4. Métricas de la Plataforma */}
      {activeTab === 'metricas' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
            <span className="text-slate-400">Total Empresas SaaS Afiliadas</span>
            <p className="text-2xl font-bold text-slate-900 font-mono">3 Funerarias</p>
            <p className="text-slate-500 text-[11px]">2 activas · 1 período de prueba</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
            <span className="text-slate-400">Disponibilidad del Sistema (SLA)</span>
            <p className="text-2xl font-bold text-emerald-700 font-mono">99.98%</p>
            <p className="text-slate-500 text-[11px]">Infraestructura de alta resiliencia</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
            <span className="text-slate-400">Almacenamiento de Documentos</span>
            <p className="text-2xl font-bold text-slate-900 font-mono">1.2 GB / 50 GB</p>
            <p className="text-slate-500 text-[11px]">Actas de defunción y contratos cifrados</p>
          </div>
        </div>
      )}
    </div>
  );
};
