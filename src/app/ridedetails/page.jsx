"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { FaLocationDot, FaStar } from "react-icons/fa6";
import { IoCall } from "react-icons/io5";
import { RiMessage2Fill } from "react-icons/ri";
import { MdContentCopy, MdOutlineMyLocation } from "react-icons/md";
import { Tab, Tabs } from "react-bootstrap";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Spinner } from "reactstrap";
import Image from "next/image";
import { carAvatar, NoshowData } from "@/components/assets/Images";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useSearchParams } from "next/navigation";
import { message } from "antd";
import { useSocket } from "@/components/ApiFunction/SoketProvider";

const RideDetail = () => {
  const { header1, putData, getData } = ApiFunction();
  const [productDetail, setProductDetail] = useState(null);
  const searchParams = useSearchParams();
  const encodedData = searchParams.get("data");
  const socket = useSocket();
  const DriveData = encodedData
    ? JSON.parse(decodeURIComponent(encodedData))
    : null;

  const [activeTab, setActiveTab] = useState("reviews");
  const [Reviews, setReviews] = useState([]);
  const [Loading, setLoading] = useState(false);
  const [FavLoading, setFavLoading] = useState(false);

  const mapRef = useRef();
  const mapContainerRef = useRef();
  useEffect(() => {
    getDetail();
    getReviews();
  }, []);

  const getDetail = async (row) => {
    try {
      const res = await getData(`order/detail/${DriveData?._id}`, header1);
      setProductDetail(res?.order);
    } catch (error) {
      console.log("===========error", error.response.data);
    }
  };

  const fav = async () => {
    setFavLoading(true);
    try {
      const res = await putData(
        `users/like/${productDetail?.to_id?._id}`,
        {},
        header1
      );
      if (res?.message) {
        try {
          const res = await getData(
            `order/detail/${productDetail?._id}`,
            header1
          );
          setProductDetail(res?.order);
        } catch (error) {
          console.log("===========error", error.response.data);
        }
      }
    } catch (error) {
      setFavLoading(false);
      console.log("Error adding to favorites: ", error);
    } finally {
      setFavLoading(false); // Set loading false for the favorite request
    }
  };

  const CancelRide = () => {
    if (socket) {
      const body = { orderId: DriveData?._id };
      const endpoint = "cancel-order-customer";
      socket.emit(endpoint, body, (res) => {
        console.log(res);

        message.success(res?.message);
      });
    } else {
      console.log("Socket is null or not properly initialized");
    }
  };

  const Review = () => {};

  const handleTabSelect = async (key) => {
    setActiveTab(key);
  };

  useEffect(() => {
    if (activeTab == "track" && productDetail) {
      locationSet();
    } else {
      getReviews();
    }
  }, [activeTab]);

  const getReviews = async () => {
    setLoading(true);
    try {
      const response = await getData(
        "rating/all/" + DriveData?.to_id?._id,
        header1
      );
      setReviews(response.ratings);
    } catch (error) {
      setLoading(false);
      console.log("errr----", error);
    } finally {
      setLoading(false);
    }
  };

  mapboxgl.accessToken =
    "pk.eyJ1IjoibWFybGVncmFudCIsImEiOiJjbTgwdmV0MjkweXB2MnFzNXBjM2x6NThnIn0.3oz3YGaDHiFDh8W5ALk09w";

  const locationSet = () => {
    const start = [
      productDetail?.start_location?.coordinates[0],
      productDetail?.start_location?.coordinates[1],
    ];

    const end = [
      productDetail?.end_location?.coordinates[0],
      productDetail?.end_location?.coordinates[1],
    ];

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: start ? start : [17.363747, -62.754593],
      zoom: 8,
    });

    new mapboxgl.Marker({ color: "green" })
      .setLngLat(start)
      .addTo(mapRef.current);

    mapRef.current.on("load", () => {
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=pk.eyJ1IjoibWFybGVncmFudCIsImEiOiJjbTgwdmV0MjkweXB2MnFzNXBjM2x6NThnIn0.3oz3YGaDHiFDh8W5ALk09w`;

      fetch(directionsUrl)
        .then((response) => response.json())
        .then((data) => {
          const route = data.routes[0]?.geometry?.coordinates;

          if (!route || route.length === 0) {
            console.error("No route found.");
            return;
          }

          const bounds = new mapboxgl.LngLatBounds();
          route.forEach((coord) => bounds.extend(coord));

          mapRef.current.fitBounds(bounds, { padding: 50 });

          const animateMarker = (route) => {
            let index = 0;
            const marker = new mapboxgl.Marker({ color: "blue" })
              .setLngLat(route[index])
              .addTo(mapRef.current);

            const moveMarker = () => {
              if (index < route.length - 1) {
                index++;
                marker.setLngLat(route[index]);
                requestAnimationFrame(moveMarker);
              }
            };

            moveMarker();
          };

          mapRef.current.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: route,
              },
            },
          });

          mapRef.current.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#A6A6A6",
              "line-width": 6,
            },
          });

          animateMarker(route);
        })
        .catch((error) => console.error("Failed to fetch directions:", error));
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  };

  const copytoClipBoard = () => {
    navigator.clipboard.writeText(productDetail?.pincode);
    message.success("Copied To Clipboard");
  };
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-62.754593, 17.363747],
      zoom: 9,
    });
  }, []);

  return (
    <div className="mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
      {/* Left Section: Booking Details */}
      <div className="RideForm col-span-12 md:col-span-3">
        <h1 className="rideHeader text-center text-xl md:text-2xl">
          Booking Details
        </h1>
        <h5 className="mt-3 text-md md:text-lg font-medium">Driver Details</h5>
        <div className="flex flex-col justify-center items-center gap-3 mt-3">
          <Image
            width={12}
            height={12}
            src={productDetail?.to_id?.image}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-gray-200"
            alt=""
          />
          <h6 className="font-Bold text-base md:text-lg">
            {productDetail?.to_id?.name}
          </h6>
          <div className="flex gap-1">
            <FaStar color="#FFD233" />
            <p className="text-gray-500 font-Regular text-sm md:text-base">
              {`${productDetail?.to_id?.rating}.0`}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="icn_div cursor-pointer">
              <IoCall color="#004A70" />
            </div>
            <div className="icn_div cursor-pointer">
              <RiMessage2Fill color="#004A70" />
            </div>
          </div>
        </div>
        <h5 className="mt-3 text-md md:text-lg font-Bold">Ride Details</h5>

        <div className="flex flex-col md:flex-row items-center mt-4 mb-4">
          <div className="ms-2">
            <h5 className="medium-font mb-2 text-sm md:text-lg">
              Start location
            </h5>
            <p className="regular-font text-sm md:text-base text-gray-500">
              {productDetail?.start_address}
            </p>
            <h5 className="medium-font mt-4 text-sm md:text-lg">
              End location
            </h5>
            <p className="regular-font text-sm md:text-base text-gray-500">
              {productDetail?.end_address}
            </p>

            <h5 className="medium-font mt-4 text-sm md:text-lg">Pincode</h5>
            <div className="flex items-center gap-2">
              <p className="regular-font text-sm md:text-base text-gray-500">
                {productDetail?.pincode}
              </p>
              <div className="cursor-pointer" onClick={copytoClipBoard}>
                <MdContentCopy />
              </div>
            </div>
          </div>
        </div>

        <div className="flex   items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-3">
            <Image
              src={productDetail?.to_id?.vehicle?.images[0] || carAvatar}
              alt=""
              width={12}
              height={12}
              className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-gray-200 object-cover"
            />
            <div>
              <p className="font-Regular text-sm">
                {productDetail?.to_id?.vehicle?.brand}
              </p>
              <p className="font-Regular text-sm">
                {productDetail?.to_id?.vehicle?.license}
              </p>
            </div>
          </div>
          <p className="font-Bold text-sm md:text-lg">{`$${productDetail?.price}`}</p>
        </div>
        {productDetail?.status === "completed" && !productDetail?.likes && (
          <button
            onClick={fav}
            className="w-full h-14 mt-4 px-4 py-2 rounded-lg text-white bg-[#FF3700] hover:bg-[#FF3700]"
          >
            {FavLoading ? <Spinner size="sm" /> : "Add This Driver to Favorite"}
          </button>
        )}
        {DriveData?.status === "accepted" ? (
          <button
            onClick={CancelRide}
            className="w-full h-14 mt-4 px-4 py-2 rounded-lg text-white bg-[#004A70] hover:bg-[#004A70]"
          >
            Cancel Ride
          </button>
        ) : null}
      </div>

      {/* Right Section: Tabs */}
      <div className="RideForm col-span-12 md:col-span-9">
        <Tabs
          activeKey={activeTab}
          onSelect={handleTabSelect}
          defaultActiveKey="reviews"
          className="mb-3 tabHead00 mt-3"
        >
          <Tab eventKey="reviews" title="Reviews">
            {Loading ? (
              <div className="flex justify-center items-center h-60">
                <Spinner color="#fff">Loading...</Spinner>
              </div>
            ) : (
              <div className="bg-white p-6">
                {Reviews?.length > 0 ? (
                  Reviews.map((review, index) => (
                    <div
                      key={index}
                      className="flex flex-wrap md:flex-nowrap gap-4 items-start mb-8 border-b pb-6"
                    >
                      <Image
                        src={NoshowData}
                        width={12}
                        height={12}
                        alt="Profile"
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-gray-200 object-cover"
                      />
                      <div>
                        <h3 className="text-base md:text-xl font-Bold">
                          {review.user?.name}
                        </h3>
                        <div className="flex items-center text-yellow-500 text-sm mt-1">
                          {"★".repeat(review.rating)}
                          <span className="ml-2 font-Regular text-gray-500">
                            {review.rating} Star Ratings
                          </span>
                        </div>
                        <p className="text-sm md:text-base font-Regular text-gray-700 mt-2">
                          {review.review}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-60">
                    <p>No Reviews</p>
                  </div>
                )}
              </div>
            )}
          </Tab>
          <Tab eventKey="track" title="Track on map">
            <div
              id="map-container"
              style={{ width: "100%", height: "70vh" }}
              ref={mapContainerRef}
            />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

const page = () => {
  return (
    <Suspense fallback={<Spinner animation="border" />}>
      <RideDetail />
    </Suspense>
  );
};

export default page;
