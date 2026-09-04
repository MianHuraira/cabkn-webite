"use client";

import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useRouter } from "next/navigation";
import { useApi } from "../ApiFunction/ApiFunction";
import {
  FiArrowRight,
  FiTag,
  FiCopy,
  FiCheck,
  FiGift,
  FiChevronLeft,
  FiChevronRight,
  FiCompass,
} from "react-icons/fi";
import {
  heroTour,
  heroAirport,
  heroParcel,
} from "../assets/Images";

// Fallback banners when API has no active banners or user is not logged in
const FALLBACK_BANNERS = [
  {
    _id: "fb-1",
    isFallback: true,
    name: "Explore Nevis & St. Kitts Island Tours",
    description:
      "Experience catamaran cruises, rainforest trails, and Brimstone Hill fortress with certified local guides.",
    buttonName: "Explore Tours",
    destination: "tours",
    mediaType: "image",
    image: heroTour.src || heroTour,
    tag: "Exclusive Tour Experience",
  },
  {
    _id: "fb-2",
    isFallback: true,
    name: "Guaranteed SKB Airport Pickups",
    description:
      "Pre-book flight-tracked private airport transfers with transparent flat rates and meet-and-greet service.",
    buttonName: "Airport Pickup",
    destination: "airport_pickup",
    mediaType: "image",
    image: heroAirport.src || heroAirport,
    tag: "Flight-Tracked Transfers",
  },
  {
    _id: "fb-3",
    isFallback: true,
    name: "Fast Island-Wide Parcel Delivery",
    description:
      "Reliable same-day courier service and package dispatch across Saint Kitts & Nevis in just a few taps.",
    buttonName: "Send a Parcel",
    destination: "rides",
    mediaType: "image",
    image: heroParcel.src || heroParcel,
    tag: "Island Courier Service",
  },
];

