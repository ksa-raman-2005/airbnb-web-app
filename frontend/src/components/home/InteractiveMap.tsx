'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Star, X } from 'lucide-react';
import { ListingCard } from '@/types';

interface InteractiveMapProps {
  listings: ListingCard[];
  selectedListing: ListingCard | null;
  onSelectListing: (listing: ListingCard | null) => void;
}

export default function InteractiveMap({
  listings,
  selectedListing,
  onSelectListing,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Only run in client browser
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically load Leaflet and CSS
    const loadLeaflet = async () => {
      const L = (await import('leaflet')).default;

      // Add Leaflet CSS link to head if not present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!isMounted || !mapContainerRef.current) return;

      // Initialize map if not yet initialized
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [25.0, 10.0], // Global center
          zoom: 3,
          zoomControl: false,
        });

        // Add custom clean CartoDB Voyager tiles (closest to Airbnb clean map style)
        L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          {
            attribution: '© OpenStreetMap contributors © CARTO',
            maxZoom: 19,
          }
        ).addTo(map);

        // Add custom zoom control in bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Clear existing markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      if (listings.length === 0) return;

      const bounds = L.latLngBounds([]);

      listings.forEach(item => {
        if (item.latitude && item.longitude) {
          const latLng: [number, number] = [item.latitude, item.longitude];
          bounds.extend(latLng);

          const isSelected = selectedListing?.id === item.id;
          const pinHtml = `
            <div class="airbnb-price-pin ${isSelected ? 'selected' : ''}">
              $${Math.round(item.price_per_night)}
            </div>
          `;

          const customIcon = L.divIcon({
            html: pinHtml,
            className: 'custom-leaflet-pin',
            iconSize: [60, 32],
            iconAnchor: [30, 16],
          });

          const marker = L.marker(latLng, { icon: customIcon }).addTo(map);

          marker.on('click', () => {
            onSelectListing(item);
          });

          markersRef.current.push(marker);
        }
      });

      if (bounds.isValid() && listings.length > 0) {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
    };
  }, [listings, selectedListing]);

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-3xl overflow-hidden shadow-inner border border-neutral-200">
      <div ref={mapContainerRef} className="w-full h-full min-h-[600px]" />

      {/* Floating Selected Listing Popup Preview */}
      {selectedListing && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-500 w-80 bg-white rounded-2xl shadow-airbnb-modal border border-neutral-100 p-3 animate-scale-up">
          <button
            onClick={() => onSelectListing(null)}
            className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white/90 text-neutral-600 flex items-center justify-center hover:bg-neutral-100 shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <Link href={`/listings/${selectedListing.id}`} className="block">
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-neutral-100 relative">
              <img
                src={selectedListing.cover_image || (selectedListing.images && selectedListing.images[0]) || ''}
                alt={selectedListing.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {selectedListing.property_type}
              </div>
            </div>

            <div className="mt-2.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-neutral-900 truncate">{selectedListing.title}</h4>
                <div className="flex items-center gap-0.5 text-xs font-semibold">
                  <Star className="w-3 h-3 fill-current text-neutral-900" />
                  <span>{selectedListing.rating.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-[11px] text-neutral-500 truncate mt-0.5">{selectedListing.location}</p>
              <div className="mt-1 flex items-baseline gap-1 text-xs">
                <span className="font-bold text-neutral-900">${Math.round(selectedListing.price_per_night)}</span>
                <span className="text-neutral-500">night</span>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
