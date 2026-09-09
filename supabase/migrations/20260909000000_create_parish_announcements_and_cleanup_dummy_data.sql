-- ==============================================================================
-- Migration: Create Parish Announcements Table & Purge Dummy Accounts
-- ==============================================================================

-- 1. Create parish_announcements table
CREATE TABLE IF NOT EXISTS public.parish_announcements (
    id TEXT PRIMARY KEY,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    content_ar TEXT NOT NULL,
    content_en TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'emergency')),
    target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'general', 'servant', 'deacon', 'priest', 'secretary')),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.parish_announcements ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Public read active parish announcements" ON public.parish_announcements;
DROP POLICY IF EXISTS "Super admin manage parish announcements" ON public.parish_announcements;

-- Allow public and authenticated read access
CREATE POLICY "Public read active parish announcements"
ON public.parish_announcements
FOR SELECT
USING (true);

-- Allow super admin and service role full write access
CREATE POLICY "Super admin manage parish announcements"
ON public.parish_announcements
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid() AND users.role = 'admin'
    ) OR auth.jwt() ->> 'role' = 'service_role'
);

-- 2. Cleanup all dummy congregation accounts and associated bookings/logs
-- Dummy IDs:
-- Peter Mark:  44444444-4444-4444-4444-444444444444 (peter@example.com)
-- Mary George: 55555555-5555-5555-5555-555555555555 (mary@example.com)
-- David Samuel: 66666666-6666-6666-6666-666666666666 (david@example.com)

DELETE FROM public.bookings WHERE user_id IN (
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666'
);

DELETE FROM public.notification_logs WHERE recipient_email IN (
    'peter@example.com',
    'mary@example.com',
    'david@example.com'
) OR user_id IN (
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666'
);

DELETE FROM public.users WHERE email IN (
    'peter@example.com',
    'mary@example.com',
    'david@example.com'
) OR id IN (
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666'
);

-- Delete from auth tables if present
DELETE FROM auth.identities WHERE user_id IN (
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666'
);

DELETE FROM auth.users WHERE email IN (
    'peter@example.com',
    'mary@example.com',
    'david@example.com'
) OR id IN (
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666'
);
