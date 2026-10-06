'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { ListingCard as ListingCardType } from '@/types';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';

interface ListingCardProps {
  listing: ListingCardType;
  onWishlistToggle?: (id: number, isWishlisted: boolean) => void;
}

export default function ListingCard({ listing, onWishlistToggle }: ListingCardProps) {
  const { currentUser } = useUser();
  const { toast } = useToast();

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(listing.is_wishlisted || false);
  const [isHovered, setIsHovered] = useState(false);

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : listing.cover_image
    ? [listing.cover_image]
    : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex(prev => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast('Please select a user to save wishlists', { type: 'info' });
      return;
    }

    const nextState = !isWishlisted;
    setIsWishlisted(nextState);

    try {
      await api.toggleWishlist(currentUser.id, listing.id);
      if (onWishlistToggle) onWishlistToggle(listing.id, nextState);
      toast(nextState ? 'Saved to Wishlist' : 'Removed from Wishlist', {
        type: 'success',
      });
    } catch (err) {
      setIsWishlisted(!nextState); // rollback
      toast('Failed to update wishlist', { type: 'error' });
    }
  };

  return (
    <div
      className="group flex flex-col relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Photo Carousel Container */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100 shadow-xs">
        <Link href={`/listings/${listing.id}`} className="block w-full h-full">
          <img
            src={images[currentImgIndex]}
            alt={listing.title}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Guest favorite / Superhost Badge */}
        {listing.is_guest_favorite ? (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-neutral-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
            Guest favorite
          </div>
        ) : listing.is_superhost ? (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-neutral-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <span>★</span> Superhost
          </div>
        ) : null}

        {/* Wishlist Heart Button */}
        <button
          onClick={toggleWishlist}
          aria-label="Save to wishlist"
          className="absolute top-3 right-3 p-1.5 transition transform active:scale-90 hover:scale-110 z-10"
        >
          <Heart
            className={`w-6 h-6 stroke-white stroke-2 transition duration-200 ${
              isWishlisted
                ? 'fill-airbnb-brand stroke-airbnb-brand'
                : 'fill-black/30 hover:fill-black/50'
            }`}
          />
        </button>

        {/* Carousel Navigation Arrows */}
        {images.length > 1 && isHovered && (
          <>
            {currentImgIndex > 0 && (
              <button
                onClick={prevImage}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center shadow-md transition z-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {currentImgIndex < images.length - 1 && (
              <button
                onClick={nextImage}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center shadow-md transition z-10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        {/* Pagination Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  currentImgIndex === idx
                    ? 'w-4 bg-white'
                    : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Listing Card Info */}
      <Link href={`/listings/${listing.id}`} className="mt-3 block">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-neutral-900 text-sm truncate leading-snug">
            {listing.location}
          </h3>
          <div className="flex items-center gap-1 shrink-0 text-sm font-medium text-neutral-900">
            <Star className="w-3.5 h-3.5 fill-current text-neutral-900" />
            <span>{listing.rating.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-xs text-neutral-500 truncate mt-0.5">
          {listing.title}
        </p>

        <p className="text-xs text-neutral-500 mt-0.5">
          {listing.property_type}
        </p>

        <div className="mt-1.5 flex items-baseline gap-1 text-sm">
          <span className="font-bold text-neutral-900">${Math.round(listing.price_per_night)}</span>
          <span className="text-neutral-500 font-normal text-xs">night</span>
        </div>
      </Link>
    </div>
  );
}
