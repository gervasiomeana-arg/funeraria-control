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

## Portal familiar pendiente de autorización

`proposals/` contiene una propuesta no conectada a la aplicación ni aplicada a Supabase. Habilitarla permitiría a terceros con un enlace consultar el nombre del fallecido, horarios y condolencias durante siete días, con revocación. No expone observaciones internas ni documentos. Su habilitación requiere autorización expresa para compartir esos datos fuera de una sesión autenticada. No ejecutar los SQL de `proposals/` como parte de las migraciones aprobadas.
