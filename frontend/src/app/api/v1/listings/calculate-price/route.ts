import { NextRequest, NextResponse } from 'next/server';
import { serverlessStore } from '@/lib/serverless-store';

export async function POST(request: NextRequest) {
  const { listing_id, check_in, check_out } = await request.json();
  const listing = serverlessStore.listings.find(l => l.id === listing_id);
  if (!listing) {
    return NextResponse.json({ detail: 'Listing not found' }, { status: 404 });
  }

  const inDate = new Date(check_in);
  const outDate = new Date(check_out);
  const nights = Math.max(1, Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)));

  const basePrice = nights * listing.price_per_night;
  const cleaningFee = listing.cleaning_fee;
  const serviceFee = Math.round(basePrice * 0.14);
  const taxes = Math.round((basePrice + cleaningFee + serviceFee) * 0.08);
  const totalPrice = basePrice + cleaningFee + serviceFee + taxes;

  const hasOverlap = listing.booked_dates.some(b => {
    const bStart = new Date(b.check_in);
    const bEnd = new Date(b.check_out);
    return inDate < bEnd && outDate > bStart;
  });

  return NextResponse.json({
    nightly_rate: listing.price_per_night,
    nights,
    base_price: basePrice,
    cleaning_fee: cleaningFee,
    service_fee: serviceFee,
    taxes,
    total_price: totalPrice,
    is_available: !hasOverlap
  });
}
