"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PieChart, Wallet, ArrowUpRight, ArrowDownRight, 
  DollarSign, CreditCard, Activity, Calendar 
} from 'lucide-react';

// SMART URL SELECTION (The Fix)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // We use API_BASE here, so it works on Cloud AND Localhost
    fetch(`${API_BASE}/api/dashboard`)
      .then((res) => {
        if (!res.ok) throw new Error("Backend Unreachable");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard Load Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(n || 0);

  if (loading) return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      <p className="text-gray-400 text-sm animate-pulse">Connecting to Secure Vault...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4"><Activity size={32} /></div>
      <h3 className="text-lg font-bold text-gray-900">Connection Failed</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
        Could not reach the backend at {API_BASE}.
      </p>
      <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold">Retry</button>
    </div>
  );

  const { total_net_worth, total_cash, total_investments, total_debt, accounts, transactions } = data;

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-24 font-sans text-gray-900">
      
      {/* HEADER */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-200 sticky top-0 z-20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Net Worth</p>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{fmt(total_net_worth)}</h1>
          </div>
          <div className="h-10 w-10 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jumbe" alt="Profile" />
          </div>
        </div>

        {/* QUICK STATS ROW */}
        <div className="grid grid-cols-3 gap-2">
           <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Assets</p>
              <p className="text-xs font-bold text-gray-900">{fmt(total_investments)}</p>
           </div>
           <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Cash</p>
              <p className="text-xs font-bold text-gray-900">{fmt(total_cash)}</p>
           </div>
           <Link href="/loans">
             <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100 active:scale-95 transition">
                <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">Debt</p>
                <p className="text-xs font-bold text-gray-900">{fmt(total_debt)}</p>
             </div>
           </Link>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6 space-y-6">
        
        {/* ACCOUNTS SCROLL */}
        <div>
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Accounts</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {accounts.map((acc) => (
              <div key={acc.id} className="snap-center shrink-0 w-64 h-36 bg-gray-900 rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={64} /></div>
                <div className="relative z-10">
                  <p className="text-xs text-gray-400 font-bold uppercase">{acc.type}</p>
                  <p className="font-bold text-lg">{acc.name}</p>
                </div>
                <p className="relative z-10 text-2xl font-mono tracking-tight">{fmt(acc.balance)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div>
           <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Recent Activity</h3>
           <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
             {transactions.map((tx, i) => (
               <div key={i} className="p-4 border-b border-gray-100 last:border-0 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                     {tx.amount > 0 ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                   </div>
                   <div>
                     <p className="font-bold text-sm text-gray-900 truncate w-40">{tx.description}</p>
                     <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
                   </div>
                 </div>
                 <span className={`font-mono text-sm font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                   {tx.amount > 0 ? '+' : ''}{fmt(tx.amount)}
                 </span>
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
}
