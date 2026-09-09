-- ==============================================================================
-- Migration: Enable Public Read for Priests & Purge Dummy Priest Seed Data
-- ==============================================================================

-- 1. Ensure anonymous and authenticated users can view priests for sign-up & directory
DROP POLICY IF EXISTS "Public read priests" ON public.users;
CREATE POLICY "Public read priests"
    ON public.users FOR SELECT
    TO anon, authenticated
    USING (role = 'priest');

-- 2. Ensure priest profiles are viewable by all users (anonymous and authenticated)
DROP POLICY IF EXISTS "Priest profiles are viewable by all users" ON public.priest_profiles;
DROP POLICY IF EXISTS "Priest profiles are viewable by all authenticated users" ON public.priest_profiles;
CREATE POLICY "Priest profiles are viewable by all users"
    ON public.priest_profiles FOR SELECT
    TO anon, authenticated
    USING (true);

-- 3. Delete dummy seed priest accounts if present in public tables
DELETE FROM public.priest_profiles WHERE priest_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222'
);

DELETE FROM public.slots WHERE priest_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222'
);

DELETE FROM public.bookings WHERE priest_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222'
);

DELETE FROM public.users WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222'
);

-- 4. Delete dummy seed priest accounts from auth tables if present
DELETE FROM auth.identities WHERE user_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222'
);

DELETE FROM auth.users WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222'
);
