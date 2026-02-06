"use client";
import Link from 'next/link';
import { ArrowLeft, User, ShieldCheck, Mail, MapPin } from 'lucide-react';
import GlobalNav from '../components/GlobalNav';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-32 font-sans text-gray-900">
      
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-4">
           <Link href="/"><div className="p-2 bg-gray-100 rounded-full text-gray-600"><ArrowLeft size={20} /></div></Link>
           <h2 className="text-xl font-bold tracking-tight">My Profile</h2>
        </div>
        
        <div className="flex items-center gap-4 mt-6">
           <div className="h-20 w-20 bg-gray-900 rounded-full flex items-center justify-center text-white text-3xl font-bold">JN</div>
           <div>
             <h1 className="text-2xl font-bold text-gray-900">JumbeNylon</h1>
             <p className="text-sm text-gray-500 font-medium">Platinum Member</p>
           </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        
        {/* Personal Details Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-500"><Mail size={18} /></div>
              <div><p className="text-xs text-gray-400 font-bold uppercase">Email</p><p className="font-semibold text-gray-900">jumbenylon@gmail.com</p></div>
           </div>
           <div className="h-px bg-gray-100"></div>
           <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-500"><MapPin size={18} /></div>
              <div><p className="text-xs text-gray-400 font-bold uppercase">Location</p><p className="font-semibold text-gray-900">Dar es Salaam, Tanzania</p></div>
           </div>
        </div>

        {/* Status Card */}
        <div className="bg-gray-900 rounded-3xl p-6 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-10"><ShieldCheck size={80} /></div>
           <p className="text-xs text-gray-400 font-bold uppercase mb-1">System Status</p>
           <h3 className="text-2xl font-bold">Secure & Synced</h3>
           <p className="text-sm text-gray-400 mt-2">Your data is backed up to v7_polished_ui.</p>
        </div>

      </div>
      <GlobalNav />
    </div>
  );
}
