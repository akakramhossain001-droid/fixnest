import { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, Plus, ArrowDownLeft, ArrowUpRight, Clock, ShieldCheck, Loader2 } from 'lucide-react';

interface WalletScreenProps {
  onBack: () => void;
}

interface Transaction {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  amount: number;
}

export default function WalletScreen({ onBack }: WalletScreenProps) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingMoney, setAddingMoney] = useState(false);

  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/wallet`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleAddMoney = async () => {
    try {
      setAddingMoney(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/wallet/add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ amount: 500 }) // Hardcoded for demo
      });
      if (res.ok) {
        fetchWallet(); // refresh balance
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingMoney(false);
    }
  };
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
        <h1 className="font-heading font-bold text-lg text-text-primary ml-2">FixNest Wallet</h1>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Balance Card */}
        <div className="px-5 py-6">
          <div 
            className="rounded-3xl p-6 text-white shadow-lg relative overflow-hidden"
            style={{ background: 'linear-gradient(to bottom right, var(--teal), var(--teal-dark))' }}
          >
            {/* Decorative shapes */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Wallet size={16} />
                  <span className="text-sm font-medium">Available Balance</span>
                </div>
                <ShieldCheck size={24} className="text-white/80" />
              </div>
              
              <div className="flex items-end gap-2 mb-6">
                <span className="text-5xl font-heading font-bold tracking-tight">₹{balance}</span>
                <span className="text-teal-light mb-1.5">.00</span>
              </div>
              <div className="mt-2">
                <button 
                  onClick={handleAddMoney}
                  disabled={addingMoney}
                  className="w-full bg-white text-teal py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm"
                >
                  {addingMoney ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  Add ₹500
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="px-5 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg text-text-primary">Recent Transactions</h2>
            <button className="text-teal text-sm font-medium flex items-center gap-1">
              View All
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-text-secondary">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">No transactions yet.</div>
            ) : (
              transactions.map((tx, index) => {
                const isCredit = tx.type === 'credit';
                return (
                  <div 
                    key={tx.id} 
                    className={`flex items-center gap-4 p-4 ${index !== transactions.length - 1 ? 'border-b border-gray-50' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                      {isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text-primary text-sm truncate mb-0.5">{tx.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <Clock size={12} />
                        <span className="truncate">{new Date(tx.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className={`font-heading font-bold ${isCredit ? 'text-green-600' : 'text-text-primary'}`}>
                      {isCredit ? '+' : '-'}₹{tx.amount}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
