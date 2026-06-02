/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Container, Modal, Spinner } from "react-bootstrap";
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
import Staticimg from "../components/assets/Images/noShow.png";
import Image from "next/image";

export default function ServiceLocation() {
  const { id } = useParams();
  const [value, setValue] = useState(0);
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

    // Ensure the marker is added correctly
    // new mapboxgl.Marker({ color: "green" }).setLngLat(start).addTo(mapRef.current);
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
    <>
      <div className="bread">
        <h5 className="medium-font">Home/Detail</h5>
        <h3 className="medium-font">Detail</h3>
      </div>

      <Container
        fluid
        className=" bg-white rounded  shadow-lg p-0 mt-3 customWidth"
      >
        <div className="w-full p-3 sm:p-1 lg:grid lg:grid-cols-12 lg:gap-8 ">
          <div className="col-span-4">
            <Slider {...settings}>
              {SubcatData?.images?.map((item, index) => (
                <div key={index} style={{ textAlign: "center" }}>
                  <img
                    src={item}
                    className="w-full h-96 md:h-[30rem] object-cover rounded-lg"
                  />
                </div>
              ))}
            </Slider>
          </div>

          <div className="col-span-8 flex flex-col h-full mt-4 sm:mt-8">
            <div className="flex justify-between items-center">
              <h5 className="mb-1 CardName capitalize text-Bold">
                {SubcatData?.name}
              </h5>
              <div className="hidden md:block" onClick={HandleClick}>
                <Button className="btnHome">Buy Product</Button>
              </div>
            </div>

            <div className="mt-1 flex  gap-1">
              <FaLocationDot style={{ marginTop: 5 }} />
              <p
                className="font-medium text-lg text-[#767e94] mt-0 "
                style={{ fontSize: 15 }}
              >
                {SubcatData?.address}
              </p>
            </div>

            <h1 className="font-medium mt-1 text-xl " style={{ fontSize: 14 }}>
              {"Description"}
            </h1>

            <p className="CardDes font-Regular mt-1 " style={{ fontSize: 15 }}>
              {SubcatData?.about}
            </p>

            <div className="flex items-center gap-2 ">
              {SubcatData?.color?.map((item, index) => {
                return (
                  <div
                    className={`productColor cursor-pointer border-3 ${
                      ProductColor === item ? "border-[#004a70]" : ""
                    }`}
                    onClick={() => handleColor(item)}
                    style={{
                      backgroundColor: item,
                      borderRadius: "50%",
                      marginTop: 10,
                      marginBottom: 10,
                    }}
                  ></div>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <div
                onClick={decrement}
                className="flex items-center cursor-pointer border w-10 rounded-full justify-center"
              >
                -
              </div>
              {incDec}
              <div
                onClick={increment}
                className="flex items-center cursor-pointer border  w-10 rounded-full justify-center"
              >
                +
              </div>
            </div>

            <div className="flex items-center gap-2">
              {SubcatData?.size?.map((item, index) => {
                return (
                  <div
                    className="sizes cursor-pointer"
                    style={{
                      marginTop: 10,
                      backgroundColor:
                        Size === item ? "#004a70" : "transparent",
                    }}
                    onClick={() => handleSize(item)}
                  >
                    <p
                      className="font-Regular"
                      style={{ color: Size === item ? "#fff" : "#000" }}
                    >
                      {item}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="font-bold mt-2">
              {`Total Price : ${(SubcatData?.location_price * incDec)?.toFixed(
                2
              )} XCD - $${(
                (SubcatData?.location_price * incDec) /
                2.7
              )?.toFixed(2)} USD`}
            </p>

            <div
              id="map-container"
              className="w-full mt-3"
              style={{ height: "20vh" }}
              ref={mapContainerRef}
            />

            {/* {SubcatData?.category?.name === "Excursion" ? (
              <>
                {SubcatData?.timeslots && (
                  <p className="font-Regular mt-2">Select Time Slot</p>
                )}

                <div className="flex gap-2 mb-3 flex-wrap mt-2">
                  {SubcatData?.timeslots?.map((item) => {
                    return (
                      <div
                        className="dateSelection"
                        onClick={() => handleTime(item)}
                        style={{
                          background:
                            SelectedTime === item ? "#004a70" : "#fff",
                          color: SelectedTime === item ? "#fff" : "#000",
                        }}
                      >
                        <h6 className="font-medium">
                          {moment(item, "HH:mm").format("hh:mm A")}
                        </h6>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null} */}

            <div className="block md:hidden" onClick={HandleClick}>
              <Button className="btnHome">Buy Product</Button>
            </div>
          </div>
        </div>

        <section className="mt-3">
          <Container fluid>
            <div
              className="flex items-center justify-between"
              onClick={handleShow}
            >
              <h1 className="font-medium text-xl">All Reviews</h1>
              <Button className="primbtn w-fit">Leave Review</Button>
            </div>
            {isLoading ? (
              <>
                <Skeleton active />
              </>
            ) : (
              <>
                <div onClick={scrollToReviews} className="space-y-4 mt-4 pb-4">
                  {ratingData?.length > 0 ? (
                    <>
                      {ratingData?.map((review) => (
                        <div
                          key={review?._id}
                          className="relative p-3  cursor-pointer border-b-2 border-gray-200"
                        >
                          <div className="flex items-center justify-between space-x-4">
                            <div className="flex items-center gap-2">
                              {review?.user?.image ? (
                                <img
                                  src={review?.user?.image}
                                  alt={review?.user?.name}
                                  className="w-12 h-12 rounded-full object-cover border border-gray-300"
                                />
                              ) : (
                                <Image
                                  src={Staticimg}
                                  alt=""
                                  className="w-12 h-12 rounded-full object-cover border border-gray-300"
                                />
                              )}
                              <div>
                                <h3 className="font-medium text-lg text-gray-900">
                                  {review?.user?.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {moment(review?.createdAt).format(
                                    "MMM DD, YYYY"
                                  )}
                                </p>
                              </div>
                            </div>
                            <div>
                              <Rate
                                className="starDiv"
                                allowHalf
                                disabled
                                defaultValue={review?.rating}
                              />
                            </div>
                          </div>
                          {/* Review Text */}
                          <p className="mt-3 text-gray-700 leading-relaxed">
                            {review.review}
                          </p>
                        </div>
                      ))}
                      {ratingLength > 0 &&
                        ratingData?.length < ratingLength && (
                          <div className="flex justify-center mt-4">
                            <button
                              disabled={pagiLoading}
                              onClick={getRatingData}
                              className="primbtn w-fit"
                            >
                              {pagiLoading ? <Spinner size="sm" /> : "See More"}
                            </button>
                          </div>
                        )}
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="text-center">No Reviews found</div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </Container>
        </section>
      </Container>

      <Modal centered backdrop="static" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Leave Review</Modal.Title>
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
                    className="form-label color-1 regular-font text-[1rem] mb-1"
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
                    className="form-label color-1 regular-font text-[1rem] mb-1"
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
    </>
  );
}
