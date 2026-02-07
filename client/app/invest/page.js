"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Landmark, TrendingUp, ShieldCheck, CarFront, Map, Building2, Activity } from 'lucide-react';
import Link from 'next/link';

// --- SMART URL SELECTION (The Fix) ---
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function InvestPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState('DSE'); 
  const [error, setError] = useState(null);

  useEffect(() => {
    // Debugging: See where we are connecting
    console.log("Invest Page connecting to:", API_BASE);

    fetch(`${API_BASE}/api/investments`)
      .then(res => {
        if (!res.ok) throw new Error("Backend Unreachable");
        return res.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error("Invest Load Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(n || 0);

  if (loading) return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      <p className="text-gray-400 text-sm animate-pulse">Loading Assets...</p>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4"><Activity size={32} /></div>
      <h3 className="text-lg font-bold text-gray-900">Connection Failed</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
        Could not reach backend at {API_BASE}
      </p>
      <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold">Retry</button>
    </div>
  );

  if (!data || !data.portfolio) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">
      Portfolio Data Empty.
    </div>
  );

  // GROUPING LOGIC
  const stocks = data.portfolio.filter(p => p.category.toUpperCase() === 'DSE');
  const funds = data.portfolio.filter(p => p.category.toUpperCase() === 'UTT');
  
  const vehicles = data.portfolio.filter(p => {
    const c = p.category.toUpperCase();
    return c.includes('VEHICLE') || c.includes('CAR') || c.includes('AUTO');
  });
  
  const land = data.portfolio.filter(p => {
    const c = p.category.toUpperCase();
    return c.includes('LAND') || c.includes('REAL') || c.includes('PROPERTY') || c.includes('ESTATE');
  });
  
  const sections = [
    {
      id: 'DSE',
      title: 'Equities (DSE)',
      icon: TrendingUp,
      items: stocks,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      total: stocks.reduce((acc, item) => acc + item.value, 0)
    },
    {
      id: 'UTT',
      title: 'Unit Trusts (UTT)',
      icon: Landmark,
      items: funds,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      total: funds.reduce((acc, item) => acc + item.value, 0)
    },
    {
      id: 'VEHICLE',
      title: 'Vehicles',
      icon: CarFront,
      items: vehicles,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      total: vehicles.reduce((acc, item) => acc + item.value, 0)
    },
    {
      id: 'LAND',
      title: 'Real Estate & Land',
      icon: Map,
      items: land,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      total: land.reduce((acc, item) => acc + item.value, 0)
    }
  ].filter(s => s.items.length > 0); 

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-6 pb-24">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <Link href="/" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-600 hover:bg-gray-50">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assets & Wealth</h1>
            <p className="text-sm text-gray-500">Portfolio Overview</p>
          </div>
        </div>

        {/* TOTAL WEALTH */}
        <div className="bg-emerald-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-800 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-300 mb-2">
              <ShieldCheck size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Total Net Value</span>
            </div>
            <div className="text-4xl font-bold mb-6 tracking-tight">{fmt(data.summary.total_value)}</div>
            
            <div className="flex gap-8 border-t border-emerald-800/50 pt-6">
              <div>
                <div className="text-xs text-emerald-400 mb-1">Total Gain</div>
                <div className="text-xl font-bold text-emerald-50">+{fmt(data.summary.total_gain)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ASSET SECTIONS */}
        <div className="space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isOpen = expanded === section.id;
            
            return (
              <div key={section.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setExpanded(isOpen ? null : section.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${section.bg} flex items-center justify-center ${section.color}`}>
                      <Icon size={24} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-900 text-lg">{section.title}</div>
                      <div className="text-sm text-gray-400">{section.items.length} Assets</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{fmt(section.total)}</div>
                    {isOpen ? <ChevronUp size={20} className="text-gray-300 inline-block mt-1" /> : <ChevronDown size={20} className="text-gray-300 inline-block mt-1" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50/30">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="px-6 py-4 border-b border-gray-100 last:border-0 flex justify-between items-center hover:bg-white transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 p-1 flex items-center justify-center overflow-hidden shadow-sm">
                             {/* Show Logo if available, else Initials */}
                             {item.logo && !item.logo.includes('placeholder') ? (
                               <img src={item.logo} alt={item.name} className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
                             ) : (
                               <span className="font-bold text-xs text-gray-400">{item.name.substring(0, 2)}</span>
                             )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{item.name}</div>
                            {item.category === 'DSE' && <div className="text-xs text-gray-500 font-medium">{item.qty} units • Avg: {fmt(item.price)}</div>}
                            {item.category.includes('Vehicle') && <div className="text-xs text-gray-500 font-medium">{item.qty} unit</div>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{fmt(item.value)}</div>
                          {item.gain_pct !== 0 && (
                            <div className={`text-xs font-bold ${item.gain >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {item.gain >= 0 ? '+' : ''}{item.gain_pct.toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
