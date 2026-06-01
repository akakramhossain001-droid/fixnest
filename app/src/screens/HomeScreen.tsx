import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Wrench, Zap, BookOpen, Sparkles, ChevronDown, ArrowRight, Bell } from 'lucide-react';
import type { Category, Provider } from '@/types';
import { categories, sortOptions } from '@/data/providers';
import { providers as localProviders } from '@/data/providers';
import ProviderCard from '@/components/ProviderCard';
import BookingSheet from '@/components/BookingSheet';
import AuthModal from '@/components/AuthModal';
import type { AuthMode } from '@/components/AuthModal';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const iconMap: Record<string, React.ElementType> = {
  Wrench, Zap, BookOpen, Sparkles,
};

const categoryStyles: Record<string, { gradient: string, shadow: string, iconColor: string, activeBg: string }> = {
  plumber: { gradient: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/40', iconColor: 'text-blue-500', activeBg: 'bg-blue-50' },
  electrician: { gradient: 'from-orange-500 to-amber-400', shadow: 'shadow-orange-500/40', iconColor: 'text-orange-500', activeBg: 'bg-orange-50' },
  tutor: { gradient: 'from-purple-500 to-indigo-400', shadow: 'shadow-purple-500/40', iconColor: 'text-purple-500', activeBg: 'bg-purple-50' },
  cleaner: { gradient: 'from-pink-500 to-rose-400', shadow: 'shadow-pink-500/40', iconColor: 'text-pink-500', activeBg: 'bg-pink-50' },
};

interface HomeScreenProps {
  onNavigateToProfile: (providerId: string) => void;
  onNavigate: (screen: import('@/types').ScreenName) => void;
  isActive?: boolean;
}

export default function HomeScreen({ onNavigateToProfile, onNavigate, isActive = true }: HomeScreenProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('plumber');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [bookingProvider, setBookingProvider] = useState<Provider | null>(null);
  const [showBottomBar, setShowBottomBar] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const listRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const subjectDropdownRef = useRef<HTMLDivElement>(null);

  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch(e) {}
    }
    
    // Fetch notifications status whenever the screen becomes active
    if (token && isActive) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          setHasUnreadNotifications(data.some(n => !n.isRead));
        }
      })
      .catch(console.error);
    }
  }, [isActive]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/providers`);
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const mappedData = data.map((p: any) => {
            const localMatch = localProviders.find((lp) => lp.id === p.id);
            
            // Map backend category names to frontend ones
            let mappedCategory = p.category;
            if (mappedCategory === 'plumbing') mappedCategory = 'plumber';
            if (mappedCategory === 'electrical') mappedCategory = 'electrician';
            if (mappedCategory === 'cleaning') mappedCategory = 'cleaner';

            const defaultTags: Record<string, string[]> = {
              plumber: ['Pipe Leak Repair - ₹200', 'Tap & Shower Fitting - ₹150', 'Water Heater Repair - ₹450', 'Blocked Drain Clearing - ₹300', 'Water Tank Cleaning - ₹500', 'Other'],
              electrician: ['Fan / Light Fitting - ₹150', 'Switchboard Replacement - ₹250', 'AC Servicing - ₹500', 'Inverter Setup - ₹800', 'House Wiring - ₹1500', 'Other'],
              tutor: ['Math & Science - ₹500', 'Spoken English Course - ₹400', 'Basic Computer - ₹350', 'Art & Drawing - ₹300', 'Other'],
              cleaner: ['Deep Home Cleaning - ₹999', 'Sofa & Carpet Cleaning - ₹499', 'Bathroom Deep Cleaning - ₹399', 'Kitchen Cleaning - ₹450', 'Pest Control - ₹800', 'Other'],
            };
            
            return {
              ...p,
              category: mappedCategory,
              price: localMatch?.price || p.hourlyRate || 200,
              reviewCount: p.reviews || localMatch?.reviewCount || 0,
              tags: defaultTags[mappedCategory] || [mappedCategory],
              location: localMatch?.location || 'New Delhi, NCR',
              jobsCompleted: localMatch?.jobsCompleted || 50,
              yearsExperience: localMatch?.yearsExperience || 2,
              availability: localMatch?.availability || 'Available today',
              bio: localMatch?.bio || p.description || '',
              isVerified: localMatch?.isVerified !== undefined ? localMatch.isVerified : true,
            };
          });
          setAllProviders(mappedData);
        } else {
          setAllProviders(localProviders);
        }
      } catch (err) {
        console.error('Error fetching providers:', err);
        setAllProviders(localProviders);
      } finally {
        setIsLoadingProviders(false);
      }
    };
    fetchProviders();
  }, []);

  // Filter and sort providers
  const filteredProviders = useMemo(() => {
    let result = allProviders.filter((p) => p.category === activeCategory);

    // Apply subject filter for tutors
    if (activeCategory === 'tutor' && selectedSubject !== 'All') {
      result = result.filter(p => p.tags.includes(selectedSubject));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.location.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return result;
  }, [activeCategory, searchQuery, sortBy]);

  // Show bottom bar after scrolling past first 2 cards
  useEffect(() => {
    const handleScroll = () => {
      setShowBottomBar(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false);
      }
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(e.target as Node)) {
        setShowSubjectDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleBook = (provider: Provider) => {
    setBookingProvider(provider);
  };

  const handleConfirmBooking = async (bookingData: Omit<import('@/types').Booking, 'id' | 'status'>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to book a service!');
        setAuthMode('login');
        setShowAuthModal(true);
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
        setBookingProvider(null);
        setExpandedCardId(null);
        // Dispatch custom event to refresh bookings if needed
        window.dispatchEvent(new Event('bookingUpdated'));
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to book service');
      }
    } catch (err) {
      console.error('Error confirming booking:', err);
      alert('Network error while booking. Please try again.');
    }
  };

  const activeSortLabel = sortOptions.find((o) => o.value === sortBy)?.label || 'Recommended';

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar dot-pattern bg-surface" ref={listRef}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="FixNest Logo" className="w-8 h-8 object-contain" />
              <span className="font-heading font-bold text-lg text-text-primary mr-1">FixNest</span>
              
              <button 
                onClick={() => onNavigate('notificationFeed')}
                className="relative w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-text-secondary hover:bg-gray-100 hover:text-teal transition-colors"
              >
                <Bell size={18} />
                {hasUnreadNotifications && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-50" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <div className="text-sm font-medium text-teal flex items-center gap-1.5 bg-teal-light px-3 py-1.5 rounded-lg border border-teal/20">
                  <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                  Hi, {user.name.split(' ')[0]}
                </div>
              ) : (
                <button 
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                  className="text-sm text-teal font-semibold border border-teal px-4 py-1.5 rounded-lg hover:bg-teal-light active:scale-95 transition-all"
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-3 px-4 py-4 overflow-x-auto no-scrollbar snap-x">
            {categories.map((cat) => {
              const Icon = iconMap[cat.icon];
              const isActive = activeCategory === cat.id;
              const theme = categoryStyles[cat.id] || categoryStyles['plumber'];
              
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setExpandedCardId(null);
                  }}
                  className={`snap-start relative flex flex-col items-center justify-center min-w-[80px] py-3 px-2 rounded-2xl transition-all duration-300 border ${
                    isActive
                      ? `${theme.activeBg} border-transparent shadow-sm scale-105`
                      : 'bg-white border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-12 h-12 flex items-center justify-center rounded-xl mb-2 transition-all duration-300 ${
                    isActive 
                      ? `bg-gradient-to-br ${theme.gradient} text-white shadow-lg ${theme.shadow}` 
                      : `bg-gray-50 ${theme.iconColor}`
                  }`}>
                    <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
                  </div>
                  <span className={`text-[11px] font-semibold transition-colors ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Search + Filter Bar */}
        <div className="px-4 pt-4 pb-2 space-y-3 bg-surface">
          {/* Search input */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-teal transition-colors">
              <Search size={18} className="text-text-muted flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a service..."
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X size={16} className="text-text-muted" />
                </button>
              )}
            </div>
            <button className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
              <Search size={18} className="text-white" />
            </button>
          </div>

          {/* Sort + Category chip */}
          <div className="flex items-center gap-2">
            {/* Sort dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-text-primary"
              >
                <SlidersHorizontal size={14} className="text-text-secondary" />
                <span>{activeSortLabel}</span>
                <ChevronDown size={14} className={`text-text-secondary transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[200px] animate-fade-in">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm first:rounded-t-xl last:rounded-b-xl transition-colors ${
                        sortBy === option.value
                          ? 'bg-teal-light text-teal font-medium'
                          : 'text-text-primary hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subject dropdown (Tutor only) */}
            {activeCategory === 'tutor' && (
              <div className="relative" ref={subjectDropdownRef}>
                <button
                  onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                  className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-text-primary"
                >
                  <BookOpen size={14} className="text-text-secondary" />
                  <span>{selectedSubject === 'All' ? 'Subjects' : selectedSubject}</span>
                  <ChevronDown size={14} className={`text-text-secondary transition-transform ${showSubjectDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showSubjectDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[150px] animate-fade-in max-h-[300px] overflow-y-auto no-scrollbar">
                    {['All', 'Mathematics', 'Physics', 'Chemistry', 'Programming', 'Data Science', 'AI/ML'].map((subject) => (
                      <button
                        key={subject}
                        onClick={() => {
                          setSelectedSubject(subject);
                          setShowSubjectDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm first:rounded-t-xl last:rounded-b-xl transition-colors ${
                          selectedSubject === subject
                            ? 'bg-teal-light text-teal font-medium'
                            : 'text-text-primary hover:bg-gray-50'
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Active category chip */}
            <div className="flex items-center gap-1.5 bg-teal-light text-teal rounded-xl px-3 py-2 text-sm font-medium w-fit">
              {(() => {
                const Icon = iconMap[categories.find((c) => c.id === activeCategory)?.icon || 'Wrench'];
                return <Icon size={14} />;
              })()}
              <span className="capitalize">{activeCategory}</span>
            </div>
          </div>
        </div>

        {/* Provider Cards */}
        <div className="px-4 py-4 space-y-4">
          {isLoadingProviders ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-text-secondary font-medium">Loading providers...</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search size={48} className="text-gray-300 mb-4" />
              <p className="text-text-secondary font-medium">No providers found</p>
              <p className="text-text-muted text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredProviders.map((provider, index) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isExpanded={expandedCardId === provider.id}
                onToggle={() =>
                  setExpandedCardId(expandedCardId === provider.id ? null : provider.id)
                }
                onBook={() => handleBook(provider)}
                onViewProfile={() => onNavigateToProfile(provider.id)}
                index={index}
              />
            ))
          )}
        </div>

        {/* Bottom spacing */}
        <div className="h-24" />
      </div>

      {/* Sticky Bottom Bar */}
      <div
        className={`absolute bottom-16 left-0 right-0 z-30 transition-transform duration-300 ${
          showBottomBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-4 bg-white rounded-2xl shadow-sticky border border-gray-100 p-4 flex items-center justify-between">
          <div>
            <p className="font-heading font-semibold text-text-primary">Found Top Professionals</p>
            <p className="text-text-secondary text-xs mt-0.5">Best price guaranteed</p>
          </div>
          <button
            onClick={() => {
              if (filteredProviders.length > 0) {
                handleBook(filteredProviders[0]);
              }
            }}
            className="w-10 h-10 rounded-full bg-teal flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowRight size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Booking Bottom Sheet */}
      {bookingProvider && (
        <BookingSheet
          provider={bookingProvider}
          onClose={() => setBookingProvider(null)}
          onConfirm={handleConfirmBooking}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          initialMode={authMode} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}
    </div>
  );
}
