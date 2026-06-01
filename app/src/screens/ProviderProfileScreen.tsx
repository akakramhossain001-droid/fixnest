import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Star, MapPin, Shield, CheckCircle, Clock, Award, MessageCircle } from 'lucide-react';
import { providers } from '@/data/providers';
import BookingSheet from '@/components/BookingSheet';
import gsap from 'gsap';

interface ProviderProfileScreenProps {
  providerId: string;
  onBack: () => void;
}

export default function ProviderProfileScreen({ providerId, onBack }: ProviderProfileScreenProps) {
  const provider = providers.find((p) => p.id === providerId);
  const [showBooking, setShowBooking] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, []);

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-text-secondary">Provider not found</p>
        <button onClick={onBack} className="mt-4 text-teal font-medium">Go Back</button>
      </div>
    );
  }

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews/${providerId}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      }
    };
    fetchReviews();
  }, [providerId]);
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto no-scrollbar bg-surface" ref={contentRef}>
        {/* Hero Section */}
        <div className="relative bg-white">
          {/* Back button */}
          <button
            onClick={onBack}
            className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>

          {/* Hero Image / Avatar */}
          <div className="h-48 bg-teal-light flex items-end justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 w-16 h-16 rounded-full bg-teal" />
              <div className="absolute top-12 right-12 w-24 h-24 rounded-full bg-orange" />
              <div className="absolute bottom-8 left-16 w-12 h-12 rounded-full bg-teal-dark" />
            </div>
            <div className="relative -bottom-10">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-card teal-wash">
                <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Name + Info */}
          <div className="pt-12 pb-5 px-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <h1 className="font-heading font-bold text-xl text-text-primary">{provider.name}</h1>
              {provider.isVerified && (
                <Shield size={18} className="text-teal" fill="#1D9E75" />
              )}
            </div>

            <div className="flex items-center justify-center gap-1 mt-1 text-text-secondary text-sm">
              <MapPin size={14} />
              <span>{provider.location}</span>
            </div>

            <div className="flex items-center justify-center gap-1 mt-2">
              <Star size={16} className="text-orange fill-orange" />
              <span className="font-semibold text-text-primary">{provider.rating}</span>
              <span className="text-text-secondary text-sm">({provider.reviewCount} reviews)</span>
            </div>

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-teal">
                  <CheckCircle size={14} />
                  <span className="font-semibold text-sm">{provider.jobsCompleted}</span>
                </div>
                <span className="text-text-muted text-xs mt-0.5">Jobs Done</span>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-teal">
                  <Clock size={14} />
                  <span className="font-semibold text-sm">{provider.yearsExperience} yrs</span>
                </div>
                <span className="text-text-muted text-xs mt-0.5">Experience</span>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-orange">
                  <Award size={14} />
                  <span className="font-semibold text-sm">Top 5%</span>
                </div>
                <span className="text-text-muted text-xs mt-0.5">Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white mt-3 px-5 py-5">
          <h2 className="font-heading font-semibold text-text-primary mb-2">About</h2>
          <p className="text-text-secondary text-sm leading-relaxed">{provider.bio}</p>
        </div>

        {/* Services */}
        <div className="bg-white mt-3 px-5 py-5">
          <h2 className="font-heading font-semibold text-text-primary mb-3">Services Offered</h2>
          <div className="flex flex-wrap gap-2">
            {provider.tags.map((tag) => (
              <span
                key={tag}
                className="bg-teal-light text-teal text-sm font-medium px-4 py-2 rounded-xl"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white mt-3 px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-text-primary">Reviews</h2>
            {reviews.length > 3 && <button className="text-teal text-sm font-medium">See all</button>}
          </div>
          {reviews.length === 0 ? (
            <p className="text-text-secondary text-sm">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xs font-semibold text-text-secondary">
                          {review.user?.name ? review.user.name.charAt(0) : 'U'}
                        </span>
                      </div>
                      <span className="font-medium text-sm text-text-primary">{review.user?.name || 'User'}</span>
                    </div>
                    <span className="text-text-muted text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < review.rating ? 'text-orange fill-orange' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <p className="text-text-secondary text-sm mt-2 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom spacing */}
        <div className="h-24" />
      </div>

      {/* Fixed Book Button */}
      <div className="shrink-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-text-muted text-sm">Starting from</span>
            <div>
              <span className="font-heading font-bold text-orange text-xl">₹{provider.price}</span>
              <span className="text-text-muted text-sm">/hr</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center">
              <MessageCircle size={20} className="text-text-secondary" />
            </button>
            <button
              onClick={() => setShowBooking(true)}
              className="bg-orange text-white font-semibold px-6 py-3 rounded-xl active:scale-95 transition-transform shadow-sm"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Booking Sheet */}
      {showBooking && (
        <BookingSheet
          provider={provider}
          onClose={() => setShowBooking(false)}
          onConfirm={async (bookingData) => {
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                alert('Please login to book a service!');
                return;
              }

              const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookingData)
              });

              if (res.ok) {
                setShowBooking(false);
                window.dispatchEvent(new Event('bookingUpdated'));
                alert('Booking successful!');
              } else {
                const errorData = await res.json();
                alert(errorData.error || 'Failed to book service');
              }
            } catch (err) {
              console.error('Error confirming booking:', err);
              alert('Network error while booking. Please try again.');
            }
          }}
        />
      )}
    </div>
  );
}
