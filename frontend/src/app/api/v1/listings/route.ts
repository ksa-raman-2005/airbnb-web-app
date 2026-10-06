import { NextRequest, NextResponse } from 'next/server';
import { serverlessStore } from '@/lib/serverless-store';
import { ListingCard } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location')?.toLowerCase();
  const category = searchParams.get('category')?.toLowerCase();
  const guests = searchParams.get('guests') ? parseInt(searchParams.get('guests')!, 10) : undefined;
  const minPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined;
  const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined;
  const roomType = searchParams.get('room_type');
  const minBedrooms = searchParams.get('min_bedrooms') ? parseInt(searchParams.get('min_bedrooms')!, 10) : undefined;
  const minBeds = searchParams.get('min_beds') ? parseInt(searchParams.get('min_beds')!, 10) : undefined;
  const minBathrooms = searchParams.get('min_bathrooms') ? parseFloat(searchParams.get('min_bathrooms')!) : undefined;
  const hostId = searchParams.get('host_id') ? parseInt(searchParams.get('host_id')!, 10) : undefined;
  const userId = searchParams.get('user_id') ? parseInt(searchParams.get('user_id')!, 10) : undefined;
  const sortBy = searchParams.get('sort_by') || 'recommended';

  let results = [...serverlessStore.listings];

  if (hostId) {
    results = results.filter(l => l.host.id === hostId);
  }

  if (category && category !== 'all') {
    results = results.filter(l => l.category?.slug.toLowerCase() === category);
  }

  if (location) {
    const terms = location.split(' ');
    results = results.filter(l =>
      terms.some(t =>
        l.location.toLowerCase().includes(t) ||
        l.city.toLowerCase().includes(t) ||
        l.country.toLowerCase().includes(t) ||
        l.title.toLowerCase().includes(t)
      )
    );
  }

  if (guests) {
    results = results.filter(l => l.max_guests >= guests);
  }

  if (minPrice !== undefined) results = results.filter(l => l.price_per_night >= minPrice);
  if (maxPrice !== undefined) results = results.filter(l => l.price_per_night <= maxPrice);

  if (roomType) results = results.filter(l => l.room_type.toLowerCase() === roomType.toLowerCase());
  if (minBedrooms) results = results.filter(l => l.bedrooms >= minBedrooms);
  if (minBeds) results = results.filter(l => l.beds >= minBeds);
  if (minBathrooms) results = results.filter(l => l.bathrooms >= minBathrooms);

  if (sortBy === 'price_low') {
    results.sort((a, b) => a.price_per_night - b.price_per_night);
  } else if (sortBy === 'price_high') {
    results.sort((a, b) => b.price_per_night - a.price_per_night);
  } else if (sortBy === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  }

  const wishlistSet = new Set(
    userId ? serverlessStore.wishlists.filter(w => w.userId === userId).map(w => w.listingId) : []
  );

  const cardResults: ListingCard[] = results.map(l => ({
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
    category_slug: l.category?.slug,
    is_wishlisted: wishlistSet.has(l.id)
  }));

  return NextResponse.json(cardResults);
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const host = serverlessStore.users.find(u => u.id === payload.host_id) || serverlessStore.users[1];
  const cat = serverlessStore.categories.find(c => c.id === payload.category_id) || serverlessStore.categories[1];

  const newId = serverlessStore.listings.length + 1;
  const newListing = {
    id: newId,
    title: payload.title,
    description: payload.description,
    property_type: payload.property_type || 'Entire villa',
    room_type: payload.room_type || 'Entire place',
    location: payload.location,
    address: payload.address || '',
    city: payload.city,
    state: payload.state || '',
    country: payload.country,
    latitude: payload.latitude || 40.6281,
    longitude: payload.longitude || 14.4850,
    price_per_night: payload.price_per_night,
    cleaning_fee: payload.cleaning_fee || 75,
    service_fee: Math.round(payload.price_per_night * 0.14),
    max_guests: payload.max_guests || 4,
    bedrooms: payload.bedrooms || 2,
    beds: payload.beds || 2,
    bathrooms: payload.bathrooms || 2,
    rating: 5.0,
    review_count: 0,
    is_superhost: host.is_superhost,
    is_guest_favorite: false,
    is_active: true,
    created_at: new Date().toISOString(),
    host,
    category: cat,
    images: (payload.images || []).map((url: string, idx: number) => ({
      id: idx + 1,
      listing_id: newId,
      url,
      is_cover: idx === 0,
      display_order: idx
    })),
    amenities: serverlessStore.amenities.filter(a => (payload.amenity_ids || []).includes(a.id)),
    reviews: [],
    booked_dates: []
  };

  serverlessStore.listings.unshift(newListing as any);
  return NextResponse.json(newListing, { status: 201 });
}
