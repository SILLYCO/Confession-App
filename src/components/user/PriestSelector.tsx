import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { User, DEFAULT_SKELETON_AVATAR } from '../../types/database';
import { Clock, Calendar, Church, ArrowRight } from 'lucide-react';

interface PriestSelectorProps {
  onSelectPriest: (priest: User) => void;
}

export const PriestSelector: React.FC<PriestSelectorProps> = ({ onSelectPriest }) => {
  const { t, language } = useTranslation();
  const { priests, priestProfiles, getPriestSlots } = useAppStore();

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-navy-950">
            {t.userFlow.selectPriest}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {t.userFlow.selectPriestDesc}
          </p>
        </div>

        <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-3 py-1 rounded-full self-start sm:self-auto">
          {priests.length} {language === 'ar' ? 'آباء متاحون' : 'Fathers Available'}
        </span>
      </div>

      {/* Priest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {priests.map((priest) => {
          const profile = priestProfiles.find((p) => p.priest_id === priest.id);
          const slots = getPriestSlots(priest.id, new Date(), 14);
          const availableSlotsCount = slots.filter((s) => s.status === 'available').length;

          return (
            <div
              key={priest.id}
              onClick={() => onSelectPriest(priest)}
              className="group relative overflow-hidden rounded-3xl p-5 sm:p-7 border-2 border-stone-200 hover:border-gold-500 bg-white hover:bg-gold-50/20 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              
              {/* Top Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-4 sm:gap-5">
                
                {/* Fixed-dimension priest avatar with aspect ratio lock */}
                <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ring-2 ring-gold-400/80 shadow-md overflow-hidden bg-stone-100 flex items-center justify-center">
                  <img
                    src={priest.avatar_url || DEFAULT_SKELETON_AVATAR}
                    alt={priest.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex-1 min-w-0 w-full">
                  <h3 className="text-base sm:text-lg font-bold text-navy-950 group-hover:text-gold-700 transition-colors break-words">
                    {language === 'ar' ? (priest.title_ar || priest.name) : (priest.title_en || priest.name)}
                  </h3>

                  <p className="text-xs text-church-700 font-medium mt-0.5 break-words">
                    {language === 'ar' ? profile?.church_name_ar : profile?.church_name_en}
                  </p>

                  <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed break-words">
                    {language === 'ar' ? profile?.bio_ar : profile?.bio_en}
                  </p>
                </div>
              </div>

              {/* Badges & CTA Footer */}
              <div className="mt-5 pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gold-100 text-church-900 px-3 py-1 rounded-full border border-gold-300">
                    <Clock className="w-3.5 h-3.5 text-church-700" />
                    <span>{language === 'ar' ? `متوسط ${profile?.avg_confession_minutes || 15} دقيقة` : `${profile?.avg_confession_minutes || 15} ${t.common.minutes} avg`}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{availableSlotsCount} {t.status.available}</span>
                  </span>
                </div>

                {/* Primary CTA Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPriest(priest);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-navy-950 group-hover:bg-gold-500 text-gold-400 group-hover:text-navy-950 text-xs font-bold shadow transition-all shrink-0"
                >
                  <span>{t.userFlow.bookWithPriest}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </button>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
