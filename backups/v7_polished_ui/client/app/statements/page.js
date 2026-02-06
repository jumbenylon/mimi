"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, Zap, FileText } from 'lucide-react';
import Link from 'next/link';

export default function StatementsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('ALL'); 

  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard')
      .then(res => res.json())
      .then(data => {
        const loans = data.transactions.filter(t => t.category.includes('Repayment'));
        setTransactions(loans);
      });
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS' }).format(Math.abs(n));

  const filteredData = transactions.filter(t => {
    if (filter === 'ALL') return true;
    if (filter === 'LOLC') return t.category.includes('LOLC');
    if (filter === 'CONTRACT') return t.category.includes('Contract');
    return true;
  });

  const totalPaid = filteredData.reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-24 font-sans text-gray-900">
      
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 sticky top-0 z-20 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
           <Link href="/">
             <div className="p-2 bg-gray-100 rounded-full text-gray-600"><ArrowLeft size={20} /></div>
           </Link>
           <h2 className="text-lg font-bold">Loan Statements</h2>
           <div className="w-10"></div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
           {['ALL', 'LOLC', 'CONTRACT'].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                 filter === f ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'
               }`}
             >
               {f === 'CONTRACT' ? 'R77 LOAN' : f}
             </button>
           ))}
        </div>
      </div>

      {/* Summary Card */}
      <div className="px-6 mt-6">
        <div className="bg-red-600 text-white rounded-2xl p-6 shadow-lg shadow-red-200">
           <p className="text-xs text-red-200 font-bold uppercase tracking-wider mb-1">Total Repaid (Selected)</p>
           <h1 className="text-3xl font-black tracking-tight">{fmt(totalPaid)}</h1>
           <p className="text-xs text-red-200 mt-2 flex items-center gap-1">
             <FileText size={12} />
             {filteredData.length} Transactions found
           </p>
        </div>
      </div>

      {/* List */}
      <div className="px-6 mt-6 space-y-3">
        {filteredData.map((tx, i) => (
           <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                 <Zap size={18} />
               </div>
               <div>
                 <p className="font-bold text-sm text-gray-900">{tx.description}</p>
                 <p className="text-[10px] text-gray-400">{new Date(tx.date).toLocaleDateString()} • {tx.category}</p>
               </div>
             </div>
             <span className="font-bold text-sm text-gray-900">{fmt(tx.amount)}</span>
           </div>
        ))}
      </div>
    </div>
  );
}
