import { ListingDetail, ListingCard, User, Category, Amenity, Booking, Review } from '@/types';

// In-memory persistent state for serverless deployments
class ServerlessStore {
  users: User[] = [
    {
      id: 1,
      name: "Alex Morgan",
      email: "alex.morgan@example.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      bio: "Architect and design enthusiast from San Francisco. Avid traveler who loves finding unique architectural gems.",
      is_superhost: false,
      role: "guest",
      phone: "+1 (555) 234-5678",
      joined_date: "March 2021",
      response_rate: 100,
      response_time: "within an hour",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: "Elena Rostova",
      email: "elena.rostova@example.com",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
      bio: "Superhost of 7 years. Passionate about hospitality, interior design, and showing guests the most magical hidden spots.",
      is_superhost: true,
      role: "both",
      phone: "+39 089 875 123",
      joined_date: "June 2017",
      response_rate: 99,
      response_time: "within an hour",
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: "Kenji Sato",
      email: "kenji.sato@example.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      bio: "Born and raised in Kyoto. Restoring heritage Machiya townhouses to preserve Japanese craftsmanship.",
      is_superhost: true,
      role: "both",
      phone: "+81 75 555 0192",
      joined_date: "September 2018",
      response_rate: 100,
      response_time: "within an hour",
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: "Chloé Dubois",
      email: "chloe.dubois@example.com",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      bio: "Art curator living between Paris and Chamonix. Dedicated to creating unforgettable, elegant stays.",
      is_superhost: true,
      role: "both",
      phone: "+33 1 42 68 55 00",
      joined_date: "January 2019",
      response_rate: 98,
      response_time: "within a few hours",
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      name: "Mateo & Sofia Rossi",
      email: "mateo.rossi@example.com",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      bio: "Husband & wife architects who transformed an ancient cliffside lemon grove into a sanctuary.",
      is_superhost: true,
      role: "both",
      phone: "+39 081 837 0000",
      joined_date: "August 2016",
      response_rate: 100,
      response_time: "within an hour",
      created_at: new Date().toISOString()
    }
  ];

  categories: Category[] = [
    { id: 1, name: "All", slug: "all", icon: "Sparkles", description: "All listings worldwide" },
    { id: 2, name: "Beachfront", slug: "beachfront", icon: "Palmtree", description: "Steps away from white sand" },
    { id: 3, name: "Cabins", slug: "cabins", icon: "Trees", description: "Cozy hideaways in tranquil woodlands" },
    { id: 4, name: "Mansions", slug: "mansions", icon: "Castle", description: "Luxury estates and historic properties" },
    { id: 5, name: "OMG!", slug: "omg", icon: "Sparkles", description: "Extraordinary architectural marvels" },
    { id: 6, name: "Tiny homes", slug: "tiny-homes", icon: "Home", description: "Compact retreats" },
    { id: 7, name: "Islands", slug: "islands", icon: "Compass", description: "Private island escapes" },
    { id: 8, name: "Countryside", slug: "countryside", icon: "MountainSnow", description: "Picturesque rolling hills" },
    { id: 9, name: "Lakefront", slug: "lakefront", icon: "Sailboat", description: "Serene waterfront homes" },
    { id: 10, name: "Skiing", slug: "skiing", icon: "Snowflake", description: "Ski-in/ski-out chalets" },
    { id: 11, name: "Iconic cities", slug: "iconic-cities", icon: "Building2", description: "Prime city lofts" },
    { id: 12, name: "Luxe", slug: "luxe", icon: "Crown", description: "Extraordinary five-star luxury homes" },
    { id: 13, name: "Tropical", slug: "tropical", icon: "SunMedium", description: "Lush rainforest retreats" },
    { id: 14, name: "Amazing pools", slug: "amazing-pools", icon: "Waves", description: "Spectacular infinity pools" }
  ];

