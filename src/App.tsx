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

const MainAppContent: React.FC = () => {
  const { 
    currentUser, 
    isLoggedIn, 
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        
        {/* Super Admin Dashboard */}
        {currentUser.role === 'admin' && (
          <SuperAdminDashboard
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}

        {/* General User (Member) Views */}
        {currentUser.role === 'general' && (
          <>
            {activeTab === 'priests' && (
              selectedPriestForBooking ? (
                <PriestAppointmentsPage
                  priest={selectedPriestForBooking}
                  onBack={() => setSelectedPriestForBooking(null)}
                  onBookingComplete={() => {
                    setSelectedPriestForBooking(null);
                    setActiveTab('my_appointments');
                  }}
                />
              ) : (
                <>
                  <LiturgicalBanner />
                  <PriestSelector
                    onSelectPriest={(priest) => setSelectedPriestForBooking(priest)}
                  />
                </>
              )
            )}

            {activeTab === 'my_appointments' && (
              <UserBookingsHistory />
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
