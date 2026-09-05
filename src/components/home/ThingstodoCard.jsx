/* eslint-disable no-unused-vars */
"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { FaStar, FaLocationDot, FaArrowRight } from "react-icons/fa6";

function ThingstodoCard({ testimonial, onClick, onClick2, btnTitle, isTour, onAddToCart }) {
  const images = Array.isArray(testimonial?.images)
    ? testimonial.images
    : typeof testimonial?.images === "string"
      ? [testimonial.images]
      : [];

  const displayImages =
    images.length > 0
      ? images
      : [
          "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",
        ];

  const price = Number(
    testimonial?.location_price ||
      testimonial?.price ||
      testimonial?.price_per_adult ||
      0
  );

  const rating = Number(testimonial?.avgRating || 5.0).toFixed(1);
  const reviewsCount = testimonial?.totalReviews || 0;
  const categoryName = testimonial?.category?.name || "Popular Place";

  return (
    <div
      onClick={onClick2}
      className="!w-full !h-full !flex !flex-col !bg-white !rounded-2xl !overflow-hidden !border !border-slate-200/90 !shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:!shadow-[0_12px_30px_rgba(0,74,112,0.12)] hover:!-translate-y-1.5 !transition-all !duration-300 !cursor-pointer !group !select-none !isolate"
    >
      {/* 1. Compact Image Header */}
      <div
        className="!relative !h-[145px] sm:!h-[155px] !w-full !overflow-hidden !bg-slate-100 !shrink-0"
        onClick={(e) => {
          if (
            e.target.closest(".swiper-pagination") ||
            e.target.closest(".swiper-pagination-bullet")
          ) {
            e.stopPropagation();
          }
        }}
      >
        <Swiper
          modules={[Pagination]}
          nested={true}
          observer={true}
          observeParents={true}
          pagination={{
            clickable: true,
            dynamicBullets: displayImages.length > 3,
          }}
          loop={displayImages.length > 1}
          className="!w-full !h-full thingstodo-swiper !overflow-hidden"
        >
          {displayImages.map((item, index) => (
            <SwiperSlide
              key={index}
              className="!w-full !h-full !overflow-hidden !bg-slate-100 !relative"
            >
              <img
                src={typeof item === "string" ? item : item?.url || item?.image}
                alt={`${testimonial?.title || "Place"}-${index}`}
                className="!w-full !h-full !object-cover group-hover:!scale-105 !transition-transform !duration-500 !select-none !block !pointer-events-none"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Subtle Gradient */}
        <div className="!absolute !inset-0 !bg-gradient-to-t !from-black/55 !via-transparent !to-black/15 !pointer-events-none !z-10" />

        {/* Category Pill */}
        <div className="!absolute !top-2.5 !left-2.5 !z-20 !pointer-events-none">
          <span className="!px-2.5 !py-1 !rounded-full !text-[10.5px] font-family-semibold !font-semibold !text-white !uppercase !tracking-wider !bg-[#004a70]/90 !backdrop-blur-md !shadow-sm !border !border-white/15">
            {categoryName}
          </span>
        </div>

        {/* Rating Pill */}
        <div className="!absolute !top-2.5 !right-2.5 !flex !items-center !gap-1 !px-2.5 !py-1 !rounded-full !bg-black/50 !backdrop-blur-md !text-white !text-xs font-family-semibold !font-semibold !shadow-sm !z-20 !border !border-white/10 !pointer-events-none">
          <FaStar className="!text-amber-400 !text-[11px]" />
          <span>{rating}</span>
          <span className="!text-white/70 !text-[10px]">
            ({reviewsCount})
          </span>
        </div>
      </div>

      {/* 2. Tight Compact Content Body */}
      <div className="!px-2.5 !pt-2.5 !pb-2.5 !flex !flex-col !gap-1.5">
        <div className="!space-y-0.5">
          {/* Title */}
          <h3 className="!text-[13.5px] sm:!text-[14px] font-family-semibold !font-bold !text-slate-900 group-hover:!text-[#004a70] !transition-colors !line-clamp-1 !m-0 !leading-snug">
            {testimonial?.title}
          </h3>

          {/* Location Address */}
          <div className="!flex !items-center !gap-1.5 !text-[11px] !text-slate-500 font-family-medium !font-medium !m-0 !min-w-0">
            <FaLocationDot className="!text-amber-500 !text-[10px] !shrink-0" />
            <p className="!m-0 !truncate !text-slate-500 !text-[11px] font-family-regular !font-normal">
              {testimonial?.address || "St. Kitts & Nevis"}
            </p>
          </div>
        </div>

        {/* 3. Bottom Strip: Price + Button */}
        <div className="!pt-1.5 !border-t !border-slate-100 !flex !items-center !justify-between">
          <div>
            <span className="!text-[10px] !text-slate-400 !block font-family-medium !font-medium !leading-none !mb-0.5">
              From
            </span>
            <span className="!text-[14px] font-family-semibold !font-bold !text-[#004a70]">
              ${price > 0 ? price.toFixed(0) : "135"}{" "}
              <span className="!text-[10px] font-family-regular !font-normal !text-slate-400">
                XCD
              </span>
            </span>
          </div>

          <div className="!flex !items-center !gap-1.5">
            {onAddToCart && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart();
                }}
                title="Add to cart"
                className="!w-7 !h-7 !rounded-lg !bg-sky-50 hover:!bg-sky-100 !text-[#004a70] !flex !items-center !justify-center !transition-all !border !border-sky-200/70 !cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
              }}
              className="!px-3 !py-1.5 !rounded-xl !bg-[#004a70] hover:!bg-[#003855] !text-white !text-[11px] font-family-semibold !font-semibold !transition-all !shadow-sm hover:!shadow-md !flex !items-center !gap-1 !cursor-pointer !border-none"
            >
              <span>{btnTitle || "Book Now"}</span>
              <FaArrowRight size={9} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThingstodoCard;
