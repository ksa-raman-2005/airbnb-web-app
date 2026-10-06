'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Frown } from 'lucide-react';
import { api } from '@/lib/api';
import { ListingCard as ListingCardType } from '@/types';
import { useUser } from '@/context/UserContext';
import ListingCard from '@/components/home/ListingCard';

export default function WishlistsPage() {
  const { currentUser } = useUser();
  const [wishlistItems, setWishlistItems] = useState<ListingCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        const data = await api.getUserWishlist(currentUser.id);
        setWishlistItems(data);
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWishlist();
  }, [currentUser]);

  const handleWishlistToggle = (listingId: number, isWishlisted: boolean) => {
    if (!isWishlisted) {
      setWishlistItems(prev => prev.filter(item => item.id !== listingId));
    }
  };

  return (
    <div className="max-w-[1760px] mx-auto px-4 sm:px-8 md:px-12 py-10 min-h-[calc(100vh-200px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Wishlists</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Your saved vacation rentals and dream stays.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="aspect-square bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-airbnb-brand flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 fill-airbnb-brand" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">Your wishlist is empty</h3>
          <p className="text-xs text-neutral-500">
            As you search, tap the heart icon on any stay to save your favorite places and experiences here.
          </p>
          <Link
            href="/"
            className="btn-airbnb inline-block px-6 py-3 rounded-xl text-xs font-semibold shadow-md mt-2"
          >
            Start exploring
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
          {wishlistItems.map(item => (
            <ListingCard
              key={item.id}
              listing={item}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
