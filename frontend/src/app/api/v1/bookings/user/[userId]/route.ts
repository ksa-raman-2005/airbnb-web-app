import { NextRequest, NextResponse } from 'next/server';
import { serverlessStore } from '@/lib/serverless-store';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = parseInt(params.userId, 10);
  const userBookings = serverlessStore.bookings.filter(b => b.guest_id === userId);
  return NextResponse.json(userBookings);
}
