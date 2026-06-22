/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
"use client";
import React, { useEffect, useRef, useState } from "react";
import CustomButton from "./CustomButton";
import { Button, Modal, Spinner } from "react-bootstrap";
import { FaLocationDot } from "react-icons/fa6";
import Slider from "react-slick";
import mapboxgl from "mapbox-gl";
import moment from "moment";
import { Flex, message, Rate, Skeleton } from "antd";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { ErrorMessage, Field, Formik, Form } from "formik";
import ApiFile from "./ApiFunction/ApiFile";

export default function ServiceLocation() {
  const { id } = useParams();
  const [value, setValue] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { giveproductRating, getproductRating } = ApiFile;

  const [ratingLoading, setRatingLoading] = useState(false);

  const mapContainerRef = useRef();
  const router = useRouter();
  const mapRef = useRef();
  const { getData, header3, userData, header1, postData } = ApiFunction();
  const [SelectedTime, setSelectedTime] = useState("");
  const [SubcatData, setSubcatData] = useState([]);
  const [Size, setSize] = useState("");
  const [ProductColor, setProductColor] = useState("");
  const [incDec, setincDec] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [ImageDAta, setImageDAta] = useState("");
  const [ratingData, setRatingData] = useState([]);
  const [lastId, setLastId] = useState("");
  const [pagiLoading, setPagiLoading] = useState(false);
  const [ratingLength, setRatingLength] = useState(0);

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

  const handleSize = (item) => {
    setSize(item);
  };

  const handleColor = (item) => {
    setProductColor(item);
  };

  mapboxgl.accessToken =
    "pk.eyJ1IjoibWFybGVncmFudCIsImEiOiJjbTgwdmV0MjkweXB2MnFzNXBjM2x6NThnIn0.3oz3YGaDHiFDh8W5ALk09w";

  const [Parseddata, setParseddata] = useState([]);
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
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
  const increment = () => {
    if (incDec < SubcatData?.quantity) {
      setincDec(incDec + 1);
    } else {
      message.error("Out of Stock");
    }
  };

  const decrement = () => {
    if (incDec > 1) {
      setincDec(incDec - 1);
    }
  };

  useEffect(() => {
    getSubCatData();
  }, []);

  const handleShow = () => {
    if (!userData?.user) {
      toast.error("Please login to leave a review");
      return;
    }
    setShow(true);
  };

  const handleSubmit = (values, { resetForm }) => {
    setRatingLoading(true);
    const api = giveproductRating;
    const apiData = {
      serviceSubCategory: id,
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
        }
        setRatingLoading(false);
      })
      .catch((error) => {
        console.log(error, "error");
        setRatingLoading(false);
      });
  };

  const getSubCatData = async () => {
    try {
      const response = await getData(`servicesubcat/details/${id}`, header3);
      setSubcatData(response?.category);
      setImageDAta(response?.category?.images[0]);

      marker(response?.category);
    } catch (error) {
      console.log(error);
    }
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
    const body = {
      ...SubcatData,
      ProductColor: ProductColor,
      Size: Size,
      incDec: incDec,
      productPrice: SubcatData?.location_price * incDec,
    };
    const encodedData = encodeURIComponent(JSON.stringify(body));
    router.push(`/ride?data=${encodedData}`);
  };

  const getRatingData = () => {
    const api = `${getproductRating}/${id}/${lastId}`;
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
      {/* Blue Gradient Header */}
      <div
        className={mounted ? "animate-fade-in-down" : "opacity-0"}
        style={{
          background: "linear-gradient(135deg, #004a70 0%, #002d47 100%)",
          padding: "28px 0 44px",
          animationDelay: "50ms",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div className="font-family-medium" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8 }}>Home / Product Detail</div>
          <h1 className="font-family-bold" style={{ color: "#fff", fontSize: "clamp(22px, 4vw, 28px)", margin: 0, letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: 10 }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            {SubcatData?.name || "Product Detail"}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "-24px auto 0", padding: "0 16px 48px" }}>
        <div
          className={mounted ? "animate-fade-in-up" : "opacity-0"}
          style={{
            background: "#fff", borderRadius: 14, border: "1px solid #f0f0f0", overflow: "hidden",
            animationDelay: "150ms",
          }}
        >
          {/* Image Slider & Details Grid */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-0">
            {/* Image Slider */}
            <div className="lg:col-span-5">
              <Slider {...settings}>
                {SubcatData?.images?.map((item, index) => (
                  <div key={index}>
                    <img
                      src={item}
                      alt={SubcatData?.name}
                      className="w-full h-72 sm:h-96 lg:h-full object-cover"
                      style={{ minHeight: 320, maxHeight: 480 }}
                    />
                  </div>
                ))}
              </Slider>
            </div>

            {/* Details */}
            <div className="lg:col-span-7" style={{ padding: "clamp(20px, 3vw, 32px)" }}>
              {/* Title & Buy Button Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                <div>
                  <h1 className="font-family-bold" style={{ fontSize: "clamp(18px, 2.5vw, 22px)", color: "#1f2937", margin: 0, textTransform: "capitalize" }}>
                    {SubcatData?.name}
                  </h1>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <FaLocationDot style={{ color: "#004a70", fontSize: 14, flexShrink: 0 }} />
                    <p className="font-family-regular" style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>{SubcatData?.address}</p>
                  </div>
                </div>
                <CustomButton
                  onClick={HandleClick}
                  variant="primary"
                  size="md"
                >
                  Buy Product
                </CustomButton>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 20 }}>
                <h2 className="font-family-semibold" style={{ fontSize: 15, color: "#374151", margin: "0 0 6px" }}>Description</h2>
                <p className="font-family-regular" style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{SubcatData?.about}</p>
              </div>

              {/* Colors */}
              {SubcatData?.color?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p className="font-family-medium" style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>Colors</p>
                  <div style={{ display: "flex", gap: 10 }}>
                    {SubcatData?.color?.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleColor(item)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          backgroundColor: item,
                          cursor: "pointer",
                          border: ProductColor === item ? "3px solid #004a70" : "3px solid transparent",
                          boxShadow: ProductColor === item ? "0 0 0 2px #fff, 0 0 0 4px #004a70" : "none",
                          transition: "all 0.2s",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div style={{ marginBottom: 16 }}>
                <p className="font-family-medium" style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>Quantity</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    onClick={decrement}
                    className="hover:border-brand-700 hover:text-brand-700 font-family-semibold"
                    style={{ width: 36, height: 36, borderRadius: "9999px", border: "1px solid #d1d5db", background: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151", transition: "all 0.2s" }}
                  >-</button>
                    <span className="font-family-semibold" style={{ fontSize: 16, color: "#1f2937", minWidth: 24, textAlign: "center" }}>{incDec}</span>
                  <button
                    onClick={increment}
                    className="hover:border-brand-700 hover:text-brand-700 font-family-semibold"
                    style={{ width: 36, height: 36, borderRadius: "9999px", border: "1px solid #d1d5db", background: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151", transition: "all 0.2s" }}
                  >+</button>
                </div>
              </div>

              {/* Sizes */}
              {SubcatData?.size?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p className="font-family-medium" style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>Size</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {SubcatData?.size?.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSize(item)}
                        className={Size !== item ? "hover:border-brand-700 hover:text-brand-700 font-family-medium" : "font-family-medium"}
                        style={{
                          padding: "6px 18px",
                          borderRadius: "9999px",
                          border: Size === item ? "none" : "1px solid #d1d5db",
                          background: Size === item ? "#004a70" : "#fff",
                          color: Size === item ? "#fff" : "#374151",
                          fontSize: 13,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Price */}
              <div style={{ padding: "14px 18px", background: "#f0f7ff", borderRadius: 12, marginTop: 4 }}>
                <p className="font-family-regular" style={{ fontSize: 13, color: "#6b7280", margin: "0 0 4px" }}>Total Price</p>
                <p className="font-family-bold" style={{ fontSize: 20, color: "#004a70", margin: 0 }}>
                  {`${(SubcatData?.location_price * incDec)?.toFixed(2)} XCD`}
                  <span className="font-family-medium" style={{ fontSize: 14, color: "#9ca3af", marginLeft: 8 }}>
                    {`~ $${((SubcatData?.location_price * incDec) / 2.7)?.toFixed(2)} USD`}
                  </span>
                </p>
              </div>

              {/* Map */}
              <div
                id="map-container"
                ref={mapContainerRef}
                style={{ width: "100%", height: 180, borderRadius: 10, marginTop: 16, overflow: "hidden" }}
              />

              {/* Mobile Buy Button */}
              <div className="block lg:hidden" style={{ marginTop: 16 }}>
                <CustomButton
                  onClick={HandleClick}
                  variant="primary"
                  size="md"
                  className="!w-full !h-12"
                >
                  Buy Product
                </CustomButton>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0f0f0", marginTop: 20, padding: "clamp(20px, 3vw, 28px)" }}>
          <div onClick={handleShow} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: 20 }}>
            <h2 className="font-family-bold" style={{ fontSize: 18, color: "#1f2937", margin: 0 }}>All Reviews</h2>
            <CustomButton
              onClick={handleShow}
              variant="primary"
              size="sm"
            >
              Leave Review
            </CustomButton>
          </div>

          {isLoading ? (
            <Skeleton active />
          ) : (
            <div ref={reviewSectionRef}>
              {ratingData?.length > 0 ? (
                <>
                  {ratingData?.map((review) => (
                    <div
                      key={review?._id}
                      className="hover:shadow-md hover:border-gray-200"
                      style={{
                        background: "#fff",
                        border: "1px solid #f0f0f0",
                        borderRadius: 12,
                        padding: "clamp(14px, 2vw, 20px)",
                        marginBottom: 12,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {review?.user?.image ? (
                            <img
                              src={review?.user?.image}
                              alt={review?.user?.name}
                              style={{ width: 44, height: 44, borderRadius: "9999px", objectFit: "cover", border: "2px solid #f3f4f6" }}
                            />
                          ) : (
                            <div className="font-family-semibold" style={{ width: 44, height: 44, borderRadius: "9999px", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#6b7280" }}>
                              {review?.user?.name?.[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                          <div>
                            <p className="font-family-semibold" style={{ fontSize: 15, color: "#1f2937", margin: 0 }}>{review?.user?.name}</p>
                            <p className="font-family-regular" style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>{moment(review?.createdAt).format("MMM DD, YYYY")}</p>
                          </div>
                        </div>
                        <Rate
                          className="starDiv"
                          allowHalf
                          disabled
                          defaultValue={review?.rating}
                          style={{ fontSize: 14 }}
                        />
                      </div>
                      <p className="font-family-regular" style={{ fontSize: 14, color: "#6b7280", margin: "10px 0 0", lineHeight: 1.6 }}>{review.review}</p>
                    </div>
                  ))}
                  {ratingLength > 0 && ratingData?.length < ratingLength && (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
                      <button
                        disabled={pagiLoading}
                        onClick={getRatingData}
                        className="hover:shadow-lg font-family-semibold"
                        style={{
                          padding: "10px 28px",
                          border: "none",
                          borderRadius: "9999px",
                          background: "#004a70",
                          color: "#fff",
                          fontSize: 14,
                          cursor: pagiLoading ? "not-allowed" : "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {pagiLoading ? <Spinner size="sm" style={{ color: "#fff" }} /> : "See More"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 12, padding: "40px 20px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <p className="font-family-regular" style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>No Reviews found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Modal centered backdrop="static" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title className="font-family-semibold">Leave Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                <div className="mb-3 custom_control">
                  <label
                    htmlFor="rating"
                    className="form-label color-1 font-family-regular text-[1rem] mb-1"
                  >
                    Rating
                  </label>
                  <Flex gap="middle" vertical>
                    <Rate
                      onChange={(val) => {
                        setValue(val);
                        setFieldValue("rating", val);
                      }}
                      value={value}
                    />
                  </Flex>
                  <ErrorMessage
                    name="rating"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="mb-3 custom_control">
                  <label
                    htmlFor="comment"
                    className="form-label color-1 font-family-regular text-[1rem] mb-1"
                  >
                    Enter Your Comment
                  </label>
                  <Field
                    as="textarea"
                    rows="15"
                    type="text"
                    placeholder="Enter Your Comment"
                    id="comment"
                    name="comment"
                    className="form-control borderCus"
                    onChange={handleChange}
                  />
                  <ErrorMessage
                    name="comment"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <Button
                  disabled={ratingLoading}
                  type="submit"
                  className="primbtn w-[100%]"
                >
                  {ratingLoading ? <Spinner size="sm" /> : <>Submit</>}
                </Button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </div>
  );
}
