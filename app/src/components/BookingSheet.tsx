import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, Home, Building, Check, Star, Wallet, CreditCard } from 'lucide-react';
import type { Provider, Booking } from '@/types';
import { timeSlots } from '@/data/providers';

interface BookingSheetProps {
  provider: Provider;
  onClose: () => void;
  onConfirm: (booking: Omit<Booking, 'id' | 'status'>) => void;
}

type Step = 'service' | 'datetime' | 'address' | 'confirm';

export default function BookingSheet({ provider, onClose, onConfirm }: BookingSheetProps) {
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState(provider.tags[0]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState('');
  const [savedAddress] = useState('42, 4th Cross, Koramangala 5th Block, Bangalore');
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wallet'>('cash');
  const [walletBalance, setWalletBalance] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);

    const fetchWallet = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/wallet`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setWalletBalance(data.balance);
        }
      } catch (err) {}
    };
    fetchWallet();
  }, []);

  const steps: { id: Step; label: string }[] = [
    { id: 'service', label: 'Service' },
    { id: 'datetime', label: 'Date & Time' },
    { id: 'address', label: 'Address' },
    { id: 'confirm', label: 'Confirm' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  const goNext = () => {
    if (step === 'service') setStep('datetime');
    else if (step === 'datetime') setStep('address');
    else if (step === 'address') setStep('confirm');
  };

  const goBack = () => {
    if (step === 'datetime') setStep('service');
    else if (step === 'address') setStep('datetime');
    else if (step === 'confirm') setStep('address');
  };

  const servicePrice = selectedService?.match(/₹(\d+)/) 
    ? parseInt(selectedService.match(/₹(\d+)/)![1]) 
    : provider.price;

  const handleConfirm = async () => {
    const finalAddress = useSavedAddress ? savedAddress : address;
    const totalAmount = servicePrice + 49;
    const token = localStorage.getItem('token');

    if (paymentMethod === 'wallet') {
      if (walletBalance < totalAmount) {
        alert("Insufficient wallet balance");
        return;
      }
      try {
        const deductRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/wallet/deduct`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ amount: totalAmount, serviceTitle: selectedService })
        });
        if (!deductRes.ok) return alert("Payment failed");
      } catch (err) {
        return alert("Payment error");
      }
    }

    onConfirm({
      providerId: provider.id,
      providerName: provider.name,
      providerAvatar: provider.avatar,
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      address: finalAddress,
      price: totalAmount,
    });
  };

  const canProceed = () => {
    if (step === 'service') return !!selectedService;
    if (step === 'datetime') return !!selectedDate && !!selectedTime;
    if (step === 'address') return useSavedAddress ? !!savedAddress : !!address;
    return true;
  };

  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      value: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }),
    };
  });

  const sheetContent = (
    <div className="absolute inset-0 z-[100] flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/35 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="mt-auto bg-white rounded-t-[20px] max-h-[85vh] flex flex-col animate-slide-up relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          {step !== 'service' ? (
            <button onClick={goBack} className="p-1 -ml-1">
              <ChevronLeft size={22} className="text-text-primary" />
            </button>
          ) : (
            <div className="w-8" />
          )}
          <h2 className="font-heading font-semibold text-lg text-text-primary">
            {steps[currentStepIndex].label}
          </h2>
          <button onClick={onClose} className="p-1 -mr-1">
            <X size={22} className="text-text-secondary" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 py-3">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= currentStepIndex ? 'w-6 bg-teal' : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
          {/* Step 1: Select Service */}
          {step === 'service' && (
            <div className="animate-fade-in-up">
              <p className="text-text-secondary text-sm mb-4">Select a service from {provider.name}</p>
              <div className="space-y-2">
                {provider.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedService(tag)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedService === tag
                        ? 'border-teal bg-teal-light'
                        : 'border-gray-100 bg-white'
                    }`}
                  >
                    <span className={`font-medium ${selectedService === tag ? 'text-teal' : 'text-text-primary'}`}>
                      {tag}
                    </span>
                    {selectedService === tag && (
                      <div className="w-6 h-6 rounded-full bg-teal flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 'datetime' && (
            <div className="animate-fade-in-up">
              {/* Date selection */}
              <p className="text-text-secondary text-sm mb-3">Select a date</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
                {dateOptions.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setSelectedDate(d.value)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border-2 transition-all duration-200 ${
                      selectedDate === d.value
                        ? 'border-teal bg-teal text-white'
                        : 'border-gray-100 bg-white text-text-primary'
                    }`}
                  >
                    <span className={`text-xs ${selectedDate === d.value ? 'text-white/80' : 'text-text-secondary'}`}>
                      {d.label.split(',')[0]}
                    </span>
                    <span className="text-lg font-semibold mt-0.5">
                      {d.label.split(' ')[1]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Time selection */}
              <p className="text-text-secondary text-sm mb-3 mt-2">Select a time slot</p>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                      selectedTime === time
                        ? 'border-teal bg-teal-light text-teal'
                        : 'border-gray-100 bg-white text-text-primary'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Address */}
          {step === 'address' && (
            <div className="animate-fade-in-up">
              <p className="text-text-secondary text-sm mb-4">Where should the service be provided?</p>

              {/* Saved address */}
              <button
                onClick={() => setUseSavedAddress(true)}
                className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 mb-3 ${
                  useSavedAddress ? 'border-teal bg-teal-light' : 'border-gray-100 bg-white'
                }`}
              >
                <Home size={20} className={`mt-0.5 flex-shrink-0 ${useSavedAddress ? 'text-teal' : 'text-text-secondary'}`} />
                <div className="text-left">
                  <p className={`font-medium text-sm ${useSavedAddress ? 'text-teal' : 'text-text-primary'}`}>
                    Home
                  </p>
                  <p className="text-text-secondary text-xs mt-0.5">{savedAddress}</p>
                </div>
              </button>

              {/* New address */}
              <button
                onClick={() => setUseSavedAddress(false)}
                className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 mb-4 ${
                  !useSavedAddress ? 'border-teal bg-teal-light' : 'border-gray-100 bg-white'
                }`}
              >
                <Building size={20} className={`mt-0.5 flex-shrink-0 ${!useSavedAddress ? 'text-teal' : 'text-text-secondary'}`} />
                <div className="text-left">
                  <p className={`font-medium text-sm ${!useSavedAddress ? 'text-teal' : 'text-text-primary'}`}>
                    Another address
                  </p>
                </div>
              </button>

              {!useSavedAddress && (
                <div className="animate-fade-in-up">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full address..."
                    className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none text-sm resize-none h-24"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && (
            <div className="animate-fade-in-up">
              {/* Provider summary */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden teal-wash flex-shrink-0">
                  <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-sm">{provider.name}</p>
                  <div className="flex items-center gap-1 text-xs text-text-secondary">
                    <Star size={12} className="text-orange fill-orange" />
                    <span>{provider.rating} ({provider.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Booking details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-text-secondary text-sm">Service</span>
                  <span className="text-text-primary font-medium text-sm">{selectedService}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-text-secondary text-sm">Date</span>
                  <span className="text-text-primary font-medium text-sm">
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-text-secondary text-sm">Time</span>
                  <span className="text-text-primary font-medium text-sm">{selectedTime}</span>
                </div>
                <div className="flex items-start justify-between py-2 border-b border-gray-100">
                  <span className="text-text-secondary text-sm">Address</span>
                  <span className="text-text-primary font-medium text-sm text-right max-w-[60%]">
                    {useSavedAddress ? savedAddress : address}
                  </span>
                </div>
              </div>

              {/* Price summary */}
              <div className="bg-orange/5 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary text-sm">Service fee</span>
                  <span className="text-text-primary font-medium">₹{servicePrice}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary text-sm">Platform fee</span>
                  <span className="text-text-primary font-medium">₹49</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-orange/20">
                  <span className="font-semibold text-text-primary">Total</span>
                  <span className="font-heading font-bold text-orange text-lg">₹{servicePrice + 49}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <p className="text-text-secondary text-sm mb-3">Payment Method</p>
                <div className="space-y-3">
                  {/* Cash */}
                  <label className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'cash' ? 'border-teal bg-teal-light' : 'border-gray-100 bg-white'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        paymentMethod === 'cash' ? 'bg-teal/20 text-teal' : 'bg-gray-100 text-text-secondary'
                      }`}>
                        <span className="font-bold">₹</span>
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${paymentMethod === 'cash' ? 'text-teal' : 'text-text-primary'}`}>Cash after service</p>
                        <p className="text-xs text-text-secondary mt-0.5">Pay provider directly</p>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="cash" 
                      checked={paymentMethod === 'cash'} 
                      onChange={() => setPaymentMethod('cash')}
                      className="w-5 h-5 accent-teal"
                    />
                  </label>

                  {/* Wallet */}
                  <label className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'wallet' ? 'border-teal bg-teal-light' : 'border-gray-100 bg-white'
                  } ${walletBalance < (provider.price + 49) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        paymentMethod === 'wallet' ? 'bg-teal/20 text-teal' : 'bg-gray-100 text-text-secondary'
                      }`}>
                        <Wallet size={20} />
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${paymentMethod === 'wallet' ? 'text-teal' : 'text-text-primary'}`}>FixNest Wallet</p>
                        <p className="text-xs text-text-secondary mt-0.5">Available: ₹{walletBalance}</p>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="wallet" 
                      disabled={walletBalance < (provider.price + 49)}
                      checked={paymentMethod === 'wallet'} 
                      onChange={() => setPaymentMethod('wallet')}
                      className="w-5 h-5 accent-teal disabled:opacity-50"
                    />
                  </label>
                  {walletBalance < (provider.price + 49) && (
                    <p className="text-xs text-red-500 mt-1">Insufficient wallet balance. Please add money in your wallet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="shrink-0 p-5 border-t border-gray-100 bg-white">
          <button
            onClick={step === 'confirm' ? handleConfirm : goNext}
            disabled={!canProceed()}
            className={`w-full py-3.5 rounded-xl font-semibold text-white text-base transition-all duration-200 active:scale-[0.98] ${
              canProceed()
                ? step === 'confirm'
                  ? 'bg-orange shadow-sm'
                  : 'bg-teal shadow-sm'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {step === 'confirm' ? 'Confirm Booking' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );

  const portalRoot = document.querySelector('.mobile-frame');
  return portalRoot ? createPortal(sheetContent, portalRoot) : sheetContent;
}
