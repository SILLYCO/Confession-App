import React, { useMemo } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { User, DEFAULT_SKELETON_AVATAR } from '../../types/database';
import { Badge } from '../common/Badge';
import { 
  X, 
  User as UserIcon, 
  Church, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  KeyRound, 
  Edit, 
  Phone, 
  Mail, 
  CheckCircle2, 
  CalendarCheck, 
  CalendarX, 
  History,
  Layers,
  Sparkles
} from 'lucide-react';

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEditUser: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  isOpen,
  onClose,
  onEditUser,
  onResetPassword,
}) => {
  const { t, language, formatDate, formatTime, getDayName } = useTranslation();
  const { 
    bookings, 
    allUsers, 
    priestProfiles, 
    getUserActiveBooking, 
    getUserBookings, 
    getPriestBookings 
  } = useAppStore();

  if (!isOpen || !user) return null;

  const priestProfile = user.role === 'priest' 
    ? priestProfiles.find(p => p.priest_id === user.id) 
    : undefined;

  // Member bookings
  const userBookings = user.role === 'general' ? getUserBookings(user.id) : [];
  const activeBooking = user.role === 'general' ? getUserActiveBooking(user.id) : undefined;
  const pastBookings = userBookings.filter(b => b.id !== activeBooking?.id);

  // Priest bookings
  const priestBookings = user.role === 'priest' ? getPriestBookings(user.id) : [];
  const priestCompletedCount = priestBookings.filter(b => b.status === 'completed').length;
  const priestConfirmedCount = priestBookings.filter(b => b.status === 'confirmed').length;

  // Secretary assigned priests
  const assignedPriestsList = useMemo(() => {
    if (user.role !== 'secretary' || !user.assigned_priest_ids) return [];
    return allUsers.filter(u => user.assigned_priest_ids?.includes(u.id));
  }, [user, allUsers]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white p-6 flex items-start justify-between border-b border-gold-500/30">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar_url || DEFAULT_SKELETON_AVATAR}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gold-400 bg-stone-800 shadow shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge role={user.role} size="sm" />
                <span className="text-[11px] text-stone-400 font-mono">ID: {user.id.slice(0, 8)}</span>
              </div>
              <h3 className="text-xl font-bold font-serif leading-tight">
                {language === 'ar' ? (user.title_ar || user.name) : (user.title_en || user.name)}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-300">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gold-400" />
                  <span className="font-mono">{user.email}</span>
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gold-400" />
                    <span>{user.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto">
          
          {/* GENERAL MEMBER VIEW */}
          {user.role === 'general' && (
            <div className="space-y-6">
              
              {/* Upcoming Confession Card */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gold-600" />
                  <span>{t.userFlow.upcomingAppointment}</span>
                </h4>

                {activeBooking ? (
                  (() => {
                    const priest = allUsers.find(u => u.id === activeBooking.priest_id);
                    return (
                      <div className="p-4 rounded-2xl bg-gold-50/80 border border-gold-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gold-500 text-navy-950 flex items-center justify-center font-bold">
                            <Church className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-church-700 bg-gold-200/70 px-2 py-0.5 rounded-full">
                              {t.status.confirmed}
                            </span>
                            <h5 className="font-bold text-sm text-navy-950 mt-0.5">
                              {language === 'ar' ? (priest?.title_ar || priest?.name) : (priest?.title_en || priest?.name)}
                            </h5>
                            <p className="text-xs text-stone-600">
                              {formatDate(activeBooking.date)} • {formatTime(activeBooking.start_time)} - {formatTime(activeBooking.end_time)}
                            </p>
                          </div>
                        </div>
                        <Badge status={activeBooking.status} size="sm" />
                      </div>
                    );
                  })()
                ) : (
                  <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl text-center text-xs text-stone-400">
                    {t.userFlow.noUpcomingAppointments}
                  </div>
                )}
              </div>

              {/* Past Confession History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-church-600" />
                  <span>{t.adminFlow.confessionHistory} ({userBookings.length})</span>
                </h4>

                {userBookings.length === 0 ? (
                  <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl text-center text-xs text-stone-400">
                    {t.adminFlow.noConfessionsYet}
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
                    {userBookings.map((b) => {
                      const priest = allUsers.find(u => u.id === b.priest_id);
                      return (
                        <div key={b.id} className="p-3.5 bg-white hover:bg-stone-50/70 transition flex items-center justify-between gap-3 text-xs">
                          <div className="space-y-0.5">
                            <p className="font-bold text-navy-950">
                              {language === 'ar' ? (priest?.title_ar || priest?.name) : (priest?.title_en || priest?.name)}
                            </p>
                            <p className="text-stone-500 text-[11px]">
                              {formatDate(b.date)} • {formatTime(b.start_time)}
                            </p>
                            {b.attendance_notes && (
                              <p className="text-[10px] text-stone-400 italic">
                                "{b.attendance_notes}"
                              </p>
                            )}
                          </div>
                          <Badge status={b.status} size="sm" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SECRETARY VIEW */}
          {user.role === 'secretary' && (
            <div className="space-y-6">
              
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>{t.adminFlow.assignedFathers} ({assignedPriestsList.length})</span>
                </h4>

                {assignedPriestsList.length === 0 ? (
                  <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl text-center text-xs text-stone-400">
                    {t.secretaryFlow.noAssignedPriests}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {assignedPriestsList.map((priest) => (
                      <div key={priest.id} className="p-3 bg-purple-50/50 border border-purple-200/80 rounded-2xl flex items-center gap-3">
                        <img
                          src={priest.avatar_url || DEFAULT_SKELETON_AVATAR}
                          alt={priest.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-purple-300 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-navy-950 truncate">
                            {language === 'ar' ? (priest.title_ar || priest.name) : (priest.title_en || priest.name)}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate">
                            {priest.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* PRIEST VIEW */}
          {user.role === 'priest' && (
            <div className="space-y-6">
              
              {/* Pastoral & Church Summary */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy-950">
                    {language === 'ar' ? priestProfile?.church_name_ar : priestProfile?.church_name_en}
                  </span>
                  <span className="font-bold bg-gold-100 text-church-900 px-2.5 py-0.5 rounded-full border border-gold-300">
                    ⏱ {priestProfile?.avg_confession_minutes || 15} {t.common.minutes} avg
                  </span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  {language === 'ar' ? priestProfile?.bio_ar : priestProfile?.bio_en}
                </p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">{t.adminFlow.totalConfessionsHeard}</span>
                  <span className="text-xl font-bold text-emerald-950">{priestCompletedCount}</span>
                </div>
                <div className="p-3 bg-gold-50 border border-gold-200 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-church-700 block">{t.status.confirmed}</span>
                  <span className="text-xl font-bold text-navy-950">{priestConfirmedCount}</span>
                </div>
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-sky-700 block">{t.adminFlow.weeklyWindowsTitle}</span>
                  <span className="text-xl font-bold text-sky-950">{priestProfile?.weekly_schedule?.length || 0}</span>
                </div>
              </div>

              {/* Weekly Recurring Availability Schedule Windows */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-church-600" />
                  <span>{t.adminFlow.weeklyWindowsTitle}</span>
                </h4>

                {(!priestProfile?.weekly_schedule || priestProfile.weekly_schedule.length === 0) ? (
                  <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl text-center text-xs text-stone-400">
                    {t.adminFlow.noWindowsConfigured}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {priestProfile.weekly_schedule.map((window) => (
                      <div key={window.id} className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between text-xs">
                        <span className="font-bold text-navy-950">{getDayName(window.dayOfWeek)}</span>
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-200 text-stone-700">
                          {formatTime(window.startTime)} - {formatTime(window.endTime)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onResetPassword(user);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-navy-950 text-xs font-bold border border-stone-300 transition shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5 text-gold-600" />
              <span>{t.adminFlow.resetPasswordBtn}</span>
            </button>

            <button
              onClick={() => {
                onEditUser(user);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-navy-950 text-xs font-bold border border-stone-300 transition shadow-sm"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>{t.adminFlow.editRoleBtn}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-gold-400 text-xs font-bold shadow transition"
          >
            {t.common.close}
          </button>
        </div>

      </div>
    </div>
  );
};
