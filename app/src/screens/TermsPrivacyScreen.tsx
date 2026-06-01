import { useState } from 'react';
import { ArrowLeft, ChevronDown, FileText, Shield, CreditCard, UserCheck } from 'lucide-react';

interface TermsPrivacyScreenProps {
  onBack: () => void;
}

export default function TermsPrivacyScreen({ onBack }: TermsPrivacyScreenProps) {
  const [openSection, setOpenSection] = useState<string | null>('terms');

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const sections = [
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: FileText,
      content: (
        <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
          <p>
            Welcome to FixNest! By using our app, you agree to these terms. We connect you with independent home service professionals.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>You must be at least 18 years old to book a service.</li>
            <li>You agree to provide accurate location and contact information.</li>
            <li>FixNest reserves the right to suspend accounts that violate our community guidelines.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: Shield,
      content: (
        <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
          <p>
            Your privacy is important to us. We only collect data necessary to provide you with the best service experience.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>We do not sell your personal data to third parties.</li>
            <li>Your location is only shared with the assigned provider to help them reach you.</li>
            <li>You have the right to request deletion of your account data at any time.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'payment',
      title: 'Payment & Cancellation',
      icon: CreditCard,
      content: (
        <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
          <p>
            We strive to maintain fair pricing and policies for both customers and service providers.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Cancellations made within 2 hours of the scheduled time may incur a nominal fee.</li>
            <li>All payments are securely processed and encrypted.</li>
            <li>Refunds for unsatisfactory services are evaluated on a case-by-case basis within 48 hours.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'conduct',
      title: 'User Conduct',
      icon: UserCheck,
      content: (
        <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
          <p>
            We expect all users and providers to maintain a safe and respectful environment.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Any form of harassment, discrimination, or abusive language will result in immediate account termination.</li>
            <li>Please ensure a safe working environment for the professionals visiting your home.</li>
          </ul>
        </div>
      )
    }
  ];

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
        <h1 className="font-heading font-bold text-lg text-text-primary ml-2">Terms & Privacy</h1>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5">
        
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          Please read these terms carefully. By using FixNest, you agree to these policies and guidelines.
        </p>

        <div className="space-y-3">
          {sections.map((section) => {
            const Icon = section.icon;
            const isOpen = openSection === section.id;

            return (
              <div 
                key={section.id} 
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen ? 'border-teal/30 shadow-md' : 'border-gray-100 shadow-sm'
                }`}
              >
                <button 
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-4 flex items-center justify-between bg-white hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isOpen ? 'bg-teal text-white' : 'bg-gray-50 text-text-secondary'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <h2 className={`font-heading font-bold text-base transition-colors ${
                      isOpen ? 'text-teal' : 'text-text-primary'
                    }`}>
                      {section.title}
                    </h2>
                  </div>
                  <div className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                
                {/* Accordion Content */}
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-4 pt-0 pb-5 border-t border-gray-50 mt-2">
                    {section.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">Last updated: May 31, 2026</p>
        </div>

      </div>
    </div>
  );
}
