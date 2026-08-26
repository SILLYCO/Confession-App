import { User, PriestProfile, Booking, NotificationLog } from '../types/database';
import { format, addDays } from 'date-fns';

export const MOCK_USERS: User[] = [
  {
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Archdeacon George (Super Admin)',
    email: 'admin@church.org',
    phone: '+1 (555) 019-0000',
    role: 'admin',
    title_en: 'Archdeacon George (Super Admin)',
    title_ar: 'الأرشيدياكون جورج (مدير النظام)',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Fr. Athanasius Hanna',
    email: 'fr.athanasius@church.org',
    phone: '+1 (555) 019-1001',
    role: 'priest',
    title_en: 'Fr. Athanasius Hanna',
    title_ar: 'القمص أثناسيوس حنا',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Fr. Menas Shenouda',
    email: 'fr.menas@church.org',
    phone: '+1 (555) 019-1002',
    role: 'priest',
    title_en: 'Fr. Menas Shenouda',
    title_ar: 'الراهب القس مينا شنودة',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Phoebe Mikhail (Secretary)',
    email: 'secretary@church.org',
    phone: '+1 (555) 019-2831',
    role: 'secretary',
    title_en: 'Church Secretary',
    title_ar: 'مكتب أمانة سر الكنيسة',
    assigned_priest_ids: [
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222'
    ],
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Peter Mark',
    email: 'peter@example.com',
    phone: '+1 (555) 019-3001',
    role: 'general',
    title_en: 'Church Member',
    title_ar: 'شماس بيتر مرقس',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Mary George',
    email: 'mary@example.com',
    phone: '+1 (555) 019-3002',
    role: 'general',
    title_en: 'Church Member',
    title_ar: 'مريم جرجس',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'David Samuel',
    email: 'david@example.com',
    phone: '+1 (555) 019-3003',
    role: 'general',
    title_en: 'Church Member',
    title_ar: 'داود صموئيل',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
  }
];

export const MOCK_PRIEST_PROFILES: PriestProfile[] = [
  {
    priest_id: '11111111-1111-1111-1111-111111111111',
    avg_confession_minutes: 15,
    weekly_schedule: [
      { id: 'w1', dayOfWeek: 0, startTime: '12:00', endTime: '15:00' }, // Sunday after Liturgy
      { id: 'w2', dayOfWeek: 1, startTime: '17:00', endTime: '20:00' }, // Monday evening
      { id: 'w3', dayOfWeek: 3, startTime: '18:00', endTime: '21:00' }, // Wednesday evening
      { id: 'w4', dayOfWeek: 5, startTime: '17:00', endTime: '20:00' }, // Friday evening
    ],
    schedule_overrides: [],
    church_name_ar: 'كنيسة الشهيد العظيم مارمرقس بشبرا',
    church_name_en: 'Saint Mark Church Shobra',
    bio_ar: 'أب اعتراف وراعي خدمة الشباب بالكنيسة. يقدم الإرشاد الروحي والصلوات الأسرية.',
    bio_en: 'Parish priest & youth spiritual counselor. Serving confessions, spiritual guidance, and family counseling.',
  },
  {
    priest_id: '22222222-2222-2222-2222-222222222222',
    avg_confession_minutes: 20,
    weekly_schedule: [
      { id: 'w5', dayOfWeek: 2, startTime: '16:00', endTime: '19:00' }, // Tuesday
      { id: 'w6', dayOfWeek: 4, startTime: '17:00', endTime: '20:00' }, // Thursday
      { id: 'w7', dayOfWeek: 6, startTime: '10:00', endTime: '13:00' }, // Saturday morning
    ],
    schedule_overrides: [],
    church_name_ar: 'كنيسة السيدة العذراء مريم والقديس يوحنا الحبيب',
    church_name_en: 'St. Mary & St. John the Beloved Church',
    bio_ar: 'كاهن ومرشد روحي متخصص في إرشاد الخريجين والشباب والمقبلين على الزواج.',
    bio_en: 'Spiritual counselor specialized in college graduates, young adults, and pre-marital guidance.',
  }
];

const today = new Date();
const tomorrowStr = format(addDays(today, 1), 'yyyy-MM-dd');
const dayAfterStr = format(addDays(today, 3), 'yyyy-MM-dd');

export const INITIAL_MOCK_BOOKINGS: Booking[] = [
  {
    id: 'book-001',
    user_id: '44444444-4444-4444-4444-444444444444', // Peter Mark
    priest_id: '11111111-1111-1111-1111-111111111111', // Fr. Athanasius
    slot_id: `slot_11111111-1111-1111-1111-111111111111_${tomorrowStr}_1700`,
    date: tomorrowStr,
    start_time: '17:00',
    end_time: '17:15',
    status: 'confirmed',
    notes: 'Regular monthly confession and spiritual guidance.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'book-002',
    user_id: '55555555-5555-5555-5555-555555555555', // Mary George
    priest_id: '22222222-2222-2222-2222-222222222222', // Fr. Menas
    slot_id: `slot_22222222-2222-2222-2222-222222222222_${dayAfterStr}_1600`,
    date: dayAfterStr,
    start_time: '16:00',
    end_time: '16:20',
    status: 'confirmed',
    notes: 'Pre-fasting confession.',
    created_at: new Date(Date.now() - 43200000).toISOString(),
  }
];

export const INITIAL_MOCK_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'notif-001',
    user_id: '44444444-4444-4444-4444-444444444444',
    type: 'booking_confirmed',
    recipient_email: 'peter@example.com',
    title_en: 'Confession Appointment Confirmed',
    title_ar: 'تم تأكيد موعد سر الاعتراف',
    body_en: `Your confession appointment with Fr. Athanasius Hanna is confirmed for ${tomorrowStr} at 5:00 PM.`,
    body_ar: `تم تأكيد موعد سر الاعتراف مع القمص أثناسيوس حنا يوم ${tomorrowStr} الساعة 5:00 م.`,
    metadata: {
      priestName: 'Fr. Athanasius Hanna',
      date: tomorrowStr,
      time: '17:00',
    },
    is_read: false,
    sent_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'notif-002',
    user_id: '55555555-5555-5555-5555-555555555555',
    type: 'booking_confirmed',
    recipient_email: 'mary@example.com',
    title_en: 'Confession Appointment Confirmed',
    title_ar: 'تم تأكيد موعد سر الاعتراف',
    body_en: `Your confession appointment with Fr. Menas Shenouda is confirmed for ${dayAfterStr} at 4:00 PM.`,
    body_ar: `تم تأكيد موعد سر الاعتراف مع الراهب القس مينا شنودة يوم ${dayAfterStr} الساعة 4:00 م.`,
    metadata: {
      priestName: 'Fr. Menas Shenouda',
      date: dayAfterStr,
      time: '16:00',
    },
    is_read: true,
    sent_at: new Date(Date.now() - 43200000).toISOString(),
  }
];
