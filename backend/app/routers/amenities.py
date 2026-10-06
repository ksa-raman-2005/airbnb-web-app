from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import Amenity
from app.schemas.schemas import AmenityResponse

router = APIRouter(prefix="/amenities", tags=["Amenities"])

@router.get("", response_model=List[AmenityResponse])
def get_amenities(db: Session = Depends(get_db)):
    return db.query(Amenity).order_by(Amenity.category.asc(), Amenity.name.asc()).all()
