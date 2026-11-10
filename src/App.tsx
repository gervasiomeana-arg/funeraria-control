import React from 'react';
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

const MainLayout: React.FC = () => {
  const { currentView, toastMessage } = useApp();

  return (
    <div className="fc-premium-shell min-h-screen flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Bar Navigation */}
      <Header />

      {/* Demo Banner */}
      <DemoBanner />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Content Viewport */}
        <main className="fc-premium-main flex-1 p-4 md:p-8 mx-auto w-full overflow-x-hidden">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'servicios' && <ServicesView />}
          {currentView === 'agenda' && <ScheduleView />}
          {currentView === 'familias' && <FamilyPortalView />}
          {currentView === 'presupuestos' && <BudgetsView />}
          {currentView === 'inventario' && <InventoryView />}
          {currentView === 'recursos' && <ResourcesView />}
          {currentView === 'reportes' && <ReportsView />}
          {currentView === 'admin' && <AdminView />}
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
