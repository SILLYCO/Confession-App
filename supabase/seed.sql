-- ==============================================================================
-- Confession Registration System - Production Seed Data
-- ==============================================================================

-- Enable pgcrypto for password hashing if not enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create auth users in auth.users first (Default Password: password123 / 123456)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES 
    ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@church.org', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Archdeacon George (Super Admin)","role":"admin"}', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'fr.athanasius@church.org', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Fr. Athanasius Hanna","role":"priest"}', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'fr.menas@church.org', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Fr. Menas Shenouda","role":"priest"}', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'secretary@church.org', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Phoebe Mikhail","role":"secretary"}', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'peter@example.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Peter Mark","role":"general"}', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'mary@example.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Mary George","role":"general"}', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', '66666666-6666-6666-6666-666666666666', 'authenticated', 'authenticated', 'david@example.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"David Samuel","role":"general"}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Create identities for Supabase Auth login
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES 
    ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', '{"sub":"00000000-0000-0000-0000-000000000000","email":"admin@church.org"}', 'email', 'admin@church.org', NOW(), NOW(), NOW()),
    ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '{"sub":"11111111-1111-1111-1111-111111111111","email":"fr.athanasius@church.org"}', 'email', 'fr.athanasius@church.org', NOW(), NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '{"sub":"22222222-2222-2222-2222-222222222222","email":"fr.menas@church.org"}', 'email', 'fr.menas@church.org', NOW(), NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '{"sub":"33333333-3333-3333-3333-333333333333","email":"secretary@church.org"}', 'email', 'secretary@church.org', NOW(), NOW(), NOW()),
    ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '{"sub":"44444444-4444-4444-4444-444444444444","email":"peter@example.com"}', 'email', 'peter@example.com', NOW(), NOW(), NOW()),
    ('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', '{"sub":"55555555-5555-5555-5555-555555555555","email":"mary@example.com"}', 'email', 'mary@example.com', NOW(), NOW(), NOW()),
    ('66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', '{"sub":"66666666-6666-6666-6666-666666666666","email":"david@example.com"}', 'email', 'david@example.com', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Populate public.users
INSERT INTO public.users (id, name, email, phone, role, title_en, title_ar, assigned_priest_ids, avatar_url)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'Archdeacon George (Super Admin)', 'admin@church.org', '+1 555-0100', 'admin', 'Archdeacon George (Super Admin)', 'الأرشيدياكون جورج (مدير النظام)', '{}', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'),
    ('11111111-1111-1111-1111-111111111111', 'Fr. Athanasius Hanna', 'fr.athanasius@church.org', '+1 555-0101', 'priest', 'Fr. Athanasius Hanna', 'القمص أثناسيوس حنا', '{}', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'),
    ('22222222-2222-2222-2222-222222222222', 'Fr. Menas Shenouda', 'fr.menas@church.org', '+1 555-0102', 'priest', 'Fr. Menas Shenouda', 'الراهب القس مينا شنودة', '{}', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'),
    ('33333333-3333-3333-3333-333333333333', 'Phoebe Mikhail (Secretary)', 'secretary@church.org', '+1 555-0103', 'secretary', 'Secretary Office', 'مكتب أمانة سر الكنيسة', '{"11111111-1111-1111-1111-111111111111", "22222222-2222-2222-2222-222222222222"}', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'),
    ('44444444-4444-4444-4444-444444444444', 'Peter Mark', 'peter@example.com', '+1 555-0104', 'general', 'Congregation Member', 'شماس بيتر مرقس', '{}', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'),
    ('55555555-5555-5555-5555-555555555555', 'Mary George', 'mary@example.com', '+1 555-0105', 'general', 'Congregation Member', 'مريم جرجس', '{}', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'),
    ('66666666-6666-6666-6666-666666666666', 'David Samuel', 'david@example.com', '+1 555-0106', 'general', 'Congregation Member', 'داود صموئيل', '{}', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    avatar_url = EXCLUDED.avatar_url,
    assigned_priest_ids = EXCLUDED.assigned_priest_ids;

-- 4. Priest Profiles
INSERT INTO public.priest_profiles (
    priest_id,
    avg_confession_minutes,
    weekly_schedule,
    schedule_overrides,
    church_name_ar,
    church_name_en,
    bio_ar,
    bio_en
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    15,
    '[
        {"id": "w1", "dayOfWeek": 0, "startTime": "12:00", "endTime": "15:00"},
        {"id": "w2", "dayOfWeek": 1, "startTime": "17:00", "endTime": "20:00"},
        {"id": "w3", "dayOfWeek": 3, "startTime": "18:00", "endTime": "21:00"},
        {"id": "w4", "dayOfWeek": 5, "startTime": "17:00", "endTime": "20:00"}
    ]'::jsonb,
    '[]'::jsonb,
    'كنيسة الشهيد العظيم مارمرقس بشبرا',
    'Saint Mark Church Shobra',
    'أب اعتراف وراعي الشباب بالكنيسة. حاصل على بكالوريوس اللاهوت وخدمة المشورة الأسرية.',
    'Parish priest & youth counselor. Serving confession, spiritual guidance, and family counseling.'
), (
    '22222222-2222-2222-2222-222222222222',
    20,
    '[
        {"id": "w5", "dayOfWeek": 2, "startTime": "16:00", "endTime": "19:00"},
        {"id": "w6", "dayOfWeek": 4, "startTime": "17:00", "endTime": "20:00"},
        {"id": "w7", "dayOfWeek": 6, "startTime": "10:00", "endTime": "13:00"}
    ]'::jsonb,
    '[]'::jsonb,
    'كنيسة السيدة العذراء مريم والقديس يوحنا الحبيب',
    'St. Mary & St. John the Beloved Church',
    'كاهن ومرشد روحي متخصص في إرشاد الخريجين والمقبلين على الزواج.',
    'Spiritual father and counselor for college graduates and pre-marital guidance.'
)
ON CONFLICT (priest_id) DO UPDATE SET
    avg_confession_minutes = EXCLUDED.avg_confession_minutes,
    weekly_schedule = EXCLUDED.weekly_schedule;

-- 5. Generate initial slots for the next 14 days
SELECT public.generate_slots_for_priest('11111111-1111-1111-1111-111111111111', CURRENT_DATE, (CURRENT_DATE + INTERVAL '14 days')::DATE);
SELECT public.generate_slots_for_priest('22222222-2222-2222-2222-222222222222', CURRENT_DATE, (CURRENT_DATE + INTERVAL '14 days')::DATE);
