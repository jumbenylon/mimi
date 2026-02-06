"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Moon, Globe, Database, LogOut, ChevronRight, Check, AlertCircle } from 'lucide-react';
import GlobalNav from '../components/GlobalNav';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Toggle Dark Mode (Simple CSS Class)
  const toggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    if (newVal) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  // Handle Reset
  const handleReset = async () => {
    if(!confirm("⚠️ ARE YOU SURE?\n\nThis will delete ALL transactions and reset your balance to the starting 5.9M.")) return;
    
    setResetting(true);
    try {
        await fetch('http://localhost:8000/api/settings/reset', { method: 'DELETE' });
        alert("✅ System Reset Complete.");
        window.location.href = "/"; // Go home
    } catch (e) {
        alert("Error resetting data");
    }
    setResetting(false);
  };

  return (
    <div className={`min-h-screen pb-32 font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-[#F3F4F6] text-gray-900'}`}>
      
      <div className={`px-6 pt-12 pb-6 border-b sticky top-0 z-20 transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-4">
           <Link href="/"><div className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'}`}><ArrowLeft size={20} /></div></Link>
           <h2 className="text-xl font-bold tracking-tight">Settings</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* App Settings */}
        <div className={`rounded-3xl overflow-hidden border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
           <div onClick={toggleDarkMode} className={`p-4 flex items-center justify-between border-b cursor-pointer transition ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Moon size={18} /></div>
                 <span className="font-semibold">Dark Mode</span>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-colors ${darkMode ? 'bg-green-500' : 'bg-gray-200'}`}>
                  <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
           </div>
           <div className={`p-4 flex items-center justify-between cursor-pointer transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Globe size={18} /></div>
                 <span className="font-semibold">Currency</span>
              </div>
              <span className="text-sm font-bold text-gray-400">TZS (Tanzanian Shilling)</span>
           </div>
        </div>

        {/* Data Management */}
        <div>
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Data Zone</h3>
           <div className={`rounded-3xl overflow-hidden border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              
              <div onClick={handleReset} className={`p-4 flex items-center justify-between cursor-pointer transition group ${darkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}>
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">{resetting ? <AlertCircle size={18} className="animate-spin"/> : <LogOut size={18} />}</div>
                    <span className="font-semibold text-red-600">Reset Application Data</span>
                 </div>
              </div>
           </div>
           <p className="text-xs text-gray-400 mt-2 ml-2">Wipes all transactions. Restores balance to 5.9M.</p>
        </div>

        <p className="text-center text-xs text-gray-400 font-medium mt-8">Version 1.0 (Platinum)</p>

      </div>
      <GlobalNav />
    </div>
  );
}
