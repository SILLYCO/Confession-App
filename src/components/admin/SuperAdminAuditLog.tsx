import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { BookingStatus } from '../../types/database';
import { Badge } from '../common/Badge';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Church, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  ShieldAlert, 
  ShieldCheck, 
  User as UserIcon,
  RefreshCw,
  Mail
} from 'lucide-react';

export const SuperAdminAuditLog: React.FC = () => {
  const { t, language, formatDate, formatTime } = useTranslation();
  const { bookings, allUsers, notificationLogs, refreshData } = useAppStore();

  const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'bookings' | 'cancellations' | 'attendance' | 'notifications'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Unify all system events into a single chronological stream
  const allEvents = useMemo(() => {
    const events: Array<{
      id: string;
      category: 'booking' | 'cancellation' | 'attendance' | 'notification';
      title: string;
      description: string;
      timestamp: string;
      status?: BookingStatus;
      actorName?: string;
      userName?: string;
      priestName?: string;
      metadata?: any;
    }> = [];

    // 1. Process Bookings
    bookings.forEach((b) => {
      const member = allUsers.find(u => u.id === b.user_id);
      const priest = allUsers.find(u => u.id === b.priest_id);
      const memberName = member?.name || 'Member';
      const priestName = language === 'ar' ? (priest?.title_ar || priest?.name) : (priest?.title_en || priest?.name);

      // A. Initial Booking Creation
      events.push({
        id: `book_${b.id}`,
        category: 'booking',
        title: language === 'ar' ? 'حجز موعد اعتراف جديد' : 'New Confession Booking Created',
        description: language === 'ar'
          ? `تم حجز موعد اعتراف للشماس / العضو [${memberName}] مع [${priestName}] يوم ${formatDate(b.date)} الساعة ${formatTime(b.start_time)}.`
          : `Confession appointment reserved for [${memberName}] with [${priestName}] on ${formatDate(b.date)} at ${formatTime(b.start_time)}.`,
        timestamp: b.created_at || `${b.date}T${b.start_time}:00`,
        status: b.status === 'confirmed' ? 'confirmed' : undefined,
        actorName: memberName,
        userName: memberName,
        priestName: priestName,
      });

      // B. Cancellation Event
      if (b.status === 'cancelled') {
        const canceller = allUsers.find(u => u.id === b.cancelled_by);
        const cancellerName = canceller ? (language === 'ar' ? (canceller.title_ar || canceller.name) : (canceller.title_en || canceller.name)) : 'System';
        
        events.push({
          id: `cancel_${b.id}`,
          category: 'cancellation',
          title: language === 'ar' ? 'إلغاء موعد اعتراف' : 'Confession Appointment Cancelled',
          description: language === 'ar'
            ? `تم إلغاء الموعد بواسطة [${cancellerName}] - السبب: ${b.cancellation_reason || 'user_cancelled'}`
            : `Appointment cancelled by [${cancellerName}] - Reason: ${b.cancellation_reason || 'user_cancelled'}`,
          timestamp: b.cancelled_at || `${b.date}T${b.start_time}:00`,
          status: 'cancelled',
          actorName: cancellerName,
          userName: memberName,
          priestName: priestName,
        });
      }

      // C. Attendance / Completion Event
      if (b.status === 'completed' || b.status === 'no_show') {
        events.push({
          id: `attend_${b.id}`,
          category: 'attendance',
          title: b.status === 'completed' 
            ? (language === 'ar' ? 'إتمام نوال سر الاعتراف المقدس' : 'Confession Sacrament Completed')
            : (language === 'ar' ? 'تسجيل عدم حضور (No-Show)' : 'Marked as No-Show'),
          description: language === 'ar'
            ? `قام [${priestName}] بتسجيل حضور [${memberName}]. ${b.attendance_notes ? `ملاحظات: "${b.attendance_notes}"` : ''}`
            : `[${priestName}] recorded attendance for [${memberName}]. ${b.attendance_notes ? `Notes: "${b.attendance_notes}"` : ''}`,
          timestamp: b.completed_at || `${b.date}T${b.end_time}:00`,
          status: b.status,
          actorName: priestName,
          userName: memberName,
          priestName: priestName,
        });
      }
    });

    // 2. Process Notification Logs
    notificationLogs.forEach((n) => {
      events.push({
        id: `notif_${n.id}`,
        category: 'notification',
        title: language === 'ar' ? (n.title_ar || n.title_en) : n.title_en,
        description: language === 'ar' ? (n.body_ar || n.body_en) : n.body_en,
        timestamp: n.sent_at,
        actorName: 'Notification Engine',
        metadata: { email: n.recipient_email, type: n.type },
      });
    });

    // Sort all chronologically descending
    return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [bookings, allUsers, notificationLogs, language, formatDate, formatTime]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      // Category filter
      if (eventTypeFilter === 'bookings' && event.category !== 'booking') return false;
      if (eventTypeFilter === 'cancellations' && event.category !== 'cancellation') return false;
      if (eventTypeFilter === 'attendance' && event.category !== 'attendance') return false;
      if (eventTypeFilter === 'notifications' && event.category !== 'notification') return false;

      // Date filter
      if (dateFilter && !event.timestamp.startsWith(dateFilter)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = event.title.toLowerCase().includes(q);
        const matchDesc = event.description.toLowerCase().includes(q);
        const matchActor = event.actorName?.toLowerCase().includes(q);
        const matchUser = event.userName?.toLowerCase().includes(q);
        const matchPriest = event.priestName?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchActor && !matchUser && !matchPriest) return false;
      }

      return true;
    });
  }, [allEvents, eventTypeFilter, dateFilter, searchQuery]);

  const getEventIcon = (category: string, status?: string) => {
    switch (category) {
      case 'booking':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'cancellation':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'attendance':
        return status === 'completed' 
          ? <CheckCircle2 className="w-4 h-4 text-sky-600" />
          : <UserCheck className="w-4 h-4 text-stone-600" />;
      case 'notification':
        return <Mail className="w-4 h-4 text-purple-600" />;
      default:
        return <History className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 sm:p-8 text-white shadow-xl border border-gold-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold border border-gold-400/30">
              <History className="w-4 h-4 text-gold-400" />
              <span>Parish Administrative Audit & Activity Log</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-white">
              {t.adminFlow.auditLogTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              {t.adminFlow.auditLogSubtitle}
            </p>
          </div>

          <button
            onClick={() => refreshData()}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.common.refresh}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث في تفاصيل وسجل العمليات...' : 'Search activity logs...'}
              className="w-full text-xs rounded-2xl border border-stone-200 bg-stone-50 py-2.5 ps-10 pe-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500 transition"
            />
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs rounded-2xl border border-stone-200 bg-stone-50 py-2 px-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                {t.common.cancel}
              </button>
            )}
          </div>

        </div>

        {/* Filter Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { key: 'all', label: t.adminFlow.allEvents, count: allEvents.length },
            { key: 'bookings', label: t.adminFlow.bookingEvents, count: allEvents.filter(e => e.category === 'booking').length },
            { key: 'cancellations', label: t.adminFlow.cancellationEvents, count: allEvents.filter(e => e.category === 'cancellation').length },
            { key: 'attendance', label: t.adminFlow.attendanceEvents, count: allEvents.filter(e => e.category === 'attendance').length },
            { key: 'notifications', label: t.adminFlow.notificationEvents, count: allEvents.filter(e => e.category === 'notification').length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setEventTypeFilter(key as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition whitespace-nowrap flex items-center gap-1.5 ${
                eventTypeFilter === key
                  ? 'bg-navy-950 text-gold-400 border-navy-950 shadow-sm'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border-stone-200'
              }`}
            >
              <span>{label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                eventTypeFilter === key ? 'bg-gold-500/30 text-gold-300' : 'bg-stone-200/70 text-stone-600'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>

      </div>

      {/* Audit Log Timeline Stream */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">
        {filteredEvents.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-400">
            {language === 'ar' ? 'لا توجد عمليات مطابقة لبحثك في سجل الرقابة.' : 'No audit log events match your filters.'}
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div key={event.id} className="p-4 sm:p-5 hover:bg-stone-50/70 transition flex items-start justify-between gap-4">
              
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-2xl bg-stone-100 border border-stone-200 shrink-0 mt-0.5">
                  {getEventIcon(event.category, event.status)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-navy-950">
                      {event.title}
                    </h4>
                    {event.status && (
                      <Badge status={event.status} size="sm" />
                    )}
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {event.description}
                  </p>

                  {event.metadata?.email && (
                    <p className="text-[11px] text-purple-700 font-mono">
                      To: {event.metadata.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Timestamp on Right */}
              <div className="text-end shrink-0 text-[11px] text-stone-400 font-mono">
                <span>{event.timestamp.slice(0, 16).replace('T', ' ')}</span>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
