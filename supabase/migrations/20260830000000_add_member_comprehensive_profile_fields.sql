-- ==============================================================================
-- Migration: Add Member Comprehensive Profile Fields to Users Table
-- ==============================================================================

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female')),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS national_id VARCHAR(14),
ADD COLUMN IF NOT EXISTS secondary_phone TEXT,
ADD COLUMN IF NOT EXISTS marital_status TEXT CHECK (marital_status IN ('single', 'married', 'widowed', 'divorced')),
ADD COLUMN IF NOT EXISTS profession TEXT,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS service_status TEXT CHECK (service_status IN ('general_member', 'servant', 'served')),
ADD COLUMN IF NOT EXISTS served_stage TEXT,
ADD COLUMN IF NOT EXISTS serving_stage TEXT,
ADD COLUMN IF NOT EXISTS other_services TEXT,
ADD COLUMN IF NOT EXISTS confession_father_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Create index for quick search by National ID & Phone & Confession Father
CREATE INDEX IF NOT EXISTS idx_users_national_id ON public.users (national_id);
CREATE INDEX IF NOT EXISTS idx_users_service_status ON public.users (service_status);
CREATE INDEX IF NOT EXISTS idx_users_confession_father ON public.users (confession_father_id);
