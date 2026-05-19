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
    <div className="flex min-h-screen items-center justify-center bg-surface-dark px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white/5 p-8 border border-white/10 backdrop-blur-md shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-display font-bold tracking-tight text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-text-muted-dark">
            Or{' '}
            <Link href="/register" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
              create a new account
            </Link>
          </p>
        </div>
        <div className="flex justify-center space-x-4 mb-6">
          <button
            type="button"
            onClick={() => setIsAdminLogin(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!isAdminLogin ? 'bg-primary-600 text-white' : 'bg-white/10 text-text-muted-dark hover:bg-white/20'}`}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => setIsAdminLogin(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isAdminLogin ? 'bg-primary-600 text-white' : 'bg-white/10 text-text-muted-dark hover:bg-white/20'}`}
          >
            Admin
          </button>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <input
                {...register('username')}
                type="text"
                className="relative block w-full rounded-md border border-white/10 bg-elevated/50 px-3 py-2 text-white placeholder-text-muted-dark focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm transition-colors"
                placeholder="Username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
              )}
            </div>
            <div>
              <input
                {...register('password')}
                type="password"
                className="relative block w-full rounded-md border border-white/10 bg-elevated/50 px-3 py-2 text-white placeholder-text-muted-dark focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm transition-colors"
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>
          </div>
          
          {currentError && (
            <div className="text-sm text-red-400 text-center bg-red-400/10 p-2 rounded-md border border-red-400/20">
              {isAdminLogin ? 'Invalid admin credentials or not an admin.' : 'Invalid username or password.'}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={currentIsLoggingIn}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {currentIsLoggingIn ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
