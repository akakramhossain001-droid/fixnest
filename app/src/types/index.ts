export type Category = 'plumber' | 'electrician' | 'tutor' | 'cleaner';

export type ServiceTag = string;

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Provider {
  id: string;
  name: string;
  avatar: string;
  category: Category;
  location: string;
  rating: number;
  reviewCount: number;
  availability: string;
  tags: ServiceTag[];
  bio: string;
  price: number;
  jobsCompleted: number;
  yearsExperience: number;
  isVerified: boolean;
}

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  service: string;
  date: string;
  time: string;
  address: string;
  status: BookingStatus;
  price: number;
}

export type ScreenName = 'home' | 'profile' | 'bookings' | 'providerProfile' | 'bookingFlow' | 'referral' | 'wallet' | 'personalInfo' | 'addresses' | 'notificationFeed' | 'notificationSettings' | 'safetyCenter' | 'termsPrivacy' | 'savedProviders' | 'adminDashboard';

export type TabName = 'home' | 'bookings' | 'profile';

export interface AppState {
  currentScreen: ScreenName;
  activeTab: TabName;
  selectedProviderId: string | null;
  bookings: Booking[];
}
