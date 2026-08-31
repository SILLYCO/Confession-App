import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { MOCK_USERS } from '../../lib/mockData';
import { LanguageSwitcher } from '../layout/LanguageSwitcher';
import { MaritalStatus, ChurchServiceRole, Gender, DEFAULT_SKELETON_AVATAR } from '../../types/database';
import { 
  Church, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone, 
  User, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Calendar,
  CreditCard,
  Heart,
  MapPin,
  Sparkles,
  Users,
  Award,
  Briefcase,
  GraduationCap
} from 'lucide-react';

const SERVED_STAGE_PRESETS_AR = [
  'حضانة',
  'المرحلة الابتدائية (١ - ٦ ابتدائي)',
  'المرحلة الإعدادية (١ - ٣ إعدادي)',
  'المرحلة الثانوية (١ - ٣ ثانوي)',
  'مرحلة الجامعة',
  'مرحلة الخريجين والشباب',
  'أخرى (تحديد يدوي)',
];

const SERVED_STAGE_PRESETS_EN = [
  'Nursery / Preschool',
  'Primary Stage (1st - 6th)',
  'Preparatory Stage (1st - 3rd Prep)',
  'Secondary Stage (1st - 3rd High School)',
  'University / College',
  'Graduates & Working Youth',
  'Other (Custom Specify)',
];

const SERVING_STAGE_PRESETS_AR = [
  'خدمة حضانة',
  'خدمة ابتدائي',
  'خدمة إعدادي',
  'خدمة ثانوي',
  'خدمة جامعة وخريجين',
  'إعداد خدام',
  'خدمة أخرى (تحديد يدوي)',
];

const SERVING_STAGE_PRESETS_EN = [
  'Nursery / Preschool Service',
  'Primary Stage Service',
  'Preparatory Stage Service',
  'Secondary Stage Service',
  'Youth & College Service',
  'Servants Preparation',
  'Other Service (Custom Specify)',
];

