"use client";
import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, DollarSign, Activity, AlertCircle, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FETCH DATA FROM 127.0.0.1 (NOT Localhost)
  const loadData = () => {
    setLoading(true);
    setError(null);
    fetch('http://127.0.0.1:8000/api/dashboard')
      .then(res => {
        if (!res.ok) throw new Error("Server Unreachable");
        return res.json();
      })
      .then(d => {
        if (d.error) throw new Error(d.error);
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error("Connection Failed:", err);
        setError("Cannot connect to Backend (127.0.0.1:8000). Check Terminal 1.");
        setLoading(false);
      });
  };

  useEffect(() => { loadData(); }, []);

  const fmt = (n) => {
    try { return new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(n || 0); } 
    catch (e) { return "TZS 0"; }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-emerald-600 font-medium animate-pulse">
      Connecting to Mimi Finance...
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-700 p-6">
      <AlertCircle size={48} className="mb-4 text-red-500" />
      <h2 className="text-xl font-bold mb-2">Connection Error</h2>
      <p className="mb-6 bg-white p-4 rounded border border-red-100">{error}</p>
      <button onClick={loadData} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition">
        <RefreshCw size={20} /> Retry
      </button>
    </div>
  );

  const safeData = data || {};
  const transactions = safeData.transactions || [];
  const accounts = safeData.accounts || [];
  const totalDebt = safeData.total_debt || 0;
  const netWorth = (safeData.total_assets || 0) + totalDebt;

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-6 pb-24">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mimi Finance</h1>
            <p className="text-sm text-gray-500">Live Dashboard</p>
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">🦁</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-5 rounded-[2rem] border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <TrendingUp size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Net Worth</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{fmt(netWorth)}</div>
          </div>
          <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 text-rose-500 mb-2">
              <DollarSign size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Debt</span>
            </div>
            <div className="text-xl font-bold text-rose-600">{fmt(totalDebt)}</div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-lg px-2">Accounts</h2>
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            {accounts.map((acc, i) => (
              <div key={i} className="p-5 border-b border-gray-50 last:border-0 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{acc.name}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">{acc.type}</div>
                  </div>
                </div>
                <div className="font-mono font-medium text-gray-900">{fmt(acc.balance)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-lg px-2">Recent Activity</h2>
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-6">
             {transactions.length > 0 ? (
               <div className="space-y-6">
                 {transactions.slice(0, 50).map((tx, i) => (
                   <div key={i} className="flex justify-between items-center">
                      <div className="flex flex-col max-w-[65%]">
                        <span className="font-medium text-gray-900 truncate">{tx.description}</span>
                        <span className="text-xs text-gray-400">{tx.date} • {tx.category}</span>
                      </div>
                      <span className={`font-mono ${tx.amount > 0 ? "text-emerald-600" : "text-gray-900"}`}>
                        {fmt(tx.amount)}
                      </span>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center text-gray-400 py-4">No recent transactions</div>
             )}
          </div>
        </div>
      </div>
    </main>
  );
}
