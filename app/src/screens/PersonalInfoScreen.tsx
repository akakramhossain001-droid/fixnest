import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Calendar, Users, CheckCircle2 } from 'lucide-react';

interface PersonalInfoScreenProps {
  onBack: () => void;
}

export default function PersonalInfoScreen({ onBack }: PersonalInfoScreenProps) {
  const [name, setName] = useState('Guest User');
  const [email, setEmail] = useState('guest@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj.name) setName(userObj.name);
        if (userObj.email) setEmail(userObj.email);
        if (userObj.phone) setPhone(userObj.phone);
      } catch (e) {}
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
        <h1 className="font-heading font-bold text-lg text-text-primary ml-2">Personal Info</h1>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <form onSubmit={handleSave} className="p-5 space-y-6">
          
          {/* Form Fields Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  readOnly
                  className="w-full pl-10 pr-10 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none"
                  placeholder="e.g. you@example.com"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <CheckCircle2 size={16} className="text-green-500" />
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all"
                  placeholder="e.g. +91 9876543210"
                  required
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <input 
                  type="date" 
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Gender
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users size={18} className="text-gray-400" />
                </div>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all appearance-none"
                >
                  <option value="" disabled>Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                {/* Custom select arrow since appearance is none */}
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

          </div>

          {/* Success Message */}
          {isSaved && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg justify-center text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 size={18} />
              <span>Personal info updated successfully!</span>
            </div>
          )}

          {/* Save Button */}
          <button 
            type="submit"
            className="w-full bg-teal text-white py-3.5 rounded-xl font-semibold hover:bg-teal-dark active:scale-[0.98] transition-all shadow-md shadow-teal/20"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
