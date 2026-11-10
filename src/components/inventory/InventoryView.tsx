import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryItem } from '../../types';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  X,
  Package,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { inventory, adjustInventoryStock, addInventoryItem, activeCompany, activeBranchId } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

  // Nuevo item form
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('ataud');
  const [stockCurrent, setStockCurrent] = useState<number>(3);
  const [stockMinimum, setStockMinimum] = useState<number>(2);
  const [costPriceMxn, setCostPriceMxn] = useState<number>(8000);
  const [salePriceMxn, setSalePriceMxn] = useState<number>(16000);
  const [locationRack, setLocationRack] = useState('Almacén Central R-02');
  const [supplierName, setSupplierName] = useState('Proveedor Exequial de México');

  const filteredItems = inventory.filter((item) => {
    if (categoryFilter !== 'todos' && item.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.locationRack.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const lowStockItems = inventory.filter((i) => i.status === 'bajo_stock' || i.status === 'agotado');

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    addInventoryItem({
      companyId: activeCompany.id,
      branchId: activeBranchId === 'todas' ? 'br-roma' : activeBranchId,
      sku: sku.toUpperCase(),
      name,
      category,
      stockCurrent,
      stockMinimum,
      costPriceMxn,
      salePriceMxn,
      supplierName,
      locationRack,
      status: stockCurrent <= stockMinimum ? 'bajo_stock' : 'en_stock',
    });

    setIsNewItemModalOpen(false);
    setName('');
    setSku('');
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'ataud':
        return 'Ataúd';
      case 'urna':
        return 'Urna';
      case 'flor':
        return 'Flores / Arreglo';
      case 'insumo_tanatologico':
        return 'Insumo Tanatológico';
      case 'cafeteria':
        return 'Cafetería';
      default:
        return cat;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Módulo 6</span>
            <span aria-hidden="true">·</span>
            <span>Inventario y Control de Almacén</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Ataúdes, Urnas, Insumos y Suministros
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Control de existencias mínimas, reabastecimiento con proveedores y asignación a expedientes.
          </p>
        </div>

        <button
          onClick={() => setIsNewItemModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Alerta de Stock Bajo */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-300/80 rounded-xl p-4 flex items-start justify-between gap-4 text-xs text-amber-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm">
                Alerta de Reabastecimiento ({lowStockItems.length} productos con stock crítico)
              </h4>
              <p className="text-amber-800 text-xs mt-0.5">
                Los siguientes modelos están por debajo del inventario de seguridad requerido para operar servicios inmediatos:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {lowStockItems.map((it) => (
                  <span
                    key={it.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-[11px] font-medium text-slate-800"
                  >
                    <span>{it.name}</span>
                    <strong className="text-amber-700 font-mono">({it.stockCurrent} disp.)</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, SKU o estante de almacén..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-slate-500">Categoría:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium focus:outline-none"
          >
            <option value="todos">Todas las categorías</option>
            <option value="ataud">Ataúdes</option>
            <option value="urna">Urnas</option>
            <option value="insumo_tanatologico">Insumos Tanatológicos</option>
            <option value="cafeteria">Cafetería</option>
          </select>
        </div>
      </div>

      {/* Tabla de Inventario */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="p-3.5">SKU / Producto</th>
              <th className="p-3.5">Categoría</th>
              <th className="p-3.5">Ubicación</th>
              <th className="p-3.5 text-center">Stock Actual</th>
              <th className="p-3.5 text-right">Precio Venta MXN</th>
              <th className="p-3.5 text-center">Estatus</th>
              <th className="p-3.5 text-right">Ajuste Rápido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="p-3.5">
                  <span className="font-mono text-[10px] text-slate-400 block">{item.sku}</span>
                  <strong className="text-slate-900 font-semibold text-xs">{item.name}</strong>
                  {item.material && (
                    <span className="text-[11px] text-slate-500 block truncate max-w-xs">{item.material}</span>
                  )}
                </td>
                <td className="p-3.5 text-slate-700">{getCategoryLabel(item.category)}</td>
                <td className="p-3.5 text-slate-500 font-mono text-[11px]">{item.locationRack}</td>
                <td className="p-3.5 text-center tabular-nums">
                  <span className="font-bold text-slate-900 text-sm font-mono">{item.stockCurrent}</span>
                  <span className="text-[10px] text-slate-400 block">Mín: {item.stockMinimum}</span>
                </td>
                <td className="p-3.5 text-right tabular-nums font-mono font-medium text-slate-900">
                  ${item.salePriceMxn.toLocaleString('es-MX')}
                </td>
                <td className="p-3.5 text-center">
                  <span
                    className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                      item.status === 'en_stock'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'bajo_stock'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-red-100 text-red-900'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => adjustInventoryStock(item.id, -1)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs"
                      title="Salida de inventario (-1)"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => adjustInventoryStock(item.id, 1)}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-xs"
                      title="Entrada de inventario (+1)"
                    >
                      +1
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nuevo Producto */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Registrar Nuevo Producto en Inventario</h3>
              <button onClick={() => setIsNewItemModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Código SKU *</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Ej. ATA-PIN-04"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="ataud">Ataúd</option>
                    <option value="urna">Urna</option>
                    <option value="insumo_tanatologico">Insumo Tanatológico</option>
                    <option value="cafeteria">Cafetería</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Nombre o Descripción del Modelo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Ataúd Pino Rústico con Barniz Mate"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    value={stockCurrent}
                    onChange={(e) => setStockCurrent(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Stock Mínimo de Alerta</label>
                  <input
                    type="number"
                    value={stockMinimum}
                    onChange={(e) => setStockMinimum(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Precio Costo (MXN)</label>
                  <input
                    type="number"
                    value={costPriceMxn}
                    onChange={(e) => setCostPriceMxn(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Precio Venta (MXN)</label>
                  <input
                    type="number"
                    value={salePriceMxn}
                    onChange={(e) => setSalePriceMxn(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Ubicación / Estante</label>
                  <input
                    type="text"
                    value={locationRack}
                    onChange={(e) => setLocationRack(e.target.value)}
                    placeholder="Almacén Central R-04"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Proveedor Habitual</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewItemModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg shadow-sm"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
