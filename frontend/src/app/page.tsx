'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ListingCard as ListingCardType, Category, Amenity, SearchFilters } from '@/types';
import { useUser } from '@/context/UserContext';
import CategoryBar from '@/components/home/CategoryBar';
import FiltersModal from '@/components/home/FiltersModal';
import ListingCard from '@/components/home/ListingCard';
import InteractiveMap from '@/components/home/InteractiveMap';
import FloatingMapToggle from '@/components/home/FloatingMapToggle';
import { Sparkles, MapPin, Frown } from 'lucide-react';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useUser();

  const [categories, setCategories] = useState<Category[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [listings, setListings] = useState<ListingCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedMapListing, setSelectedMapListing] = useState<ListingCardType | null>(null);

  // Extract filters from URL searchParams
  const activeCategory = searchParams.get('category') || 'all';
  const locationParam = searchParams.get('location') || undefined;
  const checkInParam = searchParams.get('check_in') || undefined;
  const checkOutParam = searchParams.get('check_out') || undefined;
  const guestsParam = searchParams.get('guests') ? parseInt(searchParams.get('guests')!, 10) : undefined;
  const minPriceParam = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined;
  const maxPriceParam = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined;
  const roomTypeParam = searchParams.get('room_type') || undefined;
  const minBedroomsParam = searchParams.get('min_bedrooms') ? parseInt(searchParams.get('min_bedrooms')!, 10) : undefined;
  const minBedsParam = searchParams.get('min_beds') ? parseInt(searchParams.get('min_beds')!, 10) : undefined;
  const minBathroomsParam = searchParams.get('min_bathrooms') ? parseFloat(searchParams.get('min_bathrooms')!) : undefined;
  const amenitiesParam = searchParams.get('amenities')
    ? searchParams.get('amenities')!.split(',').map(Number)
    : undefined;
  const sortByParam = (searchParams.get('sort_by') as SearchFilters['sort_by']) || 'recommended';

  // Count active non-category filters
  let filterCount = 0;
  if (minPriceParam !== undefined || maxPriceParam !== undefined) filterCount++;
  if (roomTypeParam) filterCount++;
  if (minBedroomsParam || minBedsParam || minBathroomsParam) filterCount++;
  if (amenitiesParam && amenitiesParam.length > 0) filterCount += amenitiesParam.length;
  if (sortByParam && sortByParam !== 'recommended') filterCount++;

  const currentFilters: SearchFilters = {
    location: locationParam,
    category: activeCategory,
    check_in: checkInParam,
    check_out: checkOutParam,
    guests: guestsParam,
    min_price: minPriceParam,
    max_price: maxPriceParam,
    room_type: roomTypeParam,
    min_bedrooms: minBedroomsParam,
    min_beds: minBedsParam,
    min_bathrooms: minBathroomsParam,
    amenities: amenitiesParam,
    sort_by: sortByParam,
  };

  // Fetch categories & amenities once
  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, ams] = await Promise.all([
          api.getCategories(),
          api.getAmenities()
        ]);
        setCategories(cats);
        setAmenities(ams);
      } catch (err) {
        console.error('Failed to load categories/amenities:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch listings whenever searchParams or user changes
  useEffect(() => {
    async function loadListings() {
      setIsLoading(true);
      try {
        const data = await api.getListings(currentFilters, currentUser?.id);
        setListings(data);
      } catch (err) {
        console.error('Failed to load listings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadListings();
  }, [
    activeCategory,
    locationParam,
    checkInParam,
    checkOutParam,
    guestsParam,
    minPriceParam,
    maxPriceParam,
    roomTypeParam,
    minBedroomsParam,
    minBedsParam,
    minBathroomsParam,
    searchParams.get('amenities'),
    sortByParam,
    currentUser?.id,
  ]);

  const handleSelectCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    router.push(`/?${params.toString()}`);
  };

  const handleApplyFilters = (newFilters: SearchFilters) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newFilters.min_price !== undefined) params.set('min_price', newFilters.min_price.toString());
    else params.delete('min_price');

    if (newFilters.max_price !== undefined) params.set('max_price', newFilters.max_price.toString());
    else params.delete('max_price');

    if (newFilters.room_type) params.set('room_type', newFilters.room_type);
    else params.delete('room_type');

    if (newFilters.min_bedrooms !== undefined) params.set('min_bedrooms', newFilters.min_bedrooms.toString());
    else params.delete('min_bedrooms');

    if (newFilters.min_beds !== undefined) params.set('min_beds', newFilters.min_beds.toString());
    else params.delete('min_beds');

    if (newFilters.min_bathrooms !== undefined) params.set('min_bathrooms', newFilters.min_bathrooms.toString());
    else params.delete('min_bathrooms');

    if (newFilters.amenities && newFilters.amenities.length > 0) {
      params.set('amenities', newFilters.amenities.join(','));
    } else {
      params.delete('amenities');
    }

    if (newFilters.sort_by && newFilters.sort_by !== 'recommended') {
      params.set('sort_by', newFilters.sort_by);
    } else {
      params.delete('sort_by');
    }

    router.push(`/?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col pb-20">
      {/* Category Filter Bar */}
      <CategoryBar
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onOpenFilters={() => setIsFiltersOpen(true)}
        activeFilterCount={filterCount}
      />

      {/* Main Content Area */}
      <div className="max-w-[1760px] mx-auto px-4 sm:px-8 md:px-12 py-6 w-full flex-1">
        {/* If Map is Open */}
        {isMapOpen ? (
          <div className="h-[calc(100vh-210px)] w-full">
            <InteractiveMap
              listings={listings}
              selectedListing={selectedMapListing}
              onSelectListing={setSelectedMapListing}
            />
          </div>
        ) : (
          <>
            {/* Active search filter chips summary */}
            {(locationParam || checkInParam || filterCount > 0) && (
              <div className="mb-6 flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-neutral-150">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-semibold text-neutral-900">Active filters:</span>
                  {locationParam && (
                    <span className="px-3 py-1 bg-neutral-100 rounded-full font-medium text-neutral-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-500" />
                      {locationParam}
                    </span>
                  )}
                  {checkInParam && checkOutParam && (
                    <span className="px-3 py-1 bg-neutral-100 rounded-full font-medium text-neutral-800">
                      {checkInParam} to {checkOutParam}
                    </span>
                  )}
                  {guestsParam && (
                    <span className="px-3 py-1 bg-neutral-100 rounded-full font-medium text-neutral-800">
                      {guestsParam} guests
                    </span>
                  )}
                  {filterCount > 0 && (
                    <span className="px-3 py-1 bg-neutral-900 text-white rounded-full font-semibold">
                      +{filterCount} advanced filters
                    </span>
                  )}
                </div>

                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-neutral-900 underline hover:text-airbnb-brand"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Listings Grid or Loading Skeleton or Empty State */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse space-y-3">
                    <div className="aspect-square bg-neutral-200 rounded-2xl w-full" />
                    <div className="h-4 bg-neutral-200 rounded-md w-3/4" />
                    <div className="h-3 bg-neutral-200 rounded-md w-1/2" />
                    <div className="h-4 bg-neutral-200 rounded-md w-1/3" />
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-neutral-400">
                  <Frown className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-1">No exact matches found</h3>
                <p className="text-sm text-neutral-500 mb-6">
                  Try changing or clearing your dates, location, or advanced filters to see more available stays.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 rounded-xl border border-neutral-900 font-semibold text-sm hover:bg-neutral-50 transition"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
                {listings.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onWishlistToggle={(id, isWish) => {
                      setListings(prev =>
                        prev.map(l => (l.id === id ? { ...l, is_wishlisted: isWish } : l))
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Map / List Toggle */}
      <FloatingMapToggle
        isMapOpen={isMapOpen}
        onToggle={() => setIsMapOpen(!isMapOpen)}
      />

      {/* Filters Modal */}
      <FiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={currentFilters}
        onApplyFilters={handleApplyFilters}
        amenitiesList={amenities}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-neutral-500">Loading stays...</div>}>
      <HomeContent />
    </Suspense>
  );
}
