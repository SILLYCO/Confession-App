-- ==============================================================================
-- Confession Registration System - Demo Seed Data
-- ==============================================================================

-- Create demo auth users (or public users for seed)
INSERT INTO public.users (id, name, email, phone, role, title_en, title_ar, assigned_priest_ids)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'Archdeacon George (Super Admin)', 'admin@church.org', '+1 555-0100', 'admin', 'Archdeacon George (Super Admin)', 'الأرشيدياكون جورج (مدير النظام)', '{}'),
    ('11111111-1111-1111-1111-111111111111', 'Fr. Athanasius Hanna', 'fr.athanasius@church.org', '+1 555-0101', 'priest', 'Fr. Athanasius Hanna', 'القمص أثناسيوس حنا', '{}'),
    ('22222222-2222-2222-2222-222222222222', 'Fr. Menas Shenouda', 'fr.menas@church.org', '+1 555-0102', 'priest', 'Fr. Menas Shenouda', 'الراهب القس مينا شنودة', '{}'),
    ('33333333-3333-3333-3333-333333333333', 'Phoebe Mikhail (Secretary)', 'secretary@church.org', '+1 555-0103', 'secretary', 'Secretary Office', 'مكتب أمانة سر الكنيسة', '{"11111111-1111-1111-1111-111111111111", "22222222-2222-2222-2222-222222222222"}'),
    ('44444444-4444-4444-4444-444444444444', 'Peter Mark', 'peter@example.com', '+1 555-0104', 'general', 'Congregation Member', 'شماس بيتر مرقس', '{}'),
    ('55555555-5555-5555-5555-555555555555', 'Mary George', 'mary@example.com', '+1 555-0105', 'general', 'Congregation Member', 'مريم جرجس', '{}'),
    ('66666666-6666-6666-6666-666666666666', 'David Samuel', 'david@example.com', '+1 555-0106', 'general', 'Congregation Member', 'داود صموئيل', '{}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    assigned_priest_ids = EXCLUDED.assigned_priest_ids;

-- Priest Profiles
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
    'كنيسة الشهيد العظيم مارجرجس والأنبا أنطونيوس',
    'St. George & St. Anthony Coptic Orthodox Church',
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

-- Generate initial slots for the next 14 days
SELECT public.generate_slots_for_priest('11111111-1111-1111-1111-111111111111', CURRENT_DATE, (CURRENT_DATE + INTERVAL '14 days')::DATE);
SELECT public.generate_slots_for_priest('22222222-2222-2222-2222-222222222222', CURRENT_DATE, (CURRENT_DATE + INTERVAL '14 days')::DATE);
