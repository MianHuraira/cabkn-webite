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
      className="testimonial-card2 mt-2 cursor-pointer w-full group overflow-hidden border border-slate-100 hover:border-brand-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(0,74,112,0.12)] transition-all duration-400 hover:-translate-y-2 rounded-2xl bg-white flex flex-col"
      style={{ height: "100%", borderRadius: "20px" }}
    >
      <Card.Body style={{ padding: 0, display: "flex", flexDirection: "column", height: "100%" }} onClick={onClick2}>
        <div className="position-relative overflow-hidden rounded-t-2xl flex-shrink-0">
          <Slider {...settings}>
            {testimonial?.images?.map((item, index) => (
              <div key={index} style={{ textAlign: "center" }} className="overflow-hidden">
                <img
                  src={item}
                  alt={`${testimonial.title}-${index}`}
                  className="w-full h-[180px] object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            ))}
          </Slider>
          <div className="category font-['Inter-SemiBold'] text-xs px-3 py-1.5 bg-white/90 backdrop-blur-sm text-brand-700 rounded-full shadow-sm absolute top-3 left-3 w-fit">
            {testimonial?.category?.name}
          </div>
        </div>
        <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <div className="flex items-start justify-between gap-3 mt-0">
            <p className="font-['Inter-SemiBold'] text-base text-slate-800 m-0 flex-1 leading-tight line-clamp-2" style={{ wordBreak: "break-word" }}>
              {testimonial.title}
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer bg-amber-50 px-2 py-1 rounded-full">
              {testimonial?.avgRating > 0 && (
                <FaStar className="starDivHome text-amber-500" />
              )}
              <span className="font-['Inter-SemiBold'] text-xs text-slate-700">
                {testimonial?.avgRating > 0 ? Number(testimonial?.avgRating).toFixed(2) : 0} ({testimonial?.totalReviews || 0})
              </span>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-slate-600">
            <FaLocationDot className="text-brand-600 flex-shrink-0" />
            <p
              className="font-['Inter-Medium'] text-sm m-0 line-clamp-1"
              style={{ fontSize: 14 }}
            >
              {testimonial.address}
            </p>
          </div>
          {testimonial?.category?.name == "Upcoming Events" ? (
            <>
              {testimonial.start_date && (
                <>
                  <div className="mt-2 flex items-center gap-2 text-slate-600">
                    <MdDateRange className="text-brand-600 flex-shrink-0" />
                    <p
                      className="font-['Inter-Medium'] text-sm m-0"
                      style={{ fontSize: 14 }}
                    >
                      {moment(testimonial.start_date).format(
                        "dddd, MMMM Do, YYYY"
                      )}
                    </p>
                  </div>

                  <div className="mt-1.5 flex items-center gap-2 text-slate-600">
                    <IoMdTime className="text-brand-600 flex-shrink-0" />
                    <p
                      className="font-['Inter-Medium'] text-sm m-0"
                      style={{ fontSize: 14 }}
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
            className="CardDes font-['Inter-Regular'] mt-3 text-slate-500 flex-grow"
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minHeight: "39px",
            }}
          >
            {testimonial.about}
          </p>

          <div className="mt-auto pt-3">
            <div
              onClick={onClick}
              className="inline-flex items-center gap-2 text-brand-700 font-['Inter-SemiBold'] text-sm cursor-pointer group w-fit px-4 py-2.5 bg-brand-50 hover:bg-brand-100 rounded-full transition-all duration-300"
            >
              <span>
                {btnTitle || "Book a Ride"}
              </span>
              <FiArrowRight className="text-brand-700 text-base transition-all duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ThingstodoCard;
