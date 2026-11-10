import React, { useState } from 'react';
import { ShieldCheck, Database, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DemoBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const { setCurrentView } = useApp();

  if (dismissed) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-900 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="font-medium">
          <strong>Modo Demostración Operativa:</strong> Los registros son ficticios para pruebas de gestión en México. Los datos están completamente aislados en memoria y la arquitectura está lista para desplegar en Supabase (PostgreSQL + RLS).
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setCurrentView('admin')}
          className="underline text-amber-800 hover:text-amber-950 font-medium flex items-center gap-1 text-[11px]"
        >
          <Database className="w-3 h-3" />
          <span>Ver Esquema SQL Supabase</span>
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 hover:text-amber-900 p-0.5 rounded"
          title="Ocultar aviso"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
