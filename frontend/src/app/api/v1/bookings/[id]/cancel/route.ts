import { NextRequest, NextResponse } from 'next/server';
import { serverlessStore } from '@/lib/serverless-store';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  const booking = serverlessStore.bookings.find(b => b.id === id);
  if (!booking) {
    return NextResponse.json({ detail: 'Booking not found' }, { status: 404 });
  }

  booking.status = 'cancelled';
  booking.payment_status = 'refunded';

  // Release dates on listing
  const listing = serverlessStore.listings.find(l => l.id === booking.listing_id);
  if (listing) {
    listing.booked_dates = listing.booked_dates.filter(
      b => !(b.check_in === booking.check_in && b.check_out === booking.check_out)
    );
  }

  return NextResponse.json(booking);
}
