from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import Optional, List
from datetime import date

from app.database import get_db
from app.models.models import Listing, ListingImage, Amenity, Booking, Review, Wishlist, Category, User, listing_amenities
from app.schemas.schemas import (
    ListingCardResponse, ListingDetailResponse, ListingCreate, ListingUpdate,
    PriceCalculationRequest, PriceCalculationResponse, BookedDateRange,
    UserResponse, CategoryResponse, AmenityResponse, ListingImageResponse, ReviewResponse
)

router = APIRouter(prefix="/listings", tags=["Listings"])

@router.get("", response_model=List[ListingCardResponse])
def get_listings(
    location: Optional[str] = None,
    category: Optional[str] = None,
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    guests: Optional[int] = Query(None, ge=1),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    property_type: Optional[str] = None,
    room_type: Optional[str] = None,
    min_bedrooms: Optional[int] = Query(None, ge=0),
    min_beds: Optional[int] = Query(None, ge=0),
    min_bathrooms: Optional[float] = Query(None, ge=0),
    amenities: Optional[str] = None, # comma-separated IDs
    host_id: Optional[int] = None,
    user_id: Optional[int] = None, # to check wishlist
    is_active: Optional[bool] = True,
    sort_by: Optional[str] = "recommended",
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Listing)

    if is_active is not None:
        query = query.filter(Listing.is_active == is_active)

    if host_id:
        query = query.filter(Listing.host_id == host_id)

    if category and category.lower() != "all":
        query = query.join(Listing.category).filter(Category.slug == category.lower())

    if location:
        search_terms = location.strip().lower().split()
        for term in search_terms:
            pattern = f"%{term}%"
            query = query.filter(
                or_(
                    func.lower(Listing.location).like(pattern),
                    func.lower(Listing.city).like(pattern),
                    func.lower(Listing.state).like(pattern),
                    func.lower(Listing.country).like(pattern),
                    func.lower(Listing.title).like(pattern),
                    func.lower(Listing.description).like(pattern)
                )
            )

    if guests:
        query = query.filter(Listing.max_guests >= guests)

    if min_price is not None:
        query = query.filter(Listing.price_per_night >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price_per_night <= max_price)

    if property_type:
        query = query.filter(Listing.property_type.ilike(f"%{property_type}%"))

    if room_type:
        query = query.filter(Listing.room_type.ilike(f"%{room_type}%"))

    if min_bedrooms is not None:
        query = query.filter(Listing.bedrooms >= min_bedrooms)
    if min_beds is not None:
        query = query.filter(Listing.beds >= min_beds)
    if min_bathrooms is not None:
        query = query.filter(Listing.bathrooms >= min_bathrooms)

    # Date range availability filter: exclude listings with overlapping confirmed bookings
    if check_in and check_out:
        if check_out <= check_in:
            raise HTTPException(status_code=400, detail="check_out must be after check_in")
        
        # Subquery for booked listing IDs
        booked_subquery = db.query(Booking.listing_id).filter(
            Booking.status == "confirmed",
            Booking.check_in < check_out,
            Booking.check_out > check_in
        ).subquery()
        
        query = query.filter(~Listing.id.in_(booked_subquery))

    # Amenity filtering
    if amenities:
        amenity_ids = [int(a.strip()) for a in amenities.split(",") if a.strip().isdigit()]
        if amenity_ids:
            for a_id in amenity_ids:
                query = query.filter(Listing.amenities.any(Amenity.id == a_id))

    # Sorting
    if sort_by == "price_low":
        query = query.order_by(Listing.price_per_night.asc())
    elif sort_by == "price_high":
        query = query.order_by(Listing.price_per_night.desc())
    elif sort_by == "rating":
        query = query.order_by(Listing.rating.desc())
    else: # recommended / default
        query = query.order_by(Listing.id.asc())

    listings = query.offset(offset).limit(limit).all()

    # User wishlists set
    wishlist_ids = set()
    if user_id:
        wishlist_records = db.query(Wishlist.listing_id).filter(Wishlist.user_id == user_id).all()
        wishlist_ids = {w[0] for w in wishlist_records}

    results = []
    for l in listings:
        cover_img = None
        images_list = []
        for img in l.images:
            images_list.append(img.url)
            if img.is_cover and not cover_img:
                cover_img = img.url
        if not cover_img and images_list:
            cover_img = images_list[0]

        results.append(
            ListingCardResponse(
                id=l.id,
                title=l.title,
                location=l.location,
                city=l.city,
                country=l.country,
                property_type=l.property_type,
                room_type=l.room_type,
                price_per_night=l.price_per_night,
                rating=l.rating,
                review_count=l.review_count,
                is_superhost=l.is_superhost,
                is_guest_favorite=l.is_guest_favorite,
                cover_image=cover_img,
                images=images_list,
                latitude=l.latitude,
                longitude=l.longitude,
                category_slug=l.category.slug if l.category else None,
                is_wishlisted=l.id in wishlist_ids
            )
        )
    return results


