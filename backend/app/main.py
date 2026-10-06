from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models.models import Listing
from app.seed import seed_database
from app.routers import (
    listings_router,
    bookings_router,
    reviews_router,
    wishlists_router,
    users_router,
    categories_router,
    amenities_router,
    upload_router
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-featured Airbnb Clone REST API built with FastAPI and SQLite",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for development and deployment flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists and mount static files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API routers
api_prefix = settings.API_V1_STR
app.include_router(listings_router, prefix=api_prefix)
app.include_router(bookings_router, prefix=api_prefix)
app.include_router(reviews_router, prefix=api_prefix)
app.include_router(wishlists_router, prefix=api_prefix)
app.include_router(users_router, prefix=api_prefix)
app.include_router(categories_router, prefix=api_prefix)
app.include_router(amenities_router, prefix=api_prefix)
app.include_router(upload_router, prefix=api_prefix)

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        count = db.query(Listing).count()
        if count == 0:
            print("No listings found. Seeding initial data...")
            seed_database()
        else:
            print(f"Database already contains {count} listings.")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "message": "Welcome to the Airbnb Clone API",
        "docs": "/docs",
        "status": "healthy",
        "version": "1.0.0"
    }
