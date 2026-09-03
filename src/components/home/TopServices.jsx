/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
"use client";

import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useApi } from "../ApiFunction/ApiFunction";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaStar, FaClock, FaLocationDot, FaArrowRight } from "react-icons/fa6";
import { FiArrowRight } from "react-icons/fi";
import { MdOutlineRoomService, MdOutlineLocationOn } from "react-icons/md";
import EmptyState from "../EmptyState";
import { NoshowData } from "../assets/Images";

export default function TopServices() {
  const router = useRouter();
  const { getData, header1 } = useApi();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fetchTopServices = async () => {
    setLoading(true);
    try {
      const res = await getData("top-services/public/1", header1);
      setServices(res?.services || res?.data?.services || []);
    } catch (error) {
      console.error("Failed to load top services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopServices();
  }, []);

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
    <div ref={sectionRef} className="w-full max-w-full overflow-hidden pt-2 pb-6">
      {/* Header Row */}
      <div
        className={`mx-auto flex flex-row justify-between items-center !mb-2 reveal ${
          inView ? "visible" : ""
        }`}
        style={{ maxWidth: 1200, padding: "0 16px", transitionDelay: "50ms" }}
      >
        <div className="text-left">
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-family-semibold text-slate-800 tracking-tight m-0 leading-tight">
            Top Services
          </h2>
          <p className="text-slate-500 font-family-regular text-sm sm:text-[15px] !m-0 mt-0.5">
            Massage, spa & on-location care
          </p>
        </div>

        <Link
          href="/services"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-50 hover:bg-brand-100 text-[#004a70] font-family-semibold text-xs sm:text-sm transition-all duration-200 no-underline shrink-0 group"
        >
          <span>See All</span>
          <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Swiper Content Container */}
      <div className="mx-auto px-3 !pt-0 pb-3 w-full max-w-full overflow-hidden" style={{ maxWidth: 1200 }}>
        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="w-[280px] sm:w-[300px] shrink-0 bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-[380px] animate-pulse"
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
        ) : services.length > 0 ? (
          <div className="w-full max-w-full overflow-hidden pb-4">
            <Swiper
              slidesPerView={1.15}
              spaceBetween={14}
              className="w-full top-services-swiper !pt-0.5 !pb-2"
              breakpoints={{
                0: { slidesPerView: 1.15, spaceBetween: 12 },
                480: { slidesPerView: 1.5, spaceBetween: 14 },
                640: { slidesPerView: 2.2, spaceBetween: 16 },
                768: { slidesPerView: 2.8, spaceBetween: 18 },
                1024: { slidesPerView: 3.5, spaceBetween: 20 },
                1280: { slidesPerView: 4.1, spaceBetween: 20 },
              }}
            >
              {services.map((service, index) => {
                const imageUrl =
                  service?.images?.[0] ||
                  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80";
                const duration = service?.durationHours
                  ? service?.durationHoursMax && service?.durationHoursMax !== service?.durationHours
                    ? `${service.durationHours}–${service.durationHoursMax} hrs`
                    : `${service.durationHours} hr${service.durationHours > 1 ? "s" : ""}`
                  : null;
                const price = service?.price || service?.location_price || 0;
                const locationType =
                  service?.locationType === "at_your_location"
                    ? "At Your Location"
                    : service?.address || "St. Kitts";

                return (
                  <SwiperSlide key={service._id || index} className="h-auto flex">
                    <div
                      onClick={() => handleServiceClick(service)}
                      className="w-full h-full flex flex-col bg-white rounded-2xl overflow-hidden !border !border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(0,74,112,0.12)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group select-none"
                    >
                      {/* Image Container */}
                      <div className="relative h-[190px] w-full overflow-hidden bg-slate-100">
                        <img
                          src={imageUrl}
                          alt={service?.title || "Service"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                        {/* Category / Location Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-family-semibold text-white uppercase tracking-wider bg-[#004a70]/90 backdrop-blur-md shadow-sm">
                            {service?.category?.name || "Service"}
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
                              Starting from
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
                  </SwiperSlide>
                );
              })}

              {/* Final "See More" Card Slide */}
              <SwiperSlide className="h-auto flex">
                <div
                  onClick={() => router.push("/services")}
                  className="w-full h-full min-h-[360px] sm:min-h-[380px] rounded-2xl bg-gradient-to-br from-[#002842] via-[#004a70] to-[#006699] p-6 sm:p-7 flex flex-col items-center justify-center text-center text-white cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden !border !border-white/15 select-none"
                >
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-sky-400/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-md !border !border-white/30 flex items-center justify-center text-white mb-4 sm:mb-5 shadow-inner group-hover:scale-110 group-hover:bg-white/30 group-hover:!border-white/60 transition-all duration-300">
                    <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="text-white group-hover:translate-x-1 transition-transform duration-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>

                  <h3 className="text-lg sm:text-xl font-family-semibold text-white !m-0 mb-1.5 sm:mb-2 tracking-tight">
                    Explore All Services
                  </h3>
                  <p className="text-white/80 text-[12.5px] sm:text-[13px] font-family-regular !m-0 mb-5 sm:mb-6 max-w-[210px] leading-relaxed">
                    Discover relaxing massages, private island videography, spa treatments & more.
                  </p>

                  <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white text-[#004a70] font-family-semibold text-[12px] sm:text-[13px] shadow-sm group-hover:bg-sky-50 group-hover:shadow-md transition-all">
                    <span>View All Services</span>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform duration-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        ) : (
          <EmptyState
            imageSrc={NoshowData}
            inView={inView}
            title="No Services Available"
            description="We couldn't find any on-location services right now. Please check back soon!"
          />
        )}
      </div>
    </div>
  );
}
