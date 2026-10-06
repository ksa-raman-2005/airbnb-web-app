from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, Date, DateTime, ForeignKey, Table
)
from sqlalchemy.orm import relationship
from app.database import Base

# Association table for Listing <-> Amenity many-to-many relationship
listing_amenities = Table(
    "listing_amenities",
    Base.metadata,
    Column("listing_id", Integer, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    avatar = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    is_superhost = Column(Boolean, default=False)
    role = Column(String(50), default="guest") # guest, host, both
    phone = Column(String(50), nullable=True)
    joined_date = Column(String(50), default="October 2023")
    response_rate = Column(Integer, default=100)
    response_time = Column(String(50), default="within an hour")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    listings = relationship("Listing", back_populates="host", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="guest", foreign_keys="[Booking.guest_id]", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="guest", cascade="all, delete-orphan")
    wishlists = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    icon = Column(String(50), nullable=False) # icon name for frontend
    description = Column(String(255), nullable=True)

    listings = relationship("Listing", back_populates="category")


class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    category = Column(String(100), default="Popular") # Popular, Bathroom, Kitchen, Safety, Outdoor, etc.
    icon = Column(String(50), nullable=False)

    listings = relationship("Listing", secondary=listing_amenities, back_populates="amenities")


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    property_type = Column(String(100), nullable=False, default="Entire villa") # Villa, Apartment, Cabin, House, etc.
    room_type = Column(String(100), nullable=False, default="Entire place") # Entire place, Private room, Shared room
    
    # Location
    location = Column(String(255), nullable=False) # e.g. "Positano, Amalfi Coast, Italy"
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False, default=40.6281)
    longitude = Column(Float, nullable=False, default=14.4850)

    # Pricing & Capacity
    price_per_night = Column(Float, nullable=False)
    cleaning_fee = Column(Float, default=75.0)
    service_fee = Column(Float, default=45.0)
    max_guests = Column(Integer, default=4)
    bedrooms = Column(Integer, default=2)
    beds = Column(Integer, default=2)
    bathrooms = Column(Float, default=2.0)

    # Badges & Status
    rating = Column(Float, default=4.95)
    review_count = Column(Integer, default=0)
    is_superhost = Column(Boolean, default=False)
    is_guest_favorite = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    host = relationship("User", back_populates="listings")
    category = relationship("Category", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan", order_by="ListingImage.display_order")
    amenities = relationship("Amenity", secondary=listing_amenities, back_populates="listings")
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan")
    wishlisted_by = relationship("Wishlist", back_populates="listing", cascade="all, delete-orphan")


class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    url = Column(String(1000), nullable=False)
    caption = Column(String(255), nullable=True)
    is_cover = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)

    listing = relationship("Listing", back_populates="images")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_code = Column(String(50), unique=True, index=True, nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    guest_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    
    guests_count = Column(Integer, default=1)
    adults = Column(Integer, default=1)
    children = Column(Integer, default=0)
    infants = Column(Integer, default=0)
    pets = Column(Integer, default=0)

    nightly_rate = Column(Float, nullable=False)
    total_nights = Column(Integer, nullable=False)
    cleaning_fee = Column(Float, default=0.0)
    service_fee = Column(Float, default=0.0)
    taxes = Column(Float, default=0.0)
    total_price = Column(Float, nullable=False)

    status = Column(String(50), default="confirmed") # confirmed, cancelled, completed
    payment_method = Column(String(50), default="credit_card") # credit_card, apple_pay, google_pay, paypal
    payment_status = Column(String(50), default="paid") # paid, refunded
    special_requests = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    listing = relationship("Listing", back_populates="bookings")
    guest = relationship("User", back_populates="bookings", foreign_keys=[guest_id])
    review = relationship("Review", back_populates="booking", uselist=False)


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    guest_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True)

    rating = Column(Float, nullable=False, default=5.0)
    cleanliness_rating = Column(Float, default=5.0)
    accuracy_rating = Column(Float, default=5.0)
    communication_rating = Column(Float, default=5.0)
    location_rating = Column(Float, default=5.0)
    checkin_rating = Column(Float, default=5.0)
    value_rating = Column(Float, default=5.0)
    
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    listing = relationship("Listing", back_populates="reviews")
    guest = relationship("User", back_populates="reviews")
    booking = relationship("Booking", back_populates="review")


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="wishlists")
    listing = relationship("Listing", back_populates="wishlisted_by")
