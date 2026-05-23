'use client';

import Link from "next/link";
import { Search, Menu, LogOut, User as UserIcon } from "lucide-react";
import Form from "next/form";
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
              <Form action="/search" className="relative group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted-dark group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search films, people..."
                  className="w-full rounded-full bg-elevated/50 border border-white/10 py-2 pl-10 pr-4 text-sm text-white placeholder-text-muted-dark focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </Form>
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
            
            <button className="flex h-9 w-9 items-center justify-center rounded-full md:hidden hover:bg-elevated transition-colors text-white">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
