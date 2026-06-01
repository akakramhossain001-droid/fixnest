import { User, MapPin, Bell, HelpCircle, FileText, LogOut, ChevronRight, Heart, Shield, Gift, Wallet, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import ProfilePhotoModal from '@/components/ProfilePhotoModal';

interface MenuItem {
  id: string;
  icon: React.ElementType;
  label: string;
  subtitle?: string;
  danger?: boolean;
}

const menuSections: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Account',
    items: [
      { id: 'personal', icon: User, label: 'Personal Info', subtitle: 'Name, phone, email' },
      { id: 'address', icon: MapPin, label: 'Saved Addresses', subtitle: 'Manage locations' },
      { id: 'notifications', icon: Bell, label: 'Notifications', subtitle: 'Push, SMS, Email' },
    ],
  },
  {
    title: 'Payments & Wallet',
    items: [
      { id: 'wallet', icon: Wallet, label: 'FixNest Wallet', subtitle: 'Manage balance & cards' },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 'help', icon: HelpCircle, label: 'Help Center' },
      { id: 'terms', icon: FileText, label: 'Terms & Privacy' },
      { id: 'safety', icon: Shield, label: 'Safety Center' },
    ],
  },
  {
    title: 'More',
    items: [
      { id: 'referral', icon: Gift, label: 'Refer & Earn', subtitle: 'Give ₹50, Get ₹50' },
      { id: 'saved', icon: Heart, label: 'Saved Providers' },
      { id: 'logout', icon: LogOut, label: 'Log Out', danger: true },
    ],
  },
];

interface ProfileScreenProps {
  onNavigate: (screen: import('@/types').ScreenName) => void;
}

export default function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string, email: string, role: string } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {}
    }
    const savedPhoto = localStorage.getItem('profilePhoto');
    if (savedPhoto) {
      setProfileImage(savedPhoto);
    }
  }, []);

  const handleUpdateImage = (newUrl: string | null) => {
    setProfileImage(newUrl);
    if (newUrl) {
      localStorage.setItem('profilePhoto', newUrl);
    } else {
      localStorage.removeItem('profilePhoto');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto no-scrollbar bg-surface">
        {/* Header */}
        <div className="bg-white px-4 py-6 border-b border-gray-200">
          <h1 className="font-heading font-bold text-xl text-text-primary">Account</h1>
        </div>

        {/* User Profile Card */}
        <div className="bg-white px-5 py-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsPhotoModalOpen(true)}
              className="w-16 h-16 rounded-full bg-teal-light flex items-center justify-center overflow-hidden border-2 border-white shadow-sm hover:scale-105 transition-transform active:scale-95"
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={28} className="text-teal" />
              )}
            </button>
            <div>
              <h2 className="font-heading font-semibold text-lg text-text-primary">
                {user ? user.name : 'Guest User'}
              </h2>
              <p className="text-text-secondary text-sm">{user ? user.email : 'Not logged in'}</p>
              <div className="flex items-center gap-1 mt-1">
                <Shield size={12} className="text-teal" />
                <span className="text-teal text-xs font-medium">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <div className="mt-3 bg-white">
            <div className="px-5 pt-4 pb-2">
              <h3 className="text-xs font-semibold text-teal uppercase tracking-wide">
                Admin Area
              </h3>
            </div>
            <div className="px-2 pb-2">
              <button
                onClick={() => onNavigate('adminDashboard')}
                className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl transition-colors text-text-primary"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-teal-light">
                  <LayoutDashboard size={18} className="text-teal" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-text-primary">
                    Admin Dashboard
                  </p>
                  <p className="text-text-muted text-xs mt-0.5">Manage users & bookings</p>
                </div>
                <ChevronRight size={16} className="text-text-muted" />
              </button>
            </div>
          </div>
        )}

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <div key={section.title} className="mt-3 bg-white">
            <div className="px-5 pt-4 pb-2">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                {section.title}
              </h3>
            </div>
            <div className="px-2 pb-2">
              {section.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'referral') {
                        onNavigate('referral');
                      } else if (item.id === 'wallet') {
                        onNavigate('wallet');
                      } else if (item.id === 'personal') {
                        onNavigate('personalInfo');
                      } else if (item.id === 'address') {
                        onNavigate('addresses');
                      } else if (item.id === 'notifications') {
                        onNavigate('notificationSettings');
                      } else if (item.id === 'safety') {
                        onNavigate('safetyCenter');
                      } else if (item.id === 'terms') {
                        onNavigate('termsPrivacy');
                      } else if (item.id === 'saved') {
                        onNavigate('savedProviders');
                      } else if (item.id === 'logout') {
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                        localStorage.removeItem('onboardingCompleted');
                        window.location.reload();
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-xl transition-colors ${
                      item.danger ? 'text-red-500' : 'text-text-primary'
                    } ${index < section.items.length - 1 ? 'border-b border-gray-50' : ''}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      item.danger ? 'bg-red-50' : 'bg-gray-50'
                    }`}>
                      <Icon size={18} className={item.danger ? 'text-red-500' : 'text-text-secondary'} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-medium ${item.danger ? 'text-red-500' : 'text-text-primary'}`}>
                        {item.label}
                      </p>
                      {item.subtitle && (
                        <p className="text-text-muted text-xs mt-0.5">{item.subtitle}</p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-text-muted" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* App Version */}
        <div className="py-8 text-center">
          <p className="text-text-muted text-xs">FixNest v1.0.0</p>
          <p className="text-text-muted text-xs mt-1">Made with care in India</p>
        </div>
      </div>
      
      <ProfilePhotoModal 
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        imageUrl={profileImage}
        onUpdateImage={handleUpdateImage}
      />
    </div>
  );
}
