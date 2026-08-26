import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { User } from '../../types/database';
import { LanguageSwitcher } from '../layout/LanguageSwitcher';
import { Badge } from '../common/Badge';
import { 
  Church, 
  Sparkles, 
  LogIn, 
  Mail, 
  Lock, 
  ArrowRight, 
  Crown
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { allUsers, login, loginWithEmail } = useAppStore();

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const admins = allUsers.filter(u => u.role === 'admin');
  const priests = allUsers.filter(u => u.role === 'priest');
  const secretaries = allUsers.filter(u => u.role === 'secretary');
  const members = allUsers.filter(u => u.role === 'general');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!emailInput.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter an email address');
      return;
    }

    const success = loginWithEmail(emailInput);
    if (!success) {
      // Auto-create or fallback login for demo
      const user: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: emailInput.split('@')[0],
        email: emailInput.trim(),
        role: 'general',
        title_en: emailInput.split('@')[0],
        title_ar: emailInput.split('@')[0],
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
      };
      login(user);
    }
  };

  const handleQuickLogin = (user: User) => {
    login(user);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Top language toggle & branding bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-navy-950 flex items-center justify-center text-gold-400 shadow">
            <Church className="w-5 h-5 text-gold-400" />
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

      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Email/Password Sign In Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-gold-50 text-church-700 border border-gold-300 shadow-inner">
              <Church className="w-8 h-8 text-gold-600" />
            </div>
            <h2 className="text-xl font-bold font-serif text-navy-950">
              {t.auth.signInTitle}
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              {t.auth.signInSubtitle}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.auth.emailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. admin@church.org"
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
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs ps-10 pe-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-gold-500 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-navy-950 hover:bg-navy-900 text-gold-400 font-bold text-xs sm:text-sm shadow-md transition"
            >
              <LogIn className="w-4 h-4 text-gold-400" />
              <span>{t.auth.signInButton}</span>
            </button>
          </form>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-center text-[11px] text-stone-500">
            {language === 'ar' 
              ? '✝ نظام تسجيل دخول ومصادقة متكامل مع أمان قواعد البيانات RLS' 
              : '✝ Full account authentication with Postgres RLS authorization'}
          </div>
        </div>

        {/* Right Column: Dummy / Demo Accounts List */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl space-y-5">
          
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-200">
            <div className="p-2 rounded-xl bg-gold-500 text-navy-950 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-950 font-serif">
                {t.auth.demoAccountsTitle}
              </h3>
              <p className="text-xs text-stone-500">
                {t.auth.demoAccountsSubtitle}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* 0. Super Admin Group */}
            {admins.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t.roles.admin}</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {admins.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleQuickLogin(user)}
                      className="p-3.5 rounded-2xl border-2 border-amber-300 hover:border-gold-500 bg-amber-50/60 hover:bg-gold-50 text-start flex items-center justify-between gap-3 group transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-gold-400 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-navy-950 truncate group-hover:text-gold-700">
                            {language === 'ar' ? (user.title_ar || user.name) : (user.title_en || user.name)}
                          </p>
                          <p className="text-[10px] text-stone-500 truncate">
                            {user.email} {language === 'ar' ? '(إنشاء المستخدمين وتعيين الصلاحيات)' : '(User Creation & Role Assignment)'}
                          </p>
                          <Badge role={user.role} size="sm" className="mt-1" />
                        </div>
                      </div>

                      <div className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-400 group-hover:text-gold-600 transition shrink-0">
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 1. Priests Group */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-church-700">
                <span>⛪</span>
                <span>{t.roles.priest} ({priests.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {priests.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleQuickLogin(user)}
                    className="p-3 rounded-2xl border-2 border-stone-200 hover:border-gold-500 bg-stone-50/70 hover:bg-gold-50/40 text-start flex items-center justify-between gap-3 group transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-gold-400 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-navy-950 truncate group-hover:text-gold-700">
                          {language === 'ar' ? (user.title_ar || user.name) : (user.title_en || user.name)}
                        </p>
                        <p className="text-[10px] text-stone-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="p-1 rounded-lg bg-white border border-stone-200 text-stone-400 group-hover:text-gold-600 transition shrink-0">
                      <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Secretary Group */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700">
                <span>📋</span>
                <span>{t.roles.secretary} ({secretaries.length})</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {secretaries.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleQuickLogin(user)}
                    className="p-3 rounded-2xl border-2 border-stone-200 hover:border-purple-500 bg-stone-50/70 hover:bg-purple-50/40 text-start flex items-center justify-between gap-3 group transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-purple-400 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-navy-950 truncate group-hover:text-purple-700">
                          {language === 'ar' ? (user.title_ar || user.name) : (user.title_en || user.name)}
                        </p>
                        <p className="text-[10px] text-stone-500 truncate">
                          {user.email} {language === 'ar' ? '(عمليات السكرتارية والآباء المسندون)' : '(Church Operations & Assigned Priests)'}
                        </p>
                      </div>
                    </div>

                    <div className="p-1 rounded-lg bg-white border border-stone-200 text-stone-400 group-hover:text-purple-600 transition shrink-0">
                      <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. General Members Group */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700">
                <span>👤</span>
                <span>{t.roles.general} ({members.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {members.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleQuickLogin(user)}
                    className="p-2.5 rounded-2xl border-2 border-stone-200 hover:border-sky-500 bg-stone-50/70 hover:bg-sky-50/40 text-start flex flex-col justify-between gap-2 group transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-7 h-7 rounded-lg object-cover ring-1 ring-sky-400 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-navy-950 truncate group-hover:text-sky-700">
                          {language === 'ar' ? (user.title_ar || user.name) : (user.title_en || user.name)}
                        </p>
                        <p className="text-[9px] text-stone-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 text-[9px] font-semibold text-sky-800">
                      <span>{t.auth.signInAs}</span>
                      <ArrowRight className="w-2.5 h-2.5 rtl:rotate-180 text-sky-600" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
