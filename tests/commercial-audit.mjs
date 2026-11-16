import { readFileSync } from 'node:fs';
const app=readFileSync('src/App.tsx','utf8');
const checks=[
 ['Google OAuth', /provider=google/.test(app)],
 ['Registro de ingreso Google', /fc_register_google_user/.test(app)],
 ['Prueba de 48 horas aplicada', /trial_expires_at|trial_end_at|trial_ends_at|trialEndsAt/.test(app)],
 ['Bloqueo de acceso por suscripcion vencida', /subscription_status|subscription_expires_at|subscriptionEndsAt/.test(app)],
 ['Precio de suscripcion USD 50', /(?:USD|US\\$|U\\$S)\\s*50|50\\s*(?:USD|dolares)/i.test(app)],
 ['Solicitud comercial por correo', /mailto:/.test(app)]
];
console.log('\nAUDITORIA COMERCIAL ESTATICA (NO MODIFICA DATOS)');
for(const [name,ok] of checks)console.log((ok?'INDICIO EN CODIGO':'NO ENCONTRADO')+' - '+name);
console.log('Nota: esta inspeccion NO valida reglas RLS, RPC, configuracion Supabase ni pagos reales.');
