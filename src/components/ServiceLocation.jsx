/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
"use client";
import React, { useEffect, useRef, useState } from "react";
import CustomButton from "./CustomButton";
import { Button, Modal, Spinner } from "react-bootstrap";
import { FaLocationDot } from "react-icons/fa6";
import mapboxgl from "mapbox-gl";
import moment from "moment";
import { Flex, message, Rate, Skeleton } from "antd";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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

  const [activeImage, setActiveImage] = useState("");

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
        setRatingLoading(false);
      });
  };

  const getSubCatData = async () => {
    try {
      const response = await getData(`servicesubcat/details/${id}`, header3);
      setSubcatData(response?.category);
      setImageDAta(response?.category?.images[0]);
      if (response?.category?.images?.length > 0) {
        setActiveImage(response.category.images[0]);
      }

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

  const totalReviews = ratingLength || ratingData?.length || 0;
  const averageRating = ratingData?.length > 0
    ? (ratingData.reduce((acc, curr) => acc + Number(curr.rating || 0), 0) / ratingData.length).toFixed(1)
    : "4.8";

  return (
    <div className={`min-h-screen bg-slate-50/50 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      {/* ===== HERO BANNER ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 !pt-28 !pb-28">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }} />
        
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: "12s" }} />
        
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-family-medium !mb-4">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
            <span className="text-slate-500">/</span>
            <Link href="/serviceLocations" className="text-slate-400 hover:text-white transition-colors">Shop</Link>
            <span className="text-slate-500">/</span>
            <span className="text-slate-200">Product Detail</span>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-white text-3xl font-family-bold tracking-tight !m-0 leading-tight">
                  {SubcatData?.name || "Product Detail"}
                </h1>
                <p className="text-slate-400 text-sm !mt-1 !m-0 font-family-regular">
                  Explore full features and verified rider details
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTENT LAYOUT ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 !-mt-12 !pb-24">
        
        {/* Main Details Frame */}
        <div className={`bg-white/95 backdrop-blur-xl rounded-3xl !border !border-slate-100 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)] ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "150ms" }}>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            
            {/* Left Frame: Modern Image Gallery (6 Cols) */}
            <div className="lg:col-span-6 p-4 md:p-6 bg-slate-50/50 flex flex-col gap-4">
              <div className="relative aspect-video lg:aspect-[4/3] w-full rounded-2xl overflow-hidden !border !border-slate-150/60 bg-slate-100 shadow-sm">
                <img
                  src={activeImage || SubcatData?.images?.[0]}
                  alt={SubcatData?.name}
                  className="w-full h-full object-cover transition-all duration-350"
                />
              </div>
              {SubcatData?.images?.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-hide select-none" style={{ WebkitOverflowScrolling: "touch" }}>
                  {SubcatData.images.map((item, index) => {
                    const isActive = activeImage === item;
                    return (
                      <div
                        key={index}
                        onClick={() => setActiveImage(item)}
                        className={`w-20 h-16 rounded-xl overflow-hidden cursor-pointer shrink-0 border-2 transition-all duration-200 ${
                          isActive ? "border-brand-900 scale-95 shadow-sm" : "border-transparent hover:border-slate-300"
                        }`}
                      >
                        <img src={item} alt="" className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Frame: Details Panel (6 Cols) */}
            <div className="lg:col-span-6 p-6 md:p-8 flex flex-col">
              
              {/* Header Info */}
              <div className="flex justify-between items-start gap-4 !mb-6">
                <div>
                  <h2 className="text-xl font-family-bold text-slate-900 capitalize !m-0 leading-tight">
                    {SubcatData?.name}
                  </h2>
                  <div className="flex items-center gap-1.5 !mt-2">
                    <FaLocationDot className="text-brand-650 shrink-0" size={13} />
                    <span className="text-xs text-slate-500 font-family-medium">{SubcatData?.address}</span>
                  </div>
                </div>
                
                <div className="hidden lg:block shrink-0">
                  <CustomButton
                    onClick={HandleClick}
                    variant="primary"
                    size="md"
                    className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-family-semibold rounded-full shadow-md transition-all border-none"
                  >
                    Buy Product
                  </CustomButton>
                </div>
              </div>

              {/* Description */}
              <div className="!mb-5">
                <h3 className="text-xs font-family-bold text-slate-700 uppercase tracking-wider !mb-1.5">
                  About Location
                </h3>
                <p className="text-xs text-slate-500 font-family-regular leading-relaxed !m-0">
                  {SubcatData?.about}
                </p>
              </div>

              {/* Dynamic Options Stack */}
              <div className="space-y-4 !mb-6">
                
                {/* Colors */}
                {SubcatData?.color?.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-family-bold text-slate-500 uppercase tracking-wider !mb-2">Colors</h4>
                    <div className="flex gap-2.5">
                      {SubcatData?.color?.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => handleColor(item)}
                          className={`w-7 h-7 rounded-full cursor-pointer border-2 transition-all duration-200 ${
                            ProductColor === item ? "border-brand-900 scale-90 ring-2 ring-brand-900/10" : "border-transparent hover:scale-105"
                          }`}
                          style={{ backgroundColor: item }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity counter */}
                <div>
                  <h4 className="text-[11px] font-family-bold text-slate-500 uppercase tracking-wider !mb-2">Quantity</h4>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decrement}
                      className="w-8 h-8 rounded-full border border-slate-200 hover:border-brand-600 bg-white flex items-center justify-center cursor-pointer transition-colors text-slate-600"
                    >
                      -
                    </button>
                    <span className="text-sm font-family-semibold text-slate-800 min-w-6 text-center">{incDec}</span>
                    <button
                      onClick={increment}
                      className="w-8 h-8 rounded-full border border-slate-200 hover:border-brand-600 bg-white flex items-center justify-center cursor-pointer transition-colors text-slate-600"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Sizes pills */}
                {SubcatData?.size?.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-family-bold text-slate-500 uppercase tracking-wider !mb-2">Available Size</h4>
                    <div className="flex gap-2 flex-wrap">
                      {SubcatData?.size?.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleSize(item)}
                          className={`px-4 py-1.5 rounded-full font-family-medium text-xs transition-colors cursor-pointer border ${
                            Size === item
                              ? "bg-brand-900 border-brand-900 text-white font-family-semibold"
                              : "bg-white border-slate-200 text-slate-600 hover:border-brand-600"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Total Price Widget */}
              <div className="p-4 bg-brand-50/30 !border !border-brand-100/60 rounded-2xl !mt-auto">
                <span className="text-[10px] text-slate-400 font-family-bold uppercase tracking-wider block !mb-1">Estimated Cost</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-family-extrabold text-brand-950">
                    {`${(SubcatData?.location_price * incDec)?.toFixed(2)} XCD`}
                  </span>
                  <span className="text-xs font-family-medium text-slate-450">
                    {`~ $${((SubcatData?.location_price * incDec) / 2.7)?.toFixed(2)} USD`}
                  </span>
                </div>
              </div>

              {/* Map block */}
              <div
                id="map-container"
                ref={mapContainerRef}
                className="w-full h-36 rounded-2xl !border !border-slate-100 !mt-5 overflow-hidden"
              />

              {/* Mobile Buy Trigger */}
              <div className="block lg:hidden !mt-5">
                <CustomButton
                  onClick={HandleClick}
                  variant="primary"
                  size="md"
                  className="w-full h-12 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-family-semibold rounded-full shadow-lg shadow-brand-600/10 border-none"
                >
                  Buy Product
                </CustomButton>
              </div>

            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-3xl !border !border-slate-100 !mt-6 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center !mb-6">
            <h2 className="text-base font-family-bold text-slate-900 !m-0">Rider Reviews</h2>
            <CustomButton
              onClick={handleShow}
              variant="primary"
              size="sm"
              className="px-5 py-2 rounded-full font-family-semibold text-xs border-none"
            >
              Write Review
            </CustomButton>
          </div>

          {/* Rating Breakdown Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 bg-slate-50/50 rounded-2xl !border !border-slate-100 !mb-6">
            <div className="md:col-span-4 text-center md:border-r md:border-slate-200/60 py-2">
              <h3 className="text-4xl font-family-extrabold text-brand-950 !m-0 leading-none">{averageRating}</h3>
              <div className="flex justify-center my-2">
                <Rate allowHalf disabled value={parseFloat(averageRating)} style={{ fontSize: 15, color: '#004a70' }} />
              </div>
              <p className="text-xs text-slate-400 font-family-medium !m-0">Based on {totalReviews} reviews</p>
            </div>
            
            <div className="md:col-span-8 space-y-1.5 max-w-md mx-auto md:mx-0 w-full">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingData.filter(r => Math.round(r.rating) === stars).length;
                const percentage = ratingData.length > 0 ? (count / ratingData.length) * 100 : (stars === 5 ? 85 : (stars === 4 ? 12 : 3));
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-3 text-slate-500 font-family-semibold">{stars}</span>
                    <span className="text-brand-900 text-[10px]">★</span>
                    <div className="flex-grow h-2 bg-slate-200/70 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-900 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="w-8 text-right text-slate-400 font-family-medium">{percentage.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {isLoading ? (
            <Skeleton active />
          ) : (
            <div ref={reviewSectionRef}>
              {ratingData?.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ratingData?.map((review, index) => {
                      const isLastAndOdd = index === ratingData.length - 1 && ratingData.length % 2 !== 0;
                      return (
                        <div
                          key={review?._id}
                          className={`relative p-4 bg-slate-50/45 !border !border-slate-100/80 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md transition-all duration-200 ${
                            isLastAndOdd ? "col-span-1 md:col-span-2" : "col-span-1"
                          }`}
                        >
                          <div className="flex justify-between items-center gap-3">
                            <div className="flex items-center gap-3">
                              {review?.user?.image ? (
                                <img
                                  src={review?.user?.image}
                                  alt={review?.user?.name}
                                  className="w-10 h-10 rounded-full object-cover !border !border-white shadow-sm shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-650 font-family-semibold text-xs flex items-center justify-center shrink-0">
                                  {review?.user?.name?.[0]?.toUpperCase() || "?"}
                                </div>
                              )}
                              <div>
                                <h4 className="font-family-semibold text-xs text-slate-800 !m-0">{review?.user?.name}</h4>
                                <span className="text-[10px] text-slate-400 block !mt-0.5">{moment(review?.createdAt).format("MMM DD, YYYY")}</span>
                              </div>
                            </div>
                            <Rate
                              className="starDiv"
                              allowHalf
                              disabled
                              defaultValue={review?.rating}
                              style={{ fontSize: 12, color: '#004a70' }}
                            />
                          </div>
                          
                          <div className="!mt-3 p-3 bg-white rounded-xl !border !border-slate-100/60 text-xs text-slate-600 font-family-medium leading-relaxed">
                            {review.review}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {ratingLength > 0 && ratingData?.length < ratingLength && (
                    <div className="flex justify-center !mt-6">
                      <button
                        disabled={pagiLoading}
                        onClick={getRatingData}
                        className="px-6 py-2 bg-slate-900 hover:bg-black text-white font-family-semibold text-xs rounded-full shadow-md transition-colors border-none cursor-pointer"
                      >
                        {pagiLoading ? <Spinner size="sm" style={{ color: "#fff" }} /> : "See More"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 bg-slate-50/50 !border !border-slate-100 rounded-2xl text-center">
                  <p className="text-xs text-slate-400 font-family-medium !m-0">No reviews submitted yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Modal centered backdrop="static" show={show} onHide={handleClose} style={{ borderRadius: 20, overflow: "hidden" }}>
        <Modal.Header closeButton className="!border-b !border-slate-100 !px-6 !py-4">
          <Modal.Title className="font-family-bold text-base text-slate-800">Leave a Review</Modal.Title>
        </Modal.Header>
        <Modal.Body className="!px-6 !py-5">
          <Formik
            initialValues={{
              comment: "",
              rating: value,
            }}
            validationSchema={validationSchema}
            onSubmit={(values, actions) => handleSubmit(values, actions)}
          >
            {({ setFieldValue, handleChange, handleBlur, values, watch }) => (
              <Form className="space-y-4">
                
                {/* Rating selection */}
                <div>
                  <label htmlFor="rating" className="text-xs font-family-semibold text-slate-700 block !mb-1.5">
                    Rating Score
                  </label>
                  <Flex gap="middle" vertical>
                    <Rate
                      onChange={(val) => {
                        setValue(val);
                        setFieldValue("rating", val);
                      }}
                      value={value}
                      style={{ fontSize: 24, color: '#004a70' }}
                    />
                  </Flex>
                  <ErrorMessage
                    name="rating"
                    component="div"
                    className="text-xs text-rose-500 !mt-1.5 font-family-medium"
                  />
                </div>

                {/* Comment area */}
                <div>
                  <label htmlFor="comment" className="text-xs font-family-semibold text-slate-700 block !mb-1.5">
                    Your Feedback
                  </label>
                  <Field
                    as="textarea"
                    rows="4"
                    placeholder="Tell us about your experience..."
                    id="comment"
                    name="comment"
                    className="w-full px-4 py-3 bg-slate-50/50 !border-2 !border-slate-100 rounded-xl text-sm font-family-medium text-slate-900 focus:bg-white focus:!border-brand-600 outline-none transition-all duration-200"
                    onChange={handleChange}
                  />
                  <ErrorMessage
                    name="comment"
                    component="div"
                    className="text-xs text-rose-500 !mt-1.5 font-family-medium"
                  />
                </div>

                {/* CTA Submit */}
                <div className="!pt-2">
                  <CustomButton
                    disabled={ratingLoading}
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-family-semibold rounded-full shadow-lg shadow-brand-600/10 border-none hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                  >
                    {ratingLoading ? <Spinner size="sm" /> : <>Submit Review</>}
                  </CustomButton>
                </div>

              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </div>
  );
}
