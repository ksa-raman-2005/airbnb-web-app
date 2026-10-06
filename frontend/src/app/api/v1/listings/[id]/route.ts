import { NextRequest, NextResponse } from 'next/server';
import { serverlessStore } from '@/lib/serverless-store';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id') ? parseInt(searchParams.get('user_id')!, 10) : undefined;

  const listing = serverlessStore.listings.find(l => l.id === id);
  if (!listing) {
    return NextResponse.json({ detail: 'Listing not found' }, { status: 404 });
  }

  const isWishlisted = userId
    ? serverlessStore.wishlists.some(w => w.userId === userId && w.listingId === id)
    : false;

  return NextResponse.json({ ...listing, is_wishlisted: isWishlisted });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  const payload = await request.json();

  const index = serverlessStore.listings.findIndex(l => l.id === id);
  if (index === -1) {
    return NextResponse.json({ detail: 'Listing not found' }, { status: 404 });
  }

  const existing = serverlessStore.listings[index];
  const updated = {
    ...existing,
    ...payload,
    images: payload.images
      ? payload.images.map((url: string, idx: number) => ({
          id: idx + 1,
          listing_id: id,
          url,
          is_cover: idx === 0,
          display_order: idx
        }))
      : existing.images,
    amenities: payload.amenity_ids
      ? serverlessStore.amenities.filter(a => payload.amenity_ids.includes(a.id))
      : existing.amenities
  };

  serverlessStore.listings[index] = updated;
  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  const index = serverlessStore.listings.findIndex(l => l.id === id);
  if (index === -1) {
    return NextResponse.json({ detail: 'Listing not found' }, { status: 404 });
  }

  serverlessStore.listings.splice(index, 1);
  return NextResponse.json({ message: 'Listing deleted successfully', id });
}
