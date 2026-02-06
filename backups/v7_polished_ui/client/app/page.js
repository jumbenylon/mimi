"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Wallet, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight, Target, Plus } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard')
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(n || 0);

  if (!data) return <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center text-gray-500">Loading Financial Data...</div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-24 font-sans text-gray-900">
      
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-200 sticky top-0 z-20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <img src="/jumbenylon-logo.png" className="h-10 w-10 object-contain rounded-full border border-gray-100" />
             <span className="font-bold text-lg tracking-tight">JumbeNylon</span>
          </div>
          <button className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition">
            <Menu size={20} />
          </button>
        </div>
        
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Liquidity</p>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">{fmt(data.bank_balance)}</h1>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Loans Section (RESTORED PROMINENCE) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-gray-400" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Debt</h3>
            </div>
            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full">{data.loans.length} Active</span>
          </div>
          
          <div className="grid gap-4">
            {data.loans.map((loan, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <CreditCard size={100} className="text-gray-900" transform="rotate(-15)" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Lender</p>
                      <p className="font-black text-xl text-gray-900 w-3/4 leading-tight">{loan.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Balance</p>
                      <p className="font-black text-xl text-red-600">{fmt(loan.balance)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                      <span>Progress</span>
                      <span>{Math.round((loan.paid / loan.original) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className="bg-gray-900 h-3 rounded-full" style={{ width: `${(loan.paid / loan.original) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs font-medium">
                    <span className="text-gray-400">Next Due: <span className="text-gray-900">{loan.next_due}</span></span>
                    <span className="text-gray-400">Original: {fmt(loan.original)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-gray-400" />
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Activity</h3>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {data.transactions.map((tx, i) => (
              <div key={i} className="p-4 border-b border-gray-100 last:border-0 flex justify-between items-center hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${tx.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {tx.amount > 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{tx.description}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {tx.amount > 0 ? '+' : ''}{fmt(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-6 left-6 right-6 bg-gray-900 rounded-2xl p-4 shadow-2xl flex justify-around items-center z-50">
        <Link href="/" className="text-white flex flex-col items-center gap-1 opacity-100">
          <Wallet size={20} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/analytics" className="text-gray-400 flex flex-col items-center gap-1 hover:text-white transition">
          <TrendingUp size={20} />
          <span className="text-[10px] font-medium">Budget</span>
        </Link>
        <div className="h-12 w-12 bg-white rounded-full -mt-12 flex items-center justify-center shadow-lg border-4 border-[#F3F4F6] cursor-pointer">
          <Plus size={24} className="text-black" />
        </div>
        <Link href="/invest" className="text-gray-400 flex flex-col items-center gap-1 hover:text-white transition">
          <TrendingUp size={20} />
          <span className="text-[10px] font-medium">Invest</span>
        </Link>
        <Link href="/goals" className="text-gray-400 flex flex-col items-center gap-1 hover:text-white transition">
          <Target size={20} />
          <span className="text-[10px] font-medium">Goals</span>
        </Link>
      </div>
    </div>
  );
}
