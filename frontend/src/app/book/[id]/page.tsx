'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Star,
  ShieldCheck,
  CreditCard,
  Lock,
  CheckCircle2,
  Sparkles,
  Calendar,
  Users,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { format, parseISO } from 'date-fns';

import { api } from '@/lib/api';
import { ListingDetail, Booking } from '@/types';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';

function BookingCheckoutContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useUser();
  const { toast, success, error } = useToast();

  const listingId = parseInt(params.id as string, 10);
  const checkInParam = searchParams.get('check_in') || '';
  const checkOutParam = searchParams.get('check_out') || '';
  const adultsParam = parseInt(searchParams.get('adults') || '1', 10);
  const childrenParam = parseInt(searchParams.get('children') || '0', 10);
  const infantsParam = parseInt(searchParams.get('infants') || '0', 10);

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'apple_pay' | 'google_pay' | 'paypal'>('credit_card');
  const [payOption, setPayOption] = useState<'full' | 'split'>('full');
  const [specialRequests, setSpecialRequests] = useState('');

  // Mock Card Inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardZip, setCardZip] = useState('90210');

  // Confirmation modal
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    async function loadListing() {
      try {
        const data = await api.getListingDetail(listingId);
        setListing(data);
      } catch (err) {
        console.error('Failed to load listing for checkout:', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (listingId) loadListing();
  }, [listingId]);

  if (isLoading || !listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-6 bg-neutral-200 rounded-md w-1/3" />
        <div className="h-64 bg-neutral-200 rounded-3xl w-full" />
      </div>
    );
  }

  // Calculate pricing
  const checkInDate = checkInParam ? parseISO(checkInParam) : new Date();
  const checkOutDate = checkOutParam ? parseISO(checkOutParam) : new Date(Date.now() + 86400000 * 3);
  const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
  const basePrice = nights * listing.price_per_night;
  const cleaningFee = listing.cleaning_fee;
  const serviceFee = Math.round(basePrice * 0.14);
  const taxes = Math.round((basePrice + cleaningFee + serviceFee) * 0.08);
  const totalPrice = basePrice + cleaningFee + serviceFee + taxes;
  const totalGuests = adultsParam + childrenParam;

  const handleConfirmAndPay = async () => {
    if (!currentUser) {
      toast('Please select an active user to complete this booking', { type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const newBooking = await api.createBooking({
        listing_id: listing.id,
        guest_id: currentUser.id,
        check_in: checkInParam || format(checkInDate, 'yyyy-MM-dd'),
        check_out: checkOutParam || format(checkOutDate, 'yyyy-MM-dd'),
        adults: adultsParam,
        children: childrenParam,
        infants: infantsParam,
        pets: 0,
        payment_method: paymentMethod,
        special_requests: specialRequests,
      });

      setConfirmedBooking(newBooking);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore if not supported
      }

      success('Reservation confirmed!', `Confirmation code: ${newBooking.booking_code}`);
    } catch (err: any) {
      error(err.message || 'Failed to complete booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
      {/* Top Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-neutral-100 rounded-full transition text-neutral-700"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          Confirm and pay
        </h1>
      </div>

      {/* Main Split Checkout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left 7 cols: Checkout Form */}
        <div className="lg:col-span-7 space-y-8 divide-y divide-neutral-200">
          {/* Section 1: Your Trip */}
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Your trip</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-neutral-900">Dates</h4>
                  <p className="text-neutral-600 text-xs mt-0.5">
                    {format(checkInDate, 'MMM d, yyyy')} – {format(checkOutDate, 'MMM d, yyyy')}
                  </p>
                </div>
                <Link
                  href={`/listings/${listing.id}`}
                  className="font-semibold underline text-neutral-900 text-xs hover:text-airbnb-brand"
                >
                  Edit
                </Link>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-neutral-900">Guests</h4>
                  <p className="text-neutral-600 text-xs mt-0.5">
                    {totalGuests} guest{totalGuests > 1 ? 's' : ''}
                    {infantsParam > 0 ? `, ${infantsParam} infant` : ''}
                  </p>
                </div>
                <Link
                  href={`/listings/${listing.id}`}
                  className="font-semibold underline text-neutral-900 text-xs hover:text-airbnb-brand"
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>

          {/* Section 2: Choose how to pay */}
          <div className="pt-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Choose how to pay</h2>
            <div className="space-y-3">
              {/* Pay in full */}
              <div
                onClick={() => setPayOption('full')}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                  payOption === 'full'
                    ? 'border-neutral-900 bg-neutral-50/50 ring-1 ring-neutral-900'
                    : 'border-neutral-300 hover:border-neutral-400'
                }`}
              >
                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm">Pay in full</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Pay the total amount now.</p>
                </div>
                <span className="font-bold text-neutral-900 text-sm">${totalPrice}</span>
              </div>

              {/* Pay part now, part later */}
              <div
                onClick={() => setPayOption('split')}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                  payOption === 'split'
                    ? 'border-neutral-900 bg-neutral-50/50 ring-1 ring-neutral-900'
                    : 'border-neutral-300 hover:border-neutral-400'
                }`}
              >
                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm">Pay part now, part later</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    ${Math.round(totalPrice / 2)} due today, ${Math.round(totalPrice / 2)} due on check-in date. No extra fees.
                  </p>
                </div>
                <span className="font-bold text-neutral-900 text-sm">${Math.round(totalPrice / 2)}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Pay with */}
          <div className="pt-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Pay with</h2>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {[
                { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
                { id: 'apple_pay', label: 'Apple Pay', icon: ShieldCheck },
                { id: 'google_pay', label: 'Google Pay', icon: Lock },
                { id: 'paypal', label: 'PayPal', icon: CheckCircle2 },
              ].map(m => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                      paymentMethod === m.id
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-300 text-neutral-800 hover:border-neutral-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mock Credit Card Form */}
            {paymentMethod === 'credit_card' && (
              <div className="border border-neutral-300 rounded-2xl overflow-hidden divide-y divide-neutral-300 bg-white">
                <div className="p-3">
                  <label className="block text-[9px] font-bold uppercase text-neutral-600">Card number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full text-xs font-medium text-neutral-900 outline-hidden mt-0.5"
                  />
                </div>
                <div className="grid grid-cols-3 divide-x divide-neutral-300">
                  <div className="p-3">
                    <label className="block text-[9px] font-bold uppercase text-neutral-600">Expiration</label>
                    <input
                      type="text"
                      value={cardExp}
                      onChange={e => setCardExp(e.target.value)}
                      className="w-full text-xs font-medium text-neutral-900 outline-hidden mt-0.5"
                    />
                  </div>
                  <div className="p-3">
                    <label className="block text-[9px] font-bold uppercase text-neutral-600">CVV</label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      className="w-full text-xs font-medium text-neutral-900 outline-hidden mt-0.5"
                    />
                  </div>
                  <div className="p-3">
                    <label className="block text-[9px] font-bold uppercase text-neutral-600">ZIP Code</label>
                    <input
                      type="text"
                      value={cardZip}
                      onChange={e => setCardZip(e.target.value)}
                      className="w-full text-xs font-medium text-neutral-900 outline-hidden mt-0.5"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Required for your trip */}
          <div className="pt-8 space-y-4">
            <h2 className="text-xl font-bold text-neutral-900">Required for your trip</h2>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Message the host (optional)
              </label>
              <textarea
                rows={3}
                placeholder="Let your host know why you're visiting and when you expect to arrive..."
                value={specialRequests}
                onChange={e => setSpecialRequests(e.target.value)}
                className="w-full text-xs p-3 border border-neutral-300 rounded-xl focus:border-neutral-900 outline-hidden leading-relaxed"
              />
            </div>
          </div>

          {/* Section 5: Cancellation Policy & Ground Rules */}
          <div className="pt-8 space-y-4 text-xs text-neutral-600 leading-relaxed">
            <h2 className="text-xl font-bold text-neutral-900">Ground rules & Cancellation policy</h2>
            <p>
              <strong className="text-neutral-900">Free cancellation for 48 hours.</strong> After that, cancel before check-in for a partial refund.
            </p>
            <p>
              We ask every guest to remember a few simple things about what makes a great guest: Follow house rules, treat your host's home like your own, and leave the place in clean condition.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] text-neutral-500">
              <Lock className="w-3.5 h-3.5" />
              <span>Payments are encrypted and secured. Real payments are mocked for this demo.</span>
            </div>
          </div>

          {/* Confirm and Pay Action Button */}
          <div className="pt-6">
            <button
              onClick={handleConfirmAndPay}
              disabled={isSubmitting}
              className="btn-airbnb w-full py-4 rounded-xl font-bold text-base shadow-airbnb-hover hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50"
            >
              {isSubmitting ? 'Confirming reservation...' : 'Confirm and pay'}
            </button>
          </div>
        </div>

        {/* Right 5 cols: Sticky Order Summary Card */}
        <div className="lg:col-span-5 sticky top-28">
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-airbnb space-y-6">
            {/* Listing Preview Header */}
            <div className="flex items-start gap-4 pb-6 border-b border-neutral-200">
              <img
                src={listing.images[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80'}
                alt={listing.title}
                className="w-24 h-24 rounded-2xl object-cover shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">
                  {listing.property_type}
                </span>
                <h3 className="font-bold text-neutral-900 text-sm truncate mt-0.5">
                  {listing.title}
                </h3>
                <p className="text-xs text-neutral-500 truncate mt-0.5">{listing.location}</p>

                <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-neutral-900">
                  <Star className="w-3.5 h-3.5 fill-current text-neutral-900" />
                  <span>{listing.rating.toFixed(2)}</span>
                  <span className="text-neutral-400">({listing.review_count} reviews)</span>
                  {listing.is_superhost && (
                    <span className="text-airbnb-brand font-medium">· Superhost</span>
                  )}
                </div>
              </div>
            </div>

            {/* Price Details */}
            <div className="space-y-3 text-xs text-neutral-700">
              <h4 className="font-bold text-neutral-900 text-sm mb-3">Price details</h4>

              <div className="flex items-center justify-between">
                <span>
                  ${Math.round(listing.price_per_night)} × {nights} night{nights > 1 ? 's' : ''}
                </span>
                <span>${basePrice}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Cleaning fee</span>
                <span>${cleaningFee}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Airbnb service fee (14%)</span>
                <span>${serviceFee}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Taxes & occupancy</span>
                <span>${taxes}</span>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between font-bold text-base text-neutral-900">
                <span>Total (USD)</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Success Modal */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-airbnb-modal border border-neutral-100 animate-scale-up space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-airbnb-brand uppercase tracking-wider">
                Booking Confirmed
              </span>
              <h3 className="text-2xl font-bold text-neutral-900 mt-1">
                You're going to {listing.city}!
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Reservation code: <strong className="text-neutral-900">{confirmedBooking.booking_code}</strong>
              </p>
            </div>

            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-xs text-left space-y-2 text-neutral-700">
              <div className="flex justify-between">
                <span className="text-neutral-500">Listing:</span>
                <span className="font-semibold text-neutral-900 truncate max-w-[200px]">{listing.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Dates:</span>
                <span className="font-semibold text-neutral-900">{confirmedBooking.check_in} to {confirmedBooking.check_out}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Guests:</span>
                <span className="font-semibold text-neutral-900">{confirmedBooking.guests_count} guests</span>
              </div>
              <div className="flex justify-between font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                <span>Total Paid:</span>
                <span>${confirmedBooking.total_price}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href="/trips"
                className="btn-airbnb block w-full py-3 rounded-xl font-bold text-xs shadow-md"
              >
                View in My Trips
              </Link>
              <Link
                href="/"
                className="block w-full py-2.5 rounded-xl border border-neutral-300 font-semibold text-xs text-neutral-700 hover:bg-neutral-50"
              >
                Explore more stays
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingCheckoutPage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-sm text-neutral-500">Loading checkout...</div>}>
      <BookingCheckoutContent />
    </React.Suspense>
  );
}
