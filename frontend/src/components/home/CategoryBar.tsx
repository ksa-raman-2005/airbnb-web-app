'use client';

import React, { useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Palmtree,
  Trees,
  Castle,
  Home,
  Compass,
  MountainSnow,
  Sailboat,
  Snowflake,
  Building2,
  Crown,
  SunMedium,
  Waves,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Category } from '@/types';

// Icon mapper
const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Palmtree,
  Trees,
  Castle,
  Home,
  Compass,
  MountainSnow,
  Sailboat,
  Snowflake,
  Building2,
  Crown,
  SunMedium,
  Waves,
};

interface CategoryBarProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}

export default function CategoryBar({
  categories,
  activeCategory,
  onSelectCategory,
  onOpenFilters,
  activeFilterCount
}: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-20 z-30 bg-white border-b border-neutral-150 py-3">
      <div className="max-w-[1760px] mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-between gap-4">
        {/* Scroll Left Button */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex w-8 h-8 rounded-full border border-neutral-300 hover:border-neutral-900 bg-white items-center justify-center shrink-0 shadow-sm transition"
        >
          <ChevronLeft className="w-4 h-4 text-neutral-700" />
        </button>

        {/* Categories Carousel */}
        <div
          ref={scrollRef}
          className="flex items-center gap-7 overflow-x-auto no-scrollbar scroll-smooth py-1"
        >
          {categories.map(cat => {
            const Icon = ICON_MAP[cat.icon] || Sparkles;
            const isActive = activeCategory === cat.slug;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`flex flex-col items-center gap-2 pb-2 border-b-2 shrink-0 transition group cursor-pointer ${
                  isActive
                    ? 'border-neutral-900 text-neutral-900'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
                }`}
              >
                <Icon
                  className={`w-6 h-6 transition group-hover:scale-105 ${
                    isActive ? 'text-neutral-900' : 'text-neutral-500 group-hover:text-neutral-800'
                  }`}
                />
                <span className="text-xs font-medium whitespace-nowrap">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex w-8 h-8 rounded-full border border-neutral-300 hover:border-neutral-900 bg-white items-center justify-center shrink-0 shadow-sm transition"
        >
          <ChevronRight className="w-4 h-4 text-neutral-700" />
        </button>

        {/* Filter Trigger Button */}
        <button
          onClick={onOpenFilters}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-neutral-300 hover:border-neutral-900 text-xs font-semibold text-neutral-800 shrink-0 transition bg-white shadow-xs"
        >
          <SlidersHorizontal className="w-4 h-4 text-neutral-600" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
