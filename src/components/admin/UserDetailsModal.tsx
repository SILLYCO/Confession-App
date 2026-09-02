import React, { useState, useMemo } from 'react';
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
  Sparkles,
  CreditCard,
  Heart,
  MapPin,
  Award,
  Users,
  Briefcase,
  GraduationCap
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
    priests,
    priestProfiles, 
    getUserActiveBooking, 
    getUserBookings, 
    getPriestBookings,
    updateUser
  } = useAppStore();

  const [isChangingFather, setIsChangingFather] = useState(false);
  const [selectedFatherId, setSelectedFatherId] = useState(user?.confession_father_id || '');
  const [isSavingFather, setIsSavingFather] = useState(false);

  React.useEffect(() => {
    if (user?.confession_father_id) {
      setSelectedFatherId(user.confession_father_id);
    }
  }, [user?.confession_father_id]);

  // Secretary assigned priests (Unconditional hook call before any return)
  const assignedPriestsList = useMemo(() => {
    if (!user || user.role !== 'secretary' || !user.assigned_priest_ids || !Array.isArray(user.assigned_priest_ids)) return [];
    return (allUsers || []).filter(u => user.assigned_priest_ids?.includes(u.id));
  }, [user, allUsers]);

  if (!isOpen || !user) return null;

  const priestProfile = user.role === 'priest' 
    ? (priestProfiles || []).find(p => p.priest_id === user.id) 
    : undefined;

  // Member bookings
  const userBookings = (user.role === 'general' && typeof getUserBookings === 'function') 
    ? (getUserBookings(user.id) || []) 
    : [];
  const activeBooking = (user.role === 'general' && typeof getUserActiveBooking === 'function') 
    ? getUserActiveBooking(user.id) 
    : undefined;
  const pastBookings = (userBookings || []).filter(b => b.id !== activeBooking?.id);

  // Priest bookings
  const priestBookings = (user.role === 'priest' && typeof getPriestBookings === 'function') 
    ? (getPriestBookings(user.id) || []) 
    : [];
  const priestCompletedCount = (priestBookings || []).filter(b => b.status === 'completed').length;
  const priestConfirmedCount = (priestBookings || []).filter(b => b.status === 'confirmed').length;

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
              
              {/* Member Personal & Church Profile Card */}
              <div className="bg-stone-50/90 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                  <h4 className="font-bold text-navy-950 flex items-center gap-1.5 font-serif text-sm">
                    <UserIcon className="w-4 h-4 text-gold-600" />
                    <span>{language === 'ar' ? 'البيانات الشخصية والارتباط الكنسي' : 'Member Identity & Church Profile'}</span>
                  </h4>
                  {user.service_status && (
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                      user.service_status === 'servant'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : user.service_status === 'served'
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {user.service_status === 'servant' && (language === 'ar' ? '⭐ خادم بالكنيسة' : '⭐ Church Servant')}
                      {user.service_status === 'served' && (language === 'ar' ? '👥 مخدوم باجتماع' : '👥 Attending Member')}
                      {user.service_status === 'general_member' && (language === 'ar' ? '✝️ شعب الكنيسة العام' : '✝️ General Parishioner')}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-stone-700">
                  {/* Gender */}
                  {user.gender && (
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200/70 space-y-0.5">
                      <span className="text-[10px] text-stone-400 font-bold block flex items-center gap-1">
                        <UserIcon className="w-3 h-3 text-gold-600" />
                        {t.auth.genderLabel}
                      </span>
                      <span className="font-bold text-navy-950 text-xs">
                        {user.gender === 'male' ? t.auth.genderMale : t.auth.genderFemale}
                      </span>
                    </div>
                  )}

                  {/* National ID */}
                  {user.national_id && (
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200/70 space-y-0.5">
                      <span className="text-[10px] text-stone-400 font-bold block flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-stone-400" />
                        {t.auth.nationalIdLabel}
                      </span>
                      <span className="font-mono font-bold text-navy-950 tracking-wider text-xs">
                        {user.national_id}
                      </span>
                    </div>
                  )}

                  {/* Date of Birth */}
                  {user.date_of_birth && (
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200/70 space-y-0.5">
                      <span className="text-[10px] text-stone-400 font-bold block flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {t.auth.dateOfBirthLabel}
                      </span>
                      <span className="font-bold text-navy-950 text-xs">
                        {user.date_of_birth}
                      </span>
                    </div>
                  )}

                  {/* Marital Status */}
                  {user.marital_status && (
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200/70 space-y-0.5">
                      <span className="text-[10px] text-stone-400 font-bold block flex items-center gap-1">
                        <Heart className="w-3 h-3 text-stone-400" />
                        {t.auth.maritalStatusLabel}
                      </span>
                      <span className="font-bold text-navy-950 text-xs">
                        {user.marital_status === 'single' && t.auth.maritalSingle}
                        {user.marital_status === 'married' && t.auth.maritalMarried}
                        {user.marital_status === 'widowed' && t.auth.maritalWidowed}
                        {user.marital_status === 'divorced' && t.auth.maritalDivorced}
                      </span>
                    </div>
                  )}

                  {/* Education */}
                  {user.education && (
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200/70 space-y-0.5">
                      <span className="text-[10px] text-stone-400 font-bold block flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-gold-600" />
                        {t.auth.educationLabel}
                      </span>
                      <span className="font-bold text-navy-950 text-xs">
                        {user.education}
                      </span>
                    </div>
                  )}

                  {/* Profession */}
                  {user.profession && (
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200/70 space-y-0.5">
                      <span className="text-[10px] text-stone-400 font-bold block flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-gold-600" />
                        {t.auth.professionLabel}
                      </span>
                      <span className="font-bold text-navy-950 text-xs">
                        {user.profession}
                      </span>
                    </div>
                  )}

                  {/* Secondary Phone */}
                  {user.secondary_phone && (
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200/70 space-y-0.5">
                      <span className="text-[10px] text-stone-400 font-bold block flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400" />
                        {t.auth.secondaryPhoneLabel}
                      </span>
                      <span className="font-bold text-navy-950 text-xs font-mono">
                        {user.secondary_phone}
                      </span>
                    </div>
                  )}

                  {/* Serving or Served Stage */}
                  {(user.serving_stage || user.served_stage) && (
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200/70 space-y-0.5 sm:col-span-2">
                      <span className="text-[10px] text-stone-400 font-bold block flex items-center gap-1">
                        <Award className="w-3 h-3 text-gold-600" />
                        {user.service_status === 'servant' ? t.auth.servingStageLabel : t.auth.servedStageLabel}
                      </span>
                      <span className="font-bold text-navy-950 text-xs">
                        {user.serving_stage || user.served_stage}
                      </span>
                    </div>
                  )}

                  {/* Address */}
                  {user.address && (
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200/70 space-y-0.5 sm:col-span-2 md:col-span-3">
                      <span className="text-[10px] text-stone-400 font-bold block flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {t.auth.addressLabel}
                      </span>
                      <span className="font-medium text-navy-950 text-xs">
                        {user.address}
                      </span>
                    </div>
                  )}

                  {/* Other Services */}
                  {user.other_services && (
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200/70 space-y-0.5 sm:col-span-2 md:col-span-3">
                      <span className="text-[10px] text-stone-400 font-bold block flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-gold-600" />
                        {t.auth.otherServicesLabel}
                      </span>
                      <span className="font-medium text-stone-700 text-xs italic">
                        "{user.other_services}"
                      </span>
                    </div>
                  )}

                  {/* Assigned Confession Father */}
                  {(() => {
                    const assignedFather = allUsers.find(u => u.id === user.confession_father_id);
                    return (
                      <div className="bg-gradient-to-r from-amber-50 to-gold-50/60 p-3.5 rounded-2xl border border-gold-300 space-y-2.5 sm:col-span-2 md:col-span-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-church-950 flex items-center gap-1.5">
                            <Church className="w-4 h-4 text-gold-600" />
                            <span>{t.auth.confessionFatherLabel}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFatherId(user.confession_father_id || priests[0]?.id || '');
                              setIsChangingFather(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-navy-950 hover:bg-navy-900 text-gold-400 text-[11px] font-bold shadow-sm transition"
                          >
                            <Edit className="w-3 h-3 text-gold-400" />
                            <span>{t.auth.changeConfessionFather}</span>
                          </button>
                        </div>

                        {assignedFather ? (
                          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gold-200 shadow-sm">
                            <img
                              src={assignedFather.avatar_url || DEFAULT_SKELETON_AVATAR}
                              alt={assignedFather.name}
                              className="w-10 h-10 rounded-xl object-cover ring-2 ring-gold-400 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-xs text-navy-950 truncate">
                                {language === 'ar' ? (assignedFather.title_ar || assignedFather.name) : (assignedFather.title_en || assignedFather.name)}
                              </h5>
                              <p className="text-[10px] text-stone-500 truncate">
                                {assignedFather.email} • {assignedFather.phone}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold bg-gold-200 text-church-950 px-2.5 py-0.5 rounded-full shrink-0">
                              ✨ {t.auth.yourConfessionFatherBadge}
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-stone-500 bg-white p-2.5 rounded-xl border border-stone-200">
                            {language === 'ar' ? 'لم يتم تحديد أب اعتراف لهذا العضو' : 'No confession father assigned yet.'}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

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

          {/* SUPER ADMIN VIEW */}
          {user.role === 'admin' && (
            <div className="space-y-6">
              
              {/* System Authority Banner */}
              <div className="bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 text-white rounded-2xl p-5 border border-gold-500/40 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-gold-500/20 text-gold-400 border border-gold-500/30">
                      👑
                    </span>
                    <span className="font-bold font-serif text-sm text-gold-300">
                      {language === 'ar' ? 'حساب مدير النظام الأكبر (Super Admin)' : 'Super Administrator Account'}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/30">
                    {language === 'ar' ? 'كامل الصلاحيات' : 'Full Authority'}
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {language === 'ar'
                    ? 'يتمتع مدير النظام بالصلاحية الكاملة لإدارة الكهنة، والسكرتارية، والشعب، وسجلات المراقبة والتدقيق، وإعلانات الكنيسة، وتعديل كافة البيانات وإعادة تعيين كلمات المرور.'
                    : 'The Super Admin has full governance over parish priests, secretarial staff, congregation directory, system audit logs, church announcements, and data updates.'}
                </p>
              </div>

              {/* Admin Governance Capabilities */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-gold-600" />
                  <span>{language === 'ar' ? 'صلاحيات الحساب ومسؤوليات النظام' : 'System Privileges & Governance'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-navy-950 shrink-0" />
                    <div>
                      <p className="font-bold text-navy-950">{language === 'ar' ? 'سجل الشعب والمستخدمين' : 'User & Member Directory'}</p>
                      <p className="text-[10px] text-stone-500">{language === 'ar' ? 'تعديل كافة البيانات والصلاحيات' : 'View & edit all profile fields'}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-2.5">
                    <Church className="w-4 h-4 text-navy-950 shrink-0" />
                    <div>
                      <p className="font-bold text-navy-950">{language === 'ar' ? 'إدارة الآباء الكهنة' : 'Priest & Schedule Management'}</p>
                      <p className="text-[10px] text-stone-500">{language === 'ar' ? 'مواعيد الاعتراف ومعدل الجلسات' : 'Configure schedules & slots'}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-2.5">
                    <History className="w-4 h-4 text-navy-950 shrink-0" />
                    <div>
                      <p className="font-bold text-navy-950">{language === 'ar' ? 'سجل التدقيق والمراقبة' : 'Audit Logs & Security Ledger'}</p>
                      <p className="text-[10px] text-stone-500">{language === 'ar' ? 'تتبع كافة التعديلات وعمليات الحجز' : 'Trace operations & actions'}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-navy-950 shrink-0" />
                    <div>
                      <p className="font-bold text-navy-950">{language === 'ar' ? 'إعادة تعيين كلمات المرور' : 'Security & Password Resets'}</p>
                      <p className="text-[10px] text-stone-500">{language === 'ar' ? 'توليد كلمات مرور فورية لأي حساب' : 'Instant credential resets'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Identity & Contact Details Card */}
              <div className="bg-stone-50/90 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-3 text-xs">
                <h4 className="font-bold text-navy-950 flex items-center gap-1.5 font-serif text-sm border-b border-stone-200/80 pb-2">
                  <UserIcon className="w-4 h-4 text-gold-600" />
                  <span>{language === 'ar' ? 'بيانات التواصل والهوية' : 'Identity & Contact Information'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <span className="text-[11px] text-stone-500 block">{t.auth.fullNameLabel}</span>
                    <span className="font-bold text-navy-950 text-sm">
                      {language === 'ar' ? (user.title_ar || user.name) : (user.title_en || user.name)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-stone-500 block">{t.auth.emailLabel}</span>
                    <span className="font-mono font-semibold text-stone-800">{user.email}</span>
                  </div>

                  {user.phone && (
                    <div>
                      <span className="text-[11px] text-stone-500 block">{t.auth.phoneLabel}</span>
                      <span className="font-semibold text-stone-800">{user.phone}</span>
                    </div>
                  )}

                  {user.secondary_phone && (
                    <div>
                      <span className="text-[11px] text-stone-500 block">{t.auth.secondaryPhoneLabel}</span>
                      <span className="font-semibold text-stone-800">{user.secondary_phone}</span>
                    </div>
                  )}

                  {user.national_id && (
                    <div>
                      <span className="text-[11px] text-stone-500 block">{t.auth.nationalIdLabel}</span>
                      <span className="font-mono font-bold text-navy-950 tracking-wider">{user.national_id}</span>
                    </div>
                  )}

                  {user.address && (
                    <div className="sm:col-span-2">
                      <span className="text-[11px] text-stone-500 block">{t.auth.addressLabel}</span>
                      <span className="font-medium text-stone-800">{user.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Metadata */}
              <div className="p-3 bg-stone-100/80 rounded-xl border border-stone-200 text-[11px] text-stone-500 flex flex-wrap items-center justify-between gap-2">
                <span>
                  {language === 'ar' ? 'تاريخ إنشاء الحساب:' : 'Account Created:'} <strong className="text-stone-700">{user.created_at ? formatDate(user.created_at) : '—'}</strong>
                </span>
                <span>
                  {language === 'ar' ? 'معرف النظام:' : 'System ID:'} <strong className="font-mono text-stone-700">{user.id}</strong>
                </span>
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
              <Edit className="w-3.5 h-3.5 text-gold-600" />
              <span>{language === 'ar' ? 'تعديل كافة البيانات والصلاحيات' : 'Edit User Info & Role'}</span>
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

      {/* Reassign Confession Father Modal (Admin Action) */}
      {isChangingFather && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-church-900">
                <Church className="w-5 h-5 text-gold-600" />
                <h4 className="font-bold text-sm font-serif text-navy-950">
                  {t.auth.changeConfessionFather}
                </h4>
              </div>
              <button
                onClick={() => setIsChangingFather(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {language === 'ar' 
                ? `تحديد أب الاعتراف الجديد للعضو (${user.name}). ستظهر مواعيد هذا الكاهن حصرياً للعضو.` 
                : `Assign a new Confession Father for member (${user.name}). Their portal will update exclusively to this Father.`}
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {priests.map((priest) => {
                const isSelected = selectedFatherId === priest.id;
                return (
                  <button
                    key={priest.id}
                    type="button"
                    onClick={() => setSelectedFatherId(priest.id)}
                    className={`w-full p-3 rounded-2xl border text-start transition flex items-center gap-3 ${
                      isSelected
                        ? 'bg-navy-950 text-white border-navy-950 ring-2 ring-gold-400 shadow-sm'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <img
                      src={priest.avatar_url || DEFAULT_SKELETON_AVATAR}
                      alt={priest.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-gold-400/40 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`font-bold text-xs truncate ${isSelected ? 'text-gold-400' : 'text-navy-950'}`}>
                        {language === 'ar' ? (priest.title_ar || priest.name) : (priest.title_en || priest.name)}
                      </p>
                      <p className={`text-[10px] truncate ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                        {priest.email}
                      </p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsChangingFather(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                disabled={isSavingFather || !selectedFatherId}
                onClick={async () => {
                  setIsSavingFather(true);
                  await updateUser(user.id, { confession_father_id: selectedFatherId });
                  user.confession_father_id = selectedFatherId;
                  setIsSavingFather(false);
                  setIsChangingFather(false);
                }}
                className="px-4 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-gold-400 text-xs font-bold shadow transition disabled:opacity-50"
              >
                {isSavingFather ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ التعديل' : 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
