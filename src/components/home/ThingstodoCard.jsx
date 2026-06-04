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
      className="testimonial-card2 mt-4 cursor-pointer"
      style={{ height: "auto", width: "95%", marginLeft: "2.5%" }}
    >
      <Card.Body style={{ padding: 0 }} onClick={onClick2}>
        <div className=" position-relative">
          <Slider {...settings}>
            {testimonial?.images?.map((item, index) => (
              <div key={index} style={{ textAlign: "center" }}>
                <img
                  src={item}
                  alt={`${testimonial.title}-${index}`}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover", // Ensure the image covers the card nicely
                    borderRadius: "5px",
                  }}
                />
              </div>
            ))}
          </Slider>
          <div className="category font-medium">
            {testimonial?.category?.name}
          </div>
        </div>
        <div style={{ padding: 15 }}>
          <p className="font-medium text-sm text-[#000]  truncate-text mt-0 ">{testimonial.title}</p>
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
            className="CardDes font-Regular mt-1 truncate-text"
            style={{ fontSize: 12 }}
          >
            {testimonial.about}
          </p>

          <div className="flex cursor-pointer items-center gap-2">
            {testimonial?.avgRating > 0 && (
              <FaStar className="starDivHome" />
            )}
            <h1 className="font-medium mt-1 text-xl text-[#767e94] " style={{ fontSize: 14 }}>
              ({testimonial?.totalReviews || 0}) Reviews
            </h1>
          </div>

          <Button
            style={{ width: isTour ? "100%" : "60%" }}
            onClick={onClick}
            className="btnHome"
          >
            {btnTitle || "Book a Ride"}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ThingstodoCard;
