'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Star,
  Share2,
  Heart,
  Grid,
  ShieldCheck,
  Sparkles,
  MapPin,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  X,
  Award,
  Clock,
  Key,
  Wifi,
  Tv,
  Bath,
  Wind,
  Car,
  Utensils,
  Flame,
  WashingMachine,
  Zap,
  Dumbbell,
  Coffee,
  CheckCircle2,
  BedDouble,
  DoorOpen
} from 'lucide-react';
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  isAfter,
  startOfToday,
  addDays,
  parseISO
} from 'date-fns';

import { api } from '@/lib/api';
import { ListingDetail, Amenity, Review } from '@/types';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';

// Amenity icon mapper
const AMENITY_ICON_MAP: Record<string, React.ElementType> = {
  Wifi,
  Waves: Bath,
  Bath,
  Utensils,
  Car,
  Wind,
  Laptop: Wifi,
  Palmtree: Sparkles,
  Zap,
  Flame,
  WashingMachine,
  Key,
  Eye: Sparkles,
  Mountain: Sparkles,
  Sparkles,
  Tv,
  Coffee,
  Sun: Sparkles,
  Dumbbell,
  Flower: Sparkles,
  Baby: ShieldCheck,
};

function ListingDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useUser();
  const { toast, success } = useToast();

  const listingId = parseInt(params.id as string, 10);

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Modals state
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [isAmenitiesModalOpen, setIsAmenitiesModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Date selection state
  const today = startOfToday();
  const [checkIn, setCheckIn] = useState<Date | null>(
    searchParams.get('check_in') ? new Date(searchParams.get('check_in')!) : null
  );
  const [checkOut, setCheckOut] = useState<Date | null>(
    searchParams.get('check_out') ? new Date(searchParams.get('check_out')!) : null
  );

  // Guests dropdown
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [adults, setAdults] = useState(parseInt(searchParams.get('adults') || '1', 10));
  const [children, setChildren] = useState(parseInt(searchParams.get('children') || '0', 10));
  const [infants, setInfants] = useState(parseInt(searchParams.get('infants') || '0', 10));

  // Reviews submission state
  const [newRating, setNewRating] = useState(5.0);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Leaflet map container ref
  const detailMapRef = useRef<HTMLDivElement>(null);

  // Load listing detail
  useEffect(() => {
    async function loadDetail() {
      setIsLoading(true);
      try {
        const data = await api.getListingDetail(listingId, currentUser?.id);
        setListing(data);
        setIsWishlisted(data.is_wishlisted || false);
      } catch (err) {
        console.error('Failed to load listing:', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (listingId) {
      loadDetail();
    }
  }, [listingId, currentUser?.id]);

  // Load Leaflet map for detail page
  useEffect(() => {
    if (!listing || !detailMapRef.current || typeof window === 'undefined') return;

    let isMounted = true;
    const initDetailMap = async () => {
      const L = (await import('leaflet')).default;

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!isMounted || !detailMapRef.current) return;

      // Clean inner html before init if already has map
      detailMapRef.current.innerHTML = '';

      const map = L.map(detailMapRef.current, {
        center: [listing.latitude, listing.longitude],
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '© OpenStreetMap contributors © CARTO',
          maxZoom: 19,
        }
      ).addTo(map);

      // Airbnb circular pin
      const circleIcon = L.divIcon({
        html: `
          <div class="w-12 h-12 rounded-full bg-airbnb-brand/20 flex items-center justify-center border-2 border-airbnb-brand animate-pulse">
            <div class="w-5 h-5 rounded-full bg-airbnb-brand shadow-lg"></div>
          </div>
        `,
        className: 'custom-detail-pin',
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });

      L.marker([listing.latitude, listing.longitude], { icon: circleIcon }).addTo(map);
    };

    initDetailMap();

    return () => {
      isMounted = false;
    };
  }, [listing]);

  if (isLoading || !listing) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 md:px-12 py-10 animate-pulse space-y-6">
        <div className="h-8 bg-neutral-200 rounded-md w-2/3" />
        <div className="h-4 bg-neutral-200 rounded-md w-1/3" />
        <div className="aspect-21/9 bg-neutral-200 rounded-3xl w-full" />
      </div>
    );
  }

  const totalGuests = adults + children;

  // Check if date is booked
  const isDateBooked = (date: Date) => {
    return listing.booked_dates.some(b => {
      const start = parseISO(b.check_in);
      const end = parseISO(b.check_out);
      return (
        (isSameDay(date, start) || isAfter(date, start)) &&
        isBefore(date, end)
      );
    });
  };

  const handleDateClick = (day: Date) => {
    if (isBefore(day, today) || isDateBooked(day)) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(day);
      setCheckOut(null);
    } else if (checkIn && !checkOut) {
      if (isBefore(day, checkIn)) {
        setCheckIn(day);
      } else {
        // Check if any booked date falls inside selected range
        const daysInRange = eachDayOfInterval({ start: checkIn, end: day });
        const hasCollision = daysInRange.some(d => isDateBooked(d));

        if (hasCollision) {
          toast('Selected dates include unavailable days. Please select an open range.', {
            type: 'error',
          });
          return;
        }

        setCheckOut(day);
      }
    }
  };

  // Pricing calculations
  const nights = checkIn && checkOut ? Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const basePrice = nights * listing.price_per_night;
  const cleaningFee = nights > 0 ? listing.cleaning_fee : 0;
  const serviceFee = nights > 0 ? Math.round(basePrice * 0.14) : 0;
  const taxes = nights > 0 ? Math.round((basePrice + cleaningFee + serviceFee) * 0.08) : 0;
  const totalPrice = basePrice + cleaningFee + serviceFee + taxes;

  const handleReserve = () => {
    if (!checkIn || !checkOut) {
      toast('Please select check-in and checkout dates', { type: 'info' });
      return;
    }

    const checkInStr = format(checkIn, 'yyyy-MM-dd');
    const checkOutStr = format(checkOut, 'yyyy-MM-dd');

    router.push(
      `/book/${listing.id}?check_in=${checkInStr}&check_out=${checkOutStr}&adults=${adults}&children=${children}&infants=${infants}`
    );
  };

  const handleToggleWishlist = async () => {
    if (!currentUser) {
      toast('Please select a user to save to wishlists', { type: 'info' });
      return;
    }

    const nextState = !isWishlisted;
    setIsWishlisted(nextState);

    try {
      await api.toggleWishlist(currentUser.id, listing.id);
      success(nextState ? 'Saved to Wishlist' : 'Removed from Wishlist');
    } catch (err) {
      setIsWishlisted(!nextState);
      toast('Failed to update wishlist', { type: 'error' });
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      success('Link copied to clipboard!');
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast('Please select a user to write a review', { type: 'info' });
      return;
    }
    if (!newComment.trim()) {
      toast('Please enter a review comment', { type: 'error' });
      return;
    }

    setIsSubmittingReview(true);
    try {
      const created = await api.createReview({
        listing_id: listing.id,
        guest_id: currentUser.id,
        rating: newRating,
        comment: newComment.trim(),
      });

      setListing(prev => prev ? {
        ...prev,
        reviews: [created, ...prev.reviews],
        review_count: prev.review_count + 1,
        rating: Number(((prev.rating * prev.review_count + newRating) / (prev.review_count + 1)).toFixed(2))
      } : null);

      setIsReviewModalOpen(false);
      setNewComment('');
      success('Review submitted successfully! Thank you for sharing your feedback.');
    } catch (err: any) {
      toast(err.message || 'Failed to submit review', { type: 'error' });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const images = listing.images && listing.images.length > 0
    ? listing.images.map(img => img.url)
    : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'];

  const renderCalendarMonth = (monthDate: Date) => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start, end });
    const firstDayIndex = start.getDay();

    return (
      <div className="w-full">
        <h4 className="text-center font-semibold text-neutral-900 text-sm mb-3">
          {format(monthDate, 'MMMM yyyy')}
        </h4>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-neutral-400 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}

          {days.map(day => {
            const isPast = isBefore(day, today);
            const isBooked = isDateBooked(day);
            const isStart = checkIn && isSameDay(day, checkIn);
            const isEnd = checkOut && isSameDay(day, checkOut);
            const isInRange =
              checkIn && checkOut && isAfter(day, checkIn) && isBefore(day, checkOut);

            let dayClasses = 'h-10 w-full rounded-full flex items-center justify-center text-xs font-medium transition ';

            if (isPast || isBooked) {
              dayClasses += 'text-neutral-300 line-through cursor-not-allowed';
            } else if (isStart || isEnd) {
              dayClasses += 'bg-neutral-900 text-white font-bold cursor-pointer';
            } else if (isInRange) {
              dayClasses += 'bg-neutral-100 text-neutral-900 rounded-none cursor-pointer';
            } else {
              dayClasses += 'text-neutral-900 hover:bg-neutral-100 cursor-pointer';
            }

            return (
              <button
                key={day.toISOString()}
                disabled={isPast || isBooked}
                onClick={() => handleDateClick(day)}
                className={dayClasses}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 md:px-12 py-6">
      {/* 1. Header Title & Actions */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          {listing.title}
        </h1>

        <div className="flex items-center justify-between flex-wrap gap-4 mt-2 text-sm text-neutral-700">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 font-semibold text-neutral-900">
              <Star className="w-4 h-4 fill-current" />
              <span>{listing.rating.toFixed(2)}</span>
            </div>
            <span>·</span>
            <button
              onClick={() => {
                document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="font-semibold underline hover:text-neutral-900"
            >
              {listing.review_count} reviews
            </button>
            {listing.is_superhost && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1 font-medium">
                  <Award className="w-4 h-4 text-airbnb-brand" /> Superhost
                </span>
              </>
            )}
            <span>·</span>
            <span className="font-medium underline">{listing.location}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-xs font-semibold py-2 px-3 hover:bg-neutral-100 rounded-lg transition underline"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button
              onClick={handleToggleWishlist}
              className="flex items-center gap-2 text-xs font-semibold py-2 px-3 hover:bg-neutral-100 rounded-lg transition underline"
            >
              <Heart
                className={`w-4 h-4 ${
                  isWishlisted ? 'fill-airbnb-brand text-airbnb-brand' : 'text-neutral-700'
                }`}
              />
              <span>{isWishlisted ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Photo Hero Grid (Airbnb 5-Photo Layout) */}
      <div className="relative rounded-3xl overflow-hidden mb-10 group">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[340px] sm:h-[420px] md:h-[480px]">
          {/* Main Hero (Left 2 cols) */}
          <div
            onClick={() => {
              setActivePhotoIndex(0);
              setIsPhotosModalOpen(true);
            }}
            className="md:col-span-2 h-full cursor-pointer overflow-hidden relative"
          >
            <img
              src={images[0]}
              alt={listing.title}
              className="w-full h-full object-cover hover:opacity-90 transition duration-300"
            />
          </div>

          {/* Right 4-Grid (2 cols, 2 rows) */}
          <div className="hidden md:grid col-span-2 grid-cols-2 gap-2 h-full">
            {images.slice(1, 5).map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setActivePhotoIndex(idx + 1);
                  setIsPhotosModalOpen(true);
                }}
                className="h-full cursor-pointer overflow-hidden relative"
              >
                <img
                  src={imgUrl}
                  alt={`${listing.title} photo ${idx + 2}`}
                  className="w-full h-full object-cover hover:opacity-90 transition duration-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* "Show all photos" Button */}
        <button
          onClick={() => setIsPhotosModalOpen(true)}
          className="absolute bottom-5 right-5 flex items-center gap-2 bg-white/95 hover:bg-white text-neutral-900 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition border border-neutral-300"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Show all {images.length} photos</span>
        </button>
      </div>

      {/* 3. Main Content Split Layout (Left Details, Right Sticky Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative items-start">
        {/* LEFT COLUMN: Details */}
        <div className="lg:col-span-2 divide-y divide-neutral-200">
          {/* Host Info Banner */}
          <div className="pb-8 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                {listing.property_type} hosted by {listing.host.name}
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                {listing.max_guests} guests · {listing.bedrooms} bedroom{listing.bedrooms > 1 ? 's' : ''} · {listing.beds} bed{listing.beds > 1 ? 's' : ''} · {listing.bathrooms} bath{listing.bathrooms > 1 ? 's' : ''}
              </p>
            </div>
            {listing.host.avatar ? (
              <img
                src={listing.host.avatar}
                alt={listing.host.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-neutral-200 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold text-lg">
                {listing.host.name[0]}
              </div>
            )}
          </div>

          {/* Highlights */}
          <div className="py-8 space-y-6">
            <div className="flex items-start gap-4">
              <DoorOpen className="w-6 h-6 text-neutral-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-neutral-900 text-sm">Self check-in</h4>
                <p className="text-xs text-neutral-500 mt-0.5">Check yourself in with the smart lock.</p>
              </div>
            </div>

            {listing.is_superhost && (
              <div className="flex items-start gap-4">
                <Award className="w-6 h-6 text-neutral-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm">{listing.host.name} is a Superhost</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Superhosts are experienced, highly rated hosts who are committed to providing great stays.</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-neutral-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-neutral-900 text-sm">Great location</h4>
                <p className="text-xs text-neutral-500 mt-0.5">100% of recent guests gave the location a 5-star rating.</p>
              </div>
            </div>
          </div>

          {/* AirCover Banner */}
          <div className="py-8">
            <div className="flex items-center gap-1 text-airbnb-brand font-black text-xl tracking-tighter">
              <span>air</span>
              <span className="text-neutral-900">cover</span>
            </div>
            <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
              Every booking includes free protection from Host cancellations, listing inaccuracies, and other issues like trouble checking in.
            </p>
          </div>

          {/* Description */}
          <div className="py-8">
            <h3 className="text-lg font-bold text-neutral-900 mb-3">About this place</h3>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Where you'll sleep */}
          <div className="py-8">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Where you'll sleep</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: listing.bedrooms }).map((_, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-neutral-200">
                  <BedDouble className="w-6 h-6 text-neutral-700 mb-3" />
                  <h5 className="font-semibold text-neutral-900 text-sm">Bedroom {idx + 1}</h5>
                  <p className="text-xs text-neutral-500 mt-1">1 queen bed / king bed</p>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="py-8">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">What this place offers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              {listing.amenities.slice(0, 8).map(amenity => {
                const Icon = AMENITY_ICON_MAP[amenity.icon] || Sparkles;
                return (
                  <div key={amenity.id} className="flex items-center gap-3.5 text-neutral-800 text-sm">
                    <Icon className="w-5 h-5 text-neutral-600 shrink-0" />
                    <span>{amenity.name}</span>
                  </div>
                );
              })}
            </div>

            {listing.amenities.length > 8 && (
              <button
                onClick={() => setIsAmenitiesModalOpen(true)}
                className="mt-6 px-6 py-3 rounded-xl border border-neutral-900 text-xs font-semibold hover:bg-neutral-50 transition"
              >
                Show all {listing.amenities.length} amenities
              </button>
            )}
          </div>

          {/* Availability Calendar */}
          <div className="py-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Select checkout date</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {checkIn && checkOut
                    ? `${format(checkIn, 'MMM d, yyyy')} – ${format(checkOut, 'MMM d, yyyy')} (${nights} nights)`
                    : checkIn
                    ? `Minimum stay: 1 night`
                    : 'Add your travel dates for exact pricing'}
                </p>
              </div>

              {(checkIn || checkOut) && (
                <button
                  onClick={() => {
                    setCheckIn(null);
                    setCheckOut(null);
                  }}
                  className="text-xs font-semibold underline text-neutral-800 hover:text-neutral-900"
                >
                  Clear dates
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-neutral-200 rounded-3xl p-6">
              {renderCalendarMonth(calendarMonth)}
              {renderCalendarMonth(addMonths(calendarMonth, 1))}
            </div>
          </div>

          {/* Reviews Section */}
          <div id="reviews-section" className="py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-xl font-bold text-neutral-900">
                <Star className="w-6 h-6 fill-current text-neutral-900" />
                <span>{listing.rating.toFixed(2)} · {listing.review_count} reviews</span>
              </div>

              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="px-4 py-2 rounded-xl border border-neutral-900 text-xs font-semibold hover:bg-neutral-50 transition"
              >
                Leave a review
              </button>
            </div>

            {/* Category Score Bars */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-3 mb-8">
              {[
                { name: 'Cleanliness', score: '5.0' },
                { name: 'Accuracy', score: '4.9' },
                { name: 'Communication', score: '5.0' },
                { name: 'Location', score: '4.9' },
                { name: 'Check-in', score: '5.0' },
                { name: 'Value', score: '4.8' },
              ].map(cat => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <span className="text-neutral-700">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1 bg-neutral-200 rounded-full overflow-hidden">
                      <div className="bg-neutral-900 h-full w-[96%]" />
                    </div>
                    <span className="font-semibold text-neutral-900 w-6 text-right">{cat.score}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Review Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listing.reviews.map(rev => (
                <div key={rev.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    {rev.guest.avatar ? (
                      <img
                        src={rev.guest.avatar}
                        alt={rev.guest.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-neutral-600 text-white flex items-center justify-center text-xs font-bold">
                        {rev.guest.name[0]}
                      </div>
                    )}
                    <div>
                      <h5 className="text-sm font-semibold text-neutral-900">{rev.guest.name}</h5>
                      <p className="text-[11px] text-neutral-400">
                        {format(new Date(rev.created_at), 'MMMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Location Map */}
          <div className="py-8">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Where you'll be</h3>
            <p className="text-xs text-neutral-600 mb-4">{listing.location}</p>
            <div className="h-80 w-full rounded-3xl overflow-hidden border border-neutral-200">
              <div ref={detailMapRef} className="w-full h-full" />
            </div>
          </div>

          {/* Host Profile Box */}
          <div className="py-8 space-y-4">
            <div className="flex items-center gap-4">
              {listing.host.avatar ? (
                <img
                  src={listing.host.avatar}
                  alt={listing.host.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-neutral-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold text-xl">
                  {listing.host.name[0]}
                </div>
              )}
              <div>
                <h4 className="text-lg font-bold text-neutral-900">Hosted by {listing.host.name}</h4>
                <p className="text-xs text-neutral-500">Joined in {listing.host.joined_date || 'October 2023'}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-neutral-700">
              <div className="flex items-center gap-1.5 font-medium">
                <Star className="w-4 h-4 fill-current text-neutral-900" />
                <span>{listing.rating.toFixed(2)} Rating</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Identity verified</span>
              </div>
              {listing.is_superhost && (
                <div className="flex items-center gap-1.5 font-medium">
                  <Award className="w-4 h-4 text-airbnb-brand" />
                  <span>Superhost</span>
                </div>
              )}
            </div>

            {listing.host.bio && (
              <p className="text-xs text-neutral-600 leading-relaxed pt-2 max-w-xl">
                {listing.host.bio}
              </p>
            )}

            <div className="pt-2 text-xs text-neutral-500 space-y-1">
              <p>Response rate: <span className="font-semibold text-neutral-900">{listing.host.response_rate || 100}%</span></p>
              <p>Response time: <span className="font-semibold text-neutral-900">{listing.host.response_time || 'within an hour'}</span></p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Reservation Card */}
        <div className="lg:col-span-1 sticky top-28 z-20">
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-airbnb space-y-5">
            {/* Header: Price & Rating */}
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-neutral-900">
                  ${Math.round(listing.price_per_night)}
                </span>
                <span className="text-sm text-neutral-500">night</span>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-neutral-900">
                <Star className="w-3.5 h-3.5 fill-current text-neutral-900" />
                <span>{listing.rating.toFixed(2)}</span>
                <span className="text-neutral-400">·</span>
                <span className="text-neutral-500 underline">{listing.review_count} reviews</span>
              </div>
            </div>

            {/* Inputs Box: Check-in / Checkout & Guests */}
            <div className="border border-neutral-300 rounded-2xl overflow-hidden divide-y divide-neutral-300">
              {/* Dates */}
              <div className="grid grid-cols-2 divide-x divide-neutral-300">
                <div
                  onClick={() => {
                    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="p-3 cursor-pointer hover:bg-neutral-50"
                >
                  <span className="block text-[9px] font-bold uppercase text-neutral-800">Check-in</span>
                  <span className="text-xs font-medium text-neutral-900 block truncate">
                    {checkIn ? format(checkIn, 'MM/dd/yyyy') : 'Add date'}
                  </span>
                </div>

                <div
                  onClick={() => {
                    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="p-3 cursor-pointer hover:bg-neutral-50"
                >
                  <span className="block text-[9px] font-bold uppercase text-neutral-800">Checkout</span>
                  <span className="text-xs font-medium text-neutral-900 block truncate">
                    {checkOut ? format(checkOut, 'MM/dd/yyyy') : 'Add date'}
                  </span>
                </div>
              </div>

              {/* Guests Dropdown Trigger */}
              <div className="relative">
                <div
                  onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-neutral-50"
                >
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-neutral-800">Guests</span>
                    <span className="text-xs font-medium text-neutral-900 block">
                      {totalGuests} guest{totalGuests > 1 ? 's' : ''}
                      {infants > 0 ? `, ${infants} infant` : ''}
                    </span>
                  </div>
                  {isGuestDropdownOpen ? <ChevronUp className="w-4 h-4 text-neutral-600" /> : <ChevronDown className="w-4 h-4 text-neutral-600" />}
                </div>

                {/* Guests Popover */}
                {isGuestDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-2xl shadow-airbnb-modal p-4 space-y-4 z-30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h6 className="text-xs font-semibold text-neutral-900">Adults</h6>
                        <span className="text-[10px] text-neutral-400">Age 13+</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          disabled={adults <= 1}
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-7 h-7 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-30"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold w-4 text-center">{adults}</span>
                        <button
                          disabled={totalGuests >= listing.max_guests}
                          onClick={() => setAdults(adults + 1)}
                          className="w-7 h-7 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h6 className="text-xs font-semibold text-neutral-900">Children</h6>
                        <span className="text-[10px] text-neutral-400">Ages 2–12</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          disabled={children <= 0}
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="w-7 h-7 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-30"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold w-4 text-center">{children}</span>
                        <button
                          disabled={totalGuests >= listing.max_guests}
                          onClick={() => setChildren(children + 1)}
                          className="w-7 h-7 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsGuestDropdownOpen(false)}
                      className="w-full text-right text-xs font-bold text-neutral-900 underline pt-2"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Reserve Action Button */}
            <button
              onClick={handleReserve}
              className="btn-airbnb w-full py-3.5 rounded-xl font-semibold text-sm shadow-md transition"
            >
              {checkIn && checkOut ? 'Reserve' : 'Check availability'}
            </button>

            <p className="text-center text-xs text-neutral-500">
              You won't be charged yet
            </p>

            {/* Price Itemized Breakdown (if dates selected) */}
            {checkIn && checkOut && nights > 0 && (
              <div className="space-y-3 pt-3 border-t border-neutral-200 text-xs text-neutral-700">
                <div className="flex items-center justify-between">
                  <span className="underline">
                    ${Math.round(listing.price_per_night)} × {nights} night{nights > 1 ? 's' : ''}
                  </span>
                  <span>${basePrice}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="underline">Cleaning fee</span>
                  <span>${cleaningFee}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="underline">Airbnb service fee</span>
                  <span>${serviceFee}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="underline">Taxes & occupancy</span>
                  <span>${taxes}</span>
                </div>

                <div className="pt-3 border-t border-neutral-200 flex items-center justify-between font-bold text-sm text-neutral-900">
                  <span>Total before taxes</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Full Photo Gallery */}
      {isPhotosModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-6 animate-fade-in text-white">
          <div className="flex items-center justify-between max-w-6xl mx-auto w-full mb-4">
            <span className="text-xs font-semibold text-neutral-400">
              {activePhotoIndex + 1} / {images.length}
            </span>
            <button
              onClick={() => setIsPhotosModalOpen(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>

          {/* Main Photo View */}
          <div className="max-w-4xl mx-auto flex-1 flex items-center justify-center relative w-full">
            <img
              src={images[activePhotoIndex]}
              alt={`Photo ${activePhotoIndex + 1}`}
              className="max-h-[72vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
          </div>

          {/* Thumbnails Row */}
          <div className="max-w-4xl mx-auto w-full flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIndex(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 transition border-2 ${
                  activePhotoIndex === idx ? 'border-white scale-105' : 'border-transparent opacity-50 hover:opacity-80'
                }`}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 2: All Amenities Modal */}
      {isAmenitiesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden border border-neutral-100 shadow-airbnb-modal">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-base">What this place offers</h3>
              <button
                onClick={() => setIsAmenitiesModalOpen(false)}
                className="p-1.5 hover:bg-neutral-100 rounded-full"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 divide-y divide-neutral-100">
              {listing.amenities.map(a => {
                const Icon = AMENITY_ICON_MAP[a.icon] || Sparkles;
                return (
                  <div key={a.id} className="pt-3 flex items-center gap-3.5 text-neutral-800 text-xs">
                    <Icon className="w-5 h-5 text-neutral-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-neutral-900">{a.name}</p>
                      <p className="text-[10px] text-neutral-400">{a.category}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Leave a Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden border border-neutral-100 shadow-airbnb-modal p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900 text-base">Write a Review</h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 hover:bg-neutral-100 rounded-full"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-neutral-800 ml-2">{newRating}.0 / 5.0</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Your Review
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details of your stay, host communication, cleanliness, and tips for future guests..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="w-full text-xs p-3 border border-neutral-300 rounded-xl focus:border-neutral-900 outline-hidden leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="btn-airbnb px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ListingDetailPage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-sm text-neutral-500">Loading stay details...</div>}>
      <ListingDetailContent />
    </React.Suspense>
  );
}
