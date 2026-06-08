'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const { login, loginAdmin, isLoggingIn, isLoggingInAdmin, loginError, loginAdminError } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      if (isAdminLogin) {
        await loginAdmin(data);
        router.push('/admin');
      } else {
        await login(data);
        router.push('/');
      }
    } catch (error) {
      // Error is handled by useAuth or can be displayed here
      console.error('Login failed', error);
    }
  };

  const currentIsLoggingIn = isAdminLogin ? isLoggingInAdmin : isLoggingIn;
  const currentError = isAdminLogin ? loginAdminError : loginError;

  return (
    <div 
      className="flex min-h-screen items-center justify-center bg-surface-dark px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ 
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px)', 
        backgroundSize: '20px 20px' 
      }}
    >
      {/* Scanline atmospheric effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_95%,rgba(255,255,255,0.02)_95%)] bg-[size:100%_40px] pointer-events-none" />

      <div className="relative w-full max-w-md bg-black/40 border border-white/10 p-8 shadow-2xl backdrop-blur-md rounded-none font-mono">
        
        {/* Console Header Bar */}
        <div className="absolute top-0 left-0 right-0 h-9 bg-black/60 border-b border-white/10 flex items-center justify-between px-4 select-none">
          <div className="flex items-center gap-2 text-[10px] text-white/50 tracking-wider">
            <span className="w-1.5 h-1.5 bg-cyan-accent animate-pulse" />
            <span>SECURE_AUTH_GATEWAY.EXE</span>
          </div>
          <Link 
            href="/" 
            className="text-[10px] text-text-muted-dark hover:text-red-accent transition-colors font-bold px-1.5 py-0.5 border border-transparent hover:border-red-accent/30 hover:bg-red-accent/15"
          >
            ESC [X]
          </Link>
        </div>

        <div className="mt-4 pt-2">
          <h2 className="text-center text-xl font-bold tracking-widest text-white uppercase mb-2">
            // SIGN_IN_TO_SYSTEM
          </h2>
          <p className="text-center text-xs text-text-muted-dark mb-6">
            NO ACCOUNT REGISTERED?{' '}
            <Link href="/register" className="font-bold text-yellow-accent hover:underline hover:text-yellow-accent/80 transition-colors">
              INITIALIZE_REGISTRATION
            </Link>
          </p>
        </div>

        {/* Toggle between User and Admin terminal tab-style */}
        <div className="flex flex-col sm:flex-row border border-white/10 bg-black/20 p-1 mb-6 rounded-none gap-1 sm:gap-0">
          <button
            type="button"
            onClick={() => setIsAdminLogin(false)}
            className={`flex-1 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-200 rounded-none cursor-pointer text-center ${
              !isAdminLogin 
                ? 'bg-cyan-accent text-surface-dark font-black shadow-[0_0_8px_rgba(85,234,212,0.3)]' 
                : 'text-text-muted-dark hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="whitespace-nowrap">USER_ACCESS</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAdminLogin(true)}
            className={`flex-1 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-200 rounded-none cursor-pointer text-center ${
              isAdminLogin 
                ? 'bg-cyan-accent text-surface-dark font-black shadow-[0_0_8px_rgba(85,234,212,0.3)]' 
                : 'text-text-muted-dark hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="whitespace-nowrap">ADMIN_ACCESS</span>
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest text-text-muted-dark">
                // ENTER_USERNAME
              </label>
              <div className="relative flex items-center border border-white/10 bg-black/30 hover:border-white/20 focus-within:border-cyan-accent focus-within:ring-1 focus-within:ring-cyan-accent transition-all duration-200">
                <span className="pl-3 pr-1 text-cyan-accent font-bold select-none">&gt;</span>
                <input
                  {...register('username')}
                  type="text"
                  className="w-full bg-transparent border-0 px-2 py-2 text-white placeholder-white/20 focus:outline-none focus:ring-0 text-sm font-mono"
                  placeholder="username_id"
                />
              </div>
              {errors.username && (
                <p className="text-[10px] text-red-accent mt-1 tracking-wide font-mono">// ERROR: {errors.username.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest text-text-muted-dark">
                // ENTER_PASSWORD
              </label>
              <div className="relative flex items-center border border-white/10 bg-black/30 hover:border-white/20 focus-within:border-cyan-accent focus-within:ring-1 focus-within:ring-cyan-accent transition-all duration-200">
                <span className="pl-3 pr-1 text-cyan-accent font-bold select-none">&gt;</span>
                <input
                  {...register('password')}
                  type="password"
                  className="w-full bg-transparent border-0 px-2 py-2 text-white placeholder-white/20 focus:outline-none focus:ring-0 text-sm font-mono"
                  placeholder="••••••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-[10px] text-red-accent mt-1 tracking-wide font-mono">// ERROR: {errors.password.message}</p>
              )}
            </div>
          </div>
          
          {currentError && (
            <div className="text-[11px] text-red-accent bg-red-accent/10 p-2.5 rounded-none border border-red-accent/20 font-mono tracking-wide">
              SYSTEM_ERROR: {isAdminLogin ? 'INVALID ADMIN CREDENTIALS OR ACCESS DENIED.' : 'INVALID USERNAME OR PASSWORD.'}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={currentIsLoggingIn}
              className="group relative flex w-full justify-center border border-cyan-accent bg-cyan-accent py-2 px-4 text-xs font-bold uppercase tracking-widest text-surface-dark hover:bg-transparent hover:text-cyan-accent focus:outline-none focus:ring-1 focus:ring-cyan-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-none shadow-[0_0_8px_rgba(85,234,212,0.2)] hover:shadow-[0_0_16px_rgba(85,234,212,0.5)] cursor-pointer"
            >
              {currentIsLoggingIn ? 'EXECUTE_AUTHENTICATION...' : 'EXECUTE_AUTHENTICATION'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
