import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { User, DEFAULT_SKELETON_AVATAR } from '../../types/database';
import { SlotCalendar } from './SlotCalendar';
import { ArrowLeft, Clock, Church, Calendar } from 'lucide-react';

interface PriestAppointmentsPageProps {
  priest: User;
  onBack: () => void;
  onBookingComplete?: () => void;
}

export const PriestAppointmentsPage: React.FC<PriestAppointmentsPageProps> = ({
  priest,
  onBack,
  onBookingComplete,
}) => {
  const { t, language } = useTranslation();
  const { priestProfiles, getPriestSlots } = useAppStore();

  const profile = priestProfiles.find((p) => p.priest_id === priest.id);
  const slots = getPriestSlots(priest.id, new Date(), 14);
  const availableSlotsCount = slots.filter((s) => s.status === 'available').length;

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Navigation Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-xs sm:text-sm font-bold text-navy-950 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t.userFlow.backToPriestsList}</span>
        </button>

        <div className="text-xs text-stone-500 hidden sm:block">
          <span>{t.churchName}</span>
        </div>
      </div>

      {/* Selected Priest Pastoral Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-church-950 text-white p-5 sm:p-8 shadow-xl border border-gold-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-4 sm:gap-5">
            
            {/* Fixed-dimension priest avatar with aspect ratio lock */}
            <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ring-4 ring-gold-400/80 shadow-lg overflow-hidden bg-stone-800 flex items-center justify-center">
              <img
                src={priest.avatar_url || DEFAULT_SKELETON_AVATAR}
                alt={priest.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold border border-gold-500/30">
                <Church className="w-3.5 h-3.5 text-gold-400" />
                <span>{language === 'ar' ? 'أب الاعتراف' : 'Father of Confession'}</span>
              </div>

              <h2 className="text-xl sm:text-3xl font-serif font-bold text-white break-words">
                {language === 'ar' ? (priest.title_ar || priest.name) : (priest.title_en || priest.name)}
              </h2>

              <p className="text-xs sm:text-sm text-church-300 break-words">
                {language === 'ar' ? profile?.church_name_ar : profile?.church_name_en}
              </p>

              <p className="text-xs text-stone-300 max-w-xl leading-relaxed pt-1 break-words">
                {language === 'ar' ? profile?.bio_ar : profile?.bio_en}
              </p>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-center justify-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-800">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-500 text-navy-950 text-xs font-bold shadow">
              <Clock className="w-4 h-4" />
              <span>{language === 'ar' ? `متوسط ${profile?.avg_confession_minutes || 15} دقيقة` : `${profile?.avg_confession_minutes || 15} ${t.common.minutes} avg`}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
              <Calendar className="w-4 h-4" />
              <span>{availableSlotsCount} {t.status.available}</span>
            </span>
          </div>

        </div>
      </div>

      {/* 14-Day Rolling Slots Calendar */}
      <div className="pt-2">
        <SlotCalendar
          priest={priest}
          onBookingComplete={onBookingComplete}
        />
      </div>

    </div>
  );
};
