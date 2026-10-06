'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  MapPin,
  Users,
  CheckCircle,
  Image as ImageIcon,
  DollarSign,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';

import { api } from '@/lib/api';
import { Category, Amenity } from '@/types';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';

export default function CreateListingPage() {
  const router = useRouter();
  const { currentUser } = useUser();
  const { toast, success, error } = useToast();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [propertyType, setPropertyType] = useState('Entire villa');
  const [roomType, setRoomType] = useState('Entire place');

  // Location
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState(40.6281);
  const [longitude, setLongitude] = useState(14.4850);

  // Basics
  const [maxGuests, setMaxGuests] = useState(4);
  const [bedrooms, setBedrooms] = useState(2);
  const [beds, setBeds] = useState(2);
  const [bathrooms, setBathrooms] = useState(2.0);

  // Amenities
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>([]);

  // Photos
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  ]);

  // Title & Description
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Pricing
  const [pricePerNight, setPricePerNight] = useState(250);
  const [cleaningFee, setCleaningFee] = useState(75);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, ams] = await Promise.all([
          api.getCategories(),
          api.getAmenities()
        ]);
        setCategories(cats);
        setAmenities(ams);
        if (cats.length > 0) setCategoryId(cats[0].id);
      } catch (err) {
        console.error('Failed to load metadata for listing creation:', err);
      }
    }
    loadMeta();
  }, []);

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    setImages(prev => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const toggleAmenity = (id: number) => {
    setSelectedAmenityIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      toast('Please select an active host user', { type: 'error' });
      return;
    }

    if (!title.trim() || !description.trim() || !city.trim() || !country.trim()) {
      toast('Please complete all required fields', { type: 'error' });
      return;
    }

    if (images.length === 0) {
      toast('Please provide at least 1 photo URL', { type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const fullLocation = location.trim() || `${city}, ${state ? state + ', ' : ''}${country}`;
      const payload = {
        host_id: currentUser.id,
        category_id: categoryId,
        title: title.trim(),
        description: description.trim(),
        property_type: propertyType,
        room_type: roomType,
        location: fullLocation,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        latitude: latitude || 40.6281,
        longitude: longitude || 14.4850,
        price_per_night: pricePerNight,
        cleaning_fee: cleaningFee,
        service_fee: Math.round(pricePerNight * 0.14),
        max_guests: maxGuests,
        bedrooms: bedrooms,
        beds: beds,
        bathrooms: bathrooms,
        images: images,
        amenity_ids: selectedAmenityIds,
      };

      const created = await api.createListing(payload);
      success('Listing created successfully!', 'Your property is now live.');
      router.push(`/listings/${created.id}`);
    } catch (err: any) {
      error(err.message || 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 min-h-[calc(100vh-200px)]">
      {/* Step Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 mb-2">
          <span>Step {step} of 6</span>
          <span>{step === 1 ? 'Category' : step === 2 ? 'Location' : step === 3 ? 'Basics' : step === 4 ? 'Amenities' : step === 5 ? 'Photos' : 'Details & Pricing'}</span>
        </div>
        <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-airbnb-brand transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Category & Type */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Which best describes your place?</h2>
            <p className="text-xs text-neutral-500 mt-1">Select a category that highlights your home's unique vibe.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.filter(c => c.slug !== 'all').map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition ${
                  categoryId === cat.id
                    ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900 font-semibold'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <Sparkles className="w-5 h-5 text-neutral-700" />
                <span className="text-xs">{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-200 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">Property Type</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Entire villa', 'Modern Chalet', 'Historic House', 'Design Loft', 'Eco Treehouse', 'Beachfront Apartment'].map(t => (
                <button
                  key={t}
                  onClick={() => setPropertyType(t)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                    propertyType === t
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 text-neutral-800 hover:border-neutral-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Location */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Where's your place located?</h2>
            <p className="text-xs text-neutral-500 mt-1">Your address is only shared with guests after they make a confirmed reservation.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Display Location Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Positano, Amalfi Coast, Italy"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full text-xs p-3.5 border border-neutral-300 rounded-xl focus:border-neutral-900 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Positano"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full text-xs p-3.5 border border-neutral-300 rounded-xl focus:border-neutral-900 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">State / Province</label>
                <input
                  type="text"
                  placeholder="e.g. Campania"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full text-xs p-3.5 border border-neutral-300 rounded-xl focus:border-neutral-900 outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Country *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Italy"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full text-xs p-3.5 border border-neutral-300 rounded-xl focus:border-neutral-900 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Via Cristoforo Colombo 42"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full text-xs p-3.5 border border-neutral-300 rounded-xl focus:border-neutral-900 outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Basics */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Share some basics about your place</h2>
            <p className="text-xs text-neutral-500 mt-1">You'll add more details later, like bed arrangements.</p>
          </div>

          <div className="divide-y divide-neutral-200">
            <div className="py-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-neutral-900">Guests</h4>
                <p className="text-xs text-neutral-400">Maximum guest capacity</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={maxGuests <= 1}
                  onClick={() => setMaxGuests(Math.max(1, maxGuests - 1))}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-30"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-bold">{maxGuests}</span>
                <button
                  onClick={() => setMaxGuests(maxGuests + 1)}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            <div className="py-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-neutral-900">Bedrooms</h4>
                <p className="text-xs text-neutral-400">Number of dedicated bedrooms</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={bedrooms <= 1}
                  onClick={() => setBedrooms(Math.max(1, bedrooms - 1))}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-30"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-bold">{bedrooms}</span>
                <button
                  onClick={() => setBedrooms(bedrooms + 1)}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            <div className="py-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-neutral-900">Beds</h4>
                <p className="text-xs text-neutral-400">Total sleeping beds</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={beds <= 1}
                  onClick={() => setBeds(Math.max(1, beds - 1))}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-30"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-bold">{beds}</span>
                <button
                  onClick={() => setBeds(beds + 1)}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            <div className="py-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-neutral-900">Bathrooms</h4>
                <p className="text-xs text-neutral-400">Full and half baths</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={bathrooms <= 1}
                  onClick={() => setBathrooms(Math.max(1, bathrooms - 0.5))}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-30"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-bold">{bathrooms}</span>
                <button
                  onClick={() => setBathrooms(bathrooms + 0.5)}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Amenities */}
      {step === 4 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Tell guests what your place offers</h2>
            <p className="text-xs text-neutral-500 mt-1">Select all amenities available on property.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {amenities.map(am => {
              const isSelected = selectedAmenityIds.includes(am.id);
              return (
                <button
                  key={am.id}
                  onClick={() => toggleAmenity(am.id)}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900 font-semibold'
                      : 'border-neutral-200 hover:border-neutral-400 text-neutral-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-neutral-900 border-neutral-900 text-white' : 'border-neutral-300'
                    }`}
                  >
                    {isSelected && <CheckCircle className="w-3 h-3" />}
                  </div>
                  <span className="text-xs truncate">{am.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 5: Photos */}
      {step === 5 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Add photos of your property</h2>
            <p className="text-xs text-neutral-500 mt-1">High-quality photos make your listing stand out. Provide image URLs.</p>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste an image URL (e.g. Unsplash)..."
              value={imageUrlInput}
              onChange={e => setImageUrlInput(e.target.value)}
              className="flex-1 text-xs p-3.5 border border-neutral-300 rounded-xl focus:border-neutral-900 outline-hidden"
            />
            <button
              onClick={handleAddImage}
              className="px-5 py-3 rounded-xl bg-neutral-900 text-white font-semibold text-xs shrink-0"
            >
              Add photo
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-100 group border border-neutral-200">
                <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute top-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Cover photo
                  </span>
                )}
                <button
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md transition opacity-90 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 6: Details & Pricing */}
      {step === 6 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Title, description & pricing</h2>
            <p className="text-xs text-neutral-500 mt-1">Set a catchy title, compelling story, and nightly rate.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Listing Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Modernist Cliffside Villa with Heated Infinity Pool"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full text-xs p-3.5 border border-neutral-300 rounded-xl focus:border-neutral-900 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Description *</label>
              <textarea
                rows={4}
                required
                placeholder="Describe what makes your space special, the surrounding views, and why guests will love staying here..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full text-xs p-3.5 border border-neutral-300 rounded-xl focus:border-neutral-900 outline-hidden leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Price per night (USD) *</label>
                <div className="flex items-center gap-1 border border-neutral-300 rounded-xl p-3 focus-within:border-neutral-900">
                  <span className="text-sm font-semibold text-neutral-500">$</span>
                  <input
                    type="number"
                    min="10"
                    value={pricePerNight}
                    onChange={e => setPricePerNight(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-semibold text-neutral-900 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Cleaning fee (USD)</label>
                <div className="flex items-center gap-1 border border-neutral-300 rounded-xl p-3 focus-within:border-neutral-900">
                  <span className="text-sm font-semibold text-neutral-500">$</span>
                  <input
                    type="number"
                    min="0"
                    value={cleaningFee}
                    onChange={e => setCleaningFee(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-semibold text-neutral-900 outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="pt-8 border-t border-neutral-200 mt-10 flex items-center justify-between">
        <button
          onClick={() => setStep(prev => Math.max(1, prev - 1))}
          disabled={step === 1}
          className="flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-neutral-900 disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {step < 6 ? (
          <button
            onClick={() => setStep(prev => Math.min(6, prev + 1))}
            className="btn-airbnb flex items-center gap-1.5 px-6 py-3 rounded-xl font-bold text-xs shadow-md"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-airbnb flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-xs shadow-md disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? 'Publishing...' : 'Publish Listing'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
