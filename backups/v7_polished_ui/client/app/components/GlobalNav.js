"use client";
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, PieChart, Activity, Menu, Plus } from 'lucide-react';
import AddTransactionModal from './AddTransactionModal';

export default function GlobalNav() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const pathname = usePathname();

  // Helper to check active state
  const isActive = (path) => pathname === path ? "text-red-600" : "text-gray-400 hover:text-red-600";
  const getIconClass = (path) => pathname === path ? "opacity-10" : "";
  const getTextClass = (path) => pathname === path ? "font-bold" : "font-medium";

  return (
    <>
      <AddTransactionModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onSuccess={() => window.location.reload()} // Simple refresh to update data
      />

      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 pb-8 pt-4 px-8 flex justify-between items-center z-50">
         
         <Link href="/" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/')}`}>
            <Home size={22} fill="currentColor" className={getIconClass('/')} />
            <span className={`text-[10px] ${getTextClass('/')}`}>Home</span>
         </Link>
         
         <Link href="/budget" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/budget')}`}>
            <PieChart size={22} fill="currentColor" className={getIconClass('/budget')} />
            <span className={`text-[10px] ${getTextClass('/budget')}`}>Budget</span>
         </Link>

         {/* THE GLOBAL ACTION BUTTON */}
         <button 
            onClick={() => setIsAddOpen(true)}
            className="h-14 w-14 bg-red-600 rounded-full flex items-center justify-center -mt-10 shadow-lg shadow-red-200 ring-4 ring-gray-100 active:scale-95 transition-transform"
         >
            <Plus size={28} className="text-white" />
         </button>

         <Link href="/invest" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/invest')}`}>
            <Activity size={22} fill="currentColor" className={getIconClass('/invest')} />
            <span className={`text-[10px] ${getTextClass('/invest')}`}>Invest</span>
         </Link>

         <button className="flex flex-col items-center gap-1 text-gray-400">
            <Menu size={22} />
            <span className="text-[10px] font-medium">Menu</span>
         </button>
      </div>
    </>
  );
}
