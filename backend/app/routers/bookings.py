from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
import uuid

from app.database import get_db
from app.models.models import Booking, Listing, User, ListingImage
from app.schemas.schemas import BookingCreate, BookingResponse, ListingCardResponse, UserResponse

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def build_booking_response(b: Booking) -> BookingResponse:
    listing = b.listing
    cover_img = None
    images_list = []
    if listing:
        for img in listing.images:
            images_list.append(img.url)
            if img.is_cover and not cover_img:
                cover_img = img.url
        if not cover_img and images_list:
            cover_img = images_list[0]

        listing_card = ListingCardResponse(
            id=listing.id,
            title=listing.title,
            location=listing.location,
            city=listing.city,
            country=listing.country,
            property_type=listing.property_type,
            room_type=listing.room_type,
            price_per_night=listing.price_per_night,
            rating=listing.rating,
            review_count=listing.review_count,
            is_superhost=listing.is_superhost,
            is_guest_favorite=listing.is_guest_favorite,
            cover_image=cover_img,
            images=images_list,
            latitude=listing.latitude,
            longitude=listing.longitude,
            category_slug=listing.category.slug if listing.category else None,
            is_wishlisted=False
        )
    else:
        listing_card = None

    guest_resp = UserResponse.from_orm(b.guest) if b.guest else None

    return BookingResponse(
        id=b.id,
        booking_code=b.booking_code,
        listing_id=b.listing_id,
        guest_id=b.guest_id,
        check_in=b.check_in,
        check_out=b.check_out,
        guests_count=b.guests_count,
        adults=b.adults,
        children=b.children,
        infants=b.infants,
        pets=b.pets,
        nightly_rate=b.nightly_rate,
        total_nights=b.total_nights,
        cleaning_fee=b.cleaning_fee,
        service_fee=b.service_fee,
        taxes=b.taxes,
        total_price=b.total_price,
        status=b.status,
        payment_method=b.payment_method,
        payment_status=b.payment_status,
        special_requests=b.special_requests,
        created_at=b.created_at,
        listing=listing_card,
        guest=guest_resp
    )

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)):
    # Validate listing
    listing = db.query(Listing).filter(Listing.id == payload.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if not listing.is_active:
        raise HTTPException(status_code=400, detail="This listing is currently inactive")

    # Validate guest
    guest = db.query(User).filter(User.id == payload.guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest user not found")

    # Prevent host booking their own listing
    if listing.host_id == payload.guest_id:
        raise HTTPException(status_code=400, detail="Hosts cannot book their own property")

    # Validate dates
    if payload.check_out <= payload.check_in:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")

    # Check date overlap with confirmed bookings
    overlapping_booking = db.query(Booking).filter(
        Booking.listing_id == payload.listing_id,
        Booking.status == "confirmed",
        Booking.check_in < payload.check_out,
        Booking.check_out > payload.check_in
    ).first()

    if overlapping_booking:
        raise HTTPException(
            status_code=400,
            detail=f"The selected dates ({payload.check_in} to {payload.check_out}) are unavailable. Please choose different dates."
        )

    # Validate guest count
    total_guests = payload.adults + payload.children
    if total_guests > listing.max_guests:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum allowed guests is {listing.max_guests}, requested {total_guests}"
        )
    if total_guests < 1:
        raise HTTPException(status_code=400, detail="At least 1 adult guest is required")

    nights = (payload.check_out - payload.check_in).days
    nightly_rate = listing.price_per_night
    base_price = round(nightly_rate * nights, 2)
    cleaning_fee = round(listing.cleaning_fee, 2)
    service_fee = round(base_price * 0.14, 2)
    taxes = round((base_price + cleaning_fee + service_fee) * 0.08, 2)
    total_price = round(base_price + cleaning_fee + service_fee + taxes, 2)

    # Generate human readable booking code
    booking_code = f"HM-{uuid.uuid4().hex[:8].upper()}"

    new_booking = Booking(
        booking_code=booking_code,
        listing_id=listing.id,
        guest_id=guest.id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        guests_count=total_guests,
        adults=payload.adults,
        children=payload.children,
        infants=payload.infants,
        pets=payload.pets,
        nightly_rate=nightly_rate,
        total_nights=nights,
        cleaning_fee=cleaning_fee,
        service_fee=service_fee,
        taxes=taxes,
        total_price=total_price,
        status="confirmed",
        payment_method=payload.payment_method,
        payment_status="paid",
        special_requests=payload.special_requests
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return build_booking_response(new_booking)


@router.get("/user/{user_id}", response_model=List[BookingResponse])
def get_user_trips(user_id: int, status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Booking).filter(Booking.guest_id == user_id)
    if status_filter:
        query = query.filter(Booking.status == status_filter)
    
    bookings = query.order_by(Booking.check_in.desc()).all()
    return [build_booking_response(b) for b in bookings]


@router.get("/host/{host_id}", response_model=List[BookingResponse])
def get_host_reservations(host_id: int, db: Session = Depends(get_db)):
    # Find all listings for this host
    host_listing_ids = db.query(Listing.id).filter(Listing.host_id == host_id).all()
    ids = [l[0] for l in host_listing_ids]

    if not ids:
        return []

    bookings = db.query(Booking).filter(
        Booking.listing_id.in_(ids)
    ).order_by(Booking.check_in.desc()).all()

    return [build_booking_response(b) for b in bookings]


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return build_booking_response(booking)


@router.put("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Booking is already cancelled")

    booking.status = "cancelled"
    booking.payment_status = "refunded"
    db.commit()
    db.refresh(booking)

    return build_booking_response(booking)
