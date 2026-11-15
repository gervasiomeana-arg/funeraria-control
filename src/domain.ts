export type OperationalRecord = { id: string; module: string; title: string; details: Record<string, unknown>; created_at: string };
export type ServiceRecord = { id: string; reference: string; status: string; deceased_name: string | null; contact_name: string | null; notes: string | null };
export type BudgetRecord = { id: string; service_id: string; subtotal_mxn: number; discount_mxn: number; tax_mxn: number; status: string };
export type PaymentRecord = { id: string; budget_id: string; amount_mxn: number; method: string; reference: string | null };
export const currency = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
export const budgetTotal = (b: BudgetRecord) => Math.round((Number(b.subtotal_mxn) - Number(b.discount_mxn) + Number(b.tax_mxn)) * 100) / 100;
export const balanceFor = (b: BudgetRecord, payments: PaymentRecord[]) => Math.round((budgetTotal(b) - payments.filter(p => p.budget_id === b.id).reduce((a, p) => a + Number(p.amount_mxn), 0)) * 100) / 100;
export const localDay = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export function operationalError(module: string, fields: Record<string, string>, records: OperationalRecord[], editingId = ''): string {
  if (module === 'inventario') {
    if (!fields.sku?.trim()) return 'Indicá el código SKU.';
    for (const key of ['quantity', 'minimum']) if (!/^\d{1,9}$/.test(fields[key] || '')) return 'Existencias y mínimo deben ser enteros mayores o iguales a cero.';
  }
  if (module === 'agenda') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.date || '') || !/^([01]\d|2[0-3]):[0-5]\d$/.test(fields.time || '')) return 'Indicá fecha y hora de inicio.';
    if (fields.end_time && fields.end_time <= fields.time) return 'El cierre debe ser posterior al inicio del mismo día.';
    if (fields.resource) {
      if (!fields.end_time) return 'Indicá hora de cierre al reservar un recurso.';
      if (records.some(r => r.id !== editingId && r.module === 'agenda' && r.details.resource === fields.resource && r.details.date === fields.date && String(r.details.time || '00:00') < fields.end_time && String(r.details.end_time || '23:59') > fields.time)) return 'El recurso ya está reservado en ese horario.';
    }
  }
  return '';
}
export function csvCell(value: unknown): string {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export const csvRows = (rows: unknown[][]) => '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
