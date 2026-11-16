import { chromium } from 'playwright';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
try {
 const response=await page.goto('https://funeraria-control.ai.studio/',{waitUntil:'domcontentloaded',timeout:45000});
 if (!response || response.status()>=400) throw new Error('HTTP '+(response?.status()??'sin respuesta'));
 await page.waitForTimeout(3500);
 const body=await page.locator('body').innerText();
 if (!body.trim() || body.length<80) throw new Error('Pagina vacia o incompleta');
 const google=page.getByRole('button',{name:/google/i});
 if(await google.count()===0) throw new Error('No se encontro acceso Google visible');
 if(errors.length) throw new Error('Errores JavaScript: '+errors.join(' | '));
 console.log('PASS: pagina publica, contenido, boton Google y sin errores JS');
 console.log('NO VERIFICADO: OAuth real, prueba 48h, suscripcion, Supabase y CRUD autenticado');
} finally {await browser.close();}
