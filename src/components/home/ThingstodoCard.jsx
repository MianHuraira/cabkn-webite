import React from "react";
import { Card } from "react-bootstrap";
import Slider from "react-slick";
import { Button } from "reactstrap";
import { FaLocationDot } from "react-icons/fa6";
import { MdDateRange } from "react-icons/md";
import { IoMdTime } from "react-icons/io";
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
      className="testimonial-card2 mt-2 cursor-pointer w-full group overflow-hidden border border-gray-100 hover:border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 rounded-2xl"
      style={{ height: "auto", borderRadius: "16px" }}
    >
      <Card.Body style={{ padding: 0 }} onClick={onClick2}>
        <div className="position-relative overflow-hidden rounded-t-2xl">
          <Slider {...settings}>
            {testimonial?.images?.map((item, index) => (
              <div key={index} style={{ textAlign: "center" }} className="overflow-hidden">
                <img
                  src={item}
                  alt={`${testimonial.title}-${index}`}
                  className="w-full h-[200px] object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </Slider>
          <div className="category font-medium">
            {testimonial?.category?.name}
          </div>
        </div>
        <div style={{ padding: "10px 15px" }}>
          <div className="flex items-start justify-between gap-2 mt-0">
            <p className="font-medium text-sm text-[#000] truncate-text m-0 flex-1">{testimonial.title}</p>
            <div className="flex items-center gap-1 flex-shrink-0 cursor-pointer">
              {testimonial?.avgRating > 0 && (
                <FaStar className="starDivHome" />
              )}
              <span className="font-medium text-[12px] text-[#767e94]">
                ({testimonial?.totalReviews || 0}) Reviews
              </span>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-1">
            <FaLocationDot />
            <p
              className="font-medium text-sm text-[#000]  truncate-text mt-0 "
              style={{ fontSize: 14 }}
            >
              {testimonial.address}
            </p>
          </div>
          {testimonial?.category?.name == "Upcoming Events" ? (
            <>
              {testimonial.start_date && (
                <>
                  <div className="mt-1 flex items-center gap-1">
                    <MdDateRange />
                    <p
                      className="font-medium text-sm text-[#767e94]  truncate-text mt-0 "
                      style={{ fontSize: 14 }}
                    >
                      {moment(testimonial.start_date).format(
                        "dddd, MMMM Do, YYYY"
                      )}
                    </p>
                  </div>

                  <div className="mt-1 flex items-center gap-1">
                    <IoMdTime />
                    <p
                      className="font-medium text-sm text-[#767e94]  truncate-text mt-0 "
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
            className="CardDes font-Regular mt-1"
            style={{
              fontSize: 12,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minHeight: "36px",
            }}
          >
            {testimonial.about}
          </p>


          <Button
            style={{ width: isTour ? "100%" : "60%", borderRadius: "9999px" }}
            onClick={onClick}
            className="btnHome rounded-full w-full sm:w-[60%]"
          >
            {btnTitle || "Book a Ride"}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ThingstodoCard;
