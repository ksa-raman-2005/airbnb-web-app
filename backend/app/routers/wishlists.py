from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import Wishlist, Listing, User
from app.schemas.schemas import WishlistToggle, ListingCardResponse

router = APIRouter(prefix="/wishlists", tags=["Wishlists"])

@router.post("/toggle")
def toggle_wishlist(payload: WishlistToggle, db: Session = Depends(get_db)):
    existing = db.query(Wishlist).filter(
        Wishlist.user_id == payload.user_id,
        Wishlist.listing_id == payload.listing_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"is_wishlisted": False, "listing_id": payload.listing_id}
    else:
        wishlist_item = Wishlist(user_id=payload.user_id, listing_id=payload.listing_id)
        db.add(wishlist_item)
        db.commit()
        return {"is_wishlisted": True, "listing_id": payload.listing_id}

@router.get("/user/{user_id}", response_model=List[ListingCardResponse])
def get_user_wishlist(user_id: int, db: Session = Depends(get_db)):
    wishlists = db.query(Wishlist).filter(Wishlist.user_id == user_id).all()
    listing_ids = [w.listing_id for w in wishlists]

    if not listing_ids:
        return []

    listings = db.query(Listing).filter(Listing.id.in_(listing_ids)).all()

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
                is_wishlisted=True
            )
        )
    return results
