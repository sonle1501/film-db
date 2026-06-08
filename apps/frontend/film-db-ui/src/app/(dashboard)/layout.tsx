'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-surface-dark">
      <Navbar />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 bg-surface-dark border border-white/10 rounded-none p-5 relative overflow-hidden self-start">
          {/* Cyberpunk corner decorations */}
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-cyan-accent"></div>
          <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-cyan-accent"></div>
          <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-cyan-accent"></div>
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-cyan-accent"></div>

          <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
            <h3 className="text-xs font-mono font-bold text-cyan-accent uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-accent inline-block animate-pulse"></span>
              // NAVIGATION
            </h3>
            <span className="text-[10px] font-mono text-text-muted-dark font-semibold">NAV_SYS</span>
          </div>

          <nav className="space-y-2">
            <Link 
              href="/profile" 
              className={`block px-4 py-2.5 text-xs uppercase tracking-wider font-mono border transition-all duration-200 ${
                pathname === '/profile' 
                  ? 'border-cyan-accent/30 bg-cyan-accent/15 text-cyan-accent font-bold shadow-[0_0_8px_rgba(85,234,212,0.15)]' 
                  : 'border-transparent text-text-muted-dark hover:border-white/10 hover:bg-white/5 hover:text-white'
              }`}
            >
              {pathname === '/profile' ? '> PROFILE' : '  PROFILE'}
            </Link>
            <Link 
              href="/lists" 
              className={`block px-4 py-2.5 text-xs uppercase tracking-wider font-mono border transition-all duration-200 ${
                pathname === '/lists' || pathname?.startsWith('/lists/')
                  ? 'border-cyan-accent/30 bg-cyan-accent/15 text-cyan-accent font-bold shadow-[0_0_8px_rgba(85,234,212,0.15)]' 
                  : 'border-transparent text-text-muted-dark hover:border-white/10 hover:bg-white/5 hover:text-white'
              }`}
            >
              {pathname === '/lists' || pathname?.startsWith('/lists/') ? '> MY_LISTS' : '  MY_LISTS'}
            </Link>
          </nav>
        </aside>
        
        <main className="flex-1">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
