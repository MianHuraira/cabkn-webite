/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
"use client";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { Container, Modal, Spinner } from "react-bootstrap";
import { FaLocationDot, FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { HiOutlineCalendarDays, HiOutlineClock, HiOutlineMapPin, HiOutlineCheckCircle, HiOutlineStar, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import Slider from "react-slick";
import mapboxgl from "mapbox-gl";
import moment from "moment";
import { message, Skeleton } from "antd";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Rate } from "antd";
import ApiFile from "./ApiFunction/ApiFile";
import toast from "react-hot-toast";
import { FiArrowRight } from "react-icons/fi";

const SampleNextArrow = (props) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-105 transition-all duration-200 border-none cursor-pointer"
    >
      <FaChevronRight className="text-brand-600 text-sm" />
    </button>
  );
};

const SamplePrevArrow = (props) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-105 transition-all duration-200 border-none cursor-pointer"
    >
      <FaChevronLeft className="text-brand-600 text-sm" />
    </button>
  );
};

const PopularAA = () => {
  const { id } = useParams();
  const mapContainerRef = useRef();
  const router = useRouter();
  const mapRef = useRef();
  const { giveRating, getRating } = ApiFile;
  const { getData, header3, postData, header1, userData } = ApiFunction();
  const [TimeSlot, setTimeSlot] = useState("");
  const [SelectedTime, setSelectedTime] = useState("");
  const [SubcatData, setSubcatData] = useState([]);
  const [Schedule, setSchedule] = useState("");

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const urlreview = params.get("review");

  const [ratingLoading, setRatingLoading] = useState(false);

  mapboxgl.accessToken =
    "pk.eyJ1IjoibWFybGVncmFudCIsImEiOiJjbTgwdmV0MjkweXB2MnFzNXBjM2x6NThnIn0.3oz3YGaDHiFDh8W5ALk09w";

  const sliderRef1 = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: false,
    beforeChange: (oldIdx, newIdx) => setCurrentSlide(newIdx),
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    dotsClass: "slick-dots !bottom-5",
    appendDots: (dots) => (
      <div>
        <ul className="!m-0 flex justify-center gap-2">{dots}</ul>
      </div>
    ),
    customPaging: (i) => (
      <div className="w-2 h-2 rounded-full bg-white/60 hover:bg-white transition-all duration-200" />
    ),
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 1,
          arrows: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          arrows: false,
        },
      },
    ],
  };

  const handleTime = (data) => {
    setSelectedTime(data);
  };

  useEffect(() => {
    getSubCatData();
  }, []);

  const getSubCatData = async () => {
    try {
      const response = await getData(`websubcat/details/${id}`, header3);
      const scheduleData = response?.category?.schedule;
      setSchedule(scheduleData ? JSON.parse(scheduleData) : []);
      setSubcatData(response?.category);
      marker(response?.category);
    } catch (error) {
      console.log(error);
    }
  };

  const convertTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    let check = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return check;
  };

  const marker = (data) => {
    if (!data?.lng || !data?.lat) {
      console.error("Invalid coordinates:", data?.lng, data?.lat);
      return;
    }

    const start = [data.lng, data.lat];

    if (mapRef.current) {
      mapRef.current.remove();
    }

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: start,
      zoom: 12,
      attributionControl: false,
    });
  };

  useEffect(() => {
    mapRef.current?.resize();
  }, []);

  const HandleClick = () => {
    if (SubcatData?.category?.name === "Excursion") {
      if (SelectedTime) {
        const data = {
          data: JSON.stringify(SubcatData),
          time: JSON.stringify(SelectedTime),
        };
        const encodedData = encodeURIComponent(JSON.stringify(data));
        router.push(`/ride?data=${encodedData}`);
      } else {
        message.error("Please Select Date and Time");
      }
    } else {
      let data = {
        address: SubcatData.address,
        lat: SubcatData.lat,
        lng: SubcatData.lng,
        _id: SubcatData._id,
        schedule: SubcatData.schedule,
        title: SubcatData.title,
        user: SubcatData.user,
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
    if (!userData?.user) {
      toast.error("Please login to leave a review");
      return;
    }
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
          toast.success(res?.message);
          setRatingData([res?.ratings, ...ratingData]);
          handleClose();
          resetForm();
          setValue(0);
          router.replace(`/popular/${id}`);
        }
        setRatingLoading(false);
      })
      .catch((error) => {
        console.log(error, "error");
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
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
        setPagiLoading(false);
      });
  };
  useEffect(() => {
    getRatingData();
  }, []);
  const reviewSectionRef = useRef(null);

  const scrollToReviews = () => {
    if (reviewSectionRef.current) {
      reviewSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Blue Gradient Header - matching other pages pattern */}
      <div style={{ background: "linear-gradient(135deg, #004a70 0%, #002d47 100%)", padding: "28px 0 44px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8 }}>
            Home / Popular Places / {SubcatData?.title || "Detail"}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <h1 style={{ color: "#fff", fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 700, margin: 0, letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: 10 }}>
              <FaLocationDot size={22} />
              {SubcatData?.title || "Detail"}
            </h1>
            {SubcatData?.avgRating > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "6px 14px 6px 10px" }}>
                <FaStar size={14} color="#f59e0b" />
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{SubcatData?.avgRating?.toFixed(1)} ({SubcatData?.totalReviews})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Container fluid className="customWidth" style={{ marginTop: "-24px", paddingBottom: 48 }}>
        {/* Hero Gallery Section */}
        <div className="relative rounded-2xl overflow-hidden bg-brand-600 shadow-xl">
          <div className="relative">
            <Slider {...settings} ref={sliderRef1}>
              {SubcatData?.images?.map((item, index) => (
                <div key={index}>
                  <div className="relative h-[50vh] md:h-[65vh] w-full">
                    <img
                      src={item}
                      alt={`${SubcatData?.title}-${index}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  </div>
                </div>
              ))}
            </Slider>

            {/* Hero Category Badge */}
            <div className="absolute top-6 left-6 z-10">
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/10">
                {SubcatData?.category?.name}
              </span>
            </div>
          </div>

          {/* Thumbnail Navigation */}
          {SubcatData?.images?.length > 1 && (
            <div className="absolute bottom-4 right-6 z-20 hidden md:flex gap-2">
              {SubcatData?.images?.map((item, index) => (
                <button
                  key={index}
                  onClick={() => sliderRef1.current?.slickGoTo(index)}
                  className="w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0"
                  style={{
                    borderColor: index === currentSlide ? "#fff" : "rgba(255,255,255,0.3)",
                    opacity: index === currentSlide ? 1 : 0.6,
                  }}
                >
                  <img src={item} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Info Bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mt-6">
          <div className="flex flex-wrap items-center gap-4 md:gap-8">
            <div className="flex items-center gap-3">
              <FaLocationDot className="text-brand-600/60 text-base" />
              <span className="text-sm text-gray-600 font-Regular">{SubcatData?.address}</span>
            </div>
            {SubcatData?.avgRating > 0 && (
              <div className="flex items-center gap-1.5" onClick={scrollToReviews} style={{ cursor: "pointer" }}>
                <Rate className="starDiv !text-sm" allowHalf disabled defaultValue={SubcatData?.avgRating} />
                <span className="text-sm text-gray-400 font-Regular">({SubcatData?.totalReviews} Reviews)</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Events */}
            {SubcatData?.category?.name == "Upcoming Events" && SubcatData.start_date && (
              <div className="bg-gradient-to-r from-brand-600/5 to-brand-500/5 rounded-xl p-5 border border-brand-600/10">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-600/10 flex items-center justify-center">
                      <HiOutlineCalendarDays className="text-brand-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-xs text-brand-600/60 font-Regular uppercase tracking-wide">Date</p>
                      <p className="text-sm font-medium text-brand-600">
                        {moment(SubcatData.start_date).format("dddd, MMMM Do, YYYY")}
                      </p>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-brand-600/10 hidden sm:block" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-600/10 flex items-center justify-center">
                      <HiOutlineClock className="text-brand-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-xs text-brand-600/60 font-Regular uppercase tracking-wide">Time</p>
                      <p className="text-sm font-medium text-brand-600">
                        {moment(SubcatData.start_time, "HH:mm").format("hh:mm A")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule */}
            {Schedule?.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <HiOutlineCalendarDays className="text-brand-600" />
                  Schedule
                </h3>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {Schedule?.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between px-5 py-3.5 ${
                        index !== Schedule.length - 1 ? "border-b border-gray-50" : ""
                      } hover:bg-brand-600/[0.02] transition-colors`}
                    >
                      <span className="font-medium text-gray-800 text-sm">{item?.slot_day}</span>
                      <span className="font-Regular text-gray-500 text-sm">
                        {item?.slots[0] != undefined && item.slots[1] != undefined
                          ? `${convertTo12Hour(item?.slots[0])} - ${convertTo12Hour(item?.slots[1])}`
                          : "No Time"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-gray-600 font-Regular leading-relaxed text-[15px]">
                  {SubcatData?.about}
                </p>
              </div>
            </div>

            {/* Highlights */}
            {SubcatData?.heighlights?.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Highlights</h3>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <ul className="space-y-3">
                    {SubcatData?.heighlights.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <HiOutlineCheckCircle className="text-brand-600 text-lg mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 font-Regular text-[15px]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Map */}
            {SubcatData?.lat && SubcatData?.lng && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <HiOutlineMapPin className="text-brand-600" />
                  Location
                </h3>
                <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                  <div
                    id="map-container"
                    className="w-full h-[300px] md:h-[350px]"
                    ref={mapContainerRef}
                  />
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <section ref={reviewSectionRef}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <HiOutlineChatBubbleLeftRight className="text-brand-600" />
                  Reviews
                  {ratingLength > 0 && (
                    <span className="text-sm font-Regular text-gray-400 font-normal">
                      ({ratingLength})
                    </span>
                  )}
                </h3>
                <button
                  onClick={handleShow}
                  className="inline-flex items-center gap-2 bg-brand-600 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-brand-700 transition-all duration-200 border-none cursor-pointer shadow-sm hover:shadow-md"
                >
                  Write a Review
                </button>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <Skeleton.Avatar active size="large" shape="circle" />
                        <div className="flex-1">
                          <Skeleton.Input active size="small" className="!w-32" />
                        </div>
                      </div>
                      <Skeleton active paragraph={{ rows: 2 }} />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {ratingData?.length > 0 ? (
                    <div className="space-y-4">
                      {ratingData?.map((review) => (
                        <div
                          key={review?._id}
                          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-gray-100 flex-shrink-0">
                                {review?.user?.image ? (
                                  <img
                                    src={review?.user?.image}
                                    alt={review?.user?.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-brand-600/10 flex items-center justify-center">
                                    <span className="text-brand-600 font-bold text-sm">
                                      {review?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 text-sm">
                                  {review?.user?.name}
                                </h4>
                                <p className="text-xs text-gray-400 font-Regular mt-0.5">
                                  {moment(review?.createdAt).format("MMM DD, YYYY")}
                                </p>
                              </div>
                            </div>
                            <Rate
                              className="starDiv !text-sm"
                              allowHalf
                              disabled
                              defaultValue={review?.rating}
                            />
                          </div>
                          <div className="mt-3 relative pl-4 border-l-2 border-brand-600/10">
                            <p className="text-gray-600 font-Regular text-[14px] leading-relaxed">
                              {review.review}
                            </p>
                          </div>
                        </div>
                      ))}
                      {ratingLength > 0 && ratingData?.length < ratingLength && (
                        <div className="flex justify-center pt-2">
                          <button
                            disabled={pagiLoading}
                            onClick={getRatingData}
                            className="inline-flex items-center gap-2 text-brand-600 font-medium text-sm px-6 py-2.5 rounded-full border border-brand-600/20 hover:bg-brand-600/5 transition-all duration-200 bg-white cursor-pointer"
                          >
                            {pagiLoading ? <Spinner size="sm" className="!w-4 !h-4" /> : "See More Reviews"}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <HiOutlineChatBubbleLeftRight className="text-4xl text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-400 font-Regular">No reviews yet. Be the first to review!</p>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Book a Ride Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineStar className="text-amber-400 text-lg" />
                <div>
                  <span className="text-lg font-bold text-gray-900">
                    {SubcatData?.avgRating > 0 ? SubcatData?.avgRating?.toFixed(1) : "0.0"}
                  </span>
                  <span className="text-sm text-gray-400 font-Regular ml-1">
                    ({SubcatData?.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <FaLocationDot className="text-brand-600/60 mt-1 text-sm" />
                  <span className="text-sm text-gray-600 font-Regular leading-snug">
                    {SubcatData?.address}
                  </span>
                </div>
              </div>

              {SubcatData?.category?.name === "Excursion" && (
                <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-700 font-medium mb-2">Select Date & Time</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-gray-500 font-Regular">Date</label>
                      <input
                        type="date"
                        onChange={(e) => setTimeSlot({ ...TimeSlot, date: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-brand-600 outline-none font-Regular"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-gray-500 font-Regular">Time</label>
                      <input
                        type="time"
                        onChange={(e) => handleTime({ ...TimeSlot, time: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-brand-600 outline-none font-Regular"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={HandleClick}
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-semibold text-sm px-6 py-3.5 rounded-full hover:bg-brand-700 transition-all duration-200 border-none cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Book a Ride
                <FiArrowRight className="text-sm" />
              </button>

              <p className="text-[11px] text-gray-400 font-Regular text-center mt-3">
                No cancellation fees • Instant confirmation
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Mobile Book a Ride Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <FaStar className="text-amber-400 text-xs" />
            <span className="text-sm font-bold text-gray-900">
              {SubcatData?.avgRating > 0 ? SubcatData?.avgRating?.toFixed(1) : "0.0"}
            </span>
            <span className="text-xs text-gray-400 font-Regular">
              ({SubcatData?.totalReviews || 0})
            </span>
          </div>
        </div>
        <button
          onClick={HandleClick}
          className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-semibold text-sm px-6 py-3.5 rounded-full hover:bg-brand-700 transition-all duration-200 border-none cursor-pointer shadow-md"
        >
          Book a Ride
          <FiArrowRight className="text-sm" />
        </button>
      </div>

      {/* Review Modal */}
      <Modal centered backdrop="static" show={show} onHide={handleClose} style={{ zIndex: 2000 }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center border-none cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
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
            {({ setFieldValue, handleChange, handleBlur, values, watch }) => (
              <Form>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <Rate
                    onChange={(val) => {
                      setValue(val);
                      setFieldValue("rating", val);
                    }}
                    value={value}
                    className="starDiv !text-2xl"
                  />
                  <ErrorMessage
                    name="rating"
                    component="div"
                    className="text-red-500 text-xs mt-1 font-Regular"
                  />
                </div>
                <div className="mb-5">
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your Review
                  </label>
                  <Field
                    as="textarea"
                    rows="5"
                    type="text"
                    placeholder="Share your experience..."
                    id="comment"
                    name="comment"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-brand-600 outline-none font-Regular resize-none transition-colors"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <ErrorMessage
                    name="comment"
                    component="div"
                    className="text-red-500 text-xs mt-1 font-Regular"
                  />
                </div>

                <button
                  disabled={ratingLoading}
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-brand-700 transition-all duration-200 border-none cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ratingLoading ? <Spinner size="sm" /> : "Submit Review"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </Modal>

      {/* Bottom padding for mobile CTA */}
      <div className="h-24 lg:h-0" />
    </div>
  );
};

const PopularPlaces = () => {
  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-[3px] border-brand-600/30 border-t-brand-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-400 font-Regular">Loading...</p>
            </div>
          </div>
        }
      >
        <PopularAA />
      </Suspense>
    </>
  );
};

export default PopularPlaces;
