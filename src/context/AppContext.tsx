import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Company,
  Branch,
  UserProfile,
  FuneralService,
  Room,
  Vehicle,
  StaffMember,
  ExternalProvider,
  Budget,
  InventoryItem,
  FamilyCondolence,
  OperationalAlert,
  ServiceStageKey,
  UserRole,
} from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_BRANCHES,
  INITIAL_USERS,
  INITIAL_SERVICES,
  INITIAL_ROOMS,
  INITIAL_VEHICLES,
  INITIAL_STAFF,
  INITIAL_PROVIDERS,
  INITIAL_BUDGETS,
  INITIAL_INVENTORY,
  INITIAL_CONDOLENCES,
  INITIAL_ALERTS,
} from '../data/mockData';

export type MainViewKey =
  | 'dashboard'
  | 'servicios'
  | 'agenda'
  | 'familias'
  | 'presupuestos'
  | 'inventario'
  | 'recursos'
  | 'reportes'
  | 'admin';

interface AppContextType {
  // Navigation & Role
  currentView: MainViewKey;
  setCurrentView: (view: MainViewKey) => void;
  currentUser: UserProfile;
  setCurrentUserRole: (role: UserRole) => void;
  activeCompany: Company;
  setActiveCompanyId: (id: string) => void;
  companies: Company[];
  updateCompanyStatus: (id: string, status: 'activa' | 'prueba' | 'suspendida') => void;
  branches: Branch[];
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;

  // Services
  services: FuneralService[];
  selectedService: FuneralService | null;
  setSelectedService: (service: FuneralService | null) => void;
  createService: (newService: Omit<FuneralService, 'createdAt' | 'updatedAt' | 'history'>) => void;
  updateServiceStage: (serviceId: string, nextStage: ServiceStageKey, note?: string) => void;
  updateServiceDetails: (serviceId: string, updates: Partial<FuneralService>) => void;
  updateDocumentStatus: (serviceId: string, docId: string, status: 'aprobado' | 'en_revision' | 'pendiente') => void;

  // Resources
  rooms: Room[];
  updateRoomStatus: (roomId: string, status: Room['status']) => void;
  vehicles: Vehicle[];
  updateVehicleStatus: (vehicleId: string, status: Vehicle['status']) => void;
  staff: StaffMember[];
  providers: ExternalProvider[];

  // Budgets & Payments
  budgets: Budget[];
  createBudget: (budget: Omit<Budget, 'createdAt' | 'updatedAt'>) => void;
  addPaymentToBudget: (budgetId: string, amount: number, method: 'efectivo' | 'tarjeta_debito' | 'tarjeta_credito' | 'transferencia_spei', reference: string) => void;

  // Inventory
  inventory: InventoryItem[];
  adjustInventoryStock: (itemId: string, delta: number) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;

  // Family Portal
  condolences: FamilyCondolence[];
  addCondolence: (serviceId: string, authorName: string, relationship: string, message: string, candle: boolean) => void;

  // Alerts
  alerts: OperationalAlert[];
  dismissAlert: (alertId: string) => void;

