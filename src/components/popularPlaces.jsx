/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
"use client";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { Button, Container, Modal, Spinner } from "react-bootstrap";
import { FaLocationDot } from "react-icons/fa6";
import Slider from "react-slick";
import mapboxgl from "mapbox-gl";
import moment from "moment";
import { message, Skeleton } from "antd";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Rate, Flex } from "antd";
import ApiFile from "./ApiFunction/ApiFile";
import toast from "react-hot-toast";
import Staticimg from "../components/assets/Images/noShow.png";
import Image from "next/image";
import { MdDateRange } from "react-icons/md";
import { IoMdTime } from "react-icons/io";
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

  const [ImageDAta, setImageDAta] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);

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
          slidesToShow: 2,
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
      // console.log('check',scheduleData);
      setSchedule(scheduleData ? JSON.parse(scheduleData) : []);
      // console.log("scheudle", JSON.parse(scheduleData));

      setSubcatData(response?.category);
      setImageDAta(response?.category?.images[0]);
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
    // Get localized time string
    let check = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    console.log(check);
    return check;
  };

  const marker = (data) => {
    if (!data?.lng || !data?.lat) {
      console.error("Invalid coordinates:", data?.lng, data?.lat);
      return;
    }

    const start = [data.lng, data.lat];

    // Destroy previous map instance if it exists
    if (mapRef.current) {
      mapRef.current.remove();
    }

    // Create a new map instance
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

  // console.log(SubcatData, "SubcatData");

  // ///////
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
            <p
              className="font-medium text-lg text-[#000] mt-0 mb-0 "
              style={{ fontSize: 15 }}
            >
              {SubcatData?.title}
            </p>
            <div className="flex items-center justify-between">
              <div className=" flex gap-1">
                <FaLocationDot style={{ marginTop: 5 }} />
                <p
                  className="font-medium text-lg text-[#767e94] mt-0 mb-0 "
                  style={{ fontSize: 15 }}
                >
                  {SubcatData?.address}
                </p>
              </div>

              <div
                onClick={HandleClick}
                className="hidden md:block"
                ref={reviewSectionRef}
              >
                <Button className="btnHome mt-0">Book a Ride</Button>
              </div>
            </div>

            <div
              onClick={scrollToReviews}
              className="flex cursor-pointer items-center gap-2"
            >
              {SubcatData?.avgRating > 0 && (
                <Rate
                  className="starDiv"
                  allowHalf
                  disabled
                  defaultValue={SubcatData?.avgRating}
                />
              )}
              <h1 className="font-medium  text-xl " style={{ fontSize: 14 }}>
                ({SubcatData?.totalReviews}) Reviews
              </h1>
            </div>

            {SubcatData?.category?.name == "Upcoming Events" ? (
              <>
                {SubcatData.start_date && (
                  <div className="mt-1 flex items-center gap-1">
                    <MdDateRange />
                    <p
                      className="font-medium text-sm text-[#767e94]  truncate-text mt-0 "
                      style={{ fontSize: 14 }}
                    >
                      {moment(SubcatData.start_date).format(
                        "dddd, MMMM Do, YYYY"
                      )}
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      <IoMdTime />
                      <p
                        className="font-medium text-sm text-[#767e94]  truncate-text mt-0 "
                        style={{ fontSize: 14 }}
                      >
                        {moment(SubcatData.start_time, "HH:mm").format(
                          "hh:mm A"
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : null}

            {Schedule?.length > 0 && (
              <>
                <p className="font-bold mt-2">Schedule</p>
                <div className="flex flex-col gap-2 mb-3 flex-wrap mt-2">
                  {Schedule?.map((item, index) => {
                    return (
                      <>
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <h6 className="font-light" style={{ fontSize: 15 }}>
                            {item?.slot_day}
                          </h6>
                          {item?.slots[0] != undefined &&
                          item.slots[1] != undefined ? (
                            <h6 className="font-light" style={{ fontSize: 15 }}>
                              {convertTo12Hour(item?.slots[0]) +
                                " - " +
                                convertTo12Hour(item?.slots[1])}
                            </h6>
                          ) : (
                            <h6 className="font-light" style={{ fontSize: 15 }}>
                              No Time
                            </h6>
                          )}
                        </div>
                      </>
                    );
                  })}
                </div>
              </>
            )}

            <h1 className="font-bold  text-xl " style={{ fontSize: 14 }}>
              {"Description"}
            </h1>

            <p
              className="CardDes font-light mt-1 "
              style={{ fontSize: 15, color: "black" }}
            >
              {SubcatData?.about}
            </p>

            {SubcatData?.heighlights?.length > 0 && (
              <>
                <h1
                  className="font-bold mt-1 text-xl "
                  style={{ fontSize: 14 }}
                >
                  {"Highlight"}
                </h1>
                <ul
                  style={{
                    listStyle: "disc", // Ensure dots appear
                    paddingLeft: "15px", // Add space for the bullets
                  }}
                  className="mt-1"
                >
                  {SubcatData?.heighlights.map((item, index) => (
                    <li
                      className="font-Regular text-base "
                      key={index}
                      title={item} // Show full text on hover
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div
              id="map-container"
              className="w-full mt-2"
              style={{ height: "20vh" }}
              ref={mapContainerRef}
            />

            <div
              className="mt-auto  justify-end  block md:hidden"
              onClick={HandleClick}
              ref={reviewSectionRef}
            >
              <Button className="btnHome">Book a Ride</Button>
            </div>
          </div>
        </div>

        {/* reves  section */}
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
                                  alt="yrs"
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

      {/* revies modal */}

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
};

const PopularPlaces = () => {
  return (
    <>
      <Suspense fallback={<Spinner />}>
        <PopularAA />
      </Suspense>
    </>
  );
};

export default PopularPlaces;
