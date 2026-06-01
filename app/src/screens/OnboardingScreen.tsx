import { useState } from 'react';
import { Phone, MapPin, ArrowRight } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const userStr = localStorage.getItem('user');
  const initialName = userStr ? JSON.parse(userStr).name : '';
  
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone })
      });
      localStorage.setItem('onboardingCompleted', 'true');
      
      // Update local storage user object
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          userObj.name = name;
          userObj.phone = phone;
          localStorage.setItem('user', JSON.stringify(userObj));
        } catch (e) {}
      }
      
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-teal-light/20 rounded-full flex items-center justify-center mb-6">
          <MapPin size={32} className="text-teal" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">Welcome!</h2>
        <p className="text-text-secondary mb-8 max-w-xs">
          Please provide your details to continue using FixNest.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div className="text-left">
            <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
            <div className="relative">
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="text-left">
            <label className="block text-sm font-medium text-text-primary mb-1.5">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || !phone || !name}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold mt-4 transition-all ${
              loading || !phone || !name ? 'bg-teal/70 cursor-not-allowed' : 'bg-teal hover:bg-teal-dark'
            } text-white`}
          >
            {loading ? 'Saving...' : 'Continue'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
