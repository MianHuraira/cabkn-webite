import React from "react";
import { Card } from "react-bootstrap";
import Slider from "react-slick";
import { FaLocationDot } from "react-icons/fa6";
import { MdDateRange } from "react-icons/md";
import { IoMdTime } from "react-icons/io";
import { FiArrowRight } from "react-icons/fi";
import moment from "moment";
import { Rate } from "antd";
import { FaStar } from "react-icons/fa";

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

  return (
    <Card
      className="cursor-pointer w-full group overflow-hidden border border-slate-100 hover:border-brand-200 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 rounded-3xl bg-white flex flex-col"
      style={{ height: "100%" }}
    >
      <Card.Body style={{ padding: 0, display: "flex", flexDirection: "column", height: "100%" }} onClick={onClick2}>
        <div className="position-relative overflow-hidden rounded-t-3xl flex-shrink-0">
          <Slider {...settings}>
            {testimonial?.images?.map((item, index) => (
              <div key={index} style={{ textAlign: "center" }} className="overflow-hidden">
                <img
                  src={item}
                  alt={`${testimonial.title}-${index}`}
                  className="w-full h-[200px] object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            ))}
          </Slider>
          <div className="font-['Inter-SemiBold'] text-xs px-4 py-2 bg-white/95 backdrop-blur-md text-brand-700 rounded-full shadow-md absolute top-4 left-4 w-fit">
            {testimonial?.category?.name}
          </div>
        </div>
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <div className="flex items-start justify-between gap-4">
            <p className="font-['Inter-Bold'] text-lg text-slate-900 m-0 flex-1 leading-tight line-clamp-2" style={{ wordBreak: "break-word" }}>
              {testimonial.title}
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0 bg-amber-50 px-3 py-1.5 rounded-full shadow-sm">
              {testimonial?.avgRating > 0 && (
                <FaStar className="text-amber-500" />
              )}
              <span className="font-['Inter-SemiBold'] text-sm text-slate-700">
                {testimonial?.avgRating > 0 ? Number(testimonial?.avgRating).toFixed(1) : 0} ({testimonial?.totalReviews || 0})
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-slate-600">
            <FaLocationDot className="text-brand-600 flex-shrink-0" />
            <p
              className="font-['Inter-Medium'] text-sm m-0 line-clamp-1"
            >
              {testimonial.address}
            </p>
          </div>
          {testimonial?.category?.name == "Upcoming Events" ? (
            <>
              {testimonial.start_date && (
                <>
                  <div className="mt-3 flex items-center gap-2 text-slate-600">
                    <MdDateRange className="text-brand-600 flex-shrink-0" />
                    <p
                      className="font-['Inter-Medium'] text-sm m-0"
                    >
                      {moment(testimonial.start_date).format(
                        "dddd, MMMM Do, YYYY"
                      )}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-slate-600">
                    <IoMdTime className="text-brand-600 flex-shrink-0" />
                    <p
                      className="font-['Inter-Medium'] text-sm m-0"
                    >
                      {moment(testimonial.start_time, "HH:mm").format(
                        "hh:mm A"
                      )}
                    </p>
                  </div>
                </>
              )}
            </>
          ) : null}

          <p
            className="font-['Inter-Regular'] mt-4 text-slate-500 flex-grow"
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minHeight: "44px",
            }}
          >
            {testimonial.about}
          </p>

          <div className="mt-auto pt-4">
            <div
              onClick={onClick}
              className="inline-flex items-center gap-2 text-white font-['Inter-SemiBold'] text-sm cursor-pointer w-full justify-center px-5 py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-brand-500/25"
            >
              <span>
                {btnTitle || "Book a Ride"}
              </span>
              <FiArrowRight className="text-base transition-all duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ThingstodoCard;
