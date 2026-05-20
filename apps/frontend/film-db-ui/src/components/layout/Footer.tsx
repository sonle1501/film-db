import Link from "next/link";
import { Film } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface-dark py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="md:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                Film<span className="text-primary-500">DB</span>
              </span>
            </Link>
            <p className="text-sm text-text-muted-dark leading-relaxed max-w-xs">
              Your premium destination for discovering movies, tracking what you've watched, and curating your personal lists.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Discover</h3>
            <ul className="space-y-3 text-sm text-text-muted-dark">
              <li><Link href="/movies" className="hover:text-primary-500 transition-colors">Movies</Link></li>
              <li><Link href="/people" className="hover:text-primary-500 transition-colors">People</Link></li>
              <li><Link href="/trending" className="hover:text-primary-500 transition-colors">Trending</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Community</h3>
            <ul className="space-y-3 text-sm text-text-muted-dark">
              <li><Link href="/lists" className="hover:text-primary-500 transition-colors">User Lists</Link></li>
              <li><Link href="/reviews" className="hover:text-primary-500 transition-colors">Reviews</Link></li>
              <li><Link href="/guidelines" className="hover:text-primary-500 transition-colors">Guidelines</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Account</h3>
            <ul className="space-y-3 text-sm text-text-muted-dark">
              <li><Link href="/login" className="hover:text-primary-500 transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-primary-500 transition-colors">Sign Up</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between border-t border-white/5 pt-8 md:flex-row">
          <p className="text-xs text-text-muted-dark">
            &copy; {new Date().getFullYear()} FilmDB. All rights reserved.
          </p>
          <div className="mt-4 flex gap-4 md:mt-0">
            <Link href="/privacy" className="text-xs text-text-muted-dark hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-text-muted-dark hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
