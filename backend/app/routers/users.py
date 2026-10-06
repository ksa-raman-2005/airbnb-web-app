from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import User
from app.schemas.schemas import UserResponse, UserCreate

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [UserResponse.from_orm(u) for u in users]

@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.from_orm(user)

@router.post("", response_model=UserResponse)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        return UserResponse.from_orm(existing)

    user = User(
        name=payload.name,
        email=payload.email,
        avatar=payload.avatar,
        bio=payload.bio,
        role=payload.role,
        phone=payload.phone
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse.from_orm(user)
