import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { 
  Megaphone, 
  Bell, 
  X, 
  Flame 
} from 'lucide-react';

export const ParishAnnouncementBanner: React.FC = () => {
  const { language, t } = useTranslation();
  const { currentUser, getActiveAnnouncementsForUser } = useAppStore();

  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem('dismissed_announcement_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const activeAnnouncements = getActiveAnnouncementsForUser(currentUser?.role);

  // Filter out dismissed announcements (unless marked as emergency)
  const visibleAnnouncements = activeAnnouncements.filter(
    a => a.priority === 'emergency' || !dismissedIds.includes(a.id)
  );

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      sessionStorage.setItem('dismissed_announcement_ids', JSON.stringify(updated));
    } catch {}
  };

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="space-y-2.5 mb-2 animate-in fade-in slide-in-from-top-2">
      {visibleAnnouncements.map((announcement) => {
        const title = language === 'ar' ? (announcement.title_ar || announcement.title_en) : (announcement.title_en || announcement.title_ar);
        const content = language === 'ar' ? (announcement.content_ar || announcement.content_en) : (announcement.content_en || announcement.content_ar);

        // Emergency Style (Rose / Crimson)
        if (announcement.priority === 'emergency') {
          return (
            <div
              key={announcement.id}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 p-3.5 sm:p-4 text-white shadow-md border border-rose-400/40"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold font-serif leading-snug">
                      {title}
                    </h4>
                    <p className="text-xs text-rose-100 leading-relaxed">
                      {content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // Important Style (Church Gold / Amber)
        if (announcement.priority === 'important') {
          return (
            <div
              key={announcement.id}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-gold-500 to-amber-500 p-3.5 sm:p-4 text-navy-950 shadow-md border border-gold-300"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-navy-950 text-gold-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold font-serif leading-snug">
                      {title}
                    </h4>
                    <p className="text-xs text-navy-950/90 leading-relaxed font-medium">
                      {content}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDismiss(announcement.id)}
                  className="p-1 rounded-lg text-navy-950/60 hover:text-navy-950 hover:bg-black/10 transition shrink-0"
                  title={t.announcements.dismiss}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        }

        // Normal Style (Deep Navy / Slate)
        return (
          <div
            key={announcement.id}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-3.5 sm:p-4 text-white shadow-md border border-stone-700"
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-gold-500 text-navy-950 flex items-center justify-center shrink-0 mt-0.5">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold font-serif leading-snug">
                    {title}
                  </h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {content}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDismiss(announcement.id)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition shrink-0"
                title={t.announcements.dismiss}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
