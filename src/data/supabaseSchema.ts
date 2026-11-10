export const SUPABASE_ARCHITECTURE_OVERVIEW = {
  dbEngine: 'PostgreSQL 15+ / Supabase',
  authProvider: 'Supabase Auth (Email + Magic Link + Google OAuth)',
  storageBuckets: [
    'documentos-legales-privados (actas, certificados, INE)',
    'obituarios-publicos (fotografías conmemorativas familiares)',
    'comprobantes-pagos (recibos y transferencias SPEI)',
  ],
  multiTenancyModel: 'Discriminator Column (company_id) with Strict Row Level Security (RLS)',
};

export const SUPABASE_SQL_MIGRATION = `-- ====================================================================
-- FUNERARIA CONTROL: ESQUEMA DE BASE DE DATOS Y SEGURIDAD RLS
-- Preparado para PostgreSQL / Supabase
-- ====================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA DE EMPRESAS (TENANTS)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    rfc VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    plan VARCHAR(50) DEFAULT 'basico' CHECK (plan IN ('basico', 'profesional', 'enterprise')),
    status VARCHAR(50) DEFAULT 'prueba' CHECK (status IN ('activa', 'prueba', 'suspendida')),
    max_branches INT DEFAULT 1,
    max_users INT DEFAULT 5,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE SUCURSALES
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    manager_name VARCHAR(255),
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE PERFILES DE USUARIO (VINCULADO A auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('superadmin', 'admin_funeraria', 'gerente', 'recepcionista', 'operador', 'personal_autorizado')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA DE SALAS DE VELACIÓN
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    capacity_people INT NOT NULL DEFAULT 50,
    status VARCHAR(50) DEFAULT 'disponible' CHECK (status IN ('disponible', 'ocupada', 'mantenimiento', 'reservada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLA DE VEHÍCULOS / FLOTA
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    model VARCHAR(200) NOT NULL,
    plate VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('carroza_principal', 'cortejo_familiar', 'traslado_operativo')),
    status VARCHAR(50) DEFAULT 'disponible' CHECK (status IN ('disponible', 'en_servicio', 'taller', 'mantenimiento')),
    mileage_km INT DEFAULT 0,
    last_maintenance_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLA DE SERVICIOS FUNERARIOS (EXPEDIENTES)
CREATE TABLE IF NOT EXISTS public.funeral_services (
    id VARCHAR(50) PRIMARY KEY, -- e.g. EXP-2026-089
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('velacion_inhumacion', 'velacion_cremacion', 'cremacion_directa', 'inhumacion_directa', 'traslado_nacional', 'traslado_internacional')),
    current_stage VARCHAR(50) NOT NULL DEFAULT 'nuevo' CHECK (current_stage IN ('nuevo', 'documentacion', 'preparacion', 'traslado', 'velacion', 'cremacion_inhumacion', 'finalizado')),
    deceased_name VARCHAR(255) NOT NULL,
    deceased_age INT,
    deceased_gender VARCHAR(20),
    death_datetime TIMESTAMP WITH TIME ZONE,
    death_place TEXT,
    cause_of_death TEXT,
    family_contact_name VARCHAR(255) NOT NULL,
    family_contact_relationship VARCHAR(100),
    family_contact_phone VARCHAR(50),
    family_contact_email VARCHAR(255),
    room_id UUID REFERENCES public.rooms(id),
    vehicle_id UUID REFERENCES public.vehicles(id),
    director_staff_id UUID,
    scheduled_service_date DATE NOT NULL,
    wake_start_time TIME,
    wake_end_time TIME,
    destination_place TEXT,
    budget_total_mxn NUMERIC(12, 2) DEFAULT 0.00,
    budget_paid_mxn NUMERIC(12, 2) DEFAULT 0.00,
    family_portal_code VARCHAR(50) UNIQUE,
    family_portal_enabled BOOLEAN DEFAULT TRUE,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABLA DE AUDITORÍA Y TRAZABILIDAD DE ETAPAS
CREATE TABLE IF NOT EXISTS public.service_stage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id VARCHAR(50) NOT NULL REFERENCES public.funeral_services(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id),
    stage VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABLA DE INVENTARIO
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('ataud', 'urna', 'flor', 'insumo_tanatologico', 'cafeteria', 'velas_accesorios')),
    stock_current INT NOT NULL DEFAULT 0,
    stock_minimum INT NOT NULL DEFAULT 2,
    cost_price_mxn NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    sale_price_mxn NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    location_rack VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- Habilitar RLS en todas las tablas sensibles
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funeral_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_stage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- POLÍTICA AISLAMIENTO MULTIEMPRESA (TENANT ISOLATION)
CREATE POLICY "tenant_isolation_funeral_services" ON public.funeral_services
    FOR ALL
    USING (
        company_id = (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'superadmin'
    );

CREATE POLICY "tenant_isolation_inventory" ON public.inventory_items
    FOR ALL
    USING (
        company_id = (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'superadmin'
    );
`;
