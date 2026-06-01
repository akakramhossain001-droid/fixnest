import { Home, CalendarDays, User } from 'lucide-react';
import type { TabName } from '@/types';

interface BottomNavProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const tabs: { id: TabName; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays },
  { id: 'profile', label: 'Account', icon: User },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="shrink-0 h-16 bg-white border-t border-gray-200 z-50 flex items-center justify-around select-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors duration-200 ${
              isActive ? 'text-teal' : 'text-gray-400'
            }`}
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.5 : 1.5}
            />
            <span className={`text-[11px] font-medium ${isActive ? 'font-semibold' : ''}`}>
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 w-12 h-0.5 bg-teal rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
