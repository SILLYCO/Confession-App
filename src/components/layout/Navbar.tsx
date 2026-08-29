import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppStore } from '../../lib/store';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationCenter } from '../common/NotificationCenter';
import { Badge } from '../common/Badge';
import { 
  Bell, 
  Calendar, 
  CalendarOff,
  Clock, 
  UserCheck, 
  Church, 
  ShieldCheck, 
  Menu, 
  X,
  LogOut,
  Crown
} from 'lucide-react';
import { DEFAULT_SKELETON_AVATAR } from '../../types/database';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { t, language } = useTranslation();
  const { 
    currentUser, 
    unreadNotificationsCount, 
    signOut, 
    setSelectedPriestForBooking,
    setSelectedPriestForSecretary 
  } = useAppStore();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!currentUser) return null;

  const handleBrandClick = () => {
    setSelectedPriestForBooking(null);
    setSelectedPriestForSecretary(null);
    if (currentUser.role === 'admin') {
      setActiveTab('admin_users');
    } else if (currentUser.role === 'priest') {
      setActiveTab('priest_schedule');
    } else if (currentUser.role === 'secretary') {
      setActiveTab('secretary_ops');
    } else {
      setActiveTab('priests');
    }
  };

  const handleTabClick = (tab: string) => {
    if (tab === 'priests') {
      setSelectedPriestForBooking(null);
    }
    if (tab === 'secretary_ops') {
      setSelectedPriestForSecretary(null);
    }
    setActiveTab(tab);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Church Brand */}
            <div 
              onClick={handleBrandClick}
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-navy-900 flex items-center justify-center text-gold-400 shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Church className="w-5 h-5 sm:w-6 sm:h-6 text-gold-400" />
              </div>
              <div className="hidden min-[380px]:block">
                <h1 className="text-sm sm:text-base font-bold text-navy-950 font-serif leading-tight whitespace-nowrap">
                  {t.appName}
                </h1>
                <p className="text-[10px] sm:text-xs text-church-600 font-medium whitespace-nowrap">
                  {t.churchName}
                </p>
              </div>
            </div>

            {/* Navigation Tabs (Desktop) */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 shrink-0">
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => handleTabClick('admin_users')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                    activeTab === 'admin_users'
                      ? 'bg-navy-900 text-gold-400 shadow-sm'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Crown className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>{t.nav.adminDashboard}</span>
                </button>
              )}

              {currentUser.role === 'general' && (
                <>
                  <button
                    onClick={() => handleTabClick('priests')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                      activeTab === 'priests'
                        ? 'bg-navy-900 text-gold-400 shadow-sm'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Church className="w-4 h-4 shrink-0" />
                    <span>{t.nav.priests}</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('my_appointments')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                      activeTab === 'my_appointments'
                        ? 'bg-navy-900 text-gold-400 shadow-sm'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{t.nav.myAppointments}</span>
                  </button>
                </>
              )}

              {currentUser.role === 'priest' && (
                <>
                  <button
                    onClick={() => handleTabClick('priest_schedule')}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                      activeTab === 'priest_schedule'
                        ? 'bg-navy-900 text-gold-400 shadow-sm'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>{t.nav.priestSchedule}</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('priest_overrides')}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                      activeTab === 'priest_overrides'
                        ? 'bg-navy-900 text-gold-400 shadow-sm'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <CalendarOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>{t.nav.priestOverrides}</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('priest_appointments')}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                      activeTab === 'priest_appointments'
                        ? 'bg-navy-900 text-gold-400 shadow-sm'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>{t.nav.priestAppointments}</span>
                  </button>
                  <button
                    onClick={() => handleTabClick('priest_profile')}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                      activeTab === 'priest_profile'
                        ? 'bg-navy-900 text-gold-400 shadow-sm'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Church className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>{t.nav.priestProfile}</span>
                  </button>
                </>
              )}

              {currentUser.role === 'secretary' && (
                <button
                  onClick={() => handleTabClick('secretary_ops')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                    activeTab === 'secretary_ops'
                      ? 'bg-navy-900 text-gold-400 shadow-sm'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{t.nav.secretaryDashboard}</span>
                </button>
              )}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              
              {/* Notification Bell */}
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 transition shrink-0"
                title={t.notifications.title}
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-[9px] sm:text-[10px] font-bold text-white bg-rose-600 rounded-full border-2 border-white animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Language Switcher */}
              <div className="shrink-0">
                <LanguageSwitcher />
              </div>

              {/* User Info & Avatar */}
              <div className="hidden sm:flex items-center gap-2 ps-2 border-s border-stone-200 shrink-0 max-w-[150px] lg:max-w-[200px]">
                <img
                  src={currentUser.avatar_url || DEFAULT_SKELETON_AVATAR}
                  alt={currentUser.name}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-gold-400 shrink-0"
                />
                <div className="text-start min-w-0 flex-1">
                  <p 
                    className="text-xs font-bold text-navy-950 leading-tight truncate whitespace-nowrap"
                    title={language === 'ar' ? (currentUser.title_ar || currentUser.name) : (currentUser.title_en || currentUser.name)}
                  >
                    {language === 'ar' ? (currentUser.title_ar || currentUser.name) : (currentUser.title_en || currentUser.name)}
                  </p>
                  <Badge role={currentUser.role} size="sm" className="mt-0.5 whitespace-nowrap" />
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={signOut}
                className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-stone-300 hover:border-rose-300 hover:bg-rose-50 text-stone-600 hover:text-rose-700 text-xs font-bold whitespace-nowrap shrink-0 transition"
                title={t.auth.signOut}
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>{t.auth.signOut}</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 shrink-0"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-2">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar_url || DEFAULT_SKELETON_AVATAR}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gold-400"
                />
                <div>
                  <p className="text-sm font-bold text-navy-950">
                    {language === 'ar' ? (currentUser.title_ar || currentUser.name) : (currentUser.title_en || currentUser.name)}
                  </p>
                  <Badge role={currentUser.role} size="sm" className="mt-1" />
                </div>
              </div>

              <button
                onClick={signOut}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.auth.signOut}</span>
              </button>
            </div>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => { handleTabClick('admin_users'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  activeTab === 'admin_users' ? 'bg-navy-900 text-gold-400 font-bold' : 'text-stone-700'
                }`}
              >
                <Crown className="w-4 h-4 text-gold-400" />
                <span>{t.nav.adminDashboard}</span>
              </button>
            )}

            {currentUser.role === 'general' && (
              <>
                <button
                  onClick={() => { handleTabClick('priests'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    activeTab === 'priests' ? 'bg-navy-900 text-gold-400 font-bold' : 'text-stone-700'
                  }`}
                >
                  <Church className="w-4 h-4" />
                  <span>{t.nav.priests}</span>
                </button>
                <button
                  onClick={() => { handleTabClick('my_appointments'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    activeTab === 'my_appointments' ? 'bg-navy-900 text-gold-400 font-bold' : 'text-stone-700'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t.nav.myAppointments}</span>
                </button>
              </>
            )}

            {currentUser.role === 'priest' && (
              <>
                <button
                  onClick={() => { handleTabClick('priest_schedule'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    activeTab === 'priest_schedule' ? 'bg-navy-900 text-gold-400 font-bold' : 'text-stone-700'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{t.nav.priestSchedule}</span>
                </button>
                <button
                  onClick={() => { handleTabClick('priest_overrides'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    activeTab === 'priest_overrides' ? 'bg-navy-900 text-gold-400 font-bold' : 'text-stone-700'
                  }`}
                >
                  <CalendarOff className="w-4 h-4" />
                  <span>{t.nav.priestOverrides}</span>
                </button>
                <button
                  onClick={() => { handleTabClick('priest_appointments'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    activeTab === 'priest_appointments' ? 'bg-navy-900 text-gold-400 font-bold' : 'text-stone-700'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{t.nav.priestAppointments}</span>
                </button>
                <button
                  onClick={() => { handleTabClick('priest_profile'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    activeTab === 'priest_profile' ? 'bg-navy-900 text-gold-400 font-bold' : 'text-stone-700'
                  }`}
                >
                  <Church className="w-4 h-4" />
                  <span>{t.nav.priestProfile}</span>
                </button>
              </>
            )}

            {currentUser.role === 'secretary' && (
              <button
                onClick={() => { handleTabClick('secretary_ops'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  activeTab === 'secretary_ops' ? 'bg-navy-900 text-gold-400 font-bold' : 'text-stone-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t.nav.secretaryDashboard}</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Notification Center Modal */}
      <NotificationCenter
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
    </>
  );
};
