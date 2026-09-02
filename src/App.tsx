import React, { useState, useEffect } from 'react';
import { I18nProvider } from './lib/i18n';
import { AppStoreProvider, useAppStore } from './lib/store';
import { LoginPage } from './components/auth/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LiturgicalBanner } from './components/church/LiturgicalBanner';
import { PriestSelector } from './components/user/PriestSelector';
import { PriestAppointmentsPage } from './components/user/PriestAppointmentsPage';
import { UserBookingsHistory } from './components/user/UserBookingsHistory';
import { PriestDashboard } from './components/priest/PriestDashboard';
import { SecretaryDashboard } from './components/secretary/SecretaryDashboard';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { MemberProfilePage } from './components/user/MemberProfilePage';
import { ParishAnnouncementBanner } from './components/common/ParishAnnouncementBanner';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainAppContent: React.FC = () => {
  const { 
    currentUser, 
    isLoggedIn, 
    priests,
    selectedPriestForBooking, 
    setSelectedPriestForBooking 
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<string>('priests');

  // Auto-switch default tab when user switches roles
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'admin') {
      setActiveTab('admin_overview');
    } else if (currentUser.role === 'priest') {
      setActiveTab('priest_schedule');
    } else if (currentUser.role === 'secretary') {
      setActiveTab('secretary_ops');
    } else {
      setActiveTab('priests');
    }
  }, [currentUser?.role]);

  // If not logged in, display the Login Page
  if (!isLoggedIn || !currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-900 selection:bg-gold-500 selection:text-white">
      {/* Main Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <ErrorBoundary>
          {/* Parish Broadcasts & Announcements Banner */}
          <ParishAnnouncementBanner />

        {/* Super Admin Dashboard */}
        {currentUser.role === 'admin' && (
          activeTab === 'my_profile' ? (
            <MemberProfilePage
              onNavigateToBooking={() => setActiveTab('admin_users')}
              onNavigateToAppointments={() => setActiveTab('admin_overview')}
            />
          ) : (
            <SuperAdminDashboard
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )
        )}

        {/* General User (Member) Views: Exclusive to their Confession Father */}
        {currentUser.role === 'general' && (
          <>
            {activeTab === 'priests' && (() => {
              const myFather = priests.find(p => p.id === currentUser.confession_father_id) || priests[0];
              return (
                <>
                  <LiturgicalBanner />
                  {myFather ? (
                    <PriestAppointmentsPage
                      priest={myFather}
                      isExclusiveConfessionFather={true}
                      onBookingComplete={() => {
                        setActiveTab('my_appointments');
                      }}
                    />
                  ) : (
                    <div className="p-8 bg-white border border-stone-200 rounded-3xl text-center text-sm text-stone-500">
                      No confession fathers available.
                    </div>
                  )}
                </>
              );
            })()}

            {activeTab === 'my_appointments' && (
              <UserBookingsHistory />
            )}

            {activeTab === 'my_profile' && (
              <MemberProfilePage
                onNavigateToBooking={() => setActiveTab('priests')}
                onNavigateToAppointments={() => setActiveTab('my_appointments')}
              />
            )}
          </>
        )}

        {/* Priest Pastoral Portal */}
        {currentUser.role === 'priest' && (
          <PriestDashboard
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}

        {/* Church Secretary Operations Center */}
        {currentUser.role === 'secretary' && (
          <SecretaryDashboard />
        )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
};

export function App() {
  return (
    <I18nProvider>
      <AppStoreProvider>
        <MainAppContent />
      </AppStoreProvider>
    </I18nProvider>
  );
}

export default App;
