import { NextRequest, NextResponse } from 'next/server';
import { serverlessStore } from '@/lib/serverless-store';
import { Review } from '@/types';

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const listing = serverlessStore.listings.find(l => l.id === payload.listing_id);
  if (!listing) {
    return NextResponse.json({ detail: 'Listing not found' }, { status: 404 });
  }

  const guest = serverlessStore.users.find(u => u.id === payload.guest_id) || serverlessStore.users[0];

  const newReview: Review = {
    id: (listing.reviews?.length || 0) + 1,
    guest,
    rating: payload.rating,
    cleanliness_rating: payload.cleanliness_rating || 5,
    accuracy_rating: payload.accuracy_rating || 5,
    communication_rating: payload.communication_rating || 5,
    location_rating: payload.location_rating || 5,
    checkin_rating: payload.checkin_rating || 5,
    value_rating: payload.value_rating || 5,
    comment: payload.comment,
    created_at: new Date().toISOString()
  };

  listing.reviews = [newReview, ...(listing.reviews || [])];
  listing.review_count = listing.reviews.length;
  const avg = listing.reviews.reduce((acc, r) => acc + r.rating, 0) / listing.reviews.length;
  listing.rating = Number(avg.toFixed(2));

  return NextResponse.json(newReview, { status: 201 });
}
