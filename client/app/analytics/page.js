"use client";
import { useEffect, useState } from 'react';
import { PieChart, TrendingDown, TrendingUp, Calendar, ArrowRight, List, ChevronDown, ChevronUp } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Collapsible Section Component
  const CollapsibleSection = ({ title, icon: Icon, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
              <Icon size={20} />
            </div>
            <span className="font-bold text-gray-900 text-lg">{title}</span>
          </div>
          {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </button>
        {isOpen && <div className="p-6 pt-0">{children}</div>}
      </div>
    );
  };

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/analytics')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error("Analytics Error:", err);
        setLoading(false);
      });
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(n || 0);
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">Computing Financial Logic...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Analytics Unavailable</div>;

  // SAFE ACCESS: Ensure breakdown exists
  const breakdown = data.breakdown || [];

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-6 pb-24">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">Where your money goes</p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <TrendingUp size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Income</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{fmt(data.income)}</div>
          </div>
          <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 text-rose-500 mb-2">
              <TrendingDown size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Expenses</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{fmt(data.expense)}</div>
          </div>
        </div>

        {/* SPENDING BREAKDOWN */}
        <CollapsibleSection title="Spending Breakdown" icon={List}>
           <div className="space-y-6">
             {breakdown.length > 0 ? breakdown.map((cat, i) => (
               <div key={i} className="space-y-3">
                 {/* Category Header */}
                 <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-10 bg-rose-500 rounded-full"></div>
                     <div>
                       <div className="font-bold text-gray-900">{cat.category}</div>
                       <div className="text-xs text-gray-400">{cat.items.length} Transactions</div>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="font-bold text-gray-900">{fmt(cat.total)}</div>
                     <div className="text-xs font-bold text-rose-500">{cat.percentage.toFixed(1)}%</div>
                   </div>
                 </div>

                 {/* Transaction List (Mini) */}
                 <div className="pl-5 border-l-2 border-gray-100 space-y-2">
                   {cat.items.slice(0, 5).map((item, idx) => (
                     <div key={idx} className="flex justify-between text-sm">
                       <span className="text-gray-600 truncate max-w-[180px]">{item.desc}</span>
                       <span className="font-medium text-gray-900">{fmt(item.amount)}</span>
                     </div>
                   ))}
                 </div>
               </div>
             )) : <div className="text-center text-gray-400 py-4">No expenses recorded</div>}
           </div>
        </CollapsibleSection>

      </div>
    </main>
  );
}
