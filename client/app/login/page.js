"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Key, ArrowRight, Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- YOUR CREDENTIALS ---
  const VALID_EMAIL = "jumbenylon@gmail.com";
  const VALID_PASS = "@Hkgg8886";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Artificial delay to feel secure
    await new Promise(r => setTimeout(r, 800));

    if (email.toLowerCase() === VALID_EMAIL.toLowerCase() && password === VALID_PASS) {
      // 1. Set the cookie (The Key) - Expires in 7 days
      Cookies.set('mimi_auth', 'true', { expires: 7 });
      // 2. Open the Gate
      router.push('/');
    } else {
      setError('Invalid Credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
      
      {/* LOGO AREA */}
      <div className="mb-10 text-center space-y-4">
        <div className="h-20 w-20 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-emerald-900/20">
           <img src="/jumbenylon-logo.png" className="w-16 h-16 object-contain" alt="Logo" />
        </div>
        <div>
           <h1 className="text-2xl font-black text-white tracking-tight">MIMI FINANCE</h1>
           <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">Secure Gateway</p>
        </div>
      </div>

      {/* LOGIN FORM */}
      <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
        
        {/* EMAIL INPUT */}
        <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
            <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl py-3 pl-12 pr-4 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-gray-600"
                />
            </div>
        </div>

        {/* PASSWORD INPUT */}
        <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Password</label>
            <div className="relative group">
                <Key className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl py-3 pl-12 pr-4 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-gray-600"
                />
            </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-xs font-bold animate-pulse">
                <Lock size={14} /> {error}
            </div>
        )}

        {/* SUBMIT BUTTON */}
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 mt-4 shadow-lg shadow-emerald-900/20"
        >
          {loading ? <Loader2 className="animate-spin" size={20}/> : <ArrowRight size={20} />}
          <span>{loading ? 'Verifying...' : 'Login'}</span>
        </button>
      </form>

      <p className="mt-8 text-gray-600 text-[10px] text-center">
        Authorized Personnel Only <br/> JUMBE NYLON SYSTEMS © 2026
      </p>
    </div>
  );
}
