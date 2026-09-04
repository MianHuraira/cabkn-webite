"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
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
  FiArrowRight,
  FiFileText,
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
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade, Thumbs, FreeMode, Keyboard, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
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
      : userOrPercent,
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

const getAgePrices = (tour) => {
  const adultFallback = Number(tour?.price || 0);
  const ages = tour?.agePrices || {};
  return {
    infant: Number(ages.infant ?? 0),
    kid: Number(ages.kid ?? 0),
    adult: Number(ages.adult ?? adultFallback),
  };
};

const isGroupTour = (tour) => {
  const type = String(tour?.bookingType || "").toLowerCase();
  if (type === "individual" || type === "group") return type === "group";
  if (String(tour?.priceType || "").toLowerCase() === "per_group") return true;
  return false;
};

const calcTourSubtotal = (tour, guests = {}) => {
  if (isGroupTour(tour)) {
    return Number(tour?.price || 0);
  }
  const ages = getAgePrices(tour);
  const infants = Number(guests?.infants || 0);
  const kids = Number(guests?.kids || 0);
  const adults = Number(guests?.adults || 0);
  return infants * ages.infant + kids * ages.kid + adults * ages.adult;
};

const calcTourTotal = (tour, guests = {}) =>
  applyItemDiscount(calcTourSubtotal(tour, guests), tour);

const formatTime12h = (slot) => {
  if (!slot) return "";
  const m = moment(slot, ["HH:mm", "H:mm", "hh:mm A", "h:mm A"]);
  return m.isValid() ? m.format("h:mm A") : slot;
};

const stripHtml = (html) => {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
};

