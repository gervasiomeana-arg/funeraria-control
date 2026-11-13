import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const url = process.env.TARGET_URL || 'https://funeraria-control.ai.studio';
const dir = 'test-results';
fs.mkdirSync(dir, { recursive: true });
const result = { url, checkedAt: new Date().toISOString(), status: 'pending', httpStatus: null, title: '', headingCount: 0, pageErrors: [], failedRequests: [], notes: [] };
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
  result.notes.push('Prueba publica sin credenciales: no verifica sesiones privadas ni transacciones.');
  await page.screenshot({ path: path.join(dir, 'captura.png'), fullPage: true });
  result.status = response?.ok() && result.pageErrors.length === 0 ? 'passed' : 'failed';
} catch (error) {
  result.status = 'failed';
  result.notes.push(error instanceof Error ? error.message : String(error));
} finally {
  await browser?.close();
  fs.writeFileSync(path.join(dir, 'informe.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
}
if (result.status !== 'passed') process.exitCode = 1;
