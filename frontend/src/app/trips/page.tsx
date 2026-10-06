'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Luggage,
  Calendar,
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  Frown
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfToday } from 'date-fns';

import { api } from '@/lib/api';
import { Booking } from '@/types';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';

export default function TripsPage() {
  const { currentUser } = useUser();
  const { toast, success, error } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  // Cancel modal state
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Review modal state
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5.0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadTrips() {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        const data = await api.getUserTrips(currentUser.id);
        setBookings(data);
      } catch (err) {
        console.error('Failed to load trips:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTrips();
  }, [currentUser]);

  const today = startOfToday();

  // Filter bookings by tab
  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'cancelled') {
      return b.status === 'cancelled';
    }
    if (activeTab === 'completed') {
      return b.status === 'completed' || (b.status === 'confirmed' && isBefore(parseISO(b.check_out), today));
    }
    // upcoming
    return b.status === 'confirmed' && (isAfter(parseISO(b.check_out), today) || b.check_out === format(today, 'yyyy-MM-dd'));
  });

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    setIsCancelling(true);

    try {
      const updated = await api.cancelBooking(cancellingBooking.id);
      setBookings(prev => prev.map(b => (b.id === updated.id ? updated : b)));
      setCancellingBooking(null);
      success('Reservation cancelled successfully', 'Dates have been released.');
    } catch (err: any) {
      error(err.message || 'Failed to cancel reservation');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleLeaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking || !currentUser) return;
    if (!reviewComment.trim()) {
      toast('Please enter your review feedback', { type: 'error' });
      return;
    }

    setIsSubmittingReview(true);
    try {
      await api.createReview({
        listing_id: reviewBooking.listing_id,
        guest_id: currentUser.id,
        booking_id: reviewBooking.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewBooking(null);
      setReviewComment('');
      success('Review posted! Thank you for sharing your experience.');
    } catch (err: any) {
      error(err.message || 'Failed to post review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 md:px-12 py-10 min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Trips</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your upcoming travel plans, past reservations, and receipts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-neutral-200 mb-8 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'upcoming'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'completed'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          Past Stays
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'cancelled'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-56 bg-neutral-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-16 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <Luggage className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">
            No {activeTab} trips found
          </h3>
          <p className="text-xs text-neutral-500">
            Time to dust off your bags and start planning your next great adventure.
          </p>
          <Link
            href="/"
            className="btn-airbnb inline-block px-6 py-3 rounded-xl text-xs font-semibold shadow-md mt-2"
          >
            Start searching
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map(booking => {
            const isCancelled = booking.status === 'cancelled';
            const isPast = activeTab === 'completed';

            return (
              <div
                key={booking.id}
                className="bg-white rounded-3xl border border-neutral-200 p-5 shadow-sm hover:shadow-airbnb transition flex flex-col sm:flex-row gap-5"
              >
                {/* Thumbnail */}
                <div className="w-full sm:w-44 aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden bg-neutral-100 shrink-0 relative">
                  <img
                    src={booking.listing?.cover_image || (booking.listing?.images && booking.listing.images[0]) || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80'}
                    alt={booking.listing?.title || 'Trip'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    {isCancelled ? (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Cancelled
                      </span>
                    ) : isPast ? (
                      <span className="bg-neutral-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Completed
                      </span>
                    ) : (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Confirmed
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono mb-1">
                      <span>Code: {booking.booking_code}</span>
                      <span>{booking.total_nights} nights</span>
                    </div>

                    <h3 className="font-bold text-neutral-900 text-base line-clamp-1">
                      {booking.listing?.title || 'Vacation Stay'}
                    </h3>

                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{booking.listing?.location || booking.listing?.city}</span>
                    </p>

                    <p className="text-xs text-neutral-700 font-semibold flex items-center gap-1.5 mt-2">
                      <Calendar className="w-3.5 h-3.5 text-airbnb-brand shrink-0" />
                      <span>
                        {format(parseISO(booking.check_in), 'MMM d, yyyy')} – {format(parseISO(booking.check_out), 'MMM d, yyyy')}
                      </span>
                    </p>

                    <div className="mt-2 text-xs text-neutral-500">
                      <span>{booking.guests_count} guests</span> · <span className="font-bold text-neutral-900">${booking.total_price}</span> total
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-neutral-100 flex items-center gap-3 mt-3 flex-wrap">
                    {booking.listing && (
                      <Link
                        href={`/listings/${booking.listing.id}`}
                        className="text-xs font-semibold text-neutral-900 underline hover:text-airbnb-brand"
                      >
                        View listing
                      </Link>
                    )}

                    {!isCancelled && !isPast && (
                      <button
                        onClick={() => setCancellingBooking(booking)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline"
                      >
                        Cancel reservation
                      </button>
                    )}

                    {isPast && (
                      <button
                        onClick={() => setReviewBooking(booking)}
                        className="btn-airbnb px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs"
                      >
                        Leave review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-airbnb-modal border border-neutral-100 text-neutral-800 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-neutral-900">Cancel Reservation?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to cancel reservation <strong>{cancellingBooking.booking_code}</strong>? The reserved dates ({cancellingBooking.check_in} to {cancellingBooking.check_out}) will be freed up for other guests.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setCancellingBooking(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold hover:bg-neutral-50"
              >
                Keep reservation
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Review Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-airbnb-modal border border-neutral-100 text-neutral-800 space-y-4">
            <h3 className="text-lg font-bold text-neutral-900">How was your stay?</h3>
            <p className="text-xs text-neutral-500">
              Reviewing: <strong>{reviewBooking.listing?.title}</strong>
            </p>

            <form onSubmit={handleLeaveReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold ml-2">{reviewRating}.0</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Comment</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details about your experience..."
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  className="w-full text-xs p-3 border border-neutral-300 rounded-xl focus:border-neutral-900 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="btn-airbnb px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