  // UI Modals
  isNewServiceModalOpen: boolean;
  setIsNewServiceModalOpen: (open: boolean) => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  viewingFamilyServiceCode: string | null;
  setViewingFamilyServiceCode: (code: string | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<MainViewKey>('dashboard');
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [activeCompanyId, setActiveCompanyIdState] = useState<string>('comp-santa-maria');
  const [branches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [activeBranchId, setActiveBranchId] = useState<string>('todas');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);

  const [services, setServices] = useState<FuneralService[]>(INITIAL_SERVICES);
  const [selectedService, setSelectedService] = useState<FuneralService | null>(null);

  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [staff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [providers] = useState<ExternalProvider[]>(INITIAL_PROVIDERS);

  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [condolences, setCondolences] = useState<FamilyCondolence[]>(INITIAL_CONDOLENCES);
  const [alerts, setAlerts] = useState<OperationalAlert[]>(INITIAL_ALERTS);

  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [viewingFamilyServiceCode, setViewingFamilyServiceCode] = useState<string | null>('VAL-7890');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const activeCompany = companies.find((c) => c.id === activeCompanyId) || companies[0];

  const setActiveCompanyId = (id: string) => {
    setActiveCompanyIdState(id);
    const targetComp = companies.find((c) => c.id === id);
    if (targetComp) {
      showToast(`Empresa activa: ${targetComp.name}`);
    }
  };

  const updateCompanyStatus = (id: string, status: 'activa' | 'prueba' | 'suspendida') => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    showToast(`Estado de la funeraria actualizado a: ${status.toUpperCase()}`);
  };

  const setCurrentUserRole = (role: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role,
      name:
        role === 'superadmin'
          ? 'Ing. Rodrigo Salinas (Propietario SaaS)'
          : role === 'admin_funeraria'
          ? 'Lic. Fernando Garza (Director General)'
          : role === 'gerente'
          ? 'Lic. Roberto Morales (Gerente Operativo)'
          : role === 'recepcionista'
          ? 'Valeria Montes (Recepción y Trámites)'
          : 'Dra. Silvia Carrillo (Tanatopraxia y Salas)',
    }));
    showToast(`Rol conmutado a: ${role.replace('_', ' ').toUpperCase()}`);
  };

  const createService = (newServiceData: Omit<FuneralService, 'createdAt' | 'updatedAt' | 'history'>) => {
    const nowIso = new Date().toISOString();
    const newService: FuneralService = {
      ...newServiceData,
      createdAt: nowIso,
      updatedAt: nowIso,
      history: [
        {
          id: `h-${Date.now()}`,
          stage: newServiceData.currentStage || 'nuevo',
          timestamp: nowIso,
          userName: currentUser.name,
          userRole: currentUser.role,
          note: 'Apertura de expediente y registro inicial en plataforma.',
        },
      ],
    };

    setServices((prev) => [newService, ...prev]);

    // If room assigned, mark it as reserved or occupied
    if (newService.roomId) {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === newService.roomId
            ? {
                ...r,
                status: 'ocupada',
                currentServiceId: newService.id,
                currentServiceDeceasedName: newService.deceased.fullName,
              }
            : r
        )
      );
    }

    // If vehicle assigned, mark it
    if (newService.vehicleId) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === newService.vehicleId
            ? {
                ...v,
                status: 'en_servicio',
                currentServiceId: newService.id,
                currentDestination: newService.destinationPlace,
              }
            : v
        )
      );
    }

    showToast(`Expediente ${newService.id} creado con éxito.`);
  };

  const updateServiceStage = (serviceId: string, nextStage: ServiceStageKey, note?: string) => {
    const nowIso = new Date().toISOString();
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== serviceId) return s;
        const newHistoryItem = {
          id: `h-${Date.now()}`,
          stage: nextStage,
          timestamp: nowIso,
          userName: currentUser.name,
          userRole: currentUser.role,
          note: note || `Transición a etapa: ${nextStage}`,
        };
        return {
          ...s,
          currentStage: nextStage,
          updatedAt: nowIso,
          history: [...s.history, newHistoryItem],
        };
      })
    );

    // If finalized, liberate resources
    if (nextStage === 'finalizado') {
      setRooms((prev) =>
        prev.map((r) =>
          r.currentServiceId === serviceId
            ? { ...r, status: 'disponible', currentServiceId: undefined, currentServiceDeceasedName: undefined }
            : r
        )
      );
      setVehicles((prev) =>
        prev.map((v) =>
          v.currentServiceId === serviceId
            ? { ...v, status: 'disponible', currentServiceId: undefined, currentDestination: undefined }
            : v
        )
      );
    }

    showToast(`Expediente ${serviceId} actualizado a etapa: ${nextStage.toUpperCase()}`);
  };

  const updateServiceDetails = (serviceId: string, updates: Partial<FuneralService>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s))
    );
    showToast(`Expediente ${serviceId} actualizado.`);
  };

  const updateDocumentStatus = (
    serviceId: string,
    docId: string,
    status: 'aprobado' | 'en_revision' | 'pendiente'
  ) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== serviceId) return s;
        const updatedDocs = s.documents.map((d) =>
          d.id === docId ? { ...d, status, updatedAt: new Date().toISOString() } : d
        );
        return { ...s, documents: updatedDocs, updatedAt: new Date().toISOString() };
      })
    );
    showToast(`Documento marcado como: ${status.replace('_', ' ').toUpperCase()}`);
  };

  const updateRoomStatus = (roomId: string, status: Room['status']) => {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, status } : r)));
    showToast(`Estatus de sala actualizado.`);
  };

  const updateVehicleStatus = (vehicleId: string, status: Vehicle['status']) => {
    setVehicles((prev) => prev.map((v) => (v.id === vehicleId ? { ...v, status } : v)));
    showToast(`Estatus de vehículo actualizado.`);
  };

  const createBudget = (newBudgetData: Omit<Budget, 'createdAt' | 'updatedAt'>) => {
    const nowIso = new Date().toISOString();
    const newBudget: Budget = {
      ...newBudgetData,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setBudgets((prev) => [newBudget, ...prev]);

    // Also link back to service if matching
    if (newBudget.serviceId) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === newBudget.serviceId
            ? { ...s, budgetId: newBudget.id, budgetTotalMxn: newBudget.totalMxn }
            : s
        )
      );
    }
    showToast(`Presupuesto ${newBudget.folio} generado correctamente.`);
  };

  const addPaymentToBudget = (
    budgetId: string,
    amount: number,
    method: 'efectivo' | 'tarjeta_debito' | 'tarjeta_credito' | 'transferencia_spei',
    reference: string
  ) => {
    const nowIso = new Date().toISOString();
    const receiptFolio = `REC-2026-${Math.floor(100 + Math.random() * 900)}`;

    setBudgets((prev) =>
      prev.map((b) => {
        if (b.id !== budgetId) return b;
        const newPayment = {
          id: `pay-${Date.now()}`,
          amountMxn: amount,
          method,
          reference,
          timestamp: nowIso,
          receivedBy: currentUser.name,
          receiptFolio,
        };
        const updatedPayments = [...b.payments, newPayment];
        const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amountMxn, 0);
        const newStatus = totalPaid >= b.totalMxn ? 'liquidado' : 'aprobado_familia';

        // Also update matching service paid amount
        setServices((sPrev) =>
          sPrev.map((s) =>
            s.id === b.serviceId ? { ...s, budgetPaidMxn: totalPaid } : s
          )
        );

        return {
          ...b,
          payments: updatedPayments,
          status: newStatus,
          updatedAt: nowIso,
        };
      })
    );

    showToast(`Pago de $${amount.toLocaleString('es-MX')} MXN registrado con folio ${receiptFolio}.`);
  };

  const adjustInventoryStock = (itemId: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const nextStock = Math.max(0, item.stockCurrent + delta);
        const status =
          nextStock === 0
            ? 'agotado'
            : nextStock <= item.stockMinimum
            ? 'bajo_stock'
            : 'en_stock';
        return {
          ...item,
          stockCurrent: nextStock,
          status,
        };
      })
    );
    showToast(`Stock de producto actualizado.`);
  };

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
    };
    setInventory((prev) => [...prev, newItem]);
    showToast(`Producto ${newItem.name} agregado al inventario.`);
  };

  const addCondolence = (
    serviceId: string,
    authorName: string,
    relationship: string,
    message: string,
    candle: boolean
  ) => {
    const newCondolence: FamilyCondolence = {
      id: `c-${Date.now()}`,
      serviceId,
      authorName,
      relationship,
      message,
      timestamp: new Date().toISOString(),
      approved: true, // auto-moderado en demo
      virtualCandleLit: candle,
    };
    setCondolences((prev) => [newCondolence, ...prev]);
    showToast('Mensaje de condolencia registrado con respeto.');
  };

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    showToast('Alerta operativa resuelta.');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        currentUser,
        setCurrentUserRole,
        activeCompany,
        setActiveCompanyId,
        companies,
        updateCompanyStatus,
        branches,
        activeBranchId,
        setActiveBranchId,
        services,
        selectedService,
        setSelectedService,
        createService,
        updateServiceStage,
        updateServiceDetails,
        updateDocumentStatus,
        rooms,
        updateRoomStatus,
        vehicles,
        updateVehicleStatus,
        staff,
        providers,
        budgets,
        createBudget,
        addPaymentToBudget,
        inventory,
        adjustInventoryStock,
        addInventoryItem,
        condolences,
        addCondolence,
        alerts,
        dismissAlert,
        isNewServiceModalOpen,
        setIsNewServiceModalOpen,
        isAiModalOpen,
        setIsAiModalOpen,
        viewingFamilyServiceCode,
        setViewingFamilyServiceCode,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
