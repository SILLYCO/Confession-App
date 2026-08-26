import React from 'react';
import { useAppStore } from '../../lib/store';
import { useTranslation } from '../../lib/i18n';
import { Sparkles, Check } from 'lucide-react';
import { UserRole } from '../../types/database';

export const UserSwitcherBar: React.FC = () => {
  const { allUsers, currentUser, setCurrentUser } = useAppStore();
  const { language, t } = useTranslation();

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'priest':
        return '⛪';
      case 'secretary':
        return '📋';
      case 'general':
        return '👤';
    }
  };

  return (
    <div className="bg-navy-950 text-stone-200 border-b border-navy-800 text-xs py-1.5 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        
        <div className="flex items-center gap-2 font-medium text-gold-400">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            {t.nav.demoRoleSwitcher}:
          </span>
          <span className="hidden sm:inline text-stone-400">
            {language === 'ar' ? '(اختر حساباً لاختبار الصلاحيات والقواعد)' : '(Select an account to test permissions & rules)'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {allUsers.map((user) => {
            const isSelected = user.id === currentUser?.id;
            return (
              <button
                key={user.id}
                onClick={() => setCurrentUser(user)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-gold-500 text-navy-950 ring-2 ring-gold-300 font-bold shadow-md scale-105'
                    : 'bg-navy-900/80 text-stone-300 hover:bg-navy-800 hover:text-white border border-navy-700/60'
                }`}
                title={user.email}
              >
                <span>{getRoleIcon(user.role)}</span>
                <span>{language === 'ar' ? (user.title_ar || user.name) : (user.title_en || user.name)}</span>
                {isSelected && <Check className="w-3 h-3" />}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
