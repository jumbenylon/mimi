"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, LineChart, Landmark, Map, CarFront, Hash, Maximize2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const Sparkline = ({ data, color }) => {
  if (!data || !Array.isArray(data) || data.length < 2) return <div className="w-[40px] h-[15px]" />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 40; const height = 15;
  const points = data.map((val, i) => `${(i / (data.length - 1)) * width},${height - ((val - min) / range) * height}`).join(' ');
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
};

export default function InvestPage() {
  const [data, setData] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/investments').then(res => res.json()).then(setData);
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(n || 0);

  if (!data) return <div className="h-screen bg-[#F3F4F6] flex items-center justify-center">Loading Wealth...</div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-24 font-sans text-gray-900">
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-4">
           <Link href="/"><div className="p-2 bg-gray-100 rounded-full text-gray-600"><ArrowLeft size={20} /></div></Link>
           <img src="/jumbenylon-logo.png" className="h-10 w-10 object-contain rounded-full border border-gray-100" />
           <h2 className="text-xl font-bold tracking-tight">Portfolio</h2>
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Net Worth</p>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">{fmt(data.summary.total_value)}</h1>
      </div>

      <div className="p-6 space-y-4">
        {data.assets.map((asset, i) => {
          const isOpen = expanded === asset.category;
          const hasDetails = (asset.stocks?.length > 0) || (asset.funds?.length > 0) || (asset.land?.length > 0) || (asset.vehicles?.length > 0);
          
          return (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => hasDetails && setExpanded(isOpen ? null : asset.category)}>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                    {asset.category === 'DSE' ? <LineChart /> : asset.category === 'UTT' ? <Landmark /> : asset.category === 'Land' ? <Map /> : <CarFront />}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{asset.category}</p>
                    <p className="text-xs text-gray-400 font-medium">{asset.name}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                   <p className="font-bold text-lg">{fmt(asset.value)}</p>
                   {hasDetails && (isOpen ? <ChevronUp size={16} className="text-gray-300"/> : <ChevronDown size={16} className="text-gray-300"/>)}
                </div>
              </div>

              {/* Land Expansion (3-Line Hierarchy) */}
              {isOpen && asset.land?.map((l, idx) => {
                // We split ONLY to separate the title from the bracketed location
                // But we display the bracketed part fully as Line 2.
                const parts = l.name.split(' (');
                const title = parts[0];
                const subtitle = parts[1] ? `(${parts[1]}` : null; 

                return (
                  <div key={idx} className="bg-gray-50 px-5 py-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex flex-col">
                      {/* Line 1: Main Title */}
                      <p className="text-sm font-bold text-gray-900">{title}</p>
                      
                      {/* Line 2: Location (with brackets) */}
                      {subtitle && (
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{subtitle}</p>
                      )}
                      
                      {/* Line 3: SQM (Explicitly Separate) */}
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 font-medium mt-1 uppercase tracking-wide">
                        <Maximize2 size={10}/> {l.details}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{fmt(l.val)}</p>
                  </div>
                )
              })}

              {/* Vehicles Expansion */}
              {isOpen && asset.vehicles?.map((v, idx) => (
                <div key={idx} className="bg-gray-50 px-5 py-4 border-t border-gray-100 flex justify-between items-center">
                   <div>
                    <p className="text-sm font-medium text-gray-900">{v.name}</p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1 font-medium"><ShieldCheck size={10} className="text-gray-400"/> {v.details}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{fmt(v.val)}</p>
                </div>
              ))}

              {/* DSE Expansion */}
              {isOpen && asset.stocks?.map((s, idx) => (
                <div key={idx} className="bg-gray-50 px-5 py-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={s.logo} className="h-8 w-8 rounded-lg bg-white p-1 border border-gray-100" />
                    <div><p className="text-sm font-medium">{s.sym}</p><p className="text-[10px] text-gray-400">Buy: {fmt(s.buy_price)}</p></div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`text-sm font-bold ${s.curr_price >= s.buy_price ? 'text-green-600' : 'text-red-600'}`}>{fmt(s.curr_price)}</p>
                      <p className="text-[9px] text-gray-400 font-medium">{s.shares} shares</p>
                    </div>
                    <Sparkline data={s.trend} color={s.curr_price >= s.buy_price ? '#16a34a' : '#dc2626'} />
                  </div>
                </div>
              ))}
              
              {/* UTT Expansion */}
              {isOpen && asset.funds?.map((f, idx) => (
                <div key={idx} className="bg-gray-50 px-5 py-4 border-t border-gray-100 flex justify-between items-center">
                  <div><p className="text-sm font-medium">{f.name}</p><p className="text-[10px] text-gray-400 flex items-center gap-1 font-medium"><Hash size={8}/> {f.acc}</p></div>
                  <div className="flex items-center gap-6">
                    <p className="text-sm font-bold">{fmt(f.val)}</p>
                    <Sparkline data={f.trend} color="#94a3b8" />
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  );
}
