"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, Filter, Smartphone, Building, CreditCard, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function BudgetPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('MONTH'); // WEEK, MONTH, QUARTER, YEAR

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/transactions')
      .then(res => res.json())
      .then(d => {
        setTransactions(d.transactions);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(n || 0);
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

  // PLATFORM COLOR LOGIC
  const getPlatformStyle = (desc) => {
    const d = desc.toUpperCase();
    if (d.includes('MPESA') || d.includes('VODACOM')) return { icon: Smartphone, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    if (d.includes('SELCOM')) return { icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' };
    if (d.includes('CRDB') || d.includes('ECOBANK') || d.includes('BANK')) return { icon: Building, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
    return { icon: Calendar, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-100' };
  };

  // GROUPING LOGIC
  const groupTransactions = () => {
    const groups = {};
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      let key = "";
      
      if (view === 'WEEK') {
        // Week number logic
        const start = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - start) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((days + 1) / 7);
        key = `Week ${week}, ${date.getFullYear()}`;
      } else if (view === 'MONTH') {
        key = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      } else if (view === 'QUARTER') {
        const q = Math.floor(date.getMonth() / 3) + 1;
        key = `Q${q} ${date.getFullYear()}`;
      } else if (view === 'YEAR') {
        key = date.getFullYear().toString();
      }
      
      if (!groups[key]) groups[key] = { title: key, items: [], total_in: 0, total_out: 0 };
      groups[key].items.push(tx);
      if (tx.amount > 0) groups[key].total_in += tx.amount;
      else groups[key].total_out += Math.abs(tx.amount);
    });
    return Object.values(groups); // Returns array of group objects
  };

  const groupedData = groupTransactions();

  if (loading) return <div className="p-10 text-center text-sm font-semibold text-gray-500 animate-pulse">Loading Financial Data...</div>;

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-6 pb-24">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-600 hover:bg-gray-50 transition">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Budget & History</h1>
            <p className="text-xs text-gray-500">Transaction Ledger</p>
          </div>
        </div>

        {/* TABS (Time Travel) */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex overflow-hidden">
          {['WEEK', 'MONTH', 'QUARTER', 'YEAR'].map((v) => (
            <button 
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${view === v ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* TRANSACTION LIST */}
        <div className="space-y-6">
          {groupedData.map((group, i) => (
            <div key={i} className="space-y-3">
              {/* Group Header */}
              <div className="flex justify-between items-end px-2">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{group.title}</h3>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 block">+{fmt(group.total_in)}</span>
                  <span className="text-xs font-bold text-rose-600 block">-{fmt(group.total_out)}</span>
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {group.items.map((tx, idx) => {
                  const style = getPlatformStyle(tx.description);
                  const Icon = style.icon;
                  return (
                    <div key={idx} className="flex justify-between items-center p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                      
                      <div className="flex items-center gap-3">
                        {/* Date Box */}
                        <div className="flex flex-col items-center justify-center w-10 h-10 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(tx.date).toLocaleDateString('en-GB', { month: 'short' })}</span>
                          <span className="text-sm font-bold text-gray-900">{new Date(tx.date).getDate()}</span>
                        </div>
                        
                        {/* Description & Platform */}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">{tx.description}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${style.bg} ${style.color}`}>
                              <Icon size={10} />
                              {tx.category}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <span className={`text-sm font-mono font-semibold ${tx.amount > 0 ? "text-emerald-600" : "text-gray-900"}`}>
                        {fmt(tx.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
