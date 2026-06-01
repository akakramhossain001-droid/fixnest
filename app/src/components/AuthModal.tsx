import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Lock, User, ArrowRight, Gift, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export type AuthMode = 'login' | 'signup' | 'forgot';

interface AuthModalProps {
  initialMode?: AuthMode;
  onClose?: () => void;
  isMandatory?: boolean;
}

export default function AuthModal({ initialMode = 'login', onClose, isMandatory = false }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isClosing, setIsClosing] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Kept just in case, but unused
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showReferral, setShowReferral] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Update mode if initialMode changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleClose = () => {
    if (isMandatory || !onClose) return;
    setIsClosing(true);
    setTimeout(onClose, 300); // Wait for animation
  };

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'otp') {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email, 
            code: otpCode,
            name: name
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Verification failed');
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setIsSuccess(true);
        setTimeout(() => {
          if (onClose) onClose();
          window.location.reload();
        }, 1500);
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
        
        setMode('otp');
        setResendTimer(30);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setError('');
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP');
      
      setResendTimer(30);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setError('');
      setIsLoading(true);
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setIsSuccess(true);
      setTimeout(() => {
        if (isMandatory) {
          window.location.reload();
        } else {
          handleClose();
          window.location.reload();
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
      <div 
        className={`absolute inset-0 ${isMandatory ? 'bg-teal' : 'bg-black/60'} transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={isMandatory ? undefined : handleClose}
      />

      <div 
        className={`relative w-full sm:w-[400px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] transition-transform duration-300 ${isClosing ? 'translate-y-full sm:scale-95' : 'translate-y-0 sm:scale-100'}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          {!isMandatory && (
            <button 
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors ml-auto"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto no-scrollbar">
          {isSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center animate-fade-in-up">
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-heading font-bold text-text-primary mb-1">Welcome!</h2>
              <p className="text-sm text-text-secondary">Successfully logged in.</p>
            </div>
          ) : (
            <>
              {mode === 'otp' ? (
                <div className="mb-3">
                  <h2 className="text-2xl font-heading font-bold text-text-primary mb-1">Enter Code</h2>
                  <p className="text-xs text-text-secondary">
                    We've sent a 6-digit verification code to <br/>
                    <span className="font-medium text-text-primary">{email}</span>
                  </p>
                </div>
              ) : (
                <div className="mb-3">
                  <h2 className="text-2xl font-heading font-bold text-text-primary mb-1">
                    Login / Sign Up
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Enter your email to receive a login code and continue.
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 animate-fade-in">
                  {error}
                </div>
              )}

              {mode !== 'otp' && (
                <div className="relative mb-3">
                  <div className="relative z-10 pointer-events-none">
                    <button className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-5 h-5">
                        <svg viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.66 9.5 24 9.5z"/>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                          <path fill="none" d="M0 0h48v48H0z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-text-primary">Google</span>
                    </button>
                  </div>
                  
                  <div className="absolute inset-0 opacity-0 overflow-hidden" style={{ top: '-10px' }}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError('Google Login Failed')}
                      useOneTap={false}
                      width="100%"
                    />
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'otp' ? (
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1 text-center">Verification Code</label>
                    <input 
                      type="text" 
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all"
                      placeholder="------"
                      maxLength={6}
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-text-primary mb-1">Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={16} className="text-gray-400" />
                        </div>
                        <input 
                          type="email" 
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      {!showReferral ? (
                        <button 
                          type="button" 
                          onClick={() => setShowReferral(true)}
                          className="text-xs font-medium text-teal hover:text-teal-dark flex items-center gap-1 mt-1"
                        >
                          <Gift size={14} />
                          Have a referral code?
                        </button>
                      ) : (
                        <div className="animate-fade-in-up mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-medium text-text-primary">Referral Code</label>
                            <button 
                              type="button" 
                              onClick={() => {
                                setShowReferral(false);
                                setReferralCode('');
                              }}
                              className="text-[10px] text-gray-400 hover:text-red-500"
                            >
                              Cancel
                            </button>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Gift size={16} className="text-gray-400" />
                            </div>
                            <input 
                              type="text" 
                              name="referralCode"
                              value={referralCode}
                              onChange={(e) => setReferralCode(e.target.value)}
                              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all uppercase"
                              placeholder="ENTER CODE"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold mt-2 transition-all ${isLoading ? 'bg-teal/70 cursor-not-allowed' : 'bg-teal hover:bg-teal-dark active:scale-[0.98]'} text-white text-sm`}
                >
                  {isLoading ? 'Please wait...' : mode === 'otp' ? 'Verify' : 'Continue'}
                  {!isLoading && <ArrowRight size={16} />}
                </button>
              </form>

              <div className="mt-4 text-center">
                {mode === 'otp' && (
                  <p className="text-xs text-text-secondary">
                    Didn't receive the code? 
                    <button 
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0}
                      className={`ml-1 font-semibold ${resendTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-teal hover:underline'}`}
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (isMandatory) {
    return modalContent;
  }

  const portalRoot = document.querySelector('.mobile-frame');
  return portalRoot ? createPortal(modalContent, portalRoot) : modalContent;
}
