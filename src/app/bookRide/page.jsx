"use client";

import React, { Suspense, useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FaLocationDot, FaCheck, FaCar, FaUsers, FaStar, FaShieldHalved } from "react-icons/fa6";
import { MdOutlineMyLocation, MdOutlinePlace, MdAccessTime, MdOutlineDirectionsCar, MdZoomOutMap, MdOutlineLocalOffer } from "react-icons/md";
import { FaCalendarAlt, FaWallet } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { BsCashCoin, BsCreditCard2Back } from "react-icons/bs";
import { FiArrowRight, FiCheckCircle, FiX } from "react-icons/fi";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import axios from "axios";
import { message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useSocket } from "@/components/ApiFunction/SoketProvider";
import { setPaymentCards, setUser } from "@/components/Redux/Slices/AuthSlice";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import CustomButton from "@/components/CustomButton";

const apiKey = "0FGR7.1720815360";
const apiSecret = "6EF4CAFCD82E689DECA28EDFDE15ADB35D12BF5982B182E468758A9F8DD072DF";
const tokenUrl = "https://jad.cash/HAPI/token";
const paymentUrl = "https://jad.cash/HAPI/cardpayment";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWFybGVncmFudCIsImEiOiJjbTgwdmV0MjkweXB2MnFzNXBjM2x6NThnIn0.3oz3YGaDHiFDh8W5ALk09w";

const XCD_PER_USD = 2.7;
const CONVENIENCE_FEE_XCD = 3.0;

