import {
  ListingCard,
  ListingDetail,
  Booking,
  Review,
  User,
  Category,
  Amenity,
  PriceCalculation,
  SearchFilters
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errorDetail = 'An error occurred';
    try {
      const data = await res.json();
      errorDetail = data.detail || errorDetail;
    } catch (e) {
      errorDetail = res.statusText;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // --- Listings ---
  async getListings(filters: SearchFilters = {}, userId?: number): Promise<ListingCard[]> {
    const params = new URLSearchParams();

    if (filters.location) params.append('location', filters.location);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.check_in) params.append('check_in', filters.check_in);
    if (filters.check_out) params.append('check_out', filters.check_out);
    if (filters.guests && filters.guests > 1) params.append('guests', filters.guests.toString());
    if (filters.min_price !== undefined) params.append('min_price', filters.min_price.toString());
    if (filters.max_price !== undefined) params.append('max_price', filters.max_price.toString());
    if (filters.property_type) params.append('property_type', filters.property_type);
    if (filters.room_type) params.append('room_type', filters.room_type);
    if (filters.min_bedrooms) params.append('min_bedrooms', filters.min_bedrooms.toString());
    if (filters.min_beds) params.append('min_beds', filters.min_beds.toString());
    if (filters.min_bathrooms) params.append('min_bathrooms', filters.min_bathrooms.toString());
    if (filters.amenities && filters.amenities.length > 0) {
      params.append('amenities', filters.amenities.join(','));
    }
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (userId) params.append('user_id', userId.toString());

    return fetchJson<ListingCard[]>(`${API_BASE}/listings?${params.toString()}`);
  },

  async getListingDetail(id: number, userId?: number): Promise<ListingDetail> {
    const url = userId ? `${API_BASE}/listings/${id}?user_id=${userId}` : `${API_BASE}/listings/${id}`;
    return fetchJson<ListingDetail>(url);
  },

  async createListing(payload: any): Promise<ListingDetail> {
    return fetchJson<ListingDetail>(`${API_BASE}/listings`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateListing(id: number, payload: any): Promise<ListingDetail> {
    return fetchJson<ListingDetail>(`${API_BASE}/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteListing(id: number): Promise<{ message: string; id: number }> {
    return fetchJson<{ message: string; id: number }>(`${API_BASE}/listings/${id}`, {
      method: 'DELETE',
    });
  },

  async getHostListings(hostId: number): Promise<ListingCard[]> {
    return fetchJson<ListingCard[]>(`${API_BASE}/listings?host_id=${hostId}&is_active=false`);
  },

  async calculatePrice(payload: {
    listing_id: number;
    check_in: string;
    check_out: string;
    guests_count: number;
  }): Promise<PriceCalculation> {
    return fetchJson<PriceCalculation>(`${API_BASE}/listings/calculate-price`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // --- Bookings ---
  async createBooking(payload: {
    listing_id: number;
    guest_id: number;
    check_in: string;
    check_out: string;
    adults: number;
    children: number;
    infants: number;
    pets: number;
    payment_method: string;
    special_requests?: string;
  }): Promise<Booking> {
    return fetchJson<Booking>(`${API_BASE}/bookings`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getUserTrips(userId: number, statusFilter?: string): Promise<Booking[]> {
    const url = statusFilter
      ? `${API_BASE}/bookings/user/${userId}?status_filter=${statusFilter}`
      : `${API_BASE}/bookings/user/${userId}`;
    return fetchJson<Booking[]>(url);
  },

  async getHostReservations(hostId: number): Promise<Booking[]> {
    return fetchJson<Booking[]>(`${API_BASE}/bookings/host/${hostId}`);
  },

  async getBooking(bookingId: number): Promise<Booking> {
    return fetchJson<Booking>(`${API_BASE}/bookings/${bookingId}`);
  },

  async cancelBooking(bookingId: number): Promise<Booking> {
    return fetchJson<Booking>(`${API_BASE}/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  },

  // --- Reviews ---
  async createReview(payload: {
    listing_id: number;
    guest_id: number;
    booking_id?: number;
    rating: number;
    cleanliness_rating?: number;
    accuracy_rating?: number;
    communication_rating?: number;
    location_rating?: number;
    checkin_rating?: number;
    value_rating?: number;
    comment: string;
  }): Promise<Review> {
    return fetchJson<Review>(`${API_BASE}/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getListingReviews(listingId: number): Promise<Review[]> {
    return fetchJson<Review[]>(`${API_BASE}/reviews/listing/${listingId}`);
  },

  // --- Wishlist ---
  async toggleWishlist(userId: number, listingId: number): Promise<{ is_wishlisted: boolean; listing_id: number }> {
    return fetchJson<{ is_wishlisted: boolean; listing_id: number }>(`${API_BASE}/wishlists/toggle`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, listing_id: listingId }),
    });
  },

  async getUserWishlist(userId: number): Promise<ListingCard[]> {
    return fetchJson<ListingCard[]>(`${API_BASE}/wishlists/user/${userId}`);
  },

  // --- Users ---
  async getUsers(): Promise<User[]> {
    return fetchJson<User[]>(`${API_BASE}/users`);
  },

  async getUser(id: number): Promise<User> {
    return fetchJson<User>(`${API_BASE}/users/${id}`);
  },

  // --- Metadata ---
  async getCategories(): Promise<Category[]> {
    return fetchJson<Category[]>(`${API_BASE}/categories`);
  },

  async getAmenities(): Promise<Amenity[]> {
    return fetchJson<Amenity[]>(`${API_BASE}/amenities`);
  },
};
