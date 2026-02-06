"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Target } from 'lucide-react';
import GlobalNav from '../components/GlobalNav';

export default function GoalsPage() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch('http://localhost:8000/api/dashboard').then((res) => res.json()).then(setData); }, []);
  const fmt = (n) => new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(n || 0);

  if (!data) return <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center text-gray-500">Loading Goals...</div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-24 font-sans text-gray-900">
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-4">
           <Link href="/"><div className="p-2 bg-gray-100 rounded-full text-gray-600"><ArrowLeft size={20} /></div></Link>
           <h2 className="text-xl font-bold tracking-tight">Financial Targets</h2>
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Strategy</p>
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">The 2026 Plan</h1>
      </div>
      <div className="p-6 space-y-6">
        {data.goals?.map((goal, i) => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3"><div className={`p-3 rounded-2xl ${goal.color} bg-opacity-10 text-gray-900`}><Target size={24} className={goal.color.replace('bg-', 'text-')} /></div><div><h3 className="font-bold text-lg text-gray-900">{goal.name}</h3><p className="text-xs text-gray-400 font-medium">Target: {fmt(goal.target)}</p></div></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold"><span className="text-gray-900">{fmt(goal.current)}</span><span className="text-gray-400">{Math.round(progress)}%</span></div>
                <div className="w-full bg-gray-100 rounded-full h-3"><div className={`h-3 rounded-full ${goal.color}`} style={{ width: `${progress}%` }}></div></div>
              </div>
              <div className="pt-4 border-t border-gray-50 flex justify-between items-center"><div className="text-xs"><p className="text-gray-400 font-medium">Monthly Contribution</p><p className="text-gray-900 font-bold">+{fmt(goal.monthly)}</p></div><div className="text-xs text-right"><p className="text-gray-400 font-medium">Remaining</p><p className="text-gray-900 font-bold">{fmt(goal.target - goal.current)}</p></div></div>
            </div>
          )
        })}
      </div>
      <GlobalNav />
    </div>
  );
}
