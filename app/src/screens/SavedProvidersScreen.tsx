import { useState } from 'react';
import { ArrowLeft, Heart } from 'lucide-react';
import ProviderCard from '@/components/ProviderCard';
import { providers as allProviders } from '@/data/providers';

interface SavedProvidersScreenProps {
  onBack: () => void;
  onNavigateToProfile: (providerId: string) => void;
}

export default function SavedProvidersScreen({ onBack, onNavigateToProfile }: SavedProvidersScreenProps) {
  // Mock saved providers (let's just pick the first 2 as 'saved' for demo purposes)
  const [savedProviders] = useState(() => 
    allProviders.filter(p => p.id === '1' || p.id === '4')
  );

  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <header className="bg-white px-4 h-14 flex items-center border-b border-gray-200 sticky top-0 z-40">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="font-heading font-bold text-lg text-text-primary ml-2">Saved Providers</h1>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4">
        
        {savedProviders.length > 0 ? (
          <>
            <p className="text-sm text-text-secondary mb-4 px-1">
              Professionals you have saved for quick booking.
            </p>
            <div className="flex flex-col gap-4">
              {savedProviders.map(provider => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  isExpanded={expandedCardId === provider.id}
                  onToggle={() => setExpandedCardId(expandedCardId === provider.id ? null : provider.id)}
                  onViewProfile={() => onNavigateToProfile(provider.id)}
                  onBook={() => {}} // We'll just leave it empty for this screen or handle booking flow
                  index={0}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 mt-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <Heart size={32} />
            </div>
            <h2 className="font-heading font-bold text-lg text-text-primary mb-2">No Saved Providers</h2>
            <p className="text-sm text-text-secondary">
              Tap the heart icon on a provider's profile to save them here for quick access next time.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
