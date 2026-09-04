"use client";

import React, { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import moment from "moment";
import { message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import {
  FaClock,
  FaUsers,
  FaLocationDot,
  FaShieldHalved,
  FaStar,
  FaCheck,
  FaPlus,
  FaMinus,
  FaTag,
  FaCircleCheck,
  FaCalendarDays,
  FaLocationCrosshairs,
} from "react-icons/fa6";
import { FaCalendarAlt, FaSearch } from "react-icons/fa";
import { FiArrowRight, FiArrowLeft, FiCheckCircle, FiShare2 } from "react-icons/fi";
import { MdOutlineLocalOffer, MdPayment, MdOutlineRoomService } from "react-icons/md";
import { BsCashCoin, BsCreditCard2Back } from "react-icons/bs";

import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { setPaymentCards } from "@/components/Redux/Slices/AuthSlice";
import { AuthTextField, AuthSpinner, AuthPrimaryButton } from "@/components/auth/AuthShell";
import { Loader } from "@googlemaps/js-api-loader";

const apiKey = process.env.NEXT_PUBLIC_JAD_API_KEY;
const apiSecret = process.env.NEXT_PUBLIC_JAD_API_SECRET;
const tokenUrl = process.env.NEXT_PUBLIC_JAD_TOKEN_URL;
const paymentUrl = process.env.NEXT_PUBLIC_JAD_PAYMENT_URL;
const jadNumber = process.env.NEXT_PUBLIC_JAD_NUMBER;

const XCD_PER_USD = 2.7;

// Utility functions matching CabKn35/src/utils/serviceBooking.js & convenienceFee.js
const round2 = (val) => Number((Number(val) || 0).toFixed(2));
const toUsd = (xcd) => round2((Number(xcd) || 0) / XCD_PER_USD);

const getItemDiscountPercent = (item) => {
  const n = Number(item?.discountPercent ?? item?.discount);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(n, 100);
};

const applyItemDiscount = (amount, item) => {
  const base = round2(amount);
  const percent = getItemDiscountPercent(item);
  if (percent <= 0 || !(base > 0)) return base;
  return round2(base * (1 - percent / 100));
};

const getSpecialDiscountPercent = (userOrPercent) => {
  const n = Number(
    userOrPercent && typeof userOrPercent === "object"
      ? userOrPercent.specialDiscount ?? userOrPercent.user?.specialDiscount
      : userOrPercent
  );
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(100, round2(n));
};

const applySpecialDiscount = (amount, userOrPercent) => {
  const base = round2(amount);
  const percent = getSpecialDiscountPercent(userOrPercent);
  if (percent <= 0 || !(base > 0)) {
    return { percent: 0, amount: 0, discounted: base };
  }
  const discountAmount = round2((base * percent) / 100);
  return {
    percent,
    amount: discountAmount,
    discounted: round2(Math.max(0, base - discountAmount)),
  };
};

const calcServiceFee = (baseXcd) => round2(((Number(baseXcd) || 0) * 20) / 100); // 20% service fee
const calcConvenienceFee = () => 3.0; // Flat 3.00 XCD

function BookServiceComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("id");
  const encodedData = searchParams.get("data");

  const { getData, postData, header1, header3, userData } = ApiFunction();
  const dispatch = useDispatch();
  const paymentCards = useSelector((state) => state.auth?.paymentCards);

  const [mounted, setMounted] = useState(false);
  const [service, setService] = useState(null);
  const [loadingService, setLoadingService] = useState(true);

  // Guest counters (for individual pricing)
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [infants, setInfants] = useState(0);

  // Date & Time selections
  const [selectedCalendarDate, setSelectedCalendarDate] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  // Location handling
  const [serviceAddress, setServiceAddress] = useState("");
  const [serviceCoords, setServiceCoords] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [addressPredictions, setAddressPredictions] = useState([]);
  const [addressPredictLoading, setAddressPredictLoading] = useState(false);

  // Existing bookings (to warn against duplicate dates)
  const [myBookings, setMyBookings] = useState([]);

  // Note & Coupon
  const [note, setNote] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Step state: 1 = Schedule & Details, 2 = Review & Payment, 3 = Confirmation
  const [step, setStep] = useState(1);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("wallet"); // wallet | jad
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookedDetails, setBookedDetails] = useState(null);

  // Card form details
  const [cardDetails, setCardDetails] = useState({
    cvc: "",
    expiry: "",
    name: "",
    number: "",
    email: "",
    phone: "",
  });

  const isGroup = useMemo(() => {
    return String(service?.bookingType || "").toLowerCase() === "group";
  }, [service]);

  const atLocation = useMemo(() => {
    return service?.locationType !== "meeting_point";
  }, [service]);

  // Validation schema
  const serviceSchema = useMemo(() => {
    return Yup.object().shape({
      selectedDate: Yup.string().required("Service date is required"),
      selectedSlot: Yup.string().required("Time slot is required"),
      serviceAddress: atLocation
        ? Yup.string().required("Service address is required")
        : Yup.string().optional(),
      cardName: paymentMethod === "jad" ? Yup.string().required("Cardholder name is required") : Yup.string().optional(),
      cardNumber: paymentMethod === "jad" ? Yup.string().required("Card number is required") : Yup.string().optional(),
      cardExpiry: paymentMethod === "jad" ? Yup.string().required("Expiry date is required") : Yup.string().optional(),
      cardCvc: paymentMethod === "jad" ? Yup.string().required("CVC is required") : Yup.string().optional(),
    });
  }, [atLocation, paymentMethod]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(serviceSchema),
    defaultValues: {
      selectedDate: "",
      selectedSlot: "",
      serviceAddress: "",
      cardName: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync date, slot & address with react-hook-form
  useEffect(() => {
    if (selectedCalendarDate) setValue("selectedDate", selectedCalendarDate, { shouldValidate: true });
    if (selectedSlot) setValue("selectedSlot", selectedSlot, { shouldValidate: true });
    if (serviceAddress) setValue("serviceAddress", serviceAddress, { shouldValidate: true });
  }, [selectedCalendarDate, selectedSlot, serviceAddress, setValue]);

  // 1. Fetch service details or load from state/param
  useEffect(() => {
    let initialService = null;

    if (encodedData) {
      try {
        initialService = JSON.parse(decodeURIComponent(encodedData));
      } catch (e) {}
    }

    if (!initialService && serviceId && typeof window !== "undefined") {
      try {
        const stored =
          sessionStorage.getItem(`service_${serviceId}`) ||
          sessionStorage.getItem("selected_service");
        if (stored) initialService = JSON.parse(stored);
      } catch (e) {}
    }

    if (initialService) {
      setService(initialService);
      setLoadingService(false);
    } else if (serviceId) {
      fetchServiceDetail(serviceId);
    } else {
      setLoadingService(false);
    }
  }, [serviceId, encodedData]);

  const fetchServiceDetail = async (id) => {
    setLoadingService(true);
    try {
      const res = await getData(`top-services/details/${id}`, header1);
      const fetched = res?.service || res?.data?.service;
      if (fetched) {
        setService(fetched);
      }
    } catch (e) {
      console.error("Service detail fetch error:", e);
    } finally {
      setLoadingService(false);
    }
  };

  // 2. Fetch existing user bookings for this service (duplicate date check)
  useEffect(() => {
    if (!service?._id) return;
    getData(`service-bookings/mine/1?serviceId=${service._id}&limit=20`, header1)
      .then((res) => {
        setMyBookings(res?.data?.bookings || res?.bookings || []);
      })
      .catch(() => {});
  }, [service?._id]);

  // Setup schedule & default date
  const scheduleDays = useMemo(() => {
    return (service?.schedule || []).filter((row) => row?.day && row?.slots?.length);
  }, [service]);

  useEffect(() => {
    if (scheduleDays.length > 0 && !selectedDay) {
      const first = scheduleDays[0];
      setSelectedDay(first.day);
      setSelectedSlot(first.slots[0] || "");
      const nextDate = moment().day(first.day);
      if (nextDate.isBefore(moment(), "day")) {
        nextDate.add(7, "days");
      }
      setSelectedCalendarDate(nextDate.format("YYYY-MM-DD"));
    }
  }, [scheduleDays]);

  // Check if current selected date already has an active booking
  const existingBookingForDate = useMemo(() => {
    if (!selectedCalendarDate) return null;
    return (
      myBookings.find((b) => {
        const dateMatch = String(b?.date || "").trim() === selectedCalendarDate;
        const statusMatch = ["pending", "confirmed"].includes(String(b?.status || "").toLowerCase());
        return dateMatch && statusMatch;
      }) || null
    );
  }, [myBookings, selectedCalendarDate]);

  // Google Places search for Location
  const handleAddressSearch = async (text) => {
    setServiceAddress(text);
    setValue("serviceAddress", text, { shouldValidate: true });
    if (!text.trim() || text.length < 2) {
      setAddressPredictions([]);
      return;
    }
    setAddressPredictLoading(true);
    const loader = new Loader({
      apiKey: "AIzaSyCkw_MZd-894MZUR4g1_p2XohCWTSTR8S4",
      version: "weekly",
    });
    try {
      await loader.importLibrary("places");
      const autocompleteService = new google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions(
        { input: text, componentRestrictions: { country: "KN" } },
        async (preds, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
            setAddressPredictions(preds);
          } else {
            setAddressPredictions([]);
          }
          setAddressPredictLoading(false);
        }
      );
    } catch (err) {
      setAddressPredictions([]);
      setAddressPredictLoading(false);
    }
  };

  const handleSelectPrediction = async (pred) => {
    const desc = pred.description;
    setServiceAddress(desc);
    setValue("serviceAddress", desc, { shouldValidate: true });
    setAddressPredictions([]);

    // Geocode to get lat/lng
    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ placeId: pred.place_id }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const loc = results[0].geometry.location;
          setServiceCoords({ latitude: loc.lat(), longitude: loc.lng() });
        }
      });
    } catch (_) {}
  };

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      message.error("Geolocation is not supported by your browser");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setServiceCoords({ latitude: lat, longitude: lng });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setServiceAddress(addr);
          setValue("serviceAddress", addr, { shouldValidate: true });
          message.success("Current location set!");
        } catch (e) {
          const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setServiceAddress(fallback);
          setValue("serviceAddress", fallback, { shouldValidate: true });
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        message.error("Unable to retrieve location");
        setGeoLoading(false);
      }
    );
  };

  // Pricing calculations
  const agePrices = useMemo(() => {
    const adultFallback = Number(service?.price || 0);
    const ages = service?.agePrices || {};
    return {
      infant: Number(ages.infant ?? 0),
      kid: Number(ages.kid ?? 0),
      adult: Number(ages.adult ?? adultFallback),
    };
  }, [service]);

  const rawSubtotalXCD = useMemo(() => {
    if (isGroup) return Number(service?.price || 0);
    return adults * agePrices.adult + kids * agePrices.kid + infants * agePrices.infant;
  }, [isGroup, service, adults, kids, infants, agePrices]);

  const totalGuests = isGroup ? 1 : Math.max(1, adults + kids + infants);

  const catalogDiscountedXCD = useMemo(() => {
    return applyItemDiscount(rawSubtotalXCD, service);
  }, [rawSubtotalXCD, service]);

  const couponDiscountXCD = useMemo(() => {
    if (!couponData?.discount) return 0;
    const pct = Number(couponData.discount || 0);
    return round2((catalogDiscountedXCD * pct) / 100);
  }, [catalogDiscountedXCD, couponData]);

  const afterCouponXCD = Math.max(0, catalogDiscountedXCD - couponDiscountXCD);

  const specialDiscount = useMemo(() => {
    return applySpecialDiscount(afterCouponXCD, userData?.user || userData);
  }, [afterCouponXCD, userData]);

  const finalFareXCD = specialDiscount.discounted;
  const serviceFeeXCD = calcServiceFee(finalFareXCD); // 20%
  const convenienceFeeXCD = calcConvenienceFee(); // 3.00 XCD
  const totalPayableXCD = round2(finalFareXCD + serviceFeeXCD + convenienceFeeXCD);

  // In USD
  const rawSubtotalUSD = toUsd(rawSubtotalXCD);
  const finalFareUSD = toUsd(finalFareXCD);
  const serviceFeeUSD = toUsd(serviceFeeXCD);
  const convenienceFeeUSD = toUsd(convenienceFeeXCD);
  const totalPayableUSD = toUsd(totalPayableXCD);
  const couponDiscountUSD = toUsd(couponDiscountXCD);

  // Apply coupon validation (Exact Mobile API: coupon/check-validity)
  const handleApplyCoupon = async () => {
    const trimmed = couponCode.trim();
    if (!trimmed) return;
    if (trimmed.length < 3) {
      setCouponError("Enter a valid coupon code");
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    try {
      const body = { code: trimmed, service: "tours" };
      const res = await postData("coupon/check-validity", body, header1);
      if (res?.success && res?.coupon) {
        setCouponData(res.coupon);
        message.success("Coupon code applied successfully!");
      } else {
        setCouponData(null);
        setCouponError(res?.message || "Invalid coupon");
      }
    } catch (err) {
      const errMessage =
        err?.response?.data?.message || err?.message || "Unable to apply coupon";
      setCouponError(errMessage);
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Date selection handler
  const handleDateChange = (e) => {
    const dateStr = e.target.value;
    if (!dateStr) return;
    const dayName = moment(dateStr).format("dddd");
    const match = scheduleDays.find(
      (row) => String(row?.day || "").toLowerCase() === dayName.toLowerCase()
    );

    if (scheduleDays.length > 0 && !match) {
      message.warning(
        `This service is only available on: ${scheduleDays.map((d) => d.day).join(", ")}`
      );
      return;
    }

    setSelectedCalendarDate(dateStr);
    if (match) {
      setSelectedDay(match.day);
      if (!match.slots.includes(selectedSlot)) {
        setSelectedSlot(match.slots[0] || "");
      }
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedCalendarDate) {
      message.error("Please select a valid service date");
      return;
    }
    if (!selectedSlot) {
      message.error("Please select a time slot");
      return;
    }
    if (existingBookingForDate) {
      message.error("You already have an active booking on this date.");
      return;
    }
    if (!isGroup && adults < 1) {
      message.error("Please select at least 1 adult guest");
      return;
    }
    if (atLocation && !serviceAddress.trim()) {
      message.error("Please enter the service location address");
      return;
    }

    setStep(2);
  };

  // Card Payment (JAD Cash integration)
  const getToken = async () => {
    const params = new URLSearchParams({
      apikey: apiKey,
      secret: apiSecret,
      grant_type: "credentials",
    });
    const response = await fetch(`${tokenUrl}?${params.toString()}`, { method: "GET" });
    if (!response.ok) throw new Error("Failed to get payment token");
    return await response.json();
  };

  const submitCardPayment = async (token, paydata) => {
    const postBody = new URLSearchParams({
      token: token,
      paydata: JSON.stringify(paydata),
    }).toString();

    dispatch(setPaymentCards(paydata));

    const response = await axios.post(paymentUrl, postBody, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  };

  // Submit Booking API (`service-bookings/create`)
  const handleFinalBooking = async (paymentTypeVal = "wallet", paymentIdVal = "") => {
    if (paymentTypeVal === "wallet") {
      const userWalletBalance = Number(userData?.user?.amount ?? userData?.amount ?? 0);
      const totalAmountXCD = Number(totalPayableXCD);
      if (userWalletBalance < totalAmountXCD) {
        message.error(
          `Insufficient wallet balance! Your balance is $${userWalletBalance.toFixed(
            2
          )} XCD, but total payable is $${totalAmountXCD.toFixed(2)} XCD.`
        );
        return;
      }
    }

    setBookingLoading(true);
    try {
      const totalGuestsCount = isGroup ? 1 : adults + kids + infants;
      const unitPrice = isGroup ? Number(service?.price || 0) : agePrices.adult;

      const payload = {
        serviceId: service?._id,
        bookingType: isGroup ? "group" : "individual",
        locationType: atLocation ? "at_your_location" : "meeting_point",
        date: selectedCalendarDate,
        time: selectedSlot,
        day: selectedDay,
        ...(isGroup
          ? { partySize: 1 }
          : { guests: { adults, kids, infants } }),
        ...(atLocation
          ? {
              location: {
                address: serviceAddress,
                lat: serviceCoords?.latitude || null,
                lng: serviceCoords?.longitude || null,
              },
            }
          : {}),
        totalGuests: totalGuestsCount,
        unitPrice: unitPrice,
        totalPrice: Number(finalFareXCD),
        price: Number(finalFareXCD),
        convenienceFee: convenienceFeeXCD,
        serviceFee: serviceFeeXCD,
        paymentType: paymentTypeVal,
        paymentId: paymentIdVal,
        couponId: couponData?._id || "",
        note: note || "",
        notes: note || "",
        currency: "XCD",
        chargeOnCreate: true,
        serviceSnapshot: {
          title: service?.title || "",
          durationHours: service?.durationHours || 0,
          locationType: service?.locationType || "at_your_location",
          image: service?.images?.[0] || "",
        },
      };

      const res = await postData("service-bookings/create", payload, header1);

      if (res?.success !== false && (res?.booking || res?.data?.booking || res?.message)) {
        const bookedObj = res?.booking || res?.data?.booking || payload;
        setBookedDetails(bookedObj);
        message.success(res?.message || "Service booked successfully! Waiting for confirmation.");
        setStep(3);
      } else {
        message.error(res?.message || "Failed to create service booking.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong while booking.";
      message.error(serverMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleJadCardCheckout = async () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
      message.error("Please fill in card details correctly");
      return;
    }
    setBookingLoading(true);
    try {
      const tokenRes = await getToken();
      if (tokenRes.result !== "Success") throw new Error("Card token failure");

      const token = tokenRes.data.token;
      const dateString = cardDetails.expiry || "";
      const [month, year] = dateString.includes("/")
        ? dateString.split("/")
        : [dateString.slice(0, 2), dateString.slice(2)];

      const cleanNumber = cardDetails.number.replace(/\D/g, "");
      const nameParts = (cardDetails.name || "").trim().split(" ");

      const paydata = {
        live: "1",
        timestamp: moment().format("YYYYMMDDHHmmss"),
        refnum: "101",
        jadnumber: jadNumber,
        amount: totalPayableUSD.toFixed(2),
        cardnumber: cleanNumber,
        cardexpmonth: month?.trim() || "",
        cardexpyear: year?.trim() || "",
        cardcvv: cardDetails.cvc.trim(),
        cardfirstname: nameParts[0] || "Guest",
        cardlastname: nameParts.slice(1).join(" ") || "User",
        address: serviceAddress || "",
        city: "",
        state: "",
        postalcode: "",
        country: "",
        email: cardDetails.email || userData?.email || "customer@cabkn.com",
        phone: cardDetails.phone || userData?.phone || "0000000000",
      };

      const payRes = await submitCardPayment(token, paydata);

      if (payRes?.result === "Success" && payRes?.refid) {
        await handleFinalBooking("paid", payRes.refid);
      } else {
        message.error(payRes?.message || "Card payment rejected");
        setBookingLoading(false);
      }
    } catch (err) {
      message.error(err.message || "Payment failed");
      setBookingLoading(false);
    }
  };

  if (loadingService) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-[#004a70]" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h2 className="text-lg font-family-semibold text-slate-800">Service Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">The selected service could not be loaded.</p>
        <Link href="/services" className="px-5 py-2.5 rounded-xl bg-[#004a70] text-white text-xs font-family-semibold">
          Explore All Services
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#f8fafc] font-poppins text-slate-800 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      {/* Header Banner matching Tour Booking & Popular Places */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#001726] via-[#002f4a] to-[#001f33] !pt-20 sm:!pt-24 !pb-14 sm:!pb-16 text-white">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001726]/90 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 space-y-3">
          {/* Breadcrumb Navigation & Top Right Back Button */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm font-family-medium">
              <Link href="/" className="hover:text-white transition-colors no-underline text-slate-300">
                Home
              </Link>
              <span className="text-slate-400">/</span>
              <Link href="/services" className="hover:text-white transition-colors no-underline text-slate-300">
                Top Services
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-white font-family-semibold">Book a Service</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (step === 2) setStep(1);
                else router.back();
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-family-semibold backdrop-blur-md !border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <FiArrowLeft size={15} />
              <span>Back</span>
            </button>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-family-semibold text-white tracking-tight !m-0 leading-tight">
              Book a <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Service</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-family-regular !m-0 mt-1.5 max-w-2xl">
              Complete your reservation with certified specialists across St. Kitts & Nevis
            </p>
          </div>
        </div>
      </section>

      {/* Main Form Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-12 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-4">
          {/* LEFT CONTENT COLUMN */}
          <div className="lg:col-span-7 space-y-3">
            {step === 1 ? (
              <form onSubmit={handleSubmit(handleProceedToPayment)} className="space-y-3">
                {/* 1. Date & Time Selection Card */}
                <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="w-6 h-6 rounded-md bg-sky-50 text-[#004a70] flex items-center justify-center shrink-0">
                      <FaCalendarAlt size={12} />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-family-semibold text-slate-900 !m-0">Select Date & Time</h3>
                      <p className="text-[10.5px] text-slate-400 font-family-regular !m-0">
                        Choose your preferred service schedule
                      </p>
                    </div>
                  </div>

                  {/* Calendar Date Picker */}
                  <Controller
                    name="selectedDate"
                    control={control}
                    render={({ field }) => (
                      <AuthTextField
                        id="service-date-field"
                        label="Service Date *"
                        type="date"
                        min={moment().format("YYYY-MM-DD")}
                        error={errors.selectedDate?.message}
                        value={field.value || selectedCalendarDate}
                        onChange={(e) => {
                          field.onChange(e);
                          handleDateChange(e);
                        }}
                      />
                    )}
                  />

                  {/* Duplicate Booking Warning */}
                  {existingBookingForDate && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-family-medium">
                      ⚠️ You already have an active reservation for this service on {selectedCalendarDate}.
                    </div>
                  )}

                  {/* Available Weekdays */}
                  {scheduleDays.length > 0 && (
                    <div>
                      <label className="text-[11px] font-family-semibold text-slate-700 block mb-1">
                        Available Weekdays
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {scheduleDays.map((row) => {
                          const isActive = selectedDay === row.day;
                          return (
                            <button
                              key={row.day}
                              type="button"
                              onClick={() => {
                                setSelectedDay(row.day);
                                const nextDate = moment().day(row.day);
                                if (nextDate.isBefore(moment(), "day")) {
                                  nextDate.add(7, "days");
                                }
                                const dateStr = nextDate.format("YYYY-MM-DD");
                                setSelectedCalendarDate(dateStr);
                                setValue("selectedDate", dateStr, { shouldValidate: true });
                                if (row.slots?.length > 0) {
                                  setSelectedSlot(row.slots[0]);
                                  setValue("selectedSlot", row.slots[0], { shouldValidate: true });
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-family-semibold border transition-all cursor-pointer ${
                                isActive
                                  ? "bg-[#004a70] text-white border-[#004a70] shadow-xs"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {row.day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Slot selector */}
                  <div>
                    <label className="text-[11px] font-family-semibold text-slate-700 block mb-1">
                      Available Time Slot *
                    </label>
                    {scheduleDays.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {(scheduleDays.find((r) => r.day === selectedDay)?.slots || []).map((slot) => {
                          const isSlotActive = selectedSlot === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => {
                                setSelectedSlot(slot);
                                setValue("selectedSlot", slot, { shouldValidate: true });
                              }}
                              className={`py-1.5 px-2 rounded-lg text-xs font-family-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                isSlotActive
                                  ? "bg-[#004a70] text-white border-[#004a70] shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-[#004a70] hover:bg-slate-50"
                              }`}
                            >
                              <FaClock size={10} />
                              <span>{moment(slot, ["HH:mm", "H:mm"]).isValid() ? moment(slot, ["HH:mm", "H:mm"]).format("h:mm A") : slot}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-family-regular">No slots configured.</p>
                    )}
                    {errors.selectedSlot && (
                      <p className="text-[11px] text-rose-500 font-family-medium mt-1">
                        {errors.selectedSlot.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Travelers / Group Size Card */}
                <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <FaUsers size={11} />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-family-semibold text-slate-900 !m-0">
                        {isGroup ? "Group Booking" : "Travelers / Clients"}
                      </h3>
                      <p className="text-[10.5px] text-slate-400 font-family-regular !m-0">
                        {isGroup ? "Flat group pricing" : "Select number of people for this session"}
                      </p>
                    </div>
                  </div>

                  {isGroup ? (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-family-semibold text-slate-800 block">Flat Group Rate</span>
                        <span className="text-[10.5px] text-slate-500">
                          Capacity: {service.minPersons || 1}–{service.maxPersons || 10} persons
                        </span>
                      </div>
                      <span className="text-xs font-family-semibold text-[#004a70]">
                        ${toUsd(service.price).toFixed(2)} USD
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Adults */}
                      <div className="flex items-center justify-between py-0.5">
                        <div>
                          <span className="text-xs font-family-semibold text-slate-800 block">Adults</span>
                          <span className="text-[10px] text-slate-400 font-family-medium">
                            Age 16+ (${toUsd(applyItemDiscount(agePrices.adult, service)).toFixed(2)} USD)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={adults <= 1}
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center cursor-pointer border-none"
                          >
                            <FaMinus size={9} />
                          </button>
                          <span className="text-xs font-family-semibold w-5 text-center">{adults}</span>
                          <button
                            type="button"
                            disabled={adults >= 20}
                            onClick={() => setAdults(adults + 1)}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center cursor-pointer border-none"
                          >
                            <FaPlus size={9} />
                          </button>
                        </div>
                      </div>

                      {/* Kids */}
                      <div className="flex items-center justify-between py-0.5 border-t border-slate-100">
                        <div>
                          <span className="text-xs font-family-semibold text-slate-800 block">Children</span>
                          <span className="text-[10px] text-slate-400 font-family-medium">
                            Age 1–15 (${toUsd(applyItemDiscount(agePrices.kid, service)).toFixed(2)} USD)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={kids <= 0}
                            onClick={() => setKids(Math.max(0, kids - 1))}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center cursor-pointer border-none"
                          >
                            <FaMinus size={9} />
                          </button>
                          <span className="text-xs font-family-semibold w-5 text-center">{kids}</span>
                          <button
                            type="button"
                            disabled={kids >= 20}
                            onClick={() => setKids(kids + 1)}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center cursor-pointer border-none"
                          >
                            <FaPlus size={9} />
                          </button>
                        </div>
                      </div>

                      {/* Infants */}
                      <div className="flex items-center justify-between py-0.5 border-t border-slate-100">
                        <div>
                          <span className="text-xs font-family-semibold text-slate-800 block">Infants</span>
                          <span className="text-[10px] text-slate-400 font-family-medium">
                            Under 2 (${toUsd(applyItemDiscount(agePrices.infant, service)).toFixed(2)} USD)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={infants <= 0}
                            onClick={() => setInfants(Math.max(0, infants - 1))}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center cursor-pointer border-none"
                          >
                            <FaMinus size={9} />
                          </button>
                          <span className="text-xs font-family-semibold w-5 text-center">{infants}</span>
                          <button
                            type="button"
                            disabled={infants >= 10}
                            onClick={() => setInfants(infants + 1)}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center cursor-pointer border-none"
                          >
                            <FaPlus size={9} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Location Card */}
                <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                      <FaLocationDot size={11} />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-family-semibold text-slate-900 !m-0">
                        {atLocation ? "Where Should We Come?" : "Meeting Location"}
                      </h3>
                      <p className="text-[10.5px] text-slate-400 font-family-regular !m-0">
                        {atLocation
                          ? "Enter your hotel, villa, or residence address"
                          : "Fixed designated location"}
                      </p>
                    </div>
                  </div>

                  {atLocation ? (
                    <div className="relative">
                      <AuthTextField
                        id="service-address-field"
                        label="Service Address *"
                        placeholder="Enter your hotel, villa, or residence address..."
                        value={serviceAddress}
                        onChange={(e) => handleAddressSearch(e.target.value)}
                        error={errors.serviceAddress?.message}
                        rightAdornment={
                          geoLoading ? (
                            <AuthSpinner className="!w-4 !h-4 !border-slate-300 !border-t-[#004a70]" />
                          ) : (
                            <button
                              type="button"
                              onClick={handleLocateUser}
                              title="Locate Me (Use Current Location)"
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-[#004a70] transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                            >
                              <FaLocationCrosshairs size={16} />
                            </button>
                          )
                        }
                      />

                      {/* Autocomplete Predictions dropdown */}
                      {addressPredictions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-30 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mt-1 max-h-48 overflow-y-auto">
                          {addressPredictions.map((pred) => (
                            <button
                              key={pred.place_id}
                              type="button"
                              onClick={() => handleSelectPrediction(pred)}
                              className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-none flex items-center gap-2 cursor-pointer bg-white"
                            >
                              <FaLocationDot size={11} className="text-[#004a70] shrink-0" />
                              <span className="truncate text-slate-700">{pred.description}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-family-medium">
                      📍 {service.meetingPoint?.address || service.address || "Meeting point in St. Kitts"}
                    </div>
                  )}
                </div>

                {/* 4. Notes / Instructions */}
                <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs space-y-1.5">
                  <label className="inline-block w-fit text-[13px] font-family-semibold text-slate-700 select-none pl-0.5 cursor-pointer">
                    Special Instructions / Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Any specific requests, allergies, room numbers, or directions..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="input-field !h-auto resize-none"
                  />
                </div>

                {/* Submit Step 1 Button */}
                <button
                  type="submit"
                  disabled={Boolean(existingBookingForDate)}
                  className="w-full py-2.5 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white text-xs font-family-semibold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50 active:scale-[0.98]"
                >
                  <span>Continue to Payment</span>
                </button>
              </form>
            ) : step === 2 ? (
              /* Step 2: Payment Method Selection */
              <div className="space-y-3">
                <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-family-semibold text-slate-900 !m-0">Choose Payment Method</h3>
                      <p className="text-[10.5px] text-slate-400 font-family-regular !m-0">
                        Funds are held until confirmed by provider
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-family-semibold text-[#004a70] hover:underline cursor-pointer bg-transparent border-none"
                    >
                      Edit Booking
                    </button>
                  </div>

                  {/* Payment Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Wallet */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("wallet")}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        paymentMethod === "wallet"
                          ? "bg-sky-50/70 border-[#004a70] shadow-xs"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-md bg-sky-100 text-[#004a70] flex items-center justify-center shrink-0">
                        <BsCashCoin size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-family-semibold text-slate-900 block">CabKn Wallet</span>
                        <span className="text-[10.5px] text-slate-500 block mt-0.5">
                          Balance: ${(Number(userData?.user?.amount ?? userData?.amount ?? 0)).toFixed(2)} XCD
                        </span>
                      </div>
                    </button>

                    {/* Credit / Debit Card (JAD Cash) */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("jad")}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        paymentMethod === "jad"
                          ? "bg-sky-50/70 border-[#004a70] shadow-xs"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <BsCreditCard2Back size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-family-semibold text-slate-900 block">Credit / Debit Card</span>
                        <span className="text-[10.5px] text-slate-500 block mt-0.5">
                          Visa, Mastercard, JAD Cash
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* If JAD Cash Card is selected: show Card Details Form */}
                  {paymentMethod === "jad" && (
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      {/* Live 3D Card Preview */}
                      <Cards
                        number={cardDetails.number}
                        name={cardDetails.name}
                        expiry={cardDetails.expiry}
                        cvc={cardDetails.cvc}
                        focused=""
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="sm:col-span-2">
                          <AuthTextField
                            id="card-name"
                            label="Cardholder Name *"
                            placeholder="Full Name on Card"
                            value={cardDetails.name}
                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <AuthTextField
                            id="card-number"
                            label="Card Number *"
                            maxLength={19}
                            placeholder="0000 0000 0000 0000"
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          />
                        </div>

                        <div>
                          <AuthTextField
                            id="card-expiry"
                            label="Expiry (MM/YY) *"
                            maxLength={5}
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          />
                        </div>

                        <div>
                          <AuthTextField
                            id="card-cvc"
                            label="CVC / CVV *"
                            type="password"
                            maxLength={4}
                            placeholder="123"
                            value={cardDetails.cvc}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action CTA */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={bookingLoading}
                      onClick={() => {
                        if (paymentMethod === "wallet") {
                          handleFinalBooking("wallet", "");
                        } else {
                          handleJadCardCheckout();
                        }
                      }}
                      className="w-full py-3.5 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white text-xs font-family-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50 active:scale-[0.98]"
                    >
                      {bookingLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Processing Booking...</span>
                        </>
                      ) : (
                        <span>Confirm & Pay ${totalPayableUSD.toFixed(2)} USD</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Step 3: Success Confirmation View (Matching Mobile ServiceBookingDetail.js) */
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <FiCheckCircle size={32} />
                </div>

                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-xs font-family-semibold uppercase tracking-wider bg-amber-100 text-amber-800">
                    Status: Pending Confirmation
                  </span>
                  <h2 className="text-xl sm:text-2xl font-family-semibold text-slate-900 !m-0 pt-2">
                    Booking Request Placed!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-family-regular max-w-md mx-auto">
                    Your request for {service.title} has been received. Payment is safely held until the admin/provider confirms.
                  </p>
                </div>

                {/* Summary Details Card */}
                <div className="text-left bg-slate-50 rounded-xl p-4 border border-slate-200/70 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Service</span>
                    <span className="font-family-semibold text-slate-900">{service.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Date & Time</span>
                    <span className="font-family-semibold text-slate-800">
                      {moment(selectedCalendarDate).format("ddd, DD MMM YYYY")} • {selectedSlot}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Clients / Guests</span>
                    <span className="font-family-semibold text-slate-800">
                      {isGroup ? "Group" : `${adults} adult${adults > 1 ? "s" : ""}${kids > 0 ? `, ${kids} children` : ""}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Location</span>
                    <span className="font-family-semibold text-slate-800 truncate max-w-[200px]">
                      {atLocation ? serviceAddress : service.meetingPoint?.address || "St. Kitts"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-500 font-family-semibold">Total Paid</span>
                    <span className="font-family-semibold text-base text-[#004a70]">
                      ${totalPayableUSD.toFixed(2)} USD (${totalPayableXCD} XCD)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <Link
                    href="/"
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-family-semibold no-underline transition-all"
                  >
                    Back to Home
                  </Link>
                  <Link
                    href="/services"
                    className="px-5 py-2.5 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white text-xs font-family-semibold no-underline transition-all shadow-xs"
                  >
                    Explore More Services
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE SUMMARY COCKPIT */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-3">
              <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-sm space-y-3">
                {/* Service Snapshot Card */}
                <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                    <img
                      src={
                        service?.images?.[0] ||
                        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400"
                      }
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-family-semibold uppercase tracking-wider text-[#004a70] block">
                      {service.category?.name || (isGroup ? "Group Service" : "Service")}
                    </span>
                    <h4 className="text-xs sm:text-sm font-family-semibold text-slate-900 leading-snug !m-0 line-clamp-2 mt-0.5">
                      {service.title}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-family-medium block mt-1">
                      ⏱ {service.durationHours || 1} hr session
                    </span>
                  </div>
                </div>

                {/* Coupon Input with Auth Styling */}
                <div className="space-y-1.5">
                  <label className="inline-block w-fit text-[12px] font-family-semibold text-slate-700 select-none pl-0.5">
                    Apply Promo / Coupon
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="input-field"
                    />
                    <button
                      type="button"
                      disabled={couponLoading || !couponCode.trim()}
                      onClick={handleApplyCoupon}
                      className="px-4 py-2.5 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white text-xs font-family-semibold disabled:opacity-50 cursor-pointer border-none shrink-0 min-w-[76px] flex items-center justify-center transition-all shadow-xs"
                    >
                      {couponLoading ? (
                        <AuthSpinner className="!w-3.5 !h-3.5" />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-rose-500 font-family-medium mt-0.5 pl-1">{couponError}</p>}
                  {couponData && (
                    <p className="text-[11px] text-emerald-600 font-family-semibold mt-0.5 pl-1">
                      ✓ {couponData.code} applied ({couponData.discount}% off)
                    </p>
                  )}
                </div>

                {/* Calculations Summary Breakdown (Exact Parity with Mobile App) */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11.5px] text-slate-600 font-family-medium">
                  {/* Fare */}
                  <div className="flex items-center justify-between">
                    <span>Base Fare ({isGroup ? "Group" : `${totalGuests} guest${totalGuests > 1 ? "s" : ""}`})</span>
                    <span className="font-family-semibold text-slate-800">${rawSubtotalUSD.toFixed(2)} USD</span>
                  </div>

                  {/* Catalog Discount */}
                  {getItemDiscountPercent(service) > 0 && (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Catalog Discount ({getItemDiscountPercent(service)}%)</span>
                      <span>
                        -${toUsd((rawSubtotalXCD * getItemDiscountPercent(service)) / 100).toFixed(2)} USD
                      </span>
                    </div>
                  )}

                  {/* Coupon Discount */}
                  {couponDiscountUSD > 0 && (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Coupon Discount</span>
                      <span>-${couponDiscountUSD.toFixed(2)} USD</span>
                    </div>
                  )}

                  {/* Special User Discount */}
                  {specialDiscount.percent > 0 && (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Special Discount ({specialDiscount.percent}%)</span>
                      <span>-${toUsd(specialDiscount.amount).toFixed(2)} USD</span>
                    </div>
                  )}

                  {/* Service Fee (20%) */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>Service fee (20%)</span>
                    </span>
                    <span className="font-family-semibold text-slate-800">${serviceFeeUSD.toFixed(2)} USD</span>
                  </div>

                  {/* Convenience Fee (Flat 3.00 XCD) */}
                  <div className="flex items-center justify-between">
                    <span>Convenience fee</span>
                    <span className="font-family-semibold text-slate-800">${convenienceFeeUSD.toFixed(2)} USD</span>
                  </div>

                  {/* Total Payable */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-family-semibold text-slate-900">
                    <span>Total</span>
                    <span className="text-[#004a70] text-base">${totalPayableUSD.toFixed(2)} USD</span>
                  </div>

                  <div className="text-right text-[10.5px] text-slate-400 font-family-regular">
                    Approx. ${totalPayableXCD} XCD • Local Currency
                  </div>
                </div>

                {/* Booking Notice */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-0.5 text-[10.5px] text-slate-500 font-family-medium">
                  <div className="flex items-center gap-1.5 text-slate-700 font-family-semibold">
                    <FaShieldHalved size={11} className="text-[#004a70]" />
                    <span>Free Cancellation & Customer Support</span>
                  </div>
                  <p className="!m-0 leading-relaxed text-[10px]">
                    Provider confirmation required. If the session cannot be fulfilled, your payment is 100% refunded immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookServicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#004a70]" />
        </div>
      }
    >
      <BookServiceComponent />
    </Suspense>
  );
}
