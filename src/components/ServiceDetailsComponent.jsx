"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FaStar,
  FaClock,
  FaUsers,
  FaCheck,
  FaXmark,
  FaPlus,
  FaMinus,
  FaShieldHalved,
  FaChevronDown,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
  FaRegImages,
  FaTag,
  FaRegCalendarCheck,
} from "react-icons/fa6";
import {
  FiArrowLeft,
  FiMapPin,
  FiShare2,
  FiMaximize2,
  FiInfo,
} from "react-icons/fi";
import {
  HiOutlineSparkles,
  HiOutlineCalendarDays,
  HiOutlineMapPin,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { MdOutlineRoomService, MdOutlineLocationOn } from "react-icons/md";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, Thumbs, FreeMode, Keyboard, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "swiper/css/free-mode";

import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { message } from "antd";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import moment from "moment";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWFybGVncmFudCIsImEiOiJjbTgwdmV0MjkweXB2MnFzNXBjM2x6NThnIn0.3oz3YGaDHiFDh8W5ALk09w";

// =========================================================================
// CURRENCY & PRICING UTILITIES (Exact Parity with mobile-app-code/src/utils)
// The database stores all prices in XCD (Eastern Caribbean Dollars).
// 1 USD = 2.70 XCD (fixed peg).
// =========================================================================
const XCD_PER_USD = 2.7;

const round2 = (val) => Number((Number(val) || 0).toFixed(2));
const toUsd = (xcd) => round2((Number(xcd) || 0) / XCD_PER_USD);
const formatUsd = (xcd) => `$${toUsd(xcd).toFixed(2)} USD`;
const formatXcd = (xcd) => `$${round2(xcd).toFixed(2)} XCD`;

const getItemDiscountPercent = (item) => {
  const n = Number(item?.discountPercent ?? item?.discount);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(n, 100);
};

const applyItemDiscount = (amount, item) => {
  const base = round2(amount);
  const percent = getItemDiscountPercent(item);
  if (percent <= 0 || !(base > 0)) return base;
  return round2(base * (1 - percent / 100));
};

const getSpecialDiscountPercent = (userOrPercent) => {
  const n = Number(
    userOrPercent && typeof userOrPercent === "object"
      ? (userOrPercent.specialDiscount ?? userOrPercent.user?.specialDiscount)
      : userOrPercent
  );
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(100, round2(n));
};

const applySpecialDiscount = (amount, userOrPercent) => {
  const base = round2(amount);
  const percent = getSpecialDiscountPercent(userOrPercent);
  if (percent <= 0 || !(base > 0)) {
    return { percent: 0, amount: 0, discounted: base };
  }
  const discountAmount = round2((base * percent) / 100);
  return {
    percent,
    amount: discountAmount,
    discounted: round2(Math.max(0, base - discountAmount)),
  };
};

const getServiceAgePrices = (service) => {
  const adultFallback = Number(service?.price || 0);
  const ages = service?.agePrices || {};
  return {
    infant: Number(ages.infant ?? 0),
    kid: Number(ages.kid ?? 0),
    adult: Number(ages.adult ?? adultFallback),
  };
};

const calcServiceSubtotal = (service, guests = {}) => {
  const isGroup = service?.bookingType === "group";
  if (isGroup) {
    return Number(service?.price || 0);
  }
  const agePrices = getServiceAgePrices(service);
  const numAdults = Math.max(0, parseInt(guests?.adults ?? 1, 10));
  const numKids = Math.max(0, parseInt(guests?.kids ?? 0, 10));
  const numInfants = Math.max(0, parseInt(guests?.infants ?? 0, 10));
  return (
    numAdults * agePrices.adult +
    numKids * agePrices.kid +
    numInfants * agePrices.infant
  );
};

const formatServiceDuration = (service) => {
  const min = Number(service?.durationHours || 0);
  const max = Number(service?.durationHoursMax || 0);
  if (max > min) return `${min}–${max} Hours`;
  return `${min || 1} Hour${min > 1 ? "s" : ""}`;
};

export default function ServiceDetailsComponent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id || searchParams?.get("id");
  const { getData, header1, userData } = ApiFunction();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Swiper Hero Carousel state & ref
  const mainSwiperRef = useRef(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  // Accordion state for cancellation policy
  const [cancelOpen, setCancelOpen] = useState(true);

  // Fullscreen Lightbox Modal state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const lightboxSwiperRef = useRef(null);

  // Mounted state for portal rendering
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Travelers counters for individual booking
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [infants, setInfants] = useState(0);

  // Scroll section refs
  const overviewRef = useRef(null);
  const includedRef = useRef(null);
  const scheduleRef = useRef(null);
  const locationRef = useRef(null);
  const cancellationRef = useRef(null);
  const reviewsRef = useRef(null);

  // Mapbox GL Refs & Effect
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // Initial load: check sessionStorage for instant preview
  useEffect(() => {
    if (!id) return;

    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(`cabkn_service_${id}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed._id === id || parsed.id === id)) {
            setService(parsed);
            setLoading(false);
          }
        }
      } catch (err) {
        console.warn("Session cache read error:", err);
      }
    }

    // Fetch live service details
    getData(`top-services/details/${id}`, header1)
      .then((res) => {
        const liveService = res?.service || res?.data?.service;
        if (liveService) {
          setService(liveService);
          try {
            sessionStorage.setItem(`cabkn_service_${id}`, JSON.stringify(liveService));
          } catch (_) {}
        }
      })
      .catch((err) => {
        console.error("Service detail fetch error:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Load reviews for service
    getData(`rating/service/${id}`, header1)
      .then((ratingRes) => {
        setReviews(ratingRes?.data?.ratings || ratingRes?.ratings || []);
      })
      .catch(() => {});
  }, [id]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") {
        setLightboxIdx((prev) => (prev + 1) % (displayImages?.length || 1));
      }
      if (e.key === "ArrowLeft") {
        setLightboxIdx((prev) => (prev - 1 + (displayImages?.length || 1)) % (displayImages?.length || 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, service?.images?.length]);

  // Suppress Tidio chat and lock scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
      if (typeof window !== "undefined" && window.tidioChatApi) {
        try {
          window.tidioChatApi.hide();
        } catch (e) {}
      }
    } else {
      document.body.style.overflow = "";
      if (typeof window !== "undefined" && window.tidioChatApi) {
        try {
          window.tidioChatApi.show();
        } catch (e) {}
      }
    }
    return () => {
      document.body.style.overflow = "";
      if (typeof window !== "undefined" && window.tidioChatApi) {
        try {
          window.tidioChatApi.show();
        } catch (e) {}
      }
    };
  }, [lightboxOpen]);

  // Initialize Mapbox map
  useEffect(() => {
    if (!service || !mapContainerRef.current) return;

    try {
      const lat = Number(service?.meetingPoint?.lat || service?.location?.lat || 17.302605);
      const lng = Number(service?.meetingPoint?.lng || service?.location?.lng || -62.717692);

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [lng, lat],
        zoom: 13,
      });

      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      const el = document.createElement("div");
      el.className = "custom-mapbox-marker";
      el.style.width = "26px";
      el.style.height = "26px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#004a70";
      el.style.color = "#ffffff";
      el.style.fontWeight = "bold";
      el.style.fontSize = "12px";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.border = "2.5px solid #ffffff";
      el.style.boxShadow = "0 4px 12px rgba(0, 74, 112, 0.4)";
      el.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>`;

      const atLocation = service?.locationType === "at_your_location";
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 200px;">
          <strong style="color: #004a70; font-size: 12.5px; display: block; margin-bottom: 2px;">
            ${atLocation ? "On-Location Service Coverage" : service.title}
          </strong>
          <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.3;">
            ${atLocation ? "Specialist arrives directly at your chosen location across St. Kitts & Nevis" : (service?.meetingPoint?.address || service?.address || "St. Kitts & Nevis")}
          </p>
        </div>
      `);

      new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      return () => map.remove();
    } catch (e) {
      console.error("Mapbox init error:", e);
    }
  }, [service]);

  // Computed Pricing & Properties
  const cleanTitle = service?.title || "Service Details";
  const cleanAbout = (service?.about || service?.description || "")
    .replace(/<[^>]*>/g, "")
    .trim();

  const atLocation = service?.locationType === "at_your_location";
  const isGroup = service?.bookingType === "group";
  const minPeople = service?.minPeople ?? 1;
  const maxPeople = service?.maxPeople ?? 10;
  const meetingAddress = service?.meetingPoint?.address || service?.address || "";

  const displayImages = useMemo(() => {
    if (!service) return ["/placeholder.jpg"];
    if (Array.isArray(service.images) && service.images.length > 0) {
      return service.images.filter((url) => typeof url === "string" && url.trim() !== "");
    }
    if (service.image) return [service.image];
    return ["/placeholder.jpg"];
  }, [service]);

  const agePrices = useMemo(() => getServiceAgePrices(service), [service]);
  const totalGuests = isGroup ? 1 : Math.max(1, adults + kids + infants);

  const rawSubtotalXcd = useMemo(
    () => calcServiceSubtotal(service, { adults, kids, infants }),
    [service, adults, kids, infants]
  );

  const itemDiscountPct = getItemDiscountPercent(service);
  const hasDiscount = itemDiscountPct > 0;
  const subtotalAfterItemDiscount = applyItemDiscount(rawSubtotalXcd, service);

  const specialDiscount = useMemo(
    () => applySpecialDiscount(subtotalAfterItemDiscount, userData),
    [subtotalAfterItemDiscount, userData]
  );

  const finalPriceXcd = specialDiscount.discounted;
  const finalPriceUSD = toUsd(finalPriceXcd);
  const originalPriceUSD = toUsd(rawSubtotalXcd);

  const adultUnitOriginalUSD = toUsd(agePrices.adult);
  const adultUnitDiscountedUSD = toUsd(applyItemDiscount(agePrices.adult, service));
  const kidUnitDiscountedUSD = toUsd(applyItemDiscount(agePrices.kid, service));

  // Handlers
  const handleBookNow = () => {
    if (!service?._id) return;
    const query = new URLSearchParams({
      id: service._id,
      adults: String(adults),
      kids: String(kids),
      infants: String(infants),
    });
    router.push(`/bookService?${query.toString()}`);
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: cleanTitle,
          text: `Check out ${cleanTitle} on CabKn`,
          url,
        });
      } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        message.success("Service link copied to clipboard!");
      } catch (_) {
        message.info("Share URL: " + url);
      }
    }
  };

  const openLightbox = (index = 0) => {
    setLightboxIdx(index);
    setLightboxOpen(true);
  };

  // Section tabs list
  const showAbout = Boolean(service?.about || service?.description);
  const showIncludes = Boolean(service?.includes?.length > 0 || service?.excludes?.length > 0);
  const showSchedule = Boolean(service?.schedule?.length > 0 || service?.availableDays?.length > 0);
  const showReviews = Boolean(reviews?.length > 0 || (service?.totalReviews > 0));
  const showLocation = Boolean(meetingAddress || atLocation);

  const tabs = [];
  if (showAbout) tabs.push({ key: "overview", label: "Overview", icon: <HiOutlineSparkles size={13} />, ref: overviewRef });
  if (showIncludes) tabs.push({ key: "included", label: "What's Included", icon: <HiOutlineCheckCircle size={13} />, ref: includedRef });
  if (showSchedule) tabs.push({ key: "schedule", label: "Operating Days", icon: <HiOutlineCalendarDays size={13} />, ref: scheduleRef });
  if (showLocation) tabs.push({ key: "location", label: "Location & Map", icon: <HiOutlineMapPin size={13} />, ref: locationRef });
  if (showReviews) tabs.push({ key: "reviews", label: `Reviews (${reviews.length || service?.totalReviews || 0})`, icon: <FaStar size={12} />, ref: reviewsRef });

  const handleTabClick = (key, ref) => {
    setActiveTab(key);
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading && !service) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center pt-24 pb-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-slate-200 border-t-[#004a70] rounded-full animate-spin" />
          <span className="text-xs font-family-medium text-slate-500">Loading service details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#f8fafc] font-poppins text-slate-800 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      {/* ========================================================================= */}
      {/* 1. HERO TOP BANNER WITH BREADCRUMBS                                       */}
      {/* ========================================================================= */}
      <section className="!relative !overflow-hidden !bg-gradient-to-br !from-[#001726] !via-[#002f4a] !to-[#001f33] !pt-20 sm:!pt-24 !pb-10 !text-white">
        <div
          className="!absolute !inset-0 !opacity-[0.04] !pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="!absolute !top-1/4 !-left-20 !w-80 !h-80 !bg-sky-500/15 !rounded-full !blur-[100px] !pointer-events-none" />
        <div className="!absolute !bottom-1/4 !-right-20 !w-96 !h-96 !bg-indigo-500/15 !rounded-full !blur-[120px] !pointer-events-none" />

        <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !relative !z-10">
          {/* Breadcrumb Navigation Row */}
          <div className="!flex !items-center !justify-between !gap-3 !flex-wrap !mb-2">
            <div className="!inline-flex !items-center !gap-2 !text-slate-400 !text-xs !font-family-medium !flex-wrap">
              <Link href="/" className="hover:!text-white !transition-colors !no-underline !text-slate-400">
                Home
              </Link>
              <span className="!text-slate-500">/</span>
              <Link href="/services" className="hover:!text-white !transition-colors !no-underline !text-slate-400">
                Top Services
              </Link>
              <span className="!text-slate-500">/</span>
              <span className="!text-slate-200 !truncate !max-w-[220px] sm:!max-w-md !font-family-medium">
                {cleanTitle}
              </span>
            </div>

            <button
              type="button"
              onClick={() => router.back()}
              className="!px-3 !py-1.5 !rounded-lg !bg-white/[0.09] hover:!bg-white/[0.18] !text-white !text-xs !font-family-semibold !backdrop-blur-md !border !border-white/15 !transition-all !flex !items-center !gap-1.5 !cursor-pointer active:!scale-95"
            >
              <FiArrowLeft size={13} />
              <span>Back</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MAIN COCKPIT SECTION WITH CINEMATIC HERO SWIPER CAROUSEL               */}
      {/* ========================================================================= */}
      <div className="!w-full !px-4 sm:!px-6 lg:!px-8 !relative !z-20 !max-w-7xl !mx-auto !-mt-6 !pb-16">
        {/* ── CINEMATIC HERO SWIPER CAROUSEL ── */}
        <div
          className="!relative !w-full !overflow-hidden !rounded-3xl !shadow-[0_20px_80px_rgba(0,0,0,0.35)] !mb-6"
          style={{ height: "clamp(380px, 54vw, 620px)" }}
        >
          {/* Background Image Swiper */}
          <Swiper
            key={`hero-${displayImages.length}-${service?._id || "rdy"}`}
            modules={[Autoplay, Navigation, Pagination]}
            loop={displayImages.length > 1}
            speed={900}
            grabCursor={true}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation={{
              prevEl: ".hero-prev",
              nextEl: ".hero-next",
            }}
            onSwiper={(sw) => {
              mainSwiperRef.current = sw;
              try {
                sw.autoplay?.start();
              } catch (_) {}
            }}
            onSlideChange={(sw) => setActiveSlideIdx(sw.realIndex ?? sw.activeIndex)}
            className="!w-full !h-full hero-gallery-swiper"
          >
            {displayImages.map((img, i) => (
              <SwiperSlide key={i} className="!w-full !h-full">
                <div className="!w-full !h-full !relative">
                  <img
                    src={img}
                    alt={`${cleanTitle} ${i + 1}`}
                    className="!w-full !h-full !object-cover !object-center"
                  />
                  {/* Dark cinematic vignette */}
                  <div
                    className="!absolute !inset-0"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.12) 72%, rgba(0,0,0,0.20) 100%)",
                    }}
                  />
                  {/* Bottom fade */}
                  <div
                    className="!absolute !bottom-0 !left-0 !right-0 !h-40"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
                    }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* ── LEFT SIDE CONTENT OVERLAY ── */}
          <div className="!absolute !inset-0 !z-20 !flex !flex-col !justify-end !pb-8 sm:!pb-10 !px-6 sm:!px-10 !pointer-events-none">
            <div className="!max-w-[540px] !pointer-events-auto">
              {/* Top Meta Tags Row */}
              <div className="!flex !items-center !gap-2 !flex-wrap !mb-3">
                {service?.category?.name && (
                  <span className="!px-2.5 !py-1 !rounded-md !text-[11px] !font-family-bold !font-bold !uppercase !tracking-wider !bg-amber-500 !text-black !shadow-sm">
                    {service.category.name}
                  </span>
                )}
                <span className="!text-white/70 !text-xs !font-family-medium">
                  {atLocation ? "On-Location Service" : "Designated Location"}
                </span>
                {service?.avgRating > 0 && (
                  <span className="!text-white/50 !text-xs">•</span>
                )}
                {service?.avgRating > 0 && (
                  <span className="!text-white/70 !text-xs !font-family-medium">
                    ★ {service.avgRating.toFixed(1)} Rating
                  </span>
                )}
                <span className="!text-white/50 !text-xs">•</span>
                <span className="!text-white/70 !text-xs !font-family-medium">St. Kitts & Nevis</span>
              </div>

              {/* Title */}
              <h1 className="!text-white !text-3xl sm:!text-4xl md:!text-5xl !font-family-bold !font-bold !tracking-tight !m-0 !mb-3 !leading-[1.1]">
                {cleanTitle}
              </h1>

              {/* Rating / Info Badges */}
              <div className="!flex !items-center !gap-2 !mb-3 !flex-wrap">
                {service?.avgRating > 0 && (
                  <div className="!flex !items-center !gap-1 !bg-amber-500/20 !border !border-amber-400/40 !px-2.5 !py-1 !rounded-md">
                    <FaStar size={11} className="!text-amber-400" />
                    <span className="!text-amber-400 !text-xs !font-family-bold !font-bold">
                      {service.avgRating.toFixed(1)}
                    </span>
                    <span className="!text-white/60 !text-[11px] !font-family-medium">
                      ({reviews.length || service.totalReviews || 0} reviews)
                    </span>
                  </div>
                )}
                <span className="!px-2.5 !py-1 !rounded-md !text-[11px] !font-family-semibold !text-white/85 !bg-white/10 !border !border-white/15">
                  {isGroup ? "GROUP SERVICE" : "INDIVIDUAL"}
                </span>
                <span className="!px-2.5 !py-1 !rounded-md !text-[11px] !font-family-semibold !text-white/85 !bg-white/10 !border !border-white/15">
                  {atLocation ? "We Come To You" : "Direct Specialist"}
                </span>
                {finalPriceUSD > 0 && (
                  <span className="!px-2.5 !py-1 !rounded-md !text-[11px] !font-family-semibold !text-white/95 !bg-emerald-500/20 !border !border-emerald-400/30">
                    ${finalPriceUSD.toFixed(2)} USD ({isGroup ? "group" : "from"})
                  </span>
                )}
              </div>

              {/* Description Excerpt */}
              {cleanAbout && (
                <p className="!text-white/75 !text-sm !font-family-regular !leading-relaxed !m-0 !mb-5 !line-clamp-3">
                  {cleanAbout}
                </p>
              )}

              {/* Photos Progress Bar */}
              <div className="!mb-4">
                <div className="!flex !items-center !justify-between !mb-1.5">
                  <span className="!text-white/60 !text-xs !font-family-medium !truncate !max-w-[240px]">
                    {atLocation ? "At Your Chosen Location" : (meetingAddress || "St. Kitts & Nevis")}
                  </span>
                  <span className="!text-white/60 !text-xs !font-family-medium">
                    {displayImages.length} photos
                  </span>
                </div>
                <div className="!h-[2px] !w-full !bg-white/15 !rounded-full !overflow-hidden">
                  <div
                    className="!h-full !bg-amber-500 !rounded-full !transition-all !duration-700"
                    style={{
                      width: `${Math.min(
                        100,
                        ((activeSlideIdx + 1) / displayImages.length) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="!flex !items-center !gap-3 !flex-wrap">
                <button
                  type="button"
                  onClick={handleBookNow}
                  className="!flex !items-center !gap-2 !px-6 !py-3 !rounded-xl !text-white !text-sm !font-family-bold !font-bold !cursor-pointer !transition-all hover:!scale-105 !shadow-xl !border-none !select-none"
                  style={{
                    background: "#004a70",
                    boxShadow: "0 8px 30px rgba(0,74,112,0.45)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#005f8e")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#004a70")}
                >
                  <FaTag size={14} />
                  <span>Book This Service</span>
                </button>

                <div className="!flex-1" />

                {/* Right Side: Share + Fullscreen Gallery */}
                <div className="!flex !items-center !gap-2">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="!flex !items-center !justify-center !w-11 !h-11 !rounded-xl !bg-white/10 hover:!bg-white/20 !backdrop-blur-md !border !border-white/20 !text-white !cursor-pointer !transition-all"
                    title="Share Service"
                  >
                    <FiShare2 size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => openLightbox(activeSlideIdx)}
                    className="!flex !items-center !justify-center !w-11 !h-11 !rounded-xl !bg-white/10 hover:!bg-white/20 !backdrop-blur-md !border !border-white/20 !text-white !cursor-pointer !transition-all"
                    title="View all photos"
                  >
                    <FiMaximize2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Slide counter pill (top-right) ── */}
          <div className="!absolute !top-4 !right-4 !z-30 !flex !items-center !gap-1.5 !bg-black/45 !backdrop-blur-md !border !border-white/15 !text-white !text-xs !font-family-medium !px-3 !py-1.5 !rounded-xl !pointer-events-none">
            <FaRegImages size={11} />
            <span>
              {activeSlideIdx + 1} / {displayImages.length}
            </span>
          </div>
        </div>

        {/* ── 2-COLUMN DETAILS & STICKY BOOKING GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 relative">
          {/* ───────────────────────────────────────────────────────────── */}
          {/* LEFT SIDE DETAILS PANEL (8 COLS)                              */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-3.5">
            {/* 1. QUICK FACTS BAR (Compact Frosted Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              <div className="bg-white/75 backdrop-blur-xl p-2.5 sm:p-3 rounded-xl border border-white/70 shadow-xs flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-[#004a70] flex items-center justify-center shrink-0">
                  <FaClock size={13} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-family-semibold uppercase tracking-wider block leading-none">
                    Duration
                  </span>
                  <span className="text-xs font-family-bold text-slate-900 block mt-0.5 truncate">
                    {formatServiceDuration(service)}
                  </span>
                </div>
              </div>

              <div className="bg-white/75 backdrop-blur-xl p-2.5 sm:p-3 rounded-xl border border-white/70 shadow-xs flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                  <FaUsers size={13} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-family-semibold uppercase tracking-wider block leading-none">
                    {isGroup ? "Party Size" : "Booking Rate"}
                  </span>
                  <span className="text-xs font-family-bold text-slate-900 block mt-0.5 truncate">
                    {isGroup
                      ? `${minPeople}–${maxPeople} Guests`
                      : `$${adultUnitDiscountedUSD.toFixed(2)} adult`}
                  </span>
                </div>
              </div>

              <div className="bg-white/75 backdrop-blur-xl p-2.5 sm:p-3 rounded-xl border border-white/70 shadow-xs flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
                  <FaRegCalendarCheck size={13} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-family-semibold uppercase tracking-wider block leading-none">
                    Availability
                  </span>
                  <span className="text-xs font-family-bold text-slate-900 block mt-0.5 truncate">
                    {Array.isArray(service.availableDays) && service.availableDays.length > 0
                      ? `${service.availableDays.length} Days`
                      : Array.isArray(service.schedule) && service.schedule.length > 0
                      ? `${service.schedule.length} Days`
                      : "Daily Service"}
                  </span>
                </div>
              </div>

              <div className="bg-white/75 backdrop-blur-xl p-2.5 sm:p-3 rounded-xl border border-white/70 shadow-xs flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-700 flex items-center justify-center shrink-0">
                  <FaShieldHalved size={13} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-family-semibold uppercase tracking-wider block leading-none">
                    Specialist
                  </span>
                  <span className="text-xs font-family-bold text-slate-900 block mt-0.5 truncate">
                    Verified Host
                  </span>
                </div>
              </div>
            </div>

            {/* 2. MEETING / LOCATION BANNER */}
            <div className="bg-white/75 backdrop-blur-xl rounded-xl border border-white/70 shadow-xs p-3 sm:p-3.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-[#004a70] flex items-center justify-center shrink-0">
                <FiMapPin size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-family-bold text-[#004a70] uppercase tracking-wider block leading-none">
                  {atLocation ? "On-Location Care" : "Meeting Location"}
                </span>
                <p className="text-xs font-family-bold text-slate-900 !m-0 mt-0.5 leading-tight truncate">
                  {atLocation
                    ? "We Come Directly To Your Chosen Accommodation, Villa, or Resort"
                    : (meetingAddress || "Independence Square, Basseterre, St Kitts & Nevis")}
                </p>
              </div>
            </div>

            {/* 3. STICKY SWIPER CATEGORY TABS SLIDER */}
            {tabs.length > 0 && (
              <div
                style={{ position: "sticky", top: "74px" }}
                className="sticky top-[74px] z-30 py-1.5 -my-1.5"
              >
                <Swiper
                  modules={[FreeMode, Mousewheel]}
                  slidesPerView="auto"
                  spaceBetween={10}
                  freeMode={true}
                  mousewheel={{ forceToAxis: true }}
                  className="w-full !py-1 category-swiper"
                >
                  {tabs.map((tab) => {
                    const isSelected = activeTab === tab.key;
                    return (
                      <SwiperSlide key={tab.key} style={{ width: "auto" }}>
                        <button
                          type="button"
                          onClick={() => handleTabClick(tab.key, tab.ref)}
                          className={`!cursor-pointer !transition-all !duration-200 !select-none !flex !items-center !gap-2 !px-5 !py-2.5 !rounded-full !text-xs sm:!text-sm !whitespace-nowrap !border !shadow-sm ${
                            isSelected
                              ? "!text-white !bg-[#004a70] !border-[#004a70] !font-family-bold !shadow-md"
                              : "!text-slate-700 !bg-white !border-slate-200/90 hover:!border-[#004a70] hover:!bg-slate-50 hover:!text-[#004a70] !font-family-semibold"
                          }`}
                        >
                          <span className={isSelected ? "opacity-100" : "opacity-75"}>
                            {tab.icon}
                          </span>
                          <span>{tab.label}</span>
                        </button>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>
            )}

            {/* 4. SECTION: OVERVIEW */}
            {showAbout && (
              <div
                id="section-overview"
                ref={overviewRef}
                style={{ scrollMarginTop: "140px" }}
                className="scroll-mt-36 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/70 shadow-xs p-4 sm:p-5 space-y-2.5"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-md bg-sky-500/10 text-[#004a70] flex items-center justify-center">
                    <HiOutlineSparkles size={13} />
                  </div>
                  <h3 className="text-sm sm:text-base font-family-bold text-slate-900 !m-0">
                    Service Overview
                  </h3>
                </div>
                <div
                  className="text-xs sm:text-[13px] text-slate-600 font-family-regular leading-relaxed space-y-2 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: service.about || service.description || "" }}
                />
              </div>
            )}

            {/* 5. SECTION: WHAT'S INCLUDED / EXCLUDED */}
            {showIncludes && (
              <div
                id="section-included"
                ref={includedRef}
                style={{ scrollMarginTop: "140px" }}
                className="scroll-mt-36 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/70 shadow-xs p-4 sm:p-5 space-y-3.5"
              >
                {service.includes?.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <FaCheck size={10} />
                      </div>
                      <h3 className="text-xs sm:text-sm font-family-bold text-slate-900 !m-0">
                        What&apos;s Included
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {service.includes.map((inc, i) => (
                        <div
                          key={i}
                          className="p-2 sm:p-2.5 rounded-lg bg-emerald-500/[0.07] border border-emerald-400/20 flex items-center gap-2 text-xs font-family-medium text-emerald-950 backdrop-blur-xs"
                        >
                          <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <FaCheck size={8} />
                          </div>
                          <span>{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {service.excludes?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-rose-500/10 text-rose-600 flex items-center justify-center">
                        <FaXmark size={10} />
                      </div>
                      <h3 className="text-xs sm:text-sm font-family-bold text-slate-900 !m-0">
                        What&apos;s Not Included
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {service.excludes.map((exc, i) => (
                        <div
                          key={i}
                          className="p-2 sm:p-2.5 rounded-lg bg-rose-500/[0.07] border border-rose-400/20 flex items-center gap-2 text-xs font-family-medium text-rose-950 backdrop-blur-xs"
                        >
                          <div className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                            <FaXmark size={8} />
                          </div>
                          <span>{exc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. SECTION: OPERATING DAYS & SCHEDULE */}
            {showSchedule && (
              <div
                id="section-schedule"
                ref={scheduleRef}
                style={{ scrollMarginTop: "140px" }}
                className="scroll-mt-36 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/70 shadow-xs p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-md bg-sky-500/10 text-[#004a70] flex items-center justify-center">
                    <HiOutlineCalendarDays size={14} />
                  </div>
                  <h3 className="text-sm sm:text-base font-family-bold text-slate-900 !m-0">
                    Operating Days & Hours
                  </h3>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-family-semibold text-slate-700 block">
                    Available Days:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d, i) => {
                      const avail = service.availableDays?.includes(d) ||
                        service.schedule?.some((s) => s.day?.toLowerCase() === d.toLowerCase());
                      return (
                        <div
                          key={i}
                          className={`px-3 py-1.5 rounded-xl text-xs font-family-medium flex items-center gap-1.5 border transition-all ${
                            avail
                              ? "bg-[#004a70] text-white border-[#004a70] font-family-bold shadow-xs"
                              : "bg-slate-50 text-slate-400 border-slate-200/80 opacity-60"
                          }`}
                        >
                          {avail && <FaCheck size={9} />}
                          <span>{d}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 7. SECTION: LOCATION & INTERACTIVE MAPBOX MAP */}
            {showLocation && (
              <div
                id="section-location"
                ref={locationRef}
                style={{ scrollMarginTop: "140px" }}
                className="scroll-mt-36 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/70 shadow-xs p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-md bg-sky-500/10 text-[#004a70] flex items-center justify-center">
                    <HiOutlineMapPin size={14} />
                  </div>
                  <h3 className="text-sm sm:text-base font-family-bold text-slate-900 !m-0">
                    Service Location & Coverage
                  </h3>
                </div>

                <div className="p-3 bg-sky-50/80 border border-sky-100 rounded-xl flex items-start gap-2.5">
                  <FiMapPin size={16} className="text-[#004a70] shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 leading-relaxed font-family-medium">
                    {atLocation ? (
                      <span>
                        <strong>We Come To You:</strong> Our verified specialist delivers this service directly to your private villa, resort, or chosen address anywhere in Saint Kitts.
                      </span>
                    ) : (
                      <span>
                        <strong>Designated Location:</strong> {meetingAddress || "Independence Square, Basseterre, St Kitts & Nevis"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mapbox Container */}
                <div className="w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-slate-200/80 shadow-inner relative">
                  <div ref={mapContainerRef} className="w-full h-full" />
                </div>
              </div>
            )}

            {/* 8. SECTION: CANCELLATION POLICY ACCORDION */}
            {service.cancellationPolicy && (
              <div
                id="section-cancellation"
                ref={cancellationRef}
                style={{ scrollMarginTop: "140px" }}
                className="scroll-mt-36 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/70 shadow-xs overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setCancelOpen(!cancelOpen)}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-700 flex items-center justify-center">
                      <FiInfo size={13} />
                    </div>
                    <h3 className="text-sm sm:text-base font-family-bold text-slate-900 !m-0">
                      Cancellation Policy
                    </h3>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs">
                    {cancelOpen ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                  </div>
                </button>
                {cancelOpen && (
                  <div
                    className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs text-slate-600 font-family-regular leading-relaxed prose max-w-none bg-white/40"
                    dangerouslySetInnerHTML={{ __html: service.cancellationPolicy }}
                  />
                )}
              </div>
            )}

            {/* 9. SECTION: REVIEWS */}
            {showReviews && (
              <div
                id="section-reviews"
                ref={reviewsRef}
                style={{ scrollMarginTop: "140px" }}
                className="scroll-mt-36 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/70 shadow-xs p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <FaStar className="text-amber-400 text-sm" />
                    <h3 className="text-sm sm:text-base font-family-bold text-slate-900 !m-0">
                      Customer Reviews
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-600 text-[11px] font-family-bold">
                    {service.avgRating?.toFixed(1) || "5.0"} ★ ({reviews.length || service.totalReviews || 0})
                  </span>
                </div>

                <div className="space-y-2">
                  {reviews.map((rev, i) => (
                    <div
                      key={rev._id || i}
                      className="p-3 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#004a70] text-white text-[10px] font-family-bold flex items-center justify-center">
                            {(rev.name || rev.user?.name || "C").charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-family-bold text-slate-900 leading-tight">
                            {rev.name || rev.user?.name || "Customer"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 text-[11px] font-family-bold">
                          <FaStar size={9} />
                          <span>{rev.rating || 5}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 font-family-regular !m-0 leading-relaxed">
                        {rev.review || rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* RIGHT SIDE SUMMARY & BOOKING SIDEBAR (4 COLS) - STICKY       */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 h-full">
            <div
              style={{ position: "sticky", top: "76px" }}
              className="sticky top-[76px] z-20 bg-white/90 backdrop-blur-2xl rounded-2xl p-4 sm:p-5 border border-white/80 shadow-[0_12px_36px_rgba(0,35,65,0.06)] space-y-3.5 ring-1 ring-black/[0.02] max-h-[calc(100vh-90px)] overflow-y-auto scrollbar-hide"
            >
              {/* Header */}
              <div className="space-y-0.5 pb-2.5 border-b border-slate-100">
                <span className="text-[10px] font-family-bold uppercase tracking-wider text-[#004a70] block leading-none">
                  {service.category?.name || "Official Service"}
                </span>
                <h2 className="text-sm sm:text-base font-family-bold text-slate-900 leading-snug !m-0">
                  {cleanTitle}
                </h2>
              </div>

              {/* Booking Details for Group Service OR Guest Steppers */}
              {isGroup ? (
                <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-family-bold text-slate-800">Service Type</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#004a70]/10 text-[#004a70] text-[10.5px] font-family-bold">
                      Group Service
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-family-medium !m-0">
                    Flat group rate covers up to {maxPeople} guests.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-family-bold text-slate-900 !m-0">Select Guests</h4>
                    <span className="text-[10px] text-slate-400 font-family-medium">
                      {totalGuests} total
                    </span>
                  </div>

                  {/* Adults */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/70">
                    <div>
                      <span className="text-xs font-family-bold text-slate-800 block leading-tight">
                        Adults (16+)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11.5px] text-[#004a70] font-family-bold">
                          ${adultUnitDiscountedUSD.toFixed(2)} USD
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ${adultUnitOriginalUSD.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={adults <= 1}
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-[#004a70] flex items-center justify-center disabled:opacity-30 cursor-pointer shadow-xs active:scale-95 transition-all"
                        aria-label="Decrease adults"
                      >
                        <FaMinus size={8} />
                      </button>
                      <span className="text-xs font-family-bold text-slate-900 w-4 text-center">
                        {adults}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-[#004a70] flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition-all"
                        aria-label="Increase adults"
                      >
                        <FaPlus size={8} />
                      </button>
                    </div>
                  </div>

                  {/* Kids */}
                  {agePrices.kid > 0 && (
                    <div className="flex items-center justify-between p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/70">
                      <div>
                        <span className="text-xs font-family-bold text-slate-800 block leading-tight">
                          Children (3–15)
                        </span>
                        <span className="text-[11.5px] text-[#004a70] font-family-bold">
                          ${kidUnitDiscountedUSD.toFixed(2)} USD
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={kids <= 0}
                          onClick={() => setKids(Math.max(0, kids - 1))}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-[#004a70] flex items-center justify-center disabled:opacity-30 cursor-pointer shadow-xs active:scale-95 transition-all"
                          aria-label="Decrease kids"
                        >
                          <FaMinus size={8} />
                        </button>
                        <span className="text-xs font-family-bold text-slate-900 w-4 text-center">
                          {kids}
                        </span>
                        <button
                          type="button"
                          onClick={() => setKids(kids + 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-[#004a70] flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition-all"
                          aria-label="Increase kids"
                        >
                          <FaPlus size={8} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Infants */}
                  {agePrices.infant > 0 && (
                    <div className="flex items-center justify-between p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/70">
                      <div>
                        <span className="text-xs font-family-bold text-slate-800 block leading-tight">
                          Infants (0–2)
                        </span>
                        <span className="text-[11.5px] text-emerald-600 font-family-bold">
                          Free
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={infants <= 0}
                          onClick={() => setInfants(Math.max(0, infants - 1))}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-[#004a70] flex items-center justify-center disabled:opacity-30 cursor-pointer shadow-xs active:scale-95 transition-all"
                          aria-label="Decrease infants"
                        >
                          <FaMinus size={8} />
                        </button>
                        <span className="text-xs font-family-bold text-slate-900 w-4 text-center">
                          {infants}
                        </span>
                        <button
                          type="button"
                          onClick={() => setInfants(infants + 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-[#004a70] flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition-all"
                          aria-label="Increase infants"
                        >
                          <FaPlus size={8} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Price Calculation Box (Parity with Mobile App) */}
              <div className="p-3 bg-sky-500/[0.08] rounded-xl border border-sky-400/25 space-y-1.5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-family-semibold uppercase tracking-wider block">
                    Estimated Total
                  </span>
                  <span className="text-[9.5px] text-sky-700 bg-sky-100/80 px-1.5 py-0.2 rounded-md font-family-bold">
                    1 USD = 2.70 XCD
                  </span>
                </div>

                {hasDiscount && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-xs text-slate-400 line-through font-family-medium">
                      was ${originalPriceUSD.toFixed(2)} USD
                    </span>
                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-100/80 text-emerald-800 text-[10px] font-family-bold">
                      {itemDiscountPct}% OFF
                    </span>
                  </div>
                )}

                <div className="flex items-baseline justify-between pt-0.5">
                  <div>
                    <span className="text-xl sm:text-2xl font-family-bold text-[#004a70] tracking-tight">
                      ${finalPriceUSD.toFixed(2)}
                    </span>
                    <span className="text-xs font-family-bold text-[#004a70] ml-1">USD</span>
                    <span className="text-[11px] text-slate-500 font-family-medium ml-1.5">
                      {isGroup
                        ? "per group"
                        : `${totalGuests} guest${totalGuests === 1 ? "" : "s"}`}
                    </span>
                  </div>
                  <span className="text-xs font-family-bold text-slate-500">
                    ≈ ${finalPriceXcd.toFixed(2)} XCD
                  </span>
                </div>

                {!isGroup && (
                  <div className="pt-1.5 border-t border-sky-200/50 text-[10.5px] text-slate-500 space-y-0.5 font-family-medium">
                    <div className="flex justify-between">
                      <span>{adults} × Adult</span>
                      <span>${(adults * adultUnitDiscountedUSD).toFixed(2)}</span>
                    </div>
                    {kids > 0 && (
                      <div className="flex justify-between">
                        <span>{kids} × Child</span>
                        <span>${(kids * kidUnitDiscountedUSD).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Book CTA */}
              <button
                type="button"
                onClick={handleBookNow}
                className="w-full py-3 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white text-xs sm:text-sm font-family-bold transition-all shadow-md shadow-[#004a70]/20 flex items-center justify-center gap-2 cursor-pointer border-none select-none active:scale-[0.98]"
              >
                <span>Book This Service</span>
              </button>

              {/* Badges */}
              <div className="space-y-1.5 pt-0.5">
                <div className="p-2 bg-emerald-500/[0.08] border border-emerald-400/20 rounded-xl flex items-center gap-2 text-[11px] text-emerald-900">
                  <FaShieldHalved className="text-emerald-600 text-sm shrink-0" />
                  <span className="font-family-medium leading-tight">
                    Instant Confirmation & Secure Checkout
                  </span>
                </div>

                <div className="p-2 bg-sky-500/[0.06] border border-sky-400/20 rounded-xl flex items-center gap-2 text-[11px] text-slate-700">
                  <FaTag className="text-[#004a70] text-xs shrink-0" />
                  <span className="font-family-medium leading-tight">
                    100% Direct Verified Provider
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FULLSCREEN CINEMATIC LIGHTBOX MODAL VIA PORTAL                          */}
      {/* ========================================================================= */}
      {lightboxOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className="!fixed !inset-0 !z-[9999999] !flex !items-center !justify-center !bg-black/95 !backdrop-blur-md !animate-fade-in !p-4"
              onClick={() => setLightboxOpen(false)}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="!absolute !top-5 !right-5 !z-30 !w-10 !h-10 !rounded-full !bg-white/15 hover:!bg-white/30 !text-white !flex !items-center !justify-center !border !border-white/20 !cursor-pointer !transition-colors"
                title="Close Gallery"
              >
                <FaXmark size={18} />
              </button>

              {/* Previous Arrow */}
              {displayImages.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (lightboxSwiperRef.current) {
                      lightboxSwiperRef.current.slidePrev();
                    } else {
                      setLightboxIdx(
                        (prev) => (prev - 1 + displayImages.length) % displayImages.length
                      );
                    }
                  }}
                  className="!absolute !left-4 sm:!left-8 !top-1/2 !-translate-y-1/2 !z-30 !w-11 !h-11 !rounded-full !bg-white/15 hover:!bg-white/30 !text-white !flex !items-center !justify-center !border !border-white/20 !cursor-pointer !transition-all hover:!scale-110"
                  title="Previous Photo"
                >
                  <FaChevronLeft size={16} />
                </button>
              )}

              {/* Next Arrow */}
              {displayImages.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (lightboxSwiperRef.current) {
                      lightboxSwiperRef.current.slideNext();
                    } else {
                      setLightboxIdx((prev) => (prev + 1) % displayImages.length);
                    }
                  }}
                  className="!absolute !right-4 sm:!right-8 !top-1/2 !-translate-y-1/2 !z-30 !w-11 !h-11 !rounded-full !bg-white/15 hover:!bg-white/30 !text-white !flex !items-center !justify-center !border !border-white/20 !cursor-pointer !transition-all hover:!scale-110"
                  title="Next Photo"
                >
                  <FaChevronRight size={16} />
                </button>
              )}

              {/* Main Lightbox Image View with Swiper */}
              <div
                className="!max-w-5xl !max-h-[85vh] !w-full !flex !flex-col !items-center !justify-center !relative !animate-scale-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="!w-full !max-h-[75vh] !flex !items-center !justify-center !overflow-hidden">
                  <Swiper
                    initialSlide={lightboxIdx}
                    modules={[Navigation, Keyboard]}
                    keyboard={{ enabled: true }}
                    onSwiper={(sw) => {
                      lightboxSwiperRef.current = sw;
                    }}
                    onSlideChange={(sw) => setLightboxIdx(sw.activeIndex)}
                    className="!w-full !h-full"
                  >
                    {displayImages.map((img, i) => (
                      <SwiperSlide key={i} className="!flex !items-center !justify-center !w-full !h-full">
                        <div className="!w-full !h-full !flex !items-center !justify-center">
                          <img
                            src={img}
                            alt={`${cleanTitle} ${i + 1}`}
                            className="!max-h-[75vh] !max-w-full !object-contain !rounded-2xl !shadow-2xl !border !border-white/10"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                {/* Bottom Bar: Title, Dot Indicators, Counter */}
                <div className="!flex !items-center !justify-between !w-full !max-w-xl !mt-4 !text-white/80 !text-xs !font-family-medium !px-2 !gap-3">
                  <span className="!font-family-medium !truncate">{cleanTitle}</span>
                  {displayImages.length > 1 && (
                    <div className="!flex !items-center !gap-1.5 !bg-white/10 !backdrop-blur-md !px-3 !py-1.5 !rounded-full !border !border-white/15">
                      {displayImages.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setLightboxIdx(i);
                            lightboxSwiperRef.current?.slideTo(i);
                          }}
                          className={`!h-[6px] !rounded-full !transition-all !duration-300 !outline-none !border-0 !p-0 !cursor-pointer ${
                            i === lightboxIdx
                              ? "!w-[22px] !bg-white !shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                              : "!w-[6px] !bg-white/35 hover:!bg-white/60 hover:!w-[10px]"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  <span className="!bg-white/20 !px-3 !py-1 !rounded-full !text-[11px] !font-family-bold !shrink-0">
                    {lightboxIdx + 1} / {displayImages.length}
                  </span>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
