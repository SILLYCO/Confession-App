import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { 
  User, 
  MaritalStatus, 
  ChurchServiceRole, 
  DEFAULT_SKELETON_AVATAR 
} from '../../types/database';
import { Badge } from '../common/Badge';
import { 
  User as UserIcon, 
  Phone, 
  Mail, 
  Lock, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Heart, 
  Briefcase, 
  GraduationCap, 
  Church, 
  Sparkles, 
  Award, 
  Users, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Save, 
  CalendarCheck,
  ArrowRight,
  Eye,
  EyeOff,
  History
} from 'lucide-react';

interface MemberProfilePageProps {
  onNavigateToBooking?: () => void;
  onNavigateToAppointments?: () => void;
}

export const MemberProfilePage: React.FC<MemberProfilePageProps> = ({
  onNavigateToBooking,
  onNavigateToAppointments
}) => {
  const { t, language, formatDate, formatTime } = useTranslation();
  const { 
    currentUser, 
    updateUser, 
    priests, 
    getUserBookings, 
    getUserActiveBooking,
    getConfessionRhythm
  } = useAppStore();

  if (!currentUser) return null;

  const [activeSubTab, setActiveSubTab] = useState<'personal' | 'contact' | 'church' | 'confession' | 'security'>('personal');

  // Editable Form State
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [secondaryPhone, setSecondaryPhone] = useState(currentUser.secondary_phone || '');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>(currentUser.marital_status || 'single');
  const [education, setEducation] = useState(currentUser.education || '');
  const [profession, setProfession] = useState(currentUser.profession || '');
  const [address, setAddress] = useState(currentUser.address || '');
  const [servingStage, setServingStage] = useState(currentUser.serving_stage || '');
  const [servedStage, setServedStage] = useState(currentUser.served_stage || '');
  const [otherServices, setOtherServices] = useState(currentUser.other_services || '');

  // Confession Rhythm Settings State
  const [reminderInterval, setReminderInterval] = useState<number>(
    currentUser.confession_reminder_interval_days || 30
  );
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(
    currentUser.confession_reminder_enabled !== false
  );

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Assigned Confession Father
  const assignedFather = useMemo(() => {
    return priests.find(p => p.id === currentUser.confession_father_id) || priests[0];
  }, [priests, currentUser.confession_father_id]);

  // Confession Stats
  const userBookings = useMemo(() => getUserBookings(currentUser.id), [getUserBookings, currentUser.id]);
  const completedBookings = useMemo(() => userBookings.filter(b => b.status === 'completed'), [userBookings]);
  const activeUpcomingBooking = useMemo(() => getUserActiveBooking(currentUser.id), [getUserActiveBooking, currentUser.id]);
  const pastBookings = useMemo(() => {
    return userBookings
      .filter(b => b.status === 'completed' || b.status === 'no_show')
      .sort((a, b) => new Date(b.date + 'T' + b.start_time).getTime() - new Date(a.date + 'T' + a.start_time).getTime());
  }, [userBookings]);

  const lastConfessionDate = useMemo(() => {
    if (completedBookings.length === 0) return null;
    const sorted = [...completedBookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0].date;
  }, [completedBookings]);

  // Confession Rhythm Engine Info
  const rhythmInfo = useMemo(() => {
    return getConfessionRhythm(currentUser.id);
  }, [getConfessionRhythm, currentUser.id, reminderInterval, reminderEnabled, completedBookings]);

  // Age calculation
  const calculatedAge = useMemo(() => {
    if (!currentUser.date_of_birth) return null;
    const dob = new Date(currentUser.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }, [currentUser.date_of_birth]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const updates: Partial<User> = {
        phone: phone.trim(),
        secondary_phone: secondaryPhone.trim() || undefined,
        marital_status: maritalStatus,
        education: education.trim() || undefined,
        profession: profession.trim() || undefined,
        address: address.trim(),
        serving_stage: currentUser.service_status === 'servant' ? servingStage.trim() || undefined : undefined,
        served_stage: currentUser.service_status === 'served' ? servedStage.trim() || undefined : undefined,
        other_services: otherServices.trim() || undefined,
        confession_reminder_interval_days: reminderInterval,
        confession_reminder_enabled: reminderEnabled,
      };

      const result = await updateUser(currentUser.id, updates);
      setIsSaving(false);

      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMsg(result.error || 'Failed to save changes.');
      }
    } catch {
      setIsSaving(false);
      setErrorMsg('An unexpected error occurred while saving profile.');
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: t.auth.passwordMinLength });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: t.auth.passwordsDoNotMatch });
      return;
    }

    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setPasswordMsg({ type: 'success', text: t.profile.passwordUpdatedSuccess });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in max-w-5xl mx-auto pb-12">
      
      {/* ---------------- 1. Digital Membership Identity Header ---------------- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white p-6 sm:p-8 shadow-xl border border-gold-500/30">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-start">
          
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar_url || DEFAULT_SKELETON_AVATAR}
              alt={currentUser.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-gold-400/80 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 bg-gold-500 text-navy-950 p-1 rounded-lg shadow">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* User Details Header */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Badge role={currentUser.role} size="sm" />
              {currentUser.service_status && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gold-400/20 text-gold-300 border border-gold-400/30">
                  {currentUser.service_status === 'servant' && (language === 'ar' ? '⭐ خادم بالكنيسة' : '⭐ Church Servant')}
                  {currentUser.service_status === 'served' && (language === 'ar' ? '👥 مخدوم باجتماع' : '👥 Attending Member')}
                  {currentUser.service_status === 'general_member' && (language === 'ar' ? '✝️ شعب الكنيسة العام' : '✝️ General Parishioner')}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
              {language === 'ar' ? (currentUser.title_ar || currentUser.name) : (currentUser.title_en || currentUser.name)}
            </h2>

            <p className="text-xs text-stone-300">
              {currentUser.email} {currentUser.phone && `• ${currentUser.phone}`}
            </p>

            {/* Quick Summary Pill row */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-stone-300">
              {calculatedAge !== null && (
                <span className="bg-white/10 px-2.5 py-1 rounded-xl">
                  {t.profile.ageLabel}: <strong className="text-gold-400">{calculatedAge}</strong> {t.profile.yearsOld}
                </span>
              )}
              {currentUser.profession && (
                <span className="bg-white/10 px-2.5 py-1 rounded-xl">
                  {currentUser.profession}
                </span>
              )}
              {assignedFather && (
                <span className="bg-gold-500/20 text-gold-300 border border-gold-500/30 px-2.5 py-1 rounded-xl font-medium">
                  {t.auth.confessionFatherLabel}: <strong>{language === 'ar' ? (assignedFather.title_ar || assignedFather.name) : (assignedFather.title_en || assignedFather.name)}</strong>
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ---------------- 2. Sub-Tabs Navigation ---------------- */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-stone-200/80 rounded-2xl overflow-x-auto">
        {[
          { key: 'personal', label: t.profile.personalTab, icon: UserIcon },
          { key: 'contact', label: t.auth.sectionContact, icon: Phone },
          { key: 'church', label: t.profile.churchTab, icon: Church },
          { key: 'confession', label: t.profile.confessionTab, icon: CalendarCheck },
          { key: 'security', label: t.profile.securityTab, icon: Lock },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveSubTab(key as any)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition flex-1 justify-center ${
              activeSubTab === key
                ? 'bg-navy-950 text-gold-400 shadow-md ring-1 ring-gold-400/50'
                : 'bg-transparent text-stone-700 hover:bg-white/60'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Success / Error Feedback Banners */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{t.profile.changesSaved}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ---------------- 3. Active Tab Content ---------------- */}
      <form onSubmit={handleSaveProfile} className="space-y-6">

        {/* TAB 1: Personal Identity */}
        {activeSubTab === 'personal' && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base font-serif text-navy-950 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-gold-600" />
                <span>{t.profile.personalTab}</span>
              </h3>
              <span className="text-[11px] text-stone-500">
                {language === 'ar' ? 'البيانات الأساسية المسجلة بالسجل الكنسي' : 'Official Parish Registry Data'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-xs">
              
              {/* Full Name (Locked) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-stone-700">{t.auth.fullNameLabel}</label>
                  <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-semibold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>{t.profile.lockedFieldBadge}</span>
                  </span>
                </div>
                <input
                  type="text"
                  disabled
                  value={currentUser.name}
                  className="w-full p-3 rounded-xl border border-stone-200 bg-stone-100 text-stone-600 font-semibold cursor-not-allowed"
                />
              </div>

              {/* National ID (14 digits - Locked) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-stone-700">{t.auth.nationalIdLabel}</label>
                  <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-semibold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>{t.profile.lockedFieldBadge}</span>
                  </span>
                </div>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-stone-400 absolute start-3.5 top-3.5" />
                  <input
                    type="text"
                    disabled
                    value={currentUser.national_id || '—'}
                    className="w-full ps-10 pe-4 py-3 rounded-xl border border-stone-200 bg-stone-100 text-stone-700 font-mono font-bold tracking-wider cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Gender (Locked) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-stone-700">{t.auth.genderLabel}</label>
                  <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-semibold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>{t.profile.lockedFieldBadge}</span>
                  </span>
                </div>
                <input
                  type="text"
                  disabled
                  value={currentUser.gender === 'male' ? t.auth.genderMale : currentUser.gender === 'female' ? t.auth.genderFemale : '—'}
                  className="w-full p-3 rounded-xl border border-stone-200 bg-stone-100 text-stone-700 font-semibold cursor-not-allowed"
                />
              </div>

              {/* Date of Birth (Locked) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-stone-700">{t.auth.dateOfBirthLabel}</label>
                  <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-semibold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>{t.profile.lockedFieldBadge}</span>
                  </span>
                </div>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-stone-400 absolute start-3.5 top-3.5" />
                  <input
                    type="text"
                    disabled
                    value={currentUser.date_of_birth ? `${currentUser.date_of_birth} (${calculatedAge} ${t.profile.yearsOld})` : '—'}
                    className="w-full ps-10 pe-4 py-3 rounded-xl border border-stone-200 bg-stone-100 text-stone-700 font-semibold cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Marital Status (Editable) */}
              <div>
                <label className="block font-bold text-stone-700 mb-1.5">
                  {t.auth.maritalStatusLabel}
                </label>
                <div className="relative">
                  <Heart className="w-4 h-4 text-stone-400 absolute start-3.5 top-3.5" />
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
                    className="w-full ps-10 pe-4 py-3 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  >
                    <option value="single">{t.auth.maritalSingle}</option>
                    <option value="married">{t.auth.maritalMarried}</option>
                    <option value="widowed">{t.auth.maritalWidowed}</option>
                    <option value="divorced">{t.auth.maritalDivorced}</option>
                  </select>
                </div>
              </div>

              {/* Educational Qualification (Editable) */}
              <div>
                <label className="block font-bold text-stone-700 mb-1.5">
                  {t.auth.educationLabel}
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-stone-400 absolute start-3.5 top-3.5" />
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder={t.auth.educationPlaceholder}
                    className="w-full ps-10 pe-4 py-3 rounded-xl border border-stone-300 bg-white font-medium text-stone-800 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Profession / Occupation (Editable) */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-700 mb-1.5">
                  {t.auth.professionLabel}
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-stone-400 absolute start-3.5 top-3.5" />
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder={t.auth.professionPlaceholder}
                    className="w-full ps-10 pe-4 py-3 rounded-xl border border-stone-300 bg-white font-medium text-stone-800 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
              <span className="text-amber-600 font-bold">ℹ️</span>
              <span>{t.profile.lockedFieldNotice}</span>
            </div>
          </div>
        )}

        {/* TAB 2: Contact Info & Residence */}
        {activeSubTab === 'contact' && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base font-serif text-navy-950 flex items-center gap-2">
                <Phone className="w-5 h-5 text-gold-600" />
                <span>{t.auth.sectionContact}</span>
              </h3>
              <span className="text-[11px] text-stone-500">
                {language === 'ar' ? 'بيانات التواصل لتلقي إشعارات وتأكيدات المواعيد' : 'Contact details for appointment confirmations'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-xs">
              
              {/* Primary Phone (Editable) */}
              <div>
                <label className="block font-bold text-stone-700 mb-1.5">
                  {t.auth.phoneLabel} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute start-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full ps-10 pe-4 py-3 rounded-xl border border-stone-300 bg-white font-mono font-bold text-stone-800 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Secondary Phone (Editable) */}
              <div>
                <label className="block font-bold text-stone-700 mb-1.5">
                  {t.auth.secondaryPhoneLabel}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute start-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    placeholder={language === 'ar' ? 'رقم هاتف إضافي أو بديل' : 'Secondary Phone Number'}
                    className="w-full ps-10 pe-4 py-3 rounded-xl border border-stone-300 bg-white font-mono text-stone-800 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email Address (Locked) */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-stone-700">{t.auth.emailLabel}</label>
                  <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-semibold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>{t.profile.lockedFieldBadge}</span>
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute start-3.5 top-3.5" />
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full ps-10 pe-4 py-3 rounded-xl border border-stone-200 bg-stone-100 text-stone-600 font-semibold cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Home Address (Editable) */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-700 mb-1.5">
                  {t.auth.addressLabel} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute start-3.5 top-3.5" />
                  <textarea
                    rows={3}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full ps-10 pe-4 py-3 rounded-xl border border-stone-300 bg-white font-medium text-stone-800 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: Church Fellowship & Confession Father */}
        {activeSubTab === 'church' && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base font-serif text-navy-950 flex items-center gap-2">
                <Church className="w-5 h-5 text-gold-600" />
                <span>{t.profile.churchTab}</span>
              </h3>
              <span className="text-[11px] text-stone-500">
                {t.churchName}
              </span>
            </div>

            {/* Assigned Confession Father Highlight Card */}
            <div className="bg-gradient-to-r from-amber-50/90 via-gold-50/50 to-stone-50 p-5 rounded-2xl border border-gold-300 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-church-950 flex items-center gap-1.5">
                  <Church className="w-4 h-4 text-gold-600" />
                  <span>{t.auth.confessionFatherLabel}</span>
                </span>
                <span className="text-[10px] font-bold text-church-900 bg-gold-200/80 px-2.5 py-0.5 rounded-full border border-gold-400/40">
                  ✨ {t.auth.yourConfessionFatherBadge}
                </span>
              </div>

              {assignedFather ? (
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-white p-4 rounded-2xl border border-gold-200 shadow-sm">
                  <img
                    src={assignedFather.avatar_url || DEFAULT_SKELETON_AVATAR}
                    alt={assignedFather.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gold-400 shrink-0"
                  />
                  <div className="min-w-0 flex-1 text-center sm:text-start space-y-1">
                    <h4 className="font-bold text-sm text-navy-950 font-serif">
                      {language === 'ar' ? (assignedFather.title_ar || assignedFather.name) : (assignedFather.title_en || assignedFather.name)}
                    </h4>
                    <p className="text-xs text-church-700 font-medium">
                      {t.churchName}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      {assignedFather.email} {assignedFather.phone && `• ${assignedFather.phone}`}
                    </p>
                  </div>

                  {onNavigateToBooking && (
                    <button
                      type="button"
                      onClick={onNavigateToBooking}
                      className="px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-gold-400 text-xs font-bold shadow transition flex items-center gap-1.5 shrink-0"
                    >
                      <CalendarCheck className="w-4 h-4 text-gold-400" />
                      <span>{t.profile.bookNowBtn}</span>
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-stone-500">No confession father assigned.</p>
              )}

              <p className="text-[11px] text-amber-900 leading-relaxed">
                ℹ️ {t.profile.confessionFatherLockedNotice}
              </p>
            </div>

            {/* Church Service Role & Stages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-xs">
              
              {/* Church Service Status */}
              <div>
                <label className="block font-bold text-stone-700 mb-1.5">{t.auth.serviceStatusLabel}</label>
                <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 font-bold flex items-center gap-2">
                  {currentUser.service_status === 'servant' && <Award className="w-4 h-4 text-amber-600" />}
                  {currentUser.service_status === 'served' && <Users className="w-4 h-4 text-blue-600" />}
                  {currentUser.service_status === 'general_member' && <Church className="w-4 h-4 text-emerald-600" />}
                  <span>
                    {currentUser.service_status === 'servant' && t.auth.servantOption}
                    {currentUser.service_status === 'served' && t.auth.servedOption}
                    {currentUser.service_status === 'general_member' && t.auth.generalMemberOption}
                  </span>
                </div>
              </div>

              {/* Serving or Served Stage */}
              {currentUser.service_status === 'servant' && (
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5">{t.auth.servingStageLabel}</label>
                  <input
                    type="text"
                    value={servingStage}
                    onChange={(e) => setServingStage(e.target.value)}
                    placeholder={t.auth.servingStagePlaceholder}
                    className="w-full p-3 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              )}

              {currentUser.service_status === 'served' && (
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5">{t.auth.servedStageLabel}</label>
                  <input
                    type="text"
                    value={servedStage}
                    onChange={(e) => setServedStage(e.target.value)}
                    placeholder={t.auth.servedStagePlaceholder}
                    className="w-full p-3 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Other Services */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-700 mb-1.5">{t.auth.otherServicesLabel}</label>
                <textarea
                  rows={2}
                  value={otherServices}
                  onChange={(e) => setOtherServices(e.target.value)}
                  placeholder={t.auth.otherServicesPlaceholder}
                  className="w-full p-3 rounded-xl border border-stone-300 bg-white font-medium text-stone-800 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: Confession Journey & Statistics */}
        {activeSubTab === 'confession' && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base font-serif text-navy-950 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-gold-600" />
                <span>{t.profile.confessionStatsTitle}</span>
              </h3>
              <span className="text-[11px] text-stone-500">
                {language === 'ar' ? 'سجل متابعة جلسات سر الاعتراف المقدس' : 'Spiritual confession history'}
              </span>
            </div>

            {/* ---------------- Confession Regularity & Rhythm Engine Card ---------------- */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-navy-950 via-slate-900 to-church-950 text-white border border-gold-400/40 shadow-lg space-y-5">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gold-400/20 text-gold-400 border border-gold-400/40 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base font-serif text-gold-300">
                      {t.profile.rhythmTitle}
                    </h4>
                    <p className="text-[11px] text-stone-300">
                      {t.profile.rhythmSubtitle}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0 flex items-center gap-2">
                  {rhythmInfo.status === 'on_track' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.profile.rhythmStatusOnTrack}</span>
                    </span>
                  )}
                  {rhythmInfo.status === 'due_soon' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t.profile.rhythmStatusDueSoon}</span>
                    </span>
                  )}
                  {rhythmInfo.status === 'overdue' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{t.profile.rhythmStatusOverdue}</span>
                    </span>
                  )}
                  {rhythmInfo.status === 'no_history' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-stone-300 border border-white/20">
                      {t.profile.rhythmStatusNoHistory}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar & Counters */}
              {rhythmInfo.daysSinceLast !== null ? (
                <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-300 font-medium">
                      {t.profile.rhythmDaysElapsed.replace('{days}', String(rhythmInfo.daysSinceLast))}
                    </span>
                    <span className="font-bold font-mono text-gold-300">
                      {rhythmInfo.daysRemaining !== null && rhythmInfo.daysRemaining >= 0 
                        ? t.profile.rhythmDaysRemaining.replace('{days}', String(rhythmInfo.daysRemaining))
                        : t.profile.rhythmOverdueBy.replace('{days}', String(Math.abs(rhythmInfo.daysRemaining || 0)))}
                    </span>
                  </div>

                  {/* Progress Track */}
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        rhythmInfo.status === 'on_track' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                        rhythmInfo.status === 'due_soon' ? 'bg-gradient-to-r from-amber-400 to-gold-500' :
                        'bg-gradient-to-r from-rose-500 to-orange-500'
                      }`}
                      style={{ width: `${Math.min(rhythmInfo.percentageElapsed, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
                    <span>{language === 'ar' ? 'البداية (0 يوماً)' : 'Start (0 days)'}</span>
                    <span>{language === 'ar' ? `الهدف (${rhythmInfo.intervalDays} يوماً)` : `Target (${rhythmInfo.intervalDays} days)`}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-stone-300">
                  <p>{language === 'ar' ? 'لم تقم بتسجيل جلسات اعتراف سابقة بعد. احجز جلستك الأولى لبدء متابعة دوريتك الروحية.' : 'No completed confession sessions recorded yet. Book your first appointment to track your rhythm.'}</p>
                </div>
              )}

              {/* Frequency Configuration Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    {t.profile.rhythmIntervalLabel}
                  </label>
                  <select
                    value={reminderInterval}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setReminderInterval(val);
                      updateUser(currentUser.id, { confession_reminder_interval_days: val });
                    }}
                    className="w-full p-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-xs focus:ring-2 focus:ring-gold-400 focus:outline-none"
                  >
                    <option value={14} className="bg-navy-900 text-white">{t.profile.rhythmInterval2Weeks}</option>
                    <option value={21} className="bg-navy-900 text-white">{t.profile.rhythmInterval3Weeks}</option>
                    <option value={30} className="bg-navy-900 text-white">{t.profile.rhythmIntervalMonthly}</option>
                    <option value={45} className="bg-navy-900 text-white">{t.profile.rhythmInterval45Days}</option>
                    <option value={60} className="bg-navy-900 text-white">{t.profile.rhythmInterval2Months}</option>
                    <option value={90} className="bg-navy-900 text-white">{t.profile.rhythmInterval3Months}</option>
                  </select>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-start">
                    <span className="block text-xs font-bold text-stone-200">{t.profile.rhythmRemindersToggle}</span>
                    <span className="text-[10px] text-stone-400">{language === 'ar' ? 'تنبيهات لطيفة داخل التطبيق' : 'Gentle in-app alerts'}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setReminderEnabled(val);
                      updateUser(currentUser.id, { confession_reminder_enabled: val });
                    }}
                    className="w-5 h-5 rounded text-gold-500 focus:ring-gold-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Encouraging Spiritual Scripture Quote */}
              <div className="text-center p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-300 text-xs italic font-serif">
                {t.profile.rhythmSpiritualVerse}
              </div>

            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                <span className="text-xs font-bold text-emerald-800 block">{t.profile.totalCompletedConfessions}</span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-950">{completedBookings.length}</span>
                <p className="text-[11px] text-emerald-700 pt-1">
                  {completedBookings.length > 0 
                    ? (language === 'ar' ? 'بركة سر الاعتراف المقدس مستمرة' : 'Holy sacrament attendance recorded') 
                    : (language === 'ar' ? 'لم يتم تسجيل اعترافات مكتملة بعد' : 'No completed confessions yet')}
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-1">
                <span className="text-xs font-bold text-blue-800 block">{t.profile.lastConfessionDate}</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-950 font-serif">
                  {lastConfessionDate ? formatDate(new Date(lastConfessionDate)) : '—'}
                </span>
                <p className="text-[11px] text-blue-700 pt-1">
                  {lastConfessionDate 
                    ? (language === 'ar' ? 'مع أب اعترافك المبارك' : 'With your Confession Father') 
                    : (language === 'ar' ? 'سجل موعدك القادم' : 'Schedule your next confession')}
                </p>
              </div>
            </div>

            {/* Upcoming Confession Appointment Card */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {t.profile.nextUpcomingConfession}
              </h4>

              {activeUpcomingBooking ? (
                <div className="p-4 rounded-2xl bg-gold-50/70 border border-gold-300 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-start">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gold-200 text-church-950 text-[10px] font-bold">
                      <Clock className="w-3 h-3 text-gold-700" />
                      <span>{t.status.confirmed}</span>
                    </div>
                    <h5 className="font-bold text-sm text-navy-950 font-serif">
                      {formatDate(new Date(activeUpcomingBooking.date))} • {formatTime(activeUpcomingBooking.start_time)} - {formatTime(activeUpcomingBooking.end_time)}
                    </h5>
                    <p className="text-xs text-stone-600">
                      {t.auth.confessionFatherLabel}: <strong>{language === 'ar' ? (assignedFather?.title_ar || assignedFather?.name) : (assignedFather?.title_en || assignedFather?.name)}</strong>
                    </p>
                  </div>

                  {onNavigateToAppointments && (
                    <button
                      type="button"
                      onClick={onNavigateToAppointments}
                      className="px-4 py-2 rounded-xl bg-navy-950 text-gold-400 text-xs font-bold shadow hover:bg-navy-900 transition flex items-center gap-1"
                    >
                      <span>{t.nav.myAppointments}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-3">
                  <p className="text-xs text-stone-500">{t.profile.noUpcomingConfession}</p>
                  {onNavigateToBooking && (
                    <button
                      type="button"
                      onClick={onNavigateToBooking}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-950 text-gold-400 text-xs font-bold shadow hover:bg-navy-900 transition"
                    >
                      <CalendarCheck className="w-4 h-4 text-gold-400" />
                      <span>{t.profile.bookNowBtn}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Past Completed & No-Show Confessions List */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-gold-600" />
                  <span>{t.profile.pastConfessionsTitle}</span>
                </h4>
                <span className="text-[11px] text-stone-400 font-medium">
                  {pastBookings.length} {t.profile.recordsLabel}
                </span>
              </div>

              {pastBookings.length > 0 ? (
                <div className="space-y-2.5">
                  {pastBookings.map((booking) => {
                    const priest = priests.find(p => p.id === booking.priest_id) || assignedFather;
                    const isCompleted = booking.status === 'completed';
                    const isNoShow = booking.status === 'no_show';

                    return (
                      <div 
                        key={booking.id} 
                        className={`p-3.5 sm:p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isCompleted 
                            ? 'bg-stone-50/90 border-stone-200 hover:border-emerald-200' 
                            : 'bg-amber-50/50 border-amber-200'
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-navy-950 font-serif">
                                {formatDate(new Date(booking.date))}
                              </span>
                              <span className="text-xs text-stone-500 font-mono">
                                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                              </span>
                            </div>

                            <p className="text-[11px] text-stone-600">
                              {language === 'ar' ? (priest?.title_ar || priest?.name) : (priest?.title_en || priest?.name)}
                              {booking.notes && ` • ${booking.notes}`}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2 ps-12 sm:ps-0">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            isCompleted 
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}>
                            {isCompleted && (language === 'ar' ? '✓ تم حضور الاعتراف' : '✓ Completed')}
                            {isNoShow && (language === 'ar' ? '⚠️ لم يحضر (No-Show)' : '⚠️ No-Show')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-stone-50/60 border border-stone-200/80 text-center text-xs text-stone-500 space-y-1">
                  <p>{t.profile.noPastConfessions}</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 5: Account Security & Password */}
        {activeSubTab === 'security' && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base font-serif text-navy-950 flex items-center gap-2">
                <Lock className="w-5 h-5 text-gold-600" />
                <span>{t.profile.securityTab}</span>
              </h3>
              <span className="text-[11px] text-stone-500">
                {language === 'ar' ? 'تحديث كلمة المرور لحماية الحساب' : 'Update password & secure your account'}
              </span>
            </div>

            {/* Password Form */}
            <div className="max-w-md space-y-4 text-xs">
              
              {passwordMsg && (
                <div className={`p-3 rounded-xl border font-bold flex items-center gap-2 ${
                  passwordMsg.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}>
                  {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-stone-700 mb-1">{t.profile.newPasswordLabel}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute start-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full ps-10 pe-10 py-3 rounded-xl border border-stone-300 bg-white font-medium text-stone-800 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3.5 top-3.5 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">{t.profile.confirmNewPasswordLabel}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute start-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full ps-10 pe-10 py-3 rounded-xl border border-stone-300 bg-white font-medium text-stone-800 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={isUpdatingPassword || !newPassword}
                onClick={handleUpdatePassword}
                className="px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-gold-400 text-xs font-bold shadow transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <KeyRound className="w-4 h-4 text-gold-400" />
                <span>{isUpdatingPassword ? (language === 'ar' ? 'جارٍ التحديث...' : 'Updating...') : t.profile.updatePasswordBtn}</span>
              </button>

            </div>
          </div>
        )}

        {/* Bottom Save Action Button (for Editable Tabs) */}
        {activeSubTab !== 'confession' && activeSubTab !== 'security' && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-navy-950 to-navy-900 text-gold-400 hover:text-gold-300 text-xs sm:text-sm font-bold shadow-lg ring-2 ring-gold-400/40 hover:ring-gold-400 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-gold-400" />
              <span>{isSaving ? t.profile.savingChanges : t.profile.saveChanges}</span>
            </button>
          </div>
        )}

      </form>

    </div>
  );
};
