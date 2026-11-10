export type UserRole =
  | 'superadmin'
  | 'admin_funeraria'
  | 'gerente'
  | 'recepcionista'
  | 'operador'
  | 'personal_autorizado';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  branchId: string;
  avatar?: string;
  active: boolean;
}

export interface Company {
  id: string;
  name: string;
  legalName: string;
  rfc: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  plan: 'basico' | 'profesional' | 'enterprise';
  status: 'activa' | 'prueba' | 'suspendida';
  trialEndsAt?: string;
  maxBranches: number;
  maxUsers: number;
  logoUrl?: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  companyId: string;
  name: string;
  address: string;
  phone: string;
  managerName: string;
  roomCount: number;
  isMain: boolean;
}

export type ServiceType =
  | 'velacion_inhumacion'
  | 'velacion_cremacion'
  | 'cremacion_directa'
  | 'inhumacion_directa'
  | 'traslado_nacional'
  | 'traslado_internacional';

export type ServiceStageKey =
  | 'nuevo'
  | 'documentacion'
  | 'preparacion'
  | 'traslado'
  | 'velacion'
  | 'cremacion_inhumacion'
  | 'finalizado';

export interface StageHistoryItem {
  id: string;
  stage: ServiceStageKey;
  timestamp: string;
  userName: string;
  userRole: string;
  note?: string;
}

export type DocStatus = 'pendiente' | 'en_revision' | 'aprobado' | 'no_aplica';

export interface ServiceDocument {
  id: string;
  name: string;
  required: boolean;
  status: DocStatus;
  updatedAt?: string;
  notes?: string;
}

export interface DeceasedInfo {
  fullName: string;
  age: number;
  gender: 'femenino' | 'masculino' | 'otro';
  deathDateTime: string;
  deathPlace: string; // ej: Hospital Ángeles México, Domicilio particular
  causeOfDeath?: string;
  religion?: string;
}

export interface FamilyContact {
  fullName: string;
  relationship: string; // ej: Hijo(a), Cónyuge, Hermano(a)
  phone: string;
  email: string;
  ineNumber?: string;
  address?: string;
  isLegalResponsible: boolean;
}

export interface FuneralService {
  id: string; // Expediente p. ej. EXP-2026-042
  companyId: string;
  branchId: string;
  deceased: DeceasedInfo;
  familyContact: FamilyContact;
  serviceType: ServiceType;
  currentStage: ServiceStageKey;
  requiredStages: ServiceStageKey[];
  history: StageHistoryItem[];
  roomId?: string; // id de la sala de velación
  vehicleId?: string; // id de la carroza
  directorStaffId: string; // Director del cortejo / coordinador
  embalmerStaffId?: string; // Tanatólogo / embalsamador
  driverStaffId?: string; // Chofer
  externalProviderId?: string;
  scheduledServiceDate: string; // YYYY-MM-DD
  wakeStartTime?: string; // Horario inicio velación
  wakeEndTime?: string;
  ceremonyTime?: string; // Misa / Homenaje
  departureTime?: string; // Salida del cortejo
  destinationPlace: string; // Panteón Francés, Crematorio Santa Mónica, etc.
  documents: ServiceDocument[];
  budgetId?: string;
  budgetTotalMxn: number;
  budgetPaidMxn: number;
  internalNotes: string;
  familyPortalCode: string; // Código de acceso seguro familiar
  familyPortalEnabled: boolean;
  obituaryPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  companyId: string;
  branchId: string;
  name: string; // Capilla Imperial, Capilla La Esperanza
  capacityPeople: number;
  status: 'disponible' | 'ocupada' | 'mantenimiento' | 'reservada';
  currentServiceId?: string;
  currentServiceDeceasedName?: string;
  occupiedUntil?: string;
  amenities: string[];
}

export interface Vehicle {
  id: string;
  companyId: string;
  branchId: string;
  model: string; // Lincoln Continental Hearse, Cadillac Fleetwood
  plate: string;
  type: 'carroza_principal' | 'cortejo_familiar' | 'traslado_operativo';
  status: 'disponible' | 'en_servicio' | 'taller' | 'mantenimiento';
  currentServiceId?: string;
  currentDestination?: string;
  mileageKm: number;
  lastMaintenanceDate: string;
  nextMaintenanceDueKm: number;
}

export interface StaffMember {
  id: string;
  companyId: string;
  branchId: string;
  name: string;
  role: 'director_funerario' | 'tanatopractor' | 'chofer' | 'asesor_familiar' | 'coordinador_sala';
  phone: string;
  shift: 'matutino' | 'vespertino' | 'nocturno' | 'guardia_24h';
  status: 'disponible' | 'en_servicio' | 'descanso';
  currentServiceId?: string;
}

export interface ExternalProvider {
  id: string;
  companyId: string;
  name: string;
  serviceCategory: 'crematorio_externo' | 'marmoleria' | 'floreria' | 'traslado_aereo' | 'embalsamamiento_legal';
  phone: string;
  contactName: string;
  contractAgreement: string;
}

export interface BudgetItem {
  id: string;
  category: 'ataud_urna' | 'sala_velacion' | 'traslados' | 'preparacion' | 'tramites' | 'flores' | 'cafeteria' | 'cremacion' | 'otros';
  description: string;
  unitPriceMxn: number;
  quantity: number;
  totalMxn: number;
}

export interface PaymentRecord {
  id: string;
  amountMxn: number;
  method: 'efectivo' | 'tarjeta_debito' | 'tarjeta_credito' | 'transferencia_spei';
  reference: string;
  timestamp: string;
  receivedBy: string;
  receiptFolio: string;
}

export interface Budget {
  id: string;
  serviceId: string;
  companyId: string;
  folio: string;
  clientName: string;
  deceasedName: string;
  date: string;
  items: BudgetItem[];
  subtotalMxn: number;
  discountMxn: number;
  discountReason?: string;
  taxIvaMxn: number;
  totalMxn: number;
  status: 'borrador' | 'aprobado_familia' | 'liquidado' | 'cancelado';
  payments: PaymentRecord[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  companyId: string;
  branchId: string;
  sku: string;
  name: string;
  category: 'ataud' | 'urna' | 'flor' | 'insumo_tanatologico' | 'cafeteria' | 'velas_accesorios';
  material?: string;
  stockCurrent: number;
  stockMinimum: number;
  costPriceMxn: number;
  salePriceMxn: number;
  supplierName: string;
  locationRack: string;
  status: 'en_stock' | 'bajo_stock' | 'agotado';
}

export interface FamilyCondolence {
  id: string;
  serviceId: string;
  authorName: string;
  relationship: string;
  message: string;
  timestamp: string;
  approved: boolean;
  virtualCandleLit: boolean;
}

export interface OperationalAlert {
  id: string;
  type: 'urgente' | 'advertencia' | 'recordatorio';
  title: string;
  description: string;
  relatedServiceId?: string;
  timestamp: string;
  resolved: boolean;
}
