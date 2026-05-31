'use client';

import Link from "next/link";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { LiveSearchInput } from "@/components/ui/LiveSearchInput";

interface NavbarProps {
  showSearch?: boolean;
}

export function Navbar({ showSearch = true }: NavbarProps) {
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    setMobileMenuOpen(false);
    window.location.href = '/';
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-surface-dark/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8 h-full">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display text-xl font-bold tracking-widest text-primary-500 hover:text-white transition-colors">
                FILM-DB
              </span>
            </Link>
            <div className="hidden md:block h-full">
              <ul className="flex items-stretch h-full text-xs font-display tracking-widest text-text-muted-dark uppercase border-l border-white/10">
                <li className="flex">
                  <Link href="/movies" className="flex items-center px-5 border-r border-white/10 hover:text-primary-500 hover:bg-white/5 transition-all">
                    Movies
                  </Link>
                </li>
                <li className="flex">
                  <Link href="/movies/genres" className="flex items-center px-5 border-r border-white/10 hover:text-primary-500 hover:bg-white/5 transition-all">
                    Genres
                  </Link>
                </li>
                <li className="flex">
                  <Link href="/people" className="flex items-center px-5 border-r border-white/10 hover:text-primary-500 hover:bg-white/5 transition-all">
                    People
                  </Link>
                </li>
                <li className="flex">
                  <Link href="/search" className="flex items-center px-5 border-r border-white/10 hover:text-primary-500 hover:bg-white/5 transition-all">
                    Search
                  </Link>
                </li>
                {user && (
                  <li className="flex">
                    <Link href="/lists" className="flex items-center px-5 border-r border-white/10 hover:text-primary-500 hover:bg-white/5 transition-all">
                      Lists
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {showSearch && (
              <div className="hidden sm:block w-64">
                <LiveSearchInput variant="navbar" placeholder="Search films..." />
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-none border border-primary-500/30 bg-surface-elevated-dark px-3 py-1.5 text-xs font-display uppercase tracking-wider text-white hover:border-primary-500 transition-all focus:outline-none"
                  >
                    <UserIcon className="h-3.5 w-3.5 text-primary-500" />
                    <span className="hidden sm:inline-block max-w-[100px] truncate">{user.displayName || user.username}</span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-none bg-surface-elevated-dark border border-white/10 shadow-2xl focus:outline-none z-50">
                      <div className="py-1 border border-primary-500/20">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-xs font-display uppercase tracking-widest text-white hover:bg-white/5 hover:text-primary-500 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Your Profile
                        </Link>
                        {user.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-xs font-display uppercase tracking-widest text-white hover:bg-white/5 hover:text-primary-500 transition-colors"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-xs font-display uppercase tracking-widest text-red-400 hover:bg-red-400/10 transition-colors border-t border-white/5 mt-1 pt-2"
                        >
                          <span className="flex items-center gap-2">
                            <LogOut className="h-3.5 w-3.5" />
                            Sign out
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:flex h-9 items-center justify-center rounded-none border border-primary-500 px-4 text-xs font-display uppercase tracking-widest text-primary-500 hover:bg-primary-500 hover:text-surface-dark transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="flex h-9 items-center justify-center rounded-none border border-yellow-accent px-4 text-xs font-display uppercase tracking-widest text-yellow-accent hover:bg-yellow-accent hover:text-surface-dark transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              )}
              
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-none md:hidden border border-white/10 hover:border-primary-500 hover:bg-white/5 transition-all text-white"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex bg-black/80 backdrop-blur-sm">
          <div className="w-64 bg-surface-dark border-r border-white/10 p-6 flex flex-col justify-between h-full shadow-2xl rounded-none">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-sm font-bold tracking-widest text-primary-500">
                  FILM-DB
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-none p-1.5 border border-white/10 hover:border-primary-500 text-white transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ul className="flex flex-col gap-4 text-xs font-display uppercase tracking-widest text-text-muted-dark">
                <li>
                  <Link href="/movies" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary-500 block py-2 transition-colors border-b border-white/5">
                    Movies
                  </Link>
                </li>
                <li>
                  <Link href="/movies/genres" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary-500 block py-2 transition-colors border-b border-white/5">
                    Genres
                  </Link>
                </li>
                <li>
                  <Link href="/people" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary-500 block py-2 transition-colors border-b border-white/5">
                    People
                  </Link>
                </li>
                <li>
                  <Link href="/search" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary-500 block py-2 transition-colors border-b border-white/5">
                    Search
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link href="/lists" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary-500 block py-2 transition-colors border-b border-white/5">
                      Lists
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            <div className="border-t border-white/5 pt-6 mt-auto">
              {user ? (
                <div className="space-y-4">
                  <div className="text-xs font-display uppercase tracking-wider text-white flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-primary-500" />
                    <span className="truncate">{user.displayName || user.username}</span>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs font-display uppercase tracking-widest text-primary-500 hover:text-primary-400 font-medium py-1"
                  >
                    Your Profile
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-xs font-display uppercase tracking-widest text-primary-500 hover:text-primary-400 font-medium py-1"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-xs font-display uppercase tracking-widest text-red-400 hover:text-red-300 font-medium w-full text-left py-1"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-9 items-center justify-center rounded-none border border-primary-500 text-xs font-display uppercase tracking-widest text-primary-500 hover:bg-primary-500 hover:text-surface-dark transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-9 items-center justify-center rounded-none border border-yellow-accent text-xs font-display uppercase tracking-widest text-yellow-accent hover:bg-yellow-accent hover:text-surface-dark transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
          {/* Overlay click closer */}
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
}
