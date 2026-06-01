'use client';

import Link from "next/link";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect } from "react";

interface NavbarProps {
  showSearch?: boolean;
}

export function Navbar({ showSearch = true }: NavbarProps) {
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-surface-dark/95 backdrop-blur-md h-20">
      <div className="mx-auto flex h-full max-w-7xl items-stretch justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LEFT: Film-DB Logo in Full-Height Mini HUD + Large Hacker Line */}
        <div className="flex items-stretch gap-6 h-full">
          {/* FILM-DB Logo in a mini HUD filling full height */}
          <Link href="/" className="flex items-stretch focus:outline-none border-r border-white/10 h-full">
            <div className="bg-black/20 hover:bg-white/5 px-8 flex flex-col justify-center gap-1 transition-all duration-200 select-none h-full font-mono">
              <div className="flex items-center gap-1.5 text-white text-[9px] uppercase tracking-widest font-semibold">
                <span className="w-1.5 h-1.5 bg-cyan-accent animate-pulse"></span>
                SYS-MAIN
              </div>
              <div className="font-bold text-base tracking-[0.4em] text-[#55ead4]">
                FILM-DB
              </div>
            </div>
          </Link>

          {/* Hacker line of code (to the right of the logo, still on the left side of the navbar) */}
          <div className="hidden md:flex items-center pl-2 h-full">
            <div className="flex flex-col font-mono italic">
              <span className="text-[12px] text-[#f3e600] font-semibold tracking-wider">
                for (;;)
              </span>
              <span className="text-[12px] text-white/60 ml-2 tracking-wider">
                  keep_learning()
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Login / Profile section (No decorators) */}
        <div className="flex items-stretch border-l border-white/10">
          {user ? (
            <div className="relative flex items-stretch" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex flex-col justify-center px-10 h-full font-mono text-left bg-surface-dark/40 hover:bg-white/5 transition-all duration-200 border-r border-white/10 focus:outline-none cursor-pointer group select-none"
              >
                <div className="flex items-center gap-1.5 text-cyan-accent text-[10px] uppercase tracking-widest font-semibold group-hover:text-white transition-colors">
                  <span className="inline-block w-1.5 h-1.5 bg-cyan-accent cursor-blink"></span>
                  ACTIVE...
                </div>
                <div className="text-white text-sm font-bold tracking-wider truncate max-w-[160px] uppercase mt-1">
                  {user.displayName || user.username}
                </div>
                <div className="text-[11px] text-text-muted-dark tracking-widest uppercase mt-0.5">
                  ROLE: {user.role || 'USER'}
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-20 w-56 origin-top-right rounded-none bg-surface-elevated-dark border border-white/10 shadow-2xl focus:outline-none z-50">
                  <div className="py-1.5 border border-cyan-accent/20 font-mono text-xs">
                    <div className="px-4 py-2 border-b border-white/5 text-[9px] text-text-muted-dark uppercase tracking-widest select-none">
                      -- SESSION TERMINAL --
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-3 text-white hover:bg-white/5 hover:text-cyan-accent transition-colors duration-150"
                      onClick={() => setDropdownOpen(false)}
                    >
                      &gt; YOUR_PROFILE
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-3 text-white hover:bg-white/5 hover:text-cyan-accent transition-colors duration-150"
                        onClick={() => setDropdownOpen(false)}
                      >
                        &gt; ADMIN_DASHBOARD
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-red-accent hover:bg-red-accent/10 transition-colors duration-150 border-t border-white/5 mt-1 pt-2.5 cursor-pointer"
                    >
                      &gt; SHUTDOWN_SESSION
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-stretch h-full">
              <Link
                href="/login"
                className="flex items-center justify-center px-8 h-full border-r border-white/10 text-xs font-mono uppercase tracking-widest text-cyan-accent hover:bg-cyan-accent hover:text-surface-dark transition-all duration-300 font-bold"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center justify-center px-8 h-full border-r border-white/10 text-xs font-mono uppercase tracking-widest text-yellow-accent hover:bg-yellow-accent hover:text-surface-dark transition-all duration-300 font-bold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
