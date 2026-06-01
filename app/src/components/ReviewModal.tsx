import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Star, X } from 'lucide-react';
import type { Booking } from '@/types';

interface ReviewModalProps {
  booking: Booking;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export default function ReviewModal({ booking, onClose, onReviewSubmitted }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return alert('Please select a rating');
    if (!text.trim()) return alert('Please write a review');

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          providerId: booking.providerId,
          rating,
          text
        })
      });

      if (res.ok) {
        onReviewSubmitted();
        onClose();
      } else {
        alert('Failed to submit review');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white rounded-3xl w-full max-w-sm relative z-10 overflow-hidden shadow-xl animate-scale-in">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-text-primary">Rate Service</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden teal-wash mb-3">
              <img src={booking.providerAvatar} alt={booking.providerName} className="w-full h-full object-cover" />
            </div>
            <h3 className="font-semibold text-text-primary">{booking.providerName}</h3>
            <p className="text-sm text-text-secondary">{booking.service}</p>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  size={32}
                  className={star <= (hoverRating || rating) ? 'text-orange fill-orange' : 'text-gray-200'}
                />
              </button>
            ))}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your review here..."
            className="w-full h-28 p-3 rounded-xl border border-gray-200 focus:border-orange focus:ring-1 focus:ring-orange outline-none resize-none text-sm mb-6"
          />

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-orange text-white py-3.5 rounded-xl font-semibold active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );

  const portalRoot = document.querySelector('.mobile-frame');
  return portalRoot ? createPortal(modalContent, portalRoot) : modalContent;
}
