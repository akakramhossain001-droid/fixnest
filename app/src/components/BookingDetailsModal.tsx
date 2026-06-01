import { useState } from 'react';
import { X, CalendarDays, Clock, MapPin, Phone, MessageSquare } from 'lucide-react';
import type { Booking } from '@/types';

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
  onStatusUpdate?: () => void;
}

export default function BookingDetailsModal({ booking, onClose, onStatusUpdate }: BookingDetailsModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(booking.date);
  const [newTime, setNewTime] = useState(booking.time);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingMoney, setIsAddingMoney] = useState(false);
  const [extraAmount, setExtraAmount] = useState('');

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
    '4:00 PM', '5:00 PM', '6:00 PM',
  ];

  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      value: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }),
    };
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Wait for animation
  };

  const bookingId = `FXN-${booking.id.toUpperCase().substring(0, 6)}`;
  const platformFee = 49;
  const total = booking.price + platformFee;

  return (
    <div className="absolute inset-0 z-[60] flex flex-col">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div 
        className={`mt-auto bg-gray-50 rounded-t-3xl shadow-xl transition-transform duration-300 transform ${isClosing ? 'translate-y-full' : 'translate-y-0'} max-h-full flex flex-col relative`}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-white rounded-t-3xl border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-heading font-bold text-lg text-text-primary">
              Booking Details
            </h2>
            <p className="text-text-secondary text-xs mt-0.5">ID: {bookingId}</p>
          </div>
          <button 
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-text-secondary hover:bg-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-5 space-y-4">
            {/* Status Banner */}
            <div className="bg-teal-light border border-teal/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-teal font-semibold text-sm">Booking Confirmed</p>
                <p className="text-teal/80 text-xs mt-0.5">Provider will arrive on time</p>
              </div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <CalendarDays size={18} className="text-teal" />
              </div>
            </div>

            {/* Provider Info */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Service Provider</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden teal-wash flex-shrink-0">
                    <img src={booking.providerAvatar} alt={booking.providerName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary text-sm truncate">{booking.providerName}</p>
                    <p className="text-text-secondary text-xs">{booking.service}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => alert(`Opening chat with ${booking.providerName}... (Demo)`)}
                      className="w-9 h-9 rounded-full bg-teal-light flex items-center justify-center text-teal"
                    >
                      <MessageSquare size={16} />
                    </button>
                    <button 
                      onClick={() => window.open(`tel:+919876543210`)}
                      className="w-9 h-9 rounded-full bg-teal flex items-center justify-center text-white"
                    >
                      <Phone size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Date & Location */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Schedule & Address</h3>
                
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-text-muted mt-0.5" />
                  <div>
                    <p className="font-medium text-text-primary text-sm">
                      {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-text-secondary text-xs mt-0.5">{booking.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-4 border-t border-gray-50">
                  <MapPin size={18} className="text-text-muted mt-0.5" />
                  <div>
                    <p className="font-medium text-text-primary text-sm">Service Location</p>
                    <p className="text-text-secondary text-xs mt-0.5 leading-relaxed">{booking.address}</p>
                  </div>
                </div>
              </div>

              {/* Bill Summary */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Bill Details</h3>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Service fee</span>
                    <span className="text-text-primary font-medium">₹{booking.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Platform fee</span>
                    <span className="text-text-primary font-medium">₹{platformFee}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="font-semibold text-text-primary">Total Amount</span>
                  <span className="font-heading font-bold text-teal text-lg">₹{total}</span>
                </div>
              </div>

              {/* Support & Actions */}
              {isAddingMoney ? (
                <div className="bg-white rounded-xl p-4 border border-teal-light shadow-sm space-y-4 mb-2 animate-fade-in-up">
                  <h3 className="font-semibold text-text-primary mb-2">Add Extra Charge</h3>
                  
                  <div>
                    <label className="text-xs text-text-secondary block mb-1">Extra Amount (₹)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 100"
                      value={extraAmount} 
                      onChange={(e) => setExtraAmount(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button 
                      onClick={() => setIsAddingMoney(false)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-200 text-text-secondary hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={async () => {
                        const amount = parseInt(extraAmount);
                        if (isNaN(amount) || amount <= 0) return alert('Please enter a valid amount');
                        
                        try {
                          setIsUpdating(true);
                          const token = localStorage.getItem('token');
                          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings/${booking.id}`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ price: booking.price + amount })
                          });
                          alert(`Successfully added ₹${amount} extra charge!`);
                          if (onStatusUpdate) onStatusUpdate();
                          setIsAddingMoney(false);
                          setExtraAmount('');
                        } catch (err) {
                          alert('Failed to add extra charge');
                        } finally {
                          setIsUpdating(false);
                        }
                      }}
                      disabled={isUpdating}
                      className="flex-1 py-2 rounded-lg text-sm font-medium bg-teal text-white hover:bg-teal-dark disabled:opacity-70"
                    >
                      {isUpdating ? 'Wait...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              ) : isRescheduling ? (
                <div className="bg-white rounded-xl p-4 border border-teal-light shadow-sm space-y-4 mb-2 animate-fade-in-up">
                  <h3 className="font-semibold text-text-primary mb-2">Select New Date & Time</h3>
                  
                  <div>
                    <label className="text-xs text-text-secondary block mb-1">Date</label>
                    <select 
                      value={newDate} 
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal"
                    >
                      {dateOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-text-secondary block mb-1">Time</label>
                    <select 
                      value={newTime} 
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal"
                    >
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button 
                      onClick={() => setIsRescheduling(false)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-200 text-text-secondary hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          setIsUpdating(true);
                          const token = localStorage.getItem('token');
                          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings/${booking.id}`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ date: newDate, time: newTime })
                          });
                          alert('Booking rescheduled successfully!');
                          if (onStatusUpdate) onStatusUpdate();
                          handleClose();
                        } catch (err) {
                          alert('Failed to reschedule');
                        } finally {
                          setIsUpdating(false);
                        }
                      }}
                      disabled={isUpdating}
                      className="flex-1 py-2 rounded-lg text-sm font-medium bg-teal text-white hover:bg-teal-dark disabled:opacity-70"
                    >
                      {isUpdating ? 'Wait...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 pb-2 flex-wrap">
                  {booking.status === 'upcoming' && (
                    <button 
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings/${booking.id}/status`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ status: 'completed' })
                          });
                          alert('Booking marked as completed!');
                          if (onStatusUpdate) onStatusUpdate();
                          handleClose();
                        } catch (err) {
                          alert('Failed to update booking');
                        }
                      }}
                      className="w-full bg-teal text-white py-3 rounded-xl font-medium text-sm hover:bg-teal-dark transition-colors mb-2"
                    >
                      Mark as Completed (Demo)
                    </button>
                  )}
                  
                  {booking.status === 'upcoming' && (
                    <>
                      <button 
                        onClick={() => setIsRescheduling(true)}
                        className="flex-1 bg-white border border-gray-200 text-text-primary py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                      >
                        Reschedule
                      </button>
                      <button 
                        onClick={() => setIsAddingMoney(true)}
                        className="flex-1 bg-white border border-gray-200 text-teal py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors whitespace-nowrap px-2"
                      >
                        Add Money
                      </button>
                      <button 
                        onClick={async () => {
                          if (!window.confirm('Are you sure you want to cancel this booking?')) return;
                          try {
                            const token = localStorage.getItem('token');
                            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings/${booking.id}/status`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ status: 'cancelled' })
                            });
                            alert('Booking cancelled successfully!');
                            if (onStatusUpdate) onStatusUpdate();
                            handleClose();
                          } catch (err) {
                            alert('Failed to cancel booking');
                          }
                        }}
                        className="flex-1 bg-white border border-gray-200 text-red-500 py-3 rounded-xl font-medium text-sm hover:bg-red-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
