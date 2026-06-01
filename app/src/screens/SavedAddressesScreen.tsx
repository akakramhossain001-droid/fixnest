import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Home, Briefcase, Plus, MoreVertical, Navigation, Crosshair, Edit2, Trash2 } from 'lucide-react';

interface SavedAddressesScreenProps {
  onBack: () => void;
}

interface Address {
  id: string;
  title: string;
  address: string;
  lat?: number;
  lng?: number;
}

export default function SavedAddressesScreen({ onBack }: SavedAddressesScreenProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'null' || token === 'undefined') {
        setAddresses([]);
        setLoading(false);
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAddresses(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [newAddressText, setNewAddressText] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('home')) return <Home size={20} />;
    if (t.includes('office') || t.includes('work')) return <Briefcase size={20} />;
    return <MapPin size={20} />;
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressText.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'null' || token === 'undefined') {
        alert('Please login first to save addresses');
        return;
      }

      let res;
      if (editingAddressId) {
        res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/addresses/${editingAddressId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ title: 'Saved Location', address: newAddressText })
        });
      } else {
        res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ title: 'Saved Location', address: newAddressText })
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to save address');
        return;
      }

      await fetchAddresses();
      setIsMapOpen(false);
      setNewAddressText('');
      setEditingAddressId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save address');
    }
  };

  const handleEdit = (addr: Address) => {
    setEditingAddressId(addr.id);
    setNewAddressText(addr.address);
    setActiveMenuId(null);
    setIsMapOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchAddresses();
    } catch (err) {
      console.error(err);
      alert('Failed to delete address');
    }
    setActiveMenuId(null);
  };

  return (
    <div className="flex flex-col h-full bg-surface relative overflow-hidden">
      {/* Header */}
      <header className="bg-white px-4 h-14 flex items-center justify-between border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="font-heading font-bold text-lg text-text-primary ml-2">Saved Addresses</h1>
        </div>
      </header>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 pb-24">
        {loading ? (
          <p className="text-center text-text-secondary mt-10">Loading...</p>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MapPin size={24} className="text-gray-400" />
            </div>
            <p className="text-text-secondary font-medium">No saved addresses yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-light/50 flex items-center justify-center text-teal shrink-0 mt-1">
                  {getIcon(addr.title)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-text-primary text-base mb-1">{addr.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{addr.address}</p>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setActiveMenuId(activeMenuId === addr.id ? null : addr.id)}
                    className="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 shrink-0"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuId === addr.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setActiveMenuId(null)}
                      />
                      <div className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                        <button 
                          onClick={() => handleEdit(addr)}
                          className="w-full px-4 py-2 text-left text-sm font-medium text-text-primary hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit2 size={16} className="text-gray-400" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(addr.id)}
                          className="w-full px-4 py-2 text-left text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <div className="absolute bottom-6 left-0 right-0 px-5 z-20">
        <button 
          onClick={() => {
            setEditingAddressId(null);
            setNewAddressText('');
            setIsMapOpen(true);
          }}
          className="w-full bg-teal text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-teal-dark active:scale-[0.98] transition-all shadow-lg shadow-teal/20"
        >
          <Plus size={20} />
          Add New Address
        </button>
      </div>

      {/* Map Overlay */}
      <div 
        className={`absolute inset-0 z-50 bg-surface flex flex-col transition-transform duration-300 ${
          isMapOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Map Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 pointer-events-none">
          <button 
            onClick={() => setIsMapOpen(false)}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-text-primary pointer-events-auto"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="bg-white px-4 py-2 rounded-full shadow-md pointer-events-auto">
            <span className="text-sm font-semibold text-text-primary">Select Location</span>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Mock Map Background */}
        <div className="flex-1 relative bg-[#e5e3df] overflow-hidden">
          {/* Map Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(#999 1px, transparent 1px), linear-gradient(90deg, #999 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
          
          {/* Fake Map Roads */}
          <div className="absolute top-1/3 left-0 right-0 h-4 bg-white/60 transform -rotate-12" />
          <div className="absolute top-0 bottom-0 left-1/3 w-6 bg-white/60 transform rotate-12" />
          
          {/* Map Pin */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full flex flex-col items-center">
            <div className="bg-teal text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md mb-2 whitespace-nowrap animate-bounce">
              Set location here
            </div>
            <MapPin size={40} className="text-teal drop-shadow-lg" fill="currentColor" />
            <div className="w-4 h-1.5 bg-black/20 rounded-full mt-1 blur-[1px]" />
          </div>

          {/* Current Location Button */}
          <button className="absolute bottom-6 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-teal hover:bg-gray-50 active:scale-95 transition-all">
            <Crosshair size={22} />
          </button>
        </div>

        {/* Address Details Bottom Sheet */}
        <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 relative z-10">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
          
          <h3 className="font-heading font-bold text-lg text-text-primary mb-1">Enter Complete Address</h3>
          <p className="text-sm text-text-secondary mb-5">This helps providers locate you easily</p>

          <form onSubmit={handleSaveAddress}>
            <div className="relative mb-6">
              <div className="absolute top-3.5 left-3 text-teal">
                <Navigation size={18} />
              </div>
              <input 
                type="text" 
                value={newAddressText}
                onChange={(e) => setNewAddressText(e.target.value)}
                autoFocus={isMapOpen}
                placeholder="House No, Building Name, Street..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-teal text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-teal-dark active:scale-[0.98] transition-all shadow-md shadow-teal/20"
            >
              Confirm Location
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
