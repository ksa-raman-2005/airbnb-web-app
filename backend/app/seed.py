from datetime import date, timedelta
from app.database import SessionLocal, Base, engine
from app.models.models import User, Category, Amenity, Listing, ListingImage, Booking, Review, Wishlist

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Users
        alex = User(
            name="Alex Morgan",
            email="alex.morgan@example.com",
            avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            bio="Architect and design enthusiast from San Francisco. Avid traveler who loves finding unique architectural gems.",
            is_superhost=False,
            role="guest",
            phone="+1 (555) 234-5678",
            joined_date="March 2021",
            response_rate=100,
            response_time="within an hour"
        )
        elena = User(
            name="Elena Rostova",
            email="elena.rostova@example.com",
            avatar="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
            bio="Superhost of 7 years. Passionate about hospitality, interior design, and showing guests the most magical hidden spots.",
            is_superhost=True,
            role="both",
            phone="+39 089 875 123",
            joined_date="June 2017",
            response_rate=99,
            response_time="within an hour"
        )
        kenji = User(
            name="Kenji Sato",
            email="kenji.sato@example.com",
            avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            bio="Born and raised in Kyoto. Restoring heritage Machiya townhouses to preserve Japanese craftsmanship.",
            is_superhost=True,
            role="both",
            phone="+81 75 555 0192",
            joined_date="September 2018",
            response_rate=100,
            response_time="within an hour"
        )
        chloe = User(
            name="Chloé Dubois",
            email="chloe.dubois@example.com",
            avatar="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
            bio="Art curator living between Paris and Chamonix. Dedicated to creating unforgettable, elegant stays.",
            is_superhost=True,
            role="both",
            phone="+33 1 42 68 55 00",
            joined_date="January 2019",
            response_rate=98,
            response_time="within a few hours"
        )
        mateo = User(
            name="Mateo & Sofia Rossi",
            email="mateo.rossi@example.com",
            avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
            bio="Husband & wife architects who transformed an ancient cliffside lemon grove into a sanctuary.",
            is_superhost=True,
            role="both",
            phone="+39 081 837 0000",
            joined_date="August 2016",
            response_rate=100,
            response_time="within an hour"
        )

        db.add_all([alex, elena, kenji, chloe, mateo])
        db.flush()

        # 2. Seed Categories
        cat_data = [
            ("All", "all", "Sparkles", "All listings worldwide"),
            ("Beachfront", "beachfront", "Palmtree", "Steps away from white sand and ocean waves"),
            ("Cabins", "cabins", "Trees", "Cozy hideaways nestled in tranquil woodlands"),
            ("Mansions", "mansions", "Castle", "Luxury estates and sprawling historic properties"),
            ("OMG!", "omg", "Sparkles", "Extraordinary, one-of-a-kind architectural marvels"),
            ("Tiny homes", "tiny-homes", "Home", "Thoughtfully designed compact retreats"),
            ("Islands", "islands", "Compass", "Private and remote island escapes"),
            ("Countryside", "countryside", "MountainSnow", "Picturesque rolling hills and rustic farmhouses"),
            ("Lakefront", "lakefront", "Sailboat", "Serene waterfront homes with private docks"),
            ("Skiing", "skiing", "Snowflake", "Ski-in/ski-out chalets in premier snow resorts"),
            ("Iconic cities", "iconic-cities", "Building2", "Prime city center apartments and design lofts"),
            ("Luxe", "luxe", "Crown", "Extraordinary homes with five-star luxury amenities"),
            ("Tropical", "tropical", "SunMedium", "Lush rainforest retreats and sunny palm paradises"),
            ("Amazing pools", "amazing-pools", "Waves", "Spectacular infinity pools with panoramic views"),
        ]

        categories = {}
        for name, slug, icon, desc in cat_data:
            cat = Category(name=name, slug=slug, icon=icon, description=desc)
            db.add(cat)
            categories[slug] = cat
        db.flush()

        # 3. Seed Amenities
        amenities_data = [
            # Popular
            ("Fast Wifi (500+ Mbps)", "Popular", "Wifi"),
            ("Private Infinity Pool", "Popular", "Waves"),
            ("Outdoor Hot Tub / Jacuzzi", "Popular", "Bath"),
            ("Chef's Kitchen", "Popular", "Utensils"),
            ("Free Private Parking on premises", "Popular", "Car"),
            ("Air Conditioning", "Popular", "Wind"),
            ("Dedicated Workspace with Monitor", "Popular", "Laptop"),
            ("Direct Beach Access", "Popular", "Palmtree"),
            ("EV Charger (Level 2)", "Popular", "Zap"),
            ("Indoor Fireplace", "Popular", "Flame"),
            ("Washer & Dryer in unit", "Popular", "WashingMachine"),
            ("Outdoor BBQ Grill & Dining", "Popular", "Flame"),
            ("Keyless Smart Lock / Self Check-in", "Popular", "Key"),
            ("Panoramic Sea View", "Popular", "Eye"),
            ("Mountain Views", "Popular", "Mountain"),
            ("Private Sauna / Steam Room", "Popular", "Sparkles"),
            ("HD Smart TV with Netflix & HBO", "Popular", "Tv"),
            ("Espresso Machine & Coffee Bar", "Popular", "Coffee"),
            ("Patio / Private Balcony", "Popular", "Sun"),
            ("Private Gym / Fitness Equipment", "Popular", "Dumbbell"),
            ("Private Garden / Courtyard", "Popular", "Flower"),
            ("Crib & High Chair for families", "Popular", "Baby"),
        ]

        amenities_map = {}
        for name, cat, icon in amenities_data:
            am = Amenity(name=name, category=cat, icon=icon)
            db.add(am)
            amenities_map[name] = am
        db.flush()

        # Helper to pick amenities
        def get_ams(*names):
            return [amenities_map[n] for n in names if n in amenities_map]

        # 4. Seed Rich Listings
        listings_seed = [
            {
                "host": mateo,
                "category": categories["beachfront"],
                "title": "Villa Miramare - Cliffside Infinity Oasis",
                "description": "Perched dramatically above the crystalline waters of the Amalfi Coast, Villa Miramare offers an unparalleled Mediterranean sanctuary. Built into natural limestone cliffs, this luxury villa features cascading terraces, a private heated infinity pool that blends seamlessly into the Mediterranean horizon, handcrafted Vietri ceramic floors, and private access to the water below. Enjoy panoramic sunsets over Positano, a dedicated chef's kitchen, and bespoke concierge service.",
                "property_type": "Luxury Cliffside Villa",
                "room_type": "Entire place",
                "location": "Positano, Amalfi Coast, Italy",
                "address": "Via Cristoforo Colombo 42",
                "city": "Positano",
                "state": "Campania",
                "country": "Italy",
                "latitude": 40.6281,
                "longitude": 14.4850,
                "price_per_night": 780.0,
                "cleaning_fee": 150.0,
                "service_fee": 109.0,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 3.5,
                "rating": 4.98,
                "review_count": 84,
                "is_superhost": True,
                "is_guest_favorite": True,
                "images": [
                    ("https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80", "Main cliffside terrace and pool overlooking Positano", True),
                    ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", "Sun-drenched living room with floor-to-ceiling sea views", False),
                    ("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", "Master bedroom with private balcony facing the coast", False),
                    ("https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80", "Gourmet kitchen with marble countertops and espresso bar", False),
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80", "Evening sunset dining pergola illuminated by lanterns", False),
                ],
                "amenities": get_ams("Fast Wifi (500+ Mbps)", "Private Infinity Pool", "Outdoor Hot Tub / Jacuzzi", "Chef's Kitchen", "Free Private Parking on premises", "Air Conditioning", "Direct Beach Access", "Panoramic Sea View", "Espresso Machine & Coffee Bar", "Patio / Private Balcony", "Keyless Smart Lock / Self Check-in")
            },
            {
                "host": chloe,
                "category": categories["cabins"],
                "title": "The Glass Alpine Chalet & Cedar Forest Spa",
                "description": "Immerse yourself in Colorado's untamed beauty at this architectural glass chalet. Suspended amidst whispering aspen and pine forests, this modern sanctuary features floor-to-ceiling triple-glazed glass walls, a sunken wood-burning fireplace, hand-carved cedar hot tub under starry skies, and a barrel sauna. Located just 12 minutes from Aspen Snowmass ski lifts with private heated gear storage.",
                "property_type": "Modern Chalet",
                "room_type": "Entire place",
                "location": "Aspen, Colorado, United States",
                "address": "840 Roaring Fork Valley Trail",
                "city": "Aspen",
                "state": "Colorado",
                "country": "United States",
                "latitude": 39.1911,
                "longitude": -106.8175,
                "price_per_night": 620.0,
                "cleaning_fee": 120.0,
                "service_fee": 86.0,
                "max_guests": 5,
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 2.0,
                "rating": 4.96,
                "review_count": 62,
                "is_superhost": True,
                "is_guest_favorite": True,
                "images": [
                    ("https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1600&q=80", "Architectural wooden chalet in snow-covered woods", True),
                    ("https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80", "Cozy interior with roaring wood fireplace and snow views", False),
                    ("https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80", "Loft master bedroom with skylight for stargazing", False),
                    ("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", "Modern spa bathroom with rain shower and cedar tub", False),
                    ("https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80", "Cedar barrel hot tub illuminated on private deck", False),
                ],
                "amenities": get_ams("Fast Wifi (500+ Mbps)", "Outdoor Hot Tub / Jacuzzi", "Indoor Fireplace", "Chef's Kitchen", "Free Private Parking on premises", "EV Charger (Level 2)", "Mountain Views", "Private Sauna / Steam Room", "Espresso Machine & Coffee Bar", "Washer & Dryer in unit")
            },
            {
                "host": kenji,
                "category": categories["iconic-cities"],
                "title": "Zen Heritage Machiya & Private Moss Garden",
                "description": "Step into a century of Kyoto heritage in this meticulously restored Taisho-era Machiya. Featuring fragrant Hinoki cypress soaking tubs, sliding shoji screens, tatami tea rooms, and an enchanting private moss garden with illuminated stone lanterns. Located in historic Gion within walking distance of ancient temples, artisan tea houses, and the Kamogawa River.",
                "property_type": "Historic Townhouse",
                "room_type": "Entire place",
                "location": "Gion, Kyoto, Japan",
                "address": "12-4 Gion Minamigawa, Higashiyama-ku",
                "city": "Kyoto",
                "state": "Kansai",
                "country": "Japan",
                "latitude": 35.0037,
                "longitude": 135.7772,
                "price_per_night": 395.0,
                "cleaning_fee": 60.0,
                "service_fee": 55.0,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 1.5,
                "rating": 4.99,
                "review_count": 128,
                "is_superhost": True,
                "is_guest_favorite": True,
                "images": [
                    ("https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80", "Traditional wooden facade and illuminated courtyard", True),
                    ("https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80", "Tatami tea room looking out into tranquil zen garden", False),
                    ("https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=1200&q=80", "Japanese master bedroom with plush futon bedding", False),
                    ("https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80", "Hinoki cedar wood Japanese deep soaking onsen tub", False),
                    ("https://images.unsplash.com/photo-1538707304074-80e93877d52e?auto=format&fit=crop&w=1200&q=80", "Inner courtyard garden with bamboo water feature", False),
                ],
                "amenities": get_ams("Fast Wifi (500+ Mbps)", "Air Conditioning", "Dedicated Workspace with Monitor", "Espresso Machine & Coffee Bar", "Keyless Smart Lock / Self Check-in", "Private Garden / Courtyard", "Washer & Dryer in unit", "HD Smart TV with Netflix & HBO")
            },
            {
                "host": elena,
                "category": categories["omg"],
                "title": "Santorini Caldera Cave Suite & Infinity Plunge Pool",
                "description": "Carved into the volcanic caldera cliffs of Oia, this legendary cave suite delivers the quintessential Santorini dream. Boasting an infinity plunge pool cantilevered over the Aegean Sea, whitewashed vaulted ceilings, minimalist Cycladic architecture, and front-row seats to world-famous sunsets without the crowds.",
                "property_type": "Cave Villa",
                "room_type": "Entire place",
                "location": "Oia, Santorini, Greece",
                "address": "Caldera Cliff Walk 18",
                "city": "Oia",
                "state": "Cyclades",
                "country": "Greece",
                "latitude": 36.4618,
                "longitude": 25.3753,
                "price_per_night": 710.0,
                "cleaning_fee": 110.0,
                "service_fee": 99.0,
                "max_guests": 2,
                "bedrooms": 1,
                "beds": 1,
                "bathrooms": 1.0,
                "rating": 4.97,
                "review_count": 94,
                "is_superhost": True,
                "is_guest_favorite": True,
                "images": [
                    ("https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1600&q=80", "Whitewashed caldera terrace with infinity plunge pool", True),
                    ("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80", "Vaulted cave suite bedroom carved into volcanic rock", False),
                    ("https://images.unsplash.com/photo-1507038772120-7ee7e6b509d7?auto=format&fit=crop&w=1200&q=80", "Private balcony facing the glowing Aegean sunset", False),
                    ("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80", "Luxurious rain shower in cycladic stone bathroom", False),
                    ("https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80", "Breakfast setup overlooking the blue dome churches", False),
                ],
                "amenities": get_ams("Fast Wifi (500+ Mbps)", "Private Infinity Pool", "Outdoor Hot Tub / Jacuzzi", "Air Conditioning", "Panoramic Sea View", "Espresso Machine & Coffee Bar", "Patio / Private Balcony", "Keyless Smart Lock / Self Check-in")
            },
            {
                "host": alex,
                "category": categories["tropical"],
                "title": "Bamboo Eco-Palace & Valley River Sanctuary",
                "description": "Hidden deep within the sacred Ayung River valley of Ubud, this 100% architectural bamboo marvel is an eco-luxury masterpiece. Curving organic bamboo beams, an open-air plunge pool overlooking wild jungle canopy, hammock netting suspended over the river gorge, and a dedicated butler and private yoga pavilion.",
                "property_type": "Architectural Treehouse",
                "room_type": "Entire place",
                "location": "Ubud, Bali, Indonesia",
                "address": "Jalan Raya Sayan, Ayung Valley",
                "city": "Ubud",
                "state": "Bali",
                "country": "Indonesia",
                "latitude": -8.5069,
                "longitude": 115.2625,
                "price_per_night": 340.0,
                "cleaning_fee": 50.0,
                "service_fee": 47.0,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "rating": 4.95,
                "review_count": 112,
                "is_superhost": False,
                "is_guest_favorite": True,
                "images": [
                    ("https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80", "Striking bamboo multi-level villa amidst lush jungle", True),
                    ("https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80", "Open air infinity pool over the river canopy", False),
                    ("https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", "Curved bamboo bedroom with canopy mosquito draping", False),
                    ("https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80", "Outdoor stone bathtub with river view", False),
                    ("https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80", "Lounge nets suspended above jungle foliage", False),
                ],
                "amenities": get_ams("Fast Wifi (500+ Mbps)", "Private Infinity Pool", "Chef's Kitchen", "Free Private Parking on premises", "Dedicated Workspace with Monitor", "Private Garden / Courtyard", "Espresso Machine & Coffee Bar", "Mountain Views")
            },
            {
                "host": chloe,
                "category": categories["luxe"],
                "title": "Haussmannian Penthouse & Eiffel Tower Views",
                "description": "Experience Paris in pure grandeur from this top-floor 7th Arrondissement penthouse. Featuring direct, unobstructed vistas of the Eiffel Tower from every room, herringbone oak parquet floors, gilded marble fireplaces, private wraparound balcony, and curated contemporary art. Walk to Avenue Montaigne and Champ de Mars in 5 minutes.",
                "property_type": "Luxury Penthouse",
                "room_type": "Entire place",
                "location": "Paris, Île-de-France, France",
                "address": "Avenue de La Bourdonnais 14",
                "city": "Paris",
                "state": "Île-de-France",
                "country": "France",
                "latitude": 48.8584,
                "longitude": 2.2945,
                "price_per_night": 950.0,
                "cleaning_fee": 180.0,
                "service_fee": 133.0,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.5,
                "rating": 4.97,
                "review_count": 48,
                "is_superhost": True,
                "is_guest_favorite": True,
                "images": [
                    ("https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80", "Balcony view overlooking the illuminated Eiffel Tower", True),
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", "Elegant Parisian living salon with chevron wood floors", False),
                    ("https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80", "Master bedroom suite with French doors opening to balcony", False),
                    ("https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80", "Designer kitchen with marble island and wine cellar", False),
                    ("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", "Carrara marble bathroom with freestanding soaking tub", False),
                ],
                "amenities": get_ams("Fast Wifi (500+ Mbps)", "Air Conditioning", "Dedicated Workspace with Monitor", "Chef's Kitchen", "Indoor Fireplace", "Patio / Private Balcony", "Washer & Dryer in unit", "Espresso Machine & Coffee Bar", "HD Smart TV with Netflix & HBO")
            },
            {
                "host": elena,
                "category": categories["mansions"],
                "title": "Modernist Oceanfront Estate & Private Beach Cove",
                "description": "A legendary architectural estate on prestigious Malibu Road with direct stairs down to private golden sands. Floor-to-ceiling automated glass walls disappear into pockets, transforming the grand living spaces into an open ocean pavilion. Includes zero-edge heated infinity pool, private cinema room, beachfront fire pit, and dolphin watching daily.",
                "property_type": "Oceanfront Mansion",
                "room_type": "Entire place",
                "location": "Malibu, California, United States",
                "address": "24800 Malibu Road",
                "city": "Malibu",
                "state": "California",
                "country": "United States",
                "latitude": 34.0259,
                "longitude": -118.7798,
                "price_per_night": 1450.0,
                "cleaning_fee": 250.0,
                "service_fee": 203.0,
                "max_guests": 8,
                "bedrooms": 4,
                "beds": 5,
                "bathrooms": 4.5,
                "rating": 4.99,
                "review_count": 76,
                "is_superhost": True,
                "is_guest_favorite": True,
                "images": [
                    ("https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80", "Modernist white villa facing the Pacific ocean sunset", True),
                    ("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80", "Seamless indoor-outdoor pool deck with sun loungers", False),
                    ("https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80", "Expansive open concept living room with ocean panorama", False),
                    ("https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80", "Primary ocean suite with wrap-around glass corner", False),
                    ("https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80", "Beachfront gas fire pit and evening terrace lounge", False),
                ],
                "amenities": get_ams("Fast Wifi (500+ Mbps)", "Private Infinity Pool", "Outdoor Hot Tub / Jacuzzi", "Direct Beach Access", "EV Charger (Level 2)", "Chef's Kitchen", "Free Private Parking on premises", "Private Gym / Fitness Equipment", "Washer & Dryer in unit", "HD Smart TV with Netflix & HBO", "Outdoor BBQ Grill & Dining")
            },
            {
                "host": alex,
                "category": categories["amazing-pools"],
                "title": "Jungle Cenote Villa with Hanging Daybeds",
                "description": "Tucked into the lush Mayan jungle of Tulum, this sustainable luxury sanctuary features an emerald cenote-style swimming pool, raw concrete and limestone architecture, rooftop stargazing deck, and hanging bohemian daybeds. Just 10 minutes to Tulum beach clubs and world-class dining.",
                "property_type": "Eco-Villa",
                "room_type": "Entire place",
                "location": "Tulum, Quintana Roo, Mexico",
                "address": "Region 15, Manzana 88",
                "city": "Tulum",
                "state": "Quintana Roo",
                "country": "Mexico",
                "latitude": 20.2114,
                "longitude": -87.4654,
                "price_per_night": 410.0,
                "cleaning_fee": 85.0,
                "service_fee": 57.0,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 3,
                "bathrooms": 3.0,
                "rating": 4.93,
                "review_count": 55,
                "is_superhost": False,
                "is_guest_favorite": False,
                "images": [
                    ("https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80", "Tropical villa courtyard with private cenote pool", True),
                    ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", "Minimalist open air living room with polished concrete", False),
                    ("https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80", "Canopy bed with tropical garden views", False),
                    ("https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80", "Outdoor jungle shower and stone vanity", False),
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80", "Rooftop lounge with sunset views over jungle canopy", False),
                ],
                "amenities": get_ams("Fast Wifi (500+ Mbps)", "Private Infinity Pool", "Air Conditioning", "Chef's Kitchen", "Free Private Parking on premises", "Patio / Private Balcony", "Outdoor BBQ Grill & Dining", "Keyless Smart Lock / Self Check-in")
            },
            {
                "host": kenji,
                "category": categories["iconic-cities"],
                "title": "Futuristic Shibuya Sky Loft & Skyline Views",
                "description": "High above the vibrant neon pulse of Tokyo, this architect-designed duplex loft in Shibuya offers panoramic views of Tokyo Tower and Mount Fuji on clear mornings. Features Japanese automated soaking bath, Herman Miller workspace, and acoustic sound insulation.",
                "property_type": "Design Loft",
                "room_type": "Entire place",
                "location": "Shibuya, Tokyo, Japan",
                "address": "1-19-8 Jinnan, Shibuya-ku",
                "city": "Tokyo",
                "state": "Kanto",
                "country": "Japan",
                "latitude": 35.6580,
                "longitude": 139.7016,
                "price_per_night": 320.0,
                "cleaning_fee": 55.0,
                "service_fee": 44.0,
                "max_guests": 3,
                "bedrooms": 1,
                "beds": 2,
                "bathrooms": 1.0,
                "rating": 4.96,
                "review_count": 92,
                "is_superhost": True,
                "is_guest_favorite": True,
                "images": [
                    ("https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80", "Modern double-height loft window facing Tokyo skyline", True),
                    ("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80", "Sleek kitchen and dining island with city lights", False),
                    ("https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80", "Mezzanine master bedroom with custom lighting", False),
                    ("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", "Japanese smart onsen bathroom with city views", False),
                    ("https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80", "Dedicated workspace with dual monitor setup", False),
                ],
                "amenities": get_ams("Fast Wifi (500+ Mbps)", "Air Conditioning", "Dedicated Workspace with Monitor", "Espresso Machine & Coffee Bar", "Washer & Dryer in unit", "Keyless Smart Lock / Self Check-in", "HD Smart TV with Netflix & HBO")
            },
            {
                "host": mateo,
                "category": categories["countryside"],
                "title": "Ancient Olive Grove Trullo & Sunken Stone Spa",
                "description": "Nestled in the UNESCO-recognized Valle d'Itria among centuries-old olive trees, this restored 18th-century stone Trullo combines historic cone architecture with contemporary Italian luxury. Includes private turquoise pool, wood-fired pizza oven, and locally sourced wine cellar.",
                "property_type": "Historic Trullo",
                "room_type": "Entire place",
                "location": "Locorotondo, Puglia, Italy",
                "address": "Contrada San Marco 88",
                "city": "Locorotondo",
                "state": "Puglia",
                "country": "Italy",
                "latitude": 40.7554,
                "longitude": 17.3275,
                "price_per_night": 360.0,
                "cleaning_fee": 70.0,
                "service_fee": 50.0,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "rating": 4.98,
                "review_count": 67,
                "is_superhost": True,
                "is_guest_favorite": True,
                "images": [
                    ("https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1600&q=80", "Iconic conical stone trullo with private garden pool", True),
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", "Whitewashed stone interior with arched alcoves", False),
                    ("https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80", "Romantic cone bedroom with rustic linen textiles", False),
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80", "Outdoor pergola dining under old olive trees", False),
                    ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", "Sunken stone jacuzzi with countryside vista", False),
                ],
                "amenities": get_ams("Fast Wifi (500+ Mbps)", "Private Infinity Pool", "Outdoor Hot Tub / Jacuzzi", "Chef's Kitchen", "Free Private Parking on premises", "Indoor Fireplace", "Outdoor BBQ Grill & Dining", "Private Garden / Courtyard")
            },
            {
                "host": chloe,
                "category": categories["skiing"],
                "title": "Matterhorn Chalet & Alpine Wellness Lodge",
                "description": "Ski right to your doorstep in Zermatt! This premier ski-in/ski-out timber chalet features unobstructed panoramas of the iconic Matterhorn, Finnish pine sauna, outdoor cedar hot tub, stone hearth fireplace, and heated ski boot room.",
                "property_type": "Luxury Ski Chalet",
                "room_type": "Entire place",
                "location": "Zermatt, Valais, Switzerland",
                "address": "Winkelmattenweg 34",
                "city": "Zermatt",
                "state": "Valais",
                "country": "Switzerland",
                "latitude": 45.9763,
                "longitude": 7.7491,
                "price_per_night": 890.0,
                "cleaning_fee": 160.0,
                "service_fee": 124.0,
                "max_guests": 8,
                "bedrooms": 4,
                "beds": 5,
                "bathrooms": 3.5,
                "rating": 4.97,
                "review_count": 73,
                "is_superhost": True,
                "is_guest_favorite": True,
                "images": [
                    ("https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1600&q=80", "Alpine wooden lodge with direct Matterhorn views", True),
                    ("https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80", "Great room with massive timber beams and stone fireplace", False),
                    ("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", "Nordic pine sauna and relaxation lounge", False),
                    ("https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80", "Master bedroom with balcony facing snow peaks", False),
                    ("https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80", "Outdoor bubbling hot tub surrounded by winter snow", False),
                ],
                "amenities": get_ams("Fast Wifi (500+ Mbps)", "Outdoor Hot Tub / Jacuzzi", "Indoor Fireplace", "Private Sauna / Steam Room", "Chef's Kitchen", "Free Private Parking on premises", "Mountain Views", "Washer & Dryer in unit", "Espresso Machine & Coffee Bar")
            },
            {
                "host": elena,
                "category": categories["lakefront"],
                "title": "Emerald Bay Lakehouse & Private Boat Pier",
                "description": "Right on the pristine shores of Lake Tahoe with private beach frontage and deep-water boat pier. Wake up to crystal clear turquoise waters, paddleboard straight from your lawn, and unwind around the lakeside stone fire pit as the sun dips behind the Sierra mountains.",
                "property_type": "Waterfront House",
                "room_type": "Entire place",
                "location": "Lake Tahoe, California, United States",
                "address": "4200 Emerald Bay Road",
                "city": "South Lake Tahoe",
                "state": "California",
                "country": "United States",
                "latitude": 38.9399,
                "longitude": -119.9772,
                "price_per_night": 540.0,
                "cleaning_fee": 130.0,
                "service_fee": 75.0,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 2.5,
                "rating": 4.94,
                "review_count": 89,
                "is_superhost": True,
                "is_guest_favorite": True,
                "images": [
                    ("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80", "Lakeside home with private pier extending into blue waters", True),
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", "Vaulted ceiling living room with lake views", False),
                    ("https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80", "Cozy lakefront bedroom with balcony", False),
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80", "Large sun deck with outdoor dining and BBQ", False),
                    ("https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80", "Outdoor hot tub overlooking lake sunset", False),
                ],
                "amenities": get_ams("Fast Wifi (500+ Mbps)", "Outdoor Hot Tub / Jacuzzi", "Indoor Fireplace", "Chef's Kitchen", "Free Private Parking on premises", "EV Charger (Level 2)", "Outdoor BBQ Grill & Dining", "Washer & Dryer in unit", "HD Smart TV with Netflix & HBO")
            },
            {
                "host": alex,
                "category": categories["tiny-homes"],
                "title": "Nordic Glass Eco-Pod & Aurora Observatory",
                "description": "A secluded architectural glass cube stationed on a rocky cliff in Norway's Arctic archipelago. Heated Scandinavian timber floors, stargazing 360-degree glass roof for viewing the Northern Lights, and total privacy in pristine nature.",
                "property_type": "Glass Eco-Pod",
                "room_type": "Entire place",
                "location": "Lofoten Islands, Nordland, Norway",
                "address": "Reine Fjord Lookout 7",
                "city": "Reine",
                "state": "Lofoten",
                "country": "Norway",
                "latitude": 67.9298,
                "longitude": 13.0898,
                "price_per_night": 290.0,
                "cleaning_fee": 45.0,
                "service_fee": 40.0,
                "max_guests": 2,
                "bedrooms": 1,
                "beds": 1,
                "bathrooms": 1.0,
                "rating": 4.98,
                "review_count": 105,
                "is_superhost": False,
                "is_guest_favorite": True,
                "images": [
                    ("https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1600&q=80", "Glass pod under the glowing green Northern Lights", True),
                    ("https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80", "Cozy modern interior facing the Arctic ocean fjord", False),
                    ("https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80", "Glass ceiling bed for stargazing", False),
                    ("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", "Compact designer bathroom with heated towel rack", False),
                    ("https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1200&q=80", "Cliffside terrace overlooking Reinebringen peak", False),
                ],
                "amenities": get_ams("Fast Wifi (500+ Mbps)", "Air Conditioning", "Free Private Parking on premises", "Mountain Views", "Panoramic Sea View", "Espresso Machine & Coffee Bar", "Keyless Smart Lock / Self Check-in")
            },
            {
                "host": chloe,
                "category": categories["iconic-cities"],
                "title": "SoHo Designer Loft with Private Rooftop Garden",
                "description": "Authentic cast-iron SoHo loft on Greene Street. Features 14-foot ceilings, exposed brick, original Corinthian columns, private keyed elevator access, custom Italian kitchen, and a private landscaped rooftop garden with skyline views of Lower Manhattan.",
                "property_type": "Designer Loft",
                "room_type": "Entire place",
                "location": "SoHo, New York, NY, United States",
                "address": "104 Greene Street",
                "city": "New York",
                "state": "New York",
                "country": "United States",
                "latitude": 40.7247,
                "longitude": -73.9998,
                "price_per_night": 650.0,
                "cleaning_fee": 140.0,
                "service_fee": 91.0,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "rating": 4.95,
                "review_count": 42,
                "is_superhost": True,
                "is_guest_favorite": True,
                "images": [
                    ("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80", "Sunlit SoHo loft with exposed brick and large industrial windows", True),
                    ("https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80", "Custom chef kitchen with black marble and brass fixtures", False),
                    ("https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80", "Primary suite with walk-in dressing room", False),
                    ("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", "Spa-inspired bathroom with dual rain showers", False),
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80", "Private rooftop terrace overlooking historic cobblestone streets", False),
                ],
                "amenities": get_ams("Fast Wifi (500+ Mbps)", "Air Conditioning", "Dedicated Workspace with Monitor", "Chef's Kitchen", "Washer & Dryer in unit", "HD Smart TV with Netflix & HBO", "Espresso Machine & Coffee Bar", "Patio / Private Balcony")
            },
            {
                "host": mateo,
                "category": categories["islands"],
                "title": "Secret Oceanview Sanctuary & Waterfall Pavilion",
                "description": "Perched on Maui's lush Road to Hana coastline, this luxury pavilion is surrounded by fruit orchards, cascading private waterfalls, and dramatic Pacific ocean horizons. Features open-air breezeways, outdoor copper soaking tub, and organic garden picks.",
                "property_type": "Tropical Pavilion",
                "room_type": "Entire place",
                "location": "Hana, Maui, Hawaii, United States",
                "address": "Mile Marker 31, Hana Highway",
                "city": "Hana",
                "state": "Hawaii",
                "country": "United States",
                "latitude": 20.7575,
                "longitude": -155.9884,
                "price_per_night": 490.0,
                "cleaning_fee": 110.0,
                "service_fee": 68.0,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "rating": 4.97,
                "review_count": 81,
                "is_superhost": True,
                "is_guest_favorite": True,
                "images": [
                    ("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80", "Tropical villa overlooking ocean and palm trees", True),
                    ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", "Open living area with trade wind breezes", False),
                    ("https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80", "Master bedroom with panoramic ocean views", False),
                    ("https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80", "Outdoor copper soaking tub in private garden", False),
                    ("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", "Private beach cove 5 minutes stroll down garden path", False),
                ],
                "amenities": get_ams("Fast Wifi (500+ Mbps)", "Direct Beach Access", "Panoramic Sea View", "Chef's Kitchen", "Free Private Parking on premises", "Private Garden / Courtyard", "Espresso Machine & Coffee Bar", "Outdoor BBQ Grill & Dining")
            },
            {
                "host": elena,
                "category": categories["mansions"],
                "title": "Clifftop Atlantic Villa & Infinity Edge Terrace",
                "description": "An international architectural marvel in Cape Town's prestigious Clifton 4th Beach. Features multi-level glass cantilevered balconies, 25-meter rim-flow pool hanging over the roaring Atlantic waves, private wine tasting cellar, gym, and 24-hour security.",
                "property_type": "Clifftop Estate",
                "room_type": "Entire place",
                "location": "Clifton, Cape Town, South Africa",
                "address": "Victoria Road 108",
                "city": "Cape Town",
                "state": "Western Cape",
                "country": "South Africa",
                "latitude": -33.9391,
                "longitude": 18.3781,
                "price_per_night": 1150.0,
                "cleaning_fee": 220.0,
                "service_fee": 161.0,
                "max_guests": 8,
                "bedrooms": 4,
                "beds": 4,
                "bathrooms": 4.5,
                "rating": 4.99,
                "review_count": 64,
                "is_superhost": True,
                "is_guest_favorite": True,
                "images": [
                    ("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80", "Modern clifftop villa with infinity pool overlooking Atlantic ocean", True),
                    ("https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80", "Double height living room with floor to ceiling glass", False),
                    ("https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80", "Primary suite with panoramic ocean views and private terrace", False),
                    ("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", "En-suite bathroom with glass shower and ocean vista", False),
                    ("https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80", "Sunset deck with fire lounge and cocktail bar", False),
                ],
                "amenities": get_ams("Fast Wifi (500+ Mbps)", "Private Infinity Pool", "Outdoor Hot Tub / Jacuzzi", "Direct Beach Access", "Private Gym / Fitness Equipment", "Chef's Kitchen", "Free Private Parking on premises", "Air Conditioning", "Washer & Dryer in unit", "HD Smart TV with Netflix & HBO")
            }
        ]

        created_listings = []
        for l_data in listings_seed:
            listing = Listing(
                host_id=l_data["host"].id,
                category_id=l_data["category"].id,
                title=l_data["title"],
                description=l_data["description"],
                property_type=l_data["property_type"],
                room_type=l_data["room_type"],
                location=l_data["location"],
                address=l_data["address"],
                city=l_data["city"],
                state=l_data["state"],
                country=l_data["country"],
                latitude=l_data["latitude"],
                longitude=l_data["longitude"],
                price_per_night=l_data["price_per_night"],
                cleaning_fee=l_data["cleaning_fee"],
                service_fee=l_data["service_fee"],
                max_guests=l_data["max_guests"],
                bedrooms=l_data["bedrooms"],
                beds=l_data["beds"],
                bathrooms=l_data["bathrooms"],
                rating=l_data["rating"],
                review_count=l_data["review_count"],
                is_superhost=l_data["is_superhost"],
                is_guest_favorite=l_data["is_guest_favorite"],
                is_active=True
            )
            listing.amenities = l_data["amenities"]
            db.add(listing)
            db.flush()

            for idx, (img_url, caption, is_cov) in enumerate(l_data["images"]):
                img = ListingImage(
                    listing_id=listing.id,
                    url=img_url,
                    caption=caption,
                    is_cover=is_cov,
                    display_order=idx
                )
                db.add(img)

            created_listings.append(listing)
        db.flush()

        # 5. Seed Reviews
        reviews_data = [
            (created_listings[0], alex, 5.0, "Hands down the most magnificent place I've ever stayed! The view of Positano from the infinity pool is something out of a dream. Mateo was the most attentive host and arranged a private boat tour for us. 10/10!"),
            (created_listings[0], chloe, 5.0, "The photos don't even do it justice. Waking up to the sunrise over the Amalfi cliffs with fresh espresso on the terrace was pure bliss. Spotlessly clean and luxuriously appointed."),
            (created_listings[1], alex, 5.0, "The glass walls make you feel completely one with nature. Sitting in the outdoor cedar tub with snow falling softly around us was unforgettable. We can't wait to return!"),
            (created_listings[2], alex, 5.0, "An extraordinary cultural immersion. Kenji has created something truly magical in Gion. The zen garden is peaceful beyond words and the soaking tub was heavenly."),
            (created_listings[3], alex, 5.0, "Our stay in Oia was pure fairytale magic. Having our own private plunge pool right on the caldera rim away from the tourist crowds made all the difference."),
            (created_listings[4], chloe, 5.0, "The bamboo craftsmanship is mind-blowing. Falling asleep to the sound of the Ayung River and waking up to the mist over the jungle was magical."),
            (created_listings[5], alex, 5.0, "Watching the Eiffel Tower sparkle from our private bed each evening was the highlight of our entire European journey. Worth every single euro!"),
            (created_listings[6], chloe, 5.0, "The Malibu estate is spectacular. Direct beach access, dolphins playing in the surf right in front of the terrace, and unbelievable sunsets."),
        ]

        for lst, usr, rtg, cmt in reviews_data:
            rev = Review(
                listing_id=lst.id,
                guest_id=usr.id,
                rating=rtg,
                cleanliness_rating=5.0,
                accuracy_rating=5.0,
                communication_rating=5.0,
                location_rating=5.0,
                checkin_rating=5.0,
                value_rating=5.0,
                comment=cmt
            )
            db.add(rev)
        db.flush()

        # 6. Seed Sample Bookings
        today = date.today()
        # Booking 1: Upcoming trip for Alex Morgan in Positano
        b1 = Booking(
            booking_code="HM-ABNB-POSI88",
            listing_id=created_listings[0].id,
            guest_id=alex.id,
            check_in=today + timedelta(days=14),
            check_out=today + timedelta(days=19),
            guests_count=2,
            adults=2,
            children=0,
            infants=0,
            pets=0,
            nightly_rate=created_listings[0].price_per_night,
            total_nights=5,
            cleaning_fee=created_listings[0].cleaning_fee,
            service_fee=546.0,
            taxes=364.0,
            total_price=4960.0,
            status="confirmed",
            payment_method="credit_card",
            payment_status="paid",
            special_requests="Arriving around 4pm. Celebrating wedding anniversary!"
        )

        # Booking 2: Upcoming trip for Alex in Kyoto
        b2 = Booking(
            booking_code="HM-ABNB-KYO901",
            listing_id=created_listings[2].id,
            guest_id=alex.id,
            check_in=today + timedelta(days=45),
            check_out=today + timedelta(days=49),
            guests_count=2,
            adults=2,
            children=0,
            infants=0,
            pets=0,
            nightly_rate=created_listings[2].price_per_night,
            total_nights=4,
            cleaning_fee=created_listings[2].cleaning_fee,
            service_fee=221.2,
            taxes=147.4,
            total_price=2008.6,
            status="confirmed",
            payment_method="apple_pay",
            payment_status="paid"
        )

        # Booking 3: Past completed trip for Alex in Aspen
        b3 = Booking(
            booking_code="HM-ABNB-ASP342",
            listing_id=created_listings[1].id,
            guest_id=alex.id,
            check_in=today - timedelta(days=30),
            check_out=today - timedelta(days=26),
            guests_count=4,
            adults=4,
            children=0,
            infants=0,
            pets=0,
            nightly_rate=created_listings[1].price_per_night,
            total_nights=4,
            cleaning_fee=created_listings[1].cleaning_fee,
            service_fee=347.2,
            taxes=231.4,
            total_price=3178.6,
            status="completed",
            payment_method="credit_card",
            payment_status="paid"
        )

        # Booking 4: Another guest booking on Elena's Malibu villa to demonstrate date blocking!
        b4 = Booking(
            booking_code="HM-ABNB-MAL772",
            listing_id=created_listings[6].id,
            guest_id=kenji.id,
            check_in=today + timedelta(days=5),
            check_out=today + timedelta(days=9),
            guests_count=4,
            adults=4,
            children=0,
            infants=0,
            pets=0,
            nightly_rate=created_listings[6].price_per_night,
            total_nights=4,
            cleaning_fee=created_listings[6].cleaning_fee,
            service_fee=812.0,
            taxes=541.0,
            total_price=7393.0,
            status="confirmed",
            payment_method="google_pay",
            payment_status="paid"
        )

        db.add_all([b1, b2, b3, b4])

        # 7. Seed Wishlists for Alex
        w1 = Wishlist(user_id=alex.id, listing_id=created_listings[0].id)
        w2 = Wishlist(user_id=alex.id, listing_id=created_listings[3].id)
        w3 = Wishlist(user_id=alex.id, listing_id=created_listings[5].id)
        w4 = Wishlist(user_id=alex.id, listing_id=created_listings[6].id)
        db.add_all([w1, w2, w3, w4])

        db.commit()
        print("Database seeded successfully with users, categories, amenities, listings, reviews, bookings, and wishlists!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
