import { User, PriestProfile, Booking, NotificationLog, DEFAULT_SKELETON_AVATAR } from '../types/database';
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
    avatar_url: DEFAULT_SKELETON_AVATAR,
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Fr. Bishoy Ahdy',
    email: 'fr.bishoy@church.org',
    phone: '+20 122 345 6789',
    role: 'priest',
    title_en: 'Fr. Bishoy Ahdy',
    title_ar: 'القس بيشوي عهدي',
    avatar_url: DEFAULT_SKELETON_AVATAR,
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
      '11111111-1111-1111-1111-111111111111'
    ],
    avatar_url: DEFAULT_SKELETON_AVATAR,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Peter Mark',
    email: 'peter@example.com',
    phone: '01012345678',
    secondary_phone: '01298765432',
    gender: 'male',
    date_of_birth: '1998-05-14',
    national_id: '29805140102345',
    marital_status: 'single',
    profession: 'مهندس برمجيات',
    education: 'بكالوريوس هندسة حاسبات',
    address: '15 شارع شبرا، القاهرة',
    service_status: 'servant',
    serving_stage: 'خدمة إعدادي وثانوي',
    other_services: 'شماس وخادم كشافة',
    confession_father_id: '11111111-1111-1111-1111-111111111111',
    role: 'general',
    title_en: 'Church Member',
    title_ar: 'بيتر مرقس',
    avatar_url: DEFAULT_SKELETON_AVATAR,
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Mary George',
    email: 'mary@example.com',
    phone: '01123456789',
    gender: 'female',
    date_of_birth: '1995-11-22',
    national_id: '29511220108765',
    marital_status: 'married',
    profession: 'معلمة لغة إنجليزية',
    education: 'ليسانس ألسن',
    address: '22 شارع الترعة البولاقية، شبرا',
    service_status: 'servant',
    serving_stage: 'خدمة حضانة وابتدائي',
    other_services: 'خدمة الكورال والرعاية',
    confession_father_id: '11111111-1111-1111-1111-111111111111',
    role: 'general',
    title_en: 'Church Member',
    title_ar: 'مريم جرجس',
    avatar_url: DEFAULT_SKELETON_AVATAR,
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'David Samuel',
    email: 'david@example.com',
    phone: '01234567890',
    gender: 'male',
    date_of_birth: '2005-08-10',
    national_id: '30508100104321',
    marital_status: 'single',
    profession: 'طالب جامعي',
    education: 'كلية الهندسة (الفرقة الثانية)',
    address: '8 شارع خلوصي، شبرا',
    service_status: 'general_member',
    confession_father_id: '11111111-1111-1111-1111-111111111111',
    role: 'general',
    title_en: 'Church Member',
    title_ar: 'داود صموئيل',
    avatar_url: DEFAULT_SKELETON_AVATAR,
  }
];

export const MOCK_PRIEST_PROFILES: PriestProfile[] = [
  {
    priest_id: '11111111-1111-1111-1111-111111111111',
    avg_confession_minutes: 20,
    weekly_schedule: [
      { id: 'w1', dayOfWeek: 0, startTime: '12:00', endTime: '15:00' }, // Sunday after Liturgy
      { id: 'w2', dayOfWeek: 1, startTime: '17:00', endTime: '20:00' }, // Monday evening
      { id: 'w3', dayOfWeek: 3, startTime: '18:00', endTime: '21:00' }, // Wednesday evening
      { id: 'w4', dayOfWeek: 5, startTime: '17:00', endTime: '20:00' }, // Friday evening
      { id: 'w5', dayOfWeek: 6, startTime: '10:00', endTime: '13:00' }, // Saturday morning
    ],
    schedule_overrides: [],
    church_name_ar: 'كنيسة السيدة العذراء والشهيد مارجرجس',
    church_name_en: 'St. Mary & St. George Church',
    bio_ar: 'أب اعتراف وراعي كنسي مبارك. يقدم سر الاعتراف المقدس والإرشاد الروحي ورعاية الأسرة المسيحية.',
    bio_en: 'Parish priest serving the holy sacrament of confession, spiritual guidance, and pastoral family counseling.',
  }
];

