"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, PieChart, Activity, Landmark, ShieldCheck } from 'lucide-react';

// --- SMART URL SELECTION ---
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function InvestmentsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Investments connecting to:", API_BASE);

    fetch(`${API_BASE}/api/investments`)
      .then((res) => {
        if (!res.ok) throw new Error("Backend Unreachable");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Investments Load Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(n || 0);

  if (loading) return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      <p className="text-gray-400 text-sm animate-pulse">Loading Investment Portfolio...</p>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4"><Activity size={32} /></div>
      <h3 className="text-lg font-bold text-gray-900">Connection Failed</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
        Could not reach backend at {API_BASE}.
      </p>
      <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold">Retry</button>
    </div>
  );

  const { portfolio, summary } = data;
  const stocks = portfolio.filter(p => p.category === "DSE");
  const funds = portfolio.filter(p => p.category === "UTT");

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-24 font-sans text-gray-900">
      
      {/* HEADER */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-4">
           <Link href="/"><div className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition"><ArrowLeft size={20} /></div></Link>
           <h2 className="text-xl font-bold tracking-tight">Investment Portfolio</h2>
        </div>
        
        {/* SUMMARY CARD */}
        <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
           <div className="relative z-10 flex justify-between items-end">
             <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Value</p>
                <p className="text-4xl font-bold text-white">{fmt(summary.total_value)}</p>
             </div>
             <div className="text-right">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Gain</p>
                <div className="flex items-center gap-1 justify-end text-emerald-400">
                   <TrendingUp size={16} />
                   <p className="text-xl font-bold">{fmt(summary.total_gain)}</p>
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="px-6 py-6 space-y-8">

        {/* STOCKS (DSE) */}
        {stocks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
               <TrendingUp size={16}/> Stock Market (DSE)
            </h3>
            {stocks.map((asset, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center text-xl overflow-hidden border border-gray-100">
                            {asset.logo ? <img src={asset.logo} className="w-full h-full object-cover"/> : "📈"}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{asset.name}</p>
                            <p className="text-xs text-gray-500">{asset.qty} units @ {fmt(asset.price)}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-mono font-bold text-gray-900">{fmt(asset.value)}</p>
                        <p className={`text-xs font-bold ${asset.gain_pct >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {asset.gain_pct >= 0 ? '+' : ''}{asset.gain_pct.toFixed(1)}%
                        </p>
                    </div>
                </div>
            ))}
          </div>
        )}

        {/* FUNDS (UTT) */}
        {funds.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
               <Landmark size={16}/> Unit Trusts (UTT)
            </h3>
            {funds.map((asset, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs border border-blue-100">
                            UTT
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{asset.name}</p>
                            <p className="text-xs text-gray-500">Mutual Fund</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-mono font-bold text-gray-900">{fmt(asset.value)}</p>
                        <p className="text-xs font-bold text-gray-400">Stable Growth</p>
                    </div>
                </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
