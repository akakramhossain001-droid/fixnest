import { useState, useEffect } from 'react';
import { CalendarDays, Clock, MapPin, Star, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import type { Booking, BookingStatus } from '@/types';
import BookingDetailsModal from '@/components/BookingDetailsModal';
import ReviewModal from '@/components/ReviewModal';

interface BookingsScreenProps {
  // no props needed
}

const statusConfig: Record<BookingStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  upcoming: { label: 'Upcoming', color: 'text-teal', bg: 'bg-teal-light', icon: Clock },
  completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-50', icon: XCircle },
};

type FilterTab = 'all' | BookingStatus;

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function BookingsScreen({}: BookingsScreenProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const selectedBooking = bookings.find(b => b.id === selectedBookingId) || null;
  const reviewingBooking = bookings.find(b => b.id === reviewingBookingId) || null;
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return; // Not logged in
      }
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = activeFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === activeFilter);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto no-scrollbar bg-surface">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="px-4 py-4">
            <h1 className="font-heading font-bold text-xl text-text-primary">My Bookings</h1>
            <p className="text-text-secondary text-sm mt-0.5">Manage your service appointments</p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeFilter === tab.id
                    ? 'bg-teal text-white'
                    : 'bg-gray-100 text-text-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div className="px-4 py-4 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-text-secondary font-medium">Loading bookings...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarDays size={48} className="text-gray-300 mb-4" />
              <p className="text-text-secondary font-medium">No bookings yet</p>
              <p className="text-text-muted text-sm mt-1">Book your first service today</p>
            </div>
          ) : (
            filtered.map((booking) => {
              const status = statusConfig[booking.status];
            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-card"
              >
                {/* Top row */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden teal-wash flex-shrink-0">
                    <img
                      src={booking.providerAvatar}
                      alt={booking.providerName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-text-primary text-sm truncate">
                        {booking.providerName}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-text-secondary text-xs mt-0.5">{booking.service}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center gap-4 mt-3 text-xs text-text-secondary">
                  <div className="flex items-center gap-1">
                    <CalendarDays size={13} />
                    <span>{new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={13} />
                    <span>{booking.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={13} />
                    <span className="truncate max-w-[120px]">{booking.address}</span>
                  </div>
                </div>

                {/* Price + Action */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="font-heading font-semibold text-text-primary">
                    ₹{booking.price}
                  </span>
                  {booking.status === 'upcoming' && (
                    <button 
                      onClick={() => setSelectedBookingId(booking.id)}
                      className="text-teal text-sm font-medium flex items-center gap-1"
                    >
                      Details
                      <ChevronRight size={14} />
                    </button>
                  )}
                  {booking.status === 'completed' && (
                    <button 
                      onClick={() => setReviewingBookingId(booking.id)}
                      className="text-orange text-sm font-medium flex items-center gap-1"
                    >
                      <Star size={14} />
                      Rate
                    </button>
                  )}
                </div>
              </div>
            );
          })
          )}

        </div>
      </div>

      {selectedBooking && (
        <BookingDetailsModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBookingId(null)} 
          onStatusUpdate={() => {
            fetchBookings(); // Refresh bookings
          }}
        />
      )}

      {reviewingBooking && (
        <ReviewModal 
          booking={reviewingBooking} 
          onClose={() => setReviewingBookingId(null)} 
          onReviewSubmitted={() => {
            alert("Review submitted successfully!");
            fetchBookings();
          }}
        />
      )}
    </div>
  );
}
