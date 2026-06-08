import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface-dark py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="md:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="font-display text-xl font-bold tracking-widest text-primary-500">
                FILM-DB
              </span>
            </Link>
            <p className="text-xs text-text-muted-dark leading-relaxed max-w-xs font-sans">
              A movies database project with cyberpunk theme. Provie a customize search engine
            </p>
            <div className="mt-4 font-display text-[10px] text-yellow-accent/70 tracking-widest uppercase">
              IMDb non-comercial dataset
            </div>
          </div>
          
          <div>
            <h3 className="font-display text-xs font-bold tracking-widest text-white uppercase mb-4">// DISCOVER</h3>
            <ul className="space-y-3 text-xs font-display tracking-wider text-text-muted-dark uppercase">
              <li><Link href="/movies" className="hover:text-primary-500 transition-colors">Movies</Link></li>
              <li><Link href="/people" className="hover:text-primary-500 transition-colors">People</Link></li>
              <li><Link href="/search" className="hover:text-primary-500 transition-colors">Search</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display text-xs font-bold tracking-widest text-white uppercase mb-4">// ACCESS</h3>
            <ul className="space-y-3 text-xs font-display tracking-wider text-text-muted-dark uppercase">
              <li><Link href="/login" className="hover:text-primary-500 transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-primary-500 transition-colors">Sign Up</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between border-t border-white/10 pt-8 md:flex-row gap-4">
          <div className="flex flex-col md:items-start gap-1">
            <p className="text-[10px] font-display text-text-muted-dark uppercase tracking-widest">
              &copy; {new Date().getFullYear()} FILM-DB
            </p>
            <p className="text-[9px] font-display text-primary-500/50 tracking-wider">
              SERVER_STATUS: ONLINE // DATASETS: IMDb_OFFICIAL
            </p>
          </div>
          <div className="flex gap-6 font-display text-[10px] tracking-widest uppercase">
            <Link href="/privacy" className="text-text-muted-dark hover:text-white transition-colors">
              [ PRIVACY ]
            </Link>
            <Link href="/terms" className="text-text-muted-dark hover:text-white transition-colors">
              [ TERMS ]
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
