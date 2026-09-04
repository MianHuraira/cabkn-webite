"use client";
import React, { useEffect, useState, useRef } from "react";

import Tingstodo from "./Tingstodo";
import TopTours from "./TopTours";
import TopServices from "./TopServices";
import RidesNearYou from "./RidesNearYou";
import IntroVideo from "./IntroVideo";
import DownloadApp from "./DownloadApp";
import HomeBannerSlider from "./HomeBannerSlider";
import {
  CarBanner,
  Heroimg,
  heroDailyRides,
  heroAirport,
  heroTour,
  heroParcel,
  heroVip,
} from "../assets/Images";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  FiArrowRight,
  FiShield,
  FiClock,
  FiStar,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiPackage,
  FiCompass,
  FiAward,
} from "react-icons/fi";
import { FaStar, FaPlaneArrival } from "react-icons/fa";
import CustomButton from "../CustomButton";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

const HERO_SLIDES = [
  {
    id: "daily-rides",
    tabLabel: "Daily Rides",
    badge: "Island-Wide On-Demand Rides",
    badgeIcon: FiMapPin,
    titleLine1: "Looking for a ride?",
    titleLine2: "You're in the perfect spot.",
    features: [
      "High quality at a low cost",
      "Instant driver dispatch",
      "24/7 roadside support",
    ],
    primaryBtn: {
      text: "Book a Ride",
      target: "ride",
      className: "!bg-green-500 hover:!bg-green-600",
    },
    secondaryBtn: {
      text: "Airport Pickups",
      target: "/airport-pickups",
      className: "!bg-[#004a70] hover:!bg-[#003855]",
    },
    image: heroDailyRides,
  },
  {
    id: "airport-transfers",
    tabLabel: "Airport Pickups",
    badge: "Direct Airport Transfers • RLB International (SKB)",
    badgeIcon: FaPlaneArrival,
    titleLine1: "Flight-tracked pickups,",
    titleLine2: "zero airport stress.",
    features: [
      "Live flight delay tracking",
      "Complimentary wait time",
      "Chauffeur meet & greet",
    ],
    primaryBtn: {
      text: "Airport Pickups",
      target: "/airport-pickups",
      className: "!bg-[#004a70] hover:!bg-[#003855]",
    },
    secondaryBtn: {
      text: "Daily Island Cab",
      target: "ride",
      className: "!bg-white/20 hover:!bg-white/30 !backdrop-blur-md",
    },
    image: heroAirport,
  },
  {
    id: "island-tours",
    tabLabel: "Island Tours",
    badge: "Scenic Island Excursions • Discover St. Kitts & Nevis",
    badgeIcon: FiCompass,
    titleLine1: "Explore Caribbean beauty",
    titleLine2: "with certified local guides.",
    features: [
      "Curated scenic itineraries",
      "Brimstone Hill & coastal vistas",
      "Custom group itineraries",
    ],
    primaryBtn: {
      text: "Explore Island Tours",
      target: "/tours",
      className: "!bg-green-500 hover:!bg-green-600",
    },
    secondaryBtn: {
      text: "Custom Tour Plan",
      target: "/makeowntours",
      className: "!bg-[#004a70] hover:!bg-[#003855]",
    },
    image: heroTour,
  },
  {
    id: "parcel-delivery",
    tabLabel: "Send Parcel",
    badge: "Island Courier Service • Fast & Secure",
    badgeIcon: FiPackage,
    titleLine1: "Send packages across the island,",
    titleLine2: "straight to the doorstep.",
    features: [
      "Same-day doorstep delivery",
      "Live GPS parcel tracking",
      "Safe verified handling",
    ],
    primaryBtn: {
      text: "Send a Parcel",
      target: "/sendparcel",
      className: "!bg-green-500 hover:!bg-green-600",
    },
    secondaryBtn: {
      text: "Book a Ride",
      target: "ride",
      className: "!bg-[#004a70] hover:!bg-[#003855]",
    },
    image: heroParcel,
  },
  {
    id: "vip-executive",
    tabLabel: "VIP & Executive",
    badge: "Executive VIP Fleet • First-Class Travel",
    badgeIcon: FiAward,
    titleLine1: "Elevate your island journey",
    titleLine2: "with private luxury chauffeurs.",
    features: [
      "Premium executive fleet",
      "Discreet VIP chauffeurs",
      "5-star resort concierge",
    ],
    primaryBtn: {
      text: "Reserve VIP Ride",
      target: "ride",
      className: "!bg-green-500 hover:!bg-green-600",

    },
    secondaryBtn: {
      text: "Airport Transfers",
      target: "/airport-pickups",
      className: "!bg-[#004a70] hover:!bg-[#003855]",
    },
    image: heroVip,
  },
];

function SectionReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const WhyChooseUs = () => {
  const router = useRouter();
  const userData = useSelector((state) => state.auth.user?.user);

  const features = [
    {
      icon: <FiCheckCircle className="!w-5 !h-5 !text-white" />,
      title: "Easy & Fast Booking",
      description:
        "Car service is essential for maintaining performance and longevity of vehicle. Book your ride in just a few taps.",
    },
    {
      icon: <FiMapPin className="!w-5 !h-5 !text-white" />,
      title: "Many Pickup Locations",
      description:
        "We have extensive coverage across Saint Kitts and Nevis, so you're never far from a ride.",
    },
    {
      icon: <FaStar className="!w-5 !h-5 !text-white" />,
      title: "Customer Satisfaction",
      description:
        "Your happiness is our priority. We go the extra mile to ensure you have a great experience.",
    },
  ];

  return (
    <section className="!py-8 sm:!py-10 md:!py-12 !select-none !bg-gradient-to-b !from-white !via-slate-50/50 !to-brand-50/30 !relative !overflow-hidden">
      <div
        className="!absolute !inset-0 !opacity-[0.05] !pointer-events-none"
        style={{
          backgroundImage: `url(${Heroimg.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="!w-full !max-w-5xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !relative !z-10">
        <div className="!text-center !mb-6 sm:!mb-8">
          <h2 className="!text-lg sm:!text-xl md:!text-2xl !font-family-semibold !text-slate-900 !tracking-tight !leading-snug !m-0">
            WE ARE INNOVATIVE AND PASSIONATE
            <br />
            ABOUT THE WORK WE DO.
          </h2>
        </div>

        <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-4 lg:!gap-5 !items-stretch">
          {features.map((feature, index) => (
            <div key={index} className="!h-full !relative !group">
              <div
                className="!h-full !flex !flex-col !justify-between !rounded-2xl !p-5 sm:!p-6 !relative !overflow-hidden !transition-all !duration-300 hover:!-translate-y-1.5 hover:!shadow-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.85)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.8)",
                  boxShadow: "0 8px 24px -8px rgba(0, 23, 38, 0.07)",
                }}
              >
                {/* Top-Right Decorative Cutout & Circular Badge */}
                <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-white !rounded-bl-[35px] !z-10" />
                <div className="!absolute !top-2.5 !right-2.5 !w-10 !h-10 !bg-[#004a70] !rounded-full !flex !items-center !justify-center !text-white !z-20 !shadow-xs !transition-transform !duration-300 group-hover:!scale-105">
                  {feature.icon}
                </div>

                {/* Card Content */}
                <div className="!pt-1 !flex-1 !flex !flex-col">
                  <h3 className="!text-base sm:!text-[17px] !font-family-semibold !text-slate-900 !mb-2 !pr-12 !leading-snug !m-0">
                    {feature.title}
                  </h3>
                  <p className="!text-slate-600 !font-family-regular !text-xs sm:!text-[13px] !leading-relaxed !mb-4 !mt-1.5">
                    {feature.description}
                  </p>
                  <div className="!mt-auto !pt-1">
                    <button
                      type="button"
                      onClick={() => router.push(userData ? "/ride" : "/auth/login")}
                      className="!inline-flex !items-center !gap-1.5 !bg-[#004a70] hover:!bg-[#003855] !text-white !font-family-semibold !text-xs !px-4 !py-2 !rounded-lg !transition-all !duration-300 !shadow-2xs hover:!shadow-xs !cursor-pointer active:!scale-95"
                    >
                      <span>Book Now</span>
                      <FiArrowRight className="!w-3.5 !h-3.5 !transition-transform !duration-300 group-hover:!translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HomeComponent = () => {
  const router = useRouter();
  const userData = useSelector((state) => state.auth.user?.user);
  const [mounted, setMounted] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const swiperRef = useRef(null);
  const touchStartX = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const Routing = () => {
    router.push(userData ? "/ride" : "/auth/login");
  };

  const handleBtnClick = (target) => {
    if (target === "ride") {
      Routing();
    } else {
      router.push(target);
    }
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        swiperRef.current?.slideNext();
      } else {
        swiperRef.current?.slidePrev();
      }
    }
    touchStartX.current = null;
  };

  const currentSlide = HERO_SLIDES[activeSlide] || HERO_SLIDES[0];
  const CurrentBadgeIcon = currentSlide.badgeIcon;

  return (
    <>
      <section
        className={`!relative !min-h-screen !select-none !flex !items-center !overflow-hidden !pt-20 !pb-28 md:!pt-24 md:!pb-32 ${mounted ? "!animate-fade-in" : "!opacity-0"}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Swiper Background Carousel */}
        <div className="!absolute !inset-0 !pointer-events-none !z-0">
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            speed={1000}
            autoplay={{
              delay: 5500,
              disableOnInteraction: false,
            }}
            loop={true}
            onSwiper={(sw) => {
              swiperRef.current = sw;
            }}
            onSlideChange={(sw) => {
              setActiveSlide(sw.realIndex ?? sw.activeIndex ?? 0);
            }}
            className="!w-full !h-full"
          >
            {HERO_SLIDES.map((slide) => (
              <SwiperSlide key={slide.id} className="!w-full !h-full !relative">
                <div
                  className="!w-full !h-full !bg-cover !bg-no-repeat !bg-[85%_center] md:!bg-center !transition-transform !duration-1000 !ease-out"
                  style={{
                    backgroundImage: `url(${slide.image?.src || slide.image})`,
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Dark Overlays for high text contrast on the left, clear view of mobile mockup on the right */}
        <div className="!absolute !inset-0 !bg-gradient-to-r !from-black/85 !via-black/55 !to-transparent !pointer-events-none !z-[1]" />
        <div className="!absolute !inset-0 !bg-gradient-to-t !from-black/75 !via-transparent !to-black/20 !pointer-events-none !z-[1]" />

        {/* Foreground Content */}
        <div className="!relative !z-10 !w-full !max-w-7xl !mx-auto !px-4 lg:!px-8 !pb-14 sm:!pb-10">
          <div key={activeSlide} className="!flex !flex-col !gap-3 !animate-fade-in max-w-xl lg:max-w-2xl">
            <div
              className="!inline-flex !items-center !gap-2 !text-brand-300 !text-[11px] sm:!text-xs !uppercase !tracking-[0.15em] !font-family-semibold !w-fit !bg-black/40 !backdrop-blur-md !px-3 !py-1.5 !rounded-full !border !border-white/10"
            >
              <CurrentBadgeIcon className="!text-brand-300 !text-sm" />
              <span>{currentSlide.badge}</span>
            </div>

            <h1
              className="!text-white !font-family-medium !leading-[1.2] !tracking-tight !m-0 !text-[clamp(2rem,5vw,3.5rem)] sm:!text-[clamp(2.25rem,6vw,3rem)]"
            >
              {currentSlide.titleLine1}
              <br />
              {currentSlide.titleLine2}
            </h1>

            <div className="!flex !gap-4 sm:!gap-6 !mt-3 !flex-wrap">
              {currentSlide.features.map((feat, fIdx) => (
                <div key={fIdx} className="!flex !items-center !gap-2 ">
                  <div className="!w-5 !h-5 !rounded-full !bg-[#004a70] !flex !items-center !justify-center !shrink-0">
                    <FiCheckCircle size={12} color="#fff" />
                  </div>
                  <span className="!text-white/85 !font-family-regular !text-xs sm:!text-sm">
                    {feat}
                  </span>
                </div>
              ))}
            </div>

            <div className="!flex !flex-wrap !gap-4 !mt-3">
              <CustomButton
                onClick={() => handleBtnClick(currentSlide.primaryBtn.target)}
                variant="primary"
                size="lg"
                endContent={
                  <FiArrowRight className="group-hover:!translate-x-1 !transition-transform !duration-300" />
                }
                className={`group !border-0 !shadow-lg !shadow-black/20 !font-family-medium !text-base ${currentSlide.primaryBtn.className}`}
              >
                {currentSlide.primaryBtn.text}
              </CustomButton>

              <CustomButton
                onClick={() => handleBtnClick(currentSlide.secondaryBtn.target)}
                variant="primary"
                size="lg"
                endContent={
                  <FiArrowRight className="group-hover:!translate-x-1 !transition-transform !duration-300" />
                }
                className={`group !border-0 !shadow-lg !shadow-black/20 !font-family-medium !text-base ${currentSlide.secondaryBtn.className}`}
              >
                {currentSlide.secondaryBtn.text}
              </CustomButton>
            </div>
          </div>
        </div>

        {/* Modern Pill & Dot Pagination at Bottom Center */}
        <div className="!absolute !bottom-6 md:!bottom-8 !left-0 !right-0 !z-20 !pointer-events-auto !flex !justify-center !items-center !gap-2">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = activeSlide === idx;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => swiperRef.current?.slideToLoop(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`!h-2.5 !rounded-full !transition-all !duration-300 !ease-in-out !cursor-pointer ${isActive
                    ? "!w-8 !bg-white !shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    : "!w-2.5 !bg-white/50 hover:!bg-white/80"
                  }`}
              />
            );
          })}
        </div>
      </section>

      <SectionReveal>
        <WhyChooseUs />
      </SectionReveal>

      <SectionReveal>
        <div id="rides-near-you">
          <RidesNearYou />
        </div>
      </SectionReveal>

      <SectionReveal>
        <div id="top-tours">
          <TopTours />
        </div>
      </SectionReveal>

      <SectionReveal>
        <HomeBannerSlider />
      </SectionReveal>

      <SectionReveal>
        <div id="why-us">
          <Tingstodo />
        </div>
      </SectionReveal>

      <SectionReveal>
        <div id="top-services">
          <TopServices />
        </div>
      </SectionReveal>

      <SectionReveal>
        <IntroVideo />
      </SectionReveal>

      <SectionReveal>
        <DownloadApp />
      </SectionReveal>
    </>
  );
};

export default HomeComponent;
