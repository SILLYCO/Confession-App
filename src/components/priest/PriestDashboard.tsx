import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { PriestScheduleEditor } from './PriestScheduleEditor';
import { PriestOverridesEditor } from './PriestOverridesEditor';
import { PriestBookingsList } from './PriestBookingsList';
import { PriestProfileEditor } from './PriestProfileEditor';
import { DEFAULT_SKELETON_AVATAR } from '../../types/database';
import { Clock, CalendarOff, UserCheck, Church, UserCircle } from 'lucide-react';

interface PriestDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const PriestDashboard: React.FC<PriestDashboardProps> = ({ activeTab, onTabChange }) => {
  const { t, language } = useTranslation();
  const { currentUser, priestProfiles } = useAppStore();

  if (!currentUser) return null;

  const profile = priestProfiles.find(p => p.priest_id === currentUser.id);

  // Map global activeTab to current priest view
  const currentView = 
    activeTab === 'priest_overrides' ? 'overrides' :
    activeTab === 'priest_appointments' ? 'appointments' :
    activeTab === 'priest_profile' ? 'profile' :
    'schedule';

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Priest Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-church-950 to-navy-900 p-6 sm:p-8 text-white shadow-xl border border-gold-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-4">
            <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ring-4 ring-gold-400 shadow-lg overflow-hidden bg-stone-800 flex items-center justify-center">
              <img
                src={currentUser.avatar_url || DEFAULT_SKELETON_AVATAR}
                alt={currentUser.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold mb-1 border border-gold-500/30">
                <Church className="w-3.5 h-3.5" />
                <span>Father's Pastoral Portal</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                {language === 'ar' ? (currentUser.title_ar || currentUser.name) : (currentUser.title_en || currentUser.name)}
              </h2>
              <p className="text-xs text-stone-300">
                {language === 'ar' ? profile?.church_name_ar : profile?.church_name_en}
              </p>
            </div>
          </div>

          <button
            onClick={() => onTabChange('priest_profile')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl border text-xs font-bold transition self-start sm:self-auto ${
              currentView === 'profile'
                ? 'bg-gold-500 text-navy-950 border-gold-400 shadow-md'
                : 'bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border-gold-500/40'
            }`}
          >
            <UserCircle className="w-4 h-4" />
            <span>Edit Profile & Photo</span>
          </button>
        </div>
      </div>

      {/* Priest Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => onTabChange('priest_schedule')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 ${
            currentView === 'schedule'
              ? 'bg-navy-950 text-gold-400 shadow-md ring-1 ring-navy-800'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t.priestFlow.weeklyRecurringSchedule} & Duration</span>
        </button>

        <button
          onClick={() => onTabChange('priest_overrides')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 ${
            currentView === 'overrides'
              ? 'bg-navy-950 text-gold-400 shadow-md ring-1 ring-navy-800'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <CalendarOff className="w-4 h-4" />
          <span>{t.priestFlow.scheduleOverridesTitle}</span>
        </button>

        <button
          onClick={() => onTabChange('priest_appointments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 ${
            currentView === 'appointments'
              ? 'bg-navy-950 text-gold-400 shadow-md ring-1 ring-navy-800'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{t.priestFlow.upcomingConfessions}</span>
        </button>

        <button
          onClick={() => onTabChange('priest_profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 ${
            currentView === 'profile'
              ? 'bg-navy-950 text-gold-400 shadow-md ring-1 ring-navy-800'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <UserCircle className="w-4 h-4" />
          <span>{t.nav.priestProfile}</span>
        </button>
      </div>

      {/* Subtab Content */}
      <div>
        {currentView === 'schedule' && <PriestScheduleEditor />}
        {currentView === 'overrides' && <PriestOverridesEditor />}
        {currentView === 'appointments' && <PriestBookingsList />}
        {currentView === 'profile' && <PriestProfileEditor />}
      </div>

    </div>
  );
};
