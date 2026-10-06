import { NextRequest, NextResponse } from 'next/server';
import { serverlessStore } from '@/lib/serverless-store';

export async function GET(
  request: NextRequest,
  { params }: { params: { hostId: string } }
) {
  const hostId = parseInt(params.hostId, 10);
  const hostListingIds = new Set(serverlessStore.listings.filter(l => l.host.id === hostId).map(l => l.id));
  const hostBookings = serverlessStore.bookings.filter(b => hostListingIds.has(b.listing_id));
  return NextResponse.json(hostBookings);
}
