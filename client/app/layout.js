"use client"; // <--- Required to check the URL path
import './globals.css';
import GlobalNav from './components/GlobalNav';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  // Check if the user is currently on the login page
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en">
      <head>
        <title>MIMI Finance</title>
        <meta name="description" content="Your Personal CFO" />
        <link rel="icon" href="/icon.png" />
      </head>
      <body className="bg-[#F3F4F6] text-gray-900 font-sans pb-24">
        
        {/* --- FIXED HEADER START (Only show if NOT on Login Page) --- */}
        {!isLoginPage && (
          <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between transition-all">
            <div className="flex items-center gap-3">
              {/* LOGO IMAGE */}
              <div className="h-10 w-10 relative overflow-hidden rounded-xl shadow-sm border border-gray-100 bg-white">
                <img 
                  src="/jumbenylon-logo.png" 
                  alt="Jumbe Nylon" 
                  className="object-cover w-full h-full"
                />
              </div>
              {/* TEXT BRANDING */}
              <div>
                <h1 className="text-sm font-black tracking-tight text-gray-900 leading-none">JUMBE NYLON</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Wealth Manager</p>
              </div>
            </div>

            {/* RIGHT SIDE: NOTIFICATIONS / PROFILE */}
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </header>
        )}
        {/* --- FIXED HEADER END --- */}

        {/* MAIN CONTENT PADDING (Remove padding on Login page so it centers perfectly) */}
        <div className={!isLoginPage ? "pt-20" : ""}>
          {children}
        </div>

        {/* BOTTOM NAVIGATION (Hide on Login Page) */}
        {!isLoginPage && <GlobalNav />}
        
      </body>
    </html>
  );
}
