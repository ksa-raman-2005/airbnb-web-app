'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Plus,
  Minus,
  X,
  Sparkles,
  Compass,
  Building2,
  Trees,
  Sun
} from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, isAfter, startOfToday, addDays } from 'date-fns';

interface SearchExpandedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'where' | 'dates' | 'who';

const POPULAR_DESTINATIONS = [
  { name: "I'm flexible", query: "", icon: Sparkles, color: "text-amber-500" },
  { name: "Italy", query: "Italy", icon: Sun, color: "text-rose-500" },
  { name: "Japan", query: "Japan", icon: Building2, color: "text-red-500" },
  { name: "United States", query: "United States", icon: Compass, color: "text-blue-500" },
  { name: "France", query: "France", icon: Building2, color: "text-indigo-500" },
  { name: "Tropical Escapes", query: "Bali Tulum Maui", icon: Trees, color: "text-emerald-500" },
];

export default function SearchExpandedModal({ isOpen, onClose }: SearchExpandedModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabType>('where');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [checkIn, setCheckIn] = useState<Date | null>(
    searchParams.get('check_in') ? new Date(searchParams.get('check_in')!) : null
  );
  const [checkOut, setCheckOut] = useState<Date | null>(
    searchParams.get('check_out') ? new Date(searchParams.get('check_out')!) : null
  );

  const [adults, setAdults] = useState(parseInt(searchParams.get('adults') || '1', 10));
  const [children, setChildren] = useState(parseInt(searchParams.get('children') || '0', 10));
  const [infants, setInfants] = useState(parseInt(searchParams.get('infants') || '0', 10));
  const [pets, setPets] = useState(parseInt(searchParams.get('pets') || '0', 10));

  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (!isOpen) return null;

  const totalGuests = adults + children;

  const handleDateClick = (day: Date) => {
    const today = startOfToday();
    if (isBefore(day, today)) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(day);
      setCheckOut(null);
    } else if (checkIn && !checkOut) {
      if (isBefore(day, checkIn)) {
        setCheckIn(day);
      } else {
        setCheckOut(day);
        setActiveTab('who');
      }
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (location.trim()) {
      params.set('location', location.trim());
    } else {
      params.delete('location');
    }

    if (checkIn) {
      params.set('check_in', format(checkIn, 'yyyy-MM-dd'));
    } else {
      params.delete('check_in');
    }

    if (checkOut) {
      params.set('check_out', format(checkOut, 'yyyy-MM-dd'));
    } else {
      params.delete('check_out');
    }

    if (totalGuests > 1) {
      params.set('guests', totalGuests.toString());
      params.set('adults', adults.toString());
      if (children > 0) params.set('children', children.toString());
      if (infants > 0) params.set('infants', infants.toString());
      if (pets > 0) params.set('pets', pets.toString());
    } else {
      params.delete('guests');
      params.delete('adults');
      params.delete('children');
      params.delete('infants');
      params.delete('pets');
    }

    router.push(`/?${params.toString()}`);
    onClose();
  };

  const clearAll = () => {
    setLocation('');
    setCheckIn(null);
    setCheckOut(null);
    setAdults(1);
    setChildren(0);
    setInfants(0);
    setPets(0);
  };

  // Render month calendar helper
  const renderMonth = (monthDate: Date) => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start, end });
    const firstDayIndex = start.getDay(); // 0 = Sunday

    const today = startOfToday();

    return (
      <div className="w-full">
        <h3 className="text-center font-semibold text-neutral-800 mb-4">
          {format(monthDate, 'MMMM yyyy')}
        </h3>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-neutral-400 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {/* Empty spacer cells */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}

          {days.map(day => {
            const isPast = isBefore(day, today);
            const isStart = checkIn && isSameDay(day, checkIn);
            const isEnd = checkOut && isSameDay(day, checkOut);
            const isInRange =
              checkIn && checkOut && isAfter(day, checkIn) && isBefore(day, checkOut);

            let dayClasses = 'h-10 w-full rounded-full flex items-center justify-center text-sm font-medium transition cursor-pointer ';

            if (isPast) {
              dayClasses += 'text-neutral-300 cursor-not-allowed';
            } else if (isStart || isEnd) {
              dayClasses += 'bg-neutral-900 text-white font-semibold';
            } else if (isInRange) {
              dayClasses += 'bg-neutral-100 text-neutral-900 rounded-none';
            } else {
              dayClasses += 'text-neutral-800 hover:bg-neutral-100';
            }

            return (
              <button
                key={day.toISOString()}
                disabled={isPast}
                onClick={() => handleDateClick(day)}
                className={dayClasses}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-start items-center pt-8 px-4 animate-fade-in overflow-y-auto">
      {/* Modal Card */}
      <div className="bg-white rounded-3xl shadow-airbnb-modal max-w-4xl w-full border border-neutral-100 overflow-hidden mb-12">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-6 text-sm font-semibold">
            <button className="text-neutral-900 border-b-2 border-neutral-900 pb-1">
              Stays
            </button>
            <button className="text-neutral-400 hover:text-neutral-700 transition pb-1">
              Experiences
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls (Search Bar Expanded) */}
        <div className="p-4 bg-neutral-100 flex flex-col md:flex-row items-stretch rounded-2xl mx-6 my-4 border border-neutral-200 divide-y md:divide-y-0 md:divide-x divide-neutral-200">
          {/* Where */}
          <div
            onClick={() => setActiveTab('where')}
            className={`flex-1 p-3 rounded-xl cursor-pointer transition ${
              activeTab === 'where' ? 'bg-white shadow-md' : 'hover:bg-neutral-200/50'
            }`}
          >
            <span className="block text-xs font-bold text-neutral-800">Where</span>
            <input
              type="text"
              placeholder="Search destinations"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-neutral-900 outline-hidden placeholder:text-neutral-400"
            />
          </div>

          {/* When */}
          <div
            onClick={() => setActiveTab('dates')}
            className={`flex-1 p-3 rounded-xl cursor-pointer transition ${
              activeTab === 'dates' ? 'bg-white shadow-md' : 'hover:bg-neutral-200/50'
            }`}
          >
            <span className="block text-xs font-bold text-neutral-800">When</span>
            <span className="text-sm font-medium text-neutral-900 truncate block">
              {checkIn && checkOut
                ? `${format(checkIn, 'MMM d')} – ${format(checkOut, 'MMM d')}`
                : checkIn
                ? `${format(checkIn, 'MMM d')} – Select checkout`
                : 'Add dates'}
            </span>
          </div>

          {/* Who */}
          <div
            onClick={() => setActiveTab('who')}
            className={`flex-1 p-3 rounded-xl cursor-pointer transition flex items-center justify-between ${
              activeTab === 'who' ? 'bg-white shadow-md' : 'hover:bg-neutral-200/50'
            }`}
          >
            <div>
              <span className="block text-xs font-bold text-neutral-800">Who</span>
              <span className="text-sm font-medium text-neutral-900 truncate block">
                {totalGuests > 0 ? `${totalGuests} guest${totalGuests > 1 ? 's' : ''}` : 'Add guests'}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSearch();
              }}
              className="btn-airbnb flex items-center gap-2 px-5 py-3 rounded-full text-white font-semibold text-sm shadow-md"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="p-6 md:p-8 min-h-[320px] bg-white">
          {/* TAB 1: WHERE */}
          {activeTab === 'where' && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">
                Search by region or popular spot
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {POPULAR_DESTINATIONS.map(dest => {
                  const Icon = dest.icon;
                  return (
                    <button
                      key={dest.name}
                      onClick={() => {
                        setLocation(dest.query);
                        setActiveTab('dates');
                      }}
                      className="flex items-center gap-3 p-3.5 rounded-2xl border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 text-left transition group"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 group-hover:bg-neutral-200 ${dest.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-semibold text-neutral-800 group-hover:text-neutral-900">
                        {dest.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: DATES */}
          {activeTab === 'dates' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Select your travel dates
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const today = startOfToday();
                      setCheckIn(today);
                      setCheckOut(addDays(today, 3));
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border border-neutral-200 hover:border-neutral-900"
                  >
                    This Weekend
                  </button>
                  <button
                    onClick={() => {
                      const today = startOfToday();
                      setCheckIn(addDays(today, 7));
                      setCheckOut(addDays(today, 14));
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border border-neutral-200 hover:border-neutral-900"
                  >
                    Next Week
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {renderMonth(currentMonth)}
                {renderMonth(addMonths(currentMonth, 1))}
              </div>
            </div>
          )}

          {/* TAB 3: WHO */}
          {activeTab === 'who' && (
            <div className="max-w-md mx-auto divide-y divide-neutral-100">
              {/* Adults */}
              <div className="py-4 flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-semibold text-neutral-900">Adults</h5>
                  <p className="text-xs text-neutral-500">Ages 13 or above</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    disabled={adults <= 1}
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 disabled:opacity-30 hover:border-neutral-800"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{adults}</span>
                  <button
                    onClick={() => setAdults(adults + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="py-4 flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-semibold text-neutral-900">Children</h5>
                  <p className="text-xs text-neutral-500">Ages 2–12</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    disabled={children <= 0}
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 disabled:opacity-30 hover:border-neutral-800"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{children}</span>
                  <button
                    onClick={() => setChildren(children + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="py-4 flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-semibold text-neutral-900">Infants</h5>
                  <p className="text-xs text-neutral-500">Under 2</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    disabled={infants <= 0}
                    onClick={() => setInfants(Math.max(0, infants - 1))}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 disabled:opacity-30 hover:border-neutral-800"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{infants}</span>
                  <button
                    onClick={() => setInfants(infants + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Pets */}
              <div className="py-4 flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-semibold text-neutral-900">Pets</h5>
                  <p className="text-xs text-neutral-500">Bringing a service animal?</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    disabled={pets <= 0}
                    onClick={() => setPets(Math.max(0, pets - 1))}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 disabled:opacity-30 hover:border-neutral-800"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{pets}</span>
                  <button
                    onClick={() => setPets(pets + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
          <button
            onClick={clearAll}
            className="text-sm font-semibold text-neutral-800 underline hover:text-neutral-900"
          >
            Clear all
          </button>
          <button
            onClick={handleSearch}
            className="btn-airbnb flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm shadow-md"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span>Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}
