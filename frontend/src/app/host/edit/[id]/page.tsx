'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Trash2,
  Plus,
  Save,
  CheckCircle,
  Home
} from 'lucide-react';

import { api } from '@/lib/api';
import { Category, Amenity, ListingDetail } from '@/types';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useUser();
  const { toast, success, error } = useToast();

  const listingId = parseInt(params.id as string, 10);

  const [categories, setCategories] = useState<Category[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [propertyType, setPropertyType] = useState('');
  const [roomType, setRoomType] = useState('Entire place');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [pricePerNight, setPricePerNight] = useState(0);
  const [cleaningFee, setCleaningFee] = useState(0);
  const [maxGuests, setMaxGuests] = useState(1);
  const [bedrooms, setBedrooms] = useState(1);
  const [beds, setBeds] = useState(1);
  const [bathrooms, setBathrooms] = useState(1.0);
  const [isActive, setIsActive] = useState(true);

  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [cats, ams, listingData] = await Promise.all([
          api.getCategories(),
          api.getAmenities(),
          api.getListingDetail(listingId)
        ]);

        setCategories(cats);
        setAmenities(ams);

        setCategoryId(listingData.category?.id || (cats[0] && cats[0].id));
        setPropertyType(listingData.property_type);
        setRoomType(listingData.room_type);
        setTitle(listingData.title);
        setDescription(listingData.description);
        setLocation(listingData.location);
        setAddress(listingData.address || '');
        setCity(listingData.city);
        setState(listingData.state || '');
        setCountry(listingData.country);
        setPricePerNight(listingData.price_per_night);
        setCleaningFee(listingData.cleaning_fee);
        setMaxGuests(listingData.max_guests);
        setBedrooms(listingData.bedrooms);
        setBeds(listingData.beds);
        setBathrooms(listingData.bathrooms);
        setIsActive(listingData.is_active);

        setImages(listingData.images.map(img => img.url));
        setSelectedAmenityIds(listingData.amenities.map(a => a.id));
      } catch (err) {
        console.error('Failed to load listing for edit:', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (listingId) loadData();
  }, [listingId]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !city.trim() || !country.trim()) {
      toast('Please complete all required fields', { type: 'error' });
      return;
    }

    if (images.length === 0) {
      toast('Please maintain at least 1 image for your listing', { type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const fullLocation = location.trim() || `${city}, ${state ? state + ', ' : ''}${country}`;
      const payload = {
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
        price_per_night: pricePerNight,
        cleaning_fee: cleaningFee,
        service_fee: Math.round(pricePerNight * 0.14),
        max_guests: maxGuests,
        bedrooms: bedrooms,
        beds: beds,
        bathrooms: bathrooms,
        images: images,
        amenity_ids: selectedAmenityIds,
        is_active: isActive,
      };

      await api.updateListing(listingId, payload);
      success('Listing updated successfully!');
      router.push(`/listings/${listingId}`);
    } catch (err: any) {
      error(err.message || 'Failed to update listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-6 bg-neutral-200 rounded-md w-1/4" />
        <div className="h-64 bg-neutral-200 rounded-2xl w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 min-h-[calc(100vh-200px)]">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-neutral-100 rounded-full transition"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Edit Listing</h1>
            <p className="text-xs text-neutral-500">Update photos, pricing, amenities and details</p>
          </div>
        </div>

        <Link
          href={`/listings/${listingId}`}
          className="text-xs font-semibold text-neutral-800 underline hover:text-airbnb-brand"
        >
          View live listing
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-8 divide-y divide-neutral-200 text-neutral-800">
        {/* Title & Description */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-neutral-900">General Information</h3>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-xs p-3.5 border border-neutral-300 rounded-xl focus:border-neutral-900 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Description *</label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-xs p-3.5 border border-neutral-300 rounded-xl focus:border-neutral-900 outline-hidden leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(parseInt(e.target.value, 10))}
                className="w-full text-xs p-3.5 border border-neutral-300 rounded-xl focus:border-neutral-900 outline-hidden bg-white"
              >
                {categories.filter(c => c.slug !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Property Type</label>
              <input
                type="text"
                value={propertyType}
                onChange={e => setPropertyType(e.target.value)}
                className="w-full text-xs p-3.5 border border-neutral-300 rounded-xl focus:border-neutral-900 outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="pt-8 space-y-4">
          <h3 className="text-base font-bold text-neutral-900">Pricing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Price per night ($)</label>
              <input
                type="number"
                value={pricePerNight}
                onChange={e => setPricePerNight(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-3.5 border border-neutral-300 rounded-xl focus:border-neutral-900 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Cleaning fee ($)</label>
              <input
                type="number"
                value={cleaningFee}
                onChange={e => setCleaningFee(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-3.5 border border-neutral-300 rounded-xl focus:border-neutral-900 outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div className="pt-8 space-y-4">
          <h3 className="text-base font-bold text-neutral-900">Capacity & Rooms</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Max Guests</label>
              <input
                type="number"
                value={maxGuests}
                onChange={e => setMaxGuests(parseInt(e.target.value, 10) || 1)}
                className="w-full text-xs p-3 border border-neutral-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Bedrooms</label>
              <input
                type="number"
                value={bedrooms}
                onChange={e => setBedrooms(parseInt(e.target.value, 10) || 1)}
                className="w-full text-xs p-3 border border-neutral-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Beds</label>
              <input
                type="number"
                value={beds}
                onChange={e => setBeds(parseInt(e.target.value, 10) || 1)}
                className="w-full text-xs p-3 border border-neutral-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Bathrooms</label>
              <input
                type="number"
                step="0.5"
                value={bathrooms}
                onChange={e => setBathrooms(parseFloat(e.target.value) || 1)}
                className="w-full text-xs p-3 border border-neutral-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="pt-8 space-y-4">
          <h3 className="text-base font-bold text-neutral-900">Photos</h3>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Add photo URL..."
              value={imageUrlInput}
              onChange={e => setImageUrlInput(e.target.value)}
              className="flex-1 text-xs p-3 border border-neutral-300 rounded-xl"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold"
            >
              Add
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-neutral-100 border">
                <img src={img} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="pt-8 space-y-4">
          <h3 className="text-base font-bold text-neutral-900">Amenities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {amenities.map(am => {
              const isChecked = selectedAmenityIds.includes(am.id);
              return (
                <button
                  type="button"
                  key={am.id}
                  onClick={() => toggleAmenity(am.id)}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition flex items-center gap-2 ${
                    isChecked ? 'border-neutral-900 bg-neutral-50 font-semibold' : 'border-neutral-200'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${isChecked ? 'bg-neutral-900 border-neutral-900 text-white' : 'border-neutral-400'}`}>
                    {isChecked && <CheckCircle className="w-2.5 h-2.5" />}
                  </div>
                  <span className="truncate">{am.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-airbnb flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-xs shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving changes...' : 'Save changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
