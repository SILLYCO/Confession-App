import { User, PriestProfile, Booking, NotificationLog, DEFAULT_SKELETON_AVATAR } from '../types/database';

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

export const INITIAL_MOCK_BOOKINGS: Booking[] = [];

export const INITIAL_MOCK_NOTIFICATIONS: NotificationLog[] = [];

