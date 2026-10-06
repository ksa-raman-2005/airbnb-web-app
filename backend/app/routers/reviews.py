from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.models.models import Review, Listing, User, Booking
from app.schemas.schemas import ReviewCreate, ReviewResponse, UserResponse

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(payload: ReviewCreate, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == payload.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    guest = db.query(User).filter(User.id == payload.guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest user not found")

    review = Review(
        listing_id=payload.listing_id,
        guest_id=payload.guest_id,
        booking_id=payload.booking_id,
        rating=payload.rating,
        cleanliness_rating=payload.cleanliness_rating,
        accuracy_rating=payload.accuracy_rating,
        communication_rating=payload.communication_rating,
        location_rating=payload.location_rating,
        checkin_rating=payload.checkin_rating,
        value_rating=payload.value_rating,
        comment=payload.comment
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    # Recalculate listing rating and review_count
    avg_rating = db.query(func.avg(Review.rating)).filter(Review.listing_id == payload.listing_id).scalar()
    total_reviews = db.query(func.count(Review.id)).filter(Review.listing_id == payload.listing_id).scalar()

    listing.rating = round(float(avg_rating or 5.0), 2)
    listing.review_count = total_reviews or 0
    db.commit()

    return ReviewResponse(
        id=review.id,
        guest=UserResponse.from_orm(guest),
        rating=review.rating,
        cleanliness_rating=review.cleanliness_rating,
        accuracy_rating=review.accuracy_rating,
        communication_rating=review.communication_rating,
        location_rating=review.location_rating,
        checkin_rating=review.checkin_rating,
        value_rating=review.value_rating,
        comment=review.comment,
        created_at=review.created_at
    )

@router.get("/listing/{listing_id}", response_model=List[ReviewResponse])
def get_listing_reviews(listing_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.listing_id == listing_id).order_by(Review.created_at.desc()).all()
    return [
        ReviewResponse(
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
        ) for r in reviews
    ]
