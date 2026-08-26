import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { Church, Heart, Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, language } = useTranslation();

  return (
    <footer className="mt-auto border-t border-stone-200 bg-white dark:bg-navy-950 dark:border-navy-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-start">
          
          <div className="space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Church className="w-5 h-5 text-gold-500" />
              <span className="font-serif font-bold text-navy-950 dark:text-gold-400">
                {t.appName}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {t.churchName}
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs italic text-stone-600 dark:text-stone-300 font-serif">
              {language === 'ar' 
                ? '«إِنِ اعْتَرَفْنَا بِخَطَايَانَا فَهُوَ أَمِينٌ وَعَادِلٌ، حَتَّى يَغْفِرَ لَنَا خَطَايَانَا وَيُطَهِّرَنَا مِنْ كُلِّ إِثْمٍ» (١ يو ١: ٩)' 
                : '"If we confess our sins, He is faithful and just to forgive us our sins and to cleanse us from all unrighteousness." (1 John 1:9)'}
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end text-xs text-stone-500 space-y-1">
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-gold-500" />
              <span>Postgres RLS Security & Supabase Auth</span>
            </div>
            <p className="text-[11px] text-stone-400">
              © {new Date().getFullYear()} St. George & St. Anthony Coptic Orthodox Parish
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};
