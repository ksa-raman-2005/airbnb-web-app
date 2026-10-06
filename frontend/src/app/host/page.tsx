'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Home,
  DollarSign,
  Calendar,
  Star,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Award,
  AlertTriangle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

import { api } from '@/lib/api';
import { ListingCard as ListingCardType, Booking } from '@/types';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';

export default function HostDashboardPage() {
  const { currentUser } = useUser();
  const { toast, success, error } = useToast();

  const [listings, setListings] = useState<ListingCardType[]>([]);
  const [reservations, setReservations] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'reservations'>('listings');

  // Delete modal
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadHostData() {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        const [userListings, userReservations] = await Promise.all([
          api.getHostListings(currentUser.id),
          api.getHostReservations(currentUser.id),
        ]);
        setListings(userListings);
        setReservations(userReservations);
      } catch (err) {
        console.error('Failed to load host dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHostData();
  }, [currentUser]);

  // Calculate earnings
  const totalRevenue = reservations
    .filter(r => r.status === 'confirmed' || r.status === 'completed')
    .reduce((sum, r) => sum + r.total_price, 0);

  const activeReservationsCount = reservations.filter(r => r.status === 'confirmed').length;

  const handleDeleteListing = async () => {
    if (!deletingId) return;
    setIsDeleting(true);

    try {
      await api.deleteListing(deletingId);
      setListings(prev => prev.filter(l => l.id !== deletingId));
      setDeletingId(null);
      success('Listing deleted successfully');
    } catch (err: any) {
      error(err.message || 'Failed to delete listing');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-[1760px] mx-auto px-4 sm:px-8 md:px-12 py-10 min-h-[calc(100vh-200px)]">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-neutral-200">
        <div className="flex items-center gap-4">
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-neutral-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xl">
              {currentUser?.name[0]}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                Host Dashboard
              </h1>
              {currentUser?.is_superhost && (
                <span className="bg-airbnb-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3" /> Superhost
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Welcome back, <strong>{currentUser?.name}</strong>. Manage your properties and upcoming guest bookings.
            </p>
          </div>
        </div>

        <Link
          href="/host/create"
          className="btn-airbnb flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-xs shadow-md shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create new listing</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">${totalRevenue.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-600 font-medium">From {reservations.length} total bookings</span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Your Listings</span>
            <Home className="w-4 h-4 text-airbnb-brand" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">{listings.length}</p>
          <span className="text-[11px] text-neutral-500">Active across global destinations</span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Active Bookings</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">{activeReservationsCount}</p>
          <span className="text-[11px] text-blue-600 font-medium">Upcoming & confirmed stays</span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Average Rating</span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">4.97 ★</p>
          <span className="text-[11px] text-neutral-500">Top 1% host performance</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-neutral-200 mb-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'listings'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          My Listings ({listings.length})
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'reservations'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          Guest Reservations ({reservations.length})
        </button>
      </div>

      {/* Tab 1: Listings Table / Grid */}
      {activeTab === 'listings' && (
        <>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-neutral-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto space-y-4">
              <Home className="w-12 h-12 text-neutral-300 mx-auto" />
              <h3 className="text-lg font-bold text-neutral-900">No listings created yet</h3>
              <p className="text-xs text-neutral-500">
                You haven't added any listings under this persona. Create your first property to start hosting guests!
              </p>
              <Link
                href="/host/create"
                className="btn-airbnb inline-block px-6 py-3 rounded-xl text-xs font-semibold shadow-md mt-2"
              >
                Create a listing
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-700">
                  <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                    <tr>
                      <th className="py-4 px-6">Listing</th>
                      <th className="py-4 px-6">Location</th>
                      <th className="py-4 px-6">Price / Night</th>
                      <th className="py-4 px-6">Rating</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {listings.map(l => (
                      <tr key={l.id} className="hover:bg-neutral-50/60 transition">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={l.cover_image || (l.images && l.images[0]) || ''}
                              alt={l.title}
                              className="w-14 h-14 rounded-xl object-cover shrink-0"
                            />
                            <div className="min-w-0 max-w-xs">
                              <span className="font-bold text-neutral-900 text-sm block truncate">
                                {l.title}
                              </span>
                              <span className="text-[11px] text-neutral-400">{l.property_type}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-neutral-800">{l.location}</td>
                        <td className="py-4 px-6 font-bold text-neutral-900 text-sm">
                          ${Math.round(l.price_per_night)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1 font-semibold text-neutral-900">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{l.rating.toFixed(2)} ({l.review_count})</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/listings/${l.id}`}
                              title="View listing"
                              className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-neutral-900"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/host/edit/${l.id}`}
                              title="Edit listing"
                              className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-neutral-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setDeletingId(l.id)}
                              title="Delete listing"
                              className="p-2 hover:bg-rose-50 rounded-lg text-rose-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab 2: Reservations Table */}
      {activeTab === 'reservations' && (
        <>
          {reservations.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto space-y-4">
              <Calendar className="w-12 h-12 text-neutral-300 mx-auto" />
              <h3 className="text-lg font-bold text-neutral-900">No incoming reservations yet</h3>
              <p className="text-xs text-neutral-500">
                When guests book stays at any of your properties, their reservation details and payouts will show here.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-700">
                  <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                    <tr>
                      <th className="py-4 px-6">Guest</th>
                      <th className="py-4 px-6">Listing</th>
                      <th className="py-4 px-6">Dates</th>
                      <th className="py-4 px-6">Total Payout</th>
                      <th className="py-4 px-6">Booking Code</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {reservations.map(res => (
                      <tr key={res.id} className="hover:bg-neutral-50/60 transition">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {res.guest?.avatar ? (
                              <img
                                src={res.guest.avatar}
                                alt={res.guest.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-neutral-700 text-white flex items-center justify-center font-semibold text-xs">
                                {res.guest?.name?.[0] || 'G'}
                              </div>
                            )}
                            <div>
                              <span className="font-semibold text-neutral-900 block">{res.guest?.name || 'Guest'}</span>
                              <span className="text-[10px] text-neutral-400">{res.guests_count} guests</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-neutral-900 max-w-xs truncate">
                          {res.listing?.title || `Listing #${res.listing_id}`}
                        </td>
                        <td className="py-4 px-6 font-medium">
                          {res.check_in} to {res.check_out} ({res.total_nights} nights)
                        </td>
                        <td className="py-4 px-6 font-bold text-neutral-900 text-sm">
                          ${res.total_price}
                        </td>
                        <td className="py-4 px-6 font-mono text-[11px] text-neutral-500">
                          {res.booking_code}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                              res.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : res.status === 'completed'
                                ? 'bg-neutral-100 text-neutral-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {res.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-airbnb-modal border border-neutral-100 text-neutral-800 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-neutral-900">Delete Listing?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to permanently delete this listing? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteListing}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
