"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, TrendingUp, Plus, Menu, BarChart3, Target, Settings, User, X, CreditCard } from 'lucide-react';
import AddTransactionModal from './AddTransactionModal';

export default function GlobalNav() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path) => pathname === path ? "text-black" : "text-gray-400 hover:text-gray-600 transition";

  return (
    <>
      {/* MENU POPUP */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
           <div className="absolute bottom-24 right-4 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 animate-in slide-in-from-bottom-5">
              <div className="flex flex-col gap-1">
                 <Link href="/loans" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-gray-700 font-medium transition">
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg"><CreditCard size={18} /></div>
                    Loans
                 </Link>
                 <Link href="/goals" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-gray-700 font-medium transition">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Target size={18} /></div>
                    Goals
                 </Link>
                 <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-gray-700 font-medium transition">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><User size={18} /></div>
                    Profile
                 </Link>
                 <Link href="/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-gray-700 font-medium transition">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Settings size={18} /></div>
                    Settings
                 </Link>
              </div>
           </div>
        </div>
      )}

      {/* FIXED BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 pb-6 flex justify-between items-end z-50">
        <Link href="/" className={`flex flex-col items-center gap-1 ${isActive('/')} w-16`}>
          <Wallet size={24} strokeWidth={pathname === '/' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Home</span>
        </Link>

        <Link href="/analytics" className={`flex flex-col items-center gap-1 ${isActive('/analytics')} w-16`}>
          <BarChart3 size={24} strokeWidth={pathname === '/analytics' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Budget</span>
        </Link>
        
        <div className="relative -top-5">
           <button onClick={() => setIsModalOpen(true)} className="h-14 w-14 bg-[#D93025] rounded-full flex items-center justify-center shadow-lg shadow-red-200 border-4 border-white cursor-pointer active:scale-95 transition">
             <Plus size={28} className="text-white" />
           </button>
        </div>

        <Link href="/invest" className={`flex flex-col items-center gap-1 ${isActive('/invest')} w-16`}>
          <TrendingUp size={24} strokeWidth={pathname === '/invest' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Invest</span>
        </Link>

        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`flex flex-col items-center gap-1 ${isMenuOpen ? "text-black" : "text-gray-400 hover:text-gray-600"} w-16 transition`}>
          {isMenuOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2} />}
          <span className="text-[10px] font-bold">{isMenuOpen ? "Close" : "Menu"}</span>
        </button>
      </div>

      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
