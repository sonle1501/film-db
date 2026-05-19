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
              className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === '/profile' 
                  ? 'bg-white/10 text-white' 
                  : 'text-text-muted-dark hover:bg-white/5 hover:text-white'
              }`}
            >
              Profile
            </Link>
            <Link 
              href="/lists" 
              className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === '/lists' || pathname?.startsWith('/lists/')
                  ? 'bg-white/10 text-white' 
                  : 'text-text-muted-dark hover:bg-white/5 hover:text-white'
              }`}
            >
              My Lists
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
