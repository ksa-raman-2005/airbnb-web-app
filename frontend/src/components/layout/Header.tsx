'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Globe,
  Menu,
  User as UserIcon,
  Heart,
  Luggage,
  Home,
  PlusCircle,
  Check,
  Sparkles,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import SearchExpandedModal from '@/components/search/SearchExpandedModal';

interface HeaderProps {
  onOpenFilters?: () => void;
  filterCount?: number;
}

export default function Header({ onOpenFilters, filterCount = 0 }: HeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, allUsers, switchUser } = useUser();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

function HeaderSearchPills({ onClick }: { onClick: () => void }) {
  const searchParams = useSearchParams();
  const locationParam = searchParams?.get('location');
  const checkInParam = searchParams?.get('check_in');
  const checkOutParam = searchParams?.get('check_out');
  const guestsParam = searchParams?.get('guests');

  return (
    <div
      onClick={onClick}
      className="flex items-center divide-x divide-neutral-200 border border-neutral-300 rounded-full shadow-sm hover:shadow-airbnb transition cursor-pointer py-2 px-3 text-sm"
    >
      <button className="px-3 font-semibold text-neutral-800 hover:text-neutral-900 truncate max-w-[130px]">
        {locationParam || 'Anywhere'}
      </button>
      <button className="px-3 font-semibold text-neutral-800 hover:text-neutral-900 hidden sm:block truncate max-w-[140px]">
        {checkInParam && checkOutParam ? `${checkInParam.slice(5)} - ${checkOutParam.slice(5)}` : 'Any week'}
      </button>
      <div className="flex items-center pl-3 gap-2">
        <span className="text-neutral-500 font-normal hidden md:inline truncate max-w-[110px]">
          {guestsParam ? `${guestsParam} guests` : 'Add guests'}
        </span>
        <div className="w-8 h-8 rounded-full bg-airbnb-brand text-white flex items-center justify-center shrink-0">
          <Search className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
}

function HeaderSearchPillsFallback({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center divide-x divide-neutral-200 border border-neutral-300 rounded-full shadow-sm hover:shadow-airbnb transition cursor-pointer py-2 px-3 text-sm"
    >
      <button className="px-3 font-semibold text-neutral-800 hover:text-neutral-900 truncate max-w-[130px]">
        Anywhere
      </button>
      <button className="px-3 font-semibold text-neutral-800 hover:text-neutral-900 hidden sm:block truncate max-w-[140px]">
        Any week
      </button>
      <div className="flex items-center pl-3 gap-2">
        <span className="text-neutral-500 font-normal hidden md:inline truncate max-w-[110px]">
          Add guests
        </span>
        <div className="w-8 h-8 rounded-full bg-airbnb-brand text-white flex items-center justify-center shrink-0">
          <Search className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
}

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      <div className="max-w-[1760px] mx-auto px-4 sm:px-8 md:px-12 h-20 flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 text-airbnb-brand shrink-0">
          <svg
            className="w-9 h-9 fill-current"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.011.315c0 4.34-3.328 7.806-7.5 7.806-3.13 0-5.877-1.954-7.001-4.805-1.123 2.85-3.87 4.805-7 4.805-4.172 0-7.5-3.466-7.5-7.806 0-1.229.351-2.585 1.116-4.064l.533-1.025c1.954-3.83 6.114-12.54 7.1-14.836l.145-.353C12.537 1.963 13.992 1 16 1zm0 2c-1.24 0-2.279.61-3.35 2.52l-.46 1.002c-1.854 3.633-5.917 12.128-6.908 14.44l-.128.318C4.55 22.443 4.25 23.37 4.25 24.194c0 3.243 2.442 5.806 5.5 5.806 2.766 0 5.093-2.074 5.46-4.887l.04-.383v-4.73h1.5v4.73c.045.333.159.658.336.96l.164.25c.89 1.258 2.378 2.06 4.04 2.06 3.058 0 5.5-2.563 5.5-5.806 0-.824-.3-1.751-.904-2.914l-.128-.318c-.99-2.312-5.054-10.807-6.908-14.44l-.46-1.002C18.279 3.61 17.24 3 16 3zm0 13c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-airbnb-brand hidden lg:inline">
            airbnb
          </span>
        </Link>

        {/* Center: Search Bar Pill with Suspense */}
        <React.Suspense fallback={<HeaderSearchPillsFallback onClick={() => setIsSearchModalOpen(true)} />}>
          <HeaderSearchPills onClick={() => setIsSearchModalOpen(true)} />
        </React.Suspense>

        {/* Right: Actions & User Persona Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/host"
            className="hidden md:flex items-center text-sm font-semibold text-neutral-800 hover:bg-neutral-100 py-2.5 px-3.5 rounded-full transition"
          >
            {currentUser?.role === 'host' || currentUser?.role === 'both' ? 'Host dashboard' : 'Airbnb your home'}
          </Link>

          {/* User Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 border border-neutral-300 rounded-full py-1.5 px-3 hover:shadow-airbnb transition bg-white"
            >
              <Menu className="w-4 h-4 text-neutral-600" />
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-neutral-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-neutral-600 text-white flex items-center justify-center text-xs font-semibold">
                  {currentUser?.name?.charAt(0) || <UserIcon className="w-4 h-4" />}
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-airbnb-modal border border-neutral-100 py-2 text-sm z-50 animate-scale-up">
                {/* Persona Switcher Section */}
                <div className="px-4 py-2 border-b border-neutral-100 bg-neutral-50/70 rounded-t-2xl">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Switch Active Persona
                  </p>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {allUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                          currentUser?.id === u.id
                            ? 'bg-neutral-200/80 font-semibold text-neutral-900'
                            : 'hover:bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-neutral-500 text-white flex items-center justify-center text-[10px]">
                              {u.name[0]}
                            </div>
                          )}
                          <div className="truncate">
                            <span className="block truncate text-xs">{u.name}</span>
                            <span className="block text-[10px] text-neutral-400 capitalize">
                              {u.is_superhost ? '★ Superhost' : u.role}
                            </span>
                          </div>
                        </div>
                        {currentUser?.id === u.id && <Check className="w-3.5 h-3.5 text-airbnb-brand shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="py-1">
                  <Link
                    href="/trips"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-100 font-medium"
                  >
                    <Luggage className="w-4 h-4 text-neutral-500" />
                    My Trips
                  </Link>
                  <Link
                    href="/wishlists"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-100 font-medium"
                  >
                    <Heart className="w-4 h-4 text-neutral-500" />
                    Wishlists
                  </Link>
                </div>

                <div className="border-t border-neutral-100 my-1"></div>

                <div className="py-1">
                  <Link
                    href="/host"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-100 font-medium"
                  >
                    <Home className="w-4 h-4 text-neutral-500" />
                    Host Dashboard
                  </Link>
                  <Link
                    href="/host/create"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-100 font-medium"
                  >
                    <PlusCircle className="w-4 h-4 text-neutral-500" />
                    Create a new listing
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Search Modal */}
      {isSearchModalOpen && (
        <React.Suspense fallback={null}>
          <SearchExpandedModal
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
          />
        </React.Suspense>
      )}
    </header>
  );
}
