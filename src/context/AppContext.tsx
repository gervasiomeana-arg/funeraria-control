import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  allBranches: Branch[];
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;

  // Services (Filtered by activeCompany)
  services: FuneralService[];
  allServices: FuneralService[];
  selectedService: FuneralService | null;
  setSelectedService: (service: FuneralService | null) => void;
  createService: (newService: Omit<FuneralService, 'createdAt' | 'updatedAt' | 'history'>) => boolean;
  updateServiceStage: (serviceId: string, nextStage: ServiceStageKey, note?: string) => void;
  updateServiceDetails: (serviceId: string, updates: Partial<FuneralService>) => void;
  updateDocumentStatus: (serviceId: string, docId: string, status: 'aprobado' | 'en_revision' | 'pendiente') => void;

  // Resources (Filtered by activeCompany)
  rooms: Room[];
  updateRoomStatus: (roomId: string, status: Room['status']) => void;
  vehicles: Vehicle[];
  updateVehicleStatus: (vehicleId: string, status: Vehicle['status']) => void;
  staff: StaffMember[];
  providers: ExternalProvider[];

  // Budgets & Payments (Filtered by activeCompany)
  budgets: Budget[];
  createBudget: (budget: Omit<Budget, 'createdAt' | 'updatedAt'>) => void;
  addPaymentToBudget: (budgetId: string, amount: number, method: 'efectivo' | 'tarjeta_debito' | 'tarjeta_credito' | 'transferencia_spei', reference: string) => void;

  // Inventory (Filtered by activeCompany)
  inventory: InventoryItem[];
  adjustInventoryStock: (itemId: string, delta: number, reason?: string) => boolean;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;

  // Family Portal
  condolences: FamilyCondolence[];
  addCondolence: (serviceId: string, authorName: string, relationship: string, message: string, candle: boolean) => void;

  // Alerts
  alerts: OperationalAlert[];
  dismissAlert: (alertId: string) => void;

  // UI Modals & Responsive State
  isNewServiceModalOpen: boolean;
  setIsNewServiceModalOpen: (open: boolean) => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
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
  const [allBranchesState] = useState<Branch[]>(INITIAL_BRANCHES);
  const [activeBranchId, setActiveBranchId] = useState<string>('todas');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);

  // Master lists
  const [allServices, setAllServices] = useState<FuneralService[]>(INITIAL_SERVICES);
  const [selectedService, setSelectedService] = useState<FuneralService | null>(null);

  const [allRooms, setAllRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [allStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [allProviders] = useState<ExternalProvider[]>(INITIAL_PROVIDERS);

  const [allBudgets, setAllBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [allInventory, setAllInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [condolences, setCondolences] = useState<FamilyCondolence[]>(INITIAL_CONDOLENCES);
  const [allAlerts, setAllAlerts] = useState<OperationalAlert[]>(INITIAL_ALERTS);

  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    setActiveBranchId('todas'); // reset branch filter on company change
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

  // Strictly Filtered Lists by Active Company (Multi-tenant isolation)
  const branches = useMemo(() => {
    return allBranchesState.filter((b) => b.companyId === activeCompanyId);
  }, [allBranchesState, activeCompanyId]);

  const services = useMemo(() => {
    return allServices.filter((s) => s.companyId === activeCompanyId);
  }, [allServices, activeCompanyId]);

  const rooms = useMemo(() => {
    return allRooms.filter((r) => r.companyId === activeCompanyId);
  }, [allRooms, activeCompanyId]);

  const vehicles = useMemo(() => {
    return allVehicles.filter((v) => v.companyId === activeCompanyId);
  }, [allVehicles, activeCompanyId]);

  const staff = useMemo(() => {
    return allStaff.filter((st) => st.companyId === activeCompanyId);
  }, [allStaff, activeCompanyId]);

  const providers = useMemo(() => {
    return allProviders.filter((p) => p.companyId === activeCompanyId);
  }, [allProviders, activeCompanyId]);

  const budgets = useMemo(() => {
    return allBudgets.filter((b) => b.companyId === activeCompanyId);
  }, [allBudgets, activeCompanyId]);

  const inventory = useMemo(() => {
    return allInventory.filter((i) => i.companyId === activeCompanyId);
  }, [allInventory, activeCompanyId]);

  const alerts = useMemo(() => {
    // Show alerts related to active company's services
    const compServiceIds = new Set(services.map((s) => s.id));
    return allAlerts.filter((a) => !a.relatedServiceId || compServiceIds.has(a.relatedServiceId));
  }, [allAlerts, services]);

  // Keep selectedService in sync with updated services list
  useEffect(() => {
    if (selectedService) {
      const refreshed = allServices.find((s) => s.id === selectedService.id);
      if (refreshed) {
        setSelectedService(refreshed);
      }
    }
  }, [allServices]);

  const createService = (newServiceData: Omit<FuneralService, 'createdAt' | 'updatedAt' | 'history'>): boolean => {
    const nowIso = new Date().toISOString();

    // Check collision for room: is room already occupied?
    if (newServiceData.roomId) {
      const room = allRooms.find((r) => r.id === newServiceData.roomId);
      if (room && room.status === 'ocupada' && room.currentServiceId) {
        showToast(`Advertencia: La sala ${room.name} ya está ocupada por otro servicio.`);
      }
    }

    // Check collision for vehicle
    if (newServiceData.vehicleId) {
      const veh = allVehicles.find((v) => v.id === newServiceData.vehicleId);
      if (veh && veh.status === 'en_servicio' && veh.currentServiceId) {
        showToast(`Advertencia: El vehículo ${veh.model} ya está asignado a otro cortejo.`);
      }
    }

    const newService: FuneralService = {
      ...newServiceData,
      companyId: activeCompanyId,
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

    setAllServices((prev) => [newService, ...prev]);

    // Mark room occupied
    if (newService.roomId) {
      setAllRooms((prev) =>
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

    // Mark vehicle in service
    if (newService.vehicleId) {
      setAllVehicles((prev) =>
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
    return true;
  };

  const updateServiceStage = (serviceId: string, nextStage: ServiceStageKey, note?: string) => {
    const nowIso = new Date().toISOString();
    setAllServices((prev) =>
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
      setAllRooms((prev) =>
        prev.map((r) =>
          r.currentServiceId === serviceId
            ? { ...r, status: 'disponible', currentServiceId: undefined, currentServiceDeceasedName: undefined }
            : r
        )
      );
      setAllVehicles((prev) =>
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
    const nowIso = new Date().toISOString();
    const existing = allServices.find((s) => s.id === serviceId);

    if (existing) {
      // Check room reassignment
      if (updates.roomId !== undefined && updates.roomId !== existing.roomId) {
        // Free old room
        if (existing.roomId) {
          setAllRooms((prev) =>
            prev.map((r) =>
              r.id === existing.roomId
                ? { ...r, status: 'disponible', currentServiceId: undefined, currentServiceDeceasedName: undefined }
                : r
            )
          );
        }
        // Occupy new room
        if (updates.roomId) {
          setAllRooms((prev) =>
            prev.map((r) =>
              r.id === updates.roomId
                ? {
                    ...r,
                    status: 'ocupada',
                    currentServiceId: serviceId,
                    currentServiceDeceasedName: updates.deceased?.fullName || existing.deceased.fullName,
                  }
                : r
            )
          );
        }
      }

      // Check vehicle reassignment
      if (updates.vehicleId !== undefined && updates.vehicleId !== existing.vehicleId) {
        // Free old vehicle
        if (existing.vehicleId) {
          setAllVehicles((prev) =>
            prev.map((v) =>
              v.id === existing.vehicleId
                ? { ...v, status: 'disponible', currentServiceId: undefined, currentDestination: undefined }
                : v
            )
          );
        }
        // Occupy new vehicle
        if (updates.vehicleId) {
          setAllVehicles((prev) =>
            prev.map((v) =>
              v.id === updates.vehicleId
                ? {
                    ...v,
                    status: 'en_servicio',
                    currentServiceId: serviceId,
                    currentDestination: updates.destinationPlace || existing.destinationPlace,
                  }
                : v
            )
          );
        }
      }
    }

    const editLogItem = {
      id: `h-${Date.now()}`,
      stage: existing?.currentStage || 'nuevo',
      timestamp: nowIso,
      userName: currentUser.name,
      userRole: currentUser.role,
      note: 'Modificación de datos generales del expediente.',
    };

    setAllServices((prev) =>
      prev.map((s) => {
        if (s.id !== serviceId) return s;
        return {
          ...s,
          ...updates,
          updatedAt: nowIso,
          history: [...s.history, editLogItem],
        };
      })
    );

    showToast(`Expediente ${serviceId} actualizado correctamente.`);
  };

  const updateDocumentStatus = (
    serviceId: string,
    docId: string,
    status: 'aprobado' | 'en_revision' | 'pendiente'
  ) => {
    setAllServices((prev) =>
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
    setAllRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, status } : r)));
    showToast(`Estatus de sala actualizado.`);
  };

  const updateVehicleStatus = (vehicleId: string, status: Vehicle['status']) => {
    setAllVehicles((prev) => prev.map((v) => (v.id === vehicleId ? { ...v, status } : v)));
    showToast(`Estatus de vehículo actualizado.`);
  };

  const createBudget = (newBudgetData: Omit<Budget, 'createdAt' | 'updatedAt'>) => {
    const nowIso = new Date().toISOString();
    const newBudget: Budget = {
      ...newBudgetData,
      companyId: activeCompanyId,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setAllBudgets((prev) => [newBudget, ...prev]);

    // Link back to service
    if (newBudget.serviceId) {
      setAllServices((prev) =>
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

    setAllBudgets((prev) =>
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

        // Update matching service paid amount
        setAllServices((sPrev) =>
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

  const adjustInventoryStock = (itemId: string, delta: number, reason?: string): boolean => {
    const target = allInventory.find((i) => i.id === itemId);
    if (!target) return false;

    if (target.stockCurrent + delta < 0) {
      showToast(`Error: No es posible tener existencias negativas para "${target.name}".`);
      return false;
    }

    setAllInventory((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const nextStock = item.stockCurrent + delta;
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

    const actionText = delta > 0 ? `Entrada de +${delta}` : `Salida de ${delta}`;
    showToast(`${actionText} registrada para ${target.name}${reason ? ` (${reason})` : ''}.`);
    return true;
  };

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
      companyId: activeCompanyId,
    };
    setAllInventory((prev) => [...prev, newItem]);
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
      approved: true,
      virtualCandleLit: candle,
    };
    setCondolences((prev) => [newCondolence, ...prev]);
    showToast('Mensaje de condolencia registrado con respeto.');
  };

  const dismissAlert = (alertId: string) => {
    setAllAlerts((prev) => prev.filter((a) => a.id !== alertId));
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
        allBranches: allBranchesState,
        activeBranchId,
        setActiveBranchId,
        services,
        allServices,
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
        isMobileMenuOpen,
        setIsMobileMenuOpen,
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
