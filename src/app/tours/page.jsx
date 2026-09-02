"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaStar, FaClock, FaUsers, FaArrowRight, FaXmark } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import EmptyState from "@/components/EmptyState";
import { NoshowData } from "@/components/assets/Images";
import { AuthSpinner } from "@/components/auth/AuthShell";

export default function AllToursPage() {
  const router = useRouter();
  const { getData, header1 } = ApiFunction();

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination states for `tours/public/${page}`
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch tours from `tours/public/${pageNum}` with backend search query
  const fetchToursData = async (pageNum = 1, isLoadMore = false, query = searchQuery) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const searchParam = query.trim() ? `?search=${encodeURIComponent(query.trim())}` : "";
      const res = await getData(`tours/public/${pageNum}${searchParam}`, header1);
      const fetchedList = res?.tours || res?.data?.tours || [];
      const totalPage = res?.count?.totalPage || 1;

      if (isLoadMore) {
        setTours((prev) => [...prev, ...fetchedList]);
      } else {
        setTours(fetchedList);
      }

      setHasMore(pageNum < totalPage);
    } catch (error) {
      console.error("Failed to load tours:", error);
      if (!isLoadMore) setTours([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    const timer = setTimeout(() => {
      fetchToursData(1, false, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchToursData(nextPage, true, searchQuery);
  };

  const handleTourClick = (tour) => {
    if (tour?._id) {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`tour_${tour._id}`, JSON.stringify(tour));
          sessionStorage.setItem("selected_tour", JSON.stringify(tour));
        } catch (e) {
          console.warn("sessionStorage save error:", e);
        }
      }
      router.push(`/tourDetails/${tour._id}`);
    }
  };

  const handleBookClick = (e, tour) => {
    e.stopPropagation();
    if (tour?._id) {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`tour_${tour._id}`, JSON.stringify(tour));
          sessionStorage.setItem("selected_tour", JSON.stringify(tour));
        } catch (e) {
          console.warn("sessionStorage save error:", e);
        }
      }
      router.push(`/bookTour?id=${tour._id}`);
    }
  };

  // Filtered tours for client-side search input
  const filteredTours = tours.filter((tour) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      tour.title?.toLowerCase().includes(query) ||
      tour.address?.toLowerCase().includes(query) ||
      tour.about?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] font-poppins text-slate-800">
      {/* Header Banner matching Tour Booking & Admin layout */}
      <section className="relative bg-gradient-to-br from-[#001726] via-[#002f4a] to-[#001f33] pt-24 sm:pt-28 pb-14 sm:pb-16 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm font-family-medium mb-2.5">
            <Link href="/" className="hover:text-white transition-colors no-underline text-slate-300">
              Home
            </Link>
            <span>/</span>
            <span className="text-white font-family-semibold">Top Tours</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-family-bold text-white tracking-tight !m-0 leading-tight">
              Top <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Tours</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-family-regular !m-0 mt-1.5 max-w-2xl">
              Unforgettable experiences and guided excursions around St. Kitts & Nevis
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Container matching /admin max-w-7xl standard layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 pb-16 relative z-30 space-y-6">
        {/* Search Header Bar - Right Aligned with X clear icon & end spinner */}
        <div className="flex justify-end w-full">
          <div className="relative w-full max-w-md">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
              <FaSearch className="w-3.5 h-3.5" />
            </div>

            <input
              type="text"
              placeholder="Search tours or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field !pl-10 !pr-16"
            />

            {/* Right Adornment: Spinner + Clear X Button */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
              {loading && (
                <AuthSpinner className="!text-[#004a70] !border-slate-300 !border-t-[#004a70] !w-3.5 !h-3.5" />
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-none"
                >
                  <FaXmark size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tours Grid matching website TopTours card UI */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-100 flex flex-col h-[380px] animate-pulse"
              >
                <div className="bg-slate-200/70 h-[190px] w-full" />
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div className="bg-slate-200/70 h-5 w-3/4 rounded-full" />
                  <div className="bg-slate-200/70 h-4 w-1/2 rounded-full" />
                  <div className="mt-auto bg-slate-200/70 h-10 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : tours.length === 0 ? (
          <div className="w-full bg-white rounded-2xl p-10 sm:p-14 text-center border border-slate-200/80 shadow-xs space-y-4 my-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#004a70] flex items-center justify-center mx-auto border border-sky-100/80 shadow-xs">
              <FaSearch size={22} />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-family-bold text-slate-900 !m-0">No Tours Found</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-family-regular !m-0">
                {searchQuery
                  ? <>We couldn&apos;t find any tours matching &ldquo;<span className="font-family-semibold text-slate-700">{searchQuery}</span>&rdquo;. Try searching for another destination or activity.</>
                  : "No tours are currently available."}
              </p>
            </div>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="px-6 py-2.5 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white text-xs font-family-bold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer !border-none"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tours.map((tour, index) => {
                const imageUrl =
                  tour?.images?.[0] ||
                  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80";
                const isGroup = tour?.bookingType === "group";
                const duration = tour?.durationHours
                  ? `${tour.durationHours} hr${tour.durationHours > 1 ? "s" : ""}`
                  : null;
                const capacity =
                  tour?.minPersons && tour?.maxPersons
                    ? `${tour.minPersons}–${tour.maxPersons} persons`
                    : null;
                const price = tour?.price || tour?.location_price || tour?.price_per_adult || 0;
                const hasDiscount = tour?.discountPercent > 0;

                return (
                  <div
                    key={tour._id || index}
                    onClick={() => handleTourClick(tour)}
                    className="w-full flex flex-col bg-white rounded-2xl overflow-hidden !border !border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(0,74,112,0.12)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group select-none"
                  >
                    {/* Image Container */}
                    <div className="relative h-[190px] w-full overflow-hidden bg-slate-100">
                      <img
                        src={imageUrl}
                        alt={tour?.title || "Tour"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10.5px] font-family-semibold text-white uppercase tracking-wider backdrop-blur-md shadow-sm ${
                            isGroup ? "bg-amber-600/90" : "bg-[#004a70]/90"
                          }`}
                        >
                          {isGroup ? "Group Tour" : "Individual"}
                        </span>
                      </div>

                      {/* Rating Pill */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-family-semibold shadow-sm">
                        <FaStar className="text-amber-400 text-[11px]" />
                        <span>{tour?.avgRating?.toFixed(1) || tour?.ratingsAverage?.toFixed(1) || "5.0"}</span>
                        <span className="text-white/60 text-[10px]">
                          ({tour?.totalReviews || 0})
                        </span>
                      </div>

                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-family-bold uppercase tracking-wider shadow-sm">
                          {tour.discountPercent}% OFF
                        </div>
                      )}
                    </div>

                    {/* Content Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-[15px] font-family-bold text-slate-800 line-clamp-2 !m-0 !mb-2 leading-snug group-hover:text-[#004a70] transition-colors">
                          {tour?.title}
                        </h3>

                        {/* Meta details */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-family-medium mb-3 flex-wrap">
                          {duration && (
                            <span className="flex items-center gap-1">
                              <FaClock className="text-slate-400 text-[11px]" />
                              {duration}
                            </span>
                          )}
                          {capacity && (
                            <span className="flex items-center gap-1">
                              <FaUsers className="text-slate-400 text-[11px]" />
                              {capacity}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price & Action Row */}
                      <div className="pt-3 !border-t !border-slate-100 flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-[11px] text-slate-400 block font-family-medium leading-none mb-0.5">
                            {isGroup ? "Per Group" : "Per Person"}
                          </span>
                          <span className="text-[16px] font-family-bold text-[#004a70]">
                            ${price} <span className="text-xs font-family-regular text-slate-400">USD</span>
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleBookClick(e, tour)}
                          className="px-4 py-2 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white text-xs font-family-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer !border-none"
                        >
                          <span>Book Now</span>
                          <FaArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Pagination Button */}
            {hasMore && (
              <div className="text-center pt-6">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={handleLoadMore}
                  className="px-8 py-3 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white text-xs font-family-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Loading More Tours...</span>
                    </>
                  ) : (
                    <span>Load More Tours</span>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
