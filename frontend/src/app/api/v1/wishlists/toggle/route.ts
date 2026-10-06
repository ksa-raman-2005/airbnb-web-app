import { NextRequest, NextResponse } from 'next/server';
import { serverlessStore } from '@/lib/serverless-store';

export async function POST(request: NextRequest) {
  const { user_id, listing_id } = await request.json();
  const index = serverlessStore.wishlists.findIndex(
    w => w.userId === user_id && w.listingId === listing_id
  );

  if (index !== -1) {
    serverlessStore.wishlists.splice(index, 1);
    return NextResponse.json({ is_wishlisted: false, listing_id });
  } else {
    serverlessStore.wishlists.push({ userId: user_id, listingId: listing_id });
    return NextResponse.json({ is_wishlisted: true, listing_id });
  }
}
