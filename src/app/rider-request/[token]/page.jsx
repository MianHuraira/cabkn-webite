"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import {
  Container,
  Row,
  Col,
  Spinner,
  Button as BootstrapButton,
} from "react-bootstrap";
import {
  Modal,
  Input,
  message,
  Card,
  Avatar,
  Button as AntButton,
  Tooltip,
} from "antd";
import Image from "next/image";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { logoBlue } from "@/components/assets/Images";
import moment from "moment";
import {
  IoCall,
  IoChatbubbleEllipses,
  IoCheckmarkCircle,
  IoCloseCircle,
} from "react-icons/io5";
import { FaCircle } from "react-icons/fa";

const BookingManagement = () => {
  mapboxgl.accessToken =
    "pk.eyJ1IjoibWFybGVncmFudCIsImEiOiJjbTgwdmV0MjkweXB2MnFzNXBjM2x6NThnIn0.3oz3YGaDHiFDh8W5ALk09w";
  const { token } = useParams();
  const router = useRouter();
  const api = ApiFunction();
  const { postData, getData, putData, header1, header2 } = api;

  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);

  // Modals & Action States
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showAcceptPinModal, setShowAcceptPinModal] = useState(false);
  const [pendingAcceptValues, setPendingAcceptValues] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [pin, setPin] = useState("");
  const [acceptPin, setAcceptPin] = useState("");
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [resultModal, setResultModal] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  // Tracking States
  const [driverLocation, setDriverLocation] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [locationAllwoed, setLocationAllwoed] = useState(false);
  const watchId = useRef(null);
  const driverLocationRef = useRef(null);
  const initialUpdateDone = useRef(false);

  const status = orderDetails?.status || "pending";

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await getData(`assign-driver/${token}`, header1);
      if (res?.success || res?.order) {
        setOrderDetails(res?.order || res?.request);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setResultModal({
        show: true,
        type: "error",
        title: "Ride Already Accepted",
        message:
          "This ride has already been accepted and is being handled by another driver",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrderDetails();
    }
  }, [token]);

  const handleUpload = async (file, setFieldValue) => {
    if (!file) return;
    const formData = new FormData();
    try {
      setUploadingImage(true);
      formData.append("image", file);
      const res = await postData("image/upload", formData, header2);
      if (res?.success || res?.image) {
        const imageUrl = res?.image || res?.data?.image;
        setUploadedImageUrl(imageUrl);
        setFieldValue("carImage", imageUrl);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      message.error("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitCarDetails = async (values) => {
    setPendingAcceptValues(values);
    setShowAcceptModal(false);
    // setShowAcceptPinModal(true);
  };

  const handleConfirmAcceptance = async (values) => {
    // if (acceptPin !== orderDetails?.pincode) {
    //   setResultModal({
    //     show: true,
    //     type: "error",
    //     title: "Invalid PIN",
    //     message:
    //       "The PIN you entered is incorrect. Please check and try again.",
    //   });
    //   return;
    // }

    setSubmitting(true);
    try {
      const apiData = {
        carImage: values.carImage,
        carColor: values.carColor,
        carNumber: values.carNumber,
        latitude: driverLocation?.lat,
        longitude: driverLocation?.lng,
      };

      const response = await postData(
        `assign-driver/anonymous/${token}`,
        apiData,
        header1,
      );

      if (response?.order) {
        setOrderDetails(response.order);
        setShowAcceptModal(false);
        setShowAcceptPinModal(false);
        setPendingAcceptValues(null);
        setAcceptPin("");
        // setResultModal({
        //   show: true,
        //   type: "success",
        //   title: "Ride Accepted",
        //   message: "You have successfully accepted the ride.",
        // });
        message.success("Ride Accepted");
      } else {
        setResultModal({
          show: true,
          type: "error",
          title: "Submission Failed",
          message: response?.message || "Failed to accept ride.",
        });
      }
    } catch (err) {
      setResultModal({
        show: true,
        type: "error",
        title: "Error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong during submission.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyPin = async () => {
    if (pin.length < 4) {
      message.warning("Please enter complete PIN");
      return;
    }
    setVerifyingPin(true);
    try {
      const response = await postData(
        "bookings/verify-pin",
        {
          bookingId: orderDetails?._id,
          pin: pin,
        },
        header1,
      );

      if (response?.success) {
        message.success("Ride started!");
        setShowPinModal(false);
        fetchOrderDetails();
      } else {
        message.error(response?.message || "Incorrect PIN");
      }
    } catch (err) {
      message.error("Failed to verify PIN");
    } finally {
      setVerifyingPin(false);
    }
  };

  const handleAction = async (actionType) => {
    try {
      setSubmitting(true);
      const res = await putData(
        `assign-driver/anonymous/${token}`,
        {},
        header1,
      );

      if (res?.updatedOrder) {
        setResultModal({
          show: true,
          type: "success",
          title: actionType === "dropoff" ? "Ride Completed" : "Order Updated",
          message:
            actionType === "dropoff"
              ? "The customer has been dropped off."
              : `${actionType} successful!`,
        });
        // fetchOrderDetails();
      } else {
        setResultModal({
          show: true,
          type: "error",
          title: "Action Failed",
          message: res?.message || `Failed to ${actionType}`,
        });
      }
    } catch (err) {
      setResultModal({
        show: true,
        type: "error",
        title: "Error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          `Something went wrong while performing ${actionType}`,
      });

      setSubmitting(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetryLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      // Clear existing watch if any
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setDriverLocation({ lat: latitude, lng: longitude });
          driverLocationRef.current = { lat: latitude, lng: longitude };
          setLocationDenied(false);
          setLocationAllwoed(true);
          message.success("Location access granted");

          // Restart the watch
          startWatching();
        },
        (error) => {
          console.error(
            "Retry location error:",
            error.message || error.code || error,
          );
          if (error.code === error.PERMISSION_DENIED) {
            setLocationDenied(true);
            message.error(
              "Location permission still denied. Please enable it in browser settings.",
            );
          } else {
            message.error(
              "Failed to get location: " + (error.message || "Timeout"),
            );
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    }
  };

  const startWatching = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setDriverLocation({ lat: latitude, lng: longitude });
          driverLocationRef.current = { lat: latitude, lng: longitude };
          setLocationDenied(false);
          setLocationAllwoed(true);
          if (
            latitude &&
            longitude &&
            (status === "order-start" || status === "accepted") &&
            driverLocation &&
            !initialUpdateDone.current &&
            !locationDenied &&
            locationAllwoed
          ) {
            const updateLocation = async () => {
              try {
                await putData(
                  `assign-driver/anonymous/${token}/update-location`,
                  {
                    latitude: driverLocation.lat,
                    longitude: driverLocation.lng,
                  },
                  header1,
                );
                initialUpdateDone.current = true;
              } catch (error) {
                console.error("Error updating location:", error);
              }
            };
            updateLocation();
          }
        },
        (error) => {
          console.error(
            "Error watching position:",
            error.message || error.code || error,
          );
          if (error.code === error.PERMISSION_DENIED) {
            setLocationDenied(true);
          }
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
      );
    }
  };

  useEffect(() => {
    startWatching();

    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  useEffect(() => {
    let intervalId;
    if (status === "order-start" || status === "accepted") {
      const updateLocation = async () => {
        if (!driverLocationRef.current || locationDenied) return;
        try {
          await putData(
            `assign-driver/anonymous/${token}/update-location`,
            {
              latitude: driverLocationRef.current.lat,
              longitude: driverLocationRef.current.lng,
            },
            header1,
          );
          initialUpdateDone.current = true;
        } catch (error) {
          console.error("Error updating location:", error);
        }
      };

      // Call immediately if location is already available
      if (driverLocationRef.current && !initialUpdateDone.current) {
        updateLocation();
      }

      // Set interval
      intervalId = setInterval(updateLocation, 30000);

      return () => {
        clearInterval(intervalId);
      };
    } else {
      initialUpdateDone.current = false;
    }
  }, [status, token, locationDenied]);

  // Reset initialUpdateDone if location is denied so it can re-trigger when allowed
  useEffect(() => {
    if (locationDenied) {
      initialUpdateDone.current = false;
    }
  }, [locationDenied]);

  // Separate effect to trigger the "immediate" update as soon as location becomes available
  useEffect(() => {
    if (
      (status === "order-start" || status === "accepted") &&
      driverLocation &&
      !initialUpdateDone.current &&
      !locationDenied &&
      locationAllwoed
    ) {
      const updateLocation = async () => {
        try {
          await putData(
            `assign-driver/anonymous/${token}/update-location`,
            {
              latitude: driverLocation.lat,
              longitude: driverLocation.lng,
            },
            header1,
          );
          initialUpdateDone.current = true;
        } catch (error) {
          console.error("Error updating location:", error);
        }
      };
      updateLocation();
    }
  }, [status, driverLocation, token, locationDenied, locationAllwoed]);

  const openExternalMap = () => {
    router.push(`/rider-request/${token}/map`);
  };

  const openGoogleMaps = () => {
    if (driverLocation && orderDetails?.start_address) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${driverLocation.lat},${driverLocation.lng}&destination=${encodeURIComponent(orderDetails.start_address)}&travelmode=driving`;
      window.open(url, "_blank");
    } else if (orderDetails?.start_address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(orderDetails.start_address)}`;
      window.open(url, "_blank");
    } else {
      message.warning("Location details not available");
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrderDetails();
    }
  }, [token]);

  if (loading && !orderDetails) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spinner size="md" animation="border" className="text-[#004a70]" />
      </div>
    );
  }

  // Price and Payout calculations (Backend sends price in USD)
  const priceUSD = orderDetails?.price || 0;
  const adminPriceUSD = orderDetails?.adminprice || 0;
  const paymentType = orderDetails?.paymentType || "cash";

  const payoutUSD =
    (paymentType === "cash" ? priceUSD : priceUSD - 8) - adminPriceUSD;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-10 px-1">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <Image
          src={logoBlue}
          alt="App Logo"
          width={100}
          height={100}
          className="object-contain"
        />
        {/* <h2 className="text-2xl font-normal text-[#004a70] mt-2">Booking</h2> */}
      </div>

      <div className="max-w-xl mx-auto">
        <Card className="rounded-3xl border shadow-sm  overflow-hidden bg-white ">
          {/* User Info Header */}
          <div className="flex justify-between items-start mb-6 p-1">
            <div className="flex items-center gap-3">
              <Avatar
                src={orderDetails?.user?.image}
                size={64}
                icon={
                  !orderDetails?.user?.image && (
                    <span className="text-xl">👤</span>
                  )
                }
                className="border-2 border-gray-100 shadow-sm"
              />
              <div>
                <h3 className="text-lg font-normal text-gray-800 mb-0 leading-tight">
                  {orderDetails?.user?.name || "Customer User"}
                </h3>
                <p className="text-sm text-gray-500 font-normal m-0">
                  Type: <span className="text-[#004a70]">Ride</span>
                </p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <p className="text-xs font-medium text-black m-0 uppercase ">
                #
                {orderDetails?.order_id ||
                  orderDetails?._id?.slice(-8).toUpperCase()}
              </p>
              {orderDetails?.user?.phone && (
                <a
                  href={`tel:${orderDetails.user.phone}`}
                  className="text-gray-400 mt-3 hover:text-gray-600 transition-colors flex items-center gap-0"
                >
                  <IoCall className="text-lg" />
                  <span className="text-xs font-normal">
                    {orderDetails.user.phone}
                  </span>
                </a>
              )}
            </div>
          </div>

          <div className="px-1 pb-6">
            <div className="flex justify-between items-center mb-3">
              <p className="text-gray-500 text-sm font-normal">
                Created at :{" "}
                <span className="text-gray-700">
                  {moment(orderDetails?.createdAt).format(
                    "DD MMM, YYYY - hh:mm A",
                  )}
                </span>
              </p>
              <p className="font-normal text-gray-400 capitalize">
                {orderDetails?.paymentType || "Cash"}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-base font-medium text-black">
                ${priceUSD.toFixed(2)} XCD - ${(priceUSD / 2.7).toFixed(2)} USD
              </h4>
            </div>

            {/* Car Type Badge */}
            <div className="mb-6">
              <span className="px-4 py-2 border-2 border-[#004a70] rounded-full text-[#004a70] font-normal text-sm bg-blue-50/50">
                {orderDetails?.liability?.title || "CabKN Standard"}{" "}
                {orderDetails?.liability?.passenger &&
                  `(${orderDetails.liability.passenger} Passengers)`}
              </span>
            </div>

            {/* Address Path */}
            <div className="relative pl-8 mb-8 space-y-8">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200 border-dashed border-l-2"></div>

              {/* Start Address */}
              <div className="relative">
                <div className="absolute -left-[28px] top-1 bg-white p-0.5 rounded-full z-10">
                  <div className="w-4 h-4 rounded-full border-4 border-[#004a70] bg-[#004a70]"></div>
                </div>
                <p className="text-sm font-normal text-gray-800 leading-snug">
                  {orderDetails?.start_address || "Pickup Point"}
                </p>
              </div>

              {/* Intermediate Stops */}
              {orderDetails?.stops?.map((stop, index) => (
                <div className="relative" key={stop?._id || index}>
                  <div className="absolute -left-[28px] top-1 bg-white p-0.5 rounded-full z-10">
                    <div className="w-4 h-4 rounded-full border-4 border-gray-400 bg-gray-400"></div>
                  </div>
                  <p className="text-sm font-normal text-gray-600 leading-snug">
                    {stop?.address || "Intermediate Stop"}
                  </p>
                </div>
              ))}

              {/* End Address */}
              <div className="relative">
                <div className="absolute -left-[28px] top-1 bg-white p-0.5 rounded-full z-10">
                  <div className="w-4 h-4 rounded-full border-4 border-[#ef4444] bg-[#ef4444]"></div>
                </div>
                <p className="text-sm font-normal text-gray-800 leading-snug">
                  {orderDetails?.end_address || "Dropoff Point"}
                </p>
              </div>
            </div>

            {orderDetails?.status === "order-start" && (
              <div className="border-t border-gray-100 pt-4 mb-8">
                <p className="text-base font-normal text-gray-600">
                  You will be Paid{" "}
                  <span className="text-[#004a70]">
                    ${payoutUSD.toFixed(2)} XCD - $
                    {(payoutUSD / 2.7).toFixed(2)} USD
                  </span>
                </p>
              </div>
            )}

            {/* Dynamic Buttons */}
            <div className="flex gap-4">
              {status === "pending" && (
                <>
                  <button
                    disabled={submitting || locationDenied}
                    className="w-full h-12 rounded-2xl border border-[#004a70] text-sm font-normal shadow-sm disabled:opacity-50"
                    onClick={() => router.push("/")}
                  >
                    Reject
                  </button>
                  <button
                    disabled={submitting || locationDenied}
                    className="w-full h-12 rounded-2xl bg-[#004a70] text-white border-0 text-sm font-normal shadow-sm disabled:opacity-50"
                    onClick={() => setShowAcceptModal(true)}
                  >
                    Accept
                  </button>
                </>
              )}

              {status === "accepted" && (
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex gap-4">
                    <button
                      disabled={submitting || locationDenied}
                      className="w-full h-12 rounded-2xl border border-[#004a70] text-[#004a70] text-sm font-normal shadow-sm disabled:opacity-50"
                      onClick={() => handleAction("reject")}
                    >
                      Reject
                    </button>
                    <button
                      disabled={submitting || locationDenied}
                      className="w-full h-12 rounded-2xl bg-[#004a70] text-white border-0 text-lg font-normal shadow-lg disabled:opacity-50"
                      onClick={() => setShowPinModal(true)}
                    >
                      Start Ride
                    </button>
                  </div>
                  <div className="flex gap-3">
                    {/* <button
                      className="w-full h-12 rounded-2xl border-2 border-[#004a70] text-[#004a70] text-sm font-normal shadow-md flex items-center justify-center gap-2 bg-white"
                      onClick={openExternalMap}
                    >
                      Track Ride
                    </button> */}
                    <button
                      className="w-full h-12 rounded-2xl border-2 border-[#004a70] text-[#004a70] text-sm font-normal shadow-md flex items-center justify-center gap-2 bg-white"
                      onClick={openGoogleMaps}
                    >
                      Track Ride
                    </button>
                  </div>
                </div>
              )}

              {status === "order-start" && (
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex gap-3">
                    {/* <button
                      className="w-full h-12 rounded-2xl border-2 border-[#004a70] text-[#004a70] text-sm font-normal shadow-md flex items-center justify-center gap-2 bg-white"
                      onClick={openExternalMap}
                    >
                      Track Ride
                    </button> */}
                    <button
                      className="w-full h-12 rounded-2xl border-2 border-[#004a70] text-[#004a70] text-sm font-normal shadow-md flex items-center justify-center gap-2 bg-white"
                      onClick={openGoogleMaps}
                    >
                      Track Ride
                    </button>
                  </div>
                  <button
                    disabled={submitting || locationDenied}
                    className="w-full h-12 rounded-2xl bg-[#004a70] text-white border-0 text-lg font-normal shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    onClick={() => handleAction("dropoff")}
                  >
                    {submitting ? (
                      <>
                        <Spinner size="sm" animation="border" />
                        Processing...
                      </>
                    ) : (
                      "Confirm DropOff"
                    )}
                  </button>
                </div>
              )}

              {/* {status === "completed" && (
                <div className="w-full text-center py-4 bg-green-100 rounded-2xl text-green-700 font-normal">
                  Ride Completed Successfully
                </div>
              )} */}
            </div>
          </div>
        </Card>

        {/* Accept Modal (Car Details Form) */}
        <Modal
          title={
            <h3 className="text-base font-normal text-[#004a70] text-center w-full mb-0 uppercase tracking-tight">
              Fill Information
            </h3>
          }
          open={showAcceptModal}
          onCancel={() => !submitting && setShowAcceptModal(false)}
          closable={!submitting}
          maskClosable={!submitting}
          footer={null}
          centered
          className="booking-modal "
          width={450}
        >
          <div className="pt-4">
            <Formik
              initialValues={{ carImage: "", carColor: "", carNumber: "" }}
              validationSchema={Yup.object().shape({
                carColor: Yup.string().required("Car color is required"),
                carNumber: Yup.string().required(
                  "Car registration number is required",
                ),
              })}
              onSubmit={handleConfirmAcceptance}
            >
              {({ errors, touched, setFieldValue, handleSubmit }) => (
                <div className="space-y-6">
                  {/* Image Upload Area */}
                  <div className="relative h-48 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer overflow-hidden group">
                    {imagePreview ? (
                      <>
                        <Image
                          src={imagePreview}
                          alt="Car"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <AntButton
                            type="primary"
                            danger
                            onClick={() => setImagePreview(null)}
                          >
                            Remove
                          </AntButton>
                        </div>
                      </>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          onChange={(e) => {
                            const file = e.currentTarget.files[0];
                            if (file) {
                              setImagePreview(URL.createObjectURL(file));
                              handleUpload(file, setFieldValue);
                            }
                          }}
                        />
                        <div className="flex flex-col items-center text-gray-400">
                          <span className="text-4xl mb-2">📸</span>
                          <span className="font-normal text-sm">
                            Upload Car Image
                          </span>
                        </div>
                      </>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
                        <Spinner
                          size="sm"
                          animation="border"
                          className="text-[#004a70]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-normal text-gray-700 mb-1">
                        Car Color
                      </p>
                      <Field
                        name="carColor"
                        as={Input}
                        placeholder="e.g. White"
                        className="h-10 rounded-xl border-gray-300 capitalize text-md font-normal"
                      />
                      {touched.carColor && errors.carColor && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.carColor}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-normal text-gray-700 mb-1">
                        Car Plate Number
                      </p>
                      <Field
                        name="carNumber"
                        as={Input}
                        placeholder="ABC-1234"
                        className="h-10 rounded-xl uppercase border-gray-300 text-md font-normal "
                      />
                      {touched.carNumber && errors.carNumber && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.carNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="primary"
                    // loading={submitting || uploadingImage}
                    onClick={handleSubmit}
                    disabled={submitting || uploadingImage}
                    className="w-full h-12 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl bg-[#004a70] text-white border-0 text-base font-normal shadow-lg"
                  >
                    {submitting ? "Submitting..." : "SUBMIT"}
                  </button>
                </div>
              )}
            </Formik>
          </div>
        </Modal>

        {/* PIN Verification Modal */}
        <Modal
          title={
            <h3 className="text-xl font-normal text-gray-800 text-center w-full mb-0">
              Verify Pin
            </h3>
          }
          open={showPinModal}
          onCancel={() => !verifyingPin && setShowPinModal(false)}
          closable={!verifyingPin}
          maskClosable={!verifyingPin}
          footer={null}
          centered
          width={400}
        >
          <div className="text-center py-6">
            <p className="text-gray-500 font-normal text-lg leading-tight mb-8">
              Ask The Pin from Customer to Start the Ride
            </p>

            <div className="flex justify-center mb-8">
              <Input.OTP
                length={4}
                size="large"
                onChange={(v) => setPin(v)}
                className="custom-otp-input"
              />
            </div>

            <AntButton
              type="primary"
              loading={verifyingPin}
              onClick={handleVerifyPin}
              className="w-full h-14 rounded-2xl bg-[#004a70] border-0 text-lg font-normal shadow-lg mt-4"
            >
              Confirm
            </AntButton>
          </div>
        </Modal>

        {/* Acceptance PIN Verification Modal */}
        <Modal
          title={
            <h3 className="text-xl font-normal text-gray-800 text-center w-full mb-0">
              Verify
            </h3>
          }
          open={showAcceptPinModal}
          onCancel={() => !submitting && setShowAcceptPinModal(false)}
          closable={!submitting}
          maskClosable={!submitting}
          footer={null}
          centered
          width={400}
        >
          <div className="text-center">
            <p className="text-gray-500 font-normal text-lg leading-tight mb-8">
              Enter PIN to confirm ride acceptance
            </p>

            <div className="flex justify-center my-8">
              <Input.OTP
                length={4}
                size="large"
                onChange={(v) => setAcceptPin(v)}
                className="custom-otp-input"
              />
            </div>

            <button
              onClick={handleConfirmAcceptance}
              disabled={submitting}
              className="w-full h-12 rounded-2xl bg-[#004a70] text-white border-0 text-base font-normal shadow-sm mt-4 flex items-center justify-center gap-2"
            >
              {submitting && <Spinner size="sm" animation="border" />}
              CONFIRM ACCEPTANCE
            </button>
          </div>
        </Modal>

        <div className="text-center mt-12 text-gray-400 text-xs font-normal tracking-wider">
          © CABKN TECHNOLOGIES. ALL RIGHTS RESERVED.
        </div>

        {/* Result Modal (Success/Error) */}
        <Modal
          open={resultModal.show}
          footer={null}
          centered
          width={350}
          closable={false}
          maskClosable={false}
          keyboard={false}
          className="result-modal"
        >
          <div className="flex flex-col items-center py-2">
            <div className="mb-2">
              {resultModal.type === "success" ? (
                <IoCheckmarkCircle className="text-7xl text-green-500" />
              ) : (
                <IoCloseCircle className="text-7xl text-red-500" />
              )}
            </div>
            <h3 className="text-xl font-normal text-gray-800 mb-2">
              {resultModal.title}
            </h3>
            <p className="text-gray-500 text-center text-lg leading-snug">
              {resultModal.message}
            </p>
            {/* {resultModal.type === "error" && (
              <button
                onClick={() =>
                  setResultModal({
                    show: false,
                    type: "error",
                    title: "",
                    message: "",
                  })
                }
                className="mt-6 w-full h-12 rounded-2xl bg-[#004a70] text-white border-0 text-base font-normal shadow-lg"
              >
                Try Again
              </button>
            )} */}
          </div>
        </Modal>

        {/* Location Required Modal */}
        <Modal
          open={locationDenied}
          footer={null}
          centered
          closable={true}
          maskClosable={true}
          onCancel={() => setLocationDenied(false)}
          width={400}
          className="location-modal"
        >
          <div className="flex flex-col items-center py-3 text-center">
            <div className="mb-4">
              <IoCloseCircle className="text-7xl text-red-500" />
            </div>
            <h3 className="text-2xl font-normal text-red-600 mb-4">
              Location Access Required
            </h3>
            <div className="bg-red-50 p-4 rounded-2xl mb-8 border border-red-100">
              <p className="text-gray-700 text-base leading-snug m-0">
                Location access is <b>Compulsory</b>. Since you previously
                declined, you <b>MUST manually enable</b> it in your browser
                settings to proceed.
              </p>
            </div>

            <AntButton
              type="primary"
              size="large"
              onClick={handleRetryLocation}
              className="w-full h-12 rounded-2xl bg-[#004a70] border-0 text-base font-normal shadow-lg"
            >
              Try Again
            </AntButton>
          </div>
        </Modal>

        <style jsx global>{`
          * {
            font-family:
              "Inter-Regular",
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              Roboto,
              "Helvetica Neue",
              Arial,
              sans-serif !important;
            font-weight: 400 !important;
          }
          iframe#tidio-chat-iframe,
          #tidio-chat {
            display: none !important;
          }
          .ant-modal-content {
            border-radius: 2rem !important;
            padding: 2rem !important;
          }
          .ant-modal-header {
            margin-bottom: 0 !important;
            border-bottom: 0 !important;
          }
          .custom-otp-input .ant-input-otp-item {
            width: 64px !important;
            height: 64px !important;
            border-radius: 1rem !important;
            background: #f3f4f6 !important;
            border: 0 !important;
            font-size: 1.5rem !important;
            font-weight: 400 !important;
          }
          .custom-otp-input .ant-input-otp-item:focus {
            background: #fff !important;
            box-shadow: 0 0 0 2px #004a70 !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default BookingManagement;
