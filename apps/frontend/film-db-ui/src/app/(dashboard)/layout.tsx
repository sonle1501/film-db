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
        {/* Sidebar placeholder */}
        <aside className="hidden md:block w-64 shrink-0">
          <nav className="space-y-1">
            <Link 
              href="/profile" 
              className={`block px-4 py-2.5 text-xs uppercase tracking-widest font-mono border transition-all duration-200 ${
                pathname === '/profile' 
                  ? 'border-cyan-accent/20 bg-cyan-accent/5 text-cyan-accent font-bold shadow-[0_0_8px_rgba(85,234,212,0.05)]' 
                  : 'border-transparent text-text-muted-dark hover:border-white/10 hover:bg-white/5 hover:text-white'
              }`}
            >
              {pathname === '/profile' ? '> [ PROFILE_CARD ]' : '  [ PROFILE_CARD ]'}
            </Link>
            <Link 
              href="/lists" 
              className={`block px-4 py-2.5 text-xs uppercase tracking-widest font-mono border transition-all duration-200 ${
                pathname === '/lists' || pathname?.startsWith('/lists/')
                  ? 'border-cyan-accent/20 bg-cyan-accent/5 text-cyan-accent font-bold shadow-[0_0_8px_rgba(85,234,212,0.05)]' 
                  : 'border-transparent text-text-muted-dark hover:border-white/10 hover:bg-white/5 hover:text-white'
              }`}
            >
              {pathname === '/lists' || pathname?.startsWith('/lists/') ? '> [ MY_WATCHLISTS ]' : '  [ MY_WATCHLISTS ]'}
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
