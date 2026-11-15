import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const url = process.env.TARGET_URL || 'https://funeraria-control.ai.studio';
const dir = 'test-results';
const reportName = (process.env.REPORT_NAME || 'prueba').replace(/[^a-z0-9_-]/gi, '-');
fs.mkdirSync(dir, { recursive: true });
const result = { url, checkedAt: new Date().toISOString(), status: 'pending', httpStatus: null, title: '', headingCount: 0, pageErrors: [], failedRequests: [], modules: [], readiness: { demoMode: null, realServicesVisible: null, realBudgetsReadOnly: null, productionReady: false }, notes: [] };
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', e => result.pageErrors.push(e.message));
  page.on('requestfailed', req => result.failedRequests.push({ url: req.url(), reason: req.failure()?.errorText }));
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  result.httpStatus = response?.status() ?? null;
  await page.waitForTimeout(2500);
  result.title = await page.title();
  result.headingCount = await page.locator('h1,h2').count();
  result.readiness.demoMode = await page.getByText('Modo Demostración Operativa', { exact: false }).count() > 0;
  result.readiness.realServicesVisible = await page.getByText('Expedientes reales', { exact: false }).count() > 0;
  result.readiness.realBudgetsReadOnly = await page.getByText('Presupuestos reales (solo lectura)', { exact: false }).count() > 0;
  const modules = ['Inicio', 'Servicios', 'Agenda', 'Familias', 'Presupuestos', 'Inventario', 'Personal y recursos', 'Reportes', 'Administración'];
  for (const moduleName of modules) {
    const nav = page.getByRole('navigation', {name:'Módulos de gestión'}).getByRole('button', {name:moduleName,exact:true});
    const item = { name: moduleName, visible: false, clicked: false, bodyHasContent: false, error: null };
    try {
      item.visible = await nav.isVisible();
      if (!item.visible) throw new Error('Módulo no visible en el menú');
      await nav.click({ timeout: 8000 });
      item.clicked = true;
      await page.waitForTimeout(200);
      item.bodyHasContent = (await page.locator('main').innerText().catch(() => '')) .trim().length > 30;
      if (!item.bodyHasContent) throw new Error('El módulo no muestra contenido principal');
    } catch (e) { item.error = e instanceof Error ? e.message : String(e); }
    result.modules.push(item);
  }
  if (reportName === 'local') {
    await page.goto(url.replace(/\/$/, '') + '/#family=00000000-0000-4000-8000-000000000099', {waitUntil:'domcontentloaded'});
    await page.getByText('El enlace es inválido, está vencido o fue revocado.', {exact:true}).waitFor({timeout:15000});
    if (await page.getByRole('heading', {name:'Libro de condolencias',exact:true}).count()) throw new Error('Un enlace inválido mostró el formulario familiar.');
    result.notes.push('Portal familiar: código inválido rechazado, sin formulario ni datos de expediente.');
  }
  result.notes.push('Prueba pública sin credenciales: navegación de 9 módulos; no verifica sesiones privadas ni transacciones.');
  if (result.readiness.demoMode) result.notes.push('NO APTO PARA PRODUCCION: la interfaz sigue indicando modo demostración; no certificar datos ni operaciones reales.');
  result.readiness.productionReady = false;
  await page.screenshot({ path: path.join(dir, 'captura-' + reportName + '.png'), fullPage: true });
  result.status = response?.ok() && result.pageErrors.length === 0 && result.headingCount > 0 && result.modules.every(m => m.clicked && m.bodyHasContent) ? 'passed' : 'failed';
} catch (error) {
  result.status = 'failed';
  result.notes.push(error instanceof Error ? error.message : String(error));
} finally {
  await browser?.close();
  fs.writeFileSync(path.join(dir, 'informe-' + reportName + '.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
}
if (result.status !== 'passed') process.exitCode = 1;

