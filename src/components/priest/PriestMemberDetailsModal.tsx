import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { Booking, DEFAULT_SKELETON_AVATAR, User } from '../../types/database';
import { MOCK_USERS } from '../../lib/mockData';
import { Badge } from '../common/Badge';
import { 
  X, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  UserX, 
  Save, 
  Check, 
  Church, 
  CalendarCheck,
  CreditCard,
  User as UserIcon,
  Award,
  Layers,
  FileText
} from 'lucide-react';
import { useEffect } from 'react';

interface PriestMemberDetailsModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onStatusChanged?: () => void;
}

export const PriestMemberDetailsModal: React.FC<PriestMemberDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
  onStatusChanged
}) => {
  const { t, language, formatDate, formatTime } = useTranslation();
  const { 
    allUsers, 
    bookings, 
    updatePriestPrivateNotes, 
    updateBookingAttendance,
    getConfessionRhythm 
  } = useAppStore();

  const member = useMemo(() => {
    const fromAllUsers = allUsers.find(u => u.id === booking.user_id || (booking.user && u.email === booking.user.email));
    const defaultMock = MOCK_USERS.find(m => m.id === booking.user_id || (booking.user && m.email === booking.user.email) || (fromAllUsers && m.id === fromAllUsers.id));
    
    if (fromAllUsers && defaultMock) {
      return {
        ...defaultMock,
        ...fromAllUsers,
        gender: fromAllUsers.gender || defaultMock.gender,
        date_of_birth: fromAllUsers.date_of_birth || defaultMock.date_of_birth,
        national_id: fromAllUsers.national_id || defaultMock.national_id,
        marital_status: fromAllUsers.marital_status || defaultMock.marital_status,
        profession: fromAllUsers.profession || defaultMock.profession,
        education: fromAllUsers.education || defaultMock.education,
        address: fromAllUsers.address || defaultMock.address,
        service_status: fromAllUsers.service_status || defaultMock.service_status,
        serving_stage: fromAllUsers.serving_stage || defaultMock.serving_stage,
        served_stage: fromAllUsers.served_stage || defaultMock.served_stage,
        other_services: fromAllUsers.other_services || defaultMock.other_services,
      };
    }
    return fromAllUsers || booking.user || defaultMock || null;
  }, [allUsers, booking.user_id, booking.user]);

  // Private pastoral notes state
  const [privateNotes, setPrivateNotes] = useState(booking.priest_private_notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [saveNotesSuccess, setSaveNotesSuccess] = useState(false);
  const [isUpdatingAttendance, setIsUpdatingAttendance] = useState(false);

  useEffect(() => {
    setPrivateNotes(booking.priest_private_notes || '');
  }, [booking.id, booking.priest_private_notes]);

  // Member calculated age
  const memberAge = useMemo(() => {
    if (!member?.date_of_birth) return null;
    const dob = new Date(member.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }, [member?.date_of_birth]);

  // Previous completed confessions history
  const memberAllBookings = useMemo(() => {
    if (!member) return [];
    return bookings.filter(b => b.user_id === member.id);
  }, [bookings, member]);

  const priorCompletedBookings = useMemo(() => {
    return memberAllBookings
      .filter(b => b.status === 'completed' && b.id !== booking.id)
      .sort((a, b) => new Date(b.date + 'T' + b.start_time).getTime() - new Date(a.date + 'T' + a.start_time).getTime());
  }, [memberAllBookings, booking.id]);

  const lastCompletedBooking = priorCompletedBookings[0] || null;
  const lastConfessionDate = lastCompletedBooking ? lastCompletedBooking.date : null;

  // Days elapsed since last confession
  const daysSinceLastConfession = useMemo(() => {
    if (!lastConfessionDate) return null;
    const lastDate = new Date(lastConfessionDate);
    const today = new Date();
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - lastDate.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  }, [lastConfessionDate]);

  // Rhythm info
  const rhythmInfo = member ? getConfessionRhythm(member.id) : null;

  if (!isOpen || !member) return null;

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    setSaveNotesSuccess(false);
    const res = await updatePriestPrivateNotes(booking.id, privateNotes);
    setIsSavingNotes(false);
    if (res.success) {
      setSaveNotesSuccess(true);
      setTimeout(() => setSaveNotesSuccess(false), 3500);
    }
  };

  const handleAttendanceChange = async (newStatus: 'completed' | 'no_show') => {
    setIsUpdatingAttendance(true);
    const res = await updateBookingAttendance(booking.id, newStatus);
    setIsUpdatingAttendance(false);
    if (res.success) {
      if (onStatusChanged) onStatusChanged();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Liturgical Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-navy-950 via-church-950 to-navy-900 p-5 sm:p-6 text-white shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ring-2 ring-gold-400 overflow-hidden bg-stone-800 shrink-0 shadow-lg">
                <img
                  src={member.avatar_url || DEFAULT_SKELETON_AVATAR}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-300 text-[10px] font-bold border border-gold-500/30">
                    <Church className="w-3 h-3 text-gold-400" />
                    <span>{t.priestFlow.memberDossierTitle}</span>
                  </span>

                  {member.service_status && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold border border-white/20">
                      {member.service_status === 'servant' ? (language === 'ar' ? '⭐ خادم بالكنيسة' : '⭐ Church Servant') :
                       member.service_status === 'served' ? (language === 'ar' ? '👥 مخدوم' : '👥 Served') :
                       (language === 'ar' ? '✝️ شعب الكنيسة' : '✝️ General')}
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                  {language === 'ar' ? (member.title_ar || member.name) : (member.title_en || member.name)}
                </h3>

                <p className="text-xs text-stone-300 font-mono">
                  {member.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition shrink-0 self-start"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          
          {/* Section 1: Confession Regularity & Previous Sessions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-gold-600" />
              <span>{language === 'ar' ? 'متابعة دورية سر الاعتراف وسجل الجلسات' : 'Confession Regularity & History'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Days Elapsed Since Last Confession */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200 space-y-1.5 shadow-sm">
                <span className="text-[11px] font-bold text-amber-800 block uppercase tracking-wider">
                  {language === 'ar' ? 'المدة منذ آخر جلسة اعتراف' : 'Time Since Last Confession'}
                </span>
                <span className="text-xl sm:text-2xl font-bold font-serif text-amber-950 block">
                  {daysSinceLastConfession !== null
                    ? t.priestFlow.daysSinceLastConfession.replace('{days}', String(daysSinceLastConfession))
                    : t.priestFlow.noPreviousConfessions}
                </span>
                <p className="text-xs text-amber-700 font-medium">
                  {lastConfessionDate 
                    ? (language === 'ar' ? `تاريخ آخر اعتراف: ${formatDate(new Date(lastConfessionDate))}` : `Last confession: ${formatDate(new Date(lastConfessionDate))}`)
                    : (language === 'ar' ? 'لم يتم تسجيل جلسات سابقة' : 'No prior sessions recorded')}
                </p>
              </div>

              {/* Total Completed Confessions & Target Interval */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-200 space-y-1.5 shadow-sm">
                <span className="text-[11px] font-bold text-emerald-800 block uppercase tracking-wider">
                  {t.profile.totalCompletedConfessions}
                </span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-950 block">
                  {priorCompletedBookings.length} {t.profile.recordsLabel}
                </span>
                <p className="text-xs text-emerald-700 font-medium">
                  {rhythmInfo 
                    ? (language === 'ar' ? `الدورية المستهدفة: كل ${rhythmInfo.intervalDays} يوماً` : `Target frequency: Every ${rhythmInfo.intervalDays} days`)
                    : (language === 'ar' ? 'الدورية المعتادة: شهرياً' : 'Default frequency: Monthly')}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Complete Personal Identity & Demographics */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-gold-600" />
              <span>{language === 'ar' ? 'البيانات الشخصية والمدنية' : 'Personal & Civil Identity'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* National ID (14 digits) */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t.auth.nationalIdLabel}</span>
                </span>
                <span className="text-xs font-bold font-mono text-navy-950 block tracking-wider">
                  {member.national_id || '—'}
                </span>
              </div>

              {/* Date of Birth & Age */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t.auth.dateOfBirthLabel}</span>
                </span>
                <span className="text-xs font-bold text-navy-950 block">
                  {member.date_of_birth ? `${member.date_of_birth} (${memberAge || 0} ${t.profile.yearsOld})` : '—'}
                </span>
              </div>

              {/* Gender */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t.auth.genderLabel}</span>
                </span>
                <span className="text-xs font-bold text-navy-950 block">
                  {member.gender === 'male' ? t.auth.genderMale : member.gender === 'female' ? t.auth.genderFemale : '—'}
                </span>
              </div>

              {/* Marital Status */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t.auth.maritalStatusLabel}</span>
                </span>
                <span className="text-xs font-bold text-navy-950 block">
                  {member.marital_status === 'single' ? t.auth.maritalSingle :
                   member.marital_status === 'married' ? t.auth.maritalMarried :
                   member.marital_status === 'widowed' ? t.auth.maritalWidowed :
                   member.marital_status === 'divorced' ? t.auth.maritalDivorced : '—'}
                </span>
              </div>

              {/* Education */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t.auth.educationLabel}</span>
                </span>
                <span className="text-xs font-bold text-navy-950 block truncate">
                  {member.education || '—'}
                </span>
              </div>

              {/* Profession */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t.auth.professionLabel}</span>
                </span>
                <span className="text-xs font-bold text-navy-950 block truncate">
                  {member.profession || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Contact & Address */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-gold-600" />
              <span>{language === 'ar' ? 'بيانات التواصل والعنوان' : 'Contact & Address Details'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Primary Phone */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t.auth.phoneLabel}</span>
                </span>
                <span className="text-xs font-bold font-mono text-navy-950 block">
                  {member.phone || '—'}
                </span>
              </div>

              {/* Secondary Phone */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t.auth.secondaryPhoneLabel}</span>
                </span>
                <span className="text-xs font-bold font-mono text-navy-950 block">
                  {member.secondary_phone || '—'}
                </span>
              </div>

              {/* Address */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t.auth.addressLabel}</span>
                </span>
                <span className="text-xs font-medium text-navy-950 block line-clamp-2">
                  {member.address || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Church Fellowship & Service Details */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Church className="w-4 h-4 text-church-600" />
              <span>{language === 'ar' ? 'الارتباط الكنسي والخدمة' : 'Parish Fellowship & Service'}</span>
            </h4>

            <div className="p-4 rounded-2xl bg-gold-50/60 border border-gold-200 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-church-950">
                  <span className="text-sm">
                    {member.service_status === 'servant' ? (language === 'ar' ? '⭐ خادم بالكنيسة' : '⭐ Church Servant') :
                     member.service_status === 'served' ? (language === 'ar' ? '👥 مخدوم باجتماعات الكنيسة' : '👥 Attending Member') :
                     (language === 'ar' ? '✝️ شعب الكنيسة العام' : '✝️ General Parishioner')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-semibold text-stone-700">
                  {member.serving_stage && (
                    <span className="px-2.5 py-1 rounded-xl bg-white border border-gold-300">
                      <strong>{t.auth.servingStageLabel}:</strong> {member.serving_stage}
                    </span>
                  )}
                  {member.served_stage && (
                    <span className="px-2.5 py-1 rounded-xl bg-white border border-gold-300">
                      <strong>{t.auth.servedStageLabel}:</strong> {member.served_stage}
                    </span>
                  )}
                </div>
              </div>

              {member.other_services && (
                <div className="pt-2 border-t border-gold-200/80 text-stone-700">
                  <strong className="text-stone-800">{t.auth.otherServicesLabel}:</strong> {member.other_services}
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Current Appointment Details */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-church-600" />
              <span>{language === 'ar' ? 'تفاصيل الموعد الحالي' : 'Current Confession Appointment'}</span>
            </h4>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1.5 text-xs text-stone-700">
                <div className="font-bold text-sm text-navy-950 flex items-center gap-2 font-serif">
                  <Calendar className="w-4 h-4 text-gold-600" />
                  <span>{formatDate(booking.date)} • {formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                </div>
                {booking.notes && (
                  <p className="text-stone-700 italic pt-1 bg-white p-2.5 rounded-xl border border-stone-200">
                    <strong className="text-stone-500 not-italic uppercase text-[10px] block">{t.common.notes}:</strong> 
                    "{booking.notes}"
                  </p>
                )}
              </div>

              <div className="shrink-0 self-start sm:self-auto">
                <Badge status={booking.status} size="md" />
              </div>
            </div>
          </div>

          {/* Section 6: 🔒 Strictly Confidential Priest Notes Editor */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy-950 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-gold-600" />
                <span>{t.priestFlow.confidentialNotesTitle}</span>
              </h4>

              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 shadow-sm">
                <Lock className="w-3 h-3 text-rose-600" />
                <span>{language === 'ar' ? 'سري وخاص بقدسك فقط' : 'Strictly Confidential'}</span>
              </span>
            </div>

            {/* Privacy Alert Notice */}
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium">
              {t.priestFlow.confidentialNotesNotice}
            </div>

            {/* Notes Textarea */}
            <div className="space-y-2.5">
              <textarea
                rows={4}
                value={privateNotes}
                onChange={(e) => setPrivateNotes(e.target.value)}
                placeholder={t.priestFlow.confidentialNotesPlaceholder}
                className="w-full p-3.5 rounded-2xl border border-stone-300 bg-white font-medium text-xs text-stone-800 focus:ring-2 focus:ring-gold-500 focus:outline-none leading-relaxed shadow-inner"
              />

              <div className="flex items-center justify-between">
                <div>
                  {saveNotesSuccess && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold animate-in fade-in">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{t.priestFlow.notesSavedSuccess}</span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isSavingNotes}
                  onClick={handleSaveNotes}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-gold-400 text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingNotes ? t.common.saving : t.priestFlow.saveNotesBtn}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer & Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {/* If confirmed booking: attendance buttons */}
          {booking.status === 'confirmed' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isUpdatingAttendance}
                onClick={() => handleAttendanceChange('completed')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.priestFlow.markCompletedBtn}</span>
              </button>

              <button
                type="button"
                disabled={isUpdatingAttendance}
                onClick={() => handleAttendanceChange('no_show')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition disabled:opacity-50"
              >
                <UserX className="w-4 h-4 text-stone-500" />
                <span>{t.priestFlow.markNoShowBtn}</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-stone-500 font-medium">
              <span>{language === 'ar' ? 'جلسة الاعتراف مؤرشفة في السجلات.' : 'Confession appointment record archived.'}</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-xs font-bold text-stone-700 transition"
          >
            {t.common.close}
          </button>
        </div>

      </div>
    </div>
  );
};
