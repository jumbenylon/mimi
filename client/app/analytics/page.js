"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Target, Activity } from 'lucide-react';

// --- SMART URL SELECTION ---
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function GoalsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Goals connecting to:", API_BASE);
    
    // Note: Goals often use the main dashboard endpoint for data
    fetch(`${API_BASE}/api/dashboard`)
      .then((res) => {
        if (!res.ok) throw new Error("Backend Unreachable");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Goals Load Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(n || 0);

  if (loading) return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      <p className="text-gray-400 text-sm animate-pulse">Loading Targets...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4"><Activity size={32} /></div>
      <h3 className="text-lg font-bold text-gray-900">Connection Failed</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
        Could not reach backend at {API_BASE}
      </p>
      <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold">Retry</button>
    </div>
  );

  // Fake Goals Data (Since your API might not return 'goals' yet, we mock it for display)
  // If your API *does* return goals, replace this array with `data.goals`
  const goals = [
    { name: "Emergency Fund", target: 10000000, current: data.total_cash, color: "bg-emerald-500", monthly: 500000 },
    { name: "Retirement", target: 50000000, current: data.total_investments, color: "bg-blue-500", monthly: 1200000 },
    { name: "Debt Payoff", target: 0, current: data.total_debt, color: "bg-orange-500", monthly: 850000 }
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-24 font-sans text-gray-900">
      
      {/* HEADER */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-4">
           <Link href="/"><div className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition"><ArrowLeft size={20} /></div></Link>
           <h2 className="text-xl font-bold tracking-tight">Financial Targets</h2>
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Progress Tracker</p>
      </div>

      {/* BODY */}
      <div className="p-6 space-y-6">
        {goals.map((goal, i) => {
            // Calculate progress percentage
            let progress = 0;
            if (goal.name === "Debt Payoff") {
                // For debt, 'progress' is how much is paid off vs original loan (mock logic)
                progress = 100; // Placeholder
            } else {
                progress = Math.min((goal.current / goal.target) * 100, 100);
            }

            return (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${goal.color.replace('bg-', 'bg-opacity-10 text-')}`}>
                        <Target size={24} className={goal.color.replace('bg-', 'text-')} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{goal.name}</h3>
                        <p className="text-xs text-gray-400 font-medium">Target: {fmt(goal.target)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-900">{fmt(goal.current)}</span>
                    <span className="text-gray-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className={`h-3 rounded-full ${goal.color}`} style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                    <div className="text-xs">
                        <p className="text-gray-400 font-medium">Monthly Contribution</p>
                        <p className="text-gray-900 font-bold">+{fmt(goal.monthly)}</p>
                    </div>
                    <div className="text-xs text-right">
                        <p className="text-gray-400 font-medium">Est. Completion</p>
                        <p className="text-gray-900 font-bold">Dec 2026</p>
                    </div>
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
}
