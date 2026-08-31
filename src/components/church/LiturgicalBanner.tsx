import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { UserActiveBookingCard } from '../user/UserActiveBookingCard';
import { Sparkles, CalendarCheck, Clock, Heart } from 'lucide-react';

export const LiturgicalBanner: React.FC = () => {
  const { t, language } = useTranslation();
  const { currentUser, getUserActiveBooking, getConfessionRhythm, priests } = useAppStore();

  const activeBooking = currentUser?.role === 'general' ? getUserActiveBooking() : undefined;
  const rhythmInfo = currentUser?.role === 'general' ? getConfessionRhythm(currentUser.id) : null;
  const assignedFather = priests.find(p => p.id === currentUser?.confession_father_id) || priests[0];

  return (
    <div className="space-y-6">
      {/* Liturgical Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-church-950 text-white shadow-xl border border-gold-500/30 p-6 sm:p-10">
        
        {/* Subtle decorative cross background */}
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10 pointer-events-none">
          <svg className="w-96 h-96 text-gold-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 2h2v7h7v2h-7v11h-2V11H4V9h7V2z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-gold-500/30">
            <span className="text-gold-400">✝</span>
            <span>{t.appSubtitle}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white mb-3 tracking-tight">
            {t.churchName}
          </h2>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-light">
            {language === 'ar'
              ? 'مرحباً بك في نظام حجز ومتابعة مواعيد سر الاعتراف المقدس. يمكنك اختيار أب الاعتراف، واستعراض المواعيد المتاحة على مدار الأسبوعين القادمين، وحجز موعدك بكل سهولة وسرية.'
              : 'Welcome to the Holy Confession Appointment Portal. Browse your Spiritual Father, view auto-generated available slots for the rolling 14-day horizon, and reserve your sacred appointment.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs text-gold-200/80">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{t.userFlow.rollingWindowNotice}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>{language === 'ar' ? 'حد أقصى حجز نشط واحد فقط' : '1 Active Confession Booking Limit'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confession Rhythm Overdue Gentle Encouragement Banner */}
      {!activeBooking && rhythmInfo && rhythmInfo.status === 'overdue' && currentUser?.confession_reminder_enabled !== false && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-gold-50/70 to-stone-50 border border-gold-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-200 text-church-900 flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-gold-700" />
            </div>
            <div className="space-y-1 text-center sm:text-start">
              <h4 className="font-bold text-xs sm:text-sm text-navy-950 font-serif flex items-center justify-center sm:justify-start gap-1.5">
                <span>{t.profile.rhythmOverdueBannerTitle}</span>
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t.profile.rhythmOverdueBannerBody
                  .replace('{days}', String(rhythmInfo.daysSinceLast || 30))
                  .replace('{priestName}', language === 'ar' ? (assignedFather?.title_ar || assignedFather?.name || '') : (assignedFather?.title_en || assignedFather?.name || ''))}
              </p>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center gap-2">
            <span className="px-3.5 py-2 rounded-xl bg-navy-950 text-gold-400 text-xs font-bold shadow flex items-center gap-1.5 whitespace-nowrap">
              <CalendarCheck className="w-4 h-4 text-gold-400" />
              <span>{t.profile.bookNowBtn}</span>
            </span>
          </div>
        </div>
      )}

      {/* If General User has an active booking, display prominent notification card */}
      {activeBooking && (
        <UserActiveBookingCard booking={activeBooking} />
      )}
    </div>
  );
};
