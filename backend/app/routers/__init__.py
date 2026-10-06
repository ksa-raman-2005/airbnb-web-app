from app.routers.listings import router as listings_router
from app.routers.bookings import router as bookings_router
from app.routers.reviews import router as reviews_router
from app.routers.wishlists import router as wishlists_router
from app.routers.users import router as users_router
from app.routers.categories import router as categories_router
from app.routers.amenities import router as amenities_router
from app.routers.upload import router as upload_router

__all__ = [
    "listings_router",
    "bookings_router",
    "reviews_router",
    "wishlists_router",
    "users_router",
    "categories_router",
    "amenities_router",
    "upload_router"
]
