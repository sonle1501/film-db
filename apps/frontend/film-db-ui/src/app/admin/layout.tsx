'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, isInitializing } = useAuthStore();
  const { logout } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isInitializing) return;

    if (!token || !user) {
      router.push('/login');
    } else if (user.role !== 'ADMIN') {
      router.push('/');
    } else {
      setIsAuthorized(true);
    }
  }, [user, token, router, isInitializing]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isInitializing || !isAuthorized) {
    return (
      <div className="min-h-screen bg-surface-dark flex items-center justify-center font-mono text-xs text-cyan-accent">
        <div className="flex items-center gap-2 uppercase tracking-widest">
          <span>Initializing system security authentication...</span>
          <span className="inline-block h-3.5 w-1.5 bg-cyan-accent cursor-blink"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-dark text-white flex flex-col">
      <nav className="border-b border-white/10 bg-surface-dark px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-4 justify-between sm:items-center rounded-none shadow-md">
        <h1 className="text-lg sm:text-xl font-bold font-display text-cyan-accent uppercase tracking-widest">
          <Link href="/admin">&gt; ADMIN_DASHBOARD</Link>
        </h1>
        <div className="flex flex-wrap items-center gap-4 justify-between sm:justify-end">
          <span className="text-xs font-mono font-bold uppercase text-text-muted-dark truncate max-w-[150px] sm:max-w-none">Welcome, {user?.username}</span>
          <button 
            onClick={handleLogout}
            className="text-xs font-mono font-bold uppercase text-red-accent hover:bg-red-accent/10 border border-red-accent/30 hover:border-red-accent px-3 py-1.5 rounded-none transition-all cursor-pointer"
          >
            [ LOGOUT ]
          </button>
        </div>
      </nav>
      <main className="p-6 flex-grow">
        {children}
      </main>
    </div>
  );
}
