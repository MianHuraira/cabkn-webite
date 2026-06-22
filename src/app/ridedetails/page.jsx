"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import moment from "moment/moment";
import { FaLocationDot, FaStar, FaHeart } from "react-icons/fa6";
import { IoCall } from "react-icons/io5";
import { RiMessage2Fill } from "react-icons/ri";
import { MdContentCopy, MdOutlineMyLocation, MdOutlineCalendarMonth, MdOutlineAttachMoney } from "react-icons/md";

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
      setFavLoading(false);
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

    new mapboxgl.Marker({ color: "#059669" })
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
            const marker = new mapboxgl.Marker({ color: "#004a70" })
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
              "line-color": "#004a70",
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
  
  const StatusBadge = ({ status }) => {
    const statusColorMap = {
      completed: { bg: "#e8f5e9", text: "#059669", border: "#a5d6a7" },
      cancelled: { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" },
      accepted: { bg: "#dbeafe", text: "#1d4ed8", border: "#93c5fd" },
      pending: { bg: "#fef3c7", text: "#d97706", border: "#fcd34d" },
      upcoming: { bg: "#f3e8ff", text: "#7e22ce", border: "#d8b4fe" },
      active: { bg: "#ccfbf1", text: "#0f766e", border: "#5eead4" },
    };
    
    const st = statusColorMap[(status || "").toLowerCase()] || { bg: "#f3f4f6", text: "#64748b", border: "#e5e7eb" };
    
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 16px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: "700",
        backgroundColor: st.bg,
        color: st.text,
        border: `1px solid ${st.border}`,
        textTransform: "capitalize",
      }}>
        <span style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: st.text,
        }} />
        {status}
      </span>
    );
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#f8fafc", 
      padding: "24px",
    }}>
      <div style={{ 
        maxWidth: "1320px", 
        margin: "0 auto" 
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "24px",
        }}>
          {/* Main Header */}
          <div style={{
            background: "linear-gradient(135deg, #004a70 0%, #003353 100%)",
            borderRadius: "24px",
            padding: "32px",
            color: "#fff",
          }}>
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}>
              <div style={{ maxWidth: "700px" }}>
                <h1 style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  margin: "0 0 8px",
                  fontFamily: "Inter, sans-serif",
                }}>
                  Booking Details
                </h1>
                <p style={{
                  fontSize: "16px",
                  opacity: "0.85",
                  margin: 0,
                  fontFamily: "Inter, sans-serif",
                }}>
                  {moment(DriveData?.createdAt).format("dddd, DD MMMM YYYY")} • {moment(DriveData?.createdAt).format("hh:mm A")}
                </p>
              </div>
              <StatusBadge status={DriveData?.status} />
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "24px",
          }}>
            {/* Left Column */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}>
              {/* Driver Card */}
              <div style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 4px 20px -6px rgba(0,0,0,0.08)",
                border: "1px solid #e5e7eb",
              }}>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#0f172a",
                  margin: "0 0 16px",
                  fontFamily: "Inter, sans-serif",
                }}>
                  Driver
                </h3>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "16px",
                }}>
                  <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "4px solid #eef2ff",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.06)",
                  }}>
                    <Image
                      width={80}
                      height={80}
                      src={productDetail?.to_id?.image || NoshowData}
                      style={{ width: 80, height: 80, objectFit: "cover" }}
                      alt=""
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      fontSize: "20px",
                      fontWeight: "800",
                      color: "#0f172a",
                      margin: "0 0 4px",
                      fontFamily: "Inter, sans-serif",
                    }}>
                      {productDetail?.to_id?.name}
                    </h4>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "4px",
                    }}>
                      {[1,2,3,4,5].map((star) => (
                        <FaStar
                          key={star}
                          size={16}
                          color={star <= (productDetail?.to_id?.rating || 0) ? "#f59e0b" : "#e5e7eb"}
                        />
                      ))}
                      <span style={{
                        fontSize: "14px",
                        color: "#4b5563",
                        fontWeight: "600",
                        fontFamily: "Inter, sans-serif",
                        marginLeft: "4px"
                      }}>
                        {productDetail?.to_id?.rating || "0"}.0
                      </span>
                    </div>
                    <p style={{
                      fontSize: "13px",
                      color: "#64748b",
                      margin: 0,
                      fontFamily: "Inter, sans-serif",
                    }}>
                      {productDetail?.to_id?.email}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: "flex",
                  gap: "12px",
                }}>
                  <button
                    style={{
                      flex: 1,
                      height: "48px",
                      borderRadius: "12px",
                      border: "none",
                      background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontFamily: "Inter, sans-serif",
                      transition: "all 0.2s",
                      boxShadow: "0 6px 16px rgba(5, 150, 105, 0.25)",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    <IoCall size={18} />
                    Call
                  </button>
                  <button
                    style={{
                      flex: 1,
                      height: "48px",
                      borderRadius: "12px",
                      border: "2px solid #e5e7eb",
                      background: "#fff",
                      color: "#374151",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontFamily: "Inter, sans-serif",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#004a70";
                      e.currentTarget.style.color = "#004a70";
                      e.currentTarget.style.background = "#f0f7ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.color = "#374151";
                      e.currentTarget.style.background = "#fff";
                    }}
                  >
                    <RiMessage2Fill size={18} />
                    Message
                  </button>
                </div>
              </div>

              {/* Vehicle Info */}
              <div style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 4px 20px -6px rgba(0,0,0,0.08)",
                border: "1px solid #e5e7eb",
              }}>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#0f172a",
                  margin: "0 0 16px",
                  fontFamily: "Inter, sans-serif",
                }}>
                  Vehicle
                </h3>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}>
                  <div style={{
                    width: "100px",
                    height: "64px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                    background: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Image
                      src={productDetail?.to_id?.vehicle?.images?.[0] || carAvatar}
                      alt=""
                      width={100}
                      height={64}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: "16px",
                      fontWeight: "800",
                      color: "#0f172a",
                      margin: "0 0 4px",
                      fontFamily: "Inter, sans-serif",
                    }}>
                      {productDetail?.to_id?.vehicle?.brand || "Vehicle"}
                    </h4>
                    <p style={{
                      fontSize: "13px",
                      color: "#64748b",
                      margin: 0,
                      fontFamily: "Inter, sans-serif",
                    }}>
                      License: {productDetail?.to_id?.vehicle?.license || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 4px 20px -6px rgba(0,0,0,0.08)",
                border: "1px solid #e5e7eb",
              }}>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#0f172a",
                  margin: "0 0 12px",
                  fontFamily: "Inter, sans-serif",
                }}>
                  Price
                </h3>
                <p style={{
                  fontSize: "36px",
                  fontWeight: "800",
                  color: "#059669",
                  margin: "0 0 16px",
                  fontFamily: "Inter, sans-serif",
                }}>
                  <MdOutlineAttachMoney size={32} style={{ marginBottom: "4px" }} />
                  {productDetail?.price}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {productDetail?.status === "completed" && !productDetail?.likes && (
                    <button
                      onClick={fav}
                      style={{
                        width: "100%",
                        height: "48px",
                        borderRadius: "12px",
                        border: "2px solid #dc2626",
                        background: "#fff",
                        color: "#dc2626",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "700",
                        fontSize: "14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#dc2626";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#dc2626";
                      }}
                    >
                      {FavLoading ? <Spinner size="sm" /> : (
                        <>
                          <FaHeart size={16} />
                          Add to Favorites
                        </>
                      )}
                    </button>
                  )}
                  {DriveData?.status === "accepted" ? (
                    <button
                      onClick={CancelRide}
                      style={{
                        width: "100%",
                        height: "48px",
                        borderRadius: "12px",
                        border: "none",
                        background: "linear-gradient(135deg, #004a70 0%, #003353 100%)",
                        color: "#fff",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "700",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: "0 6px 16px rgba(0,74,112,0.25)",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      Cancel Ride
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}>
              {/* Route Info */}
              <div style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 4px 20px -6px rgba(0,0,0,0.08)",
                border: "1px solid #e5e7eb",
              }}>
                <h3 style={{
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "#0f172a",
                  margin: "0 0 20px",
                  fontFamily: "Inter, sans-serif",
                }}>
                  Route Information
                </h3>

                <div style={{
                  display: "flex",
                  gap: "16px",
                }}>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: "8px",
                  }}>
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(5,150,105,0.3)",
                    }}>
                      <FaLocationDot color="#fff" size={12} />
                    </div>
                    <div style={{
                      width: "3px",
                      height: "60px",
                      background: "linear-gradient(180deg, #059669 0%, #004a70 100%)",
                      margin: "8px 0",
                    }} />
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "6px",
                      background: "linear-gradient(135deg, #004a70 0%, #003353 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(0,74,112,0.3)",
                    }}>
                      <MdOutlineMyLocation color="#fff" size={12} />
                    </div>
                  </div>

                  <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}>
                    <div>
                      <p style={{
                        fontSize: "13px",
                        color: "#64748b",
                        fontWeight: "600",
                        fontFamily: "Inter, sans-serif",
                        margin: "0 0 6px",
                      }}>
                        PICKUP
                      </p>
                      <p style={{
                        fontSize: "16px",
                        color: "#0f172a",
                        fontWeight: "600",
                        fontFamily: "Inter, sans-serif",
                        margin: 0,
                        lineHeight: "1.4",
                      }}>
                        {productDetail?.start_address}
                      </p>
                    </div>

                    <div>
                      <p style={{
                        fontSize: "13px",
                        color: "#64748b",
                        fontWeight: "600",
                        fontFamily: "Inter, sans-serif",
                        margin: "0 0 6px",
                      }}>
                        DROP-OFF
                      </p>
                      <p style={{
                        fontSize: "16px",
                        color: "#0f172a",
                        fontWeight: "600",
                        fontFamily: "Inter, sans-serif",
                        margin: 0,
                        lineHeight: "1.4",
                      }}>
                        {productDetail?.end_address}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}>
                  <span style={{
                    fontSize: "14px",
                    color: "#374151",
                    fontWeight: "600",
                    fontFamily: "Inter, sans-serif",
                  }}>
                    Pincode:
                  </span>
                  <span style={{
                    fontSize: "15px",
                    color: "#004a70",
                    fontWeight: "800",
                    fontFamily: "Inter, sans-serif",
                  }}>
                    {productDetail?.pincode}
                  </span>
                  <button
                    onClick={copytoClipBoard}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",
                      background: "#f8fafc",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                      color: "#64748b",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#004a70";
                      e.currentTarget.style.color = "#004a70";
                      e.currentTarget.style.background = "#f0f7ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.color = "#64748b";
                      e.currentTarget.style.background = "#f8fafc";
                    }}
                  >
                    <MdContentCopy size={18} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div style={{
                background: "#fff",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 4px 20px -6px rgba(0,0,0,0.08)",
                border: "1px solid #e5e7eb",
              }}>
                <div style={{
                  display: "flex",
                  gap: "8px",
                  padding: "20px 24px 0",
                  borderBottom: "1px solid #e5e7eb",
                  background: "#f8fafc",
                }}>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    style={{
                      padding: "12px 20px",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      border: activeTab === "reviews" ? "1px solid #e5e7eb" : "1px solid transparent",
                      borderBottom: activeTab === "reviews" ? "2px solid #004a70" : "none",
                      background: activeTab === "reviews" ? "#fff" : "transparent",
                      color: activeTab === "reviews" ? "#004a70" : "#64748b",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: activeTab === "reviews" ? "800" : "700",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== "reviews") {
                        e.currentTarget.style.color = "#0f172a";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== "reviews") {
                        e.currentTarget.style.color = "#64748b";
                      }
                    }}
                  >
                    <FaStar size={16} color={activeTab === "reviews" ? "#f59e0b" : "#64748b"} />
                    Reviews
                  </button>
                  <button
                    onClick={() => setActiveTab("track")}
                    style={{
                      padding: "12px 20px",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      border: activeTab === "track" ? "1px solid #e5e7eb" : "1px solid transparent",
                      borderBottom: activeTab === "track" ? "2px solid #004a70" : "none",
                      background: activeTab === "track" ? "#fff" : "transparent",
                      color: activeTab === "track" ? "#004a70" : "#64748b",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: activeTab === "track" ? "800" : "700",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== "track") {
                        e.currentTarget.style.color = "#0f172a";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== "track") {
                        e.currentTarget.style.color = "#64748b";
                      }
                    }}
                  >
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Track on Map
                  </button>
                </div>

                <div style={{
                  padding: "24px",
                }}>
                  {activeTab === "reviews" ? (
                    <div>
                      {Loading ? (
                        <div style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "200px",
                        }}>
                          <Spinner style={{ width: 24, height: 24 }}>Loading...</Spinner>
                        </div>
                      ) : Reviews?.length > 0 ? (
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                          gap: "16px",
                        }}>
                          {Reviews.map((review, index) => (
                            <div
                              key={index}
                              style={{
                                background: "#f8fafc",
                                borderRadius: "16px",
                                border: "1px solid #e5e7eb",
                                padding: "20px",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)";
                                e.currentTarget.style.transform = "translateY(-2px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = "none";
                                e.currentTarget.style.transform = "translateY(0)";
                              }}
                            >
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "14px",
                              }}>
                                <Image
                                  src={review.user?.image || NoshowData}
                                  width={48}
                                  height={48}
                                  alt=""
                                  style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "2px solid #fff",
                                    boxShadow: "0 4px 8px rgba(0,0,0,0.06)"
                                  }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <h4 style={{
                                    fontSize: "15px",
                                    fontFamily: "Inter, sans-serif",
                                    fontWeight: "800",
                                    color: "#0f172a",
                                    margin: "0 0 4px",
                                  }}>
                                    {review.user?.name || "Anonymous"}
                                  </h4>
                                  <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <FaStar
                                        key={star}
                                        size={14}
                                        color={star <= review.rating ? "#f59e0b" : "#e5e7eb"}
                                      />
                                    ))}
                                    <span style={{
                                      fontSize: "12px",
                                      color: "#94a3b8",
                                      fontFamily: "Inter, sans-serif",
                                      fontWeight: "600",
                                      marginLeft: "6px",
                                    }}>
                                      {review.rating}.0
                                    </span>
                                  </div>
                                </div>
                                <span style={{
                                  fontSize: "12px",
                                  color: "#94a3b8",
                                  fontFamily: "Inter, sans-serif",
                                  fontWeight: "600",
                                }}>
                                  {review.createdAt ? moment.utc(review.createdAt).format("DD MMM") : ""}
                                </span>
                              </div>
                              <p style={{
                                fontSize: "14px",
                                fontFamily: "Inter, sans-serif",
                                color: "#475569",
                                margin: 0,
                                lineHeight: "1.6",
                              }}>
                                {review.review}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "240px",
                          gap: "12px",
                        }}>
                          <div style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            background: "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                            <FaStar size={36} color="#cbd5e1" />
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <h4 style={{
                              fontSize: "18px",
                              fontWeight: "700",
                              color: "#374151",
                              margin: "0 0 6px",
                              fontFamily: "Inter, sans-serif",
                            }}>
                              No Reviews Yet
                            </h4>
                            <p style={{
                              fontSize: "14px",
                              color: "#94a3b8",
                              margin: 0,
                              fontFamily: "Inter, sans-serif",
                            }}>
                              Be the first to leave a review!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      overflow: "hidden",
                      borderRadius: "16px",
                      border: "1px solid #e5e7eb",
                    }}>
                      <div
                        id="map-container"
                        style={{
                          width: "100%",
                          height: "500px",
                          borderRadius: "16px",
                        }}
                        ref={mapContainerRef}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const page = () => {
  return (
    <Suspense fallback={
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}>
        <Spinner animation="border" style={{ width: 32, height: 32 }} />
      </div>
    }>
      <RideDetail />
    </Suspense>
  );
};

export default page;