@router.get("/{listing_id}", response_model=ListingDetailResponse)
def get_listing_detail(listing_id: int, user_id: Optional[int] = None, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    is_wishlisted = False
    if user_id:
        is_wishlisted = db.query(Wishlist).filter(
            Wishlist.user_id == user_id,
            Wishlist.listing_id == listing_id
        ).first() is not None

    # Get confirmed bookings for availability calendar
    confirmed_bookings = db.query(Booking).filter(
        Booking.listing_id == listing_id,
        Booking.status == "confirmed"
    ).all()
    booked_dates = [BookedDateRange(check_in=b.check_in, check_out=b.check_out) for b in confirmed_bookings]

    # Format reviews
    reviews_list = []
    for r in listing.reviews:
        reviews_list.append(ReviewResponse(
            id=r.id,
            guest=UserResponse.from_orm(r.guest),
            rating=r.rating,
            cleanliness_rating=r.cleanliness_rating,
            accuracy_rating=r.accuracy_rating,
            communication_rating=r.communication_rating,
            location_rating=r.location_rating,
            checkin_rating=r.checkin_rating,
            value_rating=r.value_rating,
            comment=r.comment,
            created_at=r.created_at
        ))

    return ListingDetailResponse(
        id=listing.id,
        title=listing.title,
        description=listing.description,
        property_type=listing.property_type,
        room_type=listing.room_type,
        location=listing.location,
        address=listing.address,
        city=listing.city,
        state=listing.state,
        country=listing.country,
        latitude=listing.latitude,
        longitude=listing.longitude,
        price_per_night=listing.price_per_night,
        cleaning_fee=listing.cleaning_fee,
        service_fee=listing.service_fee,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        rating=listing.rating,
        review_count=listing.review_count,
        is_superhost=listing.is_superhost,
        is_guest_favorite=listing.is_guest_favorite,
        is_active=listing.is_active,
        created_at=listing.created_at,
        host=UserResponse.from_orm(listing.host),
        category=CategoryResponse.from_orm(listing.category) if listing.category else None,
        images=[ListingImageResponse.from_orm(img) for img in listing.images],
        amenities=[AmenityResponse.from_orm(a) for a in listing.amenities],
        reviews=reviews_list,
        booked_dates=booked_dates,
        is_wishlisted=is_wishlisted
    )


@router.post("", response_model=ListingDetailResponse, status_code=status.HTTP_201_CREATED)
def create_listing(payload: ListingCreate, db: Session = Depends(get_db)):
    host = db.query(User).filter(User.id == payload.host_id).first()
    if not host:
        raise HTTPException(status_code=404, detail="Host user not found")

    # Set host role if not already
    if host.role == "guest":
        host.role = "both"

    listing = Listing(
        host_id=payload.host_id,
        category_id=payload.category_id,
        title=payload.title,
        description=payload.description,
        property_type=payload.property_type,
        room_type=payload.room_type,
        location=payload.location,
        address=payload.address,
        city=payload.city,
        state=payload.state,
        country=payload.country,
        latitude=payload.latitude,
        longitude=payload.longitude,
        price_per_night=payload.price_per_night,
        cleaning_fee=payload.cleaning_fee,
        service_fee=payload.service_fee,
        max_guests=payload.max_guests,
        bedrooms=payload.bedrooms,
        beds=payload.beds,
        bathrooms=payload.bathrooms,
        rating=5.0,
        review_count=0,
        is_superhost=host.is_superhost,
        is_guest_favorite=False,
        is_active=True
    )

    db.add(listing)
    db.flush() # get listing.id

    # Add images
    for idx, img_url in enumerate(payload.images):
        if img_url.strip():
            db.add(ListingImage(
                listing_id=listing.id,
                url=img_url.strip(),
                is_cover=(idx == 0),
                display_order=idx
            ))

    # Add amenities
    if payload.amenity_ids:
        amenities = db.query(Amenity).filter(Amenity.id.in_(payload.amenity_ids)).all()
        listing.amenities = amenities

    db.commit()
    db.refresh(listing)

    return get_listing_detail(listing.id, db=db)


@router.put("/{listing_id}", response_model=ListingDetailResponse)
def update_listing(listing_id: int, payload: ListingUpdate, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    update_data = payload.dict(exclude_unset=True)

    # Handle images update
    if "images" in update_data and update_data["images"] is not None:
        images_urls = update_data.pop("images")
        # Remove old images
        db.query(ListingImage).filter(ListingImage.listing_id == listing_id).delete()
        for idx, img_url in enumerate(images_urls):
            if img_url.strip():
                db.add(ListingImage(
                    listing_id=listing.id,
                    url=img_url.strip(),
                    is_cover=(idx == 0),
                    display_order=idx
                ))

    # Handle amenities update
    if "amenity_ids" in update_data and update_data["amenity_ids"] is not None:
        amenity_ids = update_data.pop("amenity_ids")
        amenities = db.query(Amenity).filter(Amenity.id.in_(amenity_ids)).all()
        listing.amenities = amenities

    for field, value in update_data.items():
        setattr(listing, field, value)

    db.commit()
    db.refresh(listing)
    return get_listing_detail(listing.id, db=db)


@router.delete("/{listing_id}", status_code=status.HTTP_200_OK)
def delete_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    db.delete(listing)
    db.commit()
    return {"message": "Listing deleted successfully", "id": listing_id}


@router.post("/calculate-price", response_model=PriceCalculationResponse)
def calculate_price(payload: PriceCalculationRequest, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == payload.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if payload.check_out <= payload.check_in:
        raise HTTPException(status_code=400, detail="check_out must be after check_in")

    nights = (payload.check_out - payload.check_in).days
    if nights <= 0:
        raise HTTPException(status_code=400, detail="Must book at least 1 night")

    # Check date collision
    collision = db.query(Booking).filter(
        Booking.listing_id == payload.listing_id,
        Booking.status == "confirmed",
        Booking.check_in < payload.check_out,
        Booking.check_out > payload.check_in
    ).first()

    base_price = round(listing.price_per_night * nights, 2)
    cleaning_fee = round(listing.cleaning_fee, 2)
    service_fee = round(base_price * 0.14, 2) # standard 14% airbnb guest fee
    taxes = round((base_price + cleaning_fee + service_fee) * 0.08, 2) # 8% occupancy tax
    total_price = round(base_price + cleaning_fee + service_fee + taxes, 2)

    return PriceCalculationResponse(
        nightly_rate=listing.price_per_night,
        nights=nights,
        base_price=base_price,
        cleaning_fee=cleaning_fee,
        service_fee=service_fee,
        taxes=taxes,
        total_price=total_price,
        is_available=(collision is None)
    )
