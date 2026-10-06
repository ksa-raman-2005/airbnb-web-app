'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Amenity, SearchFilters } from '@/types';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onApplyFilters: (newFilters: SearchFilters) => void;
  amenitiesList: Amenity[];
}

export default function FiltersModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  amenitiesList,
}: FiltersModalProps) {
  const [minPrice, setMinPrice] = useState<number | undefined>(filters.min_price);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(filters.max_price);
  const [roomType, setRoomType] = useState<string | undefined>(filters.room_type);
  const [minBedrooms, setMinBedrooms] = useState<number | undefined>(filters.min_bedrooms);
  const [minBeds, setMinBeds] = useState<number | undefined>(filters.min_beds);
  const [minBathrooms, setMinBathrooms] = useState<number | undefined>(filters.min_bathrooms);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(filters.amenities || []);
  const [sortBy, setSortBy] = useState<SearchFilters['sort_by']>(filters.sort_by || 'recommended');

  useEffect(() => {
    if (isOpen) {
      setMinPrice(filters.min_price);
      setMaxPrice(filters.max_price);
      setRoomType(filters.room_type);
      setMinBedrooms(filters.min_bedrooms);
      setMinBeds(filters.min_beds);
      setMinBathrooms(filters.min_bathrooms);
      setSelectedAmenities(filters.amenities || []);
      setSortBy(filters.sort_by || 'recommended');
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const toggleAmenity = (id: number) => {
    setSelectedAmenities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleClear = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setRoomType(undefined);
    setMinBedrooms(undefined);
    setMinBeds(undefined);
    setMinBathrooms(undefined);
    setSelectedAmenities([]);
    setSortBy('recommended');
  };

  const handleApply = () => {
    onApplyFilters({
      ...filters,
      min_price: minPrice,
      max_price: maxPrice,
      room_type: roomType,
      min_bedrooms: minBedrooms,
      min_beds: minBeds,
      min_bathrooms: minBathrooms,
      amenities: selectedAmenities,
      sort_by: sortBy,
    });
    onClose();
  };

  const countPill = (
    label: string,
    currentValue: number | undefined,
    onSelect: (val: number | undefined) => void
  ) => {
    const options = [
      { label: 'Any', value: undefined },
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5+', value: 5 },
    ];

    return (
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const isSelected = currentValue === opt.value;
          return (
            <button
              key={opt.label}
              onClick={() => onSelect(opt.value)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition ${
                isSelected
                  ? 'bg-neutral-900 text-white'
                  : 'border border-neutral-200 text-neutral-800 hover:border-neutral-900'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-airbnb-modal max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-neutral-900 text-base">Filters</h3>
          <div className="w-9" /> {/* balance spacer */}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-8 divide-y divide-neutral-100">
          {/* 1. Sort By */}
          <div>
            <h4 className="font-semibold text-neutral-900 text-base mb-3">Sort by</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'recommended', label: 'Recommended' },
                { id: 'price_low', label: 'Price: low to high' },
                { id: 'price_high', label: 'Price: high to low' },
                { id: 'rating', label: 'Highest rated' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id as any)}
                  className={`p-3 rounded-2xl text-xs font-semibold border text-center transition ${
                    sortBy === opt.id
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 text-neutral-800 hover:border-neutral-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Price Range */}
          <div className="pt-6">
            <h4 className="font-semibold text-neutral-900 text-base mb-1">Price range</h4>
            <p className="text-xs text-neutral-500 mb-4">Nightly prices before taxes and fees</p>

            <div className="flex items-center gap-4">
              <div className="flex-1 border border-neutral-300 rounded-2xl p-3 focus-within:border-neutral-900">
                <span className="block text-[10px] text-neutral-500 font-medium">Minimum</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-sm font-semibold text-neutral-500">$</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice ?? ''}
                    onChange={e => setMinPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full text-sm font-semibold text-neutral-900 outline-hidden"
                  />
                </div>
              </div>

              <span className="text-neutral-300">—</span>

              <div className="flex-1 border border-neutral-300 rounded-2xl p-3 focus-within:border-neutral-900">
                <span className="block text-[10px] text-neutral-500 font-medium">Maximum</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-sm font-semibold text-neutral-500">$</span>
                  <input
                    type="number"
                    placeholder="1500+"
                    value={maxPrice ?? ''}
                    onChange={e => setMaxPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full text-sm font-semibold text-neutral-900 outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Type of Place */}
          <div className="pt-6">
            <h4 className="font-semibold text-neutral-900 text-base mb-3">Type of place</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: undefined, label: 'Any type' },
                { id: 'Entire place', label: 'Entire place' },
                { id: 'Private room', label: 'Room' },
              ].map(t => (
                <button
                  key={t.label}
                  onClick={() => setRoomType(t.id)}
                  className={`p-3.5 rounded-2xl border text-xs font-semibold text-center transition ${
                    roomType === t.id
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 text-neutral-800 hover:border-neutral-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Rooms and Beds */}
          <div className="pt-6 space-y-4">
            <h4 className="font-semibold text-neutral-900 text-base">Rooms and beds</h4>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-2">Bedrooms</label>
              {countPill('Bedrooms', minBedrooms, setMinBedrooms)}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-2">Beds</label>
              {countPill('Beds', minBeds, setMinBeds)}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-2">Bathrooms</label>
              {countPill('Bathrooms', minBathrooms, setMinBathrooms)}
            </div>
          </div>

          {/* 5. Amenities */}
          <div className="pt-6">
            <h4 className="font-semibold text-neutral-900 text-base mb-3">Amenities</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {amenitiesList.map(amenity => {
                const isChecked = selectedAmenities.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-medium transition ${
                      isChecked
                        ? 'border-neutral-900 bg-neutral-50 text-neutral-900 font-semibold'
                        : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                        isChecked
                          ? 'bg-neutral-900 border-neutral-900 text-white'
                          : 'border-neutral-400 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{amenity.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-neutral-100 flex items-center justify-between">
          <button
            onClick={handleClear}
            className="text-xs font-semibold text-neutral-800 underline hover:text-neutral-900"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="bg-neutral-900 hover:bg-black text-white px-6 py-3 rounded-xl text-xs font-semibold transition shadow-sm"
          >
            Show places
          </button>
        </div>
      </div>
    </div>
  );
}
