'use client';

import React from 'react';
import { Map, List } from 'lucide-react';

interface FloatingMapToggleProps {
  isMapOpen: boolean;
  onToggle: () => void;
}

export default function FloatingMapToggle({ isMapOpen, onToggle }: FloatingMapToggleProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 animate-fade-in">
      <button
        onClick={onToggle}
        className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-neutral-900 hover:bg-black text-white font-semibold text-sm shadow-airbnb-hover hover:scale-105 active:scale-95 transition"
      >
        {isMapOpen ? (
          <>
            <span>Show list</span>
            <List className="w-4 h-4" />
          </>
        ) : (
          <>
            <span>Show map</span>
            <Map className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
