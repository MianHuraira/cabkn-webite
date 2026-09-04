"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaStar, FaClock, FaArrowRight, FaXmark, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { MdOutlineLocationOn } from "react-icons/md";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { AuthSpinner } from "@/components/auth/AuthShell";

export default function AllServicesPage() {
  const router = useRouter();
  const { getData, header1 } = ApiFunction();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination states for `top-services/public/${page}`
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch services from `top-services/public/${pageNum}` with backend search query
  const fetchServicesData = async (pageNum = 1, isLoadMore = false, query = searchQuery) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const trimmed = query.trim();
      const searchParam = trimmed ? `?search=${encodeURIComponent(trimmed)}` : "";
      const res = await getData(`top-services/public/${pageNum}${searchParam}`, header1);
      const fetchedList = res?.services || res?.data?.services || [];
      const totalPageCount = res?.count?.totalPage || res?.data?.count?.totalPage || 1;
      const totalItems = res?.count?.total ?? res?.data?.count?.total ?? fetchedList.length;

      if (isLoadMore) {
        setServices((prev) => [...prev, ...fetchedList]);
      } else {
        setServices(fetchedList);
      }

      setTotalPages(totalPageCount);
      setTotalCount(totalItems);
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to load top services:", error);
      if (!isLoadMore) setServices([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    const timer = setTimeout(() => {
      fetchServicesData(1, false, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSeeMore = () => {
    if (loadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    fetchServicesData(nextPage, true, searchQuery);
  };

  const handleServiceClick = (service) => {
    if (service?._id) {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`service_${service._id}`, JSON.stringify(service));
          sessionStorage.setItem("selected_service", JSON.stringify(service));
        } catch (e) {
          console.warn("sessionStorage save error:", e);
        }
      }
      router.push(`/serviceDetails/${service._id}`);
    }
  };

  const handleBookClick = (e, service) => {
    e.stopPropagation();
    if (service?._id) {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`service_${service._id}`, JSON.stringify(service));
          sessionStorage.setItem("selected_service", JSON.stringify(service));
        } catch (e) {
          console.warn("sessionStorage save error:", e);
        }
      }
      router.push(`/bookService?id=${service._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-poppins text-slate-800">
      {/* Header Banner matching Tour Booking & Admin layout */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#001726] via-[#002f4a] to-[#001f33] !pt-20 sm:!pt-24 !pb-12 sm:!pb-14 text-white">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001726]/90 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm font-family-medium mb-2.5">
            <Link href="/" className="hover:text-white transition-colors no-underline text-slate-300">
              Home
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-white font-family-semibold">Top Services</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-family-semibold text-white tracking-tight !m-0 leading-tight">
              Top <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Services</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-family-regular !m-0 mt-1.5 max-w-2xl">
              Massage, spa, private island videography & on-location care across St. Kitts & Nevis
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Container matching /admin max-w-7xl standard layout */}
      <div id="services-content" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 pb-16 relative z-30 space-y-6">
        {/* Search Header Bar - Right Aligned with X clear icon & end spinner */}
        <div className="flex justify-end w-full">
          <div className="relative w-full max-w-md">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
              <FaSearch className="w-3.5 h-3.5" />
            </div>

            <input
              type="text"
              placeholder="Search services or care types..."
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

        {/* Services Grid matching website TopServices & TopTours card UI */}
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
        ) : services.length === 0 ? (
          <div className="w-full bg-white rounded-2xl p-10 sm:p-14 text-center border border-slate-200/80 shadow-xs space-y-4 my-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#004a70] flex items-center justify-center mx-auto border border-sky-100/80 shadow-xs">
              <FaSearch size={22} />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-family-semibold text-slate-900 !m-0">No Services Found</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-family-regular !m-0">
                {searchQuery ? (
                  <>
                    We couldn&apos;t find any services matching &ldquo;
                    <span className="font-family-semibold text-slate-700">{searchQuery}</span>
                    &rdquo;. Try searching for massage, care, or videography.
                  </>
                ) : (
                  "No services are currently available."
                )}
              </p>
            </div>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="px-6 py-2.5 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white text-xs font-family-semibold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer !border-none"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map((service, index) => {
                const imageUrl =
                  service?.images?.[0] ||
                  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80";
                const isGroup = service?.bookingType === "group";
                const duration = service?.durationHours
                  ? service?.durationHoursMax && service?.durationHoursMax !== service?.durationHours
                    ? `${service.durationHours}–${service.durationHoursMax} hrs`
                    : `${service.durationHours} hr${service.durationHours > 1 ? "s" : ""}`
                  : null;
                const price = service?.price || service?.location_price || 0;
                const locationType =
                  service?.locationType === "at_your_location"
                    ? "At Your Location"
                    : service?.address || service?.meetingPoint?.address || "St. Kitts";
                const discountPct = Number(service?.discountPercent ?? service?.discount ?? 0);
                const hasDiscount = discountPct > 0;

                return (
                  <div
                    key={service._id || index}
                    onClick={() => handleServiceClick(service)}
                    className="w-full flex flex-col bg-white rounded-2xl overflow-hidden !border !border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(0,74,112,0.12)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group select-none"
                  >
                    {/* Image Container */}
                    <div className="relative h-[190px] w-full overflow-hidden bg-slate-100">
                      <img
                        src={imageUrl}
                        alt={service?.title || "Service"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10.5px] font-family-semibold text-white uppercase tracking-wider backdrop-blur-md shadow-sm ${
                            isGroup ? "bg-amber-600/90" : "bg-[#004a70]/90"
                          }`}
                        >
                          {service?.category?.name || (isGroup ? "Group Service" : "Service")}
                        </span>
                      </div>

                      {/* Rating Pill */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-family-semibold shadow-sm">
                        <FaStar className="text-amber-400 text-[11px]" />
                        <span>{service?.avgRating?.toFixed(1) || "5.0"}</span>
                        <span className="text-white/60 text-[10px]">
                          ({service?.totalReviews || 0})
                        </span>
                      </div>

                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-family-semibold uppercase tracking-wider shadow-sm">
                          {discountPct}% OFF
                        </div>
                      )}
                    </div>

                    {/* Content Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-[15px] font-family-semibold text-slate-800 line-clamp-2 !m-0 !mb-2 leading-snug group-hover:text-[#004a70] transition-colors">
                          {service?.title}
                        </h3>

                        {/* Meta details */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-family-medium mb-3 flex-wrap">
                          {duration && (
                            <span className="flex items-center gap-1">
                              <FaClock className="text-slate-400 text-[11px]" />
                              {duration}
                            </span>
                          )}
                          <span className="flex items-center gap-1 truncate max-w-[170px]">
                            <MdOutlineLocationOn className="text-slate-400 text-sm shrink-0" />
                            <span className="truncate">{locationType}</span>
                          </span>
                        </div>
                      </div>

                      {/* Price & Action Row */}
                      <div className="pt-3 !border-t !border-slate-100 flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-[11px] text-slate-400 block font-family-medium leading-none mb-0.5">
                            {isGroup ? "Per Group" : "Starting from"}
                          </span>
                          <span className="text-[16px] font-family-semibold text-[#004a70]">
                            ${price} <span className="text-xs font-family-regular text-slate-400">USD</span>
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleBookClick(e, service)}
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

            {/* See More Pagination Controls */}
            {totalCount > 0 && (
              <div className="flex flex-col items-center justify-center gap-3 pt-8 pb-4 !border-t !border-slate-200/80 mt-6">
                <p className="text-xs sm:text-sm text-slate-500 font-family-medium !m-0">
                  Showing <span className="font-family-semibold text-slate-800">{services.length}</span> of{" "}
                  <span className="font-family-semibold text-slate-800">{totalCount}</span> {totalCount === 1 ? "service" : "services"}
                </p>

                {page < totalPages ? (
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={handleSeeMore}
                    className="px-8 py-3 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white text-xs sm:text-sm font-family-semibold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Loading More Services...</span>
                      </>
                    ) : (
                      <>
                        <span>See More Services</span>
                        <FaArrowRight size={11} />
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-family-medium">
                    All {totalCount} services loaded
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
