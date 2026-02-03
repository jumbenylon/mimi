"use client";
import { useState, useEffect } from 'react';
import { Wallet, ShieldCheck, RefreshCw } from 'lucide-react';

export default function MobileHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    fetch('https://me.jumbenylon.com/analytics') 
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(e => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const fmt = (n) => (n || 0).toLocaleString();
  const getGradient = (color) => {
    if(color === "red") return "from-red-600 to-red-900";
    if(color === "blue") return "from-blue-600 to-blue-900";
    if(color === "emerald") return "from-emerald-600 to-emerald-900";
    if(color === "purple") return "from-purple-600 to-purple-900";
    if(color === "cyan") return "from-cyan-600 to-cyan-900";
    return "from-gray-800 to-gray-900";
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <RefreshCw className="text-white animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-20">
      <div className="flex justify-between items-center mb-8 mt-4">
        <div>
          <p className="text-xs font-bold text-gray-500 tracking-[0.2em]">MIMI AI</p>
          <h1 className="text-2xl font-black tracking-tight">Command Center</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
          <span className="text-xs font-bold">PJ</span>
        </div>
      </div>

      <div className="bg-white text-black p-8 rounded-[2rem] mb-8 relative overflow-hidden">
        <p className="text-xs font-bold uppercase text-gray-500 mb-1">Total Net Worth</p>
        <h2 className="text-4xl font-black tracking-tighter mb-4">
          TZS {fmt(data?.net_worth / 1000000)}M
        </h2>
        <div className="flex gap-2">
           <span className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full">
             Institutional Grade
           </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Wallet size={16} className="text-gray-500" />
          <p className="text-xs font-bold text-gray-500 uppercase">Liquid Assets</p>
        </div>

        {data?.accounts?.map((acc, i) => (
          <div 
            key={i} 
            className={`p-6 rounded-[1.5rem] bg-gradient-to-br ${getGradient(acc.color_code)} border border-white/10 relative overflow-hidden group`}
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <p className="font-bold text-lg">{acc.name}</p>
                <div className="bg-black/20 p-2 rounded-full backdrop-blur-md">
                   <ShieldCheck size={14} className="text-white/70"/>
                </div>
              </div>
              <p className="text-xs text-white/60 font-mono mb-1">AVAILABLE BALANCE</p>
              <p className="text-2xl font-bold tracking-tight">TZS {fmt(acc.balance)}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button onClick={fetchData} className="fixed bottom-6 right-6 bg-blue-600 p-4 rounded-full shadow-lg shadow-blue-900/50">
        <RefreshCw size={24} className="text-white" />
      </button>
    </div>
  );
}
