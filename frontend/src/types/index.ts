export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  is_superhost: boolean;
  role: 'guest' | 'host' | 'both';
  phone?: string;
  joined_date?: string;
  response_rate?: number;
  response_time?: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description?: string;
}

export interface Amenity {
  id: number;
  name: string;
  category: string;
  icon: string;
}

export interface ListingImage {
  id: number;
  listing_id: number;
  url: string;
  caption?: string;
  is_cover: boolean;
  display_order: number;
}

export interface ListingCard {
  id: number;
  title: string;
  location: string;
  city: string;
  country: string;
  property_type: string;
  room_type: string;
  price_per_night: number;
  rating: number;
  review_count: number;
  is_superhost: boolean;
  is_guest_favorite: boolean;
  cover_image?: string;
  images: string[];
  latitude: number;
  longitude: number;
  category_slug?: string;
  is_wishlisted?: boolean;
}

export interface BookedDateRange {
  check_in: string;
  check_out: string;
}

export interface Review {
  id: number;
  guest: User;
  rating: number;
  cleanliness_rating: number;
  accuracy_rating: number;
  communication_rating: number;
  location_rating: number;
  checkin_rating: number;
  value_rating: number;
  comment: string;
  created_at: string;
}

export interface ListingDetail {
  id: number;
  title: string;
  description: string;
  property_type: string;
  room_type: string;
  location: string;
  address?: string;
  city: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  cleaning_fee: number;
  service_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  rating: number;
  review_count: number;
  is_superhost: boolean;
  is_guest_favorite: boolean;
  is_active: boolean;
  created_at: string;
  host: User;
  category?: Category;
  images: ListingImage[];
  amenities: Amenity[];
  reviews: Review[];
  booked_dates: BookedDateRange[];
  is_wishlisted?: boolean;
}

export interface Booking {
  id: number;
  booking_code: string;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests_count: number;
  adults: number;
  children: number;
  infants: number;
  pets: number;
  nightly_rate: number;
  total_nights: number;
  cleaning_fee: number;
  service_fee: number;
  taxes: number;
  total_price: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  payment_method: string;
  payment_status: string;
  special_requests?: string;
  created_at: string;
  listing?: ListingCard;
  guest?: User;
}

export interface PriceCalculation {
  nightly_rate: number;
  nights: number;
  base_price: number;
  cleaning_fee: number;
  service_fee: number;
  taxes: number;
  total_price: number;
  is_available: boolean;
}

export interface SearchFilters {
  location?: string;
  category?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  property_type?: string;
  room_type?: string;
  min_bedrooms?: number;
  min_beds?: number;
  min_bathrooms?: number;
  amenities?: number[];
  sort_by?: 'recommended' | 'price_low' | 'price_high' | 'rating';
}
