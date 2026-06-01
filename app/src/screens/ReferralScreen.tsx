import { ArrowLeft, Gift, Copy, Share2, Users, IndianRupee } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ReferralScreenProps {
  onBack: () => void;
}

export default function ReferralScreen({ onBack }: ReferralScreenProps) {
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState('LOADING...');
  const [inputCode, setInputCode] = useState('');
  const [referredBy, setReferredBy] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setReferralCode(data.referralCode);
          setReferredBy(data.referredBy);
        }
      } catch (err) {
        console.error('Failed to fetch user', err);
      }
    };
    fetchUser();
  }, []);

  const handleApplyReferral = async () => {
    if (!inputCode.trim()) return alert('Enter a referral code');
    setApplying(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/apply-referral`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ code: inputCode.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setReferredBy('applied');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error applying code');
    } finally {
      setApplying(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join FixNest!',
        text: `Use my code ${referralCode} to get ₹50 off your first home service booking on FixNest!`,
        url: 'https://fixnest.app',
      }).catch(console.error);
    } else {
      handleCopy();
    }
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
        <h1 className="font-heading font-bold text-lg text-text-primary ml-2">Refer & Earn</h1>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Hero Section */}
        <div className="bg-teal px-6 py-10 flex flex-col items-center text-center text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-xl" />
          
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md border border-white/30">
            <Gift size={40} className="text-white drop-shadow-md" />
          </div>
          <h2 className="font-heading font-bold text-3xl mb-2 drop-shadow-sm">Give ₹50, Get ₹50</h2>
          <p className="text-teal-light max-w-[250px] leading-relaxed">
            Invite your friends to FixNest and you both get ₹50 credit for your next booking!
          </p>
        </div>

        {/* Code Section */}
        <div className="px-5 -mt-6 relative z-10">
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 flex flex-col items-center">
            <p className="text-sm text-text-secondary font-medium mb-3">Your unique referral code</p>
            
            <div className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-2 pl-6 mb-4">
              <span className="font-heading font-bold text-xl tracking-wider text-text-primary">
                {referralCode}
              </span>
              <button 
                onClick={handleCopy}
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm hover:border-teal transition-colors active:scale-95"
              >
                {copied ? <span className="text-xs font-bold text-teal">Copied</span> : <Copy size={18} className="text-text-secondary" />}
              </button>
            </div>

            <button 
              onClick={handleShare}
              className="w-full bg-teal text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-teal-dark active:scale-[0.98] transition-all shadow-md shadow-teal/20"
            >
              <Share2 size={18} />
              Share Link
            </button>
          </div>
        </div>

        {/* Apply Referral Code */}
        {!referredBy && (
          <div className="px-5 mt-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-heading font-semibold text-text-primary mb-2">Have a referral code?</h3>
              <p className="text-sm text-text-secondary mb-4">Enter it below to claim your ₹50 bonus!</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:outline-none focus:border-teal text-text-primary uppercase"
                />
                <button 
                  onClick={handleApplyReferral}
                  disabled={applying || !inputCode.trim()}
                  className="bg-orange text-white px-5 py-3 rounded-xl font-medium active:scale-95 transition-all disabled:opacity-50"
                >
                  {applying ? '...' : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="px-5 mt-8">
          <h3 className="font-heading font-bold text-lg text-text-primary mb-6">How it works</h3>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-light flex items-center justify-center flex-shrink-0">
                <Share2 size={20} className="text-teal" />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary mb-1">1. Share your code</h4>
                <p className="text-sm text-text-secondary leading-relaxed">Share your unique code with friends who haven't used FixNest yet.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center flex-shrink-0">
                <Users size={20} className="text-orange" />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary mb-1">2. Friend signs up</h4>
                <p className="text-sm text-text-secondary leading-relaxed">Your friend downloads the app and signs up using your code.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <IndianRupee size={20} className="text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary mb-1">3. Both get rewards</h4>
                <p className="text-sm text-text-secondary leading-relaxed">You both receive ₹50 in your FixNest wallet instantly!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
