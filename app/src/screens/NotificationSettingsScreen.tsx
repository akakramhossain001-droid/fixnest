import { useState } from 'react';
import { ArrowLeft, BellRing, Smartphone, Mail, MessageCircle } from 'lucide-react';

interface NotificationSettingsScreenProps {
  onBack: () => void;
}

export default function NotificationSettingsScreen({ onBack }: NotificationSettingsScreenProps) {
  const [settings, setSettings] = useState({
    push: true,
    sms: false,
    email: true,
    whatsapp: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <header className="bg-white px-4 h-14 flex items-center border-b border-gray-200 sticky top-0 z-40">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="font-heading font-bold text-lg text-text-primary ml-2">Notification Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5">
        
        <p className="text-sm text-text-secondary mb-6">
          Choose how you want to receive updates about your bookings, offers, and account activity.
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Push Notifications */}
          <div className="p-4 flex items-center justify-between border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-teal-light/50 flex items-center justify-center text-teal">
                <BellRing size={20} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-text-primary">Push Notifications</h3>
                <p className="text-xs text-text-secondary mt-0.5">App alerts on your device</p>
              </div>
            </div>
            <button 
              onClick={() => toggleSetting('push')}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.push ? 'bg-teal' : 'bg-gray-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.push ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* SMS Alerts */}
          <div className="p-4 flex items-center justify-between border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <Smartphone size={20} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-text-primary">SMS Alerts</h3>
                <p className="text-xs text-text-secondary mt-0.5">Text messages to your phone</p>
              </div>
            </div>
            <button 
              onClick={() => toggleSetting('sms')}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.sms ? 'bg-teal' : 'bg-gray-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.sms ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Email Updates */}
          <div className="p-4 flex items-center justify-between border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-text-primary">Email Updates</h3>
                <p className="text-xs text-text-secondary mt-0.5">Offers and booking receipts</p>
              </div>
            </div>
            <button 
              onClick={() => toggleSetting('email')}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.email ? 'bg-teal' : 'bg-gray-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.email ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* WhatsApp Updates */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E8FADF] flex items-center justify-center text-[#25D366]">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-text-primary">WhatsApp Updates</h3>
                <p className="text-xs text-text-secondary mt-0.5">Direct chat updates</p>
              </div>
            </div>
            <button 
              onClick={() => toggleSetting('whatsapp')}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.whatsapp ? 'bg-teal' : 'bg-gray-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.whatsapp ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
