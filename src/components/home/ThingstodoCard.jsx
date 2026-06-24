import React from "react";
import { Card } from "react-bootstrap";
import Slider from "react-slick";
import Image from "next/image";

function ThingstodoCard({ testimonial, onClick, onClick2, btnTitle, isTour }) {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    arrows: false,
    slidesToScroll: 1,
    centerMode: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // Star Icon SVG (green)
  const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#22c55e" />
    </svg>
  );

  // Location Icon SVG
  const LocationIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z" fill="#334155" />
    </svg>
  );

  // Checkmark Icon SVG
  const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#334155" />
    </svg>
  );

  // Cog Icon SVG
  const CogIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="#334155" />
    </svg>
  );

  return (
    <Card className="mt-2 cursor-pointer w-full group overflow-hidden border border-slate-200 hover:border-brand-200 transition-all duration-400 hover:-translate-y-2 bg-white flex flex-col rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
      <Card.Body className="p-0 flex flex-col h-full" onClick={onClick2}>
        {/* Image Section */}
        <div className="relative overflow-hidden flex-shrink-0 rounded-t-2xl">
          <Slider {...settings}>
            {testimonial?.images?.map((item, index) => (
              <div key={index} className="text-center overflow-hidden">
                <img
                  src={item}
                  alt={`${testimonial.title}-${index}`}
                  className="w-full h-44 object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            ))}
          </Slider>
          
          {/* Rating Badge (Top Right, ON TOP OF IMAGE, like reference!) */}
          {testimonial?.avgRating > 0 && (
            <div className="absolute top-3 right-3 bg-white px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 z-20">
              <StarIcon />
              <span className="font-semibold text-sm text-slate-900">
                {Number(testimonial?.avgRating).toFixed(1)}
              </span>
              <span className="font-normal text-sm text-slate-500">
                ({testimonial?.totalReviews || 0})
              </span>
            </div>
          )}
        </div>
        
        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow gap-3">
          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 m-0 leading-tight line-clamp-2 break-words">
            {testimonial.title}
          </h3>

          {/* Address/Location */}
          <div className="flex items-center gap-1.5">
            <LocationIcon />
            <p className="font-normal text-sm m-0 text-slate-500 line-clamp-1 whitespace-nowrap overflow-hidden text-ellipsis">
              {testimonial.address}
            </p>
          </div>

          {/* Features Row (2x2 grid like reference) */}
          <div className="grid grid-cols-2 gap-2.5 py-2.5 border-y border-slate-200">
            <div className="flex items-center gap-2">
              <CheckIcon />
              <span className="text-sm font-normal text-slate-700">
                From ${testimonial.location_price || 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CogIcon />
              <span className="text-sm font-normal text-slate-700">
                {testimonial?.category?.name}
              </span>
            </div>
          </div>

          {/* Footer with Price & Button */}
          <div className="flex items-center justify-between mt-auto pt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-base font-normal text-slate-500">From</span>
              <span className="text-2xl font-bold text-slate-900">
                ${testimonial.location_price || 0}
              </span>
            </div>
            
            <button
              onClick={onClick}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-slate-100 text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors duration-300"
            >
              {btnTitle || "Book Now"}
            </button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ThingstodoCard;
