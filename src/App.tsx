import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DemoBanner } from './components/common/DemoBanner';
import { DashboardView } from './components/dashboard/DashboardView';
import { ServicesView } from './components/services/ServicesView';
import { ScheduleView } from './components/schedule/ScheduleView';
import { FamilyPortalView } from './components/family/FamilyPortalView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { InventoryView } from './components/inventory/InventoryView';
import { ResourcesView } from './components/resources/ResourcesView';
import { ReportsView } from './components/reports/ReportsView';
import { AdminView } from './components/admin/AdminView';
import { AIAssistantModal } from './components/ai/AIAssistantModal';


// Public browser key only. No service-role credentials or database passwords.
const SUPABASE_URL = 'https://vfqiudqoerfnmnkwugie.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_tR95J4J1ZQP0XpvoOUtEDA_guyXCWEm';

const SupabaseConnectionPanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Modo demostración: los expedientes todavía no se guardan en Supabase.');
  const [authorizedCompanies, setAuthorizedCompanies] = useState<string[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryCooldownUntil, setRecoveryCooldownUntil] = useState(0);
  useEffect(() => {
    // Supabase recovery redirects carry a short-lived token in the URL fragment.
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.get('type') === 'recovery' && params.get('access_token')) {
      setRecoveryToken(params.get('access_token') || '');
      setRecoveryMode(true);
      setOpen(true);
      setMessage('Enlace verificado. Elegí una contraseña nueva para completar la activación.');
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);
  const requestRecovery = async () => {
    if (!email.trim()) { setMessage('Ingresá primero tu correo electrónico.'); return; }
    if (Date.now() < recoveryCooldownUntil) { setMessage('Ya se solicitó un correo recientemente. Esperá antes de volver a intentarlo.'); return; }
    setBusy(true);
    try {
      const response = await fetch(SUPABASE_URL + '/auth/v1/recover?redirect_to=' + encodeURIComponent('https://funeraria-control.ai.studio'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ email: email.trim() })
      });
      if (response.status === 429) {
        setRecoveryCooldownUntil(Date.now() + 60 * 60 * 1000);
        throw new Error('Supabase alcanzó el límite de correos (429). No vuelvas a solicitar otro durante al menos una hora. El límite del proyecto puede durar más.');
      }
      if (!response.ok) throw new Error('Supabase rechazó la solicitud (HTTP ' + response.status + '). Revisá la configuración de correo y los registros de Auth.');
      setRecoveryCooldownUntil(Date.now() + 60 * 1000);
      setMessage('Solicitud recibida. Si el correo está registrado y el proveedor permite el envío, recibirás un enlace. Revisá también Spam.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo solicitar el correo.'); }
    finally { setBusy(false); }
  };
  const saveNewPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 12) { setMessage('Usá una contraseña de al menos 12 caracteres.'); return; }
    setBusy(true);
    try {
      const response = await fetch(SUPABASE_URL + '/auth/v1/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: 'Bearer ' + recoveryToken },
        body: JSON.stringify({ password: newPassword })
      });
      if (!response.ok) throw new Error('El enlace expiró o no es válido. Solicitá uno nuevo.');
      setRecoveryToken('');
      setNewPassword('');
      setRecoveryMode(false);
      setMessage('Contraseña establecida correctamente. Ya podés iniciar sesión.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo guardar la contraseña.'); }
    finally { setBusy(false); }
  };
  const connect = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok || !data.access_token) throw new Error('No se pudo iniciar sesión. Verificá tus credenciales en Supabase.');
      const membershipsResponse = await fetch(SUPABASE_URL + '/rest/v1/company_memberships?select=company_id,role&active=eq.true', {
        headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: 'Bearer ' + data.access_token }
      });
      if (!membershipsResponse.ok) throw new Error('Autenticación correcta, pero no se pudo verificar la membresía.');
      const memberships = await membershipsResponse.json();
      setAuthorizedCompanies(memberships.map((membership: {company_id:string;role:string}) => membership.company_id + ' (' + membership.role + ')'));
      setSignedIn(true);
      setPassword('');
      setMessage(memberships.length ? 'Autenticación verificada. Acceso restringido por empresa.' : 'Autenticación correcta. Todavía no tenés una funeraria asignada; no se habilita el acceso a datos reales.');
    } catch (error) {
      setSignedIn(false);
      setAuthorizedCompanies([]);
      setMessage(error instanceof Error ? error.message : 'Error de conexión.');
    } finally { setBusy(false); }
  };
  return <div className="border-b border-[#d9e4df] bg-[#eef4f0] px-4 py-2 text-xs text-[#31564e]">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
      <span><strong>Supabase:</strong> {signedIn ? 'Sesión verificada' : 'Conexión disponible · sin sesión'} · Datos demo preservados</span>
      <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} className="rounded-lg border border-[#c5d8cf] px-3 py-1.5 font-semibold hover:bg-white">{open ? 'Cerrar conexión' : 'Conectar cuenta'}</button>
    </div>
    {open && <div className="mx-auto mt-3 max-w-7xl rounded-xl border border-[#c5d8cf] bg-white p-4">
      <p className="mb-3 font-medium">Acceso seguro a Funeraria Control — Supabase</p>
      {recoveryMode && recoveryToken && <form onSubmit={saveNewPassword} className="mb-4 flex flex-wrap items-end gap-2">
        <label className="flex min-w-60 flex-col gap-1">Nueva contraseña (mínimo 12 caracteres)<input required type="password" autoComplete="new-password" minLength={12} value={newPassword} onChange={event=>setNewPassword(event.target.value)} className="rounded-lg border border-slate-300 p-2 text-sm"/></label>
        <button disabled={busy} type="submit" className="rounded-lg bg-[#173a3e] px-4 py-2.5 font-semibold text-white disabled:opacity-50">{busy ? 'Guardando…' : 'Establecer contraseña'}</button>
      </form>}
      {!signedIn && !recoveryMode && <form onSubmit={connect} className="flex flex-wrap items-end gap-2">
        <label className="flex min-w-48 flex-col gap-1">Correo electrónico<input required type="email" autoComplete="username" value={email} onChange={event=>setEmail(event.target.value)} className="rounded-lg border border-slate-300 p-2 text-sm"/></label>
        <label className="flex min-w-48 flex-col gap-1">Contraseña<input required type="password" autoComplete="current-password" value={password} onChange={event=>setPassword(event.target.value)} className="rounded-lg border border-slate-300 p-2 text-sm"/></label>
        <button disabled={busy} type="submit" className="rounded-lg bg-[#173a3e] px-4 py-2.5 font-semibold text-white disabled:opacity-50">{busy ? 'Verificando…' : 'Iniciar sesión'}</button>
      </form>}
      {!signedIn && !recoveryMode && <button type="button" disabled={busy || Date.now() < recoveryCooldownUntil} onClick={requestRecovery} className="mt-3 text-xs font-semibold underline disabled:opacity-50">Crear o recuperar contraseña por correo</button>}
      <p role="status" className="mt-3 text-[#49675e]">{message}</p>
      {authorizedCompanies.map(company=><p key={company} className="mt-1 text-[#31564e]">Empresa autorizada: {company}</p>)}
      {signedIn && <button type="button" onClick={()=>{setSignedIn(false);setAuthorizedCompanies([]);setMessage('Sesión local cerrada.');}} className="mt-3 underline">Cerrar sesión local</button>}
      <p className="mt-3 text-[11px] text-slate-500">La sesión no se guarda en este dispositivo. Este panel verifica identidad y membresías; la gestión operativa permanece en modo demostración.</p>
    </div>}
  </div>;
};

const MainLayout: React.FC = () => {
  const { currentView, toastMessage } = useApp();

  return (
    <div className="fc-premium-shell min-h-screen flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Bar Navigation */}
      <Header />

      <SupabaseConnectionPanel />

      {/* Demo Banner */}
      <DemoBanner />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Content Viewport */}
        <main className="fc-premium-main flex-1 p-4 md:p-8 mx-auto w-full overflow-x-hidden">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'servicios' && <ServicesView />}
          {currentView === 'agenda' && <ScheduleView />}
          {currentView === 'familias' && <FamilyPortalView />}
          {currentView === 'presupuestos' && <BudgetsView />}
          {currentView === 'inventario' && <InventoryView />}
          {currentView === 'recursos' && <ResourcesView />}
          {currentView === 'reportes' && <ReportsView />}
          {currentView === 'admin' && <AdminView />}
        </main>
      </div>

      {/* Global AI Assistant Modal */}
      <AIAssistantModal />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white border border-slate-700 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