export const LoginPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { signIn, signUp, resetPassword, priests } = useAppStore();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpGender, setSignUpGender] = useState<Gender>('male');
  const [signUpDob, setSignUpDob] = useState('');
  const [signUpNationalId, setSignUpNationalId] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpSecondaryPhone, setSignUpSecondaryPhone] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpMaritalStatus, setSignUpMaritalStatus] = useState<MaritalStatus>('single');
  const [signUpProfession, setSignUpProfession] = useState('');
  const [signUpEducation, setSignUpEducation] = useState('');
  const [signUpAddress, setSignUpAddress] = useState('');
  const [signUpServiceStatus, setSignUpServiceStatus] = useState<ChurchServiceRole>('general_member');
  
  // Stages
  const [servedStageSelect, setServedStageSelect] = useState('المرحلة الثانوية (١ - ٣ ثانوي)');
  const [servedStageCustom, setServedStageCustom] = useState('');
  const [servingStageSelect, setServingStageSelect] = useState('خدمة إعدادي');
  const [servingStageCustom, setServingStageCustom] = useState('');
  
  const [signUpOtherServices, setSignUpOtherServices] = useState('');
  
  const availablePriests = useMemo(() => {
    if (priests && priests.length > 0) return priests;
    return MOCK_USERS.filter(u => u.role === 'priest');
  }, [priests]);

  const [signUpConfessionFatherId, setSignUpConfessionFatherId] = useState<string>(
    () => priests[0]?.id || MOCK_USERS.find(u => u.role === 'priest')?.id || ''
  );
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  useEffect(() => {
    if ((!signUpConfessionFatherId || !availablePriests.some(p => p.id === signUpConfessionFatherId)) && availablePriests.length > 0) {
      setSignUpConfessionFatherId(availablePriests[0].id);
    }
  }, [availablePriests, signUpConfessionFatherId]);

  // Status & Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!signInEmail.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email address');
      return;
    }
    if (!signInPassword) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter your password');
      return;
    }

    setIsLoading(true);
    const result = await signIn(signInEmail, signInPassword);
    setIsLoading(false);

    if (!result.success) {
      setErrorMsg(
        result.error === 'INVALID_CREDENTIALS'
          ? t.auth.invalidCredentials
          : result.error || t.auth.invalidCredentials
      );
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Mandatory Validations
    if (!signUpName.trim()) {
      setErrorMsg(t.auth.nameRequired);
      return;
    }

    if (!signUpDob) {
      setErrorMsg(language === 'ar' ? 'يرجى تحديد تاريخ الميلاد.' : 'Please select your Date of Birth.');
      return;
    }

    // 2. 14-digit National ID validation
    const cleanNationalId = signUpNationalId.trim();
    if (!/^\d{14}$/.test(cleanNationalId)) {
      setErrorMsg(t.auth.nationalIdValidationErr);
      return;
    }

    if (!signUpPhone.trim()) {
      setErrorMsg(t.auth.phoneRequired);
      return;
    }

    if (!signUpEmail.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني.' : 'Please enter your email address.');
      return;
    }

    if (!signUpAddress.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال العنوان بالتفصيل.' : 'Please enter your home address.');
      return;
    }

    // Stage validation (only if served or servant)
    let finalServedStage: string | undefined = undefined;
    let finalServingStage: string | undefined = undefined;

    if (signUpServiceStatus === 'served') {
      finalServedStage = (servedStageSelect.includes('أخرى') || servedStageSelect.includes('Other'))
        ? servedStageCustom.trim()
        : servedStageSelect;
      if (!finalServedStage) {
        setErrorMsg(language === 'ar' ? 'يرجى تحديد أو كتابة السنة / المرحلة (في سنة كام).' : 'Please specify what grade/stage you are in.');
        return;
      }
    } else if (signUpServiceStatus === 'servant') {
      finalServingStage = (servingStageSelect.includes('أخرى') || servingStageSelect.includes('Other'))
        ? servingStageCustom.trim()
        : servingStageSelect;
      if (!finalServingStage) {
        setErrorMsg(language === 'ar' ? 'يرجى تحديد أو كتابة المرحلة التي تخدم بها (في أي سن تخدم).' : 'Please specify what age/stage you serve.');
        return;
      }
    }

    // Confession Father validation
    if (!signUpConfessionFatherId) {
      setErrorMsg(t.auth.confessionFatherRequired);
      return;
    }

    // Passwords validation
    if (signUpPassword.length < 6) {
      setErrorMsg(t.auth.passwordMinLength);
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMsg(t.auth.passwordsDoNotMatch);
      return;
    }

    setIsLoading(true);
    const result = await signUp({
      name: signUpName.trim(),
      gender: signUpGender,
      date_of_birth: signUpDob,
      national_id: cleanNationalId,
      phone: signUpPhone.trim(),
      secondary_phone: signUpSecondaryPhone.trim() || undefined,
      email: signUpEmail.trim(),
      marital_status: signUpMaritalStatus,
      profession: signUpProfession.trim() || undefined,
      education: signUpEducation.trim() || undefined,
      address: signUpAddress.trim(),
      service_status: signUpServiceStatus,
      served_stage: finalServedStage,
      serving_stage: finalServingStage,
      other_services: signUpOtherServices.trim() || undefined,
      confession_father_id: signUpConfessionFatherId,
      password: signUpPassword,
      title_ar: signUpName.trim(),
      title_en: signUpName.trim(),
    });
    setIsLoading(false);

    if (result.success) {
      setSuccessMsg(t.auth.signUpSuccess);
    } else {
      setErrorMsg(
        result.error === 'EMAIL_EXISTS'
          ? (language === 'ar' ? 'يوجد حساب مسجل بالفعل بهذا البريد الإلكتروني.' : 'An account with this email already exists.')
          : result.error || 'Failed to create account'
      );
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setIsLoading(true);
    await resetPassword(forgotEmail.trim());
    setIsLoading(false);
    setForgotSent(true);
  };

  const servedPresets = language === 'ar' ? SERVED_STAGE_PRESETS_AR : SERVED_STAGE_PRESETS_EN;
  const servingPresets = language === 'ar' ? SERVING_STAGE_PRESETS_AR : SERVING_STAGE_PRESETS_EN;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Top language toggle & branding bar */}
      <div className={`w-full mx-auto flex items-center justify-between mb-4 transition-all duration-300 ${authMode === 'signup' ? 'max-w-3xl' : 'max-w-md'}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-navy-950 flex items-center justify-center text-gold-400 shadow-md">
            <Church className="w-6 h-6 text-gold-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-navy-950 font-serif leading-tight">
              {t.appName}
            </h1>
            <p className="text-[11px] text-stone-500 font-medium">
              {t.churchName}
            </p>
          </div>
        </div>

        <LanguageSwitcher />
      </div>

      {/* Main Authentication Card */}
      <div className={`w-full mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xl space-y-6 transition-all duration-300 ${
        authMode === 'signup' ? 'max-w-3xl' : 'max-w-md'
      }`}>
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-navy-950 to-navy-900 text-gold-400 shadow-inner">
            <Church className="w-8 h-8 text-gold-400" />
          </div>
          <h2 className="text-xl font-bold font-serif text-navy-950">
            {authMode === 'signin' ? t.auth.signInTitle : t.auth.signUpTitle}
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed max-w-md mx-auto">
            {authMode === 'signin' ? t.auth.signInSubtitle : t.auth.signUpSubtitle}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              authMode === 'signin'
                ? 'bg-navy-950 text-gold-400 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{t.auth.signInButton}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              authMode === 'signup'
                ? 'bg-navy-950 text-gold-400 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.auth.signUpButton}</span>
          </button>
        </div>

        {/* Error / Success Feedback Notices */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SIGN IN FORM */}
        {/* ========================================================================= */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.auth.emailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-gold-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700">
                  {t.auth.passwordLabel}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(true);
                    setForgotSent(false);
                    setForgotEmail(signInEmail);
                  }}
                  className="text-[11px] text-church-700 hover:text-navy-950 font-semibold hover:underline"
                >
                  {t.auth.forgotPassword}
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                <input
                  type={showSignInPassword ? 'text' : 'password'}
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs ps-10 pe-10 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-gold-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="absolute end-3 top-2.5 p-0.5 text-stone-400 hover:text-stone-600"
                >
                  {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-navy-950 hover:bg-navy-900 text-gold-400 font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 text-gold-400" />
              <span>{isLoading ? (language === 'ar' ? 'جارٍ تسجيل الدخول...' : 'Signing in...') : t.auth.signInButton}</span>
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* COMPREHENSIVE SIGN UP FORM (MEMBER REGISTRATION) */}
        {/* ========================================================================= */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-6">
            
            {/* ---------------- Section 1: Personal Identity ---------------- */}
            <div className="bg-stone-50/80 rounded-2xl p-4 sm:p-5 border border-stone-200/80 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-navy-950 border-b border-stone-200/80 pb-2">
                <User className="w-4 h-4 text-gold-600" />
                <span>{t.auth.sectionIdentity}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.auth.fullNameLabel} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder={language === 'ar' ? 'الاسم بالكامل ثلاثي أو رباعي' : 'Full Name (First & Last)'}
                      className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Gender Selector */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    {t.auth.genderLabel} <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSignUpGender('male')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                        signUpGender === 'male'
                          ? 'bg-navy-950 text-gold-400 border-navy-950 ring-2 ring-gold-400 shadow-sm'
                          : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>{t.auth.genderMale}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignUpGender('female')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                        signUpGender === 'female'
                          ? 'bg-navy-950 text-gold-400 border-navy-950 ring-2 ring-gold-400 shadow-sm'
                          : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>{t.auth.genderFemale}</span>
                    </button>
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.auth.dateOfBirthLabel} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                    <input
                      type="date"
                      required
                      max={new Date().toISOString().split('T')[0]}
                      value={signUpDob}
                      onChange={(e) => setSignUpDob(e.target.value)}
                      className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* National ID (14 digits) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">
                      {t.auth.nationalIdLabel} <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      signUpNationalId.length === 14 ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {signUpNationalId.length}/14
                    </span>
                  </div>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                    <input
                      type="text"
                      required
                      maxLength={14}
                      inputMode="numeric"
                      value={signUpNationalId}
                      onChange={(e) => {
                        const num = e.target.value.replace(/\D/g, '');
                        setSignUpNationalId(num);
                      }}
                      placeholder="14 digits (الرقم القومي)"
                      className={`w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border font-mono tracking-wider bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none transition ${
                        signUpNationalId.length > 0 && signUpNationalId.length !== 14 ? 'border-amber-400 bg-amber-50/30' : 'border-stone-300'
                      }`}
                    />
                  </div>
                </div>

                {/* Educational Qualification */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.auth.educationLabel}
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                    <input
                      type="text"
                      value={signUpEducation}
                      onChange={(e) => setSignUpEducation(e.target.value)}
                      placeholder={t.auth.educationPlaceholder}
                      className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Profession / Occupation */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.auth.professionLabel}
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                    <input
                      type="text"
                      value={signUpProfession}
                      onChange={(e) => setSignUpProfession(e.target.value)}
                      placeholder={t.auth.professionPlaceholder}
                      className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Marital Status */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    {t.auth.maritalStatusLabel} <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: 'single', label: t.auth.maritalSingle },
                      { key: 'married', label: t.auth.maritalMarried },
                      { key: 'widowed', label: t.auth.maritalWidowed },
                      { key: 'divorced', label: t.auth.maritalDivorced },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSignUpMaritalStatus(key as MaritalStatus)}
                        className={`p-2 rounded-xl text-xs font-bold border transition ${
                          signUpMaritalStatus === key
                            ? 'bg-navy-950 text-gold-400 border-navy-950 ring-2 ring-gold-400 shadow-sm'
                            : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------- Section 2: Contact Info & Address ---------------- */}
            <div className="bg-stone-50/80 rounded-2xl p-4 sm:p-5 border border-stone-200/80 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-navy-950 border-b border-stone-200/80 pb-2">
                <Phone className="w-4 h-4 text-gold-600" />
                <span>{t.auth.sectionContact}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Phone */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.auth.phoneLabel} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={signUpPhone}
                      onChange={(e) => setSignUpPhone(e.target.value)}
                      placeholder="01012345678"
                      className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Secondary Phone (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.auth.secondaryPhoneLabel}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-300 absolute start-3.5 top-3" />
                    <input
                      type="tel"
                      value={signUpSecondaryPhone}
                      onChange={(e) => setSignUpSecondaryPhone(e.target.value)}
                      placeholder={language === 'ar' ? 'رقم هاتف إضافي أو منزل' : 'Secondary Phone (Optional)'}
                      className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.auth.emailLabel} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Home Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.auth.addressLabel} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={signUpAddress}
                      onChange={(e) => setSignUpAddress(e.target.value)}
                      placeholder={language === 'ar' ? 'رقم العقار، اسم الشارع، الحي، المدينة' : 'Street address, building, district, city'}
                      className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------- Section 3: Church Fellowship & Service ---------------- */}
            <div className="bg-stone-50/80 rounded-2xl p-4 sm:p-5 border border-stone-200/80 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-navy-950 border-b border-stone-200/80 pb-2">
                <Church className="w-4 h-4 text-gold-600" />
                <span>{t.auth.sectionChurch}</span>
              </div>

              {/* Service Status: 3 Options */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {t.auth.serviceStatusLabel} <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option 1: General Congregation (Default) */}
                  <button
                    type="button"
                    onClick={() => setSignUpServiceStatus('general_member')}
                    className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 text-center ${
                      signUpServiceStatus === 'general_member'
                        ? 'bg-navy-950 text-gold-400 border-navy-950 ring-2 ring-gold-400 shadow-sm'
                        : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Church className="w-4 h-4 shrink-0" />
                    <span>{t.auth.generalMemberOption}</span>
                  </button>

                  {/* Option 2: To Be Served (Attending a meeting) */}
                  <button
                    type="button"
                    onClick={() => setSignUpServiceStatus('served')}
                    className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 text-center ${
                      signUpServiceStatus === 'served'
                        ? 'bg-navy-950 text-gold-400 border-navy-950 ring-2 ring-gold-400 shadow-sm'
                        : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Users className="w-4 h-4 shrink-0" />
                    <span>{t.auth.servedOption}</span>
                  </button>

                  {/* Option 3: Active Servant */}
                  <button
                    type="button"
                    onClick={() => setSignUpServiceStatus('servant')}
                    className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 text-center ${
                      signUpServiceStatus === 'servant'
                        ? 'bg-navy-950 text-gold-400 border-navy-950 ring-2 ring-gold-400 shadow-sm'
                        : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Award className="w-4 h-4 shrink-0" />
                    <span>{t.auth.servantOption}</span>
                  </button>
                </div>
              </div>

              {/* CONDITIONAL: If "To Be Served" -> "في سنة كام" */}
              {signUpServiceStatus === 'served' && (
                <div className="p-3.5 bg-white rounded-xl border border-gold-300 space-y-2.5 animate-in fade-in">
                  <label className="block text-xs font-bold text-navy-950">
                    {t.auth.servedStageLabel} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={servedStageSelect}
                    onChange={(e) => setServedStageSelect(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-gold-500 font-semibold text-stone-800"
                  >
                    {servedPresets.map((preset) => (
                      <option key={preset} value={preset}>{preset}</option>
                    ))}
                  </select>

                  {(servedStageSelect.includes('أخرى') || servedStageSelect.includes('Other')) && (
                    <input
                      type="text"
                      required
                      value={servedStageCustom}
                      onChange={(e) => setServedStageCustom(e.target.value)}
                      placeholder={t.auth.servedStagePlaceholder}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500"
                    />
                  )}
                </div>
              )}

              {/* CONDITIONAL: If "Servant" -> "في أي سن تخدم" */}
              {signUpServiceStatus === 'servant' && (
                <div className="p-3.5 bg-white rounded-xl border border-gold-300 space-y-2.5 animate-in fade-in">
                  <label className="block text-xs font-bold text-navy-950">
                    {t.auth.servingStageLabel} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={servingStageSelect}
                    onChange={(e) => setServingStageSelect(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-gold-500 font-semibold text-stone-800"
                  >
                    {servingPresets.map((preset) => (
                      <option key={preset} value={preset}>{preset}</option>
                    ))}
                  </select>

                  {(servingStageSelect.includes('أخرى') || servingStageSelect.includes('Other')) && (
                    <input
                      type="text"
                      required
                      value={servingStageCustom}
                      onChange={(e) => setServingStageCustom(e.target.value)}
                      placeholder={t.auth.servingStagePlaceholder}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500"
                    />
                  )}
                </div>
              )}

              {/* Confession Father Selection (Mandatory) */}
              <div className="space-y-2 pt-2 border-t border-stone-200/80">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-navy-950">
                    {t.auth.confessionFatherLabel} <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-church-800 font-bold bg-gold-100/80 px-2 py-0.5 rounded-full border border-gold-300">
                    {language === 'ar' ? 'تحديد دائم' : 'Permanent Assignment'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {availablePriests.map((priest) => {
                    const isSelected = signUpConfessionFatherId === priest.id;
                    return (
                      <button
                        key={priest.id}
                        type="button"
                        onClick={() => setSignUpConfessionFatherId(priest.id)}
                        className={`p-3 rounded-2xl border text-start transition flex items-center gap-3 ${
                          isSelected
                            ? 'bg-gradient-to-r from-navy-950 to-navy-900 text-white border-navy-950 ring-2 ring-gold-400 shadow-md'
                            : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <img
                          src={priest.avatar_url || DEFAULT_SKELETON_AVATAR}
                          alt={priest.name}
                          className={`w-10 h-10 rounded-xl object-cover ring-2 shrink-0 ${
                            isSelected ? 'ring-gold-400' : 'ring-stone-200'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className={`font-bold text-xs truncate ${isSelected ? 'text-gold-400' : 'text-navy-950'}`}>
                            {language === 'ar' ? (priest.title_ar || priest.name) : (priest.title_en || priest.name)}
                          </p>
                          <p className={`text-[10px] truncate ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                            {t.churchName}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0 ms-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[11px] text-amber-900 bg-amber-50/90 p-2.5 rounded-xl border border-amber-200 leading-relaxed flex items-start gap-1.5">
                  <span className="shrink-0 text-amber-600 font-bold">⚠️</span>
                  <span>{t.auth.confessionFatherNotice}</span>
                </div>
              </div>

              {/* Other Services (Optional) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.auth.otherServicesLabel}
                </label>
                <textarea
                  rows={2}
                  value={signUpOtherServices}
                  onChange={(e) => setSignUpOtherServices(e.target.value)}
                  placeholder={t.auth.otherServicesPlaceholder}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>
            </div>

            {/* ---------------- Section 4: Account Security (Password) ---------------- */}
            <div className="bg-stone-50/80 rounded-2xl p-4 sm:p-5 border border-stone-200/80 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-navy-950 border-b border-stone-200/80 pb-2">
                <Lock className="w-4 h-4 text-gold-600" />
                <span>{t.auth.sectionSecurity}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.auth.passwordLabel} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs ps-10 pe-10 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute end-3 top-2.5 p-0.5 text-stone-400 hover:text-stone-600"
                    >
                      {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.auth.confirmPasswordLabel} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gold-50/70 rounded-2xl border border-gold-200 text-[11px] text-church-950 leading-relaxed">
              ℹ️ {t.auth.registerMemberNotice}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-navy-950 hover:bg-navy-900 text-gold-400 font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50 scale-100 hover:scale-[1.01]"
            >
              <UserPlus className="w-4 h-4 text-gold-400" />
              <span>{isLoading ? (language === 'ar' ? 'جارٍ إنشاء الحساب...' : 'Creating account...') : t.auth.signUpButton}</span>
            </button>
          </form>
        )}

        {/* Security & RLS Footer */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-center gap-2 text-center text-[11px] text-stone-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            {language === 'ar' 
              ? 'نظام مؤمن بمستويات صلاحيات وقواعد أمان Row Level Security' 
              : 'Secured with Postgres Row Level Security (RLS) policies'}
          </span>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-2 text-church-700">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-bold text-base text-navy-950 font-serif">
                {t.auth.forgotPassword}
              </h3>
            </div>

            {forgotSent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs">
                {language === 'ar' 
                  ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.' 
                  : 'A password reset link has been dispatched to your email.'}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <p className="text-xs text-stone-600 leading-relaxed">
                  {t.auth.resetPasswordPrompt}
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-gold-500"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-navy-950 text-gold-400 text-xs font-bold shadow transition"
                >
                  {isLoading ? (language === 'ar' ? 'جارٍ الإرسال...' : 'Sending...') : (language === 'ar' ? 'إرسال الرابط' : 'Send Reset Link')}
                </button>
              </form>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
