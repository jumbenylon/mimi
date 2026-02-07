"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ChevronRight } from 'lucide-react';
import Cookies from 'js-cookie'; // make sure to install: npm install js-cookie

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  // --- SET YOUR SECRET PIN HERE ---
  const SECRET_PIN = "2026"; 

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (pin === SECRET_PIN) {
      // 1. Set the cookie (The Key) - Expires in 7 days
      Cookies.set('mimi_auth', 'true', { expires: 7 });
      // 2. Open the Gate
      router.push('/');
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
      
      {/* LOGO AREA */}
      <div className="mb-10 text-center space-y-4">
        <div className="h-20 w-20 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-emerald-900/50">
           <img src="/jumbenylon-logo.png" className="w-16 h-16 object-contain" alt="Logo" />
        </div>
        <div>
           <h1 className="text-2xl font-black text-white tracking-tight">MIMI FINANCE</h1>
           <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">Restricted Access</p>
        </div>
      </div>

      {/* PIN INPUT */}
      <form onSubmit={handleLogin} className="w-full max-w-xs space-y-6">
        <div>
           <input 
             type="password" 
             inputMode="numeric" 
             pattern="[0-9]*"
             maxLength={4}
             value={pin}
             onChange={(e) => setPin(e.target.value)}
             placeholder="Enter PIN"
             className={`w-full text-center text-4xl font-bold tracking-[1em] py-4 bg-transparent border-b-2 outline-none transition-all placeholder-gray-700
               ${error ? 'border-red-500 text-red-500 animate-shake' : 'border-gray-700 text-white focus:border-emerald-500'}
             `}
             autoFocus
           />
        </div>

        <button 
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Lock size={18} />
          <span>Unlock Dashboard</span>
        </button>
      </form>

      <p className="mt-8 text-gray-600 text-[10px] text-center">
        Secured by Jumbe Nylon Systems <br/> Encrypted Connection
      </p>
    </div>
  );
}
