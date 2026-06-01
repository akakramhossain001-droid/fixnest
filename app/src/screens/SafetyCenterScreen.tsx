import { ArrowLeft, PhoneCall, ShieldCheck, CheckCircle2, AlertTriangle, Users, FileWarning } from 'lucide-react';

interface SafetyCenterScreenProps {
  onBack: () => void;
}

export default function SafetyCenterScreen({ onBack }: SafetyCenterScreenProps) {
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
        <h1 className="font-heading font-bold text-lg text-text-primary ml-2">Safety Center</h1>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5">
        
        {/* Intro */}
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          Your safety is our top priority. We have implemented strict measures to ensure a secure and trusted experience.
        </p>

        {/* SOS Emergency Button */}
        <div className="bg-red-50 rounded-2xl p-5 mb-6 border border-red-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3">
            <PhoneCall size={32} />
          </div>
          <h2 className="font-heading font-bold text-lg text-red-700 mb-1">Emergency Help</h2>
          <p className="text-xs text-red-600/80 mb-4 px-4">
            If you feel unsafe during a service, tap the button below to instantly contact the authorities.
          </p>
          <button className="w-full bg-red-500 hover:bg-red-600 active:scale-95 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20">
            <AlertTriangle size={18} />
            SOS - Call 999
          </button>
        </div>

        {/* Verification Guarantee */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-heading font-bold text-base text-text-primary">100% Verified Professionals</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-teal mt-0.5 shrink-0" />
              <p className="text-sm text-text-secondary">Government ID (NID/Aadhar) verified</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-teal mt-0.5 shrink-0" />
              <p className="text-sm text-text-secondary">Comprehensive background checks</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-teal mt-0.5 shrink-0" />
              <p className="text-sm text-text-secondary">Skill and behavioral training certified</p>
            </div>
          </div>
        </div>

        {/* Trusted Contacts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              <Users size={22} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-text-primary">Trusted Contacts</h3>
              <p className="text-xs text-text-secondary">Share live service status</p>
            </div>
          </div>
          <button className="w-full bg-blue-50 text-blue-600 font-semibold py-3 rounded-xl hover:bg-blue-100 transition-colors text-sm">
            + Add Trusted Contact
          </button>
        </div>

        {/* Report an Issue */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <FileWarning size={20} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-text-primary text-sm">Report a Safety Issue</h3>
                <p className="text-xs text-text-secondary">Contact our 24/7 trust & safety team</p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-gray-400 mb-8">
          FixNest Trust & Safety Team
        </p>

      </div>
    </div>
  );
}
