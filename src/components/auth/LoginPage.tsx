import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { LanguageSwitcher } from '../layout/LanguageSwitcher';
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
  ShieldCheck
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { signIn, signUp, resetPassword } = useAppStore();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

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

    if (!signUpName.trim()) {
      setErrorMsg(t.auth.nameRequired);
      return;
    }
    if (!signUpEmail.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email address');
      return;
    }
    if (!signUpPhone.trim()) {
      setErrorMsg(t.auth.phoneRequired);
      return;
    }
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
      email: signUpEmail.trim(),
      phone: signUpPhone.trim(),
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

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Top language toggle & branding bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between mb-6">
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
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xl space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-navy-950 to-navy-900 text-gold-400 shadow-inner">
            <Church className="w-8 h-8 text-gold-400" />
          </div>
          <h2 className="text-xl font-bold font-serif text-navy-950">
            {authMode === 'signin' ? t.auth.signInTitle : t.auth.signUpTitle}
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
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

        {/* SIGN IN FORM */}
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

        {/* SIGN UP FORM (MEMBER REGISTRATION) */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.auth.fullNameLabel}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder={language === 'ar' ? 'الاسم ثلاثي أو رباعي' : 'Full Name'}
                  className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-gold-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.auth.emailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-gold-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.auth.phoneLabel}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={signUpPhone}
                  onChange={(e) => setSignUpPhone(e.target.value)}
                  placeholder="01234567890"
                  className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-gold-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.auth.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  required
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs ps-10 pe-10 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-gold-500 focus:bg-white transition"
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

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.auth.confirmPasswordLabel}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  required
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-gold-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="p-3 bg-gold-50/70 rounded-2xl border border-gold-200 text-[11px] text-church-950 leading-relaxed">
              ℹ️ {t.auth.registerMemberNotice}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-navy-950 hover:bg-navy-900 text-gold-400 font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50"
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