function BookRideComponent() {
  const searchParams = useSearchParams();
  const encodedData = searchParams.get("data");
  const { putData, postData, getData, header1, userData } = ApiFunction();
  const socket = useSocket();
  const dispatch = useDispatch();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [productDetail, setProductDetail] = useState(null);
  const [order_id, setOrder_id] = useState("");
  const [pincode, setPincode] = useState("");

  // Map and Route State
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [calculatedDistance, setCalculatedDistance] = useState(0);
  const [timeDropOff, setTimeDropOff] = useState(0);
  const [mapLoading, setMapLoading] = useState(true);
  const [activeFocusedLocation, setActiveFocusedLocation] = useState(null);

  // Vehicles & Pricing State
  const [ProductData, setProductData] = useState([]);
  const [RideType, setRideType] = useState(null);
  const [prices, setPrices] = useState([]);
  const [CabPrice, setCabPrice] = useState(0);

  // Scheduling State
  const [wantToScheduleTour, setWantToScheduleTour] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleErrors, setScheduleErrors] = useState({});

  // Passengers State
  const [passengerCount, setPassengerCount] = useState("");

  // Note & Coupon State (Mobile App Match)
  const [note, setNote] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Payment State & Modals
  const [PaymentMethod, setPaymentMethod] = useState("jad");
  const [showSelectPaymentModal, setShowSelectPaymentModal] = useState(false);
  const [WalletLoading, setWalletLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showJadModal, setShowJadModal] = useState(false);
  const [showSearchingModal, setShowSearchingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [RequestId, setRequestId] = useState("");
  const [RefIdPayement, setRefId] = useState("");
  const [jadLoading, setJadLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Socket Listener for driver offers & acceptance
  useEffect(() => {
    if (!socket) return;

    const handleReceiveOffer = (data) => {
      if (data?.message) {
        message.info(data.message);
      }
    };

    const handleAccepted = (data) => {
      if (data?.success) {
        message.success(data?.message || "Driver accepted your ride!");
        setShowSearchingModal(false);
        setShowSuccessModal(true);
      }
    };

    socket.on("receive-request-customer", handleReceiveOffer);
    socket.on("update-request-customer", handleAccepted);

    return () => {
      socket.off("receive-request-customer", handleReceiveOffer);
      socket.off("update-request-customer", handleAccepted);
    };
  }, [socket]);

  const paymentCards = useSelector((state) => state.auth.paymentCards);
  const [cardDetails, setCardDetails] = useState({
    cvc: "",
    expiry: "",
    name: "",
    number: "",
    email: "",
    phone: "",
  });

  const generateCode = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    let code = "";
    for (let i = 0; i < 2; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 6; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    setOrder_id(code);
  };

  const generatePinCode = () => {
    const numbers = "0123456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    setPincode(code);
  };

  useEffect(() => {
    if (encodedData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(encodedData));
        setProductDetail(parsed);
        generateCode();
        generatePinCode();

        if (parsed.distance) {
          setCalculatedDistance(Number(parsed.distance));
          setTimeDropOff(Math.round(Number(parsed.distance) * 3));
        }

        if (parsed.bookingtype === "schedule" || parsed.schedule_date) {
          setWantToScheduleTour(true);
          if (parsed.schedule_date) setScheduleDate(parsed.schedule_date);
          if (parsed.schedule_time) setScheduleTime(parsed.schedule_time);
        }
      } catch (err) {
        console.error("Failed to parse booking data:", err);
      }
    }
  }, [encodedData]);

  // Fetch Vehicle Liabilities
  const fetchLiabilities = async () => {
    try {
      const res = await getData("/users/liabilty/1", header1);
      if (res?.success && res?.liabilties?.length > 0) {
        setProductData(res.liabilties);
        setRideType(res.liabilties[0]);
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  useEffect(() => {
    fetchLiabilities();
  }, []);

  // EXACT Mobile App Pricing Algorithm:
  const distanceKM = useMemo(() => Number(productDetail?.distance || 0), [productDetail]);
  const multiPrice = useMemo(() => Number(productDetail?.tourPrice || 0), [productDetail]);
  const stopsCount = useMemo(() => Array.isArray(productDetail?.stop) ? productDetail.stop.length : 0, [productDetail]);

  const changePrice = (baseRate) => {
    const currentHour = new Date().getHours();
    let increment = 0;
    const perKmRate = 3.246;
    const distanceCost = distanceKM * perKmRate;
    const stopsFee = stopsCount * 5;
    let plusPrice = (Number(baseRate) || 0) + distanceCost + stopsFee;
    const onePercent = plusPrice / 100;

    if (currentHour >= 22 || currentHour < 2) {
      increment = onePercent * 25;
    } else if (currentHour > 2 && currentHour <= 5) {
      increment = onePercent * 30;
    }

    if (multiPrice) {
      plusPrice = plusPrice + multiPrice;
    }

    if (productDetail?.servicePrice) {
      plusPrice += Number(productDetail.servicePrice);
    }
    if (productDetail?.productPrice) {
      plusPrice += Number(productDetail.productPrice);
    }

    const feeIncluded = 8; // $8.00 XCD fixed fee included
    const totalPrice = plusPrice + increment + feeIncluded;
    return parseFloat(totalPrice.toFixed(2));
  };

  useEffect(() => {
    if (ProductData.length > 0 && productDetail) {
      const calculated = ProductData.map((item) =>
        changePrice(item.price)
      );
      setPrices(calculated);
    }
  }, [ProductData, productDetail, distanceKM, multiPrice, stopsCount]);

  const handleRideSelection = (item, price) => {
    const additional = item?.passenger ? price / item.passenger : 0;
    setCabPrice(additional * (Number(passengerCount) || 0));
    setRideType({ ...item, selectedPrice: price });
  };

  // Fare calculations with coupon
  const selectedVehicleFare = useMemo(() => {
    if (!RideType) return 0;
    const idx = ProductData.findIndex((p) => p._id === RideType._id);
    return prices[idx] || changePrice(RideType.price) || 0;
  }, [RideType, ProductData, prices, productDetail]);

  const baseFareXCD = useMemo(() => {
    return Number((Number(selectedVehicleFare) + Number(CabPrice || 0)).toFixed(2));
  }, [selectedVehicleFare, CabPrice]);

  const couponDiscountAmount = useMemo(() => {
    if (!couponData?.discount) return 0;
    const discount = (baseFareXCD / 100) * Number(couponData.discount);
    return Number(discount.toFixed(2));
  }, [couponData, baseFareXCD]);

  const totalFareXCD = useMemo(() => {
    return Math.max(0, Number((baseFareXCD - couponDiscountAmount).toFixed(2)));
  }, [baseFareXCD, couponDiscountAmount]);

  const totalAmountXCD = useMemo(() => {
    return Number((totalFareXCD + CONVENIENCE_FEE_XCD).toFixed(2));
  }, [totalFareXCD]);

  const totalAmountUSD = useMemo(() => {
    return Number((totalAmountXCD / XCD_PER_USD).toFixed(2));
  }, [totalAmountXCD]);

  // Apply Coupon Code
  const applyCoupon = async () => {
    if (!couponCode || couponCode.trim().length < 3) {
      setCouponError("Enter a valid coupon code");
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await postData("coupon/check-validity", {
        code: couponCode.trim(),
        service: "rides",
      }, header1);

      if (res?.success && res?.coupon) {
        setCouponData(res.coupon);
        setCouponError("");
        message.success(`Coupon applied successfully! ${res.coupon.discount || 0}% discount`);
      } else {
        setCouponData(null);
        setCouponError(res?.message || "Coupon is not valid");
      }
    } catch (err) {
      setCouponError(err.message || "Unable to apply coupon");
      message.error(err.message || "Unable to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  // Click to Zoom on specific location
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

  // Reset / Fit Full Route Bounds
  const fitFullRoute = () => {
    if (!mapRef.current || !productDetail) return;
    setActiveFocusedLocation(null);

    const bounds = new mapboxgl.LngLatBounds();
    const startLng = Number(productDetail?.start?.[0]);
    const startLat = Number(productDetail?.start?.[1]);
    const endLng = Number(productDetail?.end?.[0]);
    const endLat = Number(productDetail?.end?.[1]);

    if (!isNaN(startLng) && !isNaN(startLat)) bounds.extend([startLng, startLat]);
    if (!isNaN(endLng) && !isNaN(endLat)) bounds.extend([endLng, endLat]);

    if (Array.isArray(productDetail?.stop)) {
      productDetail.stop.forEach((s) => {
        const sLng = Number(s.longitude || s.lng);
        const sLat = Number(s.latitude || s.lat);
        if (!isNaN(sLng) && !isNaN(sLat)) bounds.extend([sLng, sLat]);
      });
    }

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, {
        padding: { top: 80, bottom: 80, left: 60, right: 60 },
        maxZoom: 15,
        duration: 1200,
      });
    }
  };

  // Initialize Mapbox & Route Geometry
  useEffect(() => {
    if (!productDetail || !mapContainerRef.current) return;

    const startLng = Number(productDetail?.start?.[0]);
    const startLat = Number(productDetail?.start?.[1]);
    const endLng = Number(productDetail?.end?.[0]);
    const endLat = Number(productDetail?.end?.[1]);

    if (isNaN(startLng) || isNaN(startLat) || isNaN(endLng) || isNaN(endLat)) {
      setMapLoading(false);
      return;
    }

    if (!mapRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [startLng, startLat],
        zoom: 12,
        projection: "mercator",
        attributionControl: false,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
      mapRef.current = map;
    }

    const map = mapRef.current;

    map.on("load", async () => {
      // Clear old markers
      markersRef.current.forEach((m) => m.marker.remove());
      markersRef.current = [];

      const bounds = new mapboxgl.LngLatBounds();
      const validPoints = [];

      // 1. Start Marker 🔵
      const startEl = document.createElement("div");
      startEl.className = "flex items-center justify-center w-8 h-8 rounded-full bg-[#004a70] text-white shadow-lg border-2 border-white ring-2 ring-sky-300 animate-pulse cursor-pointer";
      startEl.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 384 512" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"></path></svg>`;

      const startMarker = new mapboxgl.Marker({ element: startEl })
        .setLngLat([startLng, startLat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: true }).setHTML(`
            <div style="min-width: 170px; padding: 2px 4px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #004a70;"></span>
                <span style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #004a70;">Start Location</span>
              </div>
              <p style="font-size: 12px; font-weight: 600; color: #1e293b; margin: 0; line-height: 1.35;">${productDetail?.name || "Pickup location"}</p>
            </div>
          `)
        )
        .addTo(map);

      markersRef.current.push({ marker: startMarker, type: "start" });
      bounds.extend([startLng, startLat]);
      validPoints.push([startLng, startLat]);

      // 2. Stops Markers 🟡
      const validStops = Array.isArray(productDetail?.stop) ? productDetail.stop : [];
      validStops.forEach((stop, idx) => {
        const stopLat = Number(stop.latitude || stop.lat);
        const stopLng = Number(stop.longitude || stop.lng);

        if (!isNaN(stopLat) && !isNaN(stopLng)) {
          const stopEl = document.createElement("div");
          stopEl.className = "flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md border-2 border-white cursor-pointer transition-transform hover:scale-110";
          stopEl.innerText = `${idx + 1}`;

          const stopMarker = new mapboxgl.Marker({ element: stopEl })
            .setLngLat([stopLng, stopLat])
            .setPopup(
              new mapboxgl.Popup({ offset: 20, closeButton: true }).setHTML(`
                <div style="min-width: 170px; padding: 2px 4px;">
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #f59e0b;"></span>
                    <span style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #d97706;">Stop ${idx + 1}</span>
                  </div>
                  <p style="font-size: 12px; font-weight: 600; color: #1e293b; margin: 0; line-height: 1.35;">${stop.title || stop.address || "Attraction"}</p>
                </div>
              `)
            )
            .addTo(map);

          markersRef.current.push({ marker: stopMarker, type: "stop", index: idx });
          bounds.extend([stopLng, stopLat]);
          validPoints.push([stopLng, stopLat]);
        }
      });

      // 3. End Marker 🔴
      const endEl = document.createElement("div");
      endEl.className = "flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 text-white shadow-lg border-2 border-white ring-2 ring-rose-300 cursor-pointer";
      endEl.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 384 512" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"></path></svg>`;

      const endMarker = new mapboxgl.Marker({ element: endEl })
        .setLngLat([endLng, endLat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: true }).setHTML(`
            <div style="min-width: 170px; padding: 2px 4px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #e11d48;"></span>
                <span style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #e11d48;">Destination</span>
              </div>
              <p style="font-size: 12px; font-weight: 600; color: #1e293b; margin: 0; line-height: 1.35;">${productDetail?.metaTitle || "Drop-off"}</p>
            </div>
          `)
        )
        .addTo(map);

      markersRef.current.push({ marker: endMarker, type: "end" });
      bounds.extend([endLng, endLat]);
      validPoints.push([endLng, endLat]);

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
        console.warn("Mapbox Driving directions error, falling back to direct line:", e);
      }

      // Fallback: If driving API returned no routes or failed
      if (!routeGeo || !routeGeo.coordinates || routeGeo.coordinates.length === 0) {
        routeGeo = {
          type: "LineString",
          coordinates: validPoints,
        };
      }

      // Render Route Layers on the map
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

          // Outer Glow
          map.addLayer({
            id: "route-glow",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#38bdf8",
              "line-width": 8,
              "line-opacity": 0.45,
            },
          });

          // Core Road Line
          map.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#004a70",
              "line-width": 4.5,
              "line-opacity": 0.9,
            },
          });

          // Dashed Center Tracer
          map.addLayer({
            id: "route-dash",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#ffffff",
              "line-width": 2,
              "line-dasharray": [2, 3],
              "line-opacity": 0.8,
            },
          });
        }
      }

      map.resize();
      setTimeout(() => {
        if (mapRef.current) mapRef.current.resize();
      }, 300);

      map.fitBounds(bounds, {
        padding: { top: 80, bottom: 80, left: 60, right: 60 },
        maxZoom: 15,
        duration: 1500,
      });

      setMapLoading(false);
    });

    const handleWindowResize = () => {
      if (mapRef.current) mapRef.current.resize();
    };
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [productDetail]);

  // Validation before Booking
  const validateBooking = () => {
    if (wantToScheduleTour) {
      const errs = {};
      if (!scheduleDate) errs.date = "Please select schedule date";
      if (!scheduleTime) errs.time = "Please select schedule time";
      if (Object.keys(errs).length > 0) {
        setScheduleErrors(errs);
        message.error("Please complete schedule date & time");
        return false;
      }
    }
    setScheduleErrors({});
    return true;
  };

  // Open "Select Payment Method" Modal
  const handleProceed = () => {
    if (!validateBooking()) return;
    setShowSelectPaymentModal(true);
  };

  // Final Action from "Select Payment Method" modal (Done)
  const handleConfirmPaymentMethod = () => {
    setShowSelectPaymentModal(false);
    if (PaymentMethod === "wallet") {
      paymentWithWallet();
    } else if (PaymentMethod === "jad") {
      setShowJadModal(true);
    } else if (PaymentMethod === "cash") {
      paymentWithCash();
    }
  };

  // Socket Delete Request (Cancel)
  const CancelRequest = async () => {
    if (cancelLoading) return;
    setCancelLoading(true);
    if (socket && RequestId) {
      socket.emit("delete-request-customer", { requestId: RequestId }, (res) => {
        setCancelLoading(false);
        message.success(res?.message || "Request cancelled");
        setShowSearchingModal(false);
        setRequestId("");
      });
    } else {
      setCancelLoading(false);
      setShowSearchingModal(false);
      setRequestId("");
    }
  };

  // Build Payload Body
  const buildBookingPayload = (paymentType, activePrice) => {
    let newDate = null;
    if (wantToScheduleTour && scheduleDate && scheduleTime) {
      newDate = moment(scheduleDate)
        .set({
          hour: parseInt(scheduleTime.split(":")[0], 10),
          minute: parseInt(scheduleTime.split(":")[1], 10),
        })
        .toISOString();
    }

    return {
      couponId: couponData?._id || "",
      order_id: order_id,
      pincode: pincode,
      paymentType: paymentType,
      bookingtype: wantToScheduleTour ? "schedule" : "live",
      liability: RideType?._id || "",
      end_address: productDetail?.metaTitle,
      end_lat: productDetail?.end?.[1],
      end_lng: productDetail?.end?.[0],
      passengerCount: Number(passengerCount) || 0,
      price: activePrice,
      start_address: productDetail?.name,
      start_lat: productDetail?.start?.[1],
      start_lng: productDetail?.start?.[0],
      type: productDetail?.type || "driver",
      distance: productDetail?.distance,
      stops: productDetail?.stop || [],
      note: note || "",
      ...(productDetail?.service ? { service: productDetail.service } : {}),
      ...(productDetail?.FavUserId ? { FavUserId: productDetail.FavUserId } : {}),
      ...(wantToScheduleTour && {
        schedule_time: newDate,
        schedule_date: scheduleDate,
      }),
    };
  };

  // Wallet Payment
  const paymentWithWallet = async () => {
    if (WalletLoading) return;
    try {
      setWalletLoading(true);

      const walletBalance = Number(userData?.user?.amount || 0);
      if (walletBalance < totalAmountXCD) {
        message.error(`Insufficient wallet balance. You have $${walletBalance.toFixed(2)} XCD but need $${totalAmountXCD.toFixed(2)} XCD.`);
        setWalletLoading(false);
        return;
      }

      setShowSearchingModal(true);

      const payBody = { amount: totalAmountXCD };
      const res = await putData("users/order-wallet-payment", payBody, header1);

      if (!res?.success) {
        setShowSearchingModal(false);
        throw new Error(res?.message || "Payment failed");
      }

      dispatch(setUser({
        token: userData?.token,
        success: true,
        newUser: false,
        user: res?.user,
      }));

      const body = buildBookingPayload("wallet", totalAmountXCD);

      if (socket) {
        socket.emit("send-request-customer", body, (socketRes) => {
          message.success(socketRes?.message || "Ride requested successfully!");
          if (socketRes?.success) {
            setRequestId(socketRes?.request?._id);
          } else {
            setShowSearchingModal(false);
          }
        });
      }
    } catch (err) {
      setShowSearchingModal(false);
      message.error(err.message || "Wallet payment failed");
    } finally {
      setWalletLoading(false);
    }
  };

  // Cash Payment
  const paymentWithCash = async () => {
    if (WalletLoading) return;
    try {
      setWalletLoading(true);
      setShowSearchingModal(true);
      const body = buildBookingPayload("cash", totalAmountXCD);

      if (socket) {
        socket.emit("send-request-customer", body, (socketRes) => {
          message.success(socketRes?.message || "Ride requested successfully!");
          if (socketRes?.success) {
            setRequestId(socketRes?.request?._id);
          } else {
            setShowSearchingModal(false);
          }
        });
      }
    } catch (err) {
      setShowSearchingModal(false);
      message.error(err.message || "Failed to submit cash ride request");
    } finally {
      setWalletLoading(false);
    }
  };

  // Jad Payment Token & Submission
  const getJadToken = async () => {
    const params = new URLSearchParams({
      apikey: apiKey,
      secret: apiSecret,
      grant_type: "credentials",
    });
    const response = await fetch(`${tokenUrl}?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    return response.json();
  };

  const handleJadCardPayment = async () => {
    setJadLoading(true);
    try {
      const tokenRes = await getJadToken();
      if (tokenRes.result !== "Success") {
        throw new Error(tokenRes?.message || "Failed to obtain payment gateway token");
      }

      const token = tokenRes.data.token;
      const [month, year] = (cardDetails.expiry || "").split("/");

      const payData = {
        live: "1",
        timestamp: moment().format("YYYYMMDDHHmmss"),
        refnum: "101",
        jadnumber: "101310573865",
        amount: totalAmountXCD.toFixed(2),
        cardnumber: cardDetails.number.replace(/\s+/g, ""),
        cardexpmonth: month,
        cardexpyear: year,
        cardcvv: cardDetails.cvc,
        cardfirstname: (cardDetails.name || "").split(" ")[0] || "Guest",
        cardlastname: (cardDetails.name || "").split(" ")[1] || "User",
        address: productDetail?.name || "St. Kitts",
        city: "Basseterre",
        state: "St. Kitts",
        postalcode: "0000",
        country: "KN",
        email: cardDetails.email || "customer@cabkn.com",
        phone: cardDetails.phone || "0000000000",
      };

      const postParams = new URLSearchParams({
        token: token,
        paydata: JSON.stringify(payData),
      }).toString();

      const payRes = await axios.post(paymentUrl, postParams, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (payRes.data?.result === "Success" && payRes.data?.refid) {
        setRefId(payRes.data.refid);
        await putData("users/order-card-payment", {
          paymentId: payRes.data.refid,
          amount: totalAmountXCD,
        }, header1);

        const body = buildBookingPayload("paid", totalAmountXCD);

        if (socket) {
          socket.emit("send-request-customer", body, (socketRes) => {
            message.success(socketRes?.message || "Card payment approved & driver searching!");
            setShowJadModal(false);
            if (socketRes?.success) {
              setRequestId(socketRes?.request?._id);
              setShowSearchingModal(true);
            }
          });
        }
      } else {
        message.error(payRes.data?.message || "Card transaction was declined");
      }
    } catch (err) {
      console.error(err);
      message.error(err.message || "Card transaction failed");
    } finally {
      setJadLoading(false);
    }
  };

  const liabilityBadge = (item, index) => {
    const title = String(item?.title || "").toLowerCase();
    if (title.includes("express") || index === 0) {
      return { color: "bg-rose-500 text-white", label: "Express", icon: <FaShieldHalved size={10} /> };
    }
    if (title.includes("plus") || index === 1) {
      return { color: "bg-sky-500 text-white", label: "Plus", icon: <FaCheck size={10} /> };
    }
    return { color: "bg-[#004a70] text-white", label: "XL", icon: <FaStar size={10} /> };
  };

  return (
    <div className={`!min-h-screen !bg-[#f8fafc] !select-none ${mounted ? "animate-fade-in" : "!opacity-0"}`}>
      {/* ===== 1. HERO BANNER ===== */}
      <section className="!relative !overflow-hidden !bg-gradient-to-br !from-[#001726] !via-[#002842] !to-[#002f4a] !pt-28 !pb-20 sm:!pb-24">
        <div
          className="!absolute !inset-0 !opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !relative !z-10">
          <div className="!flex !items-center !gap-2 !text-slate-400 !text-xs !font-family-medium !mb-4">
            <Link href="/" className="!text-slate-400 hover:!text-white !transition-colors !no-underline">
              Home
            </Link>
            <span className="!text-slate-500">/</span>
            <Link href="/makeowntours" className="!text-slate-400 hover:!text-white !transition-colors !no-underline">
              Make Tour
            </Link>
            <span className="!text-slate-500">/</span>
            <span className="!text-slate-200">Confirm & Book Ride</span>
          </div>

          <div className="!flex !flex-wrap !justify-between !items-center !gap-4">
            <div className="!flex !items-center !gap-3.5 sm:!gap-4">
              <div className="!w-12 !h-12 sm:!w-14 sm:!h-14 !rounded-2xl !bg-white/10 !backdrop-blur-md !border !border-white/15 !flex !items-center !justify-center !shrink-0 !shadow-inner">
                <MdOutlineDirectionsCar className="!text-white !text-2xl sm:!text-3xl" />
              </div>
              <div>
                <h1 className="!text-white !text-2xl sm:!text-3xl md:!text-4xl !font-family-bold !tracking-tight !m-0 !leading-tight">
                  Confirm Your{" "}
                  <span className="!text-transparent !bg-clip-text !bg-gradient-to-r !from-brand-300 !via-sky-300 !to-indigo-200">
                    Ride
                  </span>
                </h1>
                <p className="!text-slate-300 !text-xs sm:!text-sm !mt-1.5 !m-0 !font-family-regular">
                  Review your route, choose vehicle tier & find nearby drivers
                </p>
              </div>
            </div>

            <div className="!flex !items-center !gap-3 !bg-white/10 !backdrop-blur-md !px-4 !py-2 !rounded-2xl !border !border-white/15 !text-white">
              <div className="!text-right">
                <span className="!text-[11px] !text-slate-300 !block">Estimated Distance</span>
                <span className="!text-sm !font-family-bold">{calculatedDistance} Km</span>
              </div>
              <div className="!h-7 !w-px !bg-white/20" />
              <div className="!text-right">
                <span className="!text-[11px] !text-slate-300 !block">Total Stops</span>
                <span className="!text-sm !font-family-bold">{stopsCount} Places</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. MAIN SPLIT CONTENT ===== */}
      <div className="!-mt-8 sm:!-mt-10 !max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !relative !z-20 !pb-24">
        <div className="!grid !grid-cols-1 lg:!grid-cols-12 !gap-6 !items-start">
          
          {/* ===== Left Side: Seamless Interactive Route Map (7 Cols) ===== */}
          <div className="lg:!col-span-7 !relative !h-[520px] sm:!h-[580px] lg:!h-[640px] !w-full !rounded-3xl !overflow-hidden !shadow-[0_4px_25px_rgba(0,0,0,0.08)] !bg-[#002842] lg:!sticky lg:!top-24">
            
            {/* Map Canvas - Absolutely fills entire container */}
            <div
              ref={mapContainerRef}
              className="!w-full !h-full"
              style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* 1. Floating Glassmorphism Header Pill (Overlaid on top of map) */}
            <div className="!absolute !top-4 !inset-x-4 !z-10 !bg-white/85 !backdrop-blur-md !rounded-2xl !py-2.5 !px-4 !shadow-lg !border !border-white/60 !flex !flex-wrap !items-center !justify-between !gap-2 animate-fade-in">
              <div className="!flex !items-center !gap-2 !min-w-0">
                <div className="!w-6 !h-6 !rounded-lg !bg-[#004a70] !text-white !flex !items-center !justify-center !shrink-0">
                  <FaLocationDot size={12} />
                </div>
                <span className="!text-xs !font-family-bold !text-slate-800 !truncate">
                  Interactive Route Map
                </span>
                {activeFocusedLocation && (
                  <span className="!text-[10.5px] !font-family-semibold !text-[#004a70] !bg-sky-50 !px-2.5 !py-0.5 !rounded-full !border !border-sky-200/80 !truncate !max-w-[140px] sm:!max-w-[200px]">
                    📍 {activeFocusedLocation}
                  </span>
                )}
              </div>

              <div className="!flex !items-center !gap-2 !text-[10.5px] !font-family-semibold !text-slate-600 !shrink-0">
                <span className="!flex !items-center !gap-1">
                  <span className="!w-2 !h-2 !rounded-full !bg-[#004a70]" /> Start
                </span>
                <span className="!flex !items-center !gap-1">
                  <span className="!w-2 !h-2 !rounded-full !bg-amber-500" /> Stops ({stopsCount})
                </span>
                <span className="!flex !items-center !gap-1">
                  <span className="!w-2 !h-2 !rounded-full !bg-rose-600" /> End
                </span>
              </div>
            </div>

            {/* 2. Floating Glassmorphism Footer Pill (Overlaid on bottom of map) */}
            <div className="!absolute !bottom-4 !inset-x-4 !z-10 !bg-white/85 !backdrop-blur-md !rounded-2xl !py-2.5 !px-4 !shadow-lg !border !border-white/60 !flex !flex-wrap !items-center !justify-between !gap-2.5 animate-fade-in">
              <div className="!flex !items-center !gap-3 !text-xs !text-slate-700 !min-w-0 !flex-1">
                <div
                  onClick={() => zoomToLocation(productDetail?.start?.[0], productDetail?.start?.[1], productDetail?.name)}
                  className="!flex !items-center !gap-1.5 !truncate !cursor-pointer hover:!text-[#004a70] !transition-colors"
                  title="Click to zoom on start location"
                >
                  <span className="!w-2 !h-2 !rounded-full !bg-[#004a70] !shrink-0" />
                  <span className="!font-family-bold !text-[#004a70]">Start:</span>
                  <span className="!truncate !text-[11.5px]">{productDetail?.name || "Pickup location"}</span>
                </div>

                <div className="!h-3.5 !w-px !bg-slate-300 !shrink-0" />

                <div
                  onClick={() => zoomToLocation(productDetail?.end?.[0], productDetail?.end?.[1], productDetail?.metaTitle)}
                  className="!flex !items-center !gap-1.5 !truncate !cursor-pointer hover:!text-rose-600 !transition-colors"
                  title="Click to zoom on end destination"
                >
                  <span className="!w-2 !h-2 !rounded-full !bg-rose-600 !shrink-0" />
                  <span className="!font-family-bold !text-rose-600">End:</span>
                  <span className="!truncate !text-[11.5px]">{productDetail?.metaTitle || "Destination"}</span>
                </div>
              </div>

              {/* Floating Map Reset / Overview Action Button */}
              <button
                type="button"
                onClick={fitFullRoute}
                title="Fit full route view"
                className="!bg-[#004a70] hover:!bg-[#003855] !text-white !px-3 !py-1.5 !rounded-xl !text-[11px] !font-family-semibold !shadow-xs !flex !items-center !gap-1.5 !transition-all !cursor-pointer !border-none !shrink-0"
              >
                <MdZoomOutMap size={13} />
                <span>Fit Entire Route</span>
              </button>
            </div>
            
            {mapLoading && (
              <div className="!absolute !inset-0 !bg-slate-50/80 !backdrop-blur-xs !flex !flex-col !items-center !justify-center !gap-2 !z-20">
                <div className="!h-8 !w-8 !animate-spin !rounded-full !border-3 !border-slate-200 !border-t-[#004a70]" />
                <span className="!text-xs !font-family-semibold !text-slate-600">Rendering road route & markers...</span>
              </div>
            )}
          </div>

          {/* ===== Right Side: Booking Panel & Vehicle Selector (5 Cols) ===== */}
          <div className="lg:!col-span-5 !space-y-4">
            
            {/* Header Card */}
            <div className="!bg-white !rounded-3xl !border !border-slate-200/90 !p-5 !shadow-[0_4px_25px_rgba(0,0,0,0.04)]">
              <h2 className="!text-lg sm:!text-xl !font-family-bold !text-slate-800 !m-0">
                Choose your ride
              </h2>
              <p className="!text-xs !text-slate-500 !font-family-regular !m-0 !mt-1">
                Schedule if you want, then pick a vehicle.
              </p>

              {/* 1. Custom Themed "Want to Schedule Tour?" Card */}
              <div className="!mt-4 !p-3.5 !bg-slate-50/80 !border !border-slate-200/80 !rounded-2xl !transition-all">
                <div
                  onClick={() => setWantToScheduleTour(!wantToScheduleTour)}
                  className="!flex !items-center !gap-3 !cursor-pointer !select-none"
                >
                  <div
                    className={`!w-5 !h-5 !rounded-lg !border-2 !flex !items-center !justify-center !transition-all !duration-200 ${
                      wantToScheduleTour
                        ? "!bg-[#004a70] !border-[#004a70] !text-white !shadow-xs"
                        : "!bg-white !border-slate-300 hover:!border-[#004a70]"
                    }`}
                  >
                    {wantToScheduleTour && <FaCheck size={10} />}
                  </div>
                  <span className="!text-xs sm:!text-[13.5px] !font-family-semibold !text-slate-800">
                    Want to Schedule Tour?
                  </span>
                </div>

                {wantToScheduleTour && (
                  <div className="!mt-3.5 !pt-3.5 !border-t !border-slate-200/70 !space-y-3 animate-fade-in">
                    <div>
                      <label className="!text-xs !text-slate-700 !block !mb-1 !font-family-semibold !flex !items-center !gap-1.5">
                        <FaCalendarAlt size={12} className="!text-[#004a70]" />
                        Schedule Date
                      </label>
                      <div className="!relative !flex !items-center">
                        <div className="!absolute !left-3.5 !flex !items-center !pointer-events-none !text-slate-400 !z-10">
                          <FaCalendarAlt className="!w-3.5 !h-3.5 !text-[#004a70]" />
                        </div>
                        <input
                          type="date"
                          min={moment().format("YYYY-MM-DD")}
                          value={scheduleDate}
                          onChange={(e) => {
                            setScheduleDate(e.target.value);
                            setScheduleErrors((prev) => ({ ...prev, date: "" }));
                          }}
                          className="!w-full !pl-10 !pr-3.5 !py-2.5 !rounded-xl !bg-white !border !border-gray-200 !text-[13px] !text-gray-900 !placeholder-gray-400 focus:!outline-none focus:!ring-1 focus:!ring-primary-500 focus:!ring-offset-1 focus:!border-none !transition-all !duration-200 !shadow-xs hover:!shadow-sm"
                        />
                      </div>
                      {scheduleErrors.date && (
                        <span className="!text-[10.5px] !text-rose-500 !block !mt-1 !font-family-medium">
                          {scheduleErrors.date}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="!text-xs !text-slate-700 !block !mb-1 !font-family-semibold !flex !items-center !gap-1.5">
                        <MdAccessTime size={13} className="!text-[#004a70]" />
                        Schedule Time
                      </label>
                      <div className="!relative !flex !items-center">
                        <div className="!absolute !left-3.5 !flex !items-center !pointer-events-none !text-slate-400 !z-10">
                          <MdAccessTime className="!w-4 !h-4 !text-[#004a70]" />
                        </div>
                        <input
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => {
                            setScheduleTime(e.target.value);
                            setScheduleErrors((prev) => ({ ...prev, time: "" }));
                          }}
                          className="!w-full !pl-10 !pr-3.5 !py-2.5 !rounded-xl !bg-white !border !border-gray-200 !text-[13px] !text-gray-900 !placeholder-gray-400 focus:!outline-none focus:!ring-1 focus:!ring-primary-500 focus:!ring-offset-1 focus:!border-none !transition-all !duration-200 !shadow-xs hover:!shadow-sm"
                        />
                      </div>
                      {scheduleErrors.time && (
                        <span className="!text-[10.5px] !text-rose-500 !block !mt-1 !font-family-medium">
                          {scheduleErrors.time}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Vehicle Selection Cards */}
              <div className="!mt-4">
                <span className="!text-xs !font-family-semibold !text-slate-700 !block !mb-2.5">
                  Vehicle Option
                </span>

                <div className="!space-y-2.5">
                  {ProductData?.map((item, i) => {
                    const isSelected = RideType?._id === item?._id;
                    const priceXCD = prices[i] || changePrice(item.price);
                    const priceUSD = (priceXCD / XCD_PER_USD).toFixed(2);
                    const badge = liabilityBadge(item, i);

                    return (
                      <div
                        key={item._id || i}
                        onClick={() => handleRideSelection(item, priceXCD)}
                        className={`!p-3.5 !rounded-2xl !border !cursor-pointer !transition-all !duration-200 !relative ${
                          isSelected
                            ? "!border-[#004a70] !bg-sky-50/40 !ring-1 !ring-[#004a70]/40 !shadow-sm"
                            : "!border-slate-200/90 !bg-white hover:!border-slate-300 hover:!bg-slate-50/50"
                        }`}
                      >
                        {/* Right Top Badge */}
                        <div className="!absolute !top-3 !right-3 !flex !items-center !gap-1.5">
                          <span className={`!w-4 !h-4 !rounded-full !flex !items-center !justify-center ${badge.color}`}>
                            {badge.icon}
                          </span>
                        </div>

                        <div className="!flex !items-start !justify-between !gap-3 !pr-7">
                          <div>
                            <h4 className="!text-xs sm:!text-[13.5px] !font-family-bold !text-slate-800 !m-0 !leading-tight">
                              {item.title} - ${priceXCD?.toFixed(2)} XCD
                            </h4>

                            <div className="!flex !items-center !gap-2 !mt-1.5">
                              <span className="!flex !items-center !gap-1 !text-[11.5px] !text-slate-500 !font-family-medium">
                                <FaUsers size={12} className="!text-slate-400" />
                                {item?.passenger} Passengers
                              </span>
                            </div>
                          </div>

                          <div className="!text-right">
                            <span className="!text-xs sm:!text-sm !font-family-bold !text-[#004a70] !block">
                              ${priceUSD} <span className="!text-[10px] !text-slate-400 !font-family-regular">USD</span>
                            </span>
                            <div className="!mt-1 !flex !items-center !justify-end">
                              <div className={`!w-4.5 !h-4.5 !rounded-full !border !flex !items-center !justify-center ${
                                isSelected ? "!border-[#004a70] !bg-[#004a70] !text-white" : "!border-slate-300 !bg-white"
                              }`}>
                                {isSelected && <FaCheck size={9} />}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Perfectly Centered Vertical Route Stops Timeline */}
            <div className="!bg-white !rounded-3xl !border !border-slate-200/90 !p-5 !shadow-[0_4px_25px_rgba(0,0,0,0.04)]">
              <div className="!flex !items-center !justify-between !mb-3.5">
                <h3 className="!text-sm sm:!text-[15px] !font-family-bold !text-slate-800 !m-0">
                  Route Stops
                </h3>
                <span className="!text-[11px] !text-slate-400 !font-family-medium">
                  Click any stop to zoom 📍
                </span>
              </div>

              <div className="!relative !pl-8 !space-y-3 before:!absolute before:!left-[11px] before:!top-3.5 before:!bottom-3.5 before:!w-0.5 before:!bg-slate-200">
                {/* Start */}
                <div
                  onClick={() => zoomToLocation(productDetail?.start?.[0], productDetail?.start?.[1], productDetail?.name || "Start Location")}
                  className="!relative !p-2 !rounded-xl hover:!bg-sky-50/60 !cursor-pointer !transition-colors group"
                  title="Click to zoom on map"
                >
                  <div className="!absolute !left-[-32px] !top-2 !w-6 !h-6 !flex !items-center !justify-center">
                    <div className="!w-3.5 !h-3.5 !rounded-full !bg-[#004a70] !ring-4 !ring-white !shadow-xs group-hover:!scale-125 !transition-transform" />
                  </div>
                  <div className="!flex !items-center !justify-between">
                    <span className="!text-[10px] !uppercase !tracking-wider !font-family-bold !text-slate-400 !block">
                      Start
                    </span>
                    <span className="!text-[10px] !text-[#004a70] !font-family-semibold !opacity-0 group-hover:!opacity-100 !transition-opacity">
                      View on map ↗
                    </span>
                  </div>
                  <p className="!text-xs !text-slate-800 !font-family-semibold !m-0 !mt-0.5 !leading-relaxed group-hover:!text-[#004a70] !transition-colors">
                    {productDetail?.name}
                  </p>
                </div>

                {/* Stops */}
                {Array.isArray(productDetail?.stop) && productDetail.stop.map((stop, idx) => {
                  const stopLng = stop.longitude || stop.lng;
                  const stopLat = stop.latitude || stop.lat;
                  const stopTitle = stop.title || stop.address || `Stop ${idx + 1}`;

                  return (
                    <div
                      key={idx}
                      onClick={() => zoomToLocation(stopLng, stopLat, stopTitle)}
                      className="!relative !p-2 !rounded-xl hover:!bg-amber-50/60 !cursor-pointer !transition-colors group"
                      title="Click to zoom on map"
                    >
                      <div className="!absolute !left-[-32px] !top-2 !w-6 !h-6 !flex !items-center !justify-center">
                        <div className="!w-3.5 !h-3.5 !rounded-full !bg-amber-500 !ring-4 !ring-white !shadow-xs group-hover:!scale-125 !transition-transform" />
                      </div>
                      <div className="!flex !items-center !justify-between">
                        <span className="!text-[10px] !uppercase !tracking-wider !font-family-bold !text-amber-600 !block">
                          Stop {idx + 1}
                        </span>
                        <span className="!text-[10px] !text-amber-600 !font-family-semibold !opacity-0 group-hover:!opacity-100 !transition-opacity">
                          View on map ↗
                        </span>
                      </div>
                      <p className="!text-xs !text-slate-800 !font-family-medium !m-0 !mt-0.5 !leading-relaxed group-hover:!text-amber-800 !transition-colors">
                        {stop.title || stop.address}
                      </p>
                    </div>
                  );
                })}

                {/* End */}
                <div
                  onClick={() => zoomToLocation(productDetail?.end?.[0], productDetail?.end?.[1], productDetail?.metaTitle || "Destination")}
                  className="!relative !p-2 !rounded-xl hover:!bg-rose-50/60 !cursor-pointer !transition-colors group"
                  title="Click to zoom on map"
                >
                  <div className="!absolute !left-[-32px] !top-2 !w-6 !h-6 !flex !items-center !justify-center">
                    <div className="!w-3.5 !h-3.5 !rounded-full !bg-rose-600 !ring-4 !ring-white !shadow-xs group-hover:!scale-125 !transition-transform" />
                  </div>
                  <div className="!flex !items-center !justify-between">
                    <span className="!text-[10px] !uppercase !tracking-wider !font-family-bold !text-rose-500 !block">
                      End
                    </span>
                    <span className="!text-[10px] !text-rose-600 !font-family-semibold !opacity-0 group-hover:!opacity-100 !transition-opacity">
                      View on map ↗
                    </span>
                  </div>
                  <p className="!text-xs !text-slate-800 !font-family-semibold !m-0 !mt-0.5 !leading-relaxed group-hover:!text-rose-600 !transition-colors">
                    {productDetail?.metaTitle}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Itinerary Stops Pill List (if stops exist) */}
            {Array.isArray(productDetail?.stop) && productDetail.stop.length > 0 && (
              <div className="!bg-white !rounded-3xl !border !border-slate-200/90 !p-5 !shadow-[0_4px_25px_rgba(0,0,0,0.04)]">
                <h3 className="!text-sm sm:!text-[15px] !font-family-bold !text-slate-800 !m-0 !mb-3">
                  Itinerary stops ({stopsCount})
                </h3>
                <div className="!space-y-2">
                  {productDetail.stop.map((stop, idx) => (
                    <div
                      key={idx}
                      onClick={() => zoomToLocation(stop.longitude || stop.lng, stop.latitude || stop.lat, stop.title || stop.address)}
                      className="!flex !items-center !gap-2.5 !p-2.5 !bg-slate-50 hover:!bg-amber-50/60 !border !border-slate-100 !rounded-xl !cursor-pointer !transition-colors"
                      title="Click to zoom on map"
                    >
                      <span className="!w-5 !h-5 !rounded-full !bg-amber-100 !text-amber-800 !flex !items-center !justify-center !text-[11px] !font-family-bold !shrink-0">
                        {idx + 1}
                      </span>
                      <span className="!text-xs !font-family-medium !text-slate-700 !truncate !flex-1">
                        {stop.title || stop.address}
                      </span>
                      <span className="!text-[11px] !text-amber-700 !font-family-medium">
                        Zoom ↗
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Trip Summary Card - Matching Mobile App Exact Breakdown */}
            <div className="!bg-white !rounded-3xl !border !border-slate-200/90 !p-5 !shadow-[0_4px_25px_rgba(0,0,0,0.04)]">
              <h3 className="!text-sm sm:!text-[15px] !font-family-bold !text-slate-800 !m-0 !mb-3.5">
                Trip summary
              </h3>

              <div className="!space-y-2.5 !text-xs">
                <div className="!flex !justify-between !items-center !text-slate-500">
                  <span>Distance</span>
                  <span className="!font-family-semibold !text-slate-800">{distanceKM} Km</span>
                </div>
                
                <div className="!flex !justify-between !items-center !text-slate-500">
                  <span>ETA drop-off</span>
                  <span className="!font-family-semibold !text-slate-800">{timeDropOff} min</span>
                </div>

                {multiPrice > 0 ? (
                  <>
                    <div className="!flex !justify-between !items-center !text-slate-500">
                      <span>Total stops</span>
                      <span className="!font-family-semibold !text-slate-800">{stopsCount}</span>
                    </div>
                    <div className="!flex !justify-between !items-center !text-slate-500">
                      <span>Tour price</span>
                      <span className="!font-family-semibold !text-slate-800">${multiPrice.toFixed(2)} XCD</span>
                    </div>
                  </>
                ) : null}

                <div className="!flex !justify-between !items-center !text-slate-500">
                  <span>Fee included</span>
                  <span className="!font-family-semibold !text-slate-800">$8.00 XCD</span>
                </div>

                {couponDiscountAmount > 0 && (
                  <div className="!flex !justify-between !items-center !text-emerald-600 !font-family-semibold">
                    <span>Coupon discount ({couponData?.discount}%)</span>
                    <span>-${couponDiscountAmount.toFixed(2)} XCD</span>
                  </div>
                )}

                <div className="!pt-2.5 !border-t !border-slate-100 !flex !justify-between !items-center !text-slate-800 !font-family-semibold !text-[13px]">
                  <span>Fare</span>
                  <span>${totalFareXCD.toFixed(2)} XCD</span>
                </div>

                <div className="!flex !justify-between !items-center !text-slate-500">
                  <span>Convenience fee</span>
                  <span className="!font-family-medium">$3.00 XCD - $1.11 USD</span>
                </div>

                {/* Total Amount Row */}
                <div className="!pt-3 !border-t !border-slate-200 !flex !justify-between !items-baseline">
                  <div>
                    <span className="!text-xs !font-family-bold !text-slate-800 !block">
                      Total amount
                    </span>
                    <span className="!text-[11px] !text-slate-400">
                      ≈ ${totalAmountUSD} USD
                    </span>
                  </div>
                  <span className="!text-lg sm:!text-xl !font-family-bold !text-[#004a70]">
                    ${totalAmountXCD.toFixed(2)} <span className="!text-xs !font-family-semibold text-slate-500">XCD</span>
                  </span>
                </div>
              </div>

              {/* Action Button: Opens Select Payment Method Modal */}
              <div className="!mt-5">
                <CustomButton
                  onClick={handleProceed}
                  variant="primary"
                  size="lg"
                  loading={WalletLoading}
                  className="!w-full !py-3.5 !bg-[#004a70] hover:!bg-[#003855] !text-white !font-family-bold !rounded-2xl !shadow-md !transition-all !cursor-pointer !border-none !text-sm"
                >
                  <span>Proceed to Payment</span>
                  <FiArrowRight className="!inline-block !ml-1.5" />
                </CustomButton>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ===== PORTAL-RENDERED MODALS (Overlays Navbar & Entire Screen) ===== */}
      {isMounted && typeof document !== "undefined" && createPortal(
        <>
          {/* ===== 3. MOBILE-APP MATCHED "SELECT PAYMENT METHOD" MODAL ===== */}
          {showSelectPaymentModal && (
            <div className="!fixed !inset-0 !z-[999999] !flex !items-center !justify-center !p-4 !bg-black/65 !backdrop-blur-sm animate-fade-in">
              <div
                className="!fixed !inset-0"
                onClick={() => setShowSelectPaymentModal(false)}
              />
              <div className="!relative !z-10 !bg-white !rounded-3xl !shadow-2xl !max-w-md !w-full !p-6 !pt-4 !max-h-[90vh] !overflow-y-auto">
                {/* Top Handle Bar */}
                <div className="!w-10 !h-1 !bg-slate-300 !rounded-full !mx-auto !mb-3" />

                {/* Modal Header */}
                <div className="!flex !items-center !justify-between !mb-5 !relative">
                  <h3 className="!text-base sm:!text-lg !font-family-bold !text-slate-900 !m-0 !w-full !text-center">
                    Select Payment Method
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowSelectPaymentModal(false)}
                    className="!absolute !right-0 !top-0 !w-8 !h-8 !rounded-full !bg-slate-100 hover:!bg-slate-200 !text-slate-600 !flex !items-center !justify-center !border-none !cursor-pointer !transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>

                <div className="!space-y-4">
                  {/* Note (optional) */}
                  <div>
                    <label className="!text-xs !font-family-medium !text-slate-600 !block !mb-1.5">
                      Note (optional)
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Note"
                      className="!w-full !px-3.5 !py-2.5 !rounded-xl !bg-white !border !border-slate-200 !text-xs !text-slate-800 focus:!outline-none focus:!ring-1 focus:!ring-[#004a70] !transition-all"
                    />
                  </div>

                  {/* Coupon Code */}
                  <div>
                    <label className="!text-xs !font-family-medium !text-slate-600 !block !mb-1.5">
                      Coupon
                    </label>
                    <div className="!flex !items-center !gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError("");
                        }}
                        placeholder="Enter Coupon Code"
                        className="!flex-1 !px-3.5 !py-2.5 !rounded-xl !bg-white !border !border-slate-200 !text-xs !text-slate-800 focus:!outline-none focus:!ring-1 focus:!ring-[#004a70] !transition-all"
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="!px-4 !py-2.5 !rounded-xl !bg-sky-50 hover:!bg-sky-100 !text-[#004a70] !border !border-sky-200 disabled:!opacity-60 !font-family-bold !text-xs !cursor-pointer disabled:!cursor-not-allowed !transition-all !shrink-0 !flex !items-center !justify-center !min-w-[80px] !shadow-xs"
                      >
                        {couponLoading ? (
                          <div className="!h-4 !w-4 !animate-spin !rounded-full !border-2 !border-[#004a70]/25 !border-t-[#004a70]" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <span className="!text-[11px] !text-rose-500 !block !mt-1 !font-family-medium">
                        {couponError}
                      </span>
                    )}
                    {couponData && (
                      <span className="!text-[11px] !text-emerald-600 !font-family-semibold !block !mt-1">
                        ✓ {couponData.discount}% discount applied
                      </span>
                    )}
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <label className="!text-xs !font-family-bold !text-slate-800 !block !mb-2.5">
                      Payment method
                    </label>

                    <div className="!space-y-2.5">
                      {/* 1. Wallet */}
                      <div
                        onClick={() => setPaymentMethod("wallet")}
                        className={`!p-3.5 !rounded-2xl !border !flex !items-center !justify-between !cursor-pointer !transition-all ${
                          PaymentMethod === "wallet"
                            ? "!border-[#004a70] !bg-sky-50/30 !ring-1 !ring-[#004a70]/30"
                            : "!border-slate-200 hover:!border-slate-300 !bg-white"
                        }`}
                      >
                        <div className="!flex !items-center !gap-3">
                          <div className="!w-9 !h-9 !rounded-xl !bg-slate-100 !flex !items-center !justify-center !text-[#004a70]">
                            <FaWallet size={16} />
                          </div>
                          <div>
                            <h5 className="!text-xs sm:!text-[13px] !font-family-bold !text-slate-900 !m-0">
                              Wallet
                            </h5>
                            <span className="!text-[11px] !text-slate-400 !font-family-medium">
                              Balance: ${Number(userData?.user?.amount || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Credit / Debit Card */}
                      <div
                        onClick={() => setPaymentMethod("jad")}
                        className={`!p-3.5 !rounded-2xl !border !flex !items-center !justify-between !cursor-pointer !transition-all ${
                          PaymentMethod === "jad"
                            ? "!border-[#004a70] !bg-sky-50/30 !ring-1 !ring-[#004a70]/30"
                            : "!border-slate-200 hover:!border-slate-300 !bg-white"
                        }`}
                      >
                        <div className="!flex !items-center !gap-3">
                          <div className="!w-9 !h-9 !rounded-xl !bg-slate-100 !flex !items-center !justify-center !text-[#004a70]">
                            <BsCreditCard2Back size={17} />
                          </div>
                          <div>
                            <h5 className="!text-xs sm:!text-[13px] !font-family-bold !text-slate-900 !m-0">
                              Credit / Debit Card
                            </h5>
                            <span className="!text-[11px] !text-slate-400 !font-family-medium">
                              Visa / Mastercard
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 3. Cash */}
                      <div
                        onClick={() => setPaymentMethod("cash")}
                        className={`!p-3.5 !rounded-2xl !border !flex !items-center !justify-between !cursor-pointer !transition-all ${
                          PaymentMethod === "cash"
                            ? "!border-[#004a70] !bg-sky-50/30 !ring-1 !ring-[#004a70]/30"
                            : "!border-slate-200 hover:!border-slate-300 !bg-white"
                        }`}
                      >
                        <div className="!flex !items-center !gap-3">
                          <div className="!w-9 !h-9 !rounded-xl !bg-slate-100 !flex !items-center !justify-center !text-[#004a70]">
                            <BsCashCoin size={17} />
                          </div>
                          <div>
                            <h5 className="!text-xs sm:!text-[13px] !font-family-bold !text-slate-900 !m-0">
                              Cash
                            </h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Amount in Modal */}
                  <div className="!pt-2 !flex !justify-between !items-center !text-xs !text-slate-600">
                    <span className="!font-family-semibold">Total Payable</span>
                    <span className="!text-sm !font-family-bold !text-[#004a70]">
                      ${totalAmountXCD.toFixed(2)} XCD (≈ ${totalAmountUSD} USD)
                    </span>
                  </div>

                  {/* Done Action Button */}
                  <div className="!pt-3">
                    <button
                      type="button"
                      onClick={handleConfirmPaymentMethod}
                      disabled={WalletLoading}
                      className="!w-full !py-3.5 !bg-[#004a70] hover:!bg-[#003855] !text-white !font-family-bold !rounded-2xl !text-sm !shadow-md !cursor-pointer !border-none !transition-all"
                    >
                      {WalletLoading ? "Processing..." : "Done"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== 4. JAD CREDIT/DEBIT CARD MODAL ===== */}
          {showJadModal && (
            <div className="!fixed !inset-0 !z-[999999] !flex !items-center !justify-center !p-4 !bg-black/65 !backdrop-blur-sm animate-fade-in">
              <div
                className="!fixed !inset-0"
                onClick={() => {
                  setShowJadModal(false);
                  setShowSelectPaymentModal(true);
                }}
              />
              <div className="!relative !z-10 !bg-white !rounded-3xl !shadow-2xl !max-w-2xl !w-full !overflow-hidden !max-h-[90vh] !overflow-y-auto">
                {/* Custom Header with guaranteed working close button */}
                <div className="!flex !items-center !justify-between !px-6 !py-4 !border-b !border-slate-100">
                  <h4 className="!text-base !font-family-bold !text-slate-900 !m-0">
                    Secure Card Payment
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setShowJadModal(false);
                      setShowSelectPaymentModal(true);
                    }}
                    className="!w-8 !h-8 !rounded-full !bg-slate-100 hover:!bg-slate-200 !text-slate-600 !flex !items-center !justify-center !border-none !cursor-pointer !transition-colors"
                  >
                    <FiX size={17} />
                  </button>
                </div>

                <div className="!p-6">
                  <div className="!mb-4 !flex !justify-between !items-center !p-3 !bg-slate-50 !rounded-2xl !border !border-slate-200/80">
                    <span className="!text-xs !font-family-semibold !text-slate-700">Total Payable</span>
                    <span className="!text-base !font-family-bold !text-[#004a70]">
                      ${totalAmountXCD.toFixed(2)} XCD <span className="!text-xs !font-family-regular !text-slate-500">(≈ ${totalAmountUSD} USD)</span>
                    </span>
                  </div>

                  <div className="!grid !grid-cols-1 md:!grid-cols-12 !gap-5 !items-center">
                    <div className="md:!col-span-6 !flex !justify-center">
                      <Cards
                        cvc={cardDetails.cvc}
                        expiry={cardDetails.expiry}
                        name={cardDetails.name}
                        number={cardDetails.number}
                      />
                    </div>

                    <div className="md:!col-span-6 !space-y-2.5">
                      <input
                        className="!w-full !p-2.5 !border !border-slate-200 !rounded-xl !text-xs !text-slate-900 focus:!outline-none focus:!ring-1 focus:!ring-[#004a70]"
                        type="text"
                        placeholder="Card Number"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        maxLength="19"
                      />
                      <input
                        className="!w-full !p-2.5 !border !border-slate-200 !rounded-xl !text-xs !text-slate-900 focus:!outline-none focus:!ring-1 focus:!ring-[#004a70]"
                        type="text"
                        placeholder="Cardholder Name"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      />
                      <div className="!grid !grid-cols-2 !gap-2">
                        <input
                          className="!w-full !p-2.5 !border !border-slate-200 !rounded-xl !text-xs !text-slate-900 focus:!outline-none focus:!ring-1 focus:!ring-[#004a70]"
                          type="text"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            if (val.length >= 3) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                            setCardDetails({ ...cardDetails, expiry: val.slice(0, 5) });
                          }}
                          maxLength="5"
                        />
                        <input
                          className="!w-full !p-2.5 !border !border-slate-200 !rounded-xl !text-xs !text-slate-900 focus:!outline-none focus:!ring-1 focus:!ring-[#004a70]"
                          type="text"
                          placeholder="CVC"
                          value={cardDetails.cvc}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value.slice(0, 4) })}
                          maxLength="4"
                        />
                      </div>
                      <input
                        className="!w-full !p-2.5 !border !border-slate-200 !rounded-xl !text-xs !text-slate-900 focus:!outline-none focus:!ring-1 focus:!ring-[#004a70]"
                        type="email"
                        placeholder="Email Address"
                        value={cardDetails.email}
                        onChange={(e) => setCardDetails({ ...cardDetails, email: e.target.value })}
                      />
                      <input
                        className="!w-full !p-2.5 !border !border-slate-200 !rounded-xl !text-xs !text-slate-900 focus:!outline-none focus:!ring-1 focus:!ring-[#004a70]"
                        type="tel"
                        placeholder="Phone Number"
                        value={cardDetails.phone}
                        onChange={(e) => setCardDetails({ ...cardDetails, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="!mt-5">
                    <CustomButton
                      onClick={handleJadCardPayment}
                      variant="primary"
                      size="lg"
                      loading={jadLoading}
                      className="!w-full !py-3 !bg-[#004a70] hover:!bg-[#003855] !text-white !font-family-semibold !rounded-2xl !shadow-md !cursor-pointer !border-none !text-xs sm:!text-sm"
                    >
                      Pay ${totalAmountXCD.toFixed(2)} XCD Now
                    </CustomButton>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== 5. REDESIGNED SEARCHING FOR DRIVER MODAL ===== */}
          {showSearchingModal && (
            <div className="!fixed !inset-0 !z-[999999] !flex !items-center !justify-center !p-4 !bg-black/70 !backdrop-blur-sm animate-fade-in">
              <div className="!relative !z-10 !bg-white !rounded-3xl !shadow-2xl !max-w-md !w-full !overflow-hidden">
                {/* Top Radar & Visual Header */}
                <div className="!relative !bg-gradient-to-b !from-[#001726] !via-[#002842] !to-[#001f33] !p-8 !text-center !overflow-hidden">
                  {/* Animated Radar Pulse Rings */}
                  <div className="!absolute !inset-0 !flex !items-center !justify-center !pointer-events-none">
                    <div className="!w-44 !h-44 !rounded-full !border !border-sky-400/20 !animate-ping !opacity-30" />
                    <div className="!absolute !w-32 !h-32 !rounded-full !border !border-sky-400/30 !animate-pulse" />
                    <div className="!absolute !w-20 !h-20 !rounded-full !bg-sky-500/15 !blur-md" />
                  </div>

                  {/* Central Animated Vehicle Icon */}
                  <div className="!relative !z-10 !w-16 !h-16 !mx-auto !rounded-2xl !bg-[#004a70] !border !border-sky-300/40 !shadow-[0_0_25px_rgba(56,189,248,0.35)] !flex !items-center !justify-center !text-white">
                    <FaCar size={26} className="!animate-bounce !text-sky-300" />
                  </div>

                  {/* Radar Active Badge */}
                  <div className="!relative !z-10 !inline-flex !items-center !gap-1.5 !bg-emerald-500/20 !border !border-emerald-400/40 !backdrop-blur-md !px-3 !py-1 !rounded-full !mt-4 !text-emerald-300 !text-[11px] !font-family-semibold">
                    <span className="!w-2 !h-2 !rounded-full !bg-emerald-400 !animate-ping" />
                    <span>Broadcasting to Nearby Drivers</span>
                  </div>
                </div>

                {/* Modal Content Body */}
                <div className="!p-6 !space-y-4">
                  <div className="!text-center">
                    <h3 className="!text-base sm:!text-lg !font-family-bold !text-slate-900 !m-0">
                      Finding Your Driver...
                    </h3>
                    <p className="!text-xs !text-slate-500 !font-family-regular !m-0 !mt-1">
                      Drivers within 5 km are reviewing your route and fare.
                    </p>
                  </div>

                  {/* Trip Summary Chip */}
                  <div className="!p-3.5 !bg-slate-50 !rounded-2xl !border !border-slate-200/80 !space-y-2.5">
                    <div className="!flex !items-start !gap-2.5">
                      <span className="!w-2.5 !h-2.5 !rounded-full !bg-[#004a70] !mt-1 !shrink-0" />
                      <div className="!min-w-0 !flex-1">
                        <span className="!text-[10px] !uppercase !font-family-bold !text-slate-400 !block">
                          Pickup
                        </span>
                        <p className="!text-xs !font-family-medium !text-slate-800 !m-0 !truncate">
                          {productDetail?.name || "Start location"}
                        </p>
                      </div>
                    </div>

                    <div className="!flex !items-start !gap-2.5">
                      <span className="!w-2.5 !h-2.5 !rounded-full !bg-rose-600 !mt-1 !shrink-0" />
                      <div className="!min-w-0 !flex-1">
                        <span className="!text-[10px] !uppercase !font-family-bold !text-rose-400 !block">
                          Destination
                        </span>
                        <p className="!text-xs !font-family-medium !text-slate-800 !m-0 !truncate">
                          {productDetail?.metaTitle || "Destination"}
                        </p>
                      </div>
                    </div>

                    <div className="!pt-2 !border-t !border-slate-200/70 !flex !items-center !justify-between !text-xs">
                      <div className="!flex !items-center !gap-2">
                        <span className="!px-2 !py-0.5 !rounded-lg !bg-[#004a70]/10 !text-[#004a70] !font-family-bold !text-[11px]">
                          {RideType?.title || "Standard"}
                        </span>
                        <span className="!text-slate-400">·</span>
                        <span className="!capitalize !text-slate-500 !font-family-medium">
                          {PaymentMethod === "jad" ? "Card" : PaymentMethod}
                        </span>
                      </div>
                      <span className="!font-family-bold !text-slate-900 !text-[13px]">
                        ${totalAmountXCD.toFixed(2)} XCD
                      </span>
                    </div>
                  </div>

                  {/* Cancel Request Action */}
                  <div className="!pt-1">
                    <button
                      type="button"
                      onClick={CancelRequest}
                      disabled={cancelLoading}
                      className="!w-full !py-3 !rounded-2xl !bg-rose-50 hover:!bg-rose-100 !text-rose-600 hover:!text-rose-700 !font-family-bold !text-xs !transition-colors !border !border-rose-200/80 !cursor-pointer !flex !items-center !justify-center !gap-2"
                    >
                      {cancelLoading ? (
                        <div className="!h-4 !w-4 !animate-spin !rounded-full !border-2 !border-rose-300 !border-t-rose-600" />
                      ) : (
                        "Cancel Request"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== 6. SUCCESS MODAL ===== */}
          {showSuccessModal && (
            <div className="!fixed !inset-0 !z-[999999] !flex !items-center !justify-center !p-4 !bg-black/70 !backdrop-blur-sm animate-fade-in">
              <div className="!relative !z-10 !bg-white !rounded-3xl !shadow-2xl !max-w-sm !w-full !p-8 !text-center">
                <div className="!w-16 !h-16 !rounded-full !bg-emerald-100 !text-emerald-600 !flex !items-center !justify-center !mx-auto !mb-4">
                  <FiCheckCircle size={32} />
                </div>
                <h3 className="!text-lg !font-family-bold !text-slate-900 !m-0 !mb-1.5">
                  Booking Confirmed!
                </h3>
                <p className="!text-xs !text-slate-500 !font-family-regular !mb-6">
                  Your driver has accepted your ride request.
                </p>
                <CustomButton
                  onClick={() => {
                    setShowSuccessModal(false);
                    router.push("/admin");
                  }}
                  variant="primary"
                  size="md"
                  className="!w-full !py-2.5 !bg-[#004a70] hover:!bg-[#003855] !text-white !font-family-semibold !rounded-xl !border-none !cursor-pointer"
                >
                  View in My Bookings
                </CustomButton>
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </div>
  );
}

export default function BookRidePage() {
  return (
    <Suspense fallback={<div className="!min-h-screen !flex !items-center !justify-center !bg-slate-50"><div className="!h-8 !w-8 !animate-spin !rounded-full !border-3 !border-slate-200 !border-t-[#004a70]" /></div>}>
      <BookRideComponent />
    </Suspense>
  );
}
