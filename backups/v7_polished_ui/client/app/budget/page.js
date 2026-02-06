"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function BudgetPage() {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState("2026-01"); 
  const [periodsList, setPeriodsList] = useState([]);
  const [expandedCat, setExpandedCat] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/analytics?period=${period}`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        if (data.available_periods && data.available_periods.length > 0) setPeriodsList(data.available_periods);
      });
  }, [period]);

  const fmt = (n) => new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(n || 0);
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-orange-500', 'bg-green-500', 'bg-purple-500', 'bg-gray-500'];

  if (!stats) return <div className="h-screen bg-[#F3F4F6] flex items-center justify-center text-gray-400">Loading Analysis...</div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-24 font-sans text-gray-900">
      <div className="bg-white px-6 pt-12 pb-4 sticky top-0 z-20 border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
           <div className="flex items-center gap-3">
             <Link href="/">
               <div className="p-2 bg-gray-100 rounded-full text-gray-600"><ArrowLeft size={20} /></div>
             </Link>
             <div className="flex items-center gap-3">
                 <img src="/jumbenylon-logo.png" className="h-16 w-16 object-contain rounded-full" />
                 <h2 className="text-xl font-bold">Analysis</h2>
             </div>
           </div>
           <div className="relative">
             <select 
               value={period}
               onChange={(e) => setPeriod(e.target.value)}
               className="appearance-none bg-gray-100 pl-4 pr-10 py-2 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
             >
               {periodsList.map((p) => (
                  <option key={p} value={p}>
                    {new Date(p + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </option>
               ))}
               <option value="ALL">All Time</option>
             </select>
             <Calendar size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
           <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Money In</p>
              <p className="text-lg font-black text-green-600">{fmt(stats.income)}</p>
           </div>
           <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Money Out</p>
              <p className="text-lg font-black text-red-600">{fmt(stats.expenses)}</p>
           </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
           <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Spending Breakdown</h3>
           <div className="space-y-3">
              {stats.breakdown.map((cat, i) => {
                 const percent = stats.expenses > 0 ? Math.round((cat.value / stats.expenses) * 100) : 0;
                 const isOpen = expandedCat === cat.name;

                 return (
                   <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-300">
                      <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setExpandedCat(isOpen ? null : cat.name)}>
                         <div className="flex items-center gap-3">
                            <div className={`h-3 w-3 rounded-full ${colors[i % colors.length]}`} />
                            <div>
                                <p className="font-bold text-sm text-gray-900">{cat.name}</p>
                                <p className="text-[10px] text-gray-400">{percent}% of total</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                             <span className="font-bold text-sm">{fmt(cat.value)}</span>
                             {isOpen ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
                         </div>
                      </div>
                      <div className="w-full bg-gray-50 h-1"><div className={`h-full ${colors[i % colors.length]}`} style={{ width: `${percent}%` }} /></div>
                      {isOpen && (
                        <div className="bg-gray-50 p-4 border-t border-gray-100 space-y-3">
                           {cat.items.map((item, idx) => (
                             <div key={idx} className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-600 truncate w-48">{item.desc}</span>
                                <span className="text-xs font-bold text-gray-900">{fmt(item.amount)}</span>
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                 )
              })}
           </div>
        </div>
      </div>
    </div>
  );
}