export default function TourDetailsComponent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { getData, header1, userData } = ApiFunction();

  const [tour, setTour] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Swiper Hero Carousel state & ref
  const mainSwiperRef = useRef(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  // Accordion state for cancellation policy & itinerary stops
  const [cancelOpen, setCancelOpen] = useState(false);
  const [expandedStops, setExpandedStops] = useState({});

  // Fullscreen Lightbox Modal state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const lightboxSwiperRef = useRef(null);

  // Mounted state for portal rendering
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // When fullscreen lightbox is open: lock body scroll and hide Tidio chat widget
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
      try {
        if (window.tidioChatApi && typeof window.tidioChatApi.hide === "function") {
          window.tidioChatApi.hide();
        }
      } catch (_) {}
    } else {
      document.body.style.overflow = "";
      try {
        if (window.tidioChatApi && typeof window.tidioChatApi.show === "function") {
          window.tidioChatApi.show();
        }
      } catch (_) {}
    }

    return () => {
      document.body.style.overflow = "";
      try {
        if (window.tidioChatApi && typeof window.tidioChatApi.show === "function") {
          window.tidioChatApi.show();
        }
      } catch (_) {}
    };
  }, [lightboxOpen]);

  // Schedule state for available days & time slots
  const [selectedScheduleDay, setSelectedScheduleDay] = useState(null);

  // Quantity states for individual tours
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [infants, setInfants] = useState(0);

  // Scroll section refs
  const overviewRef = useRef(null);
  const includedRef = useRef(null);
  const itineraryRef = useRef(null);
  const scheduleRef = useRef(null);
  const bookingRef = useRef(null);
  const guestsRef = useRef(null);
  const reviewsRef = useRef(null);

  // Load tour details from `tours/details/${id}`
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getData(`tours/details/${id}`, header1)
      .then((res) => {
        const nextTour = res?.data?.tour || res?.tour || null;
        setTour(nextTour);
        if (Array.isArray(nextTour?.schedule)) {
          const firstDay = nextTour.schedule.find((s) => s.day && s.slots?.length > 0);
          if (firstDay) {
            setSelectedScheduleDay(firstDay.day.slice(0, 3));
          }
        }
      })
      .catch((err) => {
        console.error("Tour detail error:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Load reviews from `rating/tour/${id}`
    getData(`rating/tour/${id}`, header1)
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
  }, [lightboxOpen, tour?.images?.length]);

  // Mapbox GL Refs & Effect
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!tour?.stops?.length || !mapContainerRef.current) return;

    try {
      const stopsWithCoords = tour.stops
        .map((s, idx) => ({
          stop: s,
          idx,
          lat: Number(s.lat ?? s.latitude),
          lng: Number(s.lng ?? s.longitude),
        }))
        .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng) && item.lat !== 0);

      const centerLng = stopsWithCoords.length ? stopsWithCoords[0].lng : -62.717692;
      const centerLat = stopsWithCoords.length ? stopsWithCoords[0].lat : 17.302605;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [centerLng, centerLat],
        zoom: 12,
      });

      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      stopsWithCoords.forEach(({ stop, idx, lat, lng }) => {
        const el = document.createElement("div");
        el.className = "custom-mapbox-marker";
        el.style.width = "24px";
        el.style.height = "24px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "#004a70";
        el.style.color = "#ffffff";
        el.style.fontWeight = "bold";
        el.style.fontSize = "11px";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.border = "2px solid #ffffff";
        el.style.boxShadow = "0 3px 10px rgba(0, 74, 112, 0.4)";
        el.innerText = String(idx + 1);

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 180px;">
            <strong style="color: #004a70; font-size: 12px; display: block; margin-bottom: 2px;">
              ${idx + 1}. ${stop.name || stop.title || `Stop ${idx + 1}`}
            </strong>
            ${stop.address ? `<p style="margin: 0; font-size: 10.5px; color: #64748b; line-height: 1.2;">${stop.address}</p>` : ""}
          </div>
        `);

        new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);
      });

      if (stopsWithCoords.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        stopsWithCoords.forEach((s) => bounds.extend([s.lng, s.lat]));
        map.fitBounds(bounds, { padding: 35, maxZoom: 14 });
      }

      setTimeout(() => map.resize(), 300);
      setTimeout(() => map.resize(), 800);

      return () => {
        map.remove();
      };
    } catch (e) {
      console.error("Mapbox init error:", e);
    }
  }, [tour]);

  // Pricing calculations (Exact Parity with Mobile App)
  const isGroup = isGroupTour(tour);
  const minPeople = Math.max(1, Number(tour?.minPersons) || 1);
  const maxPeople = Math.max(minPeople, Number(tour?.maxPersons) || minPeople);

  const agePrices = useMemo(() => getAgePrices(tour), [tour]);
  const guests = useMemo(() => ({ infants, kids, adults }), [infants, kids, adults]);
  const totalGuests = isGroup ? 1 : adults + kids + infants;

  // Catalog Subtotal in XCD
  const catalogSubtotalXcd = useMemo(() => calcTourSubtotal(tour, guests), [tour, guests]);

  // Total price after catalog discount in XCD
  const totalPriceAfterCatalogXcd = useMemo(() => calcTourTotal(tour, guests), [tour, guests]);

  // Apply special user discount (if any)
  const specialOnTour = useMemo(
    () => applySpecialDiscount(totalPriceAfterCatalogXcd, userData?.user || userData),
    [totalPriceAfterCatalogXcd, userData]
  );

  // Final amounts
  const finalPriceXcd = specialOnTour.discounted;
  const finalPriceUSD = toUsd(finalPriceXcd);
  const originalPriceUSD = toUsd(catalogSubtotalXcd);
  const itemDiscountPct = getItemDiscountPercent(tour);
  const hasDiscount = catalogSubtotalXcd > finalPriceXcd;

  // Age-based unit prices in USD
  const adultUnitOriginalUSD = toUsd(agePrices.adult);
  const adultUnitDiscountedUSD = toUsd(applyItemDiscount(agePrices.adult, tour));
  const kidUnitOriginalUSD = toUsd(agePrices.kid);
  const kidUnitDiscountedUSD = toUsd(applyItemDiscount(agePrices.kid, tour));
  const infantUnitDiscountedUSD = toUsd(applyItemDiscount(agePrices.infant, tour));

  // Text & Clean fields
  const cleanTitle = stripHtml(tour?.title) || "Tour Experience";
  const cleanAbout =
    stripHtml(tour?.about || tour?.description) ||
    "Explore the pristine natural beauty, tropical waters, and Caribbean culture with CabKn.";
  const cleanAddress = stripHtml(tour?.meetingPoint?.address || tour?.address) || "St. Kitts & Nevis";

  const displayImages = tour?.images?.length
    ? tour.images
    : typeof tour?.images === "string" && tour.images
    ? [tour.images]
    : ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200"];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] relative overflow-hidden">
        <div className="absolute w-72 h-72 bg-sky-400/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/70 !border border-white/60 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-100 border-t-[#004a70]" />
          </div>
          <p className="text-[11px] font-family-semibold text-slate-500 tracking-wider uppercase animate-pulse">
            Loading tour experience...
          </p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4 text-center relative">
        <div className="w-full max-w-sm p-6 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/70 shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#004a70] mx-auto flex items-center justify-center">
            <FiMapPin size={22} />
          </div>
          <h2 className="text-base font-family-semibold text-slate-900 !m-0">Tour Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The tour experience you are looking for is currently unavailable.
          </p>
          <Link
            href="/tours"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white text-xs font-family-semibold shadow-md no-underline transition-all"
          >
            <FiArrowLeft size={13} />
            <span>Explore All Tours</span>
          </Link>
        </div>
      </div>
    );
  }

  // Visibility checks
  const showAbout = Boolean(tour?.about || tour?.description);
  const showIncludes = Boolean(tour?.includes?.length > 0 || tour?.excludes?.length > 0);
  const showStops = Boolean(tour?.stops?.length > 0);
  const showSchedule = Boolean(Array.isArray(tour?.schedule) && tour.schedule.length > 0);
  const showAccessibility = Boolean(tour?.accessibility?.length > 0);
  const showCancel = Boolean(tour?.cancellationPolicy);
  const showMeeting = Boolean(tour?.meetingPoint?.address);
  const showReviews = Boolean(reviews?.length > 0);

  // Dynamic Tabs List with Booking for Group vs Guests for Individual
  const tabs = [];
  if (showAbout) tabs.push({ key: "overview", label: "Overview", icon: <HiOutlineSparkles size={13} />, ref: overviewRef });
  if (showIncludes) tabs.push({ key: "included", label: "What's Included", icon: <HiOutlineCheckCircle size={13} />, ref: includedRef });
  if (showStops) tabs.push({ key: "itinerary", label: "Itinerary", badge: `${tour.stops.length}`, icon: <HiOutlineMapPin size={13} />, ref: itineraryRef });
  if (showSchedule) tabs.push({ key: "schedule", label: "Schedule", icon: <HiOutlineCalendarDays size={13} />, ref: scheduleRef });
  if (isGroup) {
    tabs.push({ key: "booking", label: "Booking", icon: <FaUsers size={12} />, ref: bookingRef });
  } else {
    tabs.push({ key: "guests", label: "Guests", icon: <FaUsers size={12} />, ref: guestsRef });
  }
  if (showReviews) tabs.push({ key: "reviews", label: `Reviews (${reviews.length})`, icon: <FaStar size={11} />, ref: reviewsRef });

  // Robust Tab Click Handler (Scrolls reliably to the exact section with headroom below sticky navbar & sticky tabs)
  const handleTabClick = (tabKey, ref) => {
    setActiveTab(tabKey);
    const element = ref?.current || document.getElementById(`section-${tabKey}`);
    if (element) {
      // 1. Native scrollIntoView respecting scroll-margin-top
      element.scrollIntoView({ behavior: "smooth", block: "start" });

      // 2. Direct document/window scroll calculation with exact offset for sticky header + sticky tabs
      const headerOffset = 140;
      const elementPosition = element.getBoundingClientRect().top;
      const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const offsetPosition = elementPosition + currentScroll - headerOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });

      if (document.documentElement && document.documentElement.scrollTo) {
        document.documentElement.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: "smooth",
        });
      }
    }
  };

  const handleBookNow = () => {
    if (!isGroup && totalGuests < 1) {
      message.error("Please add at least 1 guest");
      return;
    }
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(`tour_${tour._id}`, JSON.stringify(tour));
        sessionStorage.setItem("selected_tour", JSON.stringify(tour));
      } catch (e) {
        console.warn("sessionStorage save error:", e);
      }
    }
    router.push(`/bookTour?id=${tour._id}`);
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      message.success("Tour link copied to clipboard!");
    } else {
      message.info("Tour link ready to share");
    }
  };

  const openLightbox = (idx) => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
    setTimeout(() => {
      if (lightboxSwiperRef.current && !lightboxSwiperRef.current.destroyed) {
        lightboxSwiperRef.current.slideTo(idx, 0);
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-poppins text-slate-800 relative">
      {/* Background Ambient Glow Lights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[15%] -left-28 w-[400px] h-[400px] bg-sky-400/[0.08] rounded-full blur-[110px]" />
        <div className="absolute top-[40%] -right-32 w-[450px] h-[450px] bg-indigo-500/[0.06] rounded-full blur-[120px]" />
      </div>

      {/* ========================================================================= */}
      {/* 1. CINEMATIC FULL-BLEED HERO SECTION (MATCHING HOME PAGE HERO)            */}
      {/* ========================================================================= */}
      <section className="!relative !w-full !min-h-[560px] sm:!min-h-[620px] md:!min-h-[680px] !flex !items-center !overflow-hidden !pt-24 sm:!pt-28 md:!pt-32 !pb-20 sm:!pb-24 !select-none">
        {/* Full-Bleed Background Image Swiper with CrossFade Transition */}
        <div className="!absolute !inset-0 !z-0 !pointer-events-none">
          <Swiper
            key={`hero-${displayImages.length}-${tour?._id || "tour"}`}
            modules={[Autoplay, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            speed={1000}
            autoplay={{
              delay: 5500,
              disableOnInteraction: false,
            }}
            loop={displayImages.length > 1}
            onSwiper={(sw) => {
              mainSwiperRef.current = sw;
            }}
            onSlideChange={(sw) => {
              setActiveSlideIdx(sw.realIndex ?? sw.activeIndex ?? 0);
            }}
            className="!w-full !h-full"
          >
            {displayImages.map((img, i) => (
              <SwiperSlide key={i} className="!w-full !h-full !relative">
                <div
                  className="!w-full !h-full !bg-cover !bg-no-repeat !bg-center !transition-transform !duration-1000 !ease-out"
                  style={{
                    backgroundImage: `url(${img})`,
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Dark Overlays for high text contrast on the left, clear view of image on the right */}
        <div className="!absolute !inset-0 !bg-gradient-to-r !from-black/90 !via-black/60 sm:!via-black/50 !to-transparent !pointer-events-none !z-[1]" />
        <div className="!absolute !inset-0 !bg-gradient-to-t !from-black/85 !via-transparent !to-black/30 !pointer-events-none !z-[1]" />

        {/* Foreground Content - Clean Home Hero Architecture */}
        <div className="!relative !z-10 !w-full !max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8">
          <div className="!flex !flex-col !gap-3.5 sm:!gap-4 !max-w-xl lg:!max-w-2xl">
            {/* Top Row: Category in Pill, Location outside */}
            <div className="!flex !items-center !gap-2.5 sm:!gap-3 !flex-wrap">
              {tour?.category?.name && (
                <span className="!inline-flex !items-center !bg-black/40 !backdrop-blur-md !text-brand-300 !text-[11px] sm:!text-xs !uppercase !tracking-[0.15em] !font-family-semibold !px-3 !py-1 !rounded-full !border !border-white/15 !shadow-xs">
                  {tour.category.name}
                </span>
              )}
              {cleanAddress && (
                <div className="!inline-flex !items-center !gap-1.5 !text-white/90 !text-xs sm:!text-sm !font-family-medium !drop-shadow-sm">
                  <FiMapPin className="!text-brand-300 !text-sm !shrink-0" />
                  <span>{cleanAddress}</span>
                </div>
              )}
            </div>

            {/* Main Title */}
            <h1 className="!text-white !font-family-medium !leading-[1.2] !tracking-tight !m-0 !text-[clamp(1.85rem,4.2vw,3rem)] !drop-shadow-lg">
              {cleanTitle}
            </h1>

            {/* Checklist / Features Row (Clean & Spacious) */}
            <div className="!flex !gap-3.5 sm:!gap-5 !mt-1 !flex-wrap !items-center">
              {tour?.ratingsAverage > 0 && (
                <div className="!flex !items-center !gap-1.5 !text-amber-300 !text-xs sm:!text-sm !font-family-semibold">
                  <FaStar className="!text-amber-400 !w-3.5 !h-3.5" />
                  <span>{tour.ratingsAverage.toFixed(1)}</span>
                  <span className="!text-white/60 !text-xs !font-family-regular">
                    ({reviews.length || tour.totalReviews || 0})
                  </span>
                </div>
              )}

              <div className="!flex !items-center !gap-2">
                <div className="!w-5 !h-5 !rounded-full !bg-[#004a70] !flex !items-center !justify-center !shrink-0">
                  <HiOutlineCheckCircle size={12} color="#fff" />
                </div>
                <span className="!text-white/90 !font-family-regular !text-xs sm:!text-sm">
                  {isGroup ? "Group Tour Experience" : "Individual Guided Tour"}
                </span>
              </div>

              <div className="!flex !items-center !gap-2">
                <div className="!w-5 !h-5 !rounded-full !bg-[#004a70] !flex !items-center !justify-center !shrink-0">
                  <HiOutlineCheckCircle size={12} color="#fff" />
                </div>
                <span className="!text-white/90 !font-family-regular !text-xs sm:!text-sm">
                  Verified Local Guide
                </span>
              </div>

              {tour?.duration && (
                <div className="!flex !items-center !gap-2">
                  <div className="!w-5 !h-5 !rounded-full !bg-[#004a70] !flex !items-center !justify-center !shrink-0">
                    <FaClock size={10} color="#fff" />
                  </div>
                  <span className="!text-white/90 !font-family-regular !text-xs sm:!text-sm">
                    {tour.duration} {tour.durationUnit || "Hours"}
                  </span>
                </div>
              )}
            </div>

            {/* Action Row: Small Primary Book Now Button & Separate Price Badge */}
            <div className="!flex !items-center !gap-3 sm:!gap-3.5 !mt-2.5 sm:!mt-3 !flex-wrap">
              <button
                type="button"
                onClick={handleBookNow}
                className="!inline-flex !items-center !gap-1.5 !bg-[#004a70] hover:!bg-[#003855] !text-white !font-family-semibold !text-xs sm:!text-sm !px-4 sm:!px-5 !py-2 sm:!py-2.5 !rounded-xl !shadow-md hover:!shadow-lg !transition-all !duration-200 !cursor-pointer hover:!scale-105 active:!scale-95 !border-0"
              >
                <span>Book Now</span>
                <FiArrowRight className="!w-3.5 !h-3.5" />
              </button>

              {finalPriceUSD > 0 && (
                <div className="!inline-flex !items-baseline !gap-1.5 !bg-black/40 !backdrop-blur-md !border !border-white/15 !px-3.5 !py-2 !rounded-xl !text-white !shadow-xs">
                  <span className="!text-[11px] sm:!text-xs !text-white/70 !font-family-regular">From</span>
                  <span className="!text-sm sm:!text-base !font-family-semibold !text-emerald-400">
                    ${Number.isInteger(finalPriceUSD) ? finalPriceUSD.toFixed(0) : finalPriceUSD.toFixed(2)} USD
                  </span>
                  <span className="!text-[10.5px] sm:!text-xs !text-white/60 !font-family-regular">
                    /{isGroup ? "group" : "guest"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modern Pill & Dot Pagination at Bottom Center (Exact Home Hero Design) */}
        {displayImages.length > 1 && (
          <div className="!absolute !bottom-6 md:!bottom-8 !left-0 !right-0 !z-20 !pointer-events-auto !flex !justify-center !items-center !gap-2">
            {displayImages.map((_, idx) => {
              const isActive = activeSlideIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => mainSwiperRef.current?.slideToLoop(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`!h-2.5 !rounded-full !transition-all !duration-300 !ease-in-out !cursor-pointer !border-0 !p-0 ${
                    isActive
                      ? "!w-8 !bg-white !shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                      : "!w-2.5 !bg-white/50 hover:!bg-white/80"
                  }`}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 2. MAIN COCKPIT SECTION WITH DETAILS & STICKY BOOKING GRID                */}
      {/* ========================================================================= */}
      <div className="!w-full !px-4 sm:!px-6 lg:!px-8 !relative !z-20 !max-w-7xl !mx-auto !pt-8 sm:!pt-10 !pb-16">
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
                  <span className="text-xs font-family-semibold text-slate-900 block mt-0.5 truncate">
                    {tour.durationHours ? `${tour.durationHours} Hours` : "Flexible"}
                  </span>
                </div>
              </div>

              <div className="bg-white/75 backdrop-blur-xl p-2.5 sm:p-3 rounded-xl border border-white/70 shadow-xs flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                  <FaUsers size={13} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-family-semibold uppercase tracking-wider block leading-none">
                    {isGroup ? "Party Size" : "Price by Age"}
                  </span>
                  <span className="text-xs font-family-semibold text-slate-900 block mt-0.5 truncate">
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
                    Schedule
                  </span>
                  <span className="text-xs font-family-semibold text-slate-900 block mt-0.5 truncate">
                    {Array.isArray(tour.schedule) && tour.schedule.length > 0
                      ? `${tour.schedule.length} Days`
                      : "Daily"}
                  </span>
                </div>
              </div>

              <div className="bg-white/75 backdrop-blur-xl p-2.5 sm:p-3 rounded-xl border border-white/70 shadow-xs flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-700 flex items-center justify-center shrink-0">
                  <FaShieldHalved size={13} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-family-semibold uppercase tracking-wider block leading-none">
                    Verified
                  </span>
                  <span className="text-xs font-family-semibold text-slate-900 block mt-0.5 truncate">
                    Certified Guide
                  </span>
                </div>
              </div>
            </div>

            {/* 2. MEETING POINT BANNER */}
            {showMeeting && (
              <div className="bg-white/75 backdrop-blur-xl rounded-xl border border-white/70 shadow-xs p-3 sm:p-3.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-[#004a70] flex items-center justify-center shrink-0">
                  <FiMapPin size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-family-semibold text-[#004a70] uppercase tracking-wider block leading-none">
                    Meeting Location
                  </span>
                  <p className="text-xs font-family-semibold text-slate-900 !m-0 mt-0.5 leading-tight truncate">
                    {tour.meetingPoint.address}
                  </p>
                </div>
              </div>
            )}

            {/* 3. STICKY SWIPER CATEGORY TABS SLIDER (Matches Profile / Admin / Rest of Web) */}
            {tabs.length > 0 && (
              <div
                style={{ position: "sticky", top: "74px" }}
                className="sticky top-[74px] z-30 py-1.5 -my-1.5 "
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
                              ? "!text-white !bg-[#004a70] !border-[#004a70] !font-family-semibold !shadow-md"
                              : "!text-slate-700 !bg-white !border-slate-200/90 hover:!border-[#004a70] hover:!bg-slate-50 hover:!text-[#004a70] !font-family-semibold"
                          }`}
                        >
                          <span className={isSelected ? "opacity-100" : "opacity-75"}>
                            {tab.icon}
                          </span>
                          <span>{tab.label}</span>
                          {tab.badge !== undefined && (
                            <span
                              className={`!text-[10.5px] !px-2 !py-0.5 !rounded-full !font-family-semibold ${
                                isSelected
                                  ? "!bg-white/20 !text-white"
                                  : "!bg-slate-100 !text-slate-700"
                              }`}
                            >
                              {tab.badge}
                            </span>
                          )}
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
                  <h3 className="text-sm sm:text-base font-family-semibold text-slate-900 !m-0">
                    Tour Overview
                  </h3>
                </div>
                <div
                  className="text-xs sm:text-[13px] text-slate-600 font-family-regular leading-relaxed space-y-2 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: tour.about || tour.description || "" }}
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
                {tour.includes?.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <FaCheck size={10} />
                      </div>
                      <h3 className="text-xs sm:text-sm font-family-semibold text-slate-900 !m-0">
                        What&apos;s Included
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {tour.includes.map((inc, i) => (
                        <div
                          key={i}
                          className="p-2 sm:p-2.5 rounded-lg bg-emerald-500/[0.07] border border-emerald-400/20 flex items-center gap-2 text-xs font-family-medium text-emerald-950 backdrop-blur-xs"
                        >
                          <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <FaCheck size={8} />
                          </div>
                          <span className="leading-tight truncate">{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tour.excludes?.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-rose-500/10 text-rose-600 flex items-center justify-center">
                        <FaXmark size={10} />
                      </div>
                      <h4 className="text-xs font-family-semibold uppercase tracking-wider text-slate-700 !m-0">
                        Not Included
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {tour.excludes.map((exc, i) => (
                        <div
                          key={i}
                          className="p-2 sm:p-2.5 rounded-lg bg-rose-500/[0.06] border border-rose-400/20 flex items-center gap-2 text-xs font-family-medium text-rose-950 backdrop-blur-xs"
                        >
                          <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                            <FaXmark size={8} />
                          </div>
                          <span className="leading-tight truncate">{exc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. SECTION: ITINERARY & MAP */}
            {showStops && (
              <div
                id="section-itinerary"
                ref={itineraryRef}
                style={{ scrollMarginTop: "140px" }}
                className="scroll-mt-36 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/70 shadow-xs p-4 sm:p-5 space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-sky-500/10 text-[#004a70] flex items-center justify-center">
                      <HiOutlineMapPin size={13} />
                    </div>
                    <h3 className="text-sm sm:text-base font-family-semibold text-slate-900 !m-0">
                      Itinerary & Route Map
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-400/20 text-[11px] text-[#004a70] font-family-semibold">
                    {tour.stops.length} Stops
                  </span>
                </div>

                {/* Mapbox Canvas */}
                <div className="relative w-full h-[220px] sm:h-[260px] rounded-xl overflow-hidden border border-slate-200/90 shadow-2xs bg-slate-950">
                  <div ref={mapContainerRef} className="w-full h-full" />
                  <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[11px] font-family-semibold shadow-md flex items-center gap-1.5 pointer-events-none z-10 border border-white/20">
                    <FiMapPin size={11} className="text-sky-300" />
                    <span>{tour.stops.length} Waypoints</span>
                  </div>
                </div>

                {/* Timeline Stops */}
                <div className="space-y-2.5 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#004a70] before:to-slate-200">
                  {tour.stops.map((stop, i) => {
                    const hasNoteOrImage = Boolean(stop.note || stop.image || stop.description);
                    const isOpen = expandedStops[i] ?? false;

                    return (
                      <div key={i} className="flex items-start gap-2.5 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-[#004a70] text-white font-family-semibold text-[10.5px] flex items-center justify-center shrink-0 shadow-xs mt-0.5 ring-2 ring-white">
                          {i + 1}
                        </div>

                        <div className="flex-1 bg-white/70 backdrop-blur-md rounded-xl border border-white/80 shadow-2xs overflow-hidden">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedStops((prev) => ({ ...prev, [i]: !isOpen }))
                            }
                            className="w-full p-2.5 sm:p-3 text-left flex items-start justify-between gap-2 hover:bg-slate-50/70 transition-colors cursor-pointer border-none bg-transparent"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <span className="text-xs sm:text-[13px] font-family-semibold text-slate-900 block leading-snug truncate">
                                {stop.name || stop.title || `Stop ${i + 1}`}
                              </span>
                              {stop.address && (
                                <p className="text-[11px] text-slate-500 font-family-regular !m-0 leading-tight truncate">
                                  {stop.address}
                                </p>
                              )}
                              {stop.durationMinutes && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md bg-sky-500/10 text-[#004a70] text-[10px] font-family-semibold border border-sky-400/20 mt-0.5">
                                  <FaClock size={8} />
                                  <span>{stop.durationMinutes} mins</span>
                                </span>
                              )}
                            </div>

                            {hasNoteOrImage && (
                              <div className="text-slate-400 p-1 rounded-md bg-slate-100/70 shrink-0">
                                {isOpen ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                              </div>
                            )}
                          </button>

                          {isOpen && hasNoteOrImage && (
                            <div className="px-3 pb-3 pt-1 space-y-2 border-t border-slate-100 bg-white/40">
                              {stop.image && (
                                <div className="relative h-32 w-full rounded-lg overflow-hidden bg-slate-100">
                                  <img
                                    src={stop.image}
                                    alt={stop.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              {(stop.note || stop.description) && (
                                <p className="text-[11px] text-slate-600 font-family-regular leading-relaxed !m-0 bg-slate-50/70 p-2 rounded-lg">
                                  {stop.note || stop.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7. SECTION: SCHEDULE & TIME SLOTS */}
            {showSchedule && (
              <div
                id="section-schedule"
                ref={scheduleRef}
                style={{ scrollMarginTop: "140px" }}
                className="scroll-mt-36 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/70 shadow-xs p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-sky-500/10 text-[#004a70] flex items-center justify-center">
                      <HiOutlineCalendarDays size={13} />
                    </div>
                    <h3 className="text-sm sm:text-base font-family-semibold text-slate-900 !m-0">
                      Available Days & Slots
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#004a70] font-family-semibold">
                    Tap a day to view
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                    const matchedDay = tour.schedule.find(
                      (s) =>
                        s.day?.slice(0, 3).toLowerCase() === day.toLowerCase() &&
                        s.slots?.length > 0
                    );
                    const isAvail = !!matchedDay;
                    const isSelected = selectedScheduleDay === day;

                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={!isAvail}
                        onClick={() => setSelectedScheduleDay(day)}
                        className={`px-3 py-2 rounded-xl text-xs font-family-semibold text-center min-w-[58px] transition-all cursor-pointer border select-none ${
                          isSelected
                            ? "bg-[#004a70] text-white shadow-xs border-transparent font-bold"
                            : isAvail
                            ? "bg-sky-500/[0.08] text-[#004a70] border-sky-400/30 hover:bg-sky-500/15"
                            : "bg-slate-100/60 text-slate-400 border-slate-200/50 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="text-xs font-family-semibold">{day}</div>
                        <div className="text-[9.5px] font-family-medium mt-0.5 opacity-80">
                          {isAvail ? `${matchedDay.slots.length} slots` : "Off"}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedScheduleDay && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[11px] font-family-semibold text-slate-700 block">
                      Departure time slots for {selectedScheduleDay}:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {tour.schedule
                        .find(
                          (s) =>
                            s.day?.slice(0, 3).toLowerCase() === selectedScheduleDay.toLowerCase()
                        )
                        ?.slots?.map((slot, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1.5 rounded-lg bg-sky-500/[0.09] text-[#004a70] border border-sky-400/25 text-[11px] font-family-semibold flex items-center gap-1 shadow-2xs"
                          >
                            <FaClock size={10} className="text-[#004a70]" />
                            <span>{formatTime12h(slot)}</span>
                          </span>
                        )) || (
                        <span className="text-[11px] text-slate-400 font-family-medium">
                          No slots available for this day.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 8. SECTION: BOOKING (FOR GROUP) OR GUESTS BREAKDOWN (FOR INDIVIDUAL) */}
            {isGroup ? (
              <div
                id="section-booking"
                ref={bookingRef}
                style={{ scrollMarginTop: "140px" }}
                className="scroll-mt-36 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/70 shadow-xs p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-sky-500/10 text-[#004a70] flex items-center justify-center">
                      <FaUsers size={12} />
                    </div>
                    <h3 className="text-sm sm:text-base font-family-semibold text-slate-900 !m-0">
                      Booking Information
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-[#004a70] text-[11px] font-family-semibold border border-sky-400/20">
                    <FaUsers size={10} />
                    <span>Group Tour · Flat Rate</span>
                  </span>
                </div>

                <div className="p-3.5 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-baseline justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-xs font-family-semibold text-slate-900 block">
                        Group Flat Rate
                      </span>
                      <span className="text-[11px] text-slate-500 font-family-medium">
                        Capacity {minPeople}–{maxPeople} guests · priced as one group
                      </span>
                    </div>
                    <div className="text-right">
                      {hasDiscount && (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-xs text-slate-400 line-through">
                            ${originalPriceUSD.toFixed(2)} USD
                          </span>
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-family-semibold text-[9.5px] border border-emerald-200">
                            {itemDiscountPct}% OFF
                          </span>
                        </div>
                      )}
                      <span className="text-base sm:text-lg font-family-semibold text-[#004a70] block">
                        ${finalPriceUSD.toFixed(2)} USD
                      </span>
                      <span className="text-[10.5px] text-slate-400 font-family-medium">
                        (${finalPriceXcd.toFixed(2)} XCD)
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 font-family-regular !m-0 pt-1 border-t border-slate-100 leading-relaxed">
                    This reservation covers your entire private party up to {maxPeople} guests. You do not need to select per-person tickets.
                  </p>
                </div>
              </div>
            ) : (
              <div
                id="section-guests"
                ref={guestsRef}
                style={{ scrollMarginTop: "140px" }}
                className="scroll-mt-36 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/70 shadow-xs p-4 sm:p-5 space-y-2.5"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-sky-500/10 text-[#004a70] flex items-center justify-center">
                      <FaUsers size={12} />
                    </div>
                    <h3 className="text-sm sm:text-base font-family-semibold text-slate-900 !m-0">
                      Pricing Breakdown by Age
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-[#004a70] text-[11px] font-family-semibold border border-sky-400/20">
                    <span>Individual · Priced by Age</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-xs font-family-semibold text-slate-800 block">
                      Adults (Age 16+)
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-sm font-family-semibold text-[#004a70]">
                        ${adultUnitDiscountedUSD.toFixed(2)} USD
                      </span>
                      {hasDiscount && (
                        <span className="text-[11px] text-slate-400 line-through">
                          ${adultUnitOriginalUSD.toFixed(2)}
                        </span>
                      )}
                      <span className="text-[10.5px] text-slate-400">
                        (${applyItemDiscount(agePrices.adult, tour).toFixed(2)} XCD)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-xs font-family-semibold text-slate-800 block">
                      Children (Age 1–15)
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-sm font-family-semibold text-[#004a70]">
                        ${kidUnitDiscountedUSD.toFixed(2)} USD
                      </span>
                      {hasDiscount && (
                        <span className="text-[11px] text-slate-400 line-through">
                          ${kidUnitOriginalUSD.toFixed(2)}
                        </span>
                      )}
                      <span className="text-[10.5px] text-slate-400">
                        (${applyItemDiscount(agePrices.kid, tour).toFixed(2)} XCD)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 9. SECTION: ACCESSIBILITY */}
            {showAccessibility && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/70 shadow-xs p-4 sm:p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-sky-500/10 text-[#004a70] flex items-center justify-center">
                    <FiInfo size={13} />
                  </div>
                  <h3 className="text-sm sm:text-base font-family-semibold text-slate-900 !m-0">
                    Accessibility & Facilities
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {tour.accessibility.map((acc, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-100/90 text-[11px] font-family-semibold text-slate-700 border border-slate-200/70"
                    >
                      {acc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 10. SECTION: CANCELLATION ACCORDION */}
            {showCancel && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/70 shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setCancelOpen(!cancelOpen)}
                  className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-slate-50/60 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-[#004a70] flex items-center justify-center shrink-0">
                      <FiFileText size={14} />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-family-semibold text-slate-900 block">
                        Cancellation Policy
                      </span>
                      <span className="text-[10.5px] text-slate-400 font-family-medium">
                        Review terms before booking
                      </span>
                    </div>
                  </div>
                  <div className="text-slate-400 p-1 rounded-md bg-slate-100/70">
                    {cancelOpen ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                  </div>
                </button>
                {cancelOpen && (
                  <div
                    className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs text-slate-600 font-family-regular leading-relaxed prose max-w-none bg-white/40"
                    dangerouslySetInnerHTML={{ __html: tour.cancellationPolicy }}
                  />
                )}
              </div>
            )}

            {/* 11. SECTION: REVIEWS */}
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
                    <h3 className="text-sm sm:text-base font-family-semibold text-slate-900 !m-0">
                      Guest Reviews
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-600 text-[11px] font-family-semibold">
                    {tour.avgRating?.toFixed(1) || "5.0"} ★ ({reviews.length})
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
                          <div className="w-6 h-6 rounded-full bg-[#004a70] text-white text-[10px] font-family-semibold flex items-center justify-center">
                            {(rev.name || rev.user?.name || "G").charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-family-semibold text-slate-900 leading-tight">
                            {rev.name || rev.user?.name || "Guest"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 text-[11px] font-family-semibold">
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
                <span className="text-[10px] font-family-semibold uppercase tracking-wider text-[#004a70] block leading-none">
                  {tour.category?.name || "Official Excursion"}
                </span>
                <h2 className="text-sm sm:text-base font-family-semibold text-slate-900 leading-snug !m-0">
                  {tour.title}
                </h2>
              </div>

              {/* Booking Details for Group Tour OR Guest Steppers for Individual Tour */}
              {isGroup ? (
                <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-family-semibold text-slate-800">Booking Type</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#004a70]/10 text-[#004a70] text-[10.5px] font-family-semibold">
                      Group Tour
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-family-medium !m-0">
                    Flat group rate covers your entire party up to {maxPeople} guests.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-family-semibold text-slate-900 !m-0">Select Guests</h4>
                    <span className="text-[10px] text-slate-400 font-family-medium">
                      {totalGuests} total
                    </span>
                  </div>

                  {/* Adults */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/70">
                    <div>
                      <span className="text-xs font-family-semibold text-slate-800 block leading-tight">
                        Adults (16+)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11.5px] text-[#004a70] font-family-semibold">
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
                      <span className="text-xs font-family-semibold text-slate-900 w-4 text-center">
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

                  {/* Children */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/70">
                    <div>
                      <span className="text-xs font-family-semibold text-slate-800 block leading-tight">
                        Children (1–15)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11.5px] text-[#004a70] font-family-semibold">
                          ${kidUnitDiscountedUSD.toFixed(2)} USD
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ${kidUnitOriginalUSD.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={kids <= 0}
                        onClick={() => setKids(Math.max(0, kids - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-[#004a70] flex items-center justify-center disabled:opacity-30 cursor-pointer shadow-xs active:scale-95 transition-all"
                        aria-label="Decrease children"
                      >
                        <FaMinus size={8} />
                      </button>
                      <span className="text-xs font-family-semibold text-slate-900 w-4 text-center">
                        {kids}
                      </span>
                      <button
                        type="button"
                        onClick={() => setKids(kids + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-[#004a70] flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition-all"
                        aria-label="Increase children"
                      >
                        <FaPlus size={8} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Calculation Box (Parity with Mobile App) */}
              <div className="p-3 bg-sky-500/[0.08] rounded-xl border border-sky-400/25 space-y-1.5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-family-semibold uppercase tracking-wider block">
                    Total
                  </span>
                  <span className="text-[9.5px] text-sky-700 bg-sky-100/80 px-1.5 py-0.2 rounded-md font-family-semibold">
                    1 USD = 2.70 XCD
                  </span>
                </div>

                {hasDiscount && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-xs text-slate-400 line-through font-family-medium">
                      was ${originalPriceUSD.toFixed(2)} USD
                    </span>
                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-100/80 text-emerald-800 text-[10px] font-family-semibold">
                      {itemDiscountPct}% OFF
                    </span>
                  </div>
                )}

                <div className="flex items-baseline justify-between pt-0.5">
                  <div>
                    <span className="text-xl sm:text-2xl font-family-semibold text-[#004a70] tracking-tight">
                      ${finalPriceUSD.toFixed(2)}
                    </span>
                    <span className="text-xs font-family-semibold text-[#004a70] ml-1">USD</span>
                    <span className="text-[11px] text-slate-500 font-family-medium ml-1.5">
                      {isGroup
                        ? "per group"
                        : `${totalGuests} guest${totalGuests === 1 ? "" : "s"}`}
                    </span>
                  </div>
                  <span className="text-xs font-family-semibold text-slate-500">
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
                className="w-full py-3 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white text-xs sm:text-sm font-family-semibold transition-all shadow-md shadow-[#004a70]/20 flex items-center justify-center gap-2 cursor-pointer border-none select-none active:scale-[0.98]"
              >
                <span>Book This Tour</span>
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
                    Best Price Guaranteed · Verified Guides
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      {lightboxOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Global style to ensure Tidio chat widget is completely hidden when lightbox is open */}
            <style jsx global>{`
              #tidio-chat,
              #tidio-chat-iframe,
              iframe[id*="tidio"],
              div[id*="tidio"],
              div[class*="tidio"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                z-index: -9999 !important;
                pointer-events: none !important;
              }
            `}</style>

            <div className="!fixed !inset-0 !z-[9999999] !flex !items-center !justify-center !bg-black/95 !backdrop-blur-md !animate-fade-in !p-4">
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
                  onClick={() => {
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
                  onClick={() => {
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
              <div className="!max-w-5xl !max-h-[85vh] !w-full !flex !flex-col !items-center !justify-center !relative !animate-scale-in">
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
                  <span className="!bg-white/20 !px-3 !py-1 !rounded-full !text-[11px] !font-family-semibold !shrink-0">
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