const today = new Date();
const tomorrowStr = format(addDays(today, 1), 'yyyy-MM-dd');
const twentyDaysAgoStr = format(addDays(today, -20), 'yyyy-MM-dd');
const fiftyDaysAgoStr = format(addDays(today, -50), 'yyyy-MM-dd');
const fifteenDaysAgoStr = format(addDays(today, -15), 'yyyy-MM-dd');

export const INITIAL_MOCK_BOOKINGS: Booking[] = [
  // Peter Mark Confirmed upcoming tomorrow
  {
    id: 'book-001',
    user_id: '44444444-4444-4444-4444-444444444444', // Peter Mark
    priest_id: '11111111-1111-1111-1111-111111111111', // Fr. Bishoy Ahdy
    slot_id: `slot_11111111-1111-1111-1111-111111111111_${tomorrowStr}_1700`,
    date: tomorrowStr,
    start_time: '17:00',
    end_time: '17:20',
    status: 'confirmed',
    notes: 'حجز لمتابعة الاعتراف الشهري والإرشاد الروحي.',
    priest_private_notes: 'شماس وخادم ملتزم - تم إرشاده بمواظبة صلوات الأجبية وقراءة إنجيل يوحنا يومياً.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  // Peter Mark past completed 20 days ago
  {
    id: 'book-002',
    user_id: '44444444-4444-4444-4444-444444444444',
    priest_id: '11111111-1111-1111-1111-111111111111',
    slot_id: `slot_11111111-1111-1111-1111-111111111111_${twentyDaysAgoStr}_1720`,
    date: twentyDaysAgoStr,
    start_time: '17:20',
    end_time: '17:40',
    status: 'completed',
    completed_at: `${twentyDaysAgoStr}T17:38:00Z`,
    notes: 'جلسة اعتراف دورية ومراجعة قانون الصوم.',
    priest_private_notes: 'جلسة اعتراف مريحة ونوال الحل والبركة بعد مناقشة ترتيبات الخدمة.',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  // Peter Mark past completed 50 days ago
  {
    id: 'book-003',
    user_id: '44444444-4444-4444-4444-444444444444',
    priest_id: '11111111-1111-1111-1111-111111111111',
    slot_id: `slot_11111111-1111-1111-1111-111111111111_${fiftyDaysAgoStr}_1800`,
    date: fiftyDaysAgoStr,
    start_time: '18:00',
    end_time: '18:20',
    status: 'completed',
    completed_at: `${fiftyDaysAgoStr}T18:20:00Z`,
    notes: 'جلسة اعتراف سابقة.',
    created_at: new Date(Date.now() - 55 * 86400000).toISOString(),
  },
  // Mary George Confirmed upcoming
  {
    id: 'book-004',
    user_id: '55555555-5555-5555-5555-555555555555', // Mary George
    priest_id: '11111111-1111-1111-1111-111111111111',
    slot_id: `slot_11111111-1111-1111-1111-111111111111_${tomorrowStr}_1800`,
    date: tomorrowStr,
    start_time: '18:00',
    end_time: '18:20',
    status: 'confirmed',
    notes: 'طلب إرشاد أسري مع جلسة الاعتراف.',
    priest_private_notes: 'متابعة الصلاة الأسرية وقانون التوبة.',
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  // Mary George past completed 15 days ago
  {
    id: 'book-005',
    user_id: '55555555-5555-5555-5555-555555555555',
    priest_id: '11111111-1111-1111-1111-111111111111',
    slot_id: `slot_11111111-1111-1111-1111-111111111111_${fifteenDaysAgoStr}_1830`,
    date: fifteenDaysAgoStr,
    start_time: '18:30',
    end_time: '18:50',
    status: 'completed',
    completed_at: `${fifteenDaysAgoStr}T18:48:00Z`,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
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
    body_en: `Your confession appointment with Fr. Bishoy Ahdy is confirmed for ${tomorrowStr} at 5:00 PM.`,
    body_ar: `تم تأكيد موعد سر الاعتراف مع القس بيشوي عهدي يوم ${tomorrowStr} الساعة 5:00 م.`,
    metadata: {
      priestName: 'Fr. Bishoy Ahdy',
      date: tomorrowStr,
      time: '17:00',
    },
    is_read: false,
    sent_at: new Date(Date.now() - 86400000).toISOString(),
  }
];
