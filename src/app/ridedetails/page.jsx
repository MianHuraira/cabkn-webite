"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import moment from "moment/moment";
import { FaLocationDot, FaStar, FaHeart, FaBox } from "react-icons/fa6";
import { IoCall, IoShieldCheckmark, IoCarSport } from "react-icons/io5";
import { RiMessage2Fill, RiRouteLine, RiFileCopyLine, RiCheckLine } from "react-icons/ri";
import {
  MdOutlineMyLocation,
  MdOutlineCalendarMonth,
  MdOutlineReceiptLong,
  MdOutlineMap,
  MdOutlineRateReview,
  MdOutlineAirlineSeatReclineNormal,
  MdOutlineCreditCard,
  MdZoomOutMap,
  MdOutlinePlace,
} from "react-icons/md";
import { FiArrowLeft, FiMail, FiShield } from "react-icons/fi";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import Link from "next/link";
import { carAvatar, NoshowData } from "@/components/assets/Images";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useSearchParams, useRouter } from "next/navigation";
import { message } from "antd";
import { useSocket } from "@/components/ApiFunction/SoketProvider";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

// =========================================================================
// SKELETON LOADERS (No Spinners - Pure Shimmer Layouts)
// =========================================================================
const RideDetailSkeleton = () => (
  <div className="min-h-screen bg-[#f8fafc] font-poppins text-slate-800">
    {/* Hero Banner Skeleton */}
    <section className="relative overflow-hidden bg-gradient-to-br from-[#001726] via-[#002f4a] to-[#001f33] !pt-20 sm:!pt-28 !pb-12 sm:!pb-14 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
          <div className="flex items-center gap-2">
            <div className="h-4 w-12 rounded bg-white/15 animate-pulse" />
            <span className="text-slate-500 text-xs">/</span>
            <div className="h-4 w-20 rounded bg-white/15 animate-pulse" />
            <span className="text-slate-500 text-xs">/</span>
            <div className="h-4 w-24 rounded bg-white/20 animate-pulse" />
          </div>
          <div className="h-5 w-20 rounded-full bg-white/10 animate-pulse" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="h-6 sm:h-7 w-36 sm:w-44 rounded-lg bg-white/20 animate-pulse" />
              <div className="h-5 w-24 rounded-full bg-white/15 animate-pulse" />
            </div>
            <div className="h-3.5 w-48 sm:w-56 rounded bg-white/10 animate-pulse" />
          </div>
          <div className="h-8 sm:h-9 w-28 sm:w-32 rounded-xl bg-white/10 animate-pulse" />
        </div>
      </div>
    </section>

    {/* Cockpit Cards Skeleton */}
    <div className="!-mt-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-20 !pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-start">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 z-10">
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 !border !border-slate-200/90 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 flex-1">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-200 animate-pulse shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-3.5 w-28 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-36 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex gap-1">
                <div className="w-7 h-7 rounded-lg bg-slate-100 animate-pulse" />
                <div className="w-7 h-7 rounded-lg bg-slate-100 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="h-3.5 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="w-full h-36 sm:h-40 rounded-xl bg-slate-200 animate-pulse" />
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="h-3.5 w-full bg-slate-100 rounded animate-pulse" />
              <div className="h-3.5 w-full bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 !border !border-slate-200/90 shadow-sm space-y-3.5">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <div className="h-3.5 w-28 bg-slate-200 rounded animate-pulse" />
              <div className="h-5 w-20 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-3/4 bg-slate-200 rounded animate-pulse" />
              <div className="h-3.5 w-2/3 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <div className="h-7 w-32 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-7 w-32 rounded-full bg-slate-100 animate-pulse" />
            </div>
            <div className="h-[280px] sm:h-[320px] w-full rounded-xl bg-slate-200 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ReviewCardsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="bg-slate-50/80 rounded-xl p-3 !border !border-slate-200/70 space-y-2"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-200 animate-pulse shrink-0" />
          <div className="space-y-1 flex-1">
            <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
            <div className="h-2 w-14 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-1 pt-0.5">
          <div className="h-2.5 w-full bg-slate-100 rounded animate-pulse" />
          <div className="h-2.5 w-4/5 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

// =========================================================================
// MAIN RIDE DETAIL COMPONENT
// =========================================================================
const RideDetail = () => {
  const router = useRouter();
  const { header1, putData, getData, postData } = ApiFunction();
  const [productDetail, setProductDetail] = useState(null);
  const searchParams = useSearchParams();
  const socket = useSocket();
  const [activeTab, setActiveTab] = useState("map");
  const [Reviews, setReviews] = useState([]);
  const [Loading, setLoading] = useState(false);
  const [FavLoading, setFavLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Review state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Extract initial ride data safely from sessionStorage or search params
  const [initialData, setInitialData] = useState(() => {
    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        const stored = sessionStorage.getItem("selected_ride");
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("sessionStorage error:", e);
      }
    }
    const encodedData = searchParams?.get("data");
    if (encodedData) {
      try {
        return JSON.parse(decodeURIComponent(encodedData));
      } catch (e) {
        console.error("URL decode error:", e);
      }
    }
    return null;
  });

  const queryId =
    searchParams?.get("id") ||
    searchParams?.get("orderId") ||
    searchParams?.get("order_id");
  const orderId = queryId || initialData?._id || initialData?.order_id;
  const currentOrder = productDetail || initialData;
  const DriveData = currentOrder;

  const mapRef = useRef();
  const mapContainerRef = useRef();
  const markersRef = useRef([]);
  const [activeFocusedLocation, setActiveFocusedLocation] = useState(null);

  const getDetail = async () => {
    if (!orderId) {
      setDetailLoading(false);
      return;
    }
    setDetailLoading(true);
    try {
      const res = await getData(`order/detail/${orderId}`, header1);
      if (res?.order) {
        setProductDetail(res.order);
      }
    } catch (error) {
      console.log("Error loading ride details:", error?.response?.data || error);
    } finally {
      setDetailLoading(false);
    }
  };

  const getReviews = async (driverId) => {
    const idToUse = driverId || currentOrder?.to_id?._id;
    if (!idToUse) return;
    setLoading(true);
    try {
      const response = await getData("rating/all/" + idToUse, header1);
      setReviews(response?.ratings || []);
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDetail();
  }, [orderId]);

  useEffect(() => {
    if (currentOrder?.to_id?._id) {
      getReviews(currentOrder.to_id._id);
    }
  }, [currentOrder?.to_id?._id]);

  const fav = async () => {
    const driverId = currentOrder?.to_id?._id;
    if (!driverId) return;
    setFavLoading(true);
    try {
      const res = await putData(`users/like/${driverId}`, {}, header1);
      if (res?.message) {
        getDetail();
        messageApi.success("Driver added to favorites!");
      }
    } catch (error) {
      setFavLoading(false);
    } finally {
      setFavLoading(false);
    }
  };

  const submitReview = async () => {
    if (!reviewText.trim()) {
      messageApi.warning("Please write a review before submitting");
      return;
    }
    setReviewLoading(true);
    try {
      const body = {
        to_id: currentOrder?.to_id?._id,
        orderId: currentOrder?._id,
        rating: reviewRating,
        review: reviewText,
      };
      const res = await postData("rating/create", body, header1);
      if (res?.success) {
        messageApi.success("Review submitted successfully!");
        setReviewSubmitted(true);
        setShowReviewForm(false);
        setReviewText("");
        // Refresh reviews list on right panel
        if (currentOrder?.to_id?._id) getReviews(currentOrder.to_id._id);
      } else {
        messageApi.error(res?.message || "Failed to submit review");
      }
    } catch (err) {
      messageApi.error("Something went wrong");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleConfirmCancel = () => {
    if (socket && orderId) {
      setCancelLoading(true);
      const body = { orderId: orderId };
      const endpoint = "cancel-order-customer";
      socket.emit(endpoint, body, (res) => {
        setCancelLoading(false);
        setShowCancelModal(false);
        if (res?.success || res?.message) {
          messageApi.success(res?.message || "Ride cancelled successfully");
        } else {
          messageApi.error(res?.message || "Ride not found or cannot be cancelled.");
        }
        getDetail();
      });
    } else {
      setShowCancelModal(false);
      messageApi.error("Ride not found or cannot be cancelled.");
    }
  };

  mapboxgl.accessToken =
    "pk.eyJ1IjoibWFybGVncmFudCIsImEiOiJjbTgwdmV0MjkweXB2MnFzNXBjM2x6NThnIn0.3oz3YGaDHiFDh8W5ALk09w";

  const getStartCoords = (order) => {
    if (order?.start_location?.coordinates && Array.isArray(order.start_location.coordinates) && order.start_location.coordinates.length === 2) {
      const lng = Number(order.start_location.coordinates[0]);
      const lat = Number(order.start_location.coordinates[1]);
      if (!isNaN(lng) && !isNaN(lat)) return [lng, lat];
    }
    if (order?.start_lng && order?.start_lat) {
      const lng = Number(order.start_lng);
      const lat = Number(order.start_lat);
      if (!isNaN(lng) && !isNaN(lat)) return [lng, lat];
    }
    if (order?.start && Array.isArray(order.start) && order.start.length === 2) {
      const lng = Number(order.start[0]);
      const lat = Number(order.start[1]);
      if (!isNaN(lng) && !isNaN(lat)) return [lng, lat];
    }
    return [-62.754593, 17.363747];
  };

  const getEndCoords = (order) => {
    if (order?.end_location?.coordinates && Array.isArray(order.end_location.coordinates) && order.end_location.coordinates.length === 2) {
      const lng = Number(order.end_location.coordinates[0]);
      const lat = Number(order.end_location.coordinates[1]);
      if (!isNaN(lng) && !isNaN(lat)) return [lng, lat];
    }
    if (order?.end_lng && order?.end_lat) {
      const lng = Number(order.end_lng);
      const lat = Number(order.end_lat);
      if (!isNaN(lng) && !isNaN(lat)) return [lng, lat];
    }
    if (order?.end && Array.isArray(order.end) && order.end.length === 2) {
      const lng = Number(order.end[0]);
      const lat = Number(order.end[1]);
      if (!isNaN(lng) && !isNaN(lat)) return [lng, lat];
    }
    return [-62.684593, 17.313747];
  };

  const getStopsList = (order) => {
    const rawStops = order?.stops || order?.stop || [];
    if (!Array.isArray(rawStops)) return [];
    return rawStops
      .map((s, idx) => {
        let lng = s.longitude ?? s.lng ?? s.coordinates?.[0];
        let lat = s.latitude ?? s.lat ?? s.coordinates?.[1];
        return {
          lng: Number(lng),
          lat: Number(lat),
          title: s.title || s.name || s.address || `Stop ${idx + 1}`,
        };
      })
      .filter((s) => !isNaN(s.lng) && !isNaN(s.lat));
  };

  const zoomToLocation = (lng, lat, title = "") => {
    if (!mapRef.current) return;
    const numLng = Number(lng);
    const numLat = Number(lat);
    if (isNaN(numLng) || isNaN(numLat)) return;

    setActiveFocusedLocation(title || `${numLat.toFixed(4)}, ${numLng.toFixed(4)}`);

    mapRef.current.flyTo({
      center: [numLng, numLat],
      zoom: 16,
      pitch: 25,
      duration: 1500,
      essential: true,
    });

    const matching = markersRef.current.find((m) => {
      const pos = m.marker.getLngLat();
      return Math.abs(pos.lng - numLng) < 0.0005 && Math.abs(pos.lat - numLat) < 0.0005;
    });

    if (matching && !matching.marker.getPopup()?.isOpen()) {
      matching.marker.togglePopup();
    }
  };

  const fitFullRoute = () => {
    if (!mapRef.current || !currentOrder) return;
    setActiveFocusedLocation(null);

    const start = getStartCoords(currentOrder);
    const end = getEndCoords(currentOrder);
    const stops = getStopsList(currentOrder);

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend(start);
    bounds.extend(end);
    stops.forEach((s) => bounds.extend([s.lng, s.lat]));

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, {
        padding: { top: 65, bottom: 65, left: 45, right: 45 },
        maxZoom: 15,
        duration: 1200,
      });
    }
  };

  const locationSet = () => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const start = getStartCoords(currentOrder);
    const end = getEndCoords(currentOrder);
    const stops = getStopsList(currentOrder);

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: start,
      zoom: 12,
      projection: "mercator",
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    map.on("load", async () => {
      // Clear old markers
      markersRef.current.forEach((m) => m.marker.remove());
      markersRef.current = [];

      const bounds = new mapboxgl.LngLatBounds();
      const validPoints = [];

      // 1. Start Marker 🔵
      const startEl = document.createElement("div");
      startEl.className =
        "flex items-center justify-center w-8 h-8 rounded-full bg-[#004a70] text-white shadow-lg border-2 border-white ring-2 ring-sky-300 animate-pulse cursor-pointer";
      startEl.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 384 512" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"></path></svg>`;

      const startMarker = new mapboxgl.Marker({ element: startEl })
        .setLngLat(start)
        .setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: true }).setHTML(`
            <div style="min-width: 170px; padding: 2px 4px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #004a70;"></span>
                <span style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #004a70;">Pickup Location</span>
              </div>
              <p style="font-size: 12px; font-weight: 600; color: #1e293b; margin: 0; line-height: 1.35;">${currentOrder?.start_address || "Pickup location"}</p>
            </div>
          `)
        )
        .addTo(map);

      markersRef.current.push({ marker: startMarker, type: "start" });
      bounds.extend(start);
      validPoints.push(start);

      // 2. Stops Markers 🟡
      stops.forEach((stop, idx) => {
        const stopEl = document.createElement("div");
        stopEl.className =
          "flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md border-2 border-white cursor-pointer transition-transform hover:scale-110";
        stopEl.innerText = `${idx + 1}`;

        const stopMarker = new mapboxgl.Marker({ element: stopEl })
          .setLngLat([stop.lng, stop.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 20, closeButton: true }).setHTML(`
              <div style="min-width: 170px; padding: 2px 4px;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                  <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #f59e0b;"></span>
                  <span style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #d97706;">Stop ${idx + 1}</span>
                </div>
                <p style="font-size: 12px; font-weight: 600; color: #1e293b; margin: 0; line-height: 1.35;">${stop.title || "Attraction"}</p>
              </div>
            `)
          )
          .addTo(map);

        markersRef.current.push({ marker: stopMarker, type: "stop", index: idx });
        bounds.extend([stop.lng, stop.lat]);
        validPoints.push([stop.lng, stop.lat]);
      });

      // 3. End Marker 🔴
      const endEl = document.createElement("div");
      endEl.className =
        "flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 text-white shadow-lg border-2 border-white ring-2 ring-rose-300 cursor-pointer";
      endEl.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 384 512" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"></path></svg>`;

      const endMarker = new mapboxgl.Marker({ element: endEl })
        .setLngLat(end)
        .setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: true }).setHTML(`
            <div style="min-width: 170px; padding: 2px 4px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #e11d48;"></span>
                <span style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #e11d48;">Destination</span>
              </div>
              <p style="font-size: 12px; font-weight: 600; color: #1e293b; margin: 0; line-height: 1.35;">${currentOrder?.end_address || "Drop-off Location"}</p>
            </div>
          `)
        )
        .addTo(map);

      markersRef.current.push({ marker: endMarker, type: "end" });
      bounds.extend(end);
      validPoints.push(end);

      // 4. Fetch Driving Route Polyline with Fallback
      let routeGeo = null;
      try {
        const routePoints = validPoints
          .map((p) => `${p[0].toFixed(6)},${p[1].toFixed(6)}`)
          .join(";");

        const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${routePoints}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;
        const res = await fetch(directionsUrl);
        const data = await res.json();

        if (data.routes && data.routes.length > 0 && data.routes[0].geometry) {
          routeGeo = data.routes[0].geometry;
        }
      } catch (e) {
        console.warn("Mapbox driving directions error, fallback to direct line:", e);
      }

      if (!routeGeo || !routeGeo.coordinates || routeGeo.coordinates.length === 0) {
        routeGeo = {
          type: "LineString",
          coordinates: validPoints,
        };
      }

      if (routeGeo) {
        if (map.getSource("route")) {
          map.getSource("route").setData({
            type: "Feature",
            properties: {},
            geometry: routeGeo,
          });
        } else {
          map.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: routeGeo,
            },
          });

          // Background Casing for Route Glow
          map.addLayer({
            id: "route-casing",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#002842",
              "line-width": 7.5,
              "line-opacity": 0.45,
            },
          });

          // Core Route Line
          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#004a70",
              "line-width": 4.5,
              "line-opacity": 0.95,
            },
          });
        }
      }

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: { top: 65, bottom: 65, left: 45, right: 45 },
          maxZoom: 15,
          duration: 1000,
        });
      }

      map.resize();
    });
  };

  useEffect(() => {
    if (activeTab === "map" && (productDetail || currentOrder)) {
      locationSet();
    } else {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (currentOrder?.to_id?._id) {
        getReviews(currentOrder.to_id._id);
      }
    }
  }, [activeTab, productDetail, currentOrder]);

  const copytoClipBoard = () => {
    const code = currentOrder?.pincode;
    if (!code) {
      messageApi.info("No pincode available");
      return;
    }
    const textToCopy = String(code);
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          setCopied(true);
          messageApi.success("Pincode copied to clipboard!");
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => fallbackCopy(textToCopy));
    } else {
      fallbackCopy(textToCopy);
    }
  };

  const fallbackCopy = (text) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      messageApi.success("Pincode copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      messageApi.error("Failed to copy");
    }
  };

  const statusConfig = {
    completed: {
      label: "Completed",
      badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      dot: "bg-emerald-400",
    },
    accepted: {
      label: "Driver Assigned",
      badge: "bg-sky-500/15 text-sky-300 border-sky-500/30",
      dot: "bg-sky-400",
    },
    pending: {
      label: "Searching Driver",
      badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      dot: "bg-amber-400",
    },
    cancelled: {
      label: "Cancelled",
      badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
      dot: "bg-rose-400",
    },
    active: {
      label: "Trip in Progress",
      badge: "bg-teal-500/15 text-teal-300 border-teal-500/30",
      dot: "bg-teal-400",
    },
  };

  const currentStatus = (currentOrder?.status || "pending").toLowerCase();
  const statusMeta = statusConfig[currentStatus] || {
    label: currentOrder?.status || "Confirmed",
    badge: "bg-white/10 text-slate-200 border-white/20",
    dot: "bg-slate-300",
  };

  // If initial load without any data, show skeleton
  if (detailLoading && !currentOrder) {
    return <RideDetailSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-poppins text-slate-800">
      {contextHolder}

      {/* ========================================================================= */}
      {/* 1. HERO TOP BANNER (Compact & Clean on Mobile/Desktop)                     */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#001726] via-[#002f4a] to-[#001f33] !pt-20 sm:!pt-28 !pb-12 sm:!pb-14 text-white">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001726]/90 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          {/* Row 1: Breadcrumb row & Order ID Badge */}
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-family-medium">
              <Link href="/" className="text-slate-300 hover:text-white transition-colors no-underline">
                Home
              </Link>
              <span className="text-slate-400">/</span>
              <Link href="/admin" className="text-slate-300 hover:text-white transition-colors no-underline">
                My Bookings
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-white">Booking Details</span>
            </div>

            {currentOrder?.order_id && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 !border !border-white/15 text-xs font-family-medium text-slate-200">
                #{currentOrder.order_id}
              </span>
            )}
          </div>

          {/* Row 2: Title, Status Badge & Price Tag */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-family-semibold text-white tracking-tight !m-0 leading-tight">
                  Booking Details
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-family-medium !border backdrop-blur-md ${statusMeta.badge}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${statusMeta.dot}`} />
                  {statusMeta.label}
                </span>

                {currentOrder?.isAirportPickup && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs !font-family-semibold bg-sky-500/20 text-sky-200 !border !border-sky-400/30">
                    ✈️ Airport Pickup {currentOrder?.flightNumber ? `• Flight ${currentOrder.flightNumber}` : ""}
                  </span>
                )}

                {(currentOrder?.type === "parcel" || currentOrder?.rideType === "parcel" || currentOrder?.parcelTitle) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs !font-family-semibold bg-amber-500/20 text-amber-200 !border !border-amber-400/30">
                    📦 Parcel Delivery {currentOrder?.title || currentOrder?.parcelTitle ? `• ${currentOrder.title || currentOrder.parcelTitle}` : ""}
                  </span>
                )}
              </div>

              <p className="text-slate-300 text-xs font-family-regular !mt-1 !m-0 flex items-center gap-1.5">
                <MdOutlineCalendarMonth size={13} className="text-sky-300" />
                {moment(currentOrder?.createdAt).format("dddd, DD MMMM YYYY")} • {moment(currentOrder?.createdAt).format("hh:mm A")}
              </p>
            </div>

            {/* Quick Price Badge */}
            <div className="bg-white/10 backdrop-blur-md !border !border-white/15 rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-300 font-family-medium">
                Total:
              </span>
              <span className="text-base sm:text-xl font-family-semibold text-white">
                ${Number(currentOrder?.price || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </section>


      <div className="!-mt-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-20 !pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-start">


          <div className="lg:col-span-5 lg:sticky lg:top-20 z-10">
            <div className="bg-white rounded-2xl p-3.5 sm:p-4 !border !border-slate-200/90 shadow-sm space-y-3.5">

              {/* 1. DRIVER ROW */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden !border !border-slate-200 bg-slate-100 shadow-xs">
                      <Image
                        width={44}
                        height={44}
                        src={currentOrder?.to_id?.image || NoshowData}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 !border-2 !border-white" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs sm:text-sm font-family-semibold text-slate-900 !m-0 truncate">
                        {currentOrder?.to_id?.name || "Assigned Driver"}
                      </h3>
                      {currentOrder?.to_id?.rating && (
                        <span className="inline-flex items-center gap-0.5 text-[10.5px] font-family-semibold text-amber-600 bg-amber-50 px-1 py-0.2 rounded !border !border-amber-200/50">
                          <FaStar size={9} className="text-amber-500" />
                          {currentOrder?.to_id?.rating}.0
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-family-regular !m-0 mt-0.5 truncate flex items-center gap-1">
                      <FiMail size={10} /> {currentOrder?.to_id?.email || "driver@cabkn.com"}
                    </p>
                  </div>
                </div>

                {/* Driver Action Buttons */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <a
                    href={`tel:${currentOrder?.to_id?.phone || ""}`}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 !border !border-emerald-200/80 flex items-center justify-center transition-colors no-underline"
                    title="Call Driver"
                  >
                    <IoCall size={13} />
                  </a>
                  <button
                    onClick={() => router.push("/chat")}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 !border !border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                    title="Message Driver"
                  >
                    <RiMessage2Fill size={13} />
                  </button>
                </div>
              </div>

              {/* 2. VEHICLE BIG PICTURE SHOWCASE */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-family-semibold text-slate-700 flex items-center gap-1">
                    <IoCarSport size={14} className="text-[#004a70]" />
                    {currentOrder?.to_id?.vehicle?.brand || currentOrder?.to_id?.vehicle?.name || "Standard Fleet Vehicle"}
                  </span>
                  {currentOrder?.to_id?.vehicle?.license && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 !border !border-slate-200 text-slate-700 text-[10.5px] font-family-semibold">
                      {currentOrder?.to_id?.vehicle?.license}
                    </span>
                  )}
                </div>

                {/* Big Vehicle Photo */}
                <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden !border !border-slate-200/80 bg-slate-50 relative group">
                  <Image
                    src={currentOrder?.to_id?.vehicle?.images?.[0] || carAvatar}
                    alt="Vehicle"
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between bg-black/60 backdrop-blur-md rounded-lg px-2 py-0.5 text-white text-[10.5px]">
                    <span className="font-family-medium">
                      Color: {currentOrder?.to_id?.vehicle?.colour || "Black"}
                    </span>
                    <span className="font-family-medium flex items-center gap-1">
                      <MdOutlineAirlineSeatReclineNormal size={12} />
                      {currentOrder?.to_id?.vehicle?.num_passengers || 4} Passengers
                    </span>
                  </div>
                </div>
              </div>

              {/* 2.5 PARCEL ITEM DETAILS CARD */}
              {(currentOrder?.type === "parcel" || currentOrder?.rideType === "parcel" || currentOrder?.parcelTitle) && (
                <div className="!p-3 !bg-amber-50/70 !rounded-xl !border !border-amber-200/80 !space-y-2">
                  <div className="!flex !items-center !justify-between">
                    <span className="!text-xs !font-family-semibold !text-amber-900 !flex !items-center !gap-1.5">
                      <FaBox size={13} className="!text-amber-700" />
                      Parcel Item Details
                    </span>
                    <span className="!text-[10.5px] !font-family-semibold !text-amber-700 !bg-white !px-2 !py-0.5 !rounded-md !border !border-amber-200 !shadow-2xs">
                      Courier Package
                    </span>
                  </div>

                  <div className="!flex !items-center !gap-3">
                    {currentOrder?.image || currentOrder?.parcelImage ? (
                      <img
                        src={currentOrder.image || currentOrder.parcelImage}
                        alt={currentOrder?.title || currentOrder?.parcelTitle || "Parcel"}
                        className="!w-14 !h-14 !rounded-lg !object-cover !border !border-amber-200 !shadow-xs !shrink-0"
                      />
                    ) : (
                      <div className="!w-14 !h-14 !rounded-lg !bg-amber-100/90 !text-amber-700 !flex !items-center !justify-center !shrink-0 !border !border-amber-200">
                        <FaBox size={22} />
                      </div>
                    )}
                    <div className="!min-w-0 !flex-1">
                      <h4 className="!text-xs sm:!text-sm !font-family-semibold !text-slate-900 !m-0 !truncate">
                        {currentOrder?.title || currentOrder?.parcelTitle || "Package / Parcel"}
                      </h4>
                      <p className="!text-[11px] !text-slate-500 !font-family-regular !m-0 !mt-0.5">
                        Direct delivery from pickup to destination
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. INTEGRATED PAYMENT RECEIPT SECTION */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-family-semibold text-slate-800 flex items-center gap-1.5">
                    <MdOutlineReceiptLong size={14} className="text-emerald-600" />
                    Fare Breakdown
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10.5px] font-family-medium !border !border-emerald-200/60 capitalize flex items-center gap-1">
                    <MdOutlineCreditCard size={11} />
                    {currentOrder?.paymentType || "Cash"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs bg-slate-50/70 p-2.5 rounded-xl !border !border-slate-100">
                  {currentOrder?.distance > 0 && (
                    <div className="flex justify-between text-slate-500 font-family-regular">
                      <span>Base Distance ({currentOrder.distance} km)</span>
                      <span className="text-slate-800 font-family-medium">
                        ${Number(currentOrder?.price || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {currentOrder?.convenienceFee > 0 && (
                    <div className="flex justify-between text-slate-500 font-family-regular">
                      <span>Platform Fee</span>
                      <span className="text-slate-800 font-family-medium">
                        ${Number(currentOrder?.convenienceFee).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {currentOrder?.isAirportPickup && Number(currentOrder?.luggageFee || 0) > 0 && (
                    <div className="flex justify-between text-slate-500 font-family-regular">
                      <span>Luggage ({currentOrder?.luggageCount || 0} pieces)</span>
                      <span className="text-slate-800 font-family-medium">
                        ${Number(currentOrder?.luggageFee).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {currentOrder?.tip > 0 && (
                    <div className="flex justify-between text-slate-500 font-family-regular">
                      <span>Driver Tip</span>
                      <span className="text-slate-800 font-family-medium">
                        ${Number(currentOrder?.tip).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {currentOrder?.specialDiscountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-family-medium">
                      <span>Discount</span>
                      <span>-${Number(currentOrder?.specialDiscountAmount).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="pt-1.5 border-t border-slate-200/60 flex justify-between items-center text-xs">
                    <span className="font-family-semibold text-slate-900">Total Paid</span>
                    <span className="font-family-semibold text-emerald-600 text-sm">
                      ${Number(currentOrder?.price || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Driver Actions */}
              {/* Add to Favorites */}
              {currentOrder?.status === "completed" && !currentOrder?.likes && (
                <button
                  onClick={fav}
                  className="w-full h-8 rounded-xl !border !border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-600 text-xs font-family-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FaHeart size={11} /> Add Driver to Favorites
                </button>
              )}

              {/* ── Review Section (completed rides only) ── */}
              {currentOrder?.status === "completed" && (
                <div className="space-y-2">
                  {reviewSubmitted ? (
                    <div
                      className="w-full h-9 rounded-xl flex items-center justify-center gap-1.5 text-xs font-family-semibold text-emerald-700"
                      style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
                    >
                      <FaStar size={11} className="text-emerald-500" />
                      Review Submitted — Thank you!
                    </div>
                  ) : (
                    <>
                      {/* Toggle Button */}
                      <button
                        onClick={() => setShowReviewForm((p) => !p)}
                        className="w-full h-9 rounded-xl text-xs font-family-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer"
                        style={{
                          background: showReviewForm ? "#fffbeb" : "#fff",
                          border: `1px solid ${showReviewForm ? "#fde68a" : "#e2e8f0"}`,
                          color: showReviewForm ? "#b45309" : "#475569",
                        }}
                      >
                        <FaStar size={11} className={showReviewForm ? "text-amber-400" : "text-slate-400"} />
                        {showReviewForm ? "Close Review" : "Write a Review"}
                      </button>

                      {/* Inline Review Form — Premium Design */}
                      {showReviewForm && (
                        <div
                          className="rounded-2xl overflow-hidden shadow-sm"
                          style={{ border: "1px solid #e8edf2", background: "#fff" }}
                        >
                          {/* Form Header */}
                          <div className="flex items-center gap-2 !px-4 !pt-4 !pb-3" style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <span className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                              <FaStar size={13} className="text-amber-400" />
                            </span>
                            <span className="text-[13px] font-family-bold text-slate-900">Leave a Review</span>
                          </div>

                          <div className="px-4 pb-4 pt-3 space-y-3">
                            {/* Rating */}
                            <div>
                              <p className="text-[11px] font-family-bold text-slate-700 !mb-2">Your Rating</p>
                              <div className="flex items-center justify-between">
                                {/* Green Stars */}
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setReviewRating(star)}
                                      className="cursor-pointer !border-none bg-transparent p-0.5 transition-transform hover:scale-110 active:scale-95"
                                    >
                                      <FaStar
                                        size={24}
                                        style={{ color: star <= reviewRating ? "#22c55e" : "#e2e8f0" }}
                                      />
                                    </button>
                                  ))}
                                </div>
                                {/* Score Badge */}
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-family-bold"
                                  style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
                                >
                                  <FaStar size={8} className="text-green-500" />
                                  {reviewRating}.0 / 5.0
                                </span>
                              </div>
                              {/* Label Row */}
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[11px] font-family-semibold" style={{ color: "#16a34a" }}>
                                  {reviewRating === 5 ? "Exceptional! 🤩"
                                    : reviewRating === 4 ? "Great! 😊"
                                    : reviewRating === 3 ? "Good 🙂"
                                    : reviewRating === 2 ? "Fair 😐"
                                    : "Poor 😞"}
                                </span>
                                <span className="text-[10px] text-slate-400 font-family-regular">Tap to adjust</span>
                              </div>
                            </div>

                            {/* Feedback */}
                            <div>
                              <p className="text-[11px] font-family-bold text-slate-700 !mb-2">Your Feedback</p>
                              <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Share your experience with this driver..."
                                rows={3}
                                className="w-full text-xs font-family-regular text-slate-700 placeholder-slate-400 rounded-xl px-3 py-2.5 resize-none outline-none transition-colors"
                                style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}
                                onFocus={(e) => { e.target.style.borderColor = "#004a70"; e.target.style.background = "#fff"; }}
                                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; }}
                              />
                            </div>

                            {/* Submit */}
                            <button
                              onClick={submitReview}
                              disabled={reviewLoading}
                              className="w-full h-10 rounded-xl text-white text-xs font-family-bold flex items-center justify-center gap-1.5 cursor-pointer !border-none transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
                              style={{ background: "linear-gradient(135deg, #003855 0%, #004a70 50%, #006090 100%)" }}
                            >
                              {reviewLoading ? (
                                <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                "Submit Review"
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {(currentOrder?.status === "accepted" || currentOrder?.status === "pending" || currentOrder?.status === "driver_assigned") && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full h-8 rounded-xl !border !border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-family-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  Cancel Ride
                </button>
              )}
            </div>
          </div>

          {/* ======================================================================= */}
          {/* RIGHT PANEL (7 cols): SINGLE UNIFIED ROUTE + TABBED MAP/REVIEWS CARD   */}
          {/* ======================================================================= */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-3.5 sm:p-4 !border !border-slate-200/90 shadow-sm space-y-3.5">

              {/* 1. ROUTE & VERIFICATION STRIP */}
              <div className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <RiRouteLine size={14} className="text-[#004a70]" />
                    <span className="text-xs font-family-semibold text-slate-900">
                      Route & Verification
                    </span>
                  </div>

                  {currentOrder?.pincode && (
                    <div className="flex items-center gap-1.5 bg-slate-50 !border !border-slate-200/80 rounded-lg px-2 py-0.5">
                      <FiShield size={11} className="text-[#004a70]" />
                      <span className="text-[10.5px] text-slate-500 font-family-regular">PIN:</span>
                      <span className="text-xs font-family-semibold text-[#004a70] tracking-wider">
                        {currentOrder.pincode}
                      </span>
                      <button
                        onClick={copytoClipBoard}
                        className="ml-1 text-slate-400 hover:text-[#004a70] transition-colors cursor-pointer !border-0 bg-transparent p-0 flex items-center"
                        title="Copy Pincode"
                      >
                        {copied ? <RiCheckLine size={12} className="text-emerald-600" /> : <RiFileCopyLine size={11} />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Stepper with compact responsive spacing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-slate-50/70 p-2.5 rounded-xl !border !border-slate-100">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <FaLocationDot size={8} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9.5px] font-family-semibold uppercase tracking-wider text-emerald-600 block leading-tight">
                        Pickup Location
                      </span>
                      <p className="text-[11.5px] font-family-medium text-slate-800 !m-0 leading-snug break-words">
                        {currentOrder?.start_address || "Nevis Island"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-md bg-[#004a70] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <MdOutlineMyLocation size={9} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9.5px] font-family-semibold uppercase tracking-wider text-[#004a70] block leading-tight">
                        Destination
                      </span>
                      <p className="text-[11.5px] font-family-medium text-slate-800 !m-0 leading-snug break-words">
                        {currentOrder?.end_address || "Saint Kitts"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. SWIPER TAB BUTTONS (Smooth FreeMode Swiper with Primary Color Pills) */}
              <div className="w-full max-w-full overflow-hidden">
                <Swiper
                  modules={[FreeMode, Mousewheel]}
                  slidesPerView="auto"
                  spaceBetween={8}
                  freeMode={true}
                  mousewheel={{ forceToAxis: true }}
                  className="w-full category-swiper py-0.5"
                >
                  <SwiperSlide style={{ width: "auto" }}>
                    <button
                      onClick={() => setActiveTab("map")}
                      className={`cursor-pointer transition-all duration-200 select-none flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-family-semibold whitespace-nowrap !border shadow-none ${activeTab === "map"
                          ? "text-white bg-[#004a70] !border-[#004a70] shadow-sm"
                          : "text-slate-700 bg-white !border-slate-200/90 hover:!border-[#004a70] hover:bg-slate-50 hover:text-[#004a70]"
                        }`}
                    >
                      <MdOutlineMap size={14} />
                      <span>Live Route Map</span>
                    </button>
                  </SwiperSlide>

                  <SwiperSlide style={{ width: "auto" }}>
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className={`cursor-pointer transition-all duration-200 select-none flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-family-semibold whitespace-nowrap !border shadow-none ${activeTab === "reviews"
                          ? "text-white bg-[#004a70] !border-[#004a70] shadow-sm"
                          : "text-slate-700 bg-white !border-slate-200/90 hover:!border-[#004a70] hover:bg-slate-50 hover:text-[#004a70]"
                        }`}
                    >
                      <MdOutlineRateReview size={14} />
                      <span>Driver Reviews ({Reviews?.length || 0})</span>
                    </button>
                  </SwiperSlide>
                </Swiper>
              </div>

              {/* 3. TAB VIEW WINDOW */}
              <div className="min-h-[280px]">
                {activeTab === "map" ? (
                  <div className="!relative !h-[380px] sm:!h-[440px] lg:!h-[480px] !w-full !rounded-2xl !overflow-hidden !shadow-md !bg-[#002842] !border !border-slate-200/90">
                    {/* Map Canvas */}
                    <div
                      id="map-container"
                      className="!w-full !h-full"
                      style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                      ref={mapContainerRef}
                    />

                    {/* 1. Floating Glassmorphism Header Pill (Overlaid on top of map) */}
                    <div className="!absolute !top-3.5 !inset-x-3.5 !z-10 !bg-white/90 !backdrop-blur-md !rounded-xl !py-2 !px-3.5 !shadow-md !border !border-white/60 !flex !flex-wrap !items-center !justify-between !gap-2 animate-fade-in">
                      <div className="!flex !items-center !gap-2 !min-w-0">
                        <div className="!w-5 !h-5 !rounded-lg !bg-[#004a70] !text-white !flex !items-center !justify-center !shrink-0">
                          <FaLocationDot size={10} />
                        </div>
                        <span className="!text-[11.5px] !font-family-semibold !text-slate-800 !truncate">
                          Interactive Route Map
                        </span>
                        {activeFocusedLocation && (
                          <span className="!text-[10px] !font-family-semibold !text-[#004a70] !bg-sky-50 !px-2 !py-0.5 !rounded-full !border !border-sky-200/80 !truncate !max-w-[130px] sm:!max-w-[180px]">
                            📍 {activeFocusedLocation}
                          </span>
                        )}
                      </div>

                      <div className="!flex !items-center !gap-2 !text-[10px] !font-family-semibold !text-slate-600 !shrink-0">
                        <span className="!flex !items-center !gap-1">
                          <span className="!w-2 !h-2 !rounded-full !bg-[#004a70]" /> Start
                        </span>
                        {getStopsList(currentOrder).length > 0 && (
                          <span className="!flex !items-center !gap-1">
                            <span className="!w-2 !h-2 !rounded-full !bg-amber-500" /> Stops ({getStopsList(currentOrder).length})
                          </span>
                        )}
                        <span className="!flex !items-center !gap-1">
                          <span className="!w-2 !h-2 !rounded-full !bg-rose-600" /> End
                        </span>
                        <button
                          type="button"
                          onClick={fitFullRoute}
                          className="!ml-1 !p-1 !rounded-md !bg-slate-100 hover:!bg-slate-200 !text-slate-700 !border-none !cursor-pointer !transition-colors"
                          title="Fit Full Route"
                        >
                          <MdZoomOutMap size={13} />
                        </button>
                      </div>
                    </div>

                    {/* 2. Floating Glassmorphism Footer Pill (Overlaid on bottom of map) */}
                    <div className="!absolute !bottom-3.5 !inset-x-3.5 !z-10 !bg-white/90 !backdrop-blur-md !rounded-xl !py-2 !px-3.5 !shadow-md !border !border-white/60 !flex !flex-wrap !items-center !justify-between !gap-2 animate-fade-in">
                      <div className="!flex !items-center !gap-3 !text-xs !text-slate-700 !min-w-0 !flex-1">
                        <div
                          onClick={() => {
                            const start = getStartCoords(currentOrder);
                            zoomToLocation(start[0], start[1], currentOrder?.start_address || "Pickup Location");
                          }}
                          className="!flex !items-center !gap-1.5 !truncate !cursor-pointer hover:!text-[#004a70] !transition-colors"
                          title="Click to zoom on start location"
                        >
                          <span className="!w-2 !h-2 !rounded-full !bg-[#004a70] !shrink-0" />
                          <span className="!font-family-semibold !text-[#004a70] !text-[11px]">Start:</span>
                          <span className="!truncate !text-[11px]">{currentOrder?.start_address || "Pickup location"}</span>
                        </div>

                        <div className="!h-3 !w-px !bg-slate-300 !shrink-0" />

                        <div
                          onClick={() => {
                            const end = getEndCoords(currentOrder);
                            zoomToLocation(end[0], end[1], currentOrder?.end_address || "Destination");
                          }}
                          className="!flex !items-center !gap-1.5 !truncate !cursor-pointer hover:!text-rose-600 !transition-colors"
                          title="Click to zoom on end destination"
                        >
                          <span className="!w-2 !h-2 !rounded-full !bg-rose-600 !shrink-0" />
                          <span className="!font-family-semibold !text-rose-600 !text-[11px]">End:</span>
                          <span className="!truncate !text-[11px]">{currentOrder?.end_address || "Destination"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {Loading ? (
                      <ReviewCardsSkeleton />
                    ) : Reviews?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {Reviews.map((review, index) => (
                          <div
                            key={index}
                            className="bg-slate-50/80 hover:bg-slate-50 rounded-xl p-3 !border !border-slate-200/70 transition-all"
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <Image
                                src={review.user?.image || NoshowData}
                                width={28}
                                height={28}
                                alt=""
                                className="w-7 h-7 rounded-full object-cover !border !border-slate-200"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="text-[11.5px] font-family-semibold text-slate-900 !m-0 truncate">
                                  {review.user?.name || "Customer"}
                                </h5>
                                <div className="flex items-center gap-0.5 mt-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                      key={star}
                                      size={8}
                                      color={star <= review.rating ? "#f59e0b" : "#e2e8f0"}
                                    />
                                  ))}
                                  <span className="text-[9.5px] text-slate-400 font-family-regular ml-1">
                                    {review.rating}.0
                                  </span>
                                </div>
                              </div>
                              <span className="text-[9.5px] text-slate-400 font-family-regular">
                                {review.createdAt ? moment.utc(review.createdAt).format("DD MMM") : ""}
                              </span>
                            </div>

                            {review.review && (
                              <p className="text-[11px] text-slate-600 font-family-regular !m-0 line-clamp-2 leading-relaxed">
                                {review.review}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center mb-1.5 text-slate-400">
                          <FaStar size={16} />
                        </div>
                        <h4 className="text-xs font-family-semibold text-slate-800 !m-0">
                          No Reviews Yet
                        </h4>
                        <p className="text-[10.5px] text-slate-400 font-family-regular !m-0 mt-0.5">
                          Reviews for this driver will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs !p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full !p-5 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-600">
              <IoShieldCheckmark size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-family-semibold text-slate-900 !m-0">
                Cancel Your Ride?
              </h3>
              <p className="text-xs text-slate-500 font-family-regular !m-0">
                Are you sure you want to cancel this ride request? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={cancelLoading}
                onClick={() => setShowCancelModal(false)}
                className="flex-1 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-family-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Keep Ride
              </button>

              <button
                type="button"
                disabled={cancelLoading}
                onClick={handleConfirmCancel}
                className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-family-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {cancelLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const page = () => {
  return (
    <Suspense fallback={<RideDetailSkeleton />}>
      <RideDetail />
    </Suspense>
  );
};

export default page;
