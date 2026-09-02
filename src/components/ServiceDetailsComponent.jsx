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
} from "react-icons/fa6";
import {
  FiArrowLeft,
  FiShare2,
  FiMaximize2,
} from "react-icons/fi";
import {
  HiOutlineSparkles,
  HiOutlineCalendarDays,
  HiOutlineMapPin,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { MdOutlineRoomService, MdOutlineLocationOn } from "react-icons/md";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";

import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { message } from "antd";
import moment from "moment";

// =========================================================================
// CURRENCY & PRICING UTILITIES (Exact Parity with mobile-app-code/src/utils)
// The database stores all prices in XCD (Eastern Caribbean Dollars).
// 1 USD = 2.70 XCD (fixed peg).
// =========================================================================
const XCD_PER_USD = 2.7;

const round2 = (val) => Number((Number(val) || 0).toFixed(2));
const toUsd = (xcd) => round2((Number(xcd) || 0) / XCD_PER_USD);

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
      ? userOrPercent.specialDiscount ?? userOrPercent.user?.specialDiscount
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

const isGroupService = (service) => {
  const type = String(service?.bookingType || "").toLowerCase();
  return type === "group";
};

const isAtYourLocationService = (service) =>
  service?.locationType !== "meeting_point";

const calcServiceSubtotal = (service, guests = {}) => {
  if (isGroupService(service)) {
    return Number(service?.price || 0);
  }
  const ages = getServiceAgePrices(service);
  const infants = Number(guests?.infants || 0);
  const kids = Number(guests?.kids || 0);
  const adults = Number(guests?.adults || 0);
  return infants * ages.infant + kids * ages.kid + adults * ages.adult;
};

const calcServiceTotal = (service, guests = {}) =>
  applyItemDiscount(calcServiceSubtotal(service, guests), service);

const formatSlot = (slot) => {
  if (!slot) return "";
  const m = moment(slot, ["HH:mm", "H:mm", "hh:mm A", "h:mm A"]);
  return m.isValid() ? m.format("h:mm A") : slot;
};

const formatServiceDuration = (service) => {
  const min = Number(service?.durationHours || 0);
  const max = Number(service?.durationHoursMax || 0);
  if (max > min) return `${min}–${max} hours`;
  return `${min || 1} hour${min > 1 ? "s" : ""}`;
};

export default function ServiceDetailsComponent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id || searchParams?.get("id");
  const { getData, header1, userData } = ApiFunction();

  const [service, setService] = useState(null);
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
  const cancellationRef = useRef(null);

  // Initial load: check sessionStorage for instant preview
  useEffect(() => {
    if (!id) return;
    if (typeof window !== "undefined") {
      try {
        const stored =
          sessionStorage.getItem(`service_${id}`) ||
          sessionStorage.getItem("selected_service");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?._id === id) {
            setService(parsed);
            setLoading(false);
          }
        }
      } catch (e) {}
    }

    // Load full service details from `top-services/details/${id}`
    getData(`top-services/details/${id}`, header1)
      .then((res) => {
        const nextService = res?.data?.service || res?.service || null;
        if (nextService) {
          setService(nextService);
          try {
            sessionStorage.setItem(`service_${id}`, JSON.stringify(nextService));
          } catch (_) {}
        }
      })
      .catch((err) => {
        console.error("Service detail fetch error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const displayImages = service?.images?.length
    ? service.images
    : typeof service?.images === "string" && service.images
    ? [service.images]
    : ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200"];

  const cleanTitle = service?.title || "On-Location Service";

  // Lightbox keyboard navigation, body overflow lock & hide Tidio chat widget
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

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") {
        setLightboxIdx((prev) => (prev + 1) % (displayImages?.length || 1));
      }
      if (e.key === "ArrowLeft") {
        setLightboxIdx(
          (prev) => (prev - 1 + (displayImages?.length || 1)) % (displayImages?.length || 1)
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      try {
        if (window.tidioChatApi && typeof window.tidioChatApi.show === "function") {
          window.tidioChatApi.show();
        }
      } catch (_) {}
    };
  }, [lightboxOpen, displayImages?.length]);

  // Calculations
  const isGroup = isGroupService(service);
  const atLocation = isAtYourLocationService(service);
  const minPeople = Math.max(1, Number(service?.minPersons) || 1);
  const maxPeople = Math.max(minPeople, Number(service?.maxPersons) || minPeople);

  const agePrices = useMemo(() => getServiceAgePrices(service), [service]);
  const guests = useMemo(() => ({ infants, kids, adults }), [infants, kids, adults]);
  const totalGuests = isGroup ? 1 : adults + kids + infants;

  const rawSubtotalXcd = useMemo(() => calcServiceSubtotal(service, guests), [service, guests]);
  const catalogTotalXcd = useMemo(() => calcServiceTotal(service, guests), [service, guests]);
  const specialDiscount = useMemo(
    () => applySpecialDiscount(catalogTotalXcd, userData?.user || userData),
    [catalogTotalXcd, userData]
  );

  const finalPriceXcd = specialDiscount.discounted;
  const finalPriceUsd = toUsd(finalPriceXcd);
  const rawPriceUsd = toUsd(rawSubtotalXcd);
  const hasDiscount = rawSubtotalXcd > finalPriceXcd;
  const discountPct = getItemDiscountPercent(service);

  // Unit prices in USD
  const adultUnitOriginalUsd = toUsd(agePrices.adult);
  const adultUnitDiscountedUsd = toUsd(applyItemDiscount(agePrices.adult, service));
  const kidUnitDiscountedUsd = toUsd(applyItemDiscount(agePrices.kid, service));
  const infantUnitDiscountedUsd = toUsd(applyItemDiscount(agePrices.infant, service));

  const meetingAddress = String(service?.meetingPoint?.address || service?.address || "").trim();

  const scheduleDays = useMemo(
    () => (service?.schedule || []).filter((row) => row?.day && row?.slots?.length),
    [service]
  );

  const showAbout = Boolean(service?.about);
  const showIncludes = Boolean(service?.includes?.length > 0 || service?.excludes?.length > 0);
  const showSchedule = Boolean(scheduleDays.length > 0);
  const showCancel = Boolean(service?.cancellationPolicy);

  // Tabs
  const tabs = [];
  if (showAbout) tabs.push({ key: "overview", label: "Overview", icon: <HiOutlineSparkles size={13} />, ref: overviewRef });
  if (showIncludes) tabs.push({ key: "included", label: "What's Included", icon: <HiOutlineCheckCircle size={13} />, ref: includedRef });
  if (showSchedule) tabs.push({ key: "schedule", label: "Available Days", icon: <HiOutlineCalendarDays size={13} />, ref: scheduleRef });
  if (showCancel) tabs.push({ key: "cancellation", label: "Cancellation Policy", icon: <FaShieldHalved size={12} />, ref: cancellationRef });

  const handleTabClick = (tabKey, ref) => {
    setActiveTab(tabKey);
    const element = ref?.current || document.getElementById(`section-${tabKey}`);
    if (element) {
      const headerOffset = 140;
      const elementPosition = element.getBoundingClientRect().top;
      const currentScroll = window.scrollY || window.pageYOffset || 0;
      const offsetPosition = elementPosition + currentScroll - headerOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    }
  };

  const handleBookNow = () => {
    if (!isGroup && totalGuests < 1) {
      message.error("Please add at least 1 guest");
      return;
    }
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(`service_${service._id}`, JSON.stringify(service));
        sessionStorage.setItem("selected_service", JSON.stringify(service));
      } catch (e) {
        console.warn("sessionStorage save error:", e);
      }
    }
    router.push(`/bookService?id=${service._id}`);
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      message.success("Service link copied to clipboard!");
    } else {
      message.info("Service link ready to share");
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] relative overflow-hidden">
        <div className="absolute w-72 h-72 bg-sky-400/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/70 border border-white/60 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-100 border-t-[#004a70]" />
          </div>
          <p className="text-[11px] font-family-semibold text-slate-500 tracking-wider uppercase animate-pulse">
            Loading service experience...
          </p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4 text-center relative">
        <div className="w-full max-w-sm p-6 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/70 shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#004a70] mx-auto flex items-center justify-center">
            <MdOutlineRoomService size={24} />
          </div>
          <h2 className="text-base font-family-bold text-slate-900 !m-0">Service Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The service experience you are looking for is currently unavailable.
          </p>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white text-xs font-family-bold shadow-md no-underline transition-all"
          >
            <FiArrowLeft size={13} />
            <span>Explore All Services</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-poppins text-slate-800 relative">
      {/* Background Ambient Glow Lights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[15%] -left-28 w-[400px] h-[400px] bg-sky-400/[0.08] rounded-full blur-[110px]" />
        <div className="absolute top-[40%] -right-32 w-[450px] h-[450px] bg-teal-500/[0.06] rounded-full blur-[120px]" />
      </div>

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
        <div className="!absolute !bottom-1/4 !-right-20 !w-96 !h-96 !bg-teal-500/15 !rounded-full !blur-[120px] !pointer-events-none" />

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
            onSwiper={(sw) => {
              mainSwiperRef.current = sw;
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
                <span className="!px-2.5 !py-1 !rounded-md !text-[11px] !font-family-bold !font-bold !uppercase !tracking-wider !bg-[#004a70] !text-white !shadow-sm">
                  {service?.category?.name || "Service"}
                </span>
                <span className="!text-white/70 !text-xs !font-family-medium">
                  {atLocation ? "On-Location Care" : "Meeting Point"}
                </span>
                {service?.avgRating > 0 && (
                  <>
                    <span className="!text-white/50 !text-xs">•</span>
                    <span className="!text-white/70 !text-xs !font-family-medium">
                      ★ {service.avgRating.toFixed(1)} Rating
                    </span>
                  </>
                )}
                <span className="!text-white/50 !text-xs">•</span>
                <span className="!text-white/70 !text-xs !font-family-medium">St. Kitts & Nevis</span>
              </div>

              {/* Title */}
              <h1 className="!text-white !text-3xl sm:!text-4xl md:!text-5xl !font-family-bold !font-bold !tracking-tight !m-0 !mb-3 !leading-[1.1]">
                {cleanTitle}
              </h1>

              {/* Badges */}
              <div className="!flex !items-center !gap-2 !mb-3 !flex-wrap">
                {service?.avgRating > 0 && (
                  <div className="!flex !items-center !gap-1 !bg-amber-500/20 !border !border-amber-400/40 !px-2.5 !py-1 !rounded-md">
                    <FaStar size={11} className="!text-amber-400" />
                    <span className="!text-amber-400 !text-xs !font-family-bold !font-bold">
                      {service.avgRating.toFixed(1)}
                    </span>
                    <span className="!text-white/60 !text-[11px] !font-family-medium">
                      ({service.totalReviews || 0} reviews)
                    </span>
                  </div>
                )}
                <span className="!px-2.5 !py-1 !rounded-md !text-[11px] !font-family-semibold !text-white/85 !bg-white/10 !border !border-white/15">
                  {isGroup ? "GROUP RATE" : "INDIVIDUAL"}
                </span>
                <span className="!px-2.5 !py-1 !rounded-md !text-[11px] !font-family-semibold !text-white/85 !bg-white/10 !border !border-white/15">
                  {atLocation ? "We Come To You" : "Direct Provider"}
                </span>
                {finalPriceUsd > 0 && (
                  <span className="!px-2.5 !py-1 !rounded-md !text-[11px] !font-family-semibold !text-white/95 !bg-emerald-500/20 !border !border-emerald-400/30">
                    ${finalPriceUsd.toFixed(2)} USD {isGroup ? "(group)" : "(from)"}
                  </span>
                )}
              </div>

              {/* Photos Progress Bar */}
              <div className="!mb-4">
                <div className="!flex !items-center !justify-between !mb-1.5">
                  <span className="!text-white/60 !text-xs !font-family-medium !truncate !max-w-[240px]">
                    {atLocation ? "At Your Chosen Location" : meetingAddress || "St. Kitts & Nevis"}
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

          {/* Slide counter pill */}
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
          <div className="lg:col-span-8 space-y-4">
            {/* 1. QUICK FACTS BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="bg-white/80 backdrop-blur-xl p-3 rounded-xl border border-white/70 shadow-xs flex items-center gap-2.5">
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

              <div className="bg-white/80 backdrop-blur-xl p-3 rounded-xl border border-white/70 shadow-xs flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                  <FaUsers size={13} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-family-semibold uppercase tracking-wider block leading-none">
                    {isGroup ? "Group Size" : "Booking Type"}
                  </span>
                  <span className="text-xs font-family-bold text-slate-900 block mt-0.5 truncate">
                    {isGroup ? `${minPeople}–${maxPeople} Guests` : "Individual"}
                  </span>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white/80 backdrop-blur-xl p-3 rounded-xl border border-white/70 shadow-xs flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-700 flex items-center justify-center shrink-0">
                  <MdOutlineLocationOn size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-family-semibold uppercase tracking-wider block leading-none">
                    Location
                  </span>
                  <span className="text-xs font-family-bold text-slate-900 block mt-0.5 truncate">
                    {atLocation ? "On-Location" : "Meeting Point"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. MEETING / LOCATION BANNER (Exact mobile parity) */}
            <div className="bg-gradient-to-r from-sky-50 to-indigo-50/50 rounded-2xl p-4 border border-sky-100 flex items-start gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#004a70] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <MdOutlineLocationOn size={18} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-family-bold uppercase tracking-wider text-[#004a70] !m-0">
                  {atLocation ? "We Come To You" : "Designated Meeting Point"}
                </h4>
                <p className="text-xs text-slate-600 font-family-medium !m-0 leading-relaxed">
                  {atLocation
                    ? "Our specialist comes directly to your hotel, villa, or residence. You will confirm your exact address on the next booking screen."
                    : meetingAddress || "Meeting point details will be confirmed upon booking."}
                </p>
              </div>
            </div>

            {/* 3. SECTION NAVIGATION TABS */}
            <div className="sticky top-20 z-20 bg-white/90 backdrop-blur-xl p-1 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabClick(tab.key, tab.ref)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-family-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer !border-none ${
                    activeTab === tab.key
                      ? "bg-[#004a70] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* 4. OVERVIEW (ABOUT) SECTION */}
            {showAbout && (
              <div
                ref={overviewRef}
                id="section-overview"
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-[#004a70] flex items-center justify-center shrink-0">
                    <HiOutlineSparkles size={14} />
                  </div>
                  <h3 className="text-base font-family-bold text-slate-900 !m-0">Overview</h3>
                </div>
                <div
                  className="text-xs sm:text-sm text-slate-600 leading-relaxed font-family-regular prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: service.about }}
                />
              </div>
            )}

            {/* 5. WHAT'S INCLUDED / EXCLUDED SECTION (Matching Mobile Chips) */}
            {showIncludes && (
              <div
                ref={includedRef}
                id="section-included"
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <HiOutlineCheckCircle size={15} />
                  </div>
                  <h3 className="text-base font-family-bold text-slate-900 !m-0">What&apos;s Included</h3>
                </div>

                {/* Included Chips */}
                {service?.includes?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {service.includes.map((inc, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100/80 text-xs text-slate-800 font-family-medium"
                      >
                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <FaCheck size={9} />
                        </div>
                        <span className="leading-snug">{inc}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Excluded Chips */}
                {service?.excludes?.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <h4 className="text-xs font-family-bold uppercase tracking-wider text-rose-600 !m-0">
                      Not Included
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {service.excludes.map((exc, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50/70 border border-rose-100/80 text-xs text-slate-800 font-family-medium"
                        >
                          <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                            <FaXmark size={9} />
                          </div>
                          <span className="leading-snug">{exc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. AVAILABLE DAYS & SCHEDULE */}
            {showSchedule && (
              <div
                ref={scheduleRef}
                id="section-schedule"
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3.5"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-[#004a70] flex items-center justify-center shrink-0">
                    <HiOutlineCalendarDays size={15} />
                  </div>
                  <h3 className="text-base font-family-bold text-slate-900 !m-0">Available Schedule</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {scheduleDays.map((row, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-family-bold text-slate-900">{row.day}</span>
                        <span className="text-[10px] font-family-semibold px-2 py-0.5 rounded-full bg-sky-100 text-[#004a70]">
                          {row.slots?.length || 0} Slots
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(row.slots || []).map((slot, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-family-semibold bg-white border border-slate-200 text-slate-700 shadow-xs"
                          >
                            {formatSlot(slot)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. CANCELLATION POLICY */}
            {showCancel && (
              <div
                ref={cancellationRef}
                id="section-cancellation"
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3"
              >
                <button
                  type="button"
                  onClick={() => setCancelOpen(!cancelOpen)}
                  className="w-full flex items-center justify-between pb-2 border-b border-slate-100 text-left bg-transparent border-none cursor-pointer p-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <FaShieldHalved size={13} />
                    </div>
                    <h3 className="text-base font-family-bold text-slate-900 !m-0">
                      Cancellation Policy
                    </h3>
                  </div>
                  {cancelOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </button>
                {cancelOpen && (
                  <div
                    className="text-xs text-slate-600 leading-relaxed font-family-regular prose prose-sm max-w-none pt-1"
                    dangerouslySetInnerHTML={{ __html: service.cancellationPolicy }}
                  />
                )}
              </div>
            )}
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* RIGHT SIDE STICKY BOOKING COCKPIT (4 COLS)                    */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-4">
                {/* Price Display */}
                <div className="space-y-1 pb-3 border-b border-slate-100">
                  <span className="text-[11px] font-family-semibold text-slate-400 uppercase tracking-wider block leading-none">
                    {isGroup ? "Group Rate" : "From"}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-family-bold text-[#004a70]">
                      ${finalPriceUsd.toFixed(2)}
                    </span>
                    <span className="text-xs font-family-semibold text-slate-400">USD</span>
                    {hasDiscount && (
                      <span className="text-xs font-family-medium text-slate-400 line-through">
                        ${rawPriceUsd.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-family-medium block">
                    {isGroup
                      ? `Covers complete group (${minPeople}–${maxPeople} guests)`
                      : "per adult traveler"}
                  </span>
                </div>

                {/* Travelers selector if individual */}
                {!isGroup && (
                  <div className="space-y-3 pb-3 border-b border-slate-100">
                    <label className="text-xs font-family-bold text-slate-900 block">Travelers</label>

                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-family-semibold text-slate-800 block">Adults</span>
                        <span className="text-[10px] text-slate-400 block font-family-medium">
                          Age 16+ (${adultUnitDiscountedUsd.toFixed(2)})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={adults <= 1}
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center cursor-pointer border-none"
                        >
                          <FaMinus size={10} />
                        </button>
                        <span className="text-xs font-family-bold w-5 text-center">{adults}</span>
                        <button
                          type="button"
                          disabled={adults >= 20}
                          onClick={() => setAdults(adults + 1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center cursor-pointer border-none"
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-family-semibold text-slate-800 block">Children</span>
                        <span className="text-[10px] text-slate-400 block font-family-medium">
                          Age 1–15 (${kidUnitDiscountedUsd.toFixed(2)})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={kids <= 0}
                          onClick={() => setKids(Math.max(0, kids - 1))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center cursor-pointer border-none"
                        >
                          <FaMinus size={10} />
                        </button>
                        <span className="text-xs font-family-bold w-5 text-center">{kids}</span>
                        <button
                          type="button"
                          disabled={kids >= 20}
                          onClick={() => setKids(kids + 1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center cursor-pointer border-none"
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>
                    </div>

                    {/* Infants */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-family-semibold text-slate-800 block">Infants</span>
                        <span className="text-[10px] text-slate-400 block font-family-medium">
                          Under 2 (${infantUnitDiscountedUsd.toFixed(2)})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={infants <= 0}
                          onClick={() => setInfants(Math.max(0, infants - 1))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center cursor-pointer border-none"
                        >
                          <FaMinus size={10} />
                        </button>
                        <span className="text-xs font-family-bold w-5 text-center">{infants}</span>
                        <button
                          type="button"
                          disabled={infants >= 10}
                          onClick={() => setInfants(infants + 1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center cursor-pointer border-none"
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subtotal Preview */}
                <div className="space-y-1.5 text-xs font-family-medium text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Base Subtotal</span>
                    <span className="font-family-semibold text-slate-800">
                      ${rawPriceUsd.toFixed(2)} USD
                    </span>
                  </div>

                  {discountPct > 0 && (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Catalog Discount ({discountPct}%)</span>
                      <span>
                        -${toUsd((rawSubtotalXcd * discountPct) / 100).toFixed(2)} USD
                      </span>
                    </div>
                  )}

                  {specialDiscount.percent > 0 && (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Special Discount ({specialDiscount.percent}%)</span>
                      <span>-${toUsd(specialDiscount.amount).toFixed(2)} USD</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-family-bold text-slate-900 text-sm">
                    <span>Estimated Fare</span>
                    <span className="text-[#004a70]">${finalPriceUsd.toFixed(2)} USD</span>
                  </div>
                  <span className="text-[10.5px] text-slate-400 font-family-regular block text-right">
                    Applicable fees calculated on booking
                  </span>
                </div>

                {/* Book Action Button */}
                <button
                  type="button"
                  onClick={handleBookNow}
                  className="w-full py-3.5 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white text-xs font-family-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-none active:scale-[0.98]"
                >
                  <FaTag size={12} />
                  <span>Book This Service</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-family-medium pt-1">
                  <FaShieldHalved size={12} className="text-[#004a70]" />
                  <span>Secure checkout & held until confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
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
                onClick={() =>
                  setLightboxIdx(
                    (prev) => (prev - 1 + displayImages.length) % displayImages.length
                  )
                }
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
                onClick={() =>
                  setLightboxIdx((prev) => (prev + 1) % displayImages.length)
                }
                className="!absolute !right-4 sm:!right-8 !top-1/2 !-translate-y-1/2 !z-30 !w-11 !h-11 !rounded-full !bg-white/15 hover:!bg-white/30 !text-white !flex !items-center !justify-center !border !border-white/20 !cursor-pointer !transition-all hover:!scale-110"
                title="Next Photo"
              >
                <FaChevronRight size={16} />
              </button>
            )}

            {/* Main Lightbox Image View */}
            <div className="!max-w-5xl !max-h-[82vh] !w-full !flex !flex-col !items-center !justify-center !relative !animate-scale-in">
              <img
                src={displayImages[lightboxIdx]}
                alt=""
                className="!max-h-[75vh] !max-w-full !object-contain !rounded-2xl !shadow-2xl !border !border-white/10"
              />
              <div className="!flex !items-center !justify-between !w-full !max-w-xl !mt-4 !text-white/80 !text-xs !font-family-medium !px-2 !gap-3">
                <span className="!font-family-medium !truncate">{cleanTitle}</span>
                {displayImages.length > 1 && (
                  <div className="!flex !items-center !gap-1.5 !bg-white/10 !backdrop-blur-md !px-3 !py-1.5 !rounded-full !border !border-white/15">
                    {displayImages.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightboxIdx(i)}
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
          </div>,
          document.body
        )}
    </div>
  );
}
