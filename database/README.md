# Operación conectada

Las siguientes migraciones aditivas ya se aplicaron al proyecto `funeraria-control`:

- `enforce_operational_integrity_and_stage_audit`: stock, reservas, importes, bitácora automática y coherencia de estados.
- `service_documents_and_operational_audit`: lista de documentación y auditoría de registros operativos.
- `preserve_linked_service_references`: impide cambiar un folio con referencias existentes.

Los SQL de esta carpeta documentan el esquema aplicado. No volver a ejecutarlos enteros sobre el proyecto sin revisar los triggers y políticas existentes.

No se borraron ni reconstruyeron datos anteriores. La bitácora comienza con las transiciones nuevas, no inventa eventos del pasado. Las funciones de trigger usan el rol de quien escribe y no evitan RLS.

Los anticipos pueden registrarse sobre borradores. La aprobación comercial se conserva por separado; los saldos se calculan con el registro de pagos. El servidor impide sobrepagos y marcar como liquidado con saldo pendiente. Los reintentos del mismo abono conservan un ID de operación.

La agenda permite reservas dentro del mismo día, con cierre posterior al inicio. El servidor serializa las reservas de un mismo recurso y rechaza cruces de horario. El calendario muestra días reales del mes elegido.

La documentación es una lista de recepción y revisión, no un almacenamiento de documentos escaneados. No se aprueba ningún documento por defecto.

## Verificaciones realizadas

- `npm run lint`: TypeScript.
- `npm test`: validación de inventario, conflictos de recursos, aritmética y CSV.
- `npm run build`: compilación de producción.
- Pruebas SQL bajo rol `authenticated`, usando una membresía owner del expediente ficticio QA-20261114-01. Se verificaron rechazo de stock negativo, creación de bitácora, rechazo de sobrepagos, rechazo de liquidación con saldo, conflicto de reservas y revisión de documentos. Las transacciones de prueba se revirtieron completas.

Después de actualizar GitHub, sincronizar la versión en AI Studio y publicar. Verificar la interfaz publicada antes de declarar terminada la validación de los nueve módulos.

## Portal familiar autorizado

El propietario autorizó expresamente compartir nombre del fallecido, horarios y condolencias con quienes reciban un enlace privado, sin sesión. La migración `authorized_expiring_family_portal` está aplicada. Los enlaces tienen siete días de vigencia, pueden revocarse y se guardan en la base solo como hash. Las observaciones internas y la documentación no forman parte de la respuesta pública. Solo owner/manager puede generar o revocar enlaces. No se envían automáticamente a ninguna persona.

Los RPC públicos tienen acceso limitado a un único portal mediante el código. Los visitantes no pueden consultar directamente las tablas. Nunca insertar una clave de servicio en la aplicación.

Los avisos del asesor sobre funciones SECURITY DEFINER públicas son intencionales para estos dos RPC de acceso por código: cada llamada valida hash, habilitación y vencimiento y devuelve solo los campos autorizados. No se conceden políticas de lectura anónima sobre las tablas. family_condolences carece de políticas a propósito: solo esos RPC acceden a ella. Se probaron tanto el acceso directo denegado como los códigos inválidos, vencidos y revocados. No cambiar esas funciones por una lectura anónima general de tablas.

## Ingreso con Google y registro privado de usuarios

Migración aplicada: `google_visitor_registry_private_admin` (archivo `google_administration.sql`). Los datos operativos requieren una sesión OAuth de Google además de las políticas existentes por empresa. Un visitante nuevo queda registrado sin obtener acceso a una empresa ajena; verá que su habilitación está pendiente.

`fc_register_google_user` toma la identidad del JWT validado y comprueba la sesión en el servidor. Cuenta una sola vez cada sesión, conserva los ingresos anteriores y actualiza el último acceso. El registro está en `fc_private`, sin permisos directos para clientes.

`fc_admin_users` exige el usuario administrador configurado, sesión de Google y verificación bcrypt de la clave. Cinco errores bloquean por quince minutos. La clave se provisionó por separado: no está en estos SQL ni en el navegador. Solo se devuelve el registro tras verificar todas las condiciones. La pantalla se bloquea al salir, recargar o transcurridos diez minutos. Los registros de configuración existentes se conservan.

Los avisos del asesor sobre estos dos RPC SECURITY DEFINER autenticados son intencionales: necesitan acceso restringido al esquema privado y contienen comprobaciones explícitas de identidad/sesión. No se concede ejecución anónima. Las tablas privadas tienen RLS y ningún permiso ni política de acceso directo. La prueba `tests/admin-access.sql`, revertida íntegramente, validó clave correcta/incorrecta, bloqueo, rechazo de sesión por contraseña y registro sin duplicación al recargar. El acceso familiar mediante enlace autorizado continúa separado.
