"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import {
  IoCarSport,
  IoMap,
  IoLocation,
  IoBagHandle,
} from "react-icons/io5";

import {
  logoBlue,
  onboardingRides,
  onboardingTours,
  onboardingPlaces,
  onboardingShop,
} from "@/components/assets/Images";

export const ONBOARDING_SLIDES = [
  {
    id: "rides",
    image: onboardingRides,
    eyebrow: "Rides",
    title: "Island rides, on demand",
    desc: "Book a safe ride across St. Kitts — airport, hotel, beach, or town — in a few taps.",
    icon: IoCarSport,
  },
  {
    id: "tours",
    image: onboardingTours,
    eyebrow: "Tours",
    title: "Tours that feel local",
    desc: "Explore guided experiences across the island, from scenic hills to coastal favorites.",
    icon: IoMap,
  },
  {
    id: "places",
    image: onboardingPlaces,
    eyebrow: "Places",
    title: "Know where to go",
    desc: "Browse must-see spots and visiting locations so every day on island feels planned.",
    icon: IoLocation,
  },
  {
    id: "shop",
    image: onboardingShop,
    eyebrow: "Shop",
    title: "Bring St. Kitts home",
    desc: "Discover local products and crafts — shop what the island is known for.",
    icon: IoBagHandle,
  },
];

export default function AuthOnboardingSwiper({ className = "" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  const currentSlide = ONBOARDING_SLIDES[activeIndex] || ONBOARDING_SLIDES[0];
  const IconComponent = currentSlide.icon;

  return (
    <div
      className={`relative m-2 md:m-2.5 rounded-[18px] md:rounded-[20px] overflow-hidden select-none hidden md:flex md:w-1/2 flex-col justify-between text-white min-h-[460px] md:min-h-[500px] lg:min-h-[520px] self-stretch bg-[#001A2A] shadow-xl ${className}`}
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Swiper
          modules={[Autoplay]}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={true}
          speed={700}
          grabCursor={true}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.realIndex);
          }}
          className="w-full h-full [&_.swiper-wrapper]:h-full [&_.swiper-slide]:h-full"
        >
          {ONBOARDING_SLIDES.map((slide, index) => (
            <SwiperSlide
              key={slide.id}
              className="relative w-full h-full overflow-hidden"
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover pointer-events-none select-none"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,18,30,0.50) 0%, rgba(0,18,30,0.15) 32%, rgba(0,22,36,0.72) 58%, rgba(0,26,42,0.98) 100%)",
        }}
      />

      <div className="relative z-10 px-4 sm:px-5 md:px-5 py-4 sm:py-5 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="inline-block transition-transform hover:scale-105 active:scale-95"
            title="Go to CabKn Home"
          >
            <Image
              src={logoBlue}
              alt="CabKn Logo"
              className="h-8 md:h-9 w-auto object-contain filter brightness-0 invert cursor-pointer hover:opacity-90 transition-opacity"
              priority
            />
          </Link>
          <div className="h-5 w-px bg-white/20 hidden sm:block" />
          <span className="hidden sm:inline-block text-white text-xs md:text-sm font-family-semibold tracking-[0.5px] drop-shadow-sm">
            Welcome to St.Kitts
          </span>
        </div>
      </div>

      <div className="relative z-10 px-4 sm:px-5 md:px-5 pb-5 pt-2 flex flex-col justify-end pointer-events-auto">
        <div className="inline-flex items-center self-start px-3 py-1 rounded-full bg-white/[0.16] !border !border-white/[0.22] backdrop-blur-md mb-2 shadow-sm">
          {IconComponent && (
            <IconComponent className="w-3.5 h-3.5 text-white mr-1.5" />
          )}
          <span className="text-[10.5px] font-family-semibold text-white uppercase tracking-[0.8px]">
            {currentSlide.eyebrow}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl lg:text-[25px] font-family-semibold text-white leading-tight tracking-tight mb-1.5 drop-shadow-md">
          {currentSlide.title}
        </h2>
        <p className="text-xs sm:text-[13px] leading-[19px] lg:leading-[20px] text-white/85 font-family-regular max-w-md mb-3.5">
          {currentSlide.desc}
        </p>

        <div
          className="flex items-center gap-1.5"
          role="tablist"
          aria-label="Onboarding slides"
        >
          {ONBOARDING_SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Slide ${i + 1}: ${slide.eyebrow}`}
              onClick={() => swiperRef.current?.slideToLoop(i)}
              className={`h-[6px] rounded-full transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white ${i === activeIndex
                  ? "w-[22px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                  : "w-[6px] bg-white/35 hover:bg-white/60 hover:w-[10px]"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