  amenities: Amenity[] = [
    { id: 1, name: "Fast Wifi (500+ Mbps)", category: "Popular", icon: "Wifi" },
    { id: 2, name: "Private Infinity Pool", category: "Popular", icon: "Waves" },
    { id: 3, name: "Outdoor Hot Tub / Jacuzzi", category: "Popular", icon: "Bath" },
    { id: 4, name: "Chef's Kitchen", category: "Popular", icon: "Utensils" },
    { id: 5, name: "Free Private Parking on premises", category: "Popular", icon: "Car" },
    { id: 6, name: "Air Conditioning", category: "Popular", icon: "Wind" },
    { id: 7, name: "Dedicated Workspace with Monitor", category: "Popular", icon: "Laptop" },
    { id: 8, name: "Direct Beach Access", category: "Popular", icon: "Palmtree" },
    { id: 9, name: "EV Charger (Level 2)", category: "Popular", icon: "Zap" },
    { id: 10, name: "Indoor Fireplace", category: "Popular", icon: "Flame" },
    { id: 11, name: "Washer & Dryer in unit", category: "Popular", icon: "WashingMachine" },
    { id: 12, name: "Outdoor BBQ Grill & Dining", category: "Popular", icon: "Flame" },
    { id: 13, name: "Keyless Smart Lock / Self Check-in", category: "Popular", icon: "Key" },
    { id: 14, name: "Panoramic Sea View", category: "Popular", icon: "Eye" },
    { id: 15, name: "Mountain Views", category: "Popular", icon: "Mountain" },
    { id: 16, name: "Private Sauna / Steam Room", category: "Popular", icon: "Sparkles" },
    { id: 17, name: "HD Smart TV with Netflix & HBO", category: "Popular", icon: "Tv" },
    { id: 18, name: "Espresso Machine & Coffee Bar", category: "Popular", icon: "Coffee" },
    { id: 19, name: "Patio / Private Balcony", category: "Popular", icon: "Sun" },
    { id: 20, name: "Private Gym / Fitness Equipment", category: "Popular", icon: "Dumbbell" }
  ];

