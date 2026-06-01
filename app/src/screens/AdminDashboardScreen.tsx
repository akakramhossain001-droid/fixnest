import { useState, useEffect } from 'react';
import { ChevronLeft, Users, CalendarDays, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';

interface AdminDashboardScreenProps {
  onBack: () => void;
}

export default function AdminDashboardScreen({ onBack }: AdminDashboardScreenProps) {
  const [stats, setStats] = useState({ totalUsers: 0, totalBookings: 0, totalRevenue: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'bookings'>('users');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, usersRes, bookingsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/stats`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/bookings`, { headers })
      ]);

      if (!statsRes.ok || !usersRes.ok || !bookingsRes.ok) {
        throw new Error('Failed to fetch admin data. Are you an admin?');
      }

      setStats(await statsRes.json());
      setUsers(await usersRes.json());
      setBookings(await bookingsRes.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBlockUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}/block`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to update user status');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-text-secondary hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-heading font-bold text-lg text-text-primary">Admin Dashboard</h1>
        </div>
        <button 
          onClick={fetchData}
          disabled={isLoading}
          className="p-2 text-teal hover:bg-teal-light rounded-full transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <Users size={16} className="text-blue-500" />
                </div>
                <p className="text-text-secondary text-xs font-medium mb-1">Total Users</p>
                <p className="font-heading font-bold text-2xl text-text-primary">{isLoading ? '-' : stats.totalUsers}</p>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mb-3">
                  <CalendarDays size={16} className="text-purple-500" />
                </div>
                <p className="text-text-secondary text-xs font-medium mb-1">Total Bookings</p>
                <p className="font-heading font-bold text-2xl text-text-primary">{isLoading ? '-' : stats.totalBookings}</p>
              </div>

              <div 
                className="col-span-2 p-4 rounded-2xl shadow-md text-white"
                style={{ background: 'linear-gradient(to bottom right, var(--teal), var(--teal-dark))' }}
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <TrendingUp size={16} className="text-white" />
                </div>
                <p className="text-teal-light text-xs font-medium mb-1">Total Revenue</p>
                <p className="font-heading font-bold text-3xl">₹{isLoading ? '-' : stats.totalRevenue}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl p-1 flex border border-gray-100">
              <button 
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'users' ? 'bg-teal-light text-teal' : 'text-text-secondary'}`}
              >
                Users List
              </button>
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'bookings' ? 'bg-teal-light text-teal' : 'text-text-secondary'}`}
              >
                Recent Bookings
              </button>
            </div>

            {/* Lists */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="py-10 flex justify-center">
                  <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
                </div>
              ) : activeTab === 'users' ? (
                users.length === 0 ? (
                  <p className="text-center text-text-muted py-10 text-sm">No users found.</p>
                ) : (
                  users.map((u) => (
                    <div key={u.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text-primary text-sm">{u.name}</p>
                        <p className="text-text-secondary text-xs mt-0.5">{u.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                          {u.role}
                        </span>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => toggleBlockUser(u.id)}
                            className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider transition-colors border ${u.isBlocked ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                          >
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )
              ) : (
                bookings.length === 0 ? (
                  <p className="text-center text-text-muted py-10 text-sm">No bookings found.</p>
                ) : (
                  bookings.map((b) => (
                    <div key={b.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text-primary text-sm">{b.providerName}</p>
                        <p className="text-text-secondary text-xs mt-0.5">{b.service} - {b.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-text-primary text-sm">₹{b.price}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block font-medium ${b.status === 'completed' ? 'bg-green-100 text-green-700' : b.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
