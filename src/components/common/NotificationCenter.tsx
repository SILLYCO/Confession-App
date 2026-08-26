import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { X, Mail, Bell, CheckCircle, AlertTriangle, Calendar, Clock, User as UserIcon } from 'lucide-react';
import { NotificationLog } from '../../types/database';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { t, language, formatDate, formatTime } = useTranslation();
  const { 
    currentUser, 
    notificationLogs, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useAppStore();

  if (!isOpen) return null;

  const relevantNotifications = currentUser?.role === 'secretary'
    ? notificationLogs
    : notificationLogs.filter(n => n.user_id === currentUser?.id);

  const getNotifIcon = (type: NotificationLog['type']) => {
    switch (type) {
      case 'booking_confirmed':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'booking_force_cancelled_schedule_change':
      case 'booking_force_cancelled_priest_unavailable':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'booking_cancelled_by_user':
      case 'booking_cancelled_by_secretary':
      default:
        return <Mail className="w-5 h-5 text-rose-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-navy-900 text-white border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-navy-800 text-gold-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t.notifications.title}</h2>
              <p className="text-xs text-stone-300">
                {currentUser?.role === 'secretary' 
                  ? (language === 'ar' ? 'جميع إشعارات وإيميلات الكنيسة المرسلة' : 'All church email notifications & dispatches') 
                  : (language === 'ar' ? `سجل الإيميلات الخاصة بـ ${currentUser?.name || 'المستخدم'}` : `Email log for ${currentUser?.name || 'User'}`)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {relevantNotifications.length > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs text-gold-300 hover:text-gold-100 hover:underline px-2 py-1 rounded transition"
              >
                {t.notifications.markAllRead}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-navy-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50">
          {relevantNotifications.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-30 text-stone-600" />
              <p className="text-sm">{t.notifications.empty}</p>
            </div>
          ) : (
            relevantNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-4 rounded-xl border transition-all ${
                  notif.is_read
                    ? 'bg-white border-stone-200 text-stone-700 opacity-90'
                    : 'bg-gold-50/60 border-gold-200 text-stone-900 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-stone-100 shrink-0">
                    {getNotifIcon(notif.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-stone-900">
                        {language === 'ar' ? notif.title_ar : notif.title_en}
                      </h4>
                      <span className="text-[11px] text-stone-400 shrink-0">
                        {formatDate(notif.sent_at, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-3">
                      {language === 'ar' ? notif.body_ar : notif.body_en}
                    </p>

                    {/* Metadata pill details */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 pt-2 border-t border-stone-200/60">
                      <span className="inline-flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                        <Mail className="w-3 h-3 text-stone-400" />
                        {notif.recipient_email}
                      </span>
                      {notif.metadata?.date && (
                        <span className="inline-flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          {notif.metadata.date}
                        </span>
                      )}
                      {notif.metadata?.time && (
                        <span className="inline-flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {formatTime(notif.metadata.time)}
                        </span>
                      )}
                      {notif.metadata?.priestName && (
                        <span className="inline-flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                          <UserIcon className="w-3 h-3 text-stone-400" />
                          {notif.metadata.priestName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-stone-200 flex justify-between items-center text-xs text-stone-500">
          <span>📧 Supabase Edge Function & Resend Email Provider</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium transition"
          >
            {t.common.close}
          </button>
        </div>

      </div>
    </div>
  );
};
