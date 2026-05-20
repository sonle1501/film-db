import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative min-h-[85vh] w-full flex items-center justify-center overflow-hidden">
      {/* Background Image Setup */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-dark via-surface-dark/50 to-transparent z-10" />
        {/* Placeholder for dynamic hero image. 
            A solid deep color or abstract pattern for now since we don't have a specific movie poster 
            Wait, I'll use a CSS gradient as a placeholder until actual images are loaded from API */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-900/40 via-surface-dark to-surface-dark z-0" />
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] mix-blend-screen z-0" />
      </div>

      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex flex-col items-start mt-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-6 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
          <span className="text-xs font-medium text-white/80">Now featuring over 1M+ movies</span>
        </div>
        
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-3xl leading-[1.1]">
          Discover Your Next <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-600">Favorite Film.</span>
        </h1>
        
        <p className="mt-6 max-w-xl text-lg sm:text-xl text-text-muted-dark leading-relaxed">
          Explore the world's most comprehensive movie database. Track what you've watched, save what you want to see, and curate custom lists.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/movies"
            className="flex h-12 sm:h-14 items-center justify-center gap-2 rounded-full bg-primary-600 px-8 text-base font-medium text-white hover:bg-primary-500 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)]"
          >
            <Play className="h-5 w-5 fill-current" />
            Start Exploring
          </Link>
          <Link
            href="/register"
            className="flex h-12 sm:h-14 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 text-base font-medium text-white hover:bg-white/10 backdrop-blur-md transition-all hover:scale-[1.02] active:scale-95"
          >
            Create Free Account
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
