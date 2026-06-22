/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
"use client";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { Container, Modal, Spinner } from "react-bootstrap";
import { FaLocationDot, FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { HiOutlineCalendarDays, HiOutlineClock, HiOutlineMapPin, HiOutlineCheckCircle, HiOutlineStar, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import Slider from "react-slick";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import moment from "moment";
import { message, Skeleton } from "antd";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Rate } from "antd";
import ApiFile from "./ApiFunction/ApiFile";
import toast from "react-hot-toast";
import { FiArrowRight } from "react-icons/fi";
import CustomButton from "@/components/CustomButton";
import EmptyState from "@/components/EmptyState";

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

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const contentRef = useRef(null);
  const [contentInView, setContentInView] = useState(false);
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setContentInView(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (SubcatData?.lat || SubcatData?.lng) {
      marker(SubcatData);
    }
  }, [SubcatData]);

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

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: start,
      zoom: 12,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      map.resize();
    });

    setTimeout(() => {
      map.resize();
    }, 100);

    setTimeout(() => {
      map.resize();
    }, 500);
  };

  useEffect(() => {
    const handleResize = () => {
      mapRef.current?.resize();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
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
    <div className={mounted ? "animate-fade-in" : "opacity-0"} style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Blue Gradient Header - matching other pages pattern */}
      <div className={`bg-gradient-to-br from-brand-800 to-brand-950 ${mounted ? "animate-fade-in-down" : "opacity-0"}`} style={{ padding: "28px 0 44px", animationDelay: "50ms" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div className="font-family-regular" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8 }}>
            Home / Popular Places / {SubcatData?.title || "Detail"}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <h1 className="font-family-bold" style={{ color: "#fff", fontSize: "clamp(22px, 4vw, 28px)", margin: 0, letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: 10 }}>
              <FaLocationDot size={22} />
              {SubcatData?.title || "Detail"}
            </h1>
            {SubcatData?.avgRating > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "6px 14px 6px 10px" }}>
                <FaStar size={14} color="#f59e0b" />
                <span className="font-family-medium" style={{ color: "#fff", fontSize: 14 }}>{SubcatData?.avgRating?.toFixed(1)} ({SubcatData?.totalReviews})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full px-3 sm:px-4 md:px-6" style={{ marginTop: "-24px", paddingBottom: 48, maxWidth: 1200, marginLeft: "auto", marginRight: "auto" }}>
        {/* Hero Gallery Section */}
        <div className={`relative rounded-2xl overflow-hidden bg-brand-600 shadow-xl reveal ${mounted ? "visible" : ""}`} style={{ transitionDelay: "150ms" }}>
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

            {/* Hero Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-6 md:p-10">
              {SubcatData?.category?.name && (
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-family-medium px-3 py-1 rounded-full mb-3 border border-white/10">
                  {SubcatData?.category?.name}
                </span>
              )}
              <h1 className="text-white font-family-bold text-2xl md:text-3xl lg:text-4xl max-w-3xl leading-tight m-0">
                {SubcatData?.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-white/80">
                  <FaLocationDot className="text-white/60 text-xs" />
                  <span className="text-sm font-family-regular">{SubcatData?.address}</span>
                </div>
                {SubcatData?.avgRating > 0 && (
                  <div className="flex items-center gap-1.5 text-white/80">
                    <FaStar className="text-amber-400 text-xs" />
                    <span className="text-sm font-family-medium">{SubcatData?.avgRating?.toFixed(1)}</span>
                    <span className="text-sm font-family-regular text-white/60">({SubcatData?.totalReviews} Reviews)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnail Navigation */}
          {SubcatData?.images?.length > 1 && (
            <div className="absolute bottom-4 right-6 z-20 hidden md:flex gap-2">
              {SubcatData?.images?.map((item, index) => (
                <button
                  key={index}
                  onClick={() => sliderRef1.current?.slickGoTo(index)}
                  className="w-12 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0"
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

        {/* Content Grid */}
        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Events */}
            {SubcatData?.category?.name == "Upcoming Events" && SubcatData.start_date && (
              <div className={`bg-gradient-to-r from-brand-600/5 to-brand-500/5 rounded-xl p-4 sm:p-5 border border-brand-600/10 reveal ${contentInView ? "visible" : ""}`} style={{ transitionDelay: "50ms" }}>
                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-600/10 flex items-center justify-center flex-shrink-0">
                      <HiOutlineCalendarDays className="text-brand-600 text-lg" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-brand-600/60 font-family-regular uppercase tracking-wide">Date</p>
                      <p className="text-sm font-family-medium text-brand-600 truncate">
                        {moment(SubcatData.start_date).format("dddd, MMMM Do, YYYY")}
                      </p>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-brand-600/10 hidden sm:block flex-shrink-0" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-600/10 flex items-center justify-center flex-shrink-0">
                      <HiOutlineClock className="text-brand-600 text-lg" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-brand-600/60 font-family-regular uppercase tracking-wide">Time</p>
                      <p className="text-sm font-family-medium text-brand-600">
                        {moment(SubcatData.start_time, "HH:mm").format("hh:mm A")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule */}
            {Schedule?.length > 0 && (
              <div className={`reveal ${contentInView ? "visible" : ""}`} style={{ transitionDelay: "100ms" }}>
                <h3 className="text-lg font-family-bold text-gray-900 mb-4 flex items-center gap-2">
                  <HiOutlineCalendarDays className="text-brand-600" />
                  Schedule
                </h3>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {Schedule?.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between gap-2 px-4 sm:px-5 py-3.5 ${index !== Schedule.length - 1 ? "border-b border-gray-50" : ""
                        } hover:bg-brand-600/[0.02] transition-colors`}
                    >
                      <span className="font-family-medium text-gray-800 text-sm truncate">{item?.slot_day}</span>
                      <span className="font-family-regular text-gray-500 text-sm whitespace-nowrap flex-shrink-0">
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
            <div className={`reveal ${contentInView ? "visible" : ""}`} style={{ transitionDelay: "150ms" }}>
              <h3 className="text-lg font-family-bold text-gray-900 mb-3">Description</h3>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-gray-600 font-family-regular leading-relaxed text-[15px]">
                  {SubcatData?.about}
                </p>
              </div>
            </div>

            {/* Highlights */}
            {SubcatData?.heighlights?.length > 0 && (
              <div className={`reveal ${contentInView ? "visible" : ""}`} style={{ transitionDelay: "200ms" }}>
                <h3 className="text-lg font-family-bold text-gray-900 mb-3">Highlights</h3>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex flex-wrap gap-3">
                    {SubcatData?.heighlights.map((item, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600/[0.06] text-brand-800 text-sm font-family-semibold border border-brand-600/10 transition-all duration-200 hover:bg-brand-600/[0.1] hover:scale-[1.02]"
                      >
                        <HiOutlineCheckCircle className="text-brand-600 text-lg flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Map */}
            <div className={`reveal ${contentInView ? "visible" : ""}`} style={{ transitionDelay: "250ms" }}>
              <h3 className="text-lg font-family-bold text-gray-900 mb-3 flex items-center gap-2">
                <HiOutlineMapPin className="text-brand-600" />
                Location
              </h3>
              <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm relative">
                <style>{`
                  #map-container canvas {
                    width: 100% !important;
                    height: 100% !important;
                  }
                `}</style>
                <div
                  id="map-container"
                  className="w-full h-[300px] md:h-[350px] relative overflow-hidden"
                  ref={mapContainerRef}
                />
              </div>
            </div>

            {/* Reviews Section */}
            <section ref={reviewSectionRef} className={`reveal ${contentInView ? "visible" : ""}`} style={{ transitionDelay: "300ms" }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h3 className="text-lg font-family-bold text-gray-900 flex items-center gap-2">
                  <HiOutlineChatBubbleLeftRight className="text-brand-600" />
                  Reviews
                  {ratingLength > 0 && (
                    <span className="text-sm font-family-regular text-gray-400 font-normal">
                      ({ratingLength})
                    </span>
                  )}
                </h3>
                <CustomButton
                  onClick={handleShow}
                  style={{ padding: "10px 20px" }}
                  className="w-full sm:w-auto"
                >
                  Leave a Review
                </CustomButton>
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
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-gray-100 flex-shrink-0">
                                {review?.user?.image ? (
                                  <img
                                    src={review?.user?.image}
                                    alt={review?.user?.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-brand-600/10 flex items-center justify-center">
                                    <span className="text-brand-600 font-family-bold text-sm">
                                      {review?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-family-medium text-gray-900 text-sm truncate">
                                  {review?.user?.name}
                                </h4>
                                <p className="text-xs text-gray-400 font-family-regular mt-0.5">
                                  {moment(review?.createdAt).format("MMM DD, YYYY")}
                                </p>
                              </div>
                            </div>
                            <Rate
                              className="starDiv !text-sm ml-12 sm:ml-0"
                              allowHalf
                              disabled
                              defaultValue={review?.rating}
                            />
                          </div>
                          <div className="mt-3 relative pl-4 border-l-2 border-brand-600/10">
                            <p className="text-gray-600 font-family-regular text-[14px] leading-relaxed">
                              {review.review}
                            </p>
                          </div>
                        </div>
                      ))}
                      {ratingLength > 0 && ratingData?.length < ratingLength && (
                        <div className="flex justify-center pt-2">
                          <CustomButton
                            onClick={getRatingData}
                            loading={pagiLoading}
                            style={{ padding: "10px 24px", background: "white", color: "#004a70", border: "1px solid #004a70" }}
                            className="hover:bg-brand-600/5"
                          >
                            See More Reviews
                          </CustomButton>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-6">
                      <EmptyState
                        title="No Reviews Yet"
                        description="Be the first to share your experience!"
                        showBg={false}
                      />
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className={`space-y-6 reveal ${mounted ? "visible" : ""}`} style={{ transitionDelay: "200ms" }}>
            {/* Book a Ride Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineStar className="text-amber-400 text-lg" />
                <div>
                  <span className="text-lg font-family-bold text-gray-900">
                    {SubcatData?.avgRating > 0 ? SubcatData?.avgRating?.toFixed(1) : "0.0"}
                  </span>
                  <span className="text-sm text-gray-400 font-family-regular ml-1">
                    ({SubcatData?.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <FaLocationDot className="text-brand-600/60 mt-1 text-sm" />
                  <span className="text-sm text-gray-600 font-family-regular leading-snug">
                    {SubcatData?.address}
                  </span>
                </div>
              </div>

              {SubcatData?.category?.name === "Excursion" && (
                <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-700 font-family-medium mb-2">Select Date & Time</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <label className="text-[11px] text-gray-500 font-family-regular">Date</label>
                      <input
                        type="date"
                        onChange={(e) => setTimeSlot({ ...TimeSlot, date: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-brand-600 outline-none font-family-regular"
                      />
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <label className="text-[11px] text-gray-500 font-family-regular">Time</label>
                      <input
                        type="time"
                        onChange={(e) => handleTime({ ...TimeSlot, time: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-brand-600 outline-none font-family-regular"
                      />
                    </div>
                  </div>
                </div>
              )}

              <CustomButton
                onClick={HandleClick}
                style={{ width: "100%", padding: "14px" }}
                endContent={<FiArrowRight className="text-sm" />}
              >
                Book a Ride
              </CustomButton>

              <p className="text-[11px] text-gray-400 font-family-regular text-center mt-3">
                No cancellation fees • Instant confirmation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Book a Ride Button */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "400ms" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <FaStar className="text-amber-400 text-xs" />
            <span className="text-sm font-family-bold text-gray-900">
              {SubcatData?.avgRating > 0 ? SubcatData?.avgRating?.toFixed(1) : "0.0"}
            </span>
            <span className="text-xs text-gray-400 font-family-regular">
              ({SubcatData?.totalReviews || 0})
            </span>
          </div>
        </div>
        <CustomButton
          onClick={HandleClick}
          style={{ width: "100%", padding: "14px" }}
          endContent={<FiArrowRight className="text-sm" />}
        >
          Book a Ride
        </CustomButton>
      </div>

      {/* Review Modal */}
      <Modal centered backdrop="static" show={show} onHide={handleClose} style={{ zIndex: 2000 }} className="!mx-2 sm:!mx-0">
        <div className="p-4 sm:p-6">
          <style>{`
            .review-modal-rate .ant-rate-star {
              margin-right: 8px !important;
              transition: transform 0.15s ease !important;
            }
            .review-modal-rate .ant-rate-star:hover {
              transform: scale(1.2);
            }
            .review-modal-rate .ant-rate-star-first,
            .review-modal-rate .ant-rate-star-second {
              color: #cbd5e1 !important;
            }
            .review-modal-rate .ant-rate-star-full .ant-rate-star-first,
            .review-modal-rate .ant-rate-star-full .ant-rate-star-second {
              color: #fbbf24 !important;
            }
            .review-modal-rate .ant-rate-star-half .ant-rate-star-first {
              color: #fbbf24 !important;
            }
          `}</style>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-family-bold text-gray-900">Leave a Review</h3>
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
                  <label className="block text-sm font-family-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <Rate
                    onChange={(val) => {
                      setValue(val);
                      setFieldValue("rating", val);
                    }}
                    value={value}
                    className="review-modal-rate !text-3xl"
                  />
                  <ErrorMessage
                    name="rating"
                    component="div"
                    className="text-red-500 text-xs mt-1 font-family-regular"
                  />
                </div>
                <div className="mb-5">
                  <label
                    htmlFor="comment"
                    className="block text-sm font-family-medium text-gray-700 mb-2"
                  >
                    Your Review
                  </label>
                  <Field
                    as="textarea"
                    rows="4"
                    placeholder="Share your experience..."
                    id="comment"
                    name="comment"
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100/50 outline-none font-family-regular resize-none transition-all duration-200"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <ErrorMessage
                    name="comment"
                    component="div"
                    className="text-red-500 text-xs mt-1 font-family-regular"
                  />
                </div>

                <CustomButton
                  type="submit"
                  loading={ratingLoading}
                  style={{ width: "100%", padding: "12px" }}
                >
                  Submit Review
                </CustomButton>
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
              <p className="text-sm text-gray-400 font-family-regular">Loading...</p>
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
