from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    avatar: Optional[str] = None
    bio: Optional[str] = None
    role: str = "guest"
    phone: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    is_superhost: bool = False
    joined_date: Optional[str] = None
    response_rate: Optional[int] = 100
    response_time: Optional[str] = "within an hour"
    created_at: datetime

    class Config:
        from_attributes = True


# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    slug: str
    icon: str
    description: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True


# --- Amenity Schemas ---
class AmenityBase(BaseModel):
    name: str
    category: str = "Popular"
    icon: str

class AmenityResponse(AmenityBase):
    id: int

    class Config:
        from_attributes = True


# --- Listing Image Schemas ---
class ListingImageBase(BaseModel):
    url: str
    caption: Optional[str] = None
    is_cover: bool = False
    display_order: int = 0

class ListingImageCreate(ListingImageBase):
    pass

class ListingImageResponse(ListingImageBase):
    id: int
    listing_id: int

    class Config:
        from_attributes = True


# --- Listing Schemas ---
class ListingBase(BaseModel):
    title: str
    description: str
    property_type: str = "Entire villa"
    room_type: str = "Entire place"
    location: str
    address: Optional[str] = None
    city: str
    state: Optional[str] = None
    country: str
    latitude: float = 40.6281
    longitude: float = 14.4850
    price_per_night: float
    cleaning_fee: float = 75.0
    service_fee: float = 45.0
    max_guests: int = 4
    bedrooms: int = 2
    beds: int = 2
    bathrooms: float = 2.0
    category_id: Optional[int] = None

class ListingCreate(ListingBase):
    host_id: int
    images: List[str] = [] # list of image URLs
    amenity_ids: List[int] = []

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[str] = None
    room_type: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: Optional[float] = None
    cleaning_fee: Optional[float] = None
    service_fee: Optional[float] = None
    max_guests: Optional[int] = None
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    bathrooms: Optional[float] = None
    category_id: Optional[int] = None
    images: Optional[List[str]] = None
    amenity_ids: Optional[List[int]] = None
    is_active: Optional[bool] = None

# Card view response for home search/grid
class ListingCardResponse(BaseModel):
    id: int
    title: str
    location: str
    city: str
    country: str
    property_type: str
    room_type: str
    price_per_night: float
    rating: float
    review_count: int
    is_superhost: bool
    is_guest_favorite: bool
    cover_image: Optional[str] = None
    images: List[str] = []
    latitude: float
    longitude: float
    category_slug: Optional[str] = None
    is_wishlisted: bool = False

    class Config:
        from_attributes = True

# Detailed response for listing page
class ReviewResponse(BaseModel):
    id: int
    guest: UserResponse
    rating: float
    cleanliness_rating: float = 5.0
    accuracy_rating: float = 5.0
    communication_rating: float = 5.0
    location_rating: float = 5.0
    checkin_rating: float = 5.0
    value_rating: float = 5.0
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True

class BookedDateRange(BaseModel):
    check_in: date
    check_out: date

class ListingDetailResponse(BaseModel):
    id: int
    title: str
    description: str
    property_type: str
    room_type: str
    location: str
    address: Optional[str]
    city: str
    state: Optional[str]
    country: str
    latitude: float
    longitude: float
    price_per_night: float
    cleaning_fee: float
    service_fee: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float
    rating: float
    review_count: int
    is_superhost: bool
    is_guest_favorite: bool
    is_active: bool
    created_at: datetime

    host: UserResponse
    category: Optional[CategoryResponse] = None
    images: List[ListingImageResponse] = []
    amenities: List[AmenityResponse] = []
    reviews: List[ReviewResponse] = []
    booked_dates: List[BookedDateRange] = []
    is_wishlisted: bool = False

    class Config:
        from_attributes = True


# --- Booking Schemas ---
class BookingCreate(BaseModel):
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    adults: int = 1
    children: int = 0
    infants: int = 0
    pets: int = 0
    payment_method: str = "credit_card"
    special_requests: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    booking_code: str
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests_count: int
    adults: int
    children: int
    infants: int
    pets: int
    nightly_rate: float
    total_nights: int
    cleaning_fee: float
    service_fee: float
    taxes: float
    total_price: float
    status: str
    payment_method: str
    payment_status: str
    special_requests: Optional[str] = None
    created_at: datetime

    listing: Optional[ListingCardResponse] = None
    guest: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# --- Review Create Schema ---
class ReviewCreate(BaseModel):
    listing_id: int
    guest_id: int
    booking_id: Optional[int] = None
    rating: float = Field(ge=1.0, le=5.0)
    cleanliness_rating: float = Field(default=5.0, ge=1.0, le=5.0)
    accuracy_rating: float = Field(default=5.0, ge=1.0, le=5.0)
    communication_rating: float = Field(default=5.0, ge=1.0, le=5.0)
    location_rating: float = Field(default=5.0, ge=1.0, le=5.0)
    checkin_rating: float = Field(default=5.0, ge=1.0, le=5.0)
    value_rating: float = Field(default=5.0, ge=1.0, le=5.0)
    comment: str


# --- Wishlist Schemas ---
class WishlistToggle(BaseModel):
    user_id: int
    listing_id: int


# --- Price Calculation Schema ---
class PriceCalculationRequest(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guests_count: int = 1

class PriceCalculationResponse(BaseModel):
    nightly_rate: float
    nights: int
    base_price: float
    cleaning_fee: float
    service_fee: float
    taxes: float
    total_price: float
    is_available: bool
