"use client";
import { useEffect, useState } from 'react';
import { TrendingUp, PieChart, ArrowUpRight, ShieldCheck, Landmark } from 'lucide-react';

export default function Investments() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/investments')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(n || 0);

  if (loading) return <div className="p-10 text-center text-emerald-600 animate-pulse">Loading Portfolio...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Portfolio Data Unavailable</div>;

  const { portfolio, summary } = data;
  const stocks = portfolio.filter(p => p.category === "DSE");
  const funds = portfolio.filter(p => p.category === "UTT");

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-6 pb-24">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-sm text-gray-500">DSE Stocks & Unit Trusts</p>
        </div>

        {/* SUMMARY CARD */}
        <div className="bg-emerald-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800 rounded-full -mr-10 -mt-10 opacity-50 blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-300 mb-1">
              <ShieldCheck size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Total Asset Value</span>
            </div>
            <div className="text-3xl font-bold mb-4">{fmt(summary.total_value)}</div>
            
            <div className="flex gap-4">
              <div>
                <div className="text-xs text-emerald-400">Total Gain</div>
                <div className="font-bold text-emerald-100">+{fmt(summary.total_gain)}</div>
              </div>
              <div>
                <div className="text-xs text-emerald-400">Return</div>
                <div className="font-bold text-emerald-100">+{summary.gain_percentage.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* DSE STOCKS */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg px-2 flex items-center gap-2">
            <TrendingUp size={18} className="text-gray-400"/> DSE Equities
          </h2>
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            {stocks.map((item, i) => (
              <div key={i} className="p-5 border-b border-gray-50 last:border-0 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100">
                    {/* Try to load logo, fallback to text */}
                    <img 
                      src={item.logo || "/placeholder.png"} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {e.target.style.display='none'}}
                    />
                    <span className="absolute font-bold text-xs text-gray-400" style={{zIndex:-1}}>{item.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.qty} shares @ {fmt(item.price)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-medium text-gray-900">{fmt(item.value)}</div>
                  <div className="text-xs font-bold text-emerald-600">+{item.gain_pct.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UTT FUNDS */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg px-2 flex items-center gap-2">
            <Landmark size={18} className="text-gray-400"/> Unit Trusts (UTT)
          </h2>
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            {funds.map((item, i) => (
              <div key={i} className="p-5 border-b border-gray-50 last:border-0 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                    UTT
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-400">Mutual Fund</div>
                  </div>
                </div>
                <div className="font-mono font-medium text-gray-900">{fmt(item.value)}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
