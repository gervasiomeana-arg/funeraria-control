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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryCooldownUntil, setRecoveryCooldownUntil] = useState(0);
  const [accessToken, setAccessToken] = useState('');
  const [authenticatedUserId, setAuthenticatedUserId] = useState('');
  const [realServices, setRealServices] = useState<Array<{id:string;reference:string;status:string;deceased_name:string|null}>>([]);
  const [realReference, setRealReference] = useState('');
  const [realDeceasedName, setRealDeceasedName] = useState('');
  const [realCompanyId, setRealCompanyId] = useState('');
  const [realDataBusy, setRealDataBusy] = useState(false);
  const [realBudgets, setRealBudgets] = useState<Array<{id:string;service_id:string;subtotal_mxn:number;discount_mxn:number;tax_mxn:number;status:string}>>([]);
  const loadRealBudgets = async (token: string, companyId: string) => {
    const response = await fetch(SUPABASE_URL + '/rest/v1/budgets?select=id,service_id,subtotal_mxn,discount_mxn,tax_mxn,status&company_id=eq.' + encodeURIComponent(companyId) + '&limit=30', {
      headers: {apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: 'Bearer ' + token}
    });
    if (!response.ok) throw new Error('No se pudieron consultar presupuestos reales (HTTP ' + response.status + ').');
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Respuesta inválida de presupuestos.');
    setRealBudgets(rows);
  };

  const loadRealServices = async (token: string, companyId: string) => {
    const response = await fetch(SUPABASE_URL + '/rest/v1/funeral_services?select=id,reference,status,deceased_name&company_id=eq.' + encodeURIComponent(companyId) + '&order=created_at.desc&limit=20', {
      headers: {apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: 'Bearer ' + token}
    });
    if (!response.ok) throw new Error('No se pudieron consultar los expedientes reales (HTTP ' + response.status + ').');
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Respuesta inválida de expedientes.');
    setRealServices(rows);
  };
  const saveRealService = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken || !realCompanyId || !authenticatedUserId) { setMessage('Iniciá sesión con una funeraria autorizada.'); return; }
    setRealDataBusy(true);
    try {
      const response = await fetch(SUPABASE_URL + '/rest/v1/funeral_services', {
        method: 'POST',
        headers: {apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: 'Bearer ' + accessToken, 'Content-Type':'application/json', Prefer:'return=minimal'},
        body: JSON.stringify({company_id:realCompanyId,reference:realReference.trim(),deceased_name:realDeceasedName.trim(),status:'nuevo',created_by:authenticatedUserId})
      });
      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error('No se pudo guardar (HTTP ' + response.status + '): ' + (details.message || 'Revisá permisos y campos requeridos.'));
      }
      setRealReference('');
      setRealDeceasedName('');
      await loadRealServices(accessToken,realCompanyId);
      setMessage('Expediente real guardado y recuperado de Supabase.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo guardar.'); }
    finally { setRealDataBusy(false); }
  };
  useEffect(() => {
    // Supabase recovery redirects carry a short-lived token in the URL fragment.
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.get('type') === 'recovery' && params.get('access_token')) {
      setRecoveryToken(params.get('access_token') || '');
      setRecoveryMode(true);
      setOpen(true);
      setMessage('Enlace de recuperación detectado. Supabase comprobará su validez al guardar la nueva contraseña.');
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
    if (newPassword !== confirmPassword) { setMessage('Las contraseñas no coinciden.'); return; }
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
      setConfirmPassword('');
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
      // Verify the access token with Supabase Auth before checking tenant membership.
      const identityResponse = await fetch(SUPABASE_URL + '/auth/v1/user', {
        headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: 'Bearer ' + data.access_token }
      });
      if (!identityResponse.ok) throw new Error('No se pudo verificar la identidad con Supabase.');
      const identity = await identityResponse.json();
      if (!identity?.id) throw new Error('La identidad devuelta por Supabase no es válida.');
      const membershipsResponse = await fetch(SUPABASE_URL + '/rest/v1/company_memberships?select=company_id,role&active=eq.true', {
        headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: 'Bearer ' + data.access_token }
      });
      if (!membershipsResponse.ok) throw new Error('Autenticación correcta, pero no se pudo verificar la membresía.');
      const memberships: Array<{company_id:string;role:string}> = await membershipsResponse.json();
      if (!Array.isArray(memberships)) throw new Error('Respuesta de membresías no válida.');
      if (memberships.length === 0) {
        setSignedIn(false);
        setAuthorizedCompanies([]);
        setPassword('');
        setMessage('Identidad verificada, pero no tenés una funeraria activa asignada. El acceso operativo sigue bloqueado.');
        return;
      }
      setAuthorizedCompanies(memberships.map((membership: {company_id:string;role:string}) => membership.company_id + ' (' + membership.role + ')'));
      setSignedIn(true);
      setAccessToken(data.access_token);
      setAuthenticatedUserId(identity.id);
      setRealCompanyId(memberships[0].company_id);
      try { await Promise.all([loadRealServices(data.access_token,memberships[0].company_id),loadRealBudgets(data.access_token,memberships[0].company_id)]); }
      catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudieron cargar expedientes.'); }
      setPassword('');
      setMessage('Identidad y membresía verificadas en Supabase. La operación continúa en modo demostración hasta activar persistencia real.');
    } catch (error) {
      setSignedIn(false);
      setAccessToken('');
      setAuthenticatedUserId('');
      setRealCompanyId('');
      setRealServices([]);
      setRealBudgets([]);
      setAuthorizedCompanies([]);
      setPassword('');
      setMessage(error instanceof Error ? error.message : 'Error de conexión.');
    } finally { setBusy(false); }
  };
  if (recoveryMode && recoveryToken) return <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#102d34] p-4">
    <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl md:p-10" aria-label="Crear contraseña">
      <div className="mb-5 text-xs font-bold uppercase tracking-[.2em] text-[#b09058]">FUNERARIA CONTROL</div>
      <h1 className="text-2xl font-semibold text-[#17353b]">Elegí tu contraseña</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Este es el último paso. Creá una contraseña que puedas recordar y usá el mismo correo y contraseña desde tu computadora o celular.</p>
      <form onSubmit={saveNewPassword} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-[#17353b]">Nueva contraseña<input autoFocus required minLength={12} type="password" autoComplete="new-password" value={newPassword} onChange={event=>setNewPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3"/></label>
        <label className="block text-sm font-medium text-[#17353b]">Repetí la contraseña<input required minLength={12} type="password" autoComplete="new-password" value={confirmPassword} onChange={event=>setConfirmPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3"/></label>
        <button disabled={busy} type="submit" className="w-full rounded-xl bg-[#173a3e] p-3 font-semibold text-white disabled:opacity-50">{busy?'Guardando…':'Guardar mi contraseña'}</button>
      </form>
      <p role="status" className="mt-4 text-sm text-[#31564e]">{message}</p>
      <p className="mt-5 text-xs leading-5 text-slate-500">No compartas tu contraseña. Si el enlace caducó, solicitá uno nuevo desde Conectar cuenta.</p>
    </section>
  </div>;
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
      {signedIn && realCompanyId && <section className="mt-4 rounded-xl border border-[#d6e1da] bg-[#f7faf8] p-4">
        <h3 className="font-semibold">Expedientes reales — Supabase</h3>
        <p className="mt-1 text-[11px] text-slate-600">Área separada de los expedientes ficticios. Los registros nuevos se guardan en la base de datos de tu funeraria.</p>
        <form onSubmit={saveRealService} className="mt-3 flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1">Folio<input required maxLength={80} value={realReference} onChange={event=>setRealReference(event.target.value)} className="rounded-lg border border-slate-300 p-2"/></label>
          <label className="flex min-w-52 flex-col gap-1">Nombre del fallecido<input required maxLength={160} value={realDeceasedName} onChange={event=>setRealDeceasedName(event.target.value)} className="rounded-lg border border-slate-300 p-2"/></label>
          <button type="submit" disabled={realDataBusy} className="rounded-lg bg-[#173a3e] px-4 py-2 text-white disabled:opacity-50">{realDataBusy?'Guardando…':'Guardar en Supabase'}</button>
        </form>
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
          <h3 className="font-semibold">Presupuestos reales (solo lectura)</h3>
          <p className="mt-1 text-slate-500">Registros de Supabase separados de los presupuestos de demostración.</p>
          {realBudgets.length === 0 ? <p className="mt-2 text-slate-500">No hay presupuestos reales registrados.</p> : <ul className="mt-2 space-y-1">{realBudgets.map(b => <li key={b.id} className="rounded border border-slate-100 p-2">{b.status} · {b.service_id} · {new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(Number(b.subtotal_mxn)-Number(b.discount_mxn)+Number(b.tax_mxn))}</li>)}</ul>}
          <button type="button" disabled={realDataBusy} onClick={() => {setRealDataBusy(true);loadRealBudgets(accessToken,realCompanyId).catch(error=>setMessage(String(error))).finally(()=>setRealDataBusy(false));}} className="mt-2 text-xs font-semibold underline">Actualizar presupuestos reales</button>
        </div>
        <div className="mt-3 space-y-1">{realServices.length===0?<p className="text-slate-500">Todavía no hay expedientes reales.</p>:realServices.map(item=><p key={item.id} className="rounded-lg bg-white px-3 py-2">{item.reference} · {item.deceased_name || 'Sin nombre'} · {item.status}</p>)}</div>
        <button type="button" onClick={()=>{setRealDataBusy(true);loadRealServices(accessToken,realCompanyId).catch(error=>setMessage(String(error))).finally(()=>setRealDataBusy(false));}} disabled={realDataBusy} className="mt-3 text-xs font-semibold underline">Actualizar expedientes reales</button>
      </section>}
      {signedIn && <button type="button" onClick={()=>{setSignedIn(false);setAccessToken('');setAuthenticatedUserId('');setRealCompanyId('');setRealServices([]);setAuthorizedCompanies([]);setMessage('Verificación local finalizada. No se guardó una sesión persistente.');}} className="mt-3 underline">Cerrar sesión local</button>}
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
