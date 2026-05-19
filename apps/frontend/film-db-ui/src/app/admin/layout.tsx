'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  const { logout } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    console.log(user);
    if (!token || !user) {
      router.push('/login');
    } else if (user.role !== 'ADMIN') {
      router.push('/');
    } else {
      setIsAuthorized(true);
    }
  }, [user, token, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-surface-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-dark text-white flex flex-col">
      <nav className="border-b border-white/10 bg-elevated/50 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold font-display text-primary-400">
          <Link href="/admin">Admin Dashboard</Link>
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-text-muted-dark">Welcome, {user?.username}</span>
          <button 
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="p-6 flex-grow">
        {children}
      </main>
    </div>
  );
}
