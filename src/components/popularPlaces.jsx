/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaLocationDot,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaTag,
  FaCarSide,
  FaRegCalendarCheck,
  FaShieldHalved,
  FaRegImages,
  FaXmark,
} from "react-icons/fa6";
import {
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineCheckCircle,
  HiOutlineChatBubbleLeftRight,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { FiArrowRight, FiCheck, FiShare2, FiMaximize2 } from "react-icons/fi";
import { MdOutlineRateReview, MdOutlineMyLocation } from "react-icons/md";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, Autoplay, FreeMode, Mousewheel, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import "swiper/css/effect-fade";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import moment from "moment";
import { Rate } from "antd";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import ApiFile from "./ApiFunction/ApiFile";
import toast from "react-hot-toast";
import EmptyState from "@/components/EmptyState";

const stripHtml = (html) => {
  if (!html) return "";
  if (typeof html !== "string") return String(html);
  return html
    .replace(/<[^>]*>?/gm, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

const PopularAA = () => {
  const { id } = useParams();
  const mapContainerRef = useRef(null);
  const router = useRouter();
  const mapRef = useRef(null);
  const { giveRating, getRating } = ApiFile;
  const { getData, header3, postData, header1 } = ApiFunction();
  const [TimeSlot, setTimeSlot] = useState("");
  const [SelectedTime, setSelectedTime] = useState("");
  const [SubcatData, setSubcatData] = useState(null);
  const [Schedule, setSchedule] = useState([]);
  
  // Interactive Tab State
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "schedule" | "map" | "reviews"

  // Swiper thumbs instance
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const mainSwiperRef = useRef(null);

  // Fullscreen Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const contentRef = useRef(null);
  const [contentInView, setContentInView] = useState(false);
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setContentInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const urlreview = params.get("review");

  const [ratingLoading, setRatingLoading] = useState(false);

  mapboxgl.accessToken =
    "pk.eyJ1IjoibWFybGVncmFudCIsImEiOiJjbTgwdmV0MjkweXB2MnFzNXBjM2x6NThnIn0.3oz3YGaDHiFDh8W5ALk09w";

  const handleTime = (data) => {
    setSelectedTime(data);
  };

  useEffect(() => {
    // 1. Immediately read from sessionStorage so there is NO blank delay
    if (typeof window !== "undefined") {
      try {
        const stored =
          sessionStorage.getItem(`tour_${id}`) ||
          sessionStorage.getItem("selected_tour") ||
          sessionStorage.getItem("popularItem");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed._id === id || !id)) {
            setSubcatData(parsed);
            if (parsed.schedule) {
              try {
                const s =
                  typeof parsed.schedule === "string"
                    ? JSON.parse(parsed.schedule)
                    : parsed.schedule;
                setSchedule(Array.isArray(s) ? s : []);
              } catch (e) {
                setSchedule([]);
              }
            }
          }
        }
      } catch (e) {
        console.warn("SessionStorage parse error:", e);
      }
    }
    getSubCatData();
  }, [id]);

  const getSubCatData = async () => {
    if (!id) return;
    try {
      let response = await getData(`websubcat/details/${id}`, header3);
      if (!response?.category) {
        response = await getData(`servicesubcat/details/${id}`, header3);
      }
      if (response?.category) {
        const cat = response.category;
        setSubcatData(cat);
        const scheduleData = cat.schedule;
        try {
          const s = scheduleData
            ? typeof scheduleData === "string"
              ? JSON.parse(scheduleData)
              : scheduleData
            : [];
          setSchedule(Array.isArray(s) ? s : []);
        } catch (e) {
          setSchedule([]);
        }
        if (typeof window !== "undefined") {
          sessionStorage.setItem(`tour_${id}`, JSON.stringify(cat));
        }
      }
    } catch (error) {
      console.log("websubcat/details fetch notice:", error?.message || error);
    }
  };

  const convertTo12Hour = (time24) => {
    if (!time24 || typeof time24 !== "string") return "";
    const clean = time24.trim();
    if (!clean.includes(":")) return clean;
    const [hours, minutes] = clean.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return clean;
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatScheduleDay = (item, index) => {
    if (!item) return `Day ${index + 1}`;
    return (
      item?.day ||
      item?.slot_day ||
      item?.days ||
      item?.name ||
      item?.title ||
      `Day ${index + 1}`
    );
  };

  const formatScheduleSlots = (item) => {
    if (!item?.slots || !Array.isArray(item.slots) || item.slots.length === 0) {
      return "08:30 AM – 05:00 PM (Daily)";
    }
    if (
      item.slots.length >= 2 &&
      typeof item.slots[0] === "string" &&
      typeof item.slots[1] === "string"
    ) {
      return `${convertTo12Hour(item.slots[0])} – ${convertTo12Hour(item.slots[1])}`;
    }
    const mapped = item.slots
      .map((s) => {
        if (typeof s === "string") return convertTo12Hour(s);
        if (s?.start_time && s?.end_time)
          return `${convertTo12Hour(s.start_time)} – ${convertTo12Hour(s.end_time)}`;
        if (s?.time) return convertTo12Hour(s.time);
        return "";
      })
      .filter(Boolean);

    return mapped.length > 0 ? mapped.join(" – ") : "Open Hours";
  };

  const getDestinationCoords = (data) => {
    if (
      data?.coordinates &&
      Array.isArray(data.coordinates) &&
      data.coordinates.length === 2
    ) {
      const lng = Number(data.coordinates[0]);
      const lat = Number(data.coordinates[1]);
      if (!isNaN(lng) && !isNaN(lat)) return [lng, lat];
    }
    if (
      data?.location?.coordinates &&
      Array.isArray(data.location.coordinates) &&
      data.location.coordinates.length === 2
    ) {
      const lng = Number(data.location.coordinates[0]);
      const lat = Number(data.location.coordinates[1]);
      if (!isNaN(lng) && !isNaN(lat)) return [lng, lat];
    }
    const lng = Number(data?.lng ?? data?.longitude ?? data?.start_lng);
    const lat = Number(data?.lat ?? data?.latitude ?? data?.start_lat);
    if (!isNaN(lng) && !isNaN(lat) && (lng !== 0 || lat !== 0)) {
      return [lng, lat];
    }
    return [-62.717692, 17.302605]; // St. Kitts coordinates
  };

  const initMap = (data) => {
    if (!mapContainerRef.current) return;

    const coords = getDestinationCoords(data);

    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (e) {
        // ignore
      }
      mapRef.current = null;
    }

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: coords,
        zoom: 13.5,
        pitch: 25,
        attributionControl: false,
      });

      map.addControl(
        new mapboxgl.NavigationControl({ showCompass: true }),
        "top-right"
      );
      mapRef.current = map;

      // Custom animated pulse marker
      const el = document.createElement("div");
      el.className =
        "!flex !items-center !justify-center !w-9 !h-9 !rounded-full !bg-[#004a70] !text-white !shadow-xl !border-2 !border-white !ring-4 !ring-sky-400/50 !cursor-pointer !animate-pulse";
      el.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 384 512" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"></path></svg>`;

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
      }).setHTML(`
        <div style="min-width: 160px; padding: 4px 6px;">
          <p style="font-size: 12px; font-weight: 700; color: #004a70; margin: 0 0 2px;">${
            stripHtml(data?.title) || "Tour Destination"
          }</p>
          <p style="font-size: 11px; color: #475569; margin: 0; line-height: 1.35;">${
            stripHtml(data?.address) || "St. Kitts & Nevis"
          }</p>
        </div>
      `);

      new mapboxgl.Marker({ element: el })
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map);

      map.on("load", () => {
        map.resize();
        popup.addTo(map);
      });

      // Multiple fallback resizes
      setTimeout(() => map?.resize(), 150);
      setTimeout(() => map?.resize(), 400);
      setTimeout(() => map?.resize(), 800);
      setTimeout(() => map?.resize(), 1500);
    } catch (err) {
      console.error("Mapbox init error:", err);
    }
  };

  useEffect(() => {
    if (SubcatData && activeTab === "map") {
      setTimeout(() => {
        initMap(SubcatData);
      }, 50);
    }
  }, [SubcatData, activeTab]);

  useEffect(() => {
    const handleResize = () => {
      mapRef.current?.resize();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const recenterMap = () => {
    if (!mapRef.current || !SubcatData) return;
    const coords = getDestinationCoords(SubcatData);
    mapRef.current.flyTo({
      center: coords,
      zoom: 14,
      pitch: 25,
      essential: true,
      duration: 1200,
    });
  };

  const HandleClick = () => {
    if (SubcatData?.category?.name === "Excursion") {
      if (SelectedTime) {
        const data = {
          data: JSON.stringify(SubcatData),
          time: JSON.stringify(SelectedTime),
          isTour: true,
          tourPrice: SubcatData?.location_price || 0,
        };
        const encodedData = encodeURIComponent(JSON.stringify(data));
        router.push(`/ride?data=${encodedData}`);
      } else {
        toast.error("Please Select Date and Time");
      }
    } else {
      let data = {
        address: SubcatData?.address,
        lat: SubcatData?.lat,
        lng: SubcatData?.lng,
        _id: SubcatData?._id,
        schedule: SubcatData?.schedule,
        title: SubcatData?.title,
        user: SubcatData?.user,
        location_price: SubcatData?.location_price || 0,
        tourPrice: SubcatData?.location_price || 0,
        isTour: true,
        images: SubcatData?.images,
        category: SubcatData?.category,
      };
      const encodedData = encodeURIComponent(JSON.stringify(data));
      router.push(`/ride?data=${encodedData}`);
    }
  };

  const validationSchema = Yup.object().shape({
    comment: Yup.string()
      .test(
        "start-trim",
        "Comment must not start with spaces",
        (value) => value?.[0] !== " "
      )
      .required("Comment is required"),
    rating: Yup.number()
      .required("Rating is required")
      .min(1, "Please provide a rating"),
  });
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
  };
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (urlreview) {
      handleShow();
    }
  }, [urlreview]);

  const handleSubmit = (values, { resetForm }) => {
    setRatingLoading(true);
    const api = giveRating;
    const apiData = {
      webSubCategory: id,
      rating: values?.rating,
      review: values?.comment,
    };
    postData(api, apiData, header1)
      .then((res) => {
        if (res?.success) {
          toast.success(res?.message || "Review submitted successfully!");
          setRatingData([res?.ratings, ...ratingData]);
          handleClose();
          resetForm();
          setValue(0);
          router.replace(`/popular/${id}`);
        }
        setRatingLoading(false);
      })
      .catch(() => {
        setRatingLoading(false);
      });
  };

  const [ratingData, setRatingData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastId, setLastId] = useState("");
  const [pagiLoading, setPagiLoading] = useState(false);
  const [ratingLength, setRatingLength] = useState(0);

  const getRatingData = () => {
    const api = `${getRating}/${id}/${lastId}`;
    if (ratingData?.length === 10) {
      setPagiLoading(true);
    } else {
      setIsLoading(true);
    }
    getData(api, header3)
      .then((res) => {
        if (res?.success && res?.ratings?.length > 0) {
          if (ratingData?.length === 10) {
            setRatingData([...ratingData, ...res?.ratings]);
          } else {
            setRatingData(res?.ratings);
          }
          const lastRatingId = res?.ratings[res?.ratings?.length - 1]?._id;
          if (lastRatingId) {
            setLastId(lastRatingId);
          }
          setRatingLength(res?.totalLength);
        }
        setIsLoading(false);
        setPagiLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        setPagiLoading(false);
      });
  };

  useEffect(() => {
    getRatingData();
  }, []);

  const scrollToReviews = () => {
    setActiveTab("reviews");
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Tour link copied to clipboard!");
    }
  };

  const displayImages =
    Array.isArray(SubcatData?.images) && SubcatData.images.length > 0
      ? SubcatData.images
      : typeof SubcatData?.images === "string" && SubcatData.images
      ? [SubcatData.images]
      : [
          "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80",
        ];

  const priceXcd = Number(
    SubcatData?.location_price ||
      SubcatData?.price ||
      SubcatData?.price_per_adult ||
      0
  );
  const priceUsd = (priceXcd / 2.7).toFixed(2);

  const cleanTitle = stripHtml(SubcatData?.title) || "Tour Destination";
  const cleanAbout =
    stripHtml(SubcatData?.about) ||
    "Explore the pristine natural beauty, tropical waters, and Caribbean culture with CabKn. Book your ride directly with verified local drivers.";
  const cleanAddress = stripHtml(SubcatData?.address) || "St. Kitts & Nevis";

  const openLightbox = (idx) => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
  };

  const tabItems = [
    {
      id: "overview",
      label: "Overview",
      icon: <HiOutlineSparkles size={16} />,
    },
    {
      id: "schedule",
      label: "Schedule & Timing",
      icon: <HiOutlineCalendarDays size={16} />,
      badge: Schedule.length > 0 ? `${Schedule.length} Days` : undefined,
    },
    {
      id: "map",
      label: "Location Map",
      icon: <HiOutlineMapPin size={16} />,
    },
    {
      id: "reviews",
      label: "Reviews",
      icon: <HiOutlineChatBubbleLeftRight size={16} />,
      badge: ratingLength > 0 ? ratingLength : ratingData.length > 0 ? ratingData.length : undefined,
    },
  ];

  return (
    <div
      className={mounted ? "!animate-fade-in" : "!opacity-0"}
      style={{ minHeight: "100vh", background: "#f8fafc" }}
    >
      {/* ========================================================================= */}
      {/* 1. HERO TOP BANNER (Luxury Navy Blue with ambient glow)                    */}
      {/* ========================================================================= */}
      <section
        className={`!relative !overflow-hidden !bg-gradient-to-br !from-[#001726] !via-[#002f4a] !to-[#001f33] !pt-20 sm:!pt-24 !pb-10 sm:!pb-12 !text-white ${
          mounted ? "!animate-fade-in-down" : "!opacity-0"
        }`}
      >
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
          {/* Breadcrumbs */}
          <div className="!flex !items-center !gap-2 !text-slate-400 !text-xs !font-family-medium !mb-3 !flex-wrap">
            <Link
              href="/"
              className="hover:!text-white !transition-colors !no-underline !text-slate-400"
            >
              Home
            </Link>
            <span className="!text-slate-500">/</span>
            <Link
              href="/top-locations"
              className="hover:!text-white !transition-colors !no-underline !text-slate-400"
            >
              Popular Places
            </Link>
            <span className="!text-slate-500">/</span>
            <span className="!text-slate-200 !truncate !max-w-[220px] sm:!max-w-md !font-family-medium">
              {cleanTitle}
            </span>
          </div>

          {/* Title Header */}
          <div className="!flex !flex-wrap !items-center !justify-between !gap-3">
            <div className="!flex !items-center !gap-3 !max-w-3xl">
              <div className="!w-11 !h-11 sm:!w-12 sm:!h-12 !rounded-xl !bg-white/10 !backdrop-blur-md !border !border-white/15 !flex !items-center !justify-center !shrink-0 !shadow-inner">
                <FaLocationDot className="!text-amber-400 !text-xl sm:!text-2xl" />
              </div>
              <div>
                <div className="!flex !items-center !gap-2 !mb-1 !flex-wrap">
                  {SubcatData?.category?.name && (
                    <span className="!px-2.5 !py-0.5 !rounded-full !text-[10.5px] !font-family-bold !bg-white/15 !backdrop-blur-md !border !border-white/20 !text-white !uppercase !tracking-wider">
                      {SubcatData.category.name}
                    </span>
                  )}
                  {SubcatData?.avgRating > 0 && (
                    <div
                      onClick={scrollToReviews}
                      className="!flex !items-center !gap-1 !bg-amber-400/20 !backdrop-blur-md !px-2.5 !py-0.5 !rounded-full !border !border-amber-300/40 !text-amber-300 !text-xs !font-family-bold !cursor-pointer hover:!bg-amber-400/30 !transition-all"
                    >
                      <FaStar className="!text-amber-400 !text-[10px]" />
                      <span>{SubcatData.avgRating.toFixed(1)}</span>
                      <span className="!text-amber-200/80 !text-[10.5px] !font-family-medium">
                        ({SubcatData.totalReviews || ratingLength || 0})
                      </span>
                    </div>
                  )}
                </div>

                <h1 className="!text-white !text-xl sm:!text-2xl md:!text-3xl !font-family-bold !tracking-tight !m-0 !leading-tight">
                  {cleanTitle}
                </h1>
              </div>
            </div>

            {/* Quick Share / Action */}
            <div className="!flex !items-center !gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="!h-9 !px-3.5 !rounded-xl !bg-white/10 hover:!bg-white/20 !border !border-white/15 !text-white !text-xs !font-family-bold !backdrop-blur-md !flex !items-center !justify-center !gap-1.5 !cursor-pointer !transition-all !shadow-sm"
              >
                <FiShare2 size={12} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MAIN COCKPIT SECTION                                                    */}
      {/* ========================================================================= */}
      <div className="!w-full !px-4 sm:!px-6 lg:!px-8 !relative !z-20 !max-w-7xl !mx-auto !-mt-5 !pb-16">
        {/* ========================================================================= */}
        {/* SWIPER JS HIGH-END IMAGE SHOWCASE WITH THUMBNAILS CAROUSEL                */}
        {/* ========================================================================= */}
        <div className="!relative !bg-white !rounded-3xl !p-2.5 sm:!p-3.5 !border !border-slate-200/90 !shadow-lg !overflow-hidden">
          {/* Main Swiper */}
          <div className="!relative !w-full !h-[300px] sm:!h-[400px] md:!h-[480px] !rounded-2xl !overflow-hidden !bg-slate-950">
            <Swiper
              key={`main-slider-${displayImages.length}-${SubcatData?._id || "ready"}`}
              modules={[Navigation, Autoplay]}
              loop={displayImages.length > 1}
              speed={600}
              grabCursor={true}
              navigation={{
                prevEl: ".swiper-custom-prev",
                nextEl: ".swiper-custom-next",
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              onSwiper={(swiper) => {
                mainSwiperRef.current = swiper;
                try {
                  swiper.autoplay?.start();
                } catch (e) {}
              }}
              onSlideChange={(swiper) => {
                const realIdx = swiper.realIndex ?? swiper.activeIndex;
                setActiveSlideIdx(realIdx);
                if (thumbsSwiper && !thumbsSwiper.destroyed) {
                  thumbsSwiper.slideTo(realIdx);
                }
              }}
              className="!w-full !h-full !rounded-2xl"
            >
              {displayImages.map((item, index) => (
                <SwiperSlide key={index} className="!w-full !h-full !relative">
                  <div
                    onClick={() => openLightbox(index)}
                    className="!w-full !h-full !relative !cursor-pointer !group"
                  >
                    <img
                      src={item}
                      alt={`${cleanTitle}-${index}`}
                      className="!w-full !h-full !object-cover group-hover:!scale-105 !transition-transform !duration-700"
                    />
                    <div className="!absolute !inset-0 !bg-gradient-to-t !from-black/60 !via-transparent !to-transparent !pointer-events-none" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Arrows */}
            {displayImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="swiper-custom-prev !absolute !left-3 sm:!left-4 !top-1/2 !-translate-y-1/2 !z-20 !w-10 !h-10 !rounded-full !bg-black/45 hover:!bg-black/75 !text-white !backdrop-blur-md !border !border-white/25 !flex !items-center !justify-center !cursor-pointer !transition-all hover:!scale-110 !shadow-lg"
                  title="Previous Image"
                >
                  <FaChevronLeft size={13} />
                </button>
                <button
                  type="button"
                  className="swiper-custom-next !absolute !right-3 sm:!right-4 !top-1/2 !-translate-y-1/2 !z-20 !w-10 !h-10 !rounded-full !bg-black/45 hover:!bg-black/75 !text-white !backdrop-blur-md !border !border-white/25 !flex !items-center !justify-center !cursor-pointer !transition-all hover:!scale-110 !shadow-lg"
                  title="Next Image"
                >
                  <FaChevronRight size={13} />
                </button>
              </>
            )}

            {/* Floating Location Pill, Auth-Onboarding Style Pagination, and Photo Index Pill */}
            <div className="!absolute !bottom-3.5 !left-3.5 !right-3.5 !z-20 !flex !items-center !justify-between !gap-2 !pointer-events-none">
              {/* Location Pill */}
              <div className="!flex !items-center !gap-2 !text-white !text-xs !font-family-medium !bg-black/50 !backdrop-blur-md !px-3 !py-1.5 !rounded-xl !border !border-white/15 !shadow-md !max-w-[32%] sm:!max-w-xs">
                <FaLocationDot className="!text-amber-400 !shrink-0" />
                <span className="!truncate !font-family-medium">{cleanAddress}</span>
              </div>

              {/* Center: Auth Onboarding-style Pagination (Exact match to AuthOnboardingSwiper) */}
              {displayImages.length > 1 && (
                <div
                  className="!flex !items-center !gap-1.5 !bg-black/50 !backdrop-blur-md !px-3 !py-2 !rounded-full !border !border-white/15 !shadow-md !pointer-events-auto !overflow-x-auto !max-w-[150px] sm:!max-w-[280px] md:!max-w-none no-scrollbar"
                  role="tablist"
                  aria-label="Photo gallery slides"
                >
                  {displayImages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={i === activeSlideIdx}
                      aria-label={`Go to slide ${i + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (mainSwiperRef.current) {
                          if (typeof mainSwiperRef.current.slideToLoop === "function") {
                            mainSwiperRef.current.slideToLoop(i);
                          } else {
                            mainSwiperRef.current.slideTo(i);
                          }
                        }
                      }}
                      className={`!h-[6px] !rounded-full !transition-all !duration-300 !outline-none focus-visible:!ring-2 focus-visible:!ring-white !cursor-pointer !border-0 !p-0 ${
                        i === activeSlideIdx
                          ? "!w-[22px] !bg-white !shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                          : "!w-[6px] !bg-white/35 hover:!bg-white/60 hover:!w-[10px]"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Photo Index / Lightbox Pill */}
              <div className="!flex !items-center !gap-2 !pointer-events-auto !shrink-0">
                <button
                  type="button"
                  onClick={() => openLightbox(activeSlideIdx)}
                  className="!flex !items-center !gap-1.5 !text-white !text-xs !font-family-bold !bg-black/55 hover:!bg-black/80 !backdrop-blur-md !px-3 !py-1.5 !rounded-xl !border !border-white/20 !cursor-pointer !transition-all hover:!scale-105 !shadow-md"
                >
                  <FiMaximize2 size={12} />
                  <span className="!whitespace-nowrap">
                    {activeSlideIdx + 1} / {displayImages.length}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Thumbs Swiper Bar */}
          {displayImages.length > 1 && (
            <div className="!mt-2.5 !px-0.5">
              <Swiper
                onSwiper={setThumbsSwiper}
                modules={[FreeMode, Navigation, Thumbs]}
                watchSlidesProgress
                freeMode
                spaceBetween={8}
                slidesPerView="auto"
                className="!w-full !py-1"
              >
                {displayImages.map((item, index) => (
                  <SwiperSlide
                    key={index}
                    style={{ width: "auto" }}
                    className="!w-auto !cursor-pointer"
                    onClick={() => {
                      if (mainSwiperRef.current) {
                        if (typeof mainSwiperRef.current.slideToLoop === "function") {
                          mainSwiperRef.current.slideToLoop(index);
                        } else {
                          mainSwiperRef.current.slideTo(index);
                        }
                      }
                    }}
                  >
                    <div
                      className={`!w-20 sm:!w-24 !h-14 sm:!h-16 !rounded-xl !overflow-hidden !border-2 !transition-all ${
                        index === activeSlideIdx
                          ? "!border-[#004a70] !ring-2 !ring-sky-300/80 !scale-[1.03]"
                          : "!border-transparent !opacity-60 hover:!opacity-100"
                      }`}
                    >
                      <img
                        src={item}
                        alt=""
                        className="!w-full !h-full !object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>

        {/* Quick Facts Strip (with generous bottom spacing) */}
        <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-3.5 !mt-5 !mb-6">
          <div className="!bg-white !rounded-2xl !p-4 !border !border-slate-200/90 !shadow-sm !flex !items-center !gap-3">
            <div className="!w-10 !h-10 !rounded-xl !bg-emerald-50 !text-emerald-600 !flex !items-center !justify-center !shrink-0 !border !border-emerald-100">
              <FaTag size={16} />
            </div>
            <div className="!min-w-0">
              <span className="!text-[11px] !text-slate-400 !font-family-semibold !uppercase !tracking-wider !block">
                Tour Fare
              </span>
              <span className="!text-xs sm:!text-sm !font-family-bold !text-slate-900 !truncate !block">
                {priceXcd > 0 ? `$${priceXcd.toFixed(2)} XCD` : "Standard Rate"}
              </span>
            </div>
          </div>

          <div className="!bg-white !rounded-2xl !p-4 !border !border-slate-200/90 !shadow-sm !flex !items-center !gap-3">
            <div className="!w-10 !h-10 !rounded-xl !bg-sky-50 !text-[#004a70] !flex !items-center !justify-center !shrink-0 !border !border-sky-100">
              <FaCarSide size={16} />
            </div>
            <div className="!min-w-0">
              <span className="!text-[11px] !text-slate-400 !font-family-semibold !uppercase !tracking-wider !block">
                Ride Type
              </span>
              <span className="!text-xs sm:!text-sm !font-family-bold !text-slate-900 !truncate !block">
                {SubcatData?.category?.name || "Direct Cab / Tour"}
              </span>
            </div>
          </div>

          <div className="!bg-white !rounded-2xl !p-4 !border !border-slate-200/90 !shadow-sm !flex !items-center !gap-3">
            <div className="!w-10 !h-10 !rounded-xl !bg-amber-50 !text-amber-600 !flex !items-center !justify-center !shrink-0 !border !border-amber-100">
              <FaRegCalendarCheck size={16} />
            </div>
            <div className="!min-w-0">
              <span className="!text-[11px] !text-slate-400 !font-family-semibold !uppercase !tracking-wider !block">
                Availability
              </span>
              <span className="!text-xs sm:!text-sm !font-family-bold !text-slate-900 !truncate !block">
                {Schedule.length > 0
                  ? `${Schedule.length} Days Schedule`
                  : "Daily Instant Booking"}
              </span>
            </div>
          </div>

          <div className="!bg-white !rounded-2xl !p-4 !border !border-slate-200/90 !shadow-sm !flex !items-center !gap-3">
            <div className="!w-10 !h-10 !rounded-xl !bg-indigo-50 !text-indigo-600 !flex !items-center !justify-center !shrink-0 !border !border-indigo-100">
              <FaShieldHalved size={16} />
            </div>
            <div className="!min-w-0">
              <span className="!text-[11px] !text-slate-400 !font-family-semibold !uppercase !tracking-wider !block">
                Quality Guarantee
              </span>
              <span className="!text-xs sm:!text-sm !font-family-bold !text-slate-900 !truncate !block">
                Verified Local Drivers
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. INTERACTIVE SECTION TABS & SIDEBAR GRID                                 */}
        {/* ========================================================================= */}
        <div
          ref={contentRef}
          className="!grid !grid-cols-1 lg:!grid-cols-12 !gap-5 sm:!gap-6 !items-start"
        >
          {/* LEFT COLUMN: SWIPER TABS SYSTEM (8 cols) */}
          <div className="lg:!col-span-8 !space-y-4">
            {/* SWIPER JS CATEGORY TABS SLIDER */}
            <div className="!w-full !py-1">
              <Swiper
                modules={[FreeMode, Mousewheel]}
                slidesPerView="auto"
                spaceBetween={10}
                freeMode={true}
                mousewheel={{ forceToAxis: true }}
                className="!w-full !py-1"
              >
                {tabItems.map((tab) => {
                  const isSelected = activeTab === tab.id;
                  return (
                    <SwiperSlide key={tab.id} style={{ width: "auto" }}>
                      <button
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`!cursor-pointer !transition-all !duration-200 !select-none !flex !items-center !gap-2 !px-5 !py-2.5 !rounded-full !text-xs sm:!text-sm !whitespace-nowrap !border !shadow-sm ${
                          isSelected
                            ? "!text-white !bg-[#004a70] !border-[#004a70] !font-family-bold !shadow-md"
                            : "!text-slate-700 !bg-white !border-slate-200/90 hover:!border-[#004a70] hover:!bg-slate-50 hover:!text-[#004a70] !font-family-semibold"
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {tab.badge !== undefined && (
                          <span
                            className={`!text-[10.5px] !px-2 !py-0.5 !rounded-full !font-family-bold ${
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

            {/* TAB CONTENT PANELS */}
            {/* 1. OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="!space-y-4 !animate-fade-in">
                {/* UPCOMING EVENTS BANNER (If applicable) */}
                {SubcatData?.category?.name === "Upcoming Events" && SubcatData.start_date && (
                  <div className="!bg-gradient-to-r !from-[#002842] !to-[#004a70] !rounded-2xl !p-4 !text-white !shadow-sm !border !border-white/10">
                    <div className="!flex !flex-col sm:!flex-row sm:!items-center !gap-4">
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-9 !h-9 !rounded-xl !bg-white/15 !flex !items-center !justify-center !shrink-0">
                          <HiOutlineCalendarDays className="!text-sky-300 !text-lg" />
                        </div>
                        <div>
                          <p className="!text-[10.5px] !text-slate-300 !font-family-medium !uppercase !tracking-wider !m-0">
                            Event Date
                          </p>
                          <p className="!text-xs sm:!text-sm !font-family-bold !text-white !m-0">
                            {moment(SubcatData.start_date).format("dddd, MMMM Do, YYYY")}
                          </p>
                        </div>
                      </div>
                      <div className="!w-px !h-7 !bg-white/20 !hidden sm:!block" />
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-9 !h-9 !rounded-xl !bg-white/15 !flex !items-center !justify-center !shrink-0">
                          <HiOutlineClock className="!text-sky-300 !text-lg" />
                        </div>
                        <div>
                          <p className="!text-[10.5px] !text-slate-300 !font-family-medium !uppercase !tracking-wider !m-0">
                            Start Time
                          </p>
                          <p className="!text-xs sm:!text-sm !font-family-bold !text-white !m-0">
                            {moment(SubcatData.start_time, "HH:mm").format("hh:mm A")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* About Card */}
                <div className="!bg-white !rounded-2xl !p-5 sm:!p-6 !border !border-slate-200/90 !shadow-sm !space-y-3">
                  <div className="!flex !items-center !gap-2.5 !border-b !border-slate-100 !pb-3">
                    <div className="!w-8 !h-8 !rounded-lg !bg-sky-50 !text-[#004a70] !flex !items-center !justify-center">
                      <HiOutlineSparkles size={16} />
                    </div>
                    <h3 className="!text-base !font-family-bold !text-slate-900 !m-0">
                      About This Experience
                    </h3>
                  </div>
                  <p className="!text-slate-600 !font-family-regular !leading-relaxed !text-sm sm:!text-[14.5px] !m-0 !pt-1 !whitespace-pre-line">
                    {cleanAbout}
                  </p>
                </div>

                {/* Highlights Card */}
                {SubcatData?.heighlights?.length > 0 && (
                  <div className="!bg-white !rounded-2xl !p-5 sm:!p-6 !border !border-slate-200/90 !shadow-sm !space-y-3">
                    <div className="!flex !items-center !gap-2.5 !border-b !border-slate-100 !pb-3">
                      <div className="!w-8 !h-8 !rounded-lg !bg-emerald-50 !text-emerald-600 !flex !items-center !justify-center">
                        <HiOutlineCheckCircle size={16} />
                      </div>
                      <h3 className="!text-base !font-family-bold !text-slate-900 !m-0">
                        Highlights & Inclusions
                      </h3>
                    </div>
                    <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-2.5 !pt-1">
                      {SubcatData.heighlights.map((item, index) => (
                        <div
                          key={index}
                          className="!flex !items-center !gap-2.5 !p-3 !rounded-xl !bg-slate-50 !border !border-slate-200/70 !text-slate-800 !text-xs sm:!text-sm !font-family-medium"
                        >
                          <div className="!w-5 !h-5 !rounded-full !bg-emerald-500 !text-white !flex !items-center !justify-center !shrink-0">
                            <FiCheck size={11} />
                          </div>
                          <span className="!truncate">{stripHtml(item)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. SCHEDULE TAB */}
            {activeTab === "schedule" && (
              <div className="!bg-white !rounded-2xl !p-5 sm:!p-6 !border !border-slate-200/90 !shadow-sm !space-y-4 !animate-fade-in">
                <div className="!flex !items-center !justify-between !border-b !border-slate-100 !pb-3">
                  <div className="!flex !items-center !gap-2.5">
                    <div className="!w-8 !h-8 !rounded-lg !bg-indigo-50 !text-indigo-600 !flex !items-center !justify-center">
                      <HiOutlineCalendarDays size={16} />
                    </div>
                    <h3 className="!text-base !font-family-bold !text-slate-900 !m-0">
                      Weekly Opening Hours & Schedule
                    </h3>
                  </div>
                  <span className="!text-xs !text-slate-500 !font-family-medium">
                    {Schedule.length > 0 ? `${Schedule.length} Operating Days` : "Open Daily"}
                  </span>
                </div>

                {Schedule.length > 0 ? (
                  <div className="!divide-y !divide-slate-100 !rounded-xl !border !border-slate-200/80 !overflow-hidden">
                    {Schedule.map((item, index) => (
                      <div
                        key={index}
                        className="!flex !items-center !justify-between !p-3.5 !bg-white hover:!bg-slate-50 !transition-colors !text-xs sm:!text-sm"
                      >
                        <div className="!flex !items-center !gap-2.5">
                          <span className="!w-2 !h-2 !rounded-full !bg-[#004a70]" />
                          <span className="!font-family-bold !text-slate-800">
                            {formatScheduleDay(item, index)}
                          </span>
                        </div>
                        <span className="!font-family-bold !text-[#004a70] !bg-sky-50 !px-3.5 !py-1 !rounded-full !border !border-sky-200/70 !shadow-xs">
                          {formatScheduleSlots(item)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="!py-6">
                    <EmptyState
                      title="Flexible Schedule"
                      description="This location is available for bookings daily upon driver request."
                      showBg={false}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 3. LOCATION MAP TAB */}
            {activeTab === "map" && (
              <div className="!bg-white !rounded-2xl !p-5 sm:!p-6 !border !border-slate-200/90 !shadow-sm !space-y-4 !animate-fade-in">
                <div className="!flex !items-center !justify-between !border-b !border-slate-100 !pb-3">
                  <div className="!flex !items-center !gap-2.5">
                    <div className="!w-8 !h-8 !rounded-lg !bg-sky-50 !text-[#004a70] !flex !items-center !justify-center">
                      <HiOutlineMapPin size={16} />
                    </div>
                    <h3 className="!text-base !font-family-bold !text-slate-900 !m-0">
                      Destination Location Map
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={recenterMap}
                    className="!h-9 !px-3.5 !rounded-xl !text-xs !text-[#004a70] hover:!text-[#002f4a] !font-family-bold !flex !items-center !gap-1.5 !bg-sky-50 hover:!bg-sky-100 !border !border-sky-200/60 !cursor-pointer !transition-colors"
                  >
                    <MdOutlineMyLocation size={14} />
                    <span>Center Pin</span>
                  </button>
                </div>

                {/* Map Canvas with Floating Pills */}
                <div className="!relative !h-[360px] sm:!h-[420px] !w-full !rounded-2xl !overflow-hidden !border !border-slate-200/90 !shadow-sm !bg-slate-950">
                  <div
                    id="tour-map-container"
                    ref={mapContainerRef}
                    className="!w-full !h-full"
                  />

                  {/* Floating Bottom Location Address Pill */}
                  <div className="!absolute !bottom-3 !left-3 !right-3 !z-10 !pointer-events-none">
                    <div className="!bg-slate-900/90 !backdrop-blur-md !text-white !border !border-white/20 !p-3 !rounded-xl !shadow-lg !flex !items-center !justify-between !gap-3 !pointer-events-auto">
                      <div className="!flex !items-center !gap-2.5 !min-w-0">
                        <div className="!w-7 !h-7 !rounded-full !bg-[#004a70] !text-white !flex !items-center !justify-center !shrink-0">
                          <FaLocationDot size={12} />
                        </div>
                        <span className="!text-xs sm:!text-[13px] !font-family-medium !text-slate-200 !truncate">
                          {cleanAddress}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={recenterMap}
                        className="!h-8 !px-3 !rounded-lg !bg-white/15 hover:!bg-white/25 !text-white !text-xs !font-family-bold !border !border-white/20 !cursor-pointer !transition-all !shrink-0"
                      >
                        Focus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. REVIEWS TAB */}
            {activeTab === "reviews" && (
              <section className="!bg-white !rounded-2xl !p-5 sm:!p-6 !border !border-slate-200/90 !shadow-sm !space-y-4 !animate-fade-in">
                <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-2.5 !border-b !border-slate-100 !pb-3">
                  <div className="!flex !items-center !gap-2.5">
                    <div className="!w-8 !h-8 !rounded-lg !bg-amber-50 !text-amber-600 !flex !items-center !justify-center">
                      <HiOutlineChatBubbleLeftRight size={16} />
                    </div>
                    <h3 className="!text-base !font-family-bold !text-slate-900 !m-0">
                      Customer Reviews
                      {ratingLength > 0 && (
                        <span className="!text-xs !text-slate-400 !font-family-medium !ml-1.5">
                          ({ratingLength})
                        </span>
                      )}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleShow}
                    className="!h-9 !px-4 !rounded-xl !bg-[#004a70] hover:!bg-[#003855] !text-white !text-xs !font-family-bold !flex !items-center !justify-center !gap-1.5 !transition-colors !cursor-pointer !border-none !shadow-sm"
                  >
                    <MdOutlineRateReview size={14} />
                    <span>Leave a Review</span>
                  </button>
                </div>

                {isLoading ? (
                  <div className="!space-y-2.5">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="!bg-slate-50 !rounded-xl !p-3.5 !border !border-slate-200 !animate-pulse"
                      >
                        <div className="!h-3.5 !w-32 !bg-slate-200 !rounded !mb-2" />
                        <div className="!h-3 !w-full !bg-slate-200 !rounded" />
                      </div>
                    ))}
                  </div>
                ) : ratingData?.length > 0 ? (
                  <div className="!space-y-4">
                    {/* Rating Summary Card */}
                    <div className="!bg-gradient-to-br !from-sky-50 !to-slate-50 !rounded-2xl !border !border-sky-100 !p-5 !flex !flex-col sm:!flex-row !items-center !gap-5">
                      <div className="!text-center sm:!text-left">
                        <div className="!flex !items-baseline !gap-1 !justify-center sm:!justify-start">
                          <span className="!text-3xl !font-family-bold !text-slate-900">
                            {SubcatData?.avgRating > 0
                              ? SubcatData.avgRating.toFixed(1)
                              : "5.0"}
                          </span>
                          <span className="!text-xs !font-family-medium !text-slate-400">
                            / 5
                          </span>
                        </div>
                        <Rate
                          disabled
                          allowHalf
                          value={SubcatData?.avgRating || 5}
                          className="!text-amber-400 !text-base !my-0.5"
                        />
                        <p className="!text-[10.5px] !text-slate-500 !uppercase !tracking-wider !font-family-bold !m-0">
                          {ratingLength || ratingData.length} Verified Ratings
                        </p>
                      </div>
                      <div className="!w-px !h-12 !bg-slate-200 !hidden sm:!block" />
                      <div className="!flex-1 !text-center sm:!text-left">
                        <h4 className="!text-sm !font-family-bold !text-slate-900 !m-0 !mb-0.5">
                          Traveler Experiences
                        </h4>
                        <p className="!text-xs !text-slate-500 !font-family-regular !m-0">
                          Read real feedback from guests who visited this location.
                        </p>
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="!space-y-3">
                      {ratingData.map((review) => (
                        <div
                          key={review?._id}
                          className="!bg-slate-50/70 hover:!bg-slate-50 !rounded-xl !border !border-slate-200/80 !p-4 !transition-all"
                        >
                          <div className="!flex !items-start !justify-between !gap-2.5">
                            <div className="!flex !items-center !gap-2.5">
                              <div className="!w-9 !h-9 !rounded-full !overflow-hidden !border !border-slate-200 !bg-white !flex !items-center !justify-center !shrink-0 !shadow-xs">
                                {review?.user?.image ? (
                                  <img
                                    src={review.user.image}
                                    alt=""
                                    className="!w-full !h-full !object-cover"
                                  />
                                ) : (
                                  <span className="!text-[#004a70] !font-family-bold !text-xs">
                                    {review?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                                  </span>
                                )}
                              </div>
                              <div>
                                <h4 className="!font-family-bold !text-slate-900 !text-xs sm:!text-sm !m-0">
                                  {review?.user?.name || "Verified Traveler"}
                                </h4>
                                <p className="!text-[10px] !text-slate-400 !font-family-regular !m-0 !mt-0.5">
                                  {review?.createdAt
                                    ? moment(review.createdAt).format("DD MMM, YYYY")
                                    : "Recent"}
                                </p>
                              </div>
                            </div>
                            <Rate
                              className="!text-[11px] !text-amber-400"
                              allowHalf
                              disabled
                              defaultValue={review?.rating || 5}
                            />
                          </div>
                          {review?.review && (
                            <p className="!text-slate-700 !font-family-regular !text-xs sm:!text-[13px] !leading-relaxed !m-0 !mt-2.5 !pt-2.5 !border-t !border-slate-200/60">
                              {stripHtml(review.review)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {ratingLength > 0 && ratingData.length < ratingLength && (
                      <div className="!text-center !pt-1.5">
                        <button
                          type="button"
                          onClick={getRatingData}
                          disabled={pagiLoading}
                          className="!h-10 !px-5 !rounded-xl !bg-white !border !border-[#004a70] !text-[#004a70] hover:!bg-sky-50 !text-xs !font-family-bold !transition-colors !cursor-pointer"
                        >
                          {pagiLoading ? "Loading..." : "See More Reviews"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="!py-6">
                    <EmptyState
                      title="No Reviews Yet"
                      description="Be the first traveler to rate this place!"
                      showBg={false}
                    />
                  </div>
                )}
              </section>
            )}
          </div>

          {/* RIGHT STICKY COCKPIT SIDEBAR (4 cols) */}
          <div className="lg:!col-span-4 lg:!sticky lg:!top-24 !space-y-4">
            <div className="!bg-white !rounded-3xl !p-5 sm:!p-6 !border !border-slate-200/90 !shadow-lg !space-y-4.5">
              {/* Header Pricing */}
              <div>
                <div className="!flex !items-center !justify-between !mb-1">
                  <span className="!text-[11px] !font-family-bold !text-slate-400 !uppercase !tracking-wider">
                    Total Fare
                  </span>
                  <span className="!px-2.5 !py-0.5 !rounded-md !bg-emerald-50 !text-emerald-700 !text-[10.5px] !font-family-bold !border !border-emerald-200/60">
                    Instant Quote
                  </span>
                </div>
                <div className="!flex !items-baseline !gap-2 !mt-1">
                  <span className="!text-3xl sm:!text-4xl !font-family-bold !tracking-tight !text-[#004a70]">
                    ${priceXcd > 0 ? priceXcd.toFixed(2) : "0.00"}
                  </span>
                  <span className="!text-sm !font-family-bold !text-slate-600">
                    XCD
                  </span>
                  <span className="!text-xs !font-family-medium !text-slate-400">
                    (≈ ${priceUsd} USD)
                  </span>
                </div>
              </div>

              {/* Location Snippet */}
              <div className="!p-3 !bg-slate-50 !rounded-xl !border !border-slate-100 !flex !items-start !gap-2.5">
                <FaLocationDot className="!text-[#004a70] !mt-0.5 !shrink-0 !text-xs" />
                <span className="!text-xs !text-slate-700 !font-family-medium !leading-snug !line-clamp-2">
                  {cleanAddress}
                </span>
              </div>

              {/* Excursion Date/Time Picker (If excursion) */}
              {SubcatData?.category?.name === "Excursion" && (
                <div className="!p-3.5 !bg-amber-50/70 !rounded-xl !border !border-amber-200/80 !space-y-2">
                  <span className="!text-xs !font-family-bold !text-amber-800 !block">
                    Choose Date & Departure
                  </span>
                  <div className="!grid !grid-cols-2 !gap-2">
                    <div>
                      <label className="!text-[10px] !text-slate-500 !font-family-semibold !block !mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        onChange={(e) =>
                          setTimeSlot({ ...TimeSlot, date: e.target.value })
                        }
                        className="!h-9 !w-full !px-2.5 !py-1 !text-xs !border !border-slate-200 !rounded-lg !bg-white !outline-none !font-family-regular"
                      />
                    </div>
                    <div>
                      <label className="!text-[10px] !text-slate-500 !font-family-semibold !block !mb-1">
                        Time
                      </label>
                      <input
                        type="time"
                        onChange={(e) =>
                          handleTime({ ...TimeSlot, time: e.target.value })
                        }
                        className="!h-9 !w-full !px-2.5 !py-1 !text-xs !border !border-slate-200 !rounded-lg !bg-white !outline-none !font-family-regular"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons with clean space between them */}
              <div className="!space-y-3 !pt-1">
                {/* Primary Book Ride Button (Uniform Height: h-12) */}
                <button
                  type="button"
                  onClick={HandleClick}
                  className="!h-12 !w-full !rounded-2xl !bg-[#004a70] hover:!bg-[#003855] !text-white !text-sm !font-family-bold !shadow-md hover:!shadow-lg !transition-all !flex !items-center !justify-center !gap-2 !cursor-pointer !border-none !group"
                >
                  <span>Book a Ride</span>
                  <FiArrowRight className="group-hover:!translate-x-1 !transition-transform" />
                </button>

                {/* Secondary Review Button (Uniform Height: h-12) */}
                <button
                  type="button"
                  onClick={handleShow}
                  className="!h-12 !w-full !rounded-2xl !bg-slate-50 hover:!bg-slate-100 !text-slate-700 !text-xs sm:!text-sm !font-family-bold !border !border-slate-200 !transition-colors !flex !items-center !justify-center !gap-2 !cursor-pointer"
                >
                  <MdOutlineRateReview size={15} className="!text-[#004a70]" />
                  <span>Write a Review</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="!pt-3 !border-t !border-slate-100 !space-y-2 !text-[11px] !text-slate-500 !font-family-medium">
                <div className="!flex !items-center !gap-2">
                  <FiCheck className="!text-emerald-500 !shrink-0" />
                  <span>Instant Driver Dispatch & Route Tracking</span>
                </div>
                <div className="!flex !items-center !gap-2">
                  <FiCheck className="!text-emerald-500 !shrink-0" />
                  <span>Guaranteed Official Platform Rates</span>
                </div>
                <div className="!flex !items-center !gap-2">
                  <FiCheck className="!text-emerald-500 !shrink-0" />
                  <span>24/7 Roadside & Dispatch Assistance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MOBILE FLOATING ACTION BAR                                              */}
      {/* ========================================================================= */}
      <div
        className={`!fixed !bottom-0 !inset-x-0 !z-40 !p-3 !bg-white/95 !backdrop-blur-md !border-t !border-slate-200 !shadow-2xl !flex !items-center !justify-between !gap-3 lg:!hidden ${
          mounted ? "!animate-fade-in-up" : "!opacity-0"
        }`}
      >
        <div>
          <span className="!text-[10px] !text-slate-400 !font-family-semibold !uppercase !tracking-wider !block">
            Tour Price
          </span>
          <div className="!flex !items-baseline !gap-1">
            <span className="!text-base !font-family-bold !text-[#004a70]">
              ${priceXcd > 0 ? priceXcd.toFixed(2) : "0.00"}
            </span>
            <span className="!text-[10px] !font-family-bold !text-slate-500">
              XCD
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={HandleClick}
          className="!h-11 !flex-1 !rounded-xl !bg-[#004a70] !text-white !text-xs sm:!text-sm !font-family-bold !flex !items-center !justify-center !gap-1.5 !shadow-md !border-none !cursor-pointer"
        >
          <span>Book a Ride</span>
          <FiArrowRight size={13} />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 5. FULLSCREEN PHOTO LIGHTBOX MODAL (PORTAL)                               */}
      {/* ========================================================================= */}
      {lightboxOpen &&
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

      {/* ========================================================================= */}
      {/* 6. PURE REACT / TAILWIND STAR REVIEW MODAL (PORTAL INTO BODY)             */}
      {/* ========================================================================= */}
      {show &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="!fixed !inset-0 !z-[999999] !flex !items-center !justify-center !p-4 !bg-black/65 !backdrop-blur-sm !animate-fade-in">
            <div className="!fixed !inset-0" onClick={handleClose} />
            <div className="!relative !z-10 !bg-white !rounded-3xl !shadow-2xl !max-w-md !w-full !overflow-hidden !p-5 sm:!p-6 !animate-scale-in">
              <div className="!flex !items-center !justify-between !border-b !border-slate-100 !pb-3 !mb-4">
                <div className="!flex !items-center !gap-2">
                  <div className="!w-7 !h-7 !rounded-lg !bg-amber-50 !text-amber-500 !flex !items-center !justify-center">
                    <FaStar size={13} />
                  </div>
                  <h3 className="!text-sm sm:!text-base !font-family-bold !text-slate-900 !m-0">
                    Leave a Review
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="!w-7 !h-7 !rounded-full !bg-slate-100 hover:!bg-slate-200 !text-slate-600 !flex !items-center !justify-center !border-none !cursor-pointer !transition-colors !text-xs"
                >
                  ✕
                </button>
              </div>

              <Formik
                initialValues={{
                  comment: "",
                  rating: value,
                }}
                validationSchema={validationSchema}
                onSubmit={(values, actions) => handleSubmit(values, actions)}
              >
                {({ setFieldValue, handleChange, handleBlur, values }) => (
                  <Form className="!space-y-3.5">
                    <div>
                      <label className="!block !text-xs !font-family-bold !text-slate-700 !mb-1">
                        Your Rating
                      </label>
                      <Rate
                        onChange={(val) => {
                          setValue(val);
                          setFieldValue("rating", val);
                        }}
                        value={value}
                        className="!text-2xl !text-amber-400"
                      />
                      <ErrorMessage
                        name="rating"
                        component="div"
                        className="!text-rose-500 !text-[11px] !mt-0.5 !font-family-regular"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="comment"
                        className="!block !text-xs !font-family-bold !text-slate-700 !mb-1"
                      >
                        Your Feedback
                      </label>
                      <Field
                        as="textarea"
                        rows="3"
                        placeholder="Share your experience at this tour destination..."
                        id="comment"
                        name="comment"
                        className="!w-full !px-3 !py-2 !text-xs !border !border-slate-200 !rounded-xl focus:!border-[#004a70] focus:!ring-2 focus:!ring-sky-100 !outline-none !font-family-regular !resize-none !transition-all"
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <ErrorMessage
                        name="comment"
                        component="div"
                        className="!text-rose-500 !text-[11px] !mt-0.5 !font-family-regular"
                      />
                    </div>

                    <div className="!pt-1">
                      <button
                        type="submit"
                        disabled={ratingLoading}
                        className="!h-11 !w-full !rounded-xl !bg-[#004a70] hover:!bg-[#003855] !text-white !text-xs !font-family-bold !shadow-md !transition-colors !cursor-pointer !border-none !flex !items-center !justify-center !gap-2"
                      >
                        {ratingLoading ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

const PopularPlaces = () => {
  return (
    <Suspense
      fallback={
        <div className="!min-h-[60vh] !flex !items-center !justify-center !bg-[#f8fafc]">
          <div className="!flex !flex-col !items-center !gap-3">
            <div className="!w-9 !h-9 !border-[3px] !border-[#004a70]/30 !border-t-[#004a70] !rounded-full !animate-spin" />
            <p className="!text-xs !text-slate-400 !font-family-medium">
              Loading Tour Experience...
            </p>
          </div>
        </div>
      }
    >
      <PopularAA />
    </Suspense>
  );
};

export default PopularPlaces;
