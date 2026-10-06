import { NextRequest, NextResponse } from 'next/server';
import { serverlessStore } from '@/lib/serverless-store';
import { Booking } from '@/types';

export async function POST(request: NextRequest) {
  const payload = await request.json();

  const listing = serverlessStore.listings.find(l => l.id === payload.listing_id);
  if (!listing) {
    return NextResponse.json({ detail: 'Listing not found' }, { status: 404 });
  }

  const guest = serverlessStore.users.find(u => u.id === payload.guest_id) || serverlessStore.users[0];

  // Check overlap
  const checkIn = new Date(payload.check_in);
  const checkOut = new Date(payload.check_out);

  const hasOverlap = listing.booked_dates.some(b => {
    const bStart = new Date(b.check_in);
    const bEnd = new Date(b.check_out);
    return checkIn < bEnd && checkOut > bStart;
  });

  if (hasOverlap) {
    return NextResponse.json(
      { detail: `The selected dates (${payload.check_in} to ${payload.check_out}) are unavailable.` },
      { status: 400 }
    );
  }

  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
  const basePrice = nights * listing.price_per_night;
  const cleaningFee = listing.cleaning_fee;
  const serviceFee = Math.round(basePrice * 0.14);
  const taxes = Math.round((basePrice + cleaningFee + serviceFee) * 0.08);
  const totalPrice = basePrice + cleaningFee + serviceFee + taxes;

  const code = `HM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const newBooking: Booking = {
    id: serverlessStore.bookings.length + 1,
    booking_code: code,
    listing_id: listing.id,
    guest_id: guest.id,
    check_in: payload.check_in,
    check_out: payload.check_out,
    guests_count: (payload.adults || 1) + (payload.children || 0),
    adults: payload.adults || 1,
    children: payload.children || 0,
    infants: payload.infants || 0,
    pets: payload.pets || 0,
    nightly_rate: listing.price_per_night,
    total_nights: nights,
    cleaning_fee: cleaningFee,
    service_fee: serviceFee,
    taxes: taxes,
    total_price: totalPrice,
    status: 'confirmed',
    payment_method: payload.payment_method || 'credit_card',
    payment_status: 'paid',
    special_requests: payload.special_requests,
    created_at: new Date().toISOString(),
    listing: {
      id: listing.id,
      title: listing.title,
      location: listing.location,
      city: listing.city,
      country: listing.country,
      property_type: listing.property_type,
      room_type: listing.room_type,
      price_per_night: listing.price_per_night,
      rating: listing.rating,
      review_count: listing.review_count,
      is_superhost: listing.is_superhost,
      is_guest_favorite: listing.is_guest_favorite,
      cover_image: listing.images[0]?.url,
      images: listing.images.map(img => img.url),
      latitude: listing.latitude,
      longitude: listing.longitude
    },
    guest
  };

  serverlessStore.bookings.unshift(newBooking);
  listing.booked_dates.push({ check_in: payload.check_in, check_out: payload.check_out });

  return NextResponse.json(newBooking, { status: 201 });
}
