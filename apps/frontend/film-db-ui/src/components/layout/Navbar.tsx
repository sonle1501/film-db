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
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-surface-dark/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                Film<span className="text-primary-500">DB</span>
              </span>
            </Link>
            <div className="hidden md:block">
              <ul className="flex items-center gap-6 text-sm font-medium text-text-muted-dark">
                <li>
                  <Link href="/movies" className="hover:text-white transition-colors">
                    Movies
                  </Link>
                </li>
                <li>
                  <Link href="/movies/genres" className="hover:text-white transition-colors">
                    Genres
                  </Link>
                </li>
                <li>
                  <Link href="/people" className="hover:text-white transition-colors">
                    People
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="hover:text-white transition-colors">
                    Search
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link href="/lists" className="hover:text-white transition-colors">
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
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-elevated/50 px-3 py-1.5 text-sm font-medium text-white hover:bg-elevated transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-dark"
                  >
                    <UserIcon className="h-4 w-4 text-primary-400" />
                    <span className="hidden sm:inline-block max-w-[100px] truncate">{user.displayName || user.username}</span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-surface border border-white/10 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-white hover:bg-elevated transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Your Profile
                        </Link>
                        {user.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-white hover:bg-elevated transition-colors"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <LogOut className="h-4 w-4" />
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
                    className="hidden sm:flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium text-white hover:bg-elevated transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="flex h-9 items-center justify-center rounded-full bg-primary-600 px-4 text-sm font-medium text-white hover:bg-primary-500 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
              
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full md:hidden hover:bg-elevated transition-colors text-white"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-64 bg-surface-dark border-r border-white/10 p-6 flex flex-col justify-between h-full shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-xl font-bold text-white">
                  Film<span className="text-primary-500">DB</span>
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full p-1.5 hover:bg-white/10 text-white transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ul className="flex flex-col gap-4 text-sm font-medium text-text-muted-dark">
                <li>
                  <Link href="/movies" onClick={() => setMobileMenuOpen(false)} className="hover:text-white block py-2 transition-colors">
                    Movies
                  </Link>
                </li>
                <li>
                  <Link href="/movies/genres" onClick={() => setMobileMenuOpen(false)} className="hover:text-white block py-2 transition-colors">
                    Genres
                  </Link>
                </li>
                <li>
                  <Link href="/people" onClick={() => setMobileMenuOpen(false)} className="hover:text-white block py-2 transition-colors">
                    People
                  </Link>
                </li>
                <li>
                  <Link href="/search" onClick={() => setMobileMenuOpen(false)} className="hover:text-white block py-2 transition-colors">
                    Search
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link href="/lists" onClick={() => setMobileMenuOpen(false)} className="hover:text-white block py-2 transition-colors">
                      Lists
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            <div className="border-t border-white/5 pt-6 mt-auto">
              {user ? (
                <div className="space-y-4">
                  <div className="text-sm font-medium text-white flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-primary-400" />
                    <span className="truncate">{user.displayName || user.username}</span>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-primary-400 hover:text-primary-300 font-medium py-1"
                  >
                    Your Profile
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-sm text-primary-400 hover:text-primary-300 font-medium py-1"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 font-medium w-full text-left py-1"
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
                    className="flex h-9 items-center justify-center rounded-full border border-white/10 text-sm font-medium text-white hover:bg-elevated transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-9 items-center justify-center rounded-full bg-primary-600 text-sm font-medium text-white hover:bg-primary-500 transition-colors"
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