export default function HomeBannerSlider() {
  const router = useRouter();
  const { getData, header1 } = useApi();
  const [slides, setSlides] = useState(FALLBACK_BANNERS);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const fetchBannersAndCoupons = async () => {
    try {
      setLoading(true);
      const [bannersRes, couponsRes] = await Promise.allSettled([
        getData("banner/all", header1),
        getData("coupon/me/1", header1),
      ]);

      const apiBanners =
        bannersRes.status === "fulfilled" &&
        (bannersRes.value?.banners || bannersRes.value?.data?.banners)
          ? bannersRes.value?.banners || bannersRes.value?.data?.banners
          : [];

      const apiCoupons =
        couponsRes.status === "fulfilled" &&
        (couponsRes.value?.coupons || couponsRes.value?.data?.coupons)
          ? couponsRes.value?.coupons || couponsRes.value?.data?.coupons
          : [];

      const combined = [...apiBanners, ...apiCoupons];

      if (combined.length > 0) {
        setSlides(combined);
      } else {
        setSlides(FALLBACK_BANNERS);
      }
    } catch (error) {
      console.warn("Could not fetch remote banners, using fallbacks:", error);
      setSlides(FALLBACK_BANNERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannersAndCoupons();
  }, []);

  const handleCopyCode = (e, code) => {
    e.stopPropagation();
    if (!code) return;
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch (_) {}
  };

  const handleDestination = (item) => {
    // External link
    if (item?.linkType === "external" || item?.type === "ads") {
      if (item?.url) {
        window.open(item.url, "_blank", "noopener,noreferrer");
      }
      return;
    }

    // Coupon item
    if (item?.code || item?.discount != null) {
      router.push("/coupon");
      return;
    }

    const dest = item?.destination || (item?.type === "ride" ? "rides" : "");
    switch (dest) {
      case "tours":
        router.push("/tours");
        break;
      case "rides":
        if (item?.location?.lat && item?.location?.lng) {
          const params = new URLSearchParams({
            address: item?.location?.address || "",
            lat: String(item?.location?.lat),
            lng: String(item?.location?.lng),
          });
          router.push(`/bookRide?data=${encodeURIComponent(params.toString())}`);
        } else {
          router.push("/ride");
        }
        break;
      case "shop":
        router.push("/services");
        break;
      case "top_locations":
        router.push("/top-locations");
        break;
      case "airport_pickup":
        router.push("/airport-pickups");
        break;
      case "coupons":
        router.push("/coupon");
        break;
      default:
        if (item?.url) {
          window.open(item.url, "_blank", "noopener,noreferrer");
        } else {
          router.push("/ride");
        }
        break;
    }
  };

  const isCoupon = (item) => {
    if (!item) return false;
    if (item.linkType === "in_app" || item.linkType === "external") return false;
    if (item.type === "ads" || item.type === "ride" || item.type === "in_app") return false;
    return !!(item.code || item.discount != null);
  };

  if (!slides || slides.length === 0) return null;

  return (
    <section className="!py-6 sm:!py-8 md:!py-10 !select-none !relative !overflow-hidden">
      <div className="!w-full !max-w-6xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !relative">
        <div className="!relative !group/slider">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={slides.length > 1}
            speed={750}
            pagination={{
              clickable: true,
              bulletClass:
                "!inline-block !w-2 !h-2 !rounded-full !bg-slate-300 !mx-1 !transition-all !duration-300 !cursor-pointer",
              bulletActiveClass:
                "!w-6 !bg-[#004a70] !shadow-xs",
            }}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            className="!rounded-2xl sm:!rounded-3xl !shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:!shadow-[0_12px_36px_rgb(0,0,0,0.12)] !transition-shadow !duration-300 !overflow-hidden"
          >
            {slides.map((item, idx) => {
              const bgImage = item?.image || item?.img;
              const hasCustomGraphic = !item?.isFallback && !!bgImage;
              const isCouponItem = isCoupon(item);
              const title = item?.name || item?.title || "";
              const description = item?.description || "";
              const cta = item?.buttonName || (isCouponItem ? "View Offers" : "Explore Now");
              const bgColor = item?.backgroundColor || "#002842";

              // 1. Promotional image banner with subtle left-side black overlay & compact action controls
              if (hasCustomGraphic) {
                return (
                  <SwiperSlide key={item?._id || idx}>
                    <div
                      onClick={() => handleDestination(item)}
                      className="!relative !w-full !cursor-pointer !overflow-hidden !bg-slate-900 !flex !items-center !justify-center !group/card"
                    >
                      {/* Banner Image */}
                      <img
                        src={bgImage}
                        alt={title || "CabKn Promotional Banner"}
                        className="!w-full !h-auto !max-h-[260px] sm:!max-h-[300px] md:!max-h-[340px] !object-cover !object-center !block !transition-transform !duration-500 group-hover/card:!scale-[1.008]"
                        loading="lazy"
                      />

                      {/* Subtle left-side black overlay - gentle gradient so the image is not blocked */}
                      <div className="!absolute !inset-y-0 !left-0 !w-full sm:!w-[60%] md:!w-[48%] !bg-gradient-to-r !from-black/75 !via-black/40 sm:!via-black/25 !to-transparent !pointer-events-none !z-[1]" />

                      {/* Left side compact interactive content (user buttons & coupon code) */}
                      <div className="!absolute !inset-y-0 !left-0 !z-10 !p-4 sm:!p-6 md:!p-8 !flex !flex-col !justify-center !items-start !gap-2 sm:!gap-2.5 !max-w-[85%] sm:!max-w-[420px]">
                        {/* Compact Badge (Discount or Highlight) */}
                        {item?.discount ? (
                          <span className="!inline-flex !items-center !gap-1.5 !bg-amber-400/25 !border !border-amber-300/40 !backdrop-blur-md !text-amber-200 !px-2.5 !py-0.5 !rounded-full !text-[10.5px] sm:!text-[11px] !font-family-semibold !shadow-xs">
                            <FiGift className="!w-3 !h-3 !text-amber-300" />
                            <span>{item.discount}% OFF SPECIAL</span>
                          </span>
                        ) : item?.tag ? (
                          <span className="!inline-flex !items-center !gap-1.5 !bg-white/20 !border !border-white/30 !backdrop-blur-md !text-white !px-2.5 !py-0.5 !rounded-full !text-[10.5px] sm:!text-[11px] !font-family-semibold !shadow-xs">
                            <FiCompass className="!w-3 !h-3 !text-sky-300" />
                            <span>{item.tag}</span>
                          </span>
                        ) : null}

                        {/* Title (compact & single line to prevent blocking image graphics) */}
                        {title && (
                          <h3 className="!text-sm sm:!text-base md:!text-lg !font-family-semibold !text-white !tracking-tight !m-0 !line-clamp-1 !drop-shadow-md">
                            {title}
                          </h3>
                        )}

                        {/* User Action Buttons & Promo Code Row */}
                        <div className="!flex !items-center !gap-2 sm:!gap-2.5 !flex-wrap !mt-1">
                          {/* Coupon Code button with copy */}
                          {item?.code && (
                            <button
                              type="button"
                              onClick={(e) => handleCopyCode(e, item.code)}
                              className="!inline-flex !items-center !gap-1.5 !bg-black/55 hover:!bg-black/75 !border !border-white/30 !backdrop-blur-md !text-white !px-3 !py-1.5 sm:!py-2 !rounded-xl !text-xs !font-mono !font-semibold !transition-all !cursor-pointer active:!scale-95 !shadow-sm"
                              title="Click to copy promo code"
                            >
                              <FiTag className="!text-amber-300 !w-3.5 !h-3.5" />
                              <span>{item.code}</span>
                              {copiedCode === item.code ? (
                                <span className="!inline-flex !items-center !gap-1 !text-emerald-400 !font-sans !text-[11px] !font-semibold">
                                  <FiCheck className="!w-3.5 !h-3.5" /> Copied
                                </span>
                              ) : (
                                <FiCopy className="!text-slate-300 !w-3.5 !h-3.5" />
                              )}
                            </button>
                          )}

                          {/* CTA / User Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDestination(item);
                            }}
                            className="!inline-flex !items-center !gap-1.5 !bg-white hover:!bg-slate-100 !text-[#004a70] !font-family-semibold !text-xs sm:!text-sm !px-3.5 sm:!px-4.5 !py-1.5 sm:!py-2 !rounded-xl !shadow-md hover:!shadow-lg !transition-all !duration-200 !cursor-pointer active:!scale-95"
                          >
                            <span>{cta}</span>
                            <FiArrowRight className="!w-3.5 !h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              }

              // 2. Solid color banner or Fallback banner
              return (
                <SwiperSlide key={item?._id || idx}>
                  <div
                    onClick={() => handleDestination(item)}
                    className="!relative !w-full !min-h-[200px] sm:!min-h-[240px] md:!min-h-[260px] !flex !items-center !cursor-pointer !overflow-hidden"
                    style={{
                      backgroundColor: bgColor,
                    }}
                  >
                    {/* Background photo for fallback slides */}
                    {bgImage && (
                      <div className="!absolute !inset-0 !z-0">
                        <img
                          src={bgImage}
                          alt={title}
                          className="!w-full !h-full !object-cover !object-center"
                        />
                        <div className="!absolute !inset-0 !bg-gradient-to-r !from-[#001726]/90 !via-[#002842]/75 !to-transparent" />
                      </div>
                    )}

                    {/* Banner Content */}
                    <div className="!relative !z-10 !w-full !p-6 sm:!p-8 md:!p-10 !flex !flex-col md:!flex-row !items-start md:!items-center !justify-between !gap-6">
                      <div className="!max-w-xl !space-y-2 sm:!space-y-2.5">
                        {/* Tag Badge */}
                        <div className="!inline-flex !items-center !gap-1.5 !bg-white/15 !backdrop-blur-md !border !border-white/20 !px-3 !py-1 !rounded-full !text-[11px] sm:!text-xs !font-family-semibold !text-white !shadow-xs">
                          {isCouponItem ? (
                            <>
                              <FiGift className="!text-amber-300 !w-3.5 !h-3.5" />
                              <span>{item?.discount ? `${item.discount}% OFF PROMO` : "SPECIAL OFFER"}</span>
                            </>
                          ) : (
                            <>
                              <FiCompass className="!text-sky-300 !w-3.5 !h-3.5" />
                              <span>{item?.tag || "CABKN HIGHLIGHT"}</span>
                            </>
                          )}
                        </div>

                        {/* Title */}
                        <h2 className="!text-xl sm:!text-2xl md:!text-3xl !font-family-semibold !text-white !tracking-tight !leading-snug !m-0 !drop-shadow-xs">
                          {title}
                        </h2>

                        {/* Description */}
                        {description && (
                          <p className="!text-slate-200 !text-xs sm:!text-sm !font-family-regular !leading-relaxed !line-clamp-2 !m-0 !max-w-lg">
                            {description}
                          </p>
                        )}
                      </div>

                      {/* Right Side Action / Coupon Code */}
                      <div className="!flex !flex-col sm:!flex-row !items-stretch sm:!items-center !gap-3 !w-full md:!w-auto !shrink-0">
                        {isCouponItem && item?.code && (
                          <button
                            type="button"
                            onClick={(e) => handleCopyCode(e, item.code)}
                            className="!inline-flex !items-center !justify-center !gap-2 !bg-white/10 hover:!bg-white/20 !border !border-white/25 !backdrop-blur-md !text-white !px-4 !py-2.5 !rounded-xl !text-xs !font-mono !font-semibold !transition-all !cursor-pointer active:!scale-95"
                          >
                            <FiTag className="!text-amber-300" />
                            <span>{item.code}</span>
                            {copiedCode === item.code ? (
                              <FiCheck className="!text-emerald-400 !w-3.5 !h-3.5" />
                            ) : (
                              <FiCopy className="!text-slate-300 !w-3.5 !h-3.5" />
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDestination(item)}
                          className="!inline-flex !items-center !justify-center !gap-2 !bg-white hover:!bg-slate-100 !text-[#004a70] !font-family-semibold !text-xs sm:!text-sm !px-5 sm:!px-6 !py-2.5 !rounded-xl !transition-all !duration-200 !shadow-md hover:!shadow-lg !cursor-pointer active:!scale-95 !whitespace-nowrap"
                        >
                          <span>{cta}</span>
                          <FiArrowRight className="!w-4 !h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Desktop Arrow Navigation */}
          {slides.length > 1 && (
            <>
              <button
                ref={prevRef}
                type="button"
                aria-label="Previous Slide"
                className="!hidden md:!flex !absolute !left-3 !top-1/2 !-translate-y-1/2 !z-20 !w-9 !h-9 !rounded-full !bg-black/40 hover:!bg-black/70 !backdrop-blur-md !text-white !items-center !justify-center !transition-all !opacity-0 group-hover/slider:!opacity-100 !cursor-pointer !border !border-white/25 !shadow-md"
              >
                <FiChevronLeft className="!w-5 !h-5" />
              </button>
              <button
                ref={nextRef}
                type="button"
                aria-label="Next Slide"
                className="!hidden md:!flex !absolute !right-3 !top-1/2 !-translate-y-1/2 !z-20 !w-9 !h-9 !rounded-full !bg-black/40 hover:!bg-black/70 !backdrop-blur-md !text-white !items-center !justify-center !transition-all !opacity-0 group-hover/slider:!opacity-100 !cursor-pointer !border !border-white/25 !shadow-md"
              >
                <FiChevronRight className="!w-5 !h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
