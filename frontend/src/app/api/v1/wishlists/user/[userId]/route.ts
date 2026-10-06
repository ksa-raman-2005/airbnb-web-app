import { NextRequest, NextResponse } from 'next/server';
import { serverlessStore } from '@/lib/serverless-store';
import { ListingCard } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = parseInt(params.userId, 10);
  const wishlistListingIds = new Set(
    serverlessStore.wishlists.filter(w => w.userId === userId).map(w => w.listingId)
  );

  const matchedListings = serverlessStore.listings.filter(l => wishlistListingIds.has(l.id));

  const cards: ListingCard[] = matchedListings.map(l => ({
    id: l.id,
    title: l.title,
    location: l.location,
    city: l.city,
    country: l.country,
    property_type: l.property_type,
    room_type: l.room_type,
    price_per_night: l.price_per_night,
    rating: l.rating,
    review_count: l.review_count,
    is_superhost: l.is_superhost,
    is_guest_favorite: l.is_guest_favorite,
    cover_image: l.images[0]?.url,
    images: l.images.map(img => img.url),
    latitude: l.latitude,
    longitude: l.longitude,
    is_wishlisted: true
  }));

  return NextResponse.json(cards);
}
