import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-navy-700 hover:bg-stone-100 dark:hover:bg-navy-800 text-xs sm:text-sm font-semibold transition text-stone-700 dark:text-stone-200"
      title={language === 'en' ? 'التحويل إلى اللغة العربية' : 'Switch to English'}
    >
      <Globe className="w-4 h-4 text-gold-500" />
      <span>{language === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
};
