import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { UserActiveBookingCard } from '../user/UserActiveBookingCard';

export const LiturgicalBanner: React.FC = () => {
  const { t, language } = useTranslation();
  const { currentUser, getUserActiveBooking } = useAppStore();

  const activeBooking = currentUser?.role === 'general' ? getUserActiveBooking() : undefined;

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

      {/* If General User has an active booking, display prominent notification card */}
      {activeBooking && (
        <UserActiveBookingCard booking={activeBooking} />
      )}
    </div>
  );
};
