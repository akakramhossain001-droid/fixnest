import { useRef, useEffect } from 'react';
import { MapPin, Star, ChevronRight, Shield, CheckCircle, BookOpen } from 'lucide-react';
import type { Provider } from '@/types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ProviderCardProps {
  provider: Provider;
  isExpanded: boolean;
  onToggle: () => void;
  onBook: () => void;
  onViewProfile: () => void;
  index: number;
}

export default function ProviderCard({
  provider,
  isExpanded,
  onToggle,
  onBook,
  onViewProfile,
  index,
}: ProviderCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          delay: index < 3 ? index * 0.08 : 0,
        }
      );
    }, cardRef);
    return () => ctx.revert();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden transition-shadow duration-200 hover:shadow-lg cursor-pointer"
      onClick={onToggle}
    >
      {/* Collapsed view - always visible */}
      <div className="p-4 flex items-center gap-4">
        {/* Avatar with teal wash */}
        <div className="relative w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0 teal-wash">
          <img
            src={provider.avatar}
            alt={provider.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-semibold text-text-primary text-base truncate">
              {provider.name}
            </h3>
            {provider.isVerified && (
              <Shield size={14} className="text-teal flex-shrink-0" fill="#1D9E75" />
            )}
          </div>

          <div className="flex flex-col gap-1 mt-1 text-text-secondary text-sm">
            <div className="flex items-center gap-1">
              <MapPin size={13} className="flex-shrink-0" />
              <span className="truncate">{provider.location}</span>
            </div>
            {provider.category === 'tutor' && provider.tags && provider.tags.length > 0 && provider.tags[0] !== 'tutor' && (
              <div className="flex items-center gap-1">
                <BookOpen size={13} className="flex-shrink-0" />
                <span className="truncate">{provider.tags.join(', ')}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-orange fill-orange" />
              <span className="text-sm font-semibold text-text-primary">{provider.rating}</span>
              <span className="text-xs text-text-secondary">({provider.reviewCount})</span>
            </div>
            <span className="text-xs text-teal font-medium bg-teal-light px-2 py-0.5 rounded-full">
              {provider.availability}
            </span>
          </div>
        </div>

        {/* Expand arrow */}
        <button
          className="w-9 h-9 rounded-full bg-teal flex items-center justify-center flex-shrink-0 transition-transform duration-250"
          style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <ChevronRight size={18} className="text-white" />
        </button>
      </div>

      {/* Expanded view */}
      {isExpanded && (
        <div className="px-4 pb-4 animate-fade-in-up">
          {/* Service tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {provider.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-text-secondary bg-gray-100 px-3 py-1.5 rounded-lg"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Bio */}
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            {provider.bio}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-3 text-sm">
            <div className="flex items-center gap-1 text-text-secondary">
              <CheckCircle size={14} className="text-teal" />
              <span>{provider.jobsCompleted} jobs</span>
            </div>
            <div className="flex items-center gap-1 text-text-secondary">
              <Shield size={14} className="text-teal" />
              <span>{provider.yearsExperience} yrs exp</span>
            </div>
          </div>

          {/* Price + Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <span className="text-orange font-heading font-semibold text-lg">
                ₹{provider.price}
              </span>
              <span className="text-text-muted text-sm">/hr</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile();
                }}
                className="px-4 py-2.5 rounded-xl border border-teal text-teal text-sm font-medium transition-transform active:scale-95"
              >
                View Profile
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBook();
                }}
                className="px-5 py-2.5 rounded-xl bg-orange text-white text-sm font-semibold transition-transform active:scale-95 shadow-sm"
              >
                Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
