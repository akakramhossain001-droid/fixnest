import { useState, useCallback } from 'react';
import type { TabName, ScreenName } from '@/types';
import HomeScreen from '@/screens/HomeScreen';
import ProviderProfileScreen from '@/screens/ProviderProfileScreen';
import BookingsScreen from '@/screens/BookingsScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import ReferralScreen from '@/screens/ReferralScreen';
import WalletScreen from '@/screens/WalletScreen';
import PersonalInfoScreen from '@/screens/PersonalInfoScreen';
import SavedAddressesScreen from '@/screens/SavedAddressesScreen';
import NotificationFeedScreen from '@/screens/NotificationFeedScreen';
import NotificationSettingsScreen from '@/screens/NotificationSettingsScreen';
import SafetyCenterScreen from '@/screens/SafetyCenterScreen';
import TermsPrivacyScreen from '@/screens/TermsPrivacyScreen';
import SavedProvidersScreen from '@/screens/SavedProvidersScreen';
import AdminDashboardScreen from '@/screens/AdminDashboardScreen';
import BottomNav from '@/components/BottomNav';
import AuthModal from '@/components/AuthModal';
import OnboardingScreen from '@/screens/OnboardingScreen';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [screenStack, setScreenStack] = useState<ScreenName[]>(['home']);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  
  // Check auth status
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAuthenticated = !!token;
  
  // Show onboarding if authenticated but phone is missing
  const hasPhone = !!(user && user.phone);
  const [showOnboarding, setShowOnboarding] = useState(isAuthenticated && !hasPhone);

  const currentScreen = screenStack[screenStack.length - 1];

  const pushScreen = useCallback((screen: ScreenName, providerId?: string) => {
    if (providerId) setSelectedProviderId(providerId);
    setScreenStack((prev) => [...prev, screen]);
  }, []);

  const popScreen = useCallback(() => {
    setScreenStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const handleNavigateToProfile = useCallback((providerId: string) => {
    pushScreen('providerProfile', providerId);
  }, [pushScreen]);


  // Map tab to screen
  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setScreenStack(['home']);
    } else if (tab === 'bookings') {
      setScreenStack(['bookings']);
    } else if (tab === 'profile') {
      setScreenStack(['profile']);
    }
  };

  return (
    <div className="app-container">
      <div className="mobile-frame">
        {/* Main content area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {!isAuthenticated ? (
            <div className="absolute inset-0 z-50">
              <AuthModal isMandatory={true} />
            </div>
          ) : showOnboarding ? (
            <div className="absolute inset-0 z-50">
              <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
            </div>
          ) : (
            <>
              <div className={currentScreen === 'home' ? 'block h-full w-full relative' : 'hidden'}>
                <HomeScreen
                  key="home"
                  onNavigateToProfile={handleNavigateToProfile}
                  onNavigate={pushScreen}
                  isActive={currentScreen === 'home'}
                />
              </div>
          {currentScreen === 'providerProfile' && selectedProviderId && (
            <ProviderProfileScreen
              key={`profile-${selectedProviderId}`}
              providerId={selectedProviderId}
              onBack={popScreen}
            />
          )}
          {currentScreen === 'bookings' && <BookingsScreen key="bookings" />}
          {currentScreen === 'profile' && <ProfileScreen key="profile" onNavigate={(screen) => pushScreen(screen)} />}
          {currentScreen === 'referral' && <ReferralScreen key="referral" onBack={popScreen} />}
          {currentScreen === 'wallet' && <WalletScreen key="wallet" onBack={popScreen} />}
          {currentScreen === 'personalInfo' && <PersonalInfoScreen key="personalInfo" onBack={popScreen} />}
          {currentScreen === 'addresses' && <SavedAddressesScreen key="addresses" onBack={popScreen} />}
          {currentScreen === 'notificationFeed' && <NotificationFeedScreen key="notificationFeed" onBack={popScreen} />}
          {currentScreen === 'notificationSettings' && <NotificationSettingsScreen key="notificationSettings" onBack={popScreen} />}
          {currentScreen === 'safetyCenter' && <SafetyCenterScreen key="safetyCenter" onBack={popScreen} />}
          {currentScreen === 'termsPrivacy' && <TermsPrivacyScreen key="termsPrivacy" onBack={popScreen} />}
          {currentScreen === 'savedProviders' && <SavedProvidersScreen key="savedProviders" onBack={popScreen} onNavigateToProfile={handleNavigateToProfile} />}
          {currentScreen === 'adminDashboard' && <AdminDashboardScreen key="adminDashboard" onBack={popScreen} />}
            </>
          )}
        </main>

        {/* Bottom Navigation - only show on main screens and when authenticated and onboarding is done */}
        {isAuthenticated && !showOnboarding && screenStack.length === 1 && (
          <BottomNav activeTab={activeTab} onTabChange={handleTabPress} />
        )}
      </div>
    </div>
  );
}
