"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import moment from "moment/moment";
import { FaLocationDot, FaStar } from "react-icons/fa6";
import { IoCall } from "react-icons/io5";
import { RiMessage2Fill } from "react-icons/ri";
import { MdContentCopy, MdOutlineMyLocation } from "react-icons/md";

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

  useEffect(() => {
    if (activeTab == "track" && productDetail) {
      locationSet();
    } else {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
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
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
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
  };

  const copytoClipBoard = () => {
    navigator.clipboard.writeText(productDetail?.pincode);
    message.success("Copied To Clipboard");
  };
  return (
    <div className="mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-4 p-4" style={{ maxWidth: 1320 }}>
      {/* Left Section: Booking Details */}
      <div className="RideForm col-span-12 lg:col-span-4 xl:col-span-3">
        <h1 style={{ fontFamily: "Inter-Bold", fontSize: "clamp(18px, 3vw, 24px)", color: "#0f172a", textAlign: "center", margin: "20px 0 30px" }}>
          Booking Details
        </h1>

        {/* Driver Card */}
        <div style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          borderRadius: 14,
          padding: 20,
          border: "1px solid #e2e8f0",
          textAlign: "center",
        }}>
          <Image
            width={64}
            height={64}
            src={productDetail?.to_id?.image || NoshowData}
            style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", margin: "0 auto 8px" }}
            alt=""
          />
          <h6 style={{ fontFamily: "Inter-Bold", fontSize: 16, color: "#0f172a", margin: "0 0 4px" }}>
            {productDetail?.to_id?.name}
          </h6>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <FaStar color="#f59e0b" size={14} />
            <span style={{ fontSize: 13, color: "#64748b", fontFamily: "Inter-Regular" }}>
              {productDetail?.to_id?.rating || "0"}.0
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <IoCall color="#004A70" size={16} />
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <RiMessage2Fill color="#004A70" size={16} />
            </div>
          </div>
        </div>

        {/* Ride Details */}
        <div style={{ marginTop: 16 }}>
          <h5 style={{ fontFamily: "Inter-SemiBold", fontSize: 15, color: "#0f172a", marginBottom: 12, borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
            Ride Details
          </h5>

          {/* Start - End locations with route line */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, paddingTop: 2 }}>
              <FaLocationDot color="#004a70" size={14} />
              <div style={{ width: 1.5, height: 28, background: "#d1d5db" }} />
              <MdOutlineMyLocation color="#004a70" size={14} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, color: "#94a3b8", fontFamily: "Inter-Medium", margin: 0 }}>FROM</p>
              <p style={{ fontSize: 13, color: "#0f172a", fontFamily: "Inter-Regular", margin: "2px 0 10px", lineHeight: 1.3 }}>
                {productDetail?.start_address}
              </p>
              <p style={{ fontSize: 11, color: "#94a3b8", fontFamily: "Inter-Medium", margin: 0 }}>TO</p>
              <p style={{ fontSize: 13, color: "#0f172a", fontFamily: "Inter-Regular", margin: "2px 0 0", lineHeight: 1.3 }}>
                {productDetail?.end_address}
              </p>
            </div>
          </div>

          {/* Pincode */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontFamily: "Inter-Medium", color: "#374151" }}>Pincode:</span>
            <span style={{ fontSize: 13, fontFamily: "Inter-SemiBold", color: "#004a70" }}>{productDetail?.pincode}</span>
            <MdContentCopy size={16} style={{ cursor: "pointer", color: "#94a3b8" }} onClick={copytoClipBoard} />
          </div>

          {/* Vehicle + Price */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Image
                src={productDetail?.to_id?.vehicle?.images?.[0] || carAvatar}
                alt=""
                width={44}
                height={44}
                style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", border: "1px solid #e2e8f0" }}
              />
              <div>
                <p style={{ fontSize: 13, fontFamily: "Inter-Medium", color: "#0f172a", margin: 0 }}>{productDetail?.to_id?.vehicle?.brand || "Vehicle"}</p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>{productDetail?.to_id?.vehicle?.license || ""}</p>
              </div>
            </div>
            <p style={{ fontSize: 18, fontFamily: "Inter-Bold", color: "#059669", margin: 0 }}>${productDetail?.price}</p>
          </div>
        </div>

        {productDetail?.status === "completed" && !productDetail?.likes && (
          <button
            onClick={fav}
            style={{
              width: "100%", height: 46, marginTop: 16, borderRadius: 10, border: "none",
              background: "#ef4444", color: "#fff", fontFamily: "Inter-SemiBold", fontSize: 13, cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            {FavLoading ? <Spinner size="sm" /> : "Add to Favorites"}
          </button>
        )}
        {DriveData?.status === "accepted" ? (
          <button
            onClick={CancelRide}
            style={{
              width: "100%", height: 46, marginTop: 12, borderRadius: 10, border: "none",
              background: "#004a70", color: "#fff", fontFamily: "Inter-SemiBold", fontSize: 13, cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            Cancel Ride
          </button>
        ) : null}
      </div>

      {/* Right Section */}
      <div className="col-span-12 lg:col-span-8 xl:col-span-9">
        {/* Button tabs - smaller width, aligned left */}
        <div style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
        }}>
          <button
            onClick={() => setActiveTab("reviews")}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: activeTab === "reviews" ? "1.5px solid #004a70" : "1.5px solid #e2e8f0",
              background: activeTab === "reviews" ? "#004a70" : "#fff",
              color: activeTab === "reviews" ? "#fff" : "#64748b",
              fontFamily: "Inter-Medium",
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 6,
              minWidth: "auto",
              width: "auto",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== "reviews") {
                e.currentTarget.style.borderColor = "#004a70";
                e.currentTarget.style.background = "#f1f5f9";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "reviews") {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.background = "#fff";
              }
            }}
          >
            <FaStar size={14} color={activeTab === "reviews" ? "#fbbf24" : "#94a3b8"} />
            Reviews
          </button>
          <button
            onClick={() => setActiveTab("track")}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: activeTab === "track" ? "1.5px solid #004a70" : "1.5px solid #e2e8f0",
              background: activeTab === "track" ? "#004a70" : "#fff",
              color: activeTab === "track" ? "#fff" : "#64748b",
              fontFamily: "Inter-Medium",
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 6,
              minWidth: "auto",
              width: "auto",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== "track") {
                e.currentTarget.style.borderColor = "#004a70";
                e.currentTarget.style.background = "#f1f5f9";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "track") {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.background = "#fff";
              }
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Track on Map
          </button>
        </div>

        {/* Content */}
        {activeTab === "reviews" ? (
          <div className="RideForm" style={{ minHeight: 300 }}>
            {Loading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
                <Spinner>Loading...</Spinner>
              </div>
            ) : (
              <div>
                {Reviews?.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                    {Reviews.map((review, index) => (
                      <div
                        key={index}
                        style={{
                          background: "#fff",
                          borderRadius: 14,
                          border: "1px solid #e2e8f0",
                          padding: 18,
                          transition: "all 0.2s",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)"}
                      >
                        {/* Card Header */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                          <Image
                            src={review.user?.image || NoshowData}
                            width={40}
                            height={40}
                            alt=""
                            style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "1px solid #f0f0f0" }}
                          />
                          <div>
                            <h4 style={{ fontSize: 14, fontFamily: "Inter-SemiBold", color: "#0f172a", margin: 0 }}>
                              {review.user?.name || "Anonymous"}
                            </h4>
                            <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 2 }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                  key={star}
                                  size={12}
                                  color={star <= review.rating ? "#f59e0b" : "#e2e8f0"}
                                />
                              ))}
                              <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "Inter-Regular", marginLeft: 4 }}>
                                {review.rating}.0
                              </span>
                            </div>
                          </div>
                          <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "Inter-Regular", marginLeft: "auto" }}>
                            {review.createdAt ? moment.utc(review.createdAt).format("DD MMM") : ""}
                          </span>
                        </div>
                        {/* Review Text */}
                        <p style={{ fontSize: 13, fontFamily: "Inter-Regular", color: "#475569", margin: 0, lineHeight: 1.5 }}>
                          {review.review}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200 }}>
                    <FaStar size={32} color="#e2e8f0" />
                    <p style={{ fontFamily: "Inter-Medium", color: "#94a3b8", marginTop: 8 }}>No Reviews Yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="RideForm" style={{ padding: 0, overflow: "hidden" }}>
            <div
              id="map-container"
              style={{ width: "100%", height: "60vh", minHeight: 350 }}
              ref={mapContainerRef}
            />
          </div>
        )}
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
