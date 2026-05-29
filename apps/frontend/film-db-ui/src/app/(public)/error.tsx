'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Public route boundary caught error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="rounded-full bg-red-500/10 p-4 border border-red-500/20 mb-6 animate-pulse">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="text-3xl font-display font-bold text-white tracking-tight mb-2">
        Something went wrong
      </h2>
      <p className="text-lg text-text-muted-dark max-w-md mb-8">
        We encountered an error while loading this page. This could be due to a connection issue or temporary server delay.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 hover:bg-white/5 text-gray-300 text-sm font-semibold transition-colors"
        >
          <Home className="h-4 w-4" />
          Return Home
        </Link>
      </div>
    </div>
  );
}
