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

const SupabaseConnectionPanel: React.FC<{ onAuthChange?: (authenticated: boolean) => void; activeView?: string }> = ({onAuthChange, activeView}) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Modo demostración: los expedientes todavía no se guardan en Supabase.');
  const [authorizedCompanies, setAuthorizedCompanies] = useState<string[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => { onAuthChange?.(signedIn); }, [signedIn, onAuthChange]);
  useEffect(() => { if (signedIn) setOpen(true); }, [signedIn]);
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
  const [budgetServiceId, setBudgetServiceId] = useState('');
  const [budgetSubtotal, setBudgetSubtotal] = useState('');
  const [budgetDiscount, setBudgetDiscount] = useState('0');
  const [budgetIvaRate, setBudgetIvaRate] = useState('16');
  const [paymentBudgetId, setPaymentBudgetId] = useState('');
  const [paymentAmountMxn, setPaymentAmountMxn] = useState('');
  const [paymentMethodReal, setPaymentMethodReal] = useState('transferencia_spei');
  const [paymentReferenceReal, setPaymentReferenceReal] = useState('');
  const [operationalModule, setOperationalModule] = useState<'agenda'|'familias'|'inventario'|'recursos'|'reportes'|'admin'>('agenda');
  useEffect(()=>{if (activeView && ['agenda','familias','inventario','recursos','reportes','admin'].includes(activeView)) {setOperationalModule(activeView as typeof operationalModule);setEditingOperationalId('');setOperationalTitle('');setOperationalDetails('');setOperationalFields({});}},[activeView]);
  const [operationalTitle, setOperationalTitle] = useState('');
  const [editingOperationalId, setEditingOperationalId] = useState('');
  const [operationalDetails, setOperationalDetails] = useState('');
  const [operationalFields,setOperationalFields] = useState<Record<string,string>>({});
  const moduleFields: Record<string,Array<{key:string;label:string;type?:string}>> = {
    agenda:[{key:'date',label:'Fecha',type:'date'},{key:'time',label:'Hora',type:'time'},{key:'service',label:'Expediente'},{key:'responsible',label:'Responsable'}],
    familias:[{key:'contact',label:'Contacto familiar'},{key:'phone',label:'Teléfono',type:'tel'},{key:'email',label:'Correo',type:'email'},{key:'service',label:'Expediente'}],
    inventario:[{key:'sku',label:'Código SKU'},{key:'quantity',label:'Existencias',type:'number'},{key:'minimum',label:'Stock mínimo',type:'number'},{key:'unit',label:'Unidad'}],
    recursos:[{key:'kind',label:'Tipo de recurso'},{key:'responsible',label:'Responsable'},{key:'availability',label:'Disponibilidad'},{key:'branch',label:'Sucursal'}],
    reportes:[{key:'period',label:'Período'},{key:'category',label:'Categoría'},{key:'author',label:'Elaborado por'}],
    admin:[{key:'setting',label:'Configuración'},{key:'value',label:'Valor'},{key:'responsible',label:'Responsable'}]
  };
  const [operationalRecords, setOperationalRecords] = useState<Array<{id:string;module:string;title:string;details:Record<string,unknown>;created_at:string}>>([]);
  const loadOperationalRecords = async (token:string, companyId:string) => {
    const response = await fetch(SUPABASE_URL+'/rest/v1/operational_records?select=id,module,title,details,created_at&company_id=eq.'+encodeURIComponent(companyId)+'&order=created_at.desc&limit=200',{headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+token}});
    if (!response.ok) throw new Error('No se pudieron consultar los módulos operativos (HTTP '+response.status+').');
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Respuesta inválida de módulos.');
    setOperationalRecords(rows);
  };
  const patchReal = async (table:string,id:string,payload:Record<string,unknown>) => {
    if (!accessToken || !realCompanyId) throw new Error('Sesión requerida');
    const response = await fetch(SUPABASE_URL+'/rest/v1/'+table+'?id=eq.'+encodeURIComponent(id)+'&company_id=eq.'+encodeURIComponent(realCompanyId),{
      method:'PATCH',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+accessToken,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Error al actualizar: HTTP '+response.status);
    const rows = await response.json();
    if (!Array.isArray(rows)||rows.length!==1) throw new Error('No se actualizó el registro. Revisá permisos.');
  };
  const [serviceStageDrafts,setServiceStageDrafts] = useState<Record<string,string>>({});
  const [editingServiceId,setEditingServiceId] = useState('');
  const [budgetStatusDrafts,setBudgetStatusDrafts] = useState<Record<string,string>>({});
  const saveServiceChanges = async (event:React.FormEvent) => {
    event.preventDefault();
    if (!editingServiceId) return;
    setRealDataBusy(true);
    try {await patchReal('funeral_services',editingServiceId,{reference:realReference.trim(),deceased_name:realDeceasedName.trim()});await loadRealServices(accessToken,realCompanyId);setEditingServiceId('');setRealReference('');setRealDeceasedName('');setMessage('Expediente actualizado.');}
    catch(error){setMessage(String(error));}finally{setRealDataBusy(false);}
  };
  const changeBudgetStatus = async (id:string,status:string) => {
    setRealDataBusy(true);
    try {await patchReal('budgets',id,{status});await loadRealBudgets(accessToken,realCompanyId);setBudgetStatusDrafts(prev=>{const next={...prev};delete next[id];return next;});setMessage('Presupuesto actualizado.');}
    catch(error){setBudgetStatusDrafts(prev=>{const next={...prev};delete next[id];return next;});setMessage(String(error));}finally{setRealDataBusy(false);}
  };
  const changeRealServiceStage = async (id:string,status:string) => {
    setRealDataBusy(true);
    try {await patchReal('funeral_services',id,{status});await loadRealServices(accessToken,realCompanyId);setServiceStageDrafts(prev=>{const next={...prev};delete next[id];return next;});setMessage('Etapa del expediente actualizada.');}
    catch(error){setServiceStageDrafts(prev=>{const next={...prev};delete next[id];return next;});setMessage(String(error));}finally{setRealDataBusy(false);}
  };
  const saveOperationalRecord = async (event:React.FormEvent) => {
    event.preventDefault();
    if (!accessToken || !realCompanyId || !operationalTitle.trim()) {setMessage('Iniciá sesión e indicá un título.');return;}
    setRealDataBusy(true);
    try {
      if (editingOperationalId) await patchReal('operational_records',editingOperationalId,{title:operationalTitle.trim(),details:{...operationalFields,description:operationalDetails.trim()},updated_at:new Date().toISOString()});
      else await requestReal('operational_records',accessToken,{company_id:realCompanyId,module:operationalModule,title:operationalTitle.trim(),details:{...operationalFields,description:operationalDetails.trim()}});
      await loadOperationalRecords(accessToken,realCompanyId);
      setOperationalTitle('');setOperationalDetails('');setOperationalFields({});setEditingOperationalId('');
      setMessage('Registro de '+operationalModule+' guardado en Supabase.');
    } catch(error){setMessage(error instanceof Error?error.message:String(error));}
    finally{setRealDataBusy(false);}
  };
  const [realPayments, setRealPayments] = useState<Array<{id:string;budget_id:string;amount_mxn:number;method:string;reference:string|null}>>([]);
  const money = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
  const requestReal = async (endpoint: string, token: string, payload: Record<string, unknown>) => {
    const response = await fetch(SUPABASE_URL + '/rest/v1/' + endpoint, {
      method: 'POST',
      headers: {apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', Prefer: 'return=minimal'},
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error('Supabase HTTP ' + response.status + ': ' + (details.message || 'No se pudo guardar.'));
    }
  };
  const loadRealPayments = async (token: string, companyId: string) => {
    const response = await fetch(SUPABASE_URL + '/rest/v1/budget_payments?select=id,budget_id,amount_mxn,method,reference&company_id=eq.' + encodeURIComponent(companyId) + '&limit=200', {
      headers: {apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: 'Bearer ' + token}
    });
    if (!response.ok) throw new Error('No se pudieron consultar los pagos reales (HTTP ' + response.status + ').');
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Respuesta inválida de pagos.');
    setRealPayments(rows);
  };
  const saveRealBudget = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken || !realCompanyId) { setMessage('Iniciá sesión para guardar un presupuesto real.'); return; }
    if (!realServices.some(service => service.id === budgetServiceId)) { setMessage('Seleccioná un expediente real de tu funeraria.'); return; }
    const subtotal = Number(budgetSubtotal), discount = Number(budgetDiscount), rate = Number(budgetIvaRate);
    if (![subtotal,discount,rate].every(Number.isFinite) || subtotal <= 0 || discount < 0 || discount > subtotal || rate < 0 || rate > 100) { setMessage('Revisá subtotal, descuento e IVA.'); return; }
    if ([subtotal,discount].some(value => Math.abs(value * 100 - Math.round(value * 100)) > 0.000001)) { setMessage('Los importes deben tener como máximo dos decimales.'); return; }
    setRealDataBusy(true);
    try {
      await requestReal('budgets', accessToken, {company_id: realCompanyId, service_id: budgetServiceId, subtotal_mxn: money(subtotal), discount_mxn: money(discount), tax_mxn: money((subtotal-discount)*rate/100), status: 'draft'});
      await loadRealBudgets(accessToken, realCompanyId);
      setBudgetSubtotal('');
      setBudgetDiscount('0');
      setMessage('Presupuesto real guardado en Supabase.');
    } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); }
    finally { setRealDataBusy(false); }
  };
  const saveRealPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken || !realCompanyId) { setMessage('Iniciá sesión para registrar un abono.'); return; }
    const budget = realBudgets.find(item => item.id === paymentBudgetId);
    if (!budget) { setMessage('Seleccioná un presupuesto real.'); return; }
    const amount = Number(paymentAmountMxn);
    const total = money(Number(budget.subtotal_mxn)-Number(budget.discount_mxn)+Number(budget.tax_mxn));
    const paid = money(realPayments.filter(item=>item.budget_id===budget.id).reduce((sum,item)=>sum+Number(item.amount_mxn),0));
    if (!Number.isFinite(amount) || amount <= 0 || Math.abs(amount*100-Math.round(amount*100))>0.000001 || money(amount)>money(total-paid)) { setMessage('El abono debe ser positivo, con máximo dos decimales y no superar el saldo.'); return; }
    if (!['efectivo','tarjeta_debito','tarjeta_credito','transferencia_spei'].includes(paymentMethodReal)) { setMessage('Método de pago inválido.'); return; }
    setRealDataBusy(true);
    try {
      await requestReal('budget_payments',accessToken,{company_id:realCompanyId,budget_id:budget.id,amount_mxn:money(amount),method:paymentMethodReal,reference:paymentReferenceReal.trim()||null});
      await loadRealPayments(accessToken,realCompanyId);
      setPaymentAmountMxn('');
      setPaymentReferenceReal('');
      setMessage('Abono real registrado y recuperado de Supabase.');
    } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); }
    finally { setRealDataBusy(false); }
  };
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
        setAccessToken('');
        setAuthenticatedUserId('');
        setRealCompanyId('');
        setRealServices([]);
        setRealBudgets([]);
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
      const loadResults = await Promise.allSettled([
        loadRealServices(data.access_token, memberships[0].company_id),
        loadRealBudgets(data.access_token, memberships[0].company_id),
        loadRealPayments(data.access_token, memberships[0].company_id),
        loadOperationalRecords(data.access_token, memberships[0].company_id)
      ]);
      const loadErrors = loadResults.flatMap((result, index) =>
        result.status === 'rejected' ? [(['Expedientes: ','Presupuestos: ','Pagos: ','Módulos: '][index] || 'Datos: ') + (result.reason instanceof Error ? result.reason.message : 'Error de consulta.')] : []
      );
      if (loadResults[0].status === 'rejected') setRealServices([]);
      if (loadResults[1].status === 'rejected') setRealBudgets([]);
      if (loadResults[2].status === 'rejected') setRealPayments([]);
      if (loadResults[3].status === 'rejected') setOperationalRecords([]);
      setPassword('');
      setMessage(loadErrors.length ? 'Sesión verificada, pero falló la consulta de datos reales. ' + loadErrors.join(' ') : 'Identidad y membresía verificadas en Supabase. Los registros consultados corresponden a la funeraria autorizada.');
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
        {activeView==='dashboard' && <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4"><strong className="block text-2xl">{realServices.length}</strong><span>Expedientes reales consultados</span></div>
          <div className="rounded-lg bg-white p-4"><strong className="block text-2xl">{realBudgets.length}</strong><span>Presupuestos reales consultados</span></div>
          <div className="rounded-lg bg-white p-4"><strong className="block text-2xl">{realPayments.length}</strong><span>Abonos reales consultados</span></div>
        </div>}
        {activeView==='reportes' && <div className="mb-4 rounded-lg bg-white p-4">
          <h3 className="font-semibold">Informe operativo — registros reales cargados</h3>
          <p>Expedientes: {realServices.length} · Presupuestos: {realBudgets.length} · Pagos: {realPayments.length} · Registros operativos: {operationalRecords.length}</p>
          <p className="mt-2 text-xs text-slate-500">Indicadores calculados sobre los registros recuperados, no sobre la totalidad histórica cuando la consulta está limitada.</p>
          <button type="button" disabled={realDataBusy} onClick={()=>{setRealDataBusy(true);Promise.all([loadRealServices(accessToken,realCompanyId),loadRealBudgets(accessToken,realCompanyId),loadRealPayments(accessToken,realCompanyId),loadOperationalRecords(accessToken,realCompanyId)]).catch(error=>setMessage(String(error))).finally(()=>setRealDataBusy(false));}} className="mt-2 rounded bg-[#173a3e] px-3 py-2 text-white">Actualizar indicadores</button>
        </div>}
        {(activeView === 'servicios' || activeView === 'dashboard') && <div><h3 className="font-semibold">Expedientes reales — Supabase</h3>
        <p className="mt-1 text-[11px] text-slate-600">Área separada de los expedientes ficticios. Los registros nuevos se guardan en la base de datos de tu funeraria.</p>
        <form onSubmit={editingServiceId?saveServiceChanges:saveRealService} className="mt-3 flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1">Folio<input required maxLength={80} value={realReference} onChange={event=>setRealReference(event.target.value)} className="rounded-lg border border-slate-300 p-2"/></label>
          <label className="flex min-w-52 flex-col gap-1">Nombre del fallecido<input required maxLength={160} value={realDeceasedName} onChange={event=>setRealDeceasedName(event.target.value)} className="rounded-lg border border-slate-300 p-2"/></label>
          <button type="submit" disabled={realDataBusy} className="rounded-lg bg-[#173a3e] px-4 py-2 text-white disabled:opacity-50">{realDataBusy?'Guardando…':editingServiceId?'Guardar cambios':'Guardar en Supabase'}</button>
        </form>
        </div>}
        {(activeView === 'presupuestos' || activeView === 'dashboard') && <div><form onSubmit={saveRealBudget} className="mt-4 rounded-lg border border-slate-200 bg-white p-3 space-y-2">
          <h3 className="font-semibold">Nuevo presupuesto real — Supabase</h3>
          <label className="block text-sm">Expediente real
            <select required value={budgetServiceId} onChange={event=>setBudgetServiceId(event.target.value)} className="block w-full rounded border p-2">
              <option value="">Seleccionar expediente</option>
              {realServices.map(service=><option key={service.id} value={service.id}>{service.reference} · {service.deceased_name}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <label className="text-sm">Subtotal MXN<input required type="number" min="0.01" step="0.01" value={budgetSubtotal} onChange={event=>setBudgetSubtotal(event.target.value)} className="block w-full rounded border p-2"/></label>
            <label className="text-sm">Descuento MXN<input required type="number" min="0" step="0.01" value={budgetDiscount} onChange={event=>setBudgetDiscount(event.target.value)} className="block w-full rounded border p-2"/></label>
            <label className="text-sm">IVA %<input required type="number" min="0" max="100" step="0.01" value={budgetIvaRate} onChange={event=>setBudgetIvaRate(event.target.value)} className="block w-full rounded border p-2"/></label>
          </div>
          <button type="submit" disabled={realDataBusy || realServices.length===0} className="rounded bg-[#173a3e] px-4 py-2 text-white disabled:opacity-50">Guardar presupuesto real</button>
        </form>
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
          <h3 className="font-semibold">Presupuestos reales</h3>
          <p className="mt-1 text-slate-500">Presupuestos registrados en Supabase para esta funeraria.</p>
          {realBudgets.length === 0 ? <p className="mt-2 text-slate-500">No hay presupuestos reales registrados.</p> : <ul className="mt-2 space-y-1">{realBudgets.map(b => <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-100 p-2"><span>{b.service_id} · {new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(Number(b.subtotal_mxn)-Number(b.discount_mxn)+Number(b.tax_mxn))}</span><select disabled={realDataBusy} value={budgetStatusDrafts[b.id]||b.status} onChange={event=>{setBudgetStatusDrafts(prev=>({...prev,[b.id]:event.target.value}));void changeBudgetStatus(b.id,event.target.value);}} className="rounded border p-2">{['draft','pending','approved','paid','cancelled'].map(status=><option key={status} value={status}>{status}</option>)}</select></li>)}</ul>}
          <button type="button" disabled={realDataBusy} onClick={() => {setRealDataBusy(true);Promise.all([loadRealBudgets(accessToken,realCompanyId),loadRealPayments(accessToken,realCompanyId)]).catch(error=>setMessage(String(error))).finally(()=>setRealDataBusy(false));}} className="mt-2 text-xs font-semibold underline">Actualizar presupuestos reales</button>
        </div>
        </div>}
        {(['agenda','familias','inventario','recursos','reportes','admin'].includes(activeView || '')) && <section className="mt-4 rounded-lg border border-slate-200 bg-white p-3 space-y-3">
          <h3 className="font-semibold">Registros reales de otros módulos — Supabase</h3>
          <p className="text-xs text-slate-600">Agenda, familias, inventario, personal y recursos, reportes y administración. Los registros están aislados por funeraria.</p>
          <form onSubmit={saveOperationalRecord} className="space-y-2">
            <label className="block text-sm">Módulo<select value={operationalModule} onChange={event=>setOperationalModule(event.target.value as typeof operationalModule)} className="block w-full rounded border p-2">
              {([activeView] as string[]).filter(module=>moduleFields[module]).map(module=><option key={module} value={module}>{module}</option>)}
            </select></label>
            <label className="block text-sm">Título<input required value={operationalTitle} onChange={event=>setOperationalTitle(event.target.value)} className="block w-full rounded border p-2"/></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{(moduleFields[operationalModule]||[]).map(field=><label key={field.key} className="block text-sm">{field.label}<input type={field.type||'text'} value={operationalFields[field.key]||''} onChange={event=>setOperationalFields(prev=>({...prev,[field.key]:event.target.value}))} className="block w-full rounded border p-2"/></label>)}</div>
            <label className="block text-sm">Descripción<textarea value={operationalDetails} onChange={event=>setOperationalDetails(event.target.value)} className="block w-full rounded border p-2"/></label>
            <button type="submit" disabled={realDataBusy} className="rounded bg-[#173a3e] px-4 py-2 text-white disabled:opacity-50">{editingOperationalId?'Guardar cambios':'Guardar registro real'}</button>
          </form>
          <button type="button" disabled={realDataBusy} onClick={()=>{setRealDataBusy(true);loadOperationalRecords(accessToken,realCompanyId).catch(error=>setMessage(String(error))).finally(()=>setRealDataBusy(false));}} className="text-xs font-semibold underline">Actualizar registros reales</button>
          <div className="max-h-48 overflow-y-auto space-y-1">{operationalRecords.filter(item=>item.module===activeView).map(item=><div key={item.id} className="flex justify-between gap-2 rounded bg-slate-50 px-2 py-1 text-xs"><span><strong>{item.module}</strong> · {item.title} · {String(item.details?.description||'')}</span><button type="button" className="underline" onClick={()=>{setEditingOperationalId(item.id);setOperationalModule(item.module as typeof operationalModule);setOperationalTitle(item.title);setOperationalDetails(String(item.details?.description||''));setOperationalFields(Object.fromEntries(Object.entries(item.details||{}).filter(([key])=>key!=='description').map(([key,value])=>[key,String(value??'')])));}}>Editar</button></div>)}</div>
        </section>}
        {(activeView === 'presupuestos' || activeView === 'dashboard') && <form onSubmit={saveRealPayment} className="mt-4 rounded-lg border border-slate-200 bg-white p-3 space-y-2">
          <h3 className="font-semibold">Registrar abono real — Supabase</h3>
          <label className="block text-sm">Presupuesto
            <select required value={paymentBudgetId} onChange={event=>setPaymentBudgetId(event.target.value)} className="block w-full rounded border p-2">
              <option value="">Seleccionar presupuesto</option>
              {realBudgets.map(budget=>{const total=money(Number(budget.subtotal_mxn)-Number(budget.discount_mxn)+Number(budget.tax_mxn));const paid=money(realPayments.filter(p=>p.budget_id===budget.id).reduce((sum,p)=>sum+Number(p.amount_mxn),0));return <option key={budget.id} value={budget.id}>{budget.service_id} · Saldo MXN {money(total-paid).toFixed(2)}</option>;})}
            </select>
          </label>
          <label className="block text-sm">Abono MXN<input required type="number" min="0.01" step="0.01" value={paymentAmountMxn} onChange={event=>setPaymentAmountMxn(event.target.value)} className="block w-full rounded border p-2"/></label>
          <label className="block text-sm">Método<select value={paymentMethodReal} onChange={event=>setPaymentMethodReal(event.target.value)} className="block w-full rounded border p-2"><option value="transferencia_spei">Transferencia SPEI</option><option value="efectivo">Efectivo</option><option value="tarjeta_debito">Débito</option><option value="tarjeta_credito">Crédito</option></select></label>
          <label className="block text-sm">Referencia<input value={paymentReferenceReal} onChange={event=>setPaymentReferenceReal(event.target.value)} className="block w-full rounded border p-2"/></label>
          <button type="submit" disabled={realDataBusy || realBudgets.length===0} className="rounded bg-[#173a3e] px-4 py-2 text-white disabled:opacity-50">Registrar abono real</button>
        </form>}
        {(activeView === 'servicios' || activeView === 'dashboard') && <div>
        <div className="mt-3 space-y-1">{realServices.length===0?<p className="text-slate-500">Todavía no hay expedientes reales.</p>:realServices.map(item=><p key={item.id} className="rounded-lg bg-white px-3 py-2">{item.reference} · {item.deceased_name || 'Sin nombre'} · {item.status}</p>)}</div>
        <button type="button" onClick={()=>{setRealDataBusy(true);loadRealServices(accessToken,realCompanyId).catch(error=>setMessage(String(error))).finally(()=>setRealDataBusy(false));}} disabled={realDataBusy} className="mt-3 text-xs font-semibold underline">Actualizar expedientes reales</button></div>}
      </section>}
      {signedIn && <button type="button" onClick={()=>{setSignedIn(false);setAccessToken('');setAuthenticatedUserId('');setRealCompanyId('');setRealServices([]);setRealBudgets([]);setRealPayments([]);setOperationalRecords([]);setAuthorizedCompanies([]);setMessage('Verificación local finalizada. No se guardó una sesión persistente.');}} className="mt-3 underline">Cerrar sesión local</button>}
      <p className="mt-3 text-[11px] text-slate-500">La sesión no se guarda en este dispositivo. Los registros reales se consultan y guardan en Supabase según los permisos de la funeraria.</p>
    </div>}
  </div>;
};

const MainLayout: React.FC = () => {
  const { currentView, toastMessage } = useApp();
  const [realMode, setRealMode] = useState(false);

  return (
    <div className="fc-premium-shell min-h-screen flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Bar Navigation */}
      <Header />



      {/* Demo Banner */}
      {!realMode && <DemoBanner />}

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Content Viewport */}
        <main className="fc-premium-main flex-1 p-4 md:p-8 mx-auto w-full overflow-x-hidden">
          <SupabaseConnectionPanel onAuthChange={setRealMode} activeView={currentView} />
          {realMode && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">Sesión real activa: elegí un módulo en el menú para gestionar sus registros Supabase desde el área de conexión superior.</p>}
          {!realMode && <>
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'servicios' && <ServicesView />}
          {currentView === 'agenda' && <ScheduleView />}
          {currentView === 'familias' && <FamilyPortalView />}
          {currentView === 'presupuestos' && <BudgetsView />}
          {currentView === 'inventario' && <InventoryView />}
          {currentView === 'recursos' && <ResourcesView />}
          {currentView === 'reportes' && <ReportsView />}
          {currentView === 'admin' && <AdminView />}
          </>}
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
