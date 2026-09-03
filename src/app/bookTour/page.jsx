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
import { MdOutlineLocalOffer, MdPayment } from "react-icons/md";
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

function BookTourComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tourId = searchParams.get("id");
  const encodedData = searchParams.get("data");

  const { getData, postData, header1, header3,userData } = ApiFunction();
  // console.log("userData", userData);
  const dispatch = useDispatch();
  const paymentCards = useSelector((state) => state.auth?.paymentCards);

  const [mounted, setMounted] = useState(false);
  const [tour, setTour] = useState(null);
  const [loadingTour, setLoadingTour] = useState(true);

  // Guest counters (for individual pricing)
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [infants, setInfants] = useState(0);

  // Date & Time selections
  const [selectedCalendarDate, setSelectedCalendarDate] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  // Pickup & Dropoff
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [sameAsPickup, setSameAsPickup] = useState(false);
  const [geoDropoffLoading, setGeoDropoffLoading] = useState(false);

  // Predictions states
  const [pickupPredictions, setPickupPredictions] = useState([]);
  const [dropoffPredictions, setDropoffPredictions] = useState([]);
  const [pickupPredictLoading, setPickupPredictLoading] = useState(false);
  const [dropoffPredictLoading, setDropoffPredictLoading] = useState(false);

  // Sync same as pickup address when checked
  useEffect(() => {
    if (sameAsPickup) {
      setDropoffAddress(pickupAddress);
      setValue("dropoffAddress", pickupAddress, { shouldValidate: true });
      setDropoffPredictions([]);
    }
  }, [sameAsPickup, pickupAddress]);

  // Google Places search for Pickup
  const handlePickupSearch = async (text) => {
    setPickupAddress(text);
    setValue("pickupAddress", text, { shouldValidate: true });
    if (!text.trim() || text.length < 2) {
      setPickupPredictions([]);
      return;
    }
    setPickupPredictLoading(true);
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
            setPickupPredictions(preds);
          } else {
            setPickupPredictions([]);
          }
          setPickupPredictLoading(false);
        }
      );
    } catch (err) {
      setPickupPredictions([]);
      setPickupPredictLoading(false);
    }
  };

  // Google Places search for Dropoff
  const handleDropoffSearch = async (text) => {
    setDropoffAddress(text);
    setValue("dropoffAddress", text, { shouldValidate: true });
    if (!text.trim() || text.length < 2) {
      setDropoffPredictions([]);
      return;
    }
    setDropoffPredictLoading(true);
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
            setDropoffPredictions(preds);
          } else {
            setDropoffPredictions([]);
          }
          setDropoffPredictLoading(false);
        }
      );
    } catch (err) {
      setDropoffPredictions([]);
      setDropoffPredictLoading(false);
    }
  };

  // Note & Coupon
  const [note, setNote] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Step state: 1 = Schedule & Guests, 2 = Review & Payment, 3 = Success
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

  const isGroupTour = useMemo(() => {
    const type = String(tour?.bookingType || tour?.priceType || "").toLowerCase();
    return type === "group" || type === "per_group";
  }, [tour]);

  const isPickupTour = useMemo(() => {
    return tour?.locationType === "pickup_dropoff" || tour?.locationType === "pickup";
  }, [tour]);

  // React Hook Form + Yup validation schema
  const tourSchema = useMemo(() => {
    return Yup.object().shape({
      selectedDate: Yup.string().required("Tour date is required"),
      selectedSlot: Yup.string().required("Time slot is required"),
      pickupAddress: isPickupTour
        ? Yup.string().required("Pickup address is required")
        : Yup.string().optional(),
      dropoffAddress: Yup.string().optional(),
      cardName: paymentMethod === "jad" ? Yup.string().required("Cardholder name is required") : Yup.string().optional(),
      cardNumber: paymentMethod === "jad" ? Yup.string().required("Card number is required") : Yup.string().optional(),
      cardExpiry: paymentMethod === "jad" ? Yup.string().required("Expiry date is required") : Yup.string().optional(),
      cardCvc: paymentMethod === "jad" ? Yup.string().required("CVC is required") : Yup.string().optional(),
    });
  }, [isPickupTour, paymentMethod]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
  
    formState: { errors },
  } = useForm({
    resolver: yupResolver(tourSchema),
    defaultValues: {
      selectedDate: "",
      selectedSlot: "",
      pickupAddress: "",
      dropoffAddress: "",
      cardName: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
    },
  });


  const [geoLoading, setGeoLoading] = useState(false);

  // Sync date & slot with react-hook-form
  useEffect(() => {
    if (selectedCalendarDate) setValue("selectedDate", selectedCalendarDate, { shouldValidate: true });
    if (selectedSlot) setValue("selectedSlot", selectedSlot, { shouldValidate: true });
    if (pickupAddress) setValue("pickupAddress", pickupAddress, { shouldValidate: true });
  }, [selectedCalendarDate, selectedSlot, pickupAddress]);

  const handleLocateUser = async () => {
    if (!navigator.geolocation) {
      message.error("Geolocation is not supported by your browser");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setPickupAddress(addr);
          setValue("pickupAddress", addr, { shouldValidate: true });
          if (sameAsPickup) {
            setDropoffAddress(addr);
            setValue("dropoffAddress", addr, { shouldValidate: true });
          }
          message.success("Current location set for pickup!");
        } catch (e) {
          const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setPickupAddress(fallback);
          setValue("pickupAddress", fallback, { shouldValidate: true });
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        message.error("Unable to retrieve location");
        setGeoLoading(false);
      }
    );
  };

  const handleLocateDropoffUser = async () => {
    if (!navigator.geolocation) {
      message.error("Geolocation is not supported by your browser");
      return;
    }
    setGeoDropoffLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setDropoffAddress(addr);
          setValue("dropoffAddress", addr, { shouldValidate: true });
          message.success("Current location set for dropoff!");
        } catch (e) {
          const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setDropoffAddress(fallback);
          setValue("dropoffAddress", fallback, { shouldValidate: true });
        } finally {
          setGeoDropoffLoading(false);
        }
      },
      (err) => {
        message.error("Unable to retrieve location");
        setGeoDropoffLoading(false);
      }
    );
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Fetch tour details or load from state/param
  useEffect(() => {
    let initialTour = null;

    if (encodedData) {
      try {
        initialTour = JSON.parse(decodeURIComponent(encodedData));
      } catch (e) {}
    }

    if (!initialTour && tourId && typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(`tour_${tourId}`) || sessionStorage.getItem("selected_tour");
        if (stored) initialTour = JSON.parse(stored);
      } catch (e) {}
    }

    if (initialTour) {
      setTour(initialTour);
      setLoadingTour(false);
    } else if (tourId) {
      fetchTourDetail(tourId);
    } else {
      setLoadingTour(false);
    }
  }, [tourId, encodedData]);

  const fetchTourDetail = async (id) => {
    setLoadingTour(true);
    try {
      let res = await getData(`websubcat/details/${id}`, header3);
      if (!res?.category) {
        res = await getData(`servicesubcat/details/${id}`, header3);
      }
      if (res?.category) {
        setTour(res.category);
      }
    } catch (e) {
      console.error("Tour detail fetch error:", e);
    } finally {
      setLoadingTour(false);
    }
  };

  // 2. Setup default schedule day and slot when tour is loaded
  const scheduleDays = useMemo(() => {
    return (tour?.schedule || []).filter((row) => row?.day && row?.slots?.length);
  }, [tour]);

  useEffect(() => {
    if (scheduleDays.length > 0 && !selectedDay) {
      const first = scheduleDays[0];
      setSelectedDay(first.day);
      setSelectedSlot(first.slots[0] || "");
      // Default to next available date for this weekday
      const nextDate = moment().day(first.day);
      if (nextDate.isBefore(moment(), "day")) {
        nextDate.add(7, "days");
      }
      setSelectedCalendarDate(nextDate.format("YYYY-MM-DD"));
    }
  }, [scheduleDays]);



  // Pricing helper calculations (All database prices are in XCD, converted to USD via 2.7)
  const getItemDiscountPercent = (item) => {
    const n = Number(item?.discountPercent ?? item?.discount);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.min(n, 100);
  };

  const applyItemDiscount = (amount, item) => {
    const base = Number((Number(amount) || 0).toFixed(2));
    const percent = getItemDiscountPercent(item);
    if (percent <= 0 || !(base > 0)) return base;
    return Number((base * (1 - percent / 100)).toFixed(2));
  };

  const agePrices = useMemo(() => {
    const adultFallback = Number(tour?.price || 0);
    const ages = tour?.agePrices || {};
    return {
      infant: Number(ages.infant ?? 0),
      kid: Number(ages.kid ?? 0),
      adult: Number(ages.adult ?? adultFallback),
    };
  }, [tour]);

  const rawSubtotalXCD = useMemo(() => {
    if (isGroupTour) return Number(tour?.price || 0);
    return adults * agePrices.adult + kids * agePrices.kid + infants * agePrices.infant;
  }, [isGroupTour, tour, adults, kids, infants, agePrices]);

  // Catalog item discount in XCD (e.g. 5% off)
  const catalogDiscountedXCD = useMemo(() => {
    return applyItemDiscount(rawSubtotalXCD, tour);
  }, [rawSubtotalXCD, tour]);

  // Apply Coupon Discount if valid (applied on catalog-discounted fare)
  const couponDiscountXCD = useMemo(() => {
    if (!couponData?.discount) return 0;
    const pct = Number(couponData.discount || 0);
    return (catalogDiscountedXCD * pct) / 100;
  }, [catalogDiscountedXCD, couponData]);

  const finalSubtotalXCD = Math.max(0, catalogDiscountedXCD - couponDiscountXCD);
  const convenienceFeeXCD = 3.0; // 3.00 XCD fixed convenience fee
  const totalPayableXCD = (finalSubtotalXCD + convenienceFeeXCD).toFixed(2);

  // In USD
  const rawSubtotalUSD = Number((rawSubtotalXCD / XCD_PER_USD).toFixed(2));
  const finalSubtotalUSD = Number((finalSubtotalXCD / XCD_PER_USD).toFixed(2));
  const convenienceFeeUSD = Number((convenienceFeeXCD / XCD_PER_USD).toFixed(2));
  const totalPayableUSD = Number((Number(totalPayableXCD) / XCD_PER_USD).toFixed(2));
  const couponDiscountUSD = Number((couponDiscountXCD / XCD_PER_USD).toFixed(2));

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
      message.warning(`This tour is only available on: ${scheduleDays.map((d) => d.day).join(", ")}`);
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
      message.error("Please select a valid tour date");
      return;
    }
    if (!selectedSlot) {
      message.error("Please select a time slot");
      return;
    }
    if (!isGroupTour && adults < 1) {
      message.error("Please select at least 1 adult guest");
      return;
    }
    if (isPickupTour && !pickupAddress.trim()) {
      message.error("Please enter your pickup location");
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

  // Submit Booking API (`tour-bookings/create`)
  const handleFinalBooking = async (paymentTypeVal = "wallet", paymentIdVal = "") => {
    // 1. Wallet Balance Check
    if (paymentTypeVal === "wallet") {
      const userWalletBalance = Number(userData?.user?.amount ?? userData?.amount ?? 0);
      const totalAmountXCD = Number(totalPayableXCD);
      if (userWalletBalance < totalAmountXCD) {
        message.error(
          `Insufficient wallet balance! Your balance is $${userWalletBalance.toFixed(2)} XCD, but total payable is $${totalAmountXCD.toFixed(2)} XCD.`
        );
        return;
      }
    }

    setBookingLoading(true);
    try {
      const totalGuestsCount = isGroupTour ? 1 : adults + kids + infants;
      const unitPrice = isGroupTour ? Number(tour?.price || 0) : agePrices.adult;

      const payload = {
        tourId: tour?._id,
        bookingType: isGroupTour ? "group" : "individual",
        locationType: tour?.locationType || "meeting_point",
        date: selectedCalendarDate,
        time: selectedSlot,
        day: selectedDay,
        ...(isGroupTour
          ? { partySize: 1 }
          : { guests: { adults, kids, infants } }),
        ...(isPickupTour
          ? {
              pickup: { address: pickupAddress, lat: null, lng: null },
              dropoff: { address: dropoffAddress || pickupAddress, lat: null, lng: null },
            }
          : {}),
        totalGuests: totalGuestsCount,
        unitPrice: unitPrice,
        totalPrice: Number(finalSubtotalXCD),
        price: Number(finalSubtotalXCD),
        convenienceFee: 3.0,
        serviceFee: 0,
        paymentType: paymentTypeVal,
        paymentId: paymentIdVal,
        couponId: couponData?._id || "",
        notes: note || "",
        currency: "XCD",
        chargeOnCreate: true,
        tourSnapshot: {
          title: tour?.title || "",
          durationHours: tour?.durationHours || 0,
          locationType: tour?.locationType || "meeting_point",
          minPersons: tour?.minPersons || 1,
          maxPersons: tour?.maxPersons || 1,
          image: tour?.images?.[0] || "",
        },
      };

      const res = await postData("tour-bookings/create", payload, header1);

      if (res?.success || res?.booking) {
        setBookedDetails(res?.booking || payload);
        message.success(res?.message || "Tour booked successfully!");
        setStep(3);
      } else {
        message.error(res?.message || "Failed to create tour booking.");
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
        address: "",
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

  if (loadingTour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-[#004a70]" />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h2 className="text-lg font-family-semibold text-slate-800">Tour Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">The selected tour could not be loaded.</p>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-[#004a70] text-white text-xs font-family-semibold">
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#f8fafc] font-poppins text-slate-800 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      {/* Header Banner matching PopularPlaces luxury navy header */}
      <section className="relative bg-gradient-to-br from-[#001726] via-[#002f4a] to-[#001f33] pt-24 sm:pt-28 pb-14 sm:pb-16 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "24px 24px" }} />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 space-y-3">
          {/* Breadcrumb Navigation & Top Right Back Button */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm font-family-medium">
              <Link href="/" className="hover:text-white transition-colors no-underline text-slate-300">
                Home
              </Link>
              <span>/</span>
              <Link href="/tours" className="hover:text-white transition-colors no-underline text-slate-300">
                Top Tours
              </Link>
              <span>/</span>
              <Link href={`/tourDetails/${tour._id}`} className="hover:text-white transition-colors no-underline text-slate-300 truncate max-w-[200px] sm:max-w-xs">
                {tour.title}
              </Link>
              <span>/</span>
              <span className="text-white font-family-semibold">Book Tour</span>
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

          {/* Tour Category Badge & Title matching Popular Places */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-md text-[11px] font-family-semibold uppercase tracking-wider bg-amber-500 text-slate-950 font-bold shadow-xs">
                {isGroupTour ? "GROUP TOUR" : "INDIVIDUAL TOUR"}
              </span>
              {tour.category?.name && (
                <span className="px-3 py-1 rounded-md text-[11px] font-family-semibold text-white/90 bg-white/10 border border-white/15">
                  {tour.category.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-family-semibold text-white tracking-tight !m-0 leading-tight">
              {tour.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-family-regular !m-0 max-w-2xl">
              Complete your reservation for {tour.title}
            </p>
          </div>
        </div>
      </section>

      {/* Main Form Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-16 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">

          {/* LEFT CONTENT COLUMN */}
          <div className="lg:col-span-7 space-y-4">

            {step === 1 ? (
              <form onSubmit={handleSubmit(handleProceedToPayment)} className="space-y-4">
                {/* 1. Date & Time Selection Card */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-sky-50 text-[#004a70] flex items-center justify-center shrink-0">
                      <FaCalendarAlt size={13} />
                    </div>
                    <div>
                      <h3 className="text-sm font-family-semibold text-slate-900 !m-0">Select Date & Time</h3>
                      <p className="text-[11px] text-slate-400 font-family-regular !m-0">Choose your preferred tour schedule</p>
                    </div>
                  </div>

                  {/* Calendar Date Picker with Controller & AuthTextField */}
                  <Controller
                    name="selectedDate"
                    control={control}
                    render={({ field }) => (
                      <AuthTextField
                        id="tour-date-field"
                        label="Tour Date *"
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

                  {/* Slot selector */}
                  <div>
                    <label className="text-[13px] font-family-semibold text-slate-700 block mb-1">
                      Available Time Slot *
                    </label>
                    {scheduleDays.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                              className={`py-2 px-2.5 rounded-xl text-xs font-family-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                isSlotActive
                                  ? "bg-[#004a70] text-white border-[#004a70] shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-[#004a70] hover:bg-slate-50"
                              }`}
                            >
                              <FaClock size={11} className={isSlotActive ? "text-sky-300" : "text-slate-400"} />
                              <span>{slot}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-2.5 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-900 font-family-medium">
                        Daily Slots: 09:00 AM, 01:00 PM, 03:30 PM
                      </div>
                    )}
                    {errors.selectedSlot?.message && (
                      <p className="text-[11px] text-rose-500 font-family-medium mt-1 pl-0.5">
                        {errors.selectedSlot?.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Guest Quantities */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-sky-50 text-[#004a70] flex items-center justify-center shrink-0">
                      <FaUsers size={13} />
                    </div>
                    <div>
                      <h3 className="text-sm font-family-semibold text-slate-900 !m-0">Guest Details</h3>
                      <p className="text-[11px] text-slate-400 font-family-regular !m-0">
                        {isGroupTour ? "Flat rate per group" : "Select number of participants"}
                      </p>
                    </div>
                  </div>

                  {!isGroupTour ? (
                    <div className="space-y-3">
                      {/* Adults */}
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <div>
                          <span className="text-xs font-family-semibold text-slate-800 block">Adults</span>
                          <span className="text-[11px] text-slate-400">Age 16+ (${(agePrices.adult / XCD_PER_USD).toFixed(2)} USD)</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer transition-colors"
                          >
                            <FaMinus size={10} />
                          </button>
                          <span className="text-xs font-family-semibold w-4 text-center">{adults}</span>
                          <button
                            type="button"
                            onClick={() => setAdults(adults + 1)}
                            className="w-7 h-7 rounded-lg bg-[#004a70] text-white flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <div>
                          <span className="text-xs font-family-semibold text-slate-800 block">Children</span>
                          <span className="text-[11px] text-slate-400">Age 3-15 (${(agePrices.kid / XCD_PER_USD).toFixed(2)} USD)</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setKids(Math.max(0, kids - 1))}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer transition-colors"
                          >
                            <FaMinus size={10} />
                          </button>
                          <span className="text-xs font-family-semibold w-4 text-center">{kids}</span>
                          <button
                            type="button"
                            onClick={() => setKids(kids + 1)}
                            className="w-7 h-7 rounded-lg bg-[#004a70] text-white flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>
                      </div>

                      {/* Infants */}
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <span className="text-xs font-family-semibold text-slate-800 block">Infants</span>
                          <span className="text-[11px] text-slate-400">Under age 3 (${(agePrices.infant / XCD_PER_USD).toFixed(2)} USD)</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setInfants(Math.max(0, infants - 1))}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer transition-colors"
                          >
                            <FaMinus size={10} />
                          </button>
                          <span className="text-xs font-family-semibold w-4 text-center">{infants}</span>
                          <button
                            type="button"
                            onClick={() => setInfants(infants + 1)}
                            className="w-7 h-7 rounded-lg bg-[#004a70] text-white flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl flex items-center gap-2 text-sky-900">
                      <FaCircleCheck className="text-[#004a70] text-base shrink-0" />
                      <p className="text-xs font-family-medium !m-0">
                        This is a <strong>Group Tour</strong>. One flat fare covers your entire party up to {tour.maxPersons || 8} guests.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Location / Pickup Details with Search & Locate Button */}
                {isPickupTour && (
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FaLocationDot size={13} />
                      </div>
                      <div>
                        <h3 className="text-sm font-family-semibold text-slate-900 !m-0">Pickup & Dropoff</h3>
                        <p className="text-[11px] text-slate-400 font-family-regular !m-0">Enter your hotel or villa address</p>
                      </div>
                    </div>

                    {/* Pickup Address */}
                    <Controller
                      name="pickupAddress"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-1 relative">
                          <label className="text-[13px] font-family-semibold text-slate-700 block select-none">
                            Pickup Address *
                          </label>
                          <div className="relative flex items-center">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                              <FaSearch className="w-3.5 h-3.5" />
                            </div>
                            <input
                              {...field}
                              type="text"
                              placeholder="Search or enter pickup location"
                              value={field.value || pickupAddress}
                              onChange={(e) => {
                                field.onChange(e);
                                handlePickupSearch(e.target.value);
                              }}
                              className="input-field !pl-10 !pr-11"
                            />
                            {/* Locate Me button inside input */}
                            <div className="absolute right-2.5 flex items-center gap-1 z-10">
                              {geoLoading || pickupPredictLoading ? (
                                <AuthSpinner className="!text-[#004a70] !border-slate-300 !border-t-[#004a70]" />
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleLocateUser}
                                  title="Use Current Location"
                                  className="p-1 rounded-lg hover:bg-slate-100 text-[#004a70] transition-colors cursor-pointer"
                                >
                                  <FaLocationCrosshairs size={15} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Pickup Predictions Dropdown */}
                          {pickupPredictions.length > 0 && (
                            <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200/90 max-h-52 overflow-y-auto p-1.5 space-y-0.5">
                              {pickupPredictions.map((pred) => (
                                <div
                                  key={pred.place_id}
                                  onClick={() => {
                                    const text = pred.description;
                                    setPickupAddress(text);
                                    setValue("pickupAddress", text, { shouldValidate: true });
                                    setPickupPredictions([]);
                                    if (sameAsPickup) {
                                      setDropoffAddress(text);
                                      setValue("dropoffAddress", text, { shouldValidate: true });
                                    }
                                  }}
                                  className="px-3 py-2 text-xs font-family-medium text-slate-700 hover:bg-slate-50 hover:text-[#004a70] rounded-lg cursor-pointer transition-colors flex items-center gap-2"
                                >
                                  <FaLocationDot size={12} className="text-[#004a70] shrink-0" />
                                  <span className="truncate">{pred.description}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {errors.pickupAddress?.message && (
                            <p className="text-[11px] text-rose-500 font-family-medium mt-1 pl-1">
                              {errors.pickupAddress?.message}
                            </p>
                          )}
                        </div>
                      )}
                    />

                    {/* Same as Pickup Checkbox */}
                    <label
                      htmlFor="sameAsPickup"
                      className="!flex !items-center !gap-2.5 !py-1 !cursor-pointer !text-xs !font-family-semibold !text-slate-700 !select-none !w-fit"
                    >
                      <div className="!relative !flex !items-center !justify-center !w-5 !h-5">
                        <input
                          type="checkbox"
                          id="sameAsPickup"
                          checked={sameAsPickup}
                          onChange={(e) => setSameAsPickup(e.target.checked)}
                          className="!sr-only peer"
                        />
                        <div className="!w-5 !h-5 !rounded-lg !border-2 !border-[#004a70] peer-checked:!bg-[#004a70] !bg-white !transition-all !flex !items-center !justify-center !shadow-xs">
                          {sameAsPickup && (
                            <FaCheck size={10} className="!text-white !block !m-auto" />
                          )}
                        </div>
                      </div>
                      <span>Same as pickup location</span>
                    </label>

                    {/* Dropoff Address with Autocomplete & Locate Me button */}
                    <Controller
                      name="dropoffAddress"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-1 relative">
                          <label className="text-[13px] font-family-semibold text-slate-700 block select-none">
                            Dropoff Address (Optional)
                          </label>
                          <div className="relative flex items-center">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                              <FaSearch className="w-3.5 h-3.5" />
                            </div>
                            <input
                              {...field}
                              type="text"
                              disabled={sameAsPickup}
                              placeholder="Search or enter dropoff location"
                              value={field.value || dropoffAddress}
                              onChange={(e) => {
                                field.onChange(e);
                                handleDropoffSearch(e.target.value);
                              }}
                              className={`input-field !pl-10 !pr-11 ${
                                sameAsPickup ? "!bg-slate-100/70 !cursor-not-allowed !text-slate-500" : ""
                              }`}
                            />
                            {/* Locate Me button inside input */}
                            <div className="absolute right-2.5 flex items-center gap-1 z-10">
                              {geoDropoffLoading || dropoffPredictLoading ? (
                                <AuthSpinner className="!text-[#004a70] !border-slate-300 !border-t-[#004a70]" />
                              ) : (
                                <button
                                  type="button"
                                  disabled={sameAsPickup}
                                  onClick={handleLocateDropoffUser}
                                  title="Use Current Location for Dropoff"
                                  className="p-1 rounded-lg hover:bg-slate-100 text-[#004a70] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <FaLocationCrosshairs size={15} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Dropoff Predictions Dropdown */}
                          {dropoffPredictions.length > 0 && !sameAsPickup && (
                            <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200/90 max-h-52 overflow-y-auto p-1.5 space-y-0.5">
                              {dropoffPredictions.map((pred) => (
                                <div
                                  key={pred.place_id}
                                  onClick={() => {
                                    const text = pred.description;
                                    setDropoffAddress(text);
                                    setValue("dropoffAddress", text, { shouldValidate: true });
                                    setDropoffPredictions([]);
                                  }}
                                  className="px-3 py-2 text-xs font-family-medium text-slate-700 hover:bg-slate-50 hover:text-[#004a70] rounded-lg cursor-pointer transition-colors flex items-center gap-2"
                                >
                                  <FaLocationDot size={12} className="text-[#004a70] shrink-0" />
                                  <span className="truncate">{pred.description}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {errors.dropoffAddress?.message && (
                            <p className="text-[11px] text-rose-500 font-family-medium mt-1 pl-1">
                              {errors.dropoffAddress?.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                )}

              </form>
            ) : step === 2 ? (
              <div className="space-y-4">
                {/* STEP 2: REVIEW & PAYMENT METHOD */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <MdPayment size={15} />
                      </div>
                      <div>
                        <h3 className="text-sm font-family-semibold text-slate-900 !m-0">Select Payment Method</h3>
                        <p className="text-[11px] text-slate-400 font-family-regular !m-0">Choose how you wish to pay for this tour</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-[#004a70] font-family-semibold hover:underline cursor-pointer"
                    >
                      Edit Booking
                    </button>
                  </div>

                  {/* Payment option selector */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div
                      onClick={() => setPaymentMethod("wallet")}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-1.5 ${
                        paymentMethod === "wallet"
                          ? "border-[#004a70] bg-sky-50/50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <BsCashCoin className="text-emerald-600 text-base" />
                        {paymentMethod === "wallet" && <FaCheck className="text-[#004a70] text-xs" />}
                      </div>
                      <div>
                        <span className="text-xs font-family-semibold text-slate-900 block">CabKN Wallet</span>
                        <span className="text-[10.5px] text-slate-400 font-family-medium">
                          Balance: ${(Number(userData?.user?.amount || 0)).toFixed(2)} XCD
                        </span>
                      </div>
                    </div>

                    <div
                      onClick={() => setPaymentMethod("jad")}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-1.5 ${
                        paymentMethod === "jad"
                          ? "border-[#004a70] bg-sky-50/50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <BsCreditCard2Back className="text-[#004a70] text-base" />
                        {paymentMethod === "jad" && <FaCheck className="text-[#004a70] text-xs" />}
                      </div>
                      <div>
                        <span className="text-xs font-family-semibold text-slate-900 block">Credit / Debit Card</span>
                        <span className="text-[10.5px] text-slate-400 font-family-medium">Secure JAD Payment</span>
                      </div>
                    </div>
                  </div>

                  {/* Card form if JAD payment */}
                  {paymentMethod === "jad" && (
                    <div className="pt-2 border-t border-slate-100 space-y-3">
                      {paymentCards?.cardnumber && (
                        <div
                          onClick={() => {
                            const autofill = {
                              number: paymentCards.cardnumber || "",
                              expiry: `${paymentCards.cardexpmonth}/${paymentCards.cardexpyear}`,
                              cvc: paymentCards.cardcvv || "",
                              name: `${paymentCards.cardfirstname || ""} ${paymentCards.cardlastname || ""}`.trim(),
                            };
                            setCardDetails(autofill);
                            setValue("cardName", autofill.name);
                            setValue("cardNumber", autofill.number);
                            setValue("cardExpiry", autofill.expiry);
                            setValue("cardCvc", autofill.cvc);
                          }}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 flex items-center justify-between text-xs"
                        >
                          <span className="font-family-semibold text-slate-700">Use Saved Card (...{paymentCards.cardnumber?.slice(-4)})</span>
                          <span className="text-[#004a70] font-family-semibold">Autofill</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-2.5">
                        <Controller
                          name="cardName"
                          control={control}
                          render={({ field }) => (
                            <AuthTextField
                              id="card-name"
                              label="Cardholder Name *"
                              placeholder="Name on card"
                              error={errors.cardName?.message}
                              value={field.value || cardDetails.name}
                              onChange={(e) => {
                                field.onChange(e);
                                setCardDetails({ ...cardDetails, name: e.target.value });
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="cardNumber"
                          control={control}
                          render={({ field }) => (
                            <AuthTextField
                              id="card-number"
                              label="Card Number *"
                              placeholder="0000 0000 0000 0000"
                              maxLength={19}
                              error={errors.cardNumber?.message}
                              value={field.value || cardDetails.number}
                              onChange={(e) => {
                                field.onChange(e);
                                setCardDetails({ ...cardDetails, number: e.target.value });
                              }}
                            />
                          )}
                        />
                        <div className="grid grid-cols-2 gap-2.5">
                          <Controller
                            name="cardExpiry"
                            control={control}
                            render={({ field }) => (
                              <AuthTextField
                                id="card-expiry"
                                label="MM/YY *"
                                placeholder="MM/YY"
                                maxLength={5}
                                error={errors.cardExpiry?.message}
                                value={field.value || cardDetails.expiry}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setCardDetails({ ...cardDetails, expiry: e.target.value });
                                }}
                              />
                            )}
                          />
                          <Controller
                            name="cardCvc"
                            control={control}
                            render={({ field }) => (
                              <AuthTextField
                                id="card-cvc"
                                label="CVC *"
                                type="password"
                                placeholder="CVC"
                                maxLength={4}
                                error={errors.cardCvc?.message}
                                value={field.value || cardDetails.cvc}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setCardDetails({ ...cardDetails, cvc: e.target.value });
                                }}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* STEP 3: SUCCESS CONFIRMATION */
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                  <FiCheckCircle size={24} />
                </div>

                <div>
                  <h2 className="text-base font-family-semibold text-slate-900 !m-0">Tour Booked Successfully!</h2>
                  <p className="text-xs text-slate-500 font-family-regular !m-0 mt-0.5">
                    Your reservation for <strong>{tour.title}</strong> has been confirmed.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-left space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-family-medium">Date & Time:</span>
                    <span className="font-family-semibold text-slate-800">{selectedCalendarDate} at {selectedSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-family-medium">Total Paid:</span>
                    <span className="font-family-semibold text-emerald-600">${totalPayableUSD.toFixed(2)} USD</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <Link
                    href="/admin"
                    className="flex-1 py-2.5 rounded-xl bg-[#004a70] text-white text-xs font-family-semibold no-underline text-center"
                  >
                    View in My Bookings
                  </Link>
                  <Link
                    href="/"
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-family-semibold no-underline text-center"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE SUMMARY CARD */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5 sticky top-24">
              <div className="flex gap-3">
                <img
                  src={tour.images?.[0] || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"}
                  alt={tour.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-family-semibold uppercase tracking-wider text-[#004a70] block">
                    {tour.category?.name || "Tour"}
                  </span>
                  <h4 className="text-xs sm:text-sm font-family-semibold text-slate-900 truncate leading-snug !m-0">
                    {tour.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-family-medium truncate !m-0 mt-0.5">
                    {tour.address || "St. Kitts & Nevis"}
                  </p>
                </div>
              </div>

              {/* Booking Summary items */}
              <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-family-medium">Date:</span>
                  <span className="font-family-semibold text-slate-800">{selectedCalendarDate || "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-family-medium">Time Slot:</span>
                  <span className="font-family-semibold text-slate-800">{selectedSlot || "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-family-medium">Guests:</span>
                  <span className="font-family-semibold text-slate-800">
                    {isGroupTour ? "1 Group" : `${adults} Adult(s)${kids ? `, ${kids} Child(ren)` : ""}`}
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 pt-1.5 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tour Rate:</span>
                  <span>${rawSubtotalUSD.toFixed(2)} USD (${(rawSubtotalUSD * XCD_PER_USD).toFixed(2)} XCD)</span>
                </div>

                {couponDiscountUSD > 0 && (
                  <div className="flex justify-between text-emerald-600 font-family-medium">
                    <span>Coupon Discount:</span>
                    <span>-${couponDiscountUSD.toFixed(2)} USD</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500">
                  <span>Convenience Fee:</span>
                  <span>${convenienceFeeUSD.toFixed(2)} USD ($3.00 XCD)</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-family-semibold text-slate-900">Total Payable:</span>
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-family-semibold text-[#004a70] block leading-none">
                      ${totalPayableUSD.toFixed(2)} USD
                    </span>
                    <span className="text-[10.5px] text-slate-400 font-family-medium block mt-0.5">
                      ${totalPayableXCD} XCD
                    </span>
                  </div>
                </div>
              </div>

              {/* Security guarantee badge */}
              <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                <FaShieldHalved className="text-emerald-600 text-sm shrink-0" />
                <span className="font-family-medium text-[11px]">Instant Confirmation & Money-Back Security</span>
              </div>

              {/* Action Button inside Right Summary Card */}
              {step === 1 ? (
                <AuthPrimaryButton
                  type="button"
                  onClick={handleSubmit(handleProceedToPayment)}
                  className="!py-3 !justify-center !mt-2 !flex-nowrap !whitespace-nowrap"
                >
                  <span className="!whitespace-nowrap">Proceed to Review & Payment</span>
                  {/* <FiArrowRight size={14} className="!shrink-0" /> */}
                </AuthPrimaryButton>
              ) : step === 2 ? (
                <div className="space-y-2 !mt-2">
                  <AuthPrimaryButton
                    type="button"
                    loading={bookingLoading}
                    onClick={() => {
                      if (paymentMethod === "wallet") {
                        handleFinalBooking("wallet");
                      } else {
                        handleJadCardCheckout();
                      }
                    }}
                    className="!py-3"
                  >
                    <span>Confirm & Pay ${totalPayableUSD.toFixed(2)} USD (${totalPayableXCD} XCD)</span>
                  </AuthPrimaryButton>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-family-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FiArrowLeft size={14} />
                    <span>Back to Schedule & Guests</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function BookTourPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-[#004a70]" />
      </div>
    }>
      <BookTourComponent />
    </Suspense>
  );
}
