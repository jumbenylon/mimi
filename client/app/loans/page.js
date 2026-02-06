"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Wallet, TrendingUp, ChevronRight } from 'lucide-react';

// SMART URL SELECTOR
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function LoansPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/loans`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => setLoading(false));
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(n || 0);
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

  if (loading) return <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center text-emerald-600 font-medium animate-pulse">Loading Debt Portfolio...</div>;
  if (!data || !data.summary) return <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center text-red-500">Data Unavailable</div>;

  const { summary, loans = [], transactions = [] } = data;

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-32 font-sans text-gray-900">
      
      {/* HEADER */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-4">
           <Link href="/"><div className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition"><ArrowLeft size={20} /></div></Link>
           <h2 className="text-xl font-bold tracking-tight">Debt Portfolio</h2>
        </div>
        
        {/* GLOBAL SUMMARY */}
        <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
           <div className="relative z-10 flex justify-between items-end">
             <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Outstanding</p>
                <p className="text-4xl font-bold text-white">{fmt(summary.remaining)}</p>
             </div>
             <div className="text-right">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Paid</p>
                <p className="text-xl font-bold text-emerald-400">{fmt(summary.paid)}</p>
             </div>
           </div>
           
           <div className="mt-6 space-y-2 relative z-10">
              <div className="flex justify-between text-xs font-bold text-gray-400">
                <span>Total Repayment Progress</span>
                <span>{summary.progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div className="bg-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(summary.progress, 100)}%` }}></div>
              </div>
           </div>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="px-6 py-6 space-y-8">
        
        {/* ACTIVE LOANS LIST */}
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Active Loans</h3>
            {loans.length > 0 ? loans.map((loan) => (
                <div key={loan.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${loan.name.includes('Ecobank') ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{loan.name}</p>
                            <p className="text-xs text-gray-500">Principal: {fmt(loan.principal)}</p>
                        </div>
                    </div>
                     <div className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-full border border-gray-100">
                        {loan.schedule_count > 0 ? `${loan.schedule_count} Installments` : 'No Schedule'}
                     </div>
                </div>
            )) : (
              <div className="p-4 bg-yellow-50 text-yellow-700 text-sm rounded-xl">
                 No active loans found.
              </div>
            )}
        </div>

        {/* RECENT PAYMENTS */}
        <div className="space-y-4">
           <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Payment History</h3>
           {transactions.length > 0 ? (
             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
               {transactions.map((tx, i) => (
                 <div key={i} className="p-4 border-b border-gray-100 last:border-0 flex justify-between items-center hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle size={18} />
                       </div>
                       <div>
                          <p className="font-bold text-sm text-gray-900">{tx.description}</p>
                          <p className="text-xs text-gray-400 font-medium">{fmtDate(tx.date)}</p>
                       </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 text-sm">
                       {fmt(Math.abs(tx.amount))}
                    </span>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center p-6 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-400 text-sm">No recent payments found.</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
