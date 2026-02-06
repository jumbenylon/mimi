"use client";
import { useState, useEffect } from 'react';
import { Card } from './components/ui-kit';
import { Menu, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function MobileDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard').then(res => res.json()).then(setData);
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(n || 0);

  if (!data) return <div className="h-screen bg-gray-50 flex items-center justify-center text-red-600 font-bold animate-pulse">MIMI LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-24 font-sans text-gray-900">
      
      {/* HEADER */}
      <div className="bg-red-600 text-white px-6 pt-12 pb-8 rounded-b-[32px] shadow-lg mb-6">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-4">
             <div className="bg-white p-2 rounded-full h-24 w-24 flex items-center justify-center shadow-sm">
                <img src="/jumbenylon-logo.png" alt="Logo" className="h-20 w-20 object-contain rounded-full" />
             </div>
             <div>
               <p className="text-xs text-red-100 font-medium">Welcome back,</p>
               <h2 className="text-lg font-bold">Jumbe Nylon</h2>
             </div>
           </div>
           <Menu className="text-white/80" />
        </div>
        <div className="text-center mt-2">
           <p className="text-xs font-medium text-red-100 uppercase tracking-wider mb-1">Available Cash</p>
           <h1 className="text-4xl font-black tracking-tight">{fmt(data.bank_balance)}</h1>
        </div>
      </div>

      <div className="px-6 space-y-5 -mt-4">
        {/* LOANS LINK */}
        <Link href="/statements" className="flex justify-between items-center px-1 group">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Active Loans</h3>
            <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full group-hover:bg-red-100 transition-colors">
               <span className="text-[10px] font-bold">View Statement</span>
               <ChevronRight size={12} />
            </div>
        </Link>

        {/* LOAN CARDS */}
        {data.loans.map((loan, i) => {
            const progress = (loan.paid / loan.original) * 100;
            return (
                <Card key={i} className="border-l-4 border-red-500">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 rounded-full text-red-600"><Zap size={20} /></div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{loan.name}</p>
                        <p className="text-xs text-gray-500">Due: {new Date(loan.next_due).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-gray-400 font-bold uppercase">Next Bill</p>
                       <p className="text-sm font-bold text-red-600">{fmt(loan.next_amount)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                          <span className="text-gray-500">Paid: {fmt(loan.paid)}</span>
                          <span className="text-gray-900 font-bold">Bal: {fmt(loan.balance)}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                  </div>
                </Card>
            )
        })}

        {/* TRANSACTIONS */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Recent Activity</h3>
          <div className="space-y-3">
             {data.transactions.map((tx, i) => (
               <Card key={i} className="flex justify-between items-center py-4 px-4 shadow-none border-b border-gray-100 rounded-none first:rounded-t-2xl last:rounded-b-2xl last:border-0">
                 <div className="flex items-center gap-3">
                   <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${tx.amount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {tx.amount > 0 ? 'IN' : 'OUT'}
                   </div>
                   <div className="overflow-hidden">
                     <p className="font-bold text-sm text-gray-900 truncate w-48">{tx.description}</p>
                     <p className="text-[10px] text-gray-400">{tx.category} • {new Date(tx.date).toLocaleDateString()}</p>
                   </div>
                 </div>
                 <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                   {tx.amount > 0 ? '+' : ''}{fmt(tx.amount)}
                 </span>
               </Card>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