  listings: ListingDetail[] = [
    {
      id: 1,
      title: "Villa Miramare - Cliffside Infinity Oasis",
      description: "Perched dramatically above the crystalline waters of the Amalfi Coast, Villa Miramare offers an unparalleled Mediterranean sanctuary. Built into natural limestone cliffs, this luxury villa features cascading terraces, a private heated infinity pool that blends seamlessly into the Mediterranean horizon, handcrafted Vietri ceramic floors, and private access to the water below.",
      property_type: "Luxury Cliffside Villa",
      room_type: "Entire place",
      location: "Positano, Amalfi Coast, Italy",
      address: "Via Cristoforo Colombo 42",
      city: "Positano",
      state: "Campania",
      country: "Italy",
      latitude: 40.6281,
      longitude: 14.4850,
      price_per_night: 780,
      cleaning_fee: 150,
      service_fee: 109,
      max_guests: 6,
      bedrooms: 3,
      beds: 4,
      bathrooms: 3.5,
      rating: 4.98,
      review_count: 84,
      is_superhost: true,
      is_guest_favorite: true,
      is_active: true,
      created_at: new Date().toISOString(),
      host: {
        id: 5,
        name: "Mateo & Sofia Rossi",
        email: "mateo.rossi@example.com",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        bio: "Husband & wife architects who transformed an ancient cliffside lemon grove into a sanctuary.",
        is_superhost: true,
        role: "both",
        phone: "+39 081 837 0000",
        joined_date: "August 2016",
        response_rate: 100,
        response_time: "within an hour",
        created_at: new Date().toISOString()
      },
      category: { id: 2, name: "Beachfront", slug: "beachfront", icon: "Palmtree" },
      images: [
        { id: 1, listing_id: 1, url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80", is_cover: true, display_order: 0 },
        { id: 2, listing_id: 1, url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", is_cover: false, display_order: 1 },
        { id: 3, listing_id: 1, url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", is_cover: false, display_order: 2 },
        { id: 4, listing_id: 1, url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80", is_cover: false, display_order: 3 },
        { id: 5, listing_id: 1, url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80", is_cover: false, display_order: 4 }
      ],
      amenities: [
        { id: 1, name: "Fast Wifi (500+ Mbps)", category: "Popular", icon: "Wifi" },
        { id: 2, name: "Private Infinity Pool", category: "Popular", icon: "Waves" },
        { id: 3, name: "Outdoor Hot Tub / Jacuzzi", category: "Popular", icon: "Bath" },
        { id: 4, name: "Chef's Kitchen", category: "Popular", icon: "Utensils" },
        { id: 8, name: "Direct Beach Access", category: "Popular", icon: "Palmtree" },
        { id: 14, name: "Panoramic Sea View", category: "Popular", icon: "Eye" }
      ],
      reviews: [
        {
          id: 1,
          guest: {
            id: 1,
            name: "Alex Morgan",
            email: "alex.morgan@example.com",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            is_superhost: false,
            role: "guest",
            created_at: new Date().toISOString()
          },
          rating: 5,
          cleanliness_rating: 5,
          accuracy_rating: 5,
          communication_rating: 5,
          location_rating: 5,
          checkin_rating: 5,
          value_rating: 5,
          comment: "Hands down the most magnificent place I've ever stayed! The view of Positano from the infinity pool is something out of a dream.",
          created_at: new Date().toISOString()
        }
      ],
      booked_dates: [
        { check_in: "2026-10-20", check_out: "2026-10-25" }
      ]
    },
    {
      id: 2,
      title: "The Glass Alpine Chalet & Cedar Forest Spa",
      description: "Immerse yourself in Colorado's untamed beauty at this architectural glass chalet. Suspended amidst whispering aspen and pine forests, this modern sanctuary features floor-to-ceiling triple-glazed glass walls, a sunken wood-burning fireplace, hand-carved cedar hot tub under starry skies, and a barrel sauna.",
      property_type: "Modern Chalet",
      room_type: "Entire place",
      location: "Aspen, Colorado, United States",
      address: "840 Roaring Fork Valley Trail",
      city: "Aspen",
      state: "Colorado",
      country: "United States",
      latitude: 39.1911,
      longitude: -106.8175,
      price_per_night: 620,
      cleaning_fee: 120,
      service_fee: 86,
      max_guests: 5,
      bedrooms: 2,
      beds: 3,
      bathrooms: 2,
      rating: 4.96,
      review_count: 62,
      is_superhost: true,
      is_guest_favorite: true,
      is_active: true,
      created_at: new Date().toISOString(),
      host: {
        id: 4,
        name: "Chloé Dubois",
        email: "chloe.dubois@example.com",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        bio: "Art curator living between Paris and Chamonix.",
        is_superhost: true,
        role: "both",
        phone: "+33 1 42 68 55 00",
        joined_date: "January 2019",
        response_rate: 98,
        response_time: "within a few hours",
        created_at: new Date().toISOString()
      },
      category: { id: 3, name: "Cabins", slug: "cabins", icon: "Trees" },
      images: [
        { id: 6, listing_id: 2, url: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1600&q=80", is_cover: true, display_order: 0 },
        { id: 7, listing_id: 2, url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80", is_cover: false, display_order: 1 },
        { id: 8, listing_id: 2, url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80", is_cover: false, display_order: 2 }
      ],
      amenities: [
        { id: 1, name: "Fast Wifi (500+ Mbps)", category: "Popular", icon: "Wifi" },
        { id: 3, name: "Outdoor Hot Tub / Jacuzzi", category: "Popular", icon: "Bath" },
        { id: 10, name: "Indoor Fireplace", category: "Popular", icon: "Flame" },
        { id: 15, name: "Mountain Views", category: "Popular", icon: "Mountain" }
      ],
      reviews: [],
      booked_dates: []
    },
    {
      id: 3,
      title: "Zen Heritage Machiya & Private Moss Garden",
      description: "Step into a century of Kyoto heritage in this meticulously restored Taisho-era Machiya. Featuring fragrant Hinoki cypress soaking tubs, sliding shoji screens, tatami tea rooms, and an enchanting private moss garden with illuminated stone lanterns.",
      property_type: "Historic Townhouse",
      room_type: "Entire place",
      location: "Gion, Kyoto, Japan",
      address: "12-4 Gion Minamigawa",
      city: "Kyoto",
      state: "Kansai",
      country: "Japan",
      latitude: 35.0037,
      longitude: 135.7772,
      price_per_night: 395,
      cleaning_fee: 60,
      service_fee: 55,
      max_guests: 4,
      bedrooms: 2,
      beds: 3,
      bathrooms: 1.5,
      rating: 4.99,
      review_count: 128,
      is_superhost: true,
      is_guest_favorite: true,
      is_active: true,
      created_at: new Date().toISOString(),
      host: {
        id: 3,
        name: "Kenji Sato",
        email: "kenji.sato@example.com",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        bio: "Restoring heritage Machiya townhouses to preserve Japanese craftsmanship.",
        is_superhost: true,
        role: "both",
        created_at: new Date().toISOString()
      },
      category: { id: 11, name: "Iconic cities", slug: "iconic-cities", icon: "Building2" },
      images: [
        { id: 9, listing_id: 3, url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80", is_cover: true, display_order: 0 },
        { id: 10, listing_id: 3, url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80", is_cover: false, display_order: 1 }
      ],
      amenities: [
        { id: 1, name: "Fast Wifi (500+ Mbps)", category: "Popular", icon: "Wifi" },
        { id: 6, name: "Air Conditioning", category: "Popular", icon: "Wind" },
        { id: 7, name: "Dedicated Workspace with Monitor", category: "Popular", icon: "Laptop" }
      ],
      reviews: [],
      booked_dates: []
    },
    {
      id: 4,
      title: "Santorini Caldera Cave Suite & Infinity Plunge Pool",
      description: "Carved into the volcanic caldera cliffs of Oia, this legendary cave suite delivers the quintessential Santorini dream. Boasting an infinity plunge pool cantilevered over the Aegean Sea.",
      property_type: "Cave Villa",
      room_type: "Entire place",
      location: "Oia, Santorini, Greece",
      address: "Caldera Cliff Walk 18",
      city: "Oia",
      state: "Cyclades",
      country: "Greece",
      latitude: 36.4618,
      longitude: 25.3753,
      price_per_night: 710,
      cleaning_fee: 110,
      service_fee: 99,
      max_guests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      rating: 4.97,
      review_count: 94,
      is_superhost: true,
      is_guest_favorite: true,
      is_active: true,
      created_at: new Date().toISOString(),
      host: {
        id: 2,
        name: "Elena Rostova",
        email: "elena.rostova@example.com",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
        bio: "Superhost of 7 years.",
        is_superhost: true,
        role: "both",
        created_at: new Date().toISOString()
      },
      category: { id: 5, name: "OMG!", slug: "omg", icon: "Sparkles" },
      images: [
        { id: 11, listing_id: 4, url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1600&q=80", is_cover: true, display_order: 0 },
        { id: 12, listing_id: 4, url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80", is_cover: false, display_order: 1 }
      ],
      amenities: [
        { id: 1, name: "Fast Wifi (500+ Mbps)", category: "Popular", icon: "Wifi" },
        { id: 2, name: "Private Infinity Pool", category: "Popular", icon: "Waves" },
        { id: 14, name: "Panoramic Sea View", category: "Popular", icon: "Eye" }
      ],
      reviews: [],
      booked_dates: []
    },
    {
      id: 5,
      title: "Bamboo Eco-Palace & Valley River Sanctuary",
      description: "Hidden deep within the sacred Ayung River valley of Ubud, this 100% architectural bamboo marvel is an eco-luxury masterpiece.",
      property_type: "Architectural Treehouse",
      room_type: "Entire place",
      location: "Ubud, Bali, Indonesia",
      address: "Jalan Raya Sayan",
      city: "Ubud",
      state: "Bali",
      country: "Indonesia",
      latitude: -8.5069,
      longitude: 115.2625,
      price_per_night: 340,
      cleaning_fee: 50,
      service_fee: 47,
      max_guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      rating: 4.95,
      review_count: 112,
      is_superhost: false,
      is_guest_favorite: true,
      is_active: true,
      created_at: new Date().toISOString(),
      host: {
        id: 1,
        name: "Alex Morgan",
        email: "alex.morgan@example.com",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        is_superhost: false,
        role: "guest",
        created_at: new Date().toISOString()
      },
      category: { id: 13, name: "Tropical", slug: "tropical", icon: "SunMedium" },
      images: [
        { id: 13, listing_id: 5, url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80", is_cover: true, display_order: 0 },
        { id: 14, listing_id: 5, url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80", is_cover: false, display_order: 1 }
      ],
      amenities: [
        { id: 1, name: "Fast Wifi (500+ Mbps)", category: "Popular", icon: "Wifi" },
        { id: 2, name: "Private Infinity Pool", category: "Popular", icon: "Waves" }
      ],
      reviews: [],
      booked_dates: []
    },
    {
      id: 6,
      title: "Haussmannian Penthouse & Eiffel Tower Views",
      description: "Experience Paris in pure grandeur from this top-floor 7th Arrondissement penthouse with direct views of the Eiffel Tower.",
      property_type: "Luxury Penthouse",
      room_type: "Entire place",
      location: "Paris, Île-de-France, France",
      address: "Avenue de La Bourdonnais 14",
      city: "Paris",
      state: "Île-de-France",
      country: "France",
      latitude: 48.8584,
      longitude: 2.2945,
      price_per_night: 950,
      cleaning_fee: 180,
      service_fee: 133,
      max_guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2.5,
      rating: 4.97,
      review_count: 48,
      is_superhost: true,
      is_guest_favorite: true,
      is_active: true,
      created_at: new Date().toISOString(),
      host: {
        id: 4,
        name: "Chloé Dubois",
        email: "chloe.dubois@example.com",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        is_superhost: true,
        role: "both",
        created_at: new Date().toISOString()
      },
      category: { id: 12, name: "Luxe", slug: "luxe", icon: "Crown" },
      images: [
        { id: 15, listing_id: 6, url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80", is_cover: true, display_order: 0 }
      ],
      amenities: [
        { id: 1, name: "Fast Wifi (500+ Mbps)", category: "Popular", icon: "Wifi" },
        { id: 6, name: "Air Conditioning", category: "Popular", icon: "Wind" },
        { id: 10, name: "Indoor Fireplace", category: "Popular", icon: "Flame" }
      ],
      reviews: [],
      booked_dates: []
    },
    {
      id: 7,
      title: "Modernist Oceanfront Estate & Private Beach Cove",
      description: "A legendary architectural estate on prestigious Malibu Road with direct stairs down to private golden sands.",
      property_type: "Oceanfront Mansion",
      room_type: "Entire place",
      location: "Malibu, California, United States",
      address: "24800 Malibu Road",
      city: "Malibu",
      state: "California",
      country: "United States",
      latitude: 34.0259,
      longitude: -118.7798,
      price_per_night: 1450,
      cleaning_fee: 250,
      service_fee: 203,
      max_guests: 8,
      bedrooms: 4,
      beds: 5,
      bathrooms: 4.5,
      rating: 4.99,
      review_count: 76,
      is_superhost: true,
      is_guest_favorite: true,
      is_active: true,
      created_at: new Date().toISOString(),
      host: {
        id: 2,
        name: "Elena Rostova",
        email: "elena.rostova@example.com",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
        is_superhost: true,
        role: "both",
        created_at: new Date().toISOString()
      },
      category: { id: 4, name: "Mansions", slug: "mansions", icon: "Castle" },
      images: [
        { id: 16, listing_id: 7, url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80", is_cover: true, display_order: 0 }
      ],
      amenities: [
        { id: 1, name: "Fast Wifi (500+ Mbps)", category: "Popular", icon: "Wifi" },
        { id: 2, name: "Private Infinity Pool", category: "Popular", icon: "Waves" },
        { id: 8, name: "Direct Beach Access", category: "Popular", icon: "Palmtree" }
      ],
      reviews: [],
      booked_dates: []
    }
  ];

  bookings: Booking[] = [
    {
      id: 1,
      booking_code: "HM-ABNB-POSI88",
      listing_id: 1,
      guest_id: 1,
      check_in: "2026-10-20",
      check_out: "2026-10-25",
      guests_count: 2,
      adults: 2,
      children: 0,
      infants: 0,
      pets: 0,
      nightly_rate: 780,
      total_nights: 5,
      cleaning_fee: 150,
      service_fee: 546,
      taxes: 364,
      total_price: 4960,
      status: "confirmed",
      payment_method: "credit_card",
      payment_status: "paid",
      created_at: new Date().toISOString()
    }
  ];

  wishlists: { userId: number; listingId: number }[] = [
    { userId: 1, listingId: 1 },
    { userId: 1, listingId: 4 },
    { userId: 1, listingId: 6 }
  ];
}

export const serverlessStore = new ServerlessStore();
