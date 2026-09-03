/* eslint-disable @next/next/no-img-element */

"use client";

import React, { useEffect, useState, useRef, useMemo, Suspense } from "react";
import { createPortal } from "react-dom";
import moment from "moment/moment";
import { FaEye, FaStar, FaPlus, FaUsers, FaBox, FaCar } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import {
  MdOutlineMyLocation,
  MdOutlineCalendarMonth,
  MdPayment,
  MdOutlineBookOnline,
  MdListAlt,
  MdForwardToInbox,
  MdOutlineSchedule,
  MdCheckCircleOutline,
  MdDoneAll,
  MdHighlightOff,
} from "react-icons/md";
import { IoWallet } from "react-icons/io5";
import Image from "next/image";
import Link from "next/link";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import EmptyState from "@/components/EmptyState";
import { useRouter, useSearchParams } from "next/navigation";
import { message, Rate } from "antd";
import { X } from "react-feather";
import Modal from "react-bootstrap/Modal";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "@/components/ApiFunction/SoketProvider";
import { setPaymentCards, setUser } from "@/components/Redux/Slices/AuthSlice";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

const apiKey = process.env.NEXT_PUBLIC_JAD_API_KEY;
const apiSecret = process.env.NEXT_PUBLIC_JAD_API_SECRET;
const tokenUrl = process.env.NEXT_PUBLIC_JAD_TOKEN_URL;
const paymentUrl = process.env.NEXT_PUBLIC_JAD_PAYMENT_URL;
const jadNumber = process.env.NEXT_PUBLIC_JAD_NUMBER;

// Status Badge with pulsing dot
const StatusBadge = ({ status }) => {
  const statusColorMap = {
    completed: { bg: "bg-emerald-50 text-emerald-700 !border-emerald-200/80", dot: "bg-emerald-500" },
    confirmed: { bg: "bg-sky-50 text-sky-700 !border-sky-200/80", dot: "bg-sky-500" },
    cancelled: { bg: "bg-rose-50 text-rose-700 !border-rose-200/80", dot: "bg-rose-500" },
    accepted: { bg: "bg-sky-50 text-sky-700 !border-sky-200/80", dot: "bg-sky-500" },
    pending: { bg: "bg-amber-50 text-amber-700 !border-amber-200/80", dot: "bg-amber-500" },
    upcoming: { bg: "bg-purple-50 text-purple-700 !border-purple-200/80", dot: "bg-purple-500" },
    active: { bg: "bg-teal-50 text-teal-700 !border-teal-200/80", dot: "bg-teal-500" },
    "on the way": { bg: "bg-indigo-50 text-indigo-700 !border-indigo-200/80", dot: "bg-indigo-500" },
    way: { bg: "bg-indigo-50 text-indigo-700 !border-indigo-200/80", dot: "bg-indigo-500" },
  };

  const st = statusColorMap[(status || "").toLowerCase()] || {
    bg: "bg-slate-50 text-slate-700 !border-slate-200",
    dot: "bg-slate-400",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-family-medium capitalize !border ${st.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${st.dot}`} />
      {status}
    </span>
  );
};

// Shimmer Skeleton for Bookings Cards
const BookingsGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 !mb-8">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div
        key={i}
        className="bg-white rounded-2xl p-4 sm:p-5 !border !border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4"
      >
        <div className="flex justify-between items-start">
          <div className="h-6 w-20 rounded-full bg-slate-200 animate-pulse" />
          <div className="space-y-1 text-right">
            <div className="h-6 w-16 bg-slate-200 rounded animate-pulse ml-auto" />
            <div className="h-3 w-28 bg-slate-100 rounded animate-pulse ml-auto" />
          </div>
        </div>

        <div className="space-y-2.5 bg-slate-50/70 p-3 rounded-xl !border !border-slate-100">
          <div className="h-3.5 w-3/4 bg-slate-200 rounded animate-pulse" />
          <div className="h-3.5 w-2/3 bg-slate-100 rounded animate-pulse" />
        </div>

        <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-slate-200 animate-pulse shrink-0" />
          <div className="space-y-1 flex-1">
            <div className="h-3.5 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-2.5 w-32 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <div className="h-9 flex-1 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-9 w-16 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

function Page() {
  const router = useRouter();
  const socket = useSocket();

  const searchParams = useSearchParams();

  const [lastId, setLastId] = useState(1);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");
  const [isLoading, setIsLoading] = useState(false);
  const [seeMoreLoading, setSeeMoreLoading] = useState(false);
  const { putData, postData, getData, header1, userData } = ApiFunction();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [tipAmount, setTipAmount] = useState("2");
  const paymentCards = useSelector((state) => state.auth.paymentCards);
  const userDataStore = useSelector((state) => state.auth.user?.user);
  const token = userData?.token;

  const [Loading, setLoading] = useState(false);
  const [TipOrderId, setTipOrderId] = useState("");
  const dispatch = useDispatch();
  const [loading, setloading] = useState(false);

  const [mounted, setMounted] = useState(false);
  const tabsContainerRef = useRef(null);
  const tabsRef = useRef({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const [cardDetails, setCardDetails] = useState({
    price: tipAmount || "",
    cvc: "",
    expiry: "",
    name: "",
    number: "",
    email: "",
    phone: "",
  });

  const handleTipSelection = (amount) => {
    setTipAmount(amount);
  };

  const ActivePayment = async (red_id) => {
    try {
      const body = {
        paymentId: red_id,
        amount: tipAmount,
      };
      const res = await putData("users/tip-card-payment", body, header1);
      if (res?.success) {
        const responseBody = {
          token: token,
          success: true,
          newUser: false,
          user: res?.user,
        };
        dispatch(setUser(responseBody));

        // Instantly mark the order as tipped in UI
        setOrders((prev) =>
          prev.map((ord) =>
            ord._id === TipOrderId || ord.order_id === TipOrderId
              ? { ...ord, tip: 1 }
              : ord
          )
        );

        if (socket) {
          socket.emit("tip-order-customer", { orderId: TipOrderId, amount: tipAmount }, (socketRes) => {
            setIsModalOpen(false);
            setShow(false);
            setTimeout(() => {
              setShow1(true);
            }, 300);
            message.success("Tip added successfully");
          });
        } else {
          setIsModalOpen(false);
          setShow(false);
          setTimeout(() => {
            setShow1(true);
          }, 300);
          message.success("Tip added successfully");
        }
      } else {
        message.error(res?.message || "Failed to add tip");
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to process card payment");
    }
  };

  async function getToken() {
    const url = `${tokenUrl}`;
    const params = new URLSearchParams({
      apikey: apiKey,
      secret: apiSecret,
      grant_type: "credentials",
    });

    try {
      const response = await fetch(`${url}?${params.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  const submitPayment = async (token, paydata) => {
    try {
      const postData = new URLSearchParams({
        token: token,
        paydata: JSON.stringify(paydata),
      }).toString();

      dispatch(setPaymentCards(paydata));

      const response = await axios.post(paymentUrl, postData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return response.data;
    } catch (error) {
      console.log(error);
      setloading(false);
      throw error;
    }
  };

  const jadAPiFunction = async () => {
    setloading(true);
    try {
      const tokenResponse = await getToken();
      if (tokenResponse.result !== "Success") {
        throw new Error(`Failed to obtain token: ${JSON.stringify(tokenResponse)}`);
      }

      const token = tokenResponse.data.token;
      const parsedTip = parseFloat(tipAmount) || 2;
      const finalPrice = parsedTip * 2.7;

      const dateString = cardDetails?.expiry || "";
      const [month, year] = dateString.includes("/")
        ? dateString.split("/")
        : [dateString.slice(0, 2), dateString.slice(2)];

      const cleanNumber = (cardDetails?.number || "").replace(/\D/g, "");
      const nameParts = (cardDetails?.name || "").trim().split(" ");
      const firstName = nameParts[0] || "Customer";
      const lastName = nameParts.slice(1).join(" ") || "User";

      const paydata = {
        live: "1",
        timestamp: moment(new Date()).format("YYYYMMDDHHmmss"),
        refnum: "101",
        jadnumber: jadNumber,
        amount: finalPrice?.toFixed(2),
        cardnumber: cleanNumber,
        cardexpmonth: month?.trim() || "",
        cardexpyear: year?.trim() || "",
        cardcvv: (cardDetails?.cvc || "").trim(),
        cardfirstname: firstName,
        cardlastname: lastName,
        address: "",
        city: "",
        state: "",
        postalcode: "",
        country: "",
        email: (cardDetails?.email || "").trim(),
        phone: (cardDetails?.phone || "").trim(),
      };

      const paymentResponse = await submitPayment(token, paydata);
      setloading(false);
      if (paymentResponse?.result === "Success") {
        if (paymentResponse?.refid) {
          ActivePayment(paymentResponse?.refid);
        }
      } else {
        message.error(paymentResponse?.message || "Payment failed");
        setloading(false);
      }
    } catch (error) {
      console.error("jadAPiFunction error:", error);
      message.error(error?.message || "Payment processing failed");
      setloading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [count, setCount] = useState(0);
  const [Orders, setOrders] = useState([]);
  const [CustomAmount, setCustomAmount] = useState(false);

  const handleChangeCustom = () => {
    setCustomAmount(true);
  };

  const handleTabSelect = async (key) => {
    setActiveTab(key);
    setLastId(1);
  };

  const areAllFieldsFilled = () => {
    return Object.values(cardDetails).every((value) => value?.trim() !== "");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails, [name]: value };
      return updatedDetails;
    });
  };

  const onSelectCard = (data) => {
    setCardDetails({
      cvc: "",
      expiry: data?.cardexpmonth + "/" + data?.cardexpyear,
      name: data?.name,
      number: data?.cardnumber,
      email: data?.email,
      phone: data?.phone,
    });
  };

  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedTourBooking, setSelectedTourBooking] = useState(null);
  const [selectedServiceBooking, setSelectedServiceBooking] = useState(null);
  const [selectedShopOrder, setSelectedShopOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  // Suppress Tidio chat and lock scroll when detail modals are open
  useEffect(() => {
    const isAnyModalOpen = Boolean(selectedTourBooking || selectedServiceBooking || selectedShopOrder);
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
      if (typeof window !== "undefined" && window.tidioChatApi) {
        try {
          window.tidioChatApi.hide();
        } catch (e) {}
      }
    } else {
      document.body.style.overflow = "";
      if (typeof window !== "undefined" && window.tidioChatApi) {
        try {
          window.tidioChatApi.show();
        } catch (e) {}
      }
    }
    return () => {
      document.body.style.overflow = "";
      if (typeof window !== "undefined" && window.tidioChatApi) {
        try {
          window.tidioChatApi.show();
        } catch (e) {}
      }
    };
  }, [selectedTourBooking, selectedServiceBooking, selectedShopOrder]);

  const handleClose = () => setShow(false);

  const openReviewModal = (order) => {
    setSelectedOrder(order);
    setReviewRating(5);
    setReviewText("");
    setReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewText.trim()) {
      message.warning("Please write a review");
      return;
    }
    try {
      const body = {
        to_id: selectedOrder?.to_id?._id,
        orderId: selectedOrder?._id,
        rating: reviewRating,
        review: reviewText,
      };
      const res = await postData("rating/create", body, header1);
      if (res?.success) {
        message.success("Review submitted successfully");
        setReviewModal(false);
        setReviewText("");
      } else {
        message.error(res?.message || "Failed to submit review");
      }
    } catch (error) {
      message.error("Something went wrong");
    }
  };

  const [categoryTab, setCategoryTab] = useState("rides"); // rides | tours | services | shop
  const [filterTab, setFilterTab] = useState("active"); // active | upcoming | completed | cancelled (or pending | on the way etc.)

  const handleCategoryChange = (newCat) => {
    if (newCat === categoryTab) return;
    setCategoryTab(newCat);
    setLastId(1);
    if (newCat === "shop") {
      setFilterTab("pending");
    } else if (newCat === "tours" || newCat === "services") {
      setFilterTab("all");
    } else {
      setFilterTab("active");
    }
  };

  const currentFilterTabs = useMemo(() => {
    if (categoryTab === "shop") {
      return [
        { key: "pending", label: "Pending" },
        { key: "on the way", label: "On The Way" },
        { key: "completed", label: "Completed" },
        { key: "cancelled", label: "Cancelled" },
      ];
    }
    if (categoryTab === "tours" || categoryTab === "services") {
      return [
        { key: "all", label: "All Bookings" },
        { key: "confirmed", label: "Confirmed" },
        { key: "completed", label: "Completed" },
        { key: "cancelled", label: "Cancelled" },
      ];
    }
    return [
      { key: "active", label: "Active" },
      { key: "upcoming", label: "Upcoming" },
      { key: "completed", label: "Completed" },
      { key: "cancelled", label: "Cancelled" },
    ];
  }, [categoryTab]);

  const fetchOrders = async ({ isFirstPage = false }) => {
    try {
      const pageToUse = isFirstPage ? 1 : lastId;
      let itemsList = [];
      let nextTotalPages = 1;

      if (categoryTab === "rides") {
        const status =
          filterTab === "upcoming"
            ? "accepted"
            : filterTab === "active"
            ? "accepted"
            : filterTab;

        if (filterTab === "active") {
          const [liveRes, scheduledRes] = await Promise.all([
            postData(`order/customer/${status}/${pageToUse}`, { bookingtype: "live" }, header1),
            postData(`order/customer/${status}/${pageToUse}`, { bookingtype: "schedule" }, header1),
          ]);
          const liveOrders = liveRes?.orders || liveRes?.data?.orders || [];
          const schedOrders = scheduledRes?.orders || scheduledRes?.data?.orders || [];
          const idMap = new Map();
          [...liveOrders, ...schedOrders].forEach((item) => {
            if (item?._id && !idMap.has(item._id)) {
              idMap.set(item._id, item);
            }
          });
          itemsList = Array.from(idMap.values());
          nextTotalPages = Math.max(
            liveRes?.count?.totalPage || liveRes?.data?.count?.totalPage || 1,
            scheduledRes?.count?.totalPage || scheduledRes?.data?.count?.totalPage || 1
          );
        } else if (filterTab === "upcoming") {
          const res = await postData(
            `order/customer/${status}/${pageToUse}`,
            { bookingtype: "schedule" },
            header1
          );
          itemsList = res?.orders || res?.data?.orders || [];
          nextTotalPages = res?.count?.totalPage || res?.data?.count?.totalPage || 1;
        } else {
          const res = await postData(`order/customer/${status}/${pageToUse}`, {}, header1);
          itemsList = res?.orders || res?.data?.orders || [];
          nextTotalPages = res?.count?.totalPage || res?.data?.count?.totalPage || 1;
        }
      } else if (categoryTab === "tours") {
        // Mobile parity: GET tour-bookings/mine/${page}
        const res = await getData(`tour-bookings/mine/${pageToUse}`, header1);
        const allBookings = res?.data?.bookings || res?.bookings || [];
        nextTotalPages = res?.data?.count?.totalPage || res?.count?.totalPage || 1;

        if (filterTab && filterTab !== "all") {
          itemsList = allBookings.filter(
            (b) => (b?.status || "").toLowerCase() === filterTab.toLowerCase()
          );
        } else {
          itemsList = allBookings;
        }
      } else if (categoryTab === "services") {
        // Mobile parity: GET service-bookings/mine/${page}
        const res = await getData(`service-bookings/mine/${pageToUse}`, header1);
        const allBookings = res?.data?.bookings || res?.bookings || [];
        nextTotalPages = res?.data?.count?.totalPage || res?.count?.totalPage || 1;

        if (filterTab && filterTab !== "all") {
          itemsList = allBookings.filter(
            (b) => (b?.status || "").toLowerCase() === filterTab.toLowerCase()
          );
        } else {
          itemsList = allBookings;
        }
      } else if (categoryTab === "shop") {
        // Mobile parity: GET shop-order/${status === "on the way" ? "way" : status}/${page}
        const shopStatus = filterTab === "on the way" ? "way" : filterTab || "pending";
        const res = await getData(`shop-order/${shopStatus}/${pageToUse}`, header1);
        itemsList = res?.data?.data || res?.data?.orders || res?.data || [];
        nextTotalPages = res?.data?.count?.totalPage || res?.count?.totalPage || 1;
      }

      setCount(nextTotalPages);

      if (isFirstPage) {
        setOrders(itemsList);
      } else {
        setOrders((prevOrders) => [...prevOrders, ...itemsList]);
      }
    } catch (error) {
      console.log("fetchOrders error:", error);
      if (isFirstPage) setOrders([]);
    }
  };

  const getOrders = async () => {
    setIsLoading(true);
    await fetchOrders({ isFirstPage: true });
    setIsLoading(false);
  };

  const handleSeeMore = async () => {
    setSeeMoreLoading(true);
    const nextPage = lastId + 1;
    setLastId(nextPage);
    await fetchOrders({ isFirstPage: false });
    setSeeMoreLoading(false);
  };

  const gotoDetails = (data) => {
    const orderId = data?._id || data?.order_id;
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.setItem("selected_ride", JSON.stringify(data));
      }
    } catch (e) {
      console.error("sessionStorage save error:", e);
    }
    router.push(`/ridedetails?id=${orderId}`);
  };

  useEffect(() => {
    setLastId(1);
    getOrders();
  }, [categoryTab, filterTab]);

  const handlePay = async () => {
    try {
      setLoading(true);

      const parsedTip = Number(tipAmount) || 0;
      if (parsedTip <= 0) {
        message.warning("Please enter a valid tip amount");
        setLoading(false);
        return;
      }

      if (parsedTip > Number(userDataStore?.amount || 0)) {
        message.error("Insufficient wallet balance");
        setLoading(false);
        return;
      }

      const body = {
        amount: String(parsedTip),
      };

      const res = await putData("users/tip-wallet-payment", body, header1);

      if (res?.success) {
        const responseBody = {
          token: token,
          success: true,
          newUser: false,
          user: res?.user,
        };
        dispatch(setUser(responseBody));

        // Instantly mark the order as tipped in UI
        setOrders((prev) =>
          prev.map((ord) =>
            ord._id === TipOrderId || ord.order_id === TipOrderId
              ? { ...ord, tip: 1 }
              : ord
          )
        );

        if (socket) {
          socket.emit("tip-order-customer", { orderId: TipOrderId, amount: String(parsedTip) }, (socketRes) => {
            setIsModalOpen(false);
            setTimeout(() => {
              setShow1(true);
            }, 300);
            message.success("Tip added successfully");
            setLoading(false);
          });
        } else {
          setIsModalOpen(false);
          setTimeout(() => {
            setShow1(true);
          }, 300);
          message.success("Tip added successfully");
          setLoading(false);
        }
      } else {
        message.error(res?.data?.message || res?.message || "Payment failed");
        setLoading(false);
      }
    } catch (error) {
      console.log("======error", error?.response?.data?.message || error.message);
      message.error(error?.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  const tabs = [
    { key: "all", label: "All Bookings", icon: <MdListAlt size={16} /> },
    { key: "requested", label: "Requested", icon: <MdForwardToInbox size={16} /> },
    { key: "upcoming", label: "Upcoming", icon: <MdOutlineSchedule size={16} /> },
    { key: "accepted", label: "Accepted", icon: <MdCheckCircleOutline size={16} /> },
    { key: "completed", label: "Completed", icon: <MdDoneAll size={16} /> },
    { key: "cancelled", label: "Cancelled", icon: <MdHighlightOff size={16} /> },
  ];

  return (
    <div className={`min-h-screen bg-[#f8fafc] font-poppins text-slate-800 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      {/* ===== 1. HERO DASHBOARD HEADER ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#001726] via-[#002f4a] to-[#001f33] !pt-20 sm:!pt-28 !pb-24 sm:!pb-28 text-white">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001726]/90 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb row */}
          <div className="flex items-center gap-2 text-slate-300 text-xs font-family-medium mb-2.5">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors no-underline">
              Home
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-white">My Bookings</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 !border border-white/15">
              <MdOutlineBookOnline size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-white text-2xl sm:text-3xl font-family-semibold tracking-tight !m-0 leading-tight">
                My{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
                  Bookings
                </span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm !mt-1 !m-0 font-family-regular">
                Manage and track your Nevis & Saint Kitts transfers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. TABS & MAIN CONTENT GRID ===== */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-20 -mt-6 sm:-mt-7 !pb-16 space-y-4">
        {/* Tier 1: Category Tabs (Matches Profile Page & Popular Places with Swiper) */}
        <div className="w-full max-w-full overflow-hidden">
          <Swiper
            modules={[FreeMode, Mousewheel]}
            slidesPerView="auto"
            spaceBetween={10}
            freeMode={true}
            mousewheel={{ forceToAxis: true }}
            className="w-full py-1 category-swiper"
          >
            {[
              { key: "rides", label: "Rides", icon: <FaLocationDot size={12} /> },
              { key: "tours", label: "Tours", icon: <MdOutlineBookOnline size={15} /> },
              { key: "services", label: "Services", icon: <MdListAlt size={15} /> },
              { key: "shop", label: "Shop Orders", icon: <IoWallet size={14} /> },
            ].map((cat) => {
              const isCatActive = categoryTab === cat.key;
              return (
                <SwiperSlide key={cat.key} style={{ width: "auto" }}>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange(cat.key)}
                    className={`cursor-pointer transition-all duration-300 select-none flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-family-semibold whitespace-nowrap !border shadow-sm ${
                      isCatActive
                        ? "text-white bg-[#004a70] !border-[#004a70] font-family-semibold shadow-md"
                        : "text-slate-700 bg-white !border-slate-200/90 hover:!border-[#004a70] hover:bg-slate-50 hover:text-[#004a70]"
                    }`}
                  >
                    <span className={isCatActive ? "opacity-100" : "opacity-75"}>
                      {cat.icon}
                    </span>
                    <span>{cat.label}</span>
                  </button>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* Tier 2: Dynamic Status Filter Pills for Active Category */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
          {currentFilterTabs.map((filter) => {
            const isFilterActive = filterTab === filter.key;
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setFilterTab(filter.key)}
                className={`px-5 py-2 rounded-full text-xs font-family-semibold transition-all duration-300 cursor-pointer select-none border whitespace-nowrap shadow-xs ${
                  isFilterActive
                    ? "bg-[#004a70] text-white border-[#004a70] shadow-sm font-family-semibold"
                    : "bg-white text-slate-700 border-slate-200/90 hover:border-[#004a70] hover:bg-slate-50 hover:text-[#004a70]"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div>
          <div className="flex justify-between items-center !mt-2 !mb-4 px-1">
            <h3 className="text-base sm:text-lg font-family-semibold text-slate-900 !m-0 capitalize">
              {filterTab} {categoryTab}
            </h3>
            <span className="text-xs font-family-medium text-slate-400">
              {Orders?.length || 0} item{Orders?.length !== 1 ? "s" : ""}
            </span>
          </div>

          {isLoading ? (
            <BookingsGridSkeleton />
          ) : Orders?.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center !py-16 bg-white rounded-2xl !border !border-slate-200/90 shadow-sm w-full">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#004a70] flex items-center justify-center !mb-3">
                <MdOutlineBookOnline size={22} />
              </div>
              <h4 className="text-sm font-family-semibold text-slate-800 !m-0 capitalize">
                No {filterTab} {categoryTab} found
              </h4>
              <p className="text-xs text-slate-400 !m-0 !mt-1 leading-relaxed max-w-sm font-family-regular">
                We couldn't find any data matching this category in your account.
              </p>
            </div>
          ) : (
            <>
              {/* Bookings Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 !mb-8">
                {Orders?.map((order, index) => {
                  if (categoryTab === "tours" || categoryTab === "services") {
                    const snap = categoryTab === "tours" ? (order?.tourSnapshot || order?.tour) : (order?.serviceSnapshot || order?.service);
                    const title = snap?.title || (categoryTab === "tours" ? "Tour Booking" : "Service Booking");
                    const image = snap?.image || snap?.images?.[0] || order?.tour?.images?.[0] || order?.service?.images?.[0] || "/placeholder.jpg";
                    const dateLabel = order?.date ? moment(order.date, "YYYY-MM-DD").format("ddd, DD MMM YYYY") : "Date TBD";
                    const timeLabel = order?.time || "";
                    const totalPriceXCD = Number(order?.totalPrice || order?.price || 0) + Number(order?.serviceFee || 0) + Number(order?.convenienceFee || 0);
                    const totalPriceUSD = (totalPriceXCD / 2.7).toFixed(2);
                    const guestsLabel = order?.guests?.adults || order?.guests?.kids
                      ? `${order.guests.adults || 0} Adult${order.guests.adults !== 1 ? "s" : ""}${order.guests.kids ? `, ${order.guests.kids} Kid${order.guests.kids !== 1 ? "s" : ""}` : ""}`
                      : (order?.bookingType === "group" ? "Group Booking" : "Standard");
                    const location = order?.pickup?.address || order?.location?.address || snap?.meetingPoint?.address || "St. Kitts & Nevis";
                    const tourId = order?.tour?._id || order?.tour;

                    return (
                      <div
                        key={`${order?._id}-${index}`}
                        className="group bg-white rounded-2xl !border !border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden"
                      >
                        <div>
                          {/* Image Banner + Status Badge */}
                          <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3 bg-slate-100">
                            <img
                              src={image}
                              alt={title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2.5 left-2.5">
                              <StatusBadge status={order?.status || "confirmed"} />
                            </div>
                            <div className="absolute bottom-2.5 right-2.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-right">
                              <span className="text-xs font-family-semibold block leading-tight">
                                ${totalPriceXCD.toFixed(2)} XCD
                              </span>
                              <span className="text-[10px] text-slate-300 font-family-medium block">
                                ≈ ${totalPriceUSD} USD
                              </span>
                            </div>
                          </div>

                          <h4 className="text-sm sm:text-base font-family-semibold text-slate-900 !m-0 line-clamp-2 leading-snug mb-2">
                            {title}
                          </h4>

                          {/* Details strip */}
                          <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 mb-3">
                            <div className="flex items-center gap-2">
                              <MdOutlineCalendarMonth size={14} className="text-[#004a70] shrink-0" />
                              <span className="font-family-medium truncate">
                                {[dateLabel, timeLabel].filter(Boolean).join(" • ")}
                              </span>
                            </div>
                            {categoryTab === "tours" && (
                              <div className="flex items-center gap-2">
                                <FaUsers size={12} className="text-[#004a70] shrink-0" />
                                <span className="font-family-medium truncate">{guestsLabel}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <FaLocationDot size={12} className="text-[#004a70] shrink-0" />
                              <span className="font-family-medium truncate">{location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-2 border-t border-slate-100 mt-auto space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-family-medium">Booking ID</span>
                            <span className="font-mono text-[11px] text-slate-700">#{order?._id?.slice(-8)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (categoryTab === "tours") {
                                setSelectedTourBooking(order);
                              } else {
                                setSelectedServiceBooking(order);
                              }
                            }}
                            className="w-full h-9 sm:h-10 rounded-xl bg-[#004a70] hover:bg-[#003957] text-white text-xs font-family-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer border-none shadow-xs"
                          >
                            <FaEye size={13} />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (categoryTab === "shop") {
                    const orderNum = order?.id || order?.order_id || order?._id?.slice(-6);
                    const priceXCD = Number(order?.price || order?.total_price || 0);
                    const priceUSD = (priceXCD / 2.7).toFixed(2);
                    const cartItems = order?.cart_items || [];

                    return (
                      <div
                        key={`${order?._id}-${index}`}
                        className="group bg-white rounded-2xl !border !border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden"
                      >
                        <div>
                          {/* Top Row: Status + Price */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex flex-col gap-1">
                              <StatusBadge status={order?.status || "pending"} />
                              <span className="text-[11px] font-family-semibold text-slate-700">
                                Order #{orderNum}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-base sm:text-lg font-family-semibold text-emerald-600 block leading-tight">
                                ${priceXCD.toFixed(2)} XCD
                              </span>
                              <span className="text-[10.5px] text-slate-400 font-family-medium block">
                                ≈ ${priceUSD} USD
                              </span>
                            </div>
                          </div>

                          {/* Cart Items List */}
                          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 mb-3 space-y-1.5">
                            <span className="text-[10px] font-family-semibold text-slate-400 uppercase tracking-wider block">
                              Items Ordered ({cartItems.length})
                            </span>
                            {cartItems.length > 0 ? (
                              <div className="space-y-1 max-h-28 overflow-y-auto">
                                {cartItems.map((cItem, cIdx) => (
                                  <div key={cIdx} className="flex justify-between items-center text-xs py-0.5 border-b border-slate-100 last:border-0">
                                    <span className="font-family-medium text-slate-800 truncate max-w-[70%]">
                                      {cItem?.name || cItem?.title || "Product"}
                                    </span>
                                    <span className="text-[11px] font-family-semibold text-[#004a70] shrink-0">
                                      Qty: {cItem?.cartQuantity || cItem?.quantity || 1}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 font-family-medium !m-0">Shop Order</p>
                            )}
                          </div>

                          {/* Delivery Location & Date */}
                          <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 mb-3">
                            {order?.drop_location && (
                              <div className="flex items-start gap-2">
                                <FaLocationDot size={12} className="text-[#004a70] shrink-0 mt-0.5" />
                                <span className="font-family-medium line-clamp-1">{order.drop_location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                              <MdOutlineSchedule size={13} className="shrink-0" />
                              <span>{moment(order?.createdAt).format("DD MMM YYYY • hh:mm A")}</span>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-2 border-t border-slate-100 mt-auto space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-family-medium">Total Paid</span>
                            <span className="font-family-semibold text-slate-900">${priceXCD.toFixed(2)} XCD</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedShopOrder(order)}
                            className="w-full h-9 sm:h-10 rounded-xl bg-[#004a70] hover:bg-[#003957] text-white text-xs font-family-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer border-none shadow-xs"
                          >
                            <FaEye size={13} />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // Default: Rides
                  const isParcel = order?.rideType === "parcel" || order?.type === "parcel" || Boolean(order?.title);
                  const isCompleted = (order?.status || "").toLowerCase() === "completed";
                  const rideTypeLabel = isParcel
                    ? "Ride For Parcel"
                    : order?.rideType === "group"
                    ? "Group Ride"
                    : order?.rideType === "tour"
                    ? "Tour Ride"
                    : "Standard Ride";

                  const accentColor = isParcel ? "#c2410c" : "#004a70";
                  const accentBg   = isParcel ? "from-orange-500/10 to-orange-400/5" : "from-[#004a70]/10 to-sky-400/5";

                  return (
                    <div
                      key={`${order?._id}-${index}`}
                      className="group !bg-white !rounded-2xl !border !border-slate-200/90 hover:!border-slate-300 !shadow-sm hover:!shadow-md hover:!-translate-y-0.5 !transition-all !duration-300 !flex !flex-col !relative !overflow-hidden"
                    >
                      <div className="!p-4 sm:!p-5 !flex !flex-col !flex-1 !gap-3">

                        {/* ── Row 1: Status / ID / Type + Price & Date ── */}
                        <div className="!flex !items-start !justify-between !gap-3 !mb-1">
                          <div className="!flex !flex-col !gap-1.5 !min-w-0">
                            <div className="!flex !items-center !gap-2 !flex-wrap">
                              <StatusBadge status={order?.status} />
                              {order?.order_id && (
                                <span className="!text-[11px] !font-family-semibold !text-slate-500 !tabular-nums">
                                  #{order.order_id}
                                </span>
                              )}
                            </div>
                            {/* Ride Type Pill */}
                            <span
                              className={`!inline-flex !items-center !gap-1.5 !px-2.5 !py-0.5 !rounded-full !text-[10px] !font-family-semibold !tracking-wide !w-fit ${
                                isParcel
                                  ? "!bg-orange-50 !text-orange-700 !border !border-orange-200/80"
                                  : "!bg-[#004a70]/5 !text-[#004a70] !border !border-[#004a70]/15"
                              }`}
                            >
                              {isParcel ? <FaBox size={8} /> : <FaCar size={8} />}
                              <span>{rideTypeLabel}</span>
                            </span>
                          </div>

                          <div className="!text-right !shrink-0">
                            <span className="!text-lg sm:!text-xl !font-family-semibold !text-[#004a70] !block !leading-tight !tabular-nums">
                              ${Number(order?.price || 0).toFixed(2)}
                            </span>
                            <div className="!text-[11px] !text-slate-400 !font-family-medium !mt-1 !flex !items-center !justify-end !gap-1">
                              <MdOutlineSchedule size={12} className="!text-slate-400 !shrink-0" />
                              <span>{moment(order?.createdAt).format("DD MMM YYYY • hh:mm A")}</span>
                            </div>
                          </div>
                        </div>

                        {/* ── Parcel Details (parcel only) ── */}
                        {isParcel && (order?.image || order?.title) && (
                          <div className="!flex !items-center !gap-2.5 !rounded-xl !p-2.5 !bg-orange-50/60 !border !border-orange-200/70">
                            {order?.image && (
                              <div className="!w-11 !h-11 !rounded-lg !overflow-hidden !shrink-0 !bg-white !border !border-orange-200">
                                <img
                                  src={order.image}
                                  alt="parcel"
                                  className="!w-full !h-full !object-cover"
                                  onError={(e) => { e.target.style.display = "none"; }}
                                />
                              </div>
                            )}
                            <div className="!min-w-0 !flex-1">
                              <span className="!text-[9.5px] !font-family-semibold !uppercase !tracking-wider !text-orange-600 !block">
                                Parcel Item
                              </span>
                              <p className="!text-xs !font-family-semibold !text-slate-800 !m-0 !truncate !mt-0.5">
                                {order?.title || "Parcel Delivery"}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* ── Route Strip ── */}
                        <div className="!rounded-xl !p-3 !flex !flex-col !gap-2.5 !bg-slate-50/70 !border !border-slate-100">
                          {/* Pickup */}
                          <div className="!flex !items-start !gap-2.5">
                            <div className="!w-5 !h-5 !rounded-full !bg-emerald-500 !text-white !flex !items-center !justify-center !shrink-0 !mt-0.5 !shadow-xs">
                              <FaLocationDot size={9} />
                            </div>
                            <div className="!min-w-0 !flex-1">
                              <span className="!text-[9px] !font-family-semibold !uppercase !tracking-wider !text-emerald-700 !block">
                                Pickup
                              </span>
                              <p className="!text-[12px] !font-family-medium !text-slate-800 !m-0 !leading-snug !truncate" title={order?.start_address || "—"}>
                                {order?.start_address || "—"}
                              </p>
                            </div>
                          </div>

                          {/* Connector */}
                          <div className="!flex !items-center !gap-2 !pl-[9px]">
                            <div className="!w-1.5 !h-1.5 !rounded-full !bg-slate-300" />
                            <div className="!flex-1 !h-px !bg-slate-200" />
                          </div>

                          {/* Destination */}
                          <div className="!flex !items-start !gap-2.5">
                            <div className="!w-5 !h-5 !rounded-full !bg-[#004a70] !text-white !flex !items-center !justify-center !shrink-0 !mt-0.5 !shadow-xs">
                              <MdOutlineMyLocation size={10} />
                            </div>
                            <div className="!min-w-0 !flex-1">
                              <span className="!text-[9px] !font-family-semibold !uppercase !tracking-wider !text-[#004a70] !block">
                                Destination
                              </span>
                              <p className="!text-[12px] !font-family-medium !text-slate-800 !m-0 !leading-snug !truncate" title={order?.end_address || "—"}>
                                {order?.end_address || "—"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* ── Driver Row ── */}
                        {order?.to_id ? (
                          <div className="!flex !items-center !justify-between !gap-2.5 !p-2.5 !rounded-xl !bg-slate-50/60 !border !border-slate-100">
                            <div className="!flex !items-center !gap-2.5 !min-w-0 !flex-1">
                              <div className="!w-8 !h-8 !rounded-full !overflow-hidden !shrink-0 !border !border-white !shadow-xs">
                                <img
                                  alt=""
                                  width={32}
                                  height={32}
                                  src={order?.to_id?.image || "/placeholder.jpg"}
                                  className="!w-full !h-full !object-cover"
                                />
                              </div>
                              <div className="!min-w-0 !flex-1">
                                <h4 className="!text-[12px] !font-family-semibold !text-slate-900 !m-0 !truncate !leading-tight">
                                  {order?.to_id?.name || "Driver"}
                                </h4>
                                <p className="!text-[10.5px] !text-slate-400 !font-family-regular !m-0 !truncate">
                                  {order?.to_id?.email || "Driver assigned"}
                                </p>
                              </div>
                            </div>
                            {order?.to_id?.rating && order?.to_id?.rating !== "0" && (
                              <span className="!inline-flex !items-center !gap-1 !text-[11px] !font-family-semibold !text-amber-600 !bg-amber-50 !px-2 !py-0.5 !rounded-full !border !border-amber-200/70 !shrink-0">
                                <FaStar size={10} className="!text-amber-400" />
                                <span>{order?.to_id?.rating}.0</span>
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="!flex !items-center !justify-center !gap-2 !py-2.5 !rounded-xl !bg-slate-50/60 !border !border-dashed !border-slate-200">
                            <FaCar size={12} className="!text-slate-400" />
                            <p className="!text-[11px] !text-slate-400 !font-family-medium !m-0">Driver not assigned yet</p>
                          </div>
                        )}

                        {/* ── PIN Code ── */}
                        {order?.pincode && (
                          <div className="!flex !items-center !justify-between !px-3.5 !py-2 !rounded-xl !bg-[#004a70]/5 !border !border-[#004a70]/15">
                            <span className="!text-[10px] !font-family-semibold !uppercase !tracking-wider !text-[#004a70]">
                              Ride PIN
                            </span>
                            <span className="!text-sm !font-mono !font-semibold !text-[#004a70] !tracking-[0.25em] !bg-white !px-3 !py-0.5 !rounded-lg !border !border-[#004a70]/20 !shadow-xs">
                              {order.pincode}
                            </span>
                          </div>
                        )}

                        {/* ── Action Buttons ── */}
                        <div className="!flex !items-center !gap-2 !pt-2.5 !border-t !border-slate-100 !mt-auto">
                          <button
                            type="button"
                            onClick={() => gotoDetails(order)}
                            className="!flex-1 !h-9 sm:!h-10 !rounded-xl !bg-[#004a70] hover:!bg-[#003856] !text-white !text-xs !font-family-semibold !flex !items-center !justify-center !gap-1.5 !transition-all !duration-200 !cursor-pointer !border-none !shadow-xs active:!scale-[0.98]"
                          >
                            <FaEye size={12} />
                            <span>View Details</span>
                          </button>

                          {/* Review button — completed rides only */}
                          {isCompleted && (
                            <button
                              type="button"
                              onClick={() => openReviewModal(order)}
                              className="!h-9 sm:!h-10 !px-3.5 !rounded-xl !text-xs !font-family-semibold !flex !items-center !justify-center !gap-1.5 !transition-all !duration-200 !cursor-pointer active:!scale-[0.98] !bg-amber-50 hover:!bg-amber-100 !text-amber-700 !border !border-amber-200"
                            >
                              <FaStar size={11} className="!text-amber-400" />
                              <span>Review</span>
                            </button>
                          )}

                          {/* Tip button */}
                          <button
                            type="button"
                            disabled={order?.tip === 1}
                            onClick={() => { openModal(true); setTipOrderId(order?._id); }}
                            className={`!h-9 sm:!h-10 !px-3.5 !rounded-xl !text-xs !font-family-semibold !flex !items-center !justify-center !gap-1.5 !transition-all !duration-200 active:!scale-[0.98] ${
                              order?.tip === 1
                                ? "!bg-slate-100 !text-slate-400 !border !border-slate-200 !cursor-not-allowed"
                                : "!bg-white hover:!bg-[#004a70]/5 !text-[#004a70] !border !border-slate-200 hover:!border-[#004a70] !cursor-pointer"
                            }`}
                          >
                            <FaPlus size={10} className={order?.tip === 1 ? "!text-slate-300" : "!text-[#004a70]"} />
                            <span>{order?.tip === 1 ? "Tipped ✓" : "Tip"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* See More pagination */}
              {lastId < count && (
                <div className="flex justify-center !mt-8">
                  <button
                    onClick={handleSeeMore}
                    disabled={seeMoreLoading}
                    className="px-8 py-2.5 rounded-full !border !border-[#004a70] bg-white hover:!bg-[#004a70] text-[#004a70] hover:!text-white font-family-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                  >
                    {seeMoreLoading ? (
                      <>
                        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <span>See More</span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ===== TIP MODAL (Redesigned Clean Modern UI) ===== */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-[380px] p-4 relative !border !border-slate-100 animate-scale-up space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar: Icon + Title & Close */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                
                <div>
                  <h3 className="text-base font-family-semibold text-slate-900 !m-0 leading-tight">
                    Add a Tip
                  </h3>
                  <p className="text-xs text-slate-400 !m-0 font-family-regular mt-0.5">
                    Show appreciation for great service
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer border-none"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* Content Body */}
            <div>
              {CustomAmount ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-family-semibold text-slate-700">
                      Enter Custom Amount
                    </label>
                    <button
                      type="button"
                      onClick={() => setCustomAmount(false)}
                      className="text-[#004a70] hover:underline font-family-medium cursor-pointer bg-transparent border-none p-0"
                    >
                      Quick select
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-family-semibold text-slate-400">
                      $
                    </span>
                    <input
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-family-semibold text-slate-900 focus:bg-white focus:border-[#004a70] outline-none transition-colors"
                      type="number"
                      step="0.5"
                      name="price"
                      placeholder="Enter amount"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-family-semibold text-slate-400 uppercase tracking-wider">
                      Select Amount
                    </span>
                    <button
                      type="button"
                      onClick={handleChangeCustom}
                      className="text-[11px] text-[#004a70] hover:underline font-family-semibold cursor-pointer bg-transparent border-none p-0"
                    >
                      Custom amount
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {["1", "2", "5", "10", "20"].map((amount) => {
                      const isSelected = tipAmount === amount;
                      return (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => handleTipSelection(amount)}
                          className={`py-2.5 rounded-xl border text-xs sm:text-sm font-family-semibold cursor-pointer transition-all text-center select-none ${
                            isSelected
                              ? "bg-[#004a70] text-white border-[#004a70] shadow-sm shadow-[#004a70]/30 scale-[1.03]"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90"
                          }`}
                        >
                          ${amount}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Conversion summary pill */}
              <div className="mt-3.5 p-2 rounded-xl bg-sky-500/[0.06] border border-sky-400/20 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-family-medium">Total Tip</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-family-semibold text-[#004a70] text-sm">
                    ${Number(tipAmount || 0).toFixed(2)} USD
                  </span>
                  <span className="text-[10.5px] text-slate-400 font-family-medium">
                    (≈ ${(Number(tipAmount || 0) * 2.7).toFixed(2)} XCD)
                  </span>
                </div>
              </div>

              {/* Payment Actions */}
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShow(true);
                    setIsModalOpen(false);
                  }}
                  className="w-full h-11 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white font-family-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-sm shadow-[#004a70]/20 active:scale-[0.99]"
                >
                  <MdPayment size={16} />
                  <span>Pay with Card</span>
                </button>

                <button
                  type="button"
                  onClick={handlePay}
                  className="w-full h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-family-semibold text-xs flex items-center justify-center gap-2 border border-slate-200/90 transition-all cursor-pointer active:scale-[0.99]"
                >
                  {Loading ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <IoWallet size={15} className="text-[#004a70]" />
                      <span>Pay with Wallet</span>
                      <span className="text-[10.5px] text-slate-400 font-family-regular">
                        (${Number(userDataStore?.amount || 0).toFixed(2)})
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CARD PAYMENT MODAL ===== */}
      <Modal centered size="lg" show={show} onHide={handleClose}>
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-slate-50 p-4 !border-b !border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-family-semibold text-slate-900 !m-0 flex items-center gap-2">
              <MdPayment size={18} className="text-[#004a70]" />
              Payment Details
            </h3>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-lg !border !border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          <div className="p-5 sm:p-6">
            {paymentCards?.length ? (
              <div className="!mb-5">
                <p className="text-xs font-family-semibold text-slate-900 !mb-2">
                  Saved Cards
                </p>
                <div className="flex flex-col gap-2">
                  {paymentCards?.map((item, i) => (
                    <div
                      onClick={() => onSelectCard(item)}
                      key={i}
                      className="p-3 rounded-xl !border !border-slate-200 bg-white hover:!border-[#004a70] cursor-pointer flex justify-between items-center transition-all"
                    >
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider !m-0 leading-none">Email</p>
                        <p className="text-xs text-slate-800 font-family-medium !mt-1 !m-0">{item?.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider !m-0 leading-none">Card</p>
                        <p className="text-xs text-slate-900 font-family-semibold !mt-1 !m-0">
                          •••• {item?.cardnumber?.slice(-4) || item?.cardnumber}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <p className="text-xs font-family-semibold text-slate-900 !mb-3">
              {paymentCards?.length ? "Add New Card" : "Card Information"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              <div className="flex justify-center">
                <Cards
                  cvc={cardDetails.cvc}
                  expiry={cardDetails.expiry}
                  name={cardDetails.name}
                  number={cardDetails.number}
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <input
                  className="px-3.5 py-2 !border !border-slate-200 rounded-xl text-xs outline-none focus:!border-[#004a70] transition-colors bg-slate-50/50"
                  type="text"
                  name="number"
                  placeholder="Card Number"
                  value={cardDetails.number}
                  onChange={handleInputChange}
                  maxLength="16"
                  required
                />
                <input
                  className="px-3.5 py-2 !border !border-slate-200 rounded-xl text-xs outline-none focus:!border-[#004a70] transition-colors bg-slate-50/50"
                  type="text"
                  name="name"
                  placeholder="Cardholder Name"
                  value={cardDetails.name}
                  onChange={handleInputChange}
                  required
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    className="px-3.5 py-2 !border !border-slate-200 rounded-xl text-xs outline-none focus:!border-[#004a70] transition-colors bg-slate-50/50"
                    type="text"
                    name="expiry"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={handleInputChange}
                    maxLength="5"
                    required
                  />
                  <input
                    className="px-3.5 py-2 !border !border-slate-200 rounded-xl text-xs outline-none focus:!border-[#004a70] transition-colors bg-slate-50/50"
                    type="text"
                    name="cvc"
                    placeholder="CVC"
                    value={cardDetails.cvc}
                    onChange={handleInputChange}
                    maxLength="4"
                    required
                  />
                </div>
                <input
                  className="px-3.5 py-2 !border !border-slate-200 rounded-xl text-xs outline-none focus:!border-[#004a70] transition-colors bg-slate-50/50"
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={cardDetails.email}
                  onChange={handleInputChange}
                  required
                />
                <input
                  className="px-3.5 py-2 !border !border-slate-200 rounded-xl text-xs outline-none focus:!border-[#004a70] transition-colors bg-slate-50/50"
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={cardDetails.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="!mt-5">
              <button
                onClick={jadAPiFunction}
                disabled={!areAllFieldsFilled()}
                className={`w-full h-10 rounded-xl text-xs font-family-semibold flex items-center justify-center gap-2 transition-colors ${areAllFieldsFilled()
                    ? "bg-[#004a70] hover:bg-[#003957] text-white !border-none cursor-pointer"
                    : "bg-slate-100 text-slate-400 !border !border-slate-200 cursor-not-allowed"
                  }`}
              >
                {loading ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Pay Now"
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ===== SUCCESS ALERT MODAL ===== */}
      {show1 && (
        <Modal
          show={show1}
          onHide={() => setShow1(false)}
          centered
        >
          <div className="bg-white rounded-2xl text-center p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto !mb-4">
              <MdDoneAll size={28} />
            </div>
            <h2 className="text-lg font-family-semibold text-slate-900 !mb-1.5">
              Tip Added!
            </h2>
            <p className="text-xs text-slate-500 font-family-regular !m-0">
              Your driver tip has been processed successfully.
            </p>
            <button
              onClick={() => setShow1(false)}
              className="!mt-5 w-full h-9 rounded-xl bg-[#004a70] hover:bg-[#003957] text-white font-family-semibold text-xs transition-colors !border-none cursor-pointer"
            >
              Done
            </button>
          </div>
        </Modal>
      )}

      {/* ===== REVIEW MODAL ===== */}
      {reviewModal && (
        <Modal
          show={reviewModal}
          onHide={() => setReviewModal(false)}
          centered
        >
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between !px-5 !pt-5 !pb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                  <FaStar size={16} className="text-amber-400" />
                </span>
                <h3 className="text-[15px] font-family-bold text-slate-900 !m-0">Leave a Review</h3>
              </div>
              <button
                onClick={() => setReviewModal(false)}
                className="w-7 h-7 rounded-full !border !border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="px-5 pb-5 space-y-4">
              {/* Rating Block */}
              <div>
                <p className="text-xs font-family-bold text-slate-800 !mb-2">Your Rating</p>
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
                          size={28}
                          style={{ color: star <= reviewRating ? "#22c55e" : "#e2e8f0" }}
                        />
                      </button>
                    ))}
                  </div>
                  {/* Score Badge */}
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-family-bold"
                    style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
                  >
                    <FaStar size={10} className="text-green-500" />
                    {reviewRating}.0 / 5.0
                  </span>
                </div>

                {/* Label Row */}
                <div className="flex items-center justify-between !mt-1.5">
                  <span className="text-[11.5px] font-family-semibold" style={{ color: "#16a34a" }}>
                    {reviewRating === 5 ? "Exceptional! 🤩"
                      : reviewRating === 4 ? "Great! 😊"
                      : reviewRating === 3 ? "Good 🙂"
                      : reviewRating === 2 ? "Fair 😐"
                      : "Poor 😞"}
                  </span>
                  <span className="text-[10.5px] text-slate-400 font-family-regular">Tap to adjust</span>
                </div>
              </div>

              {/* Feedback Textarea */}
              <div>
                <p className="text-xs font-family-bold text-slate-800 !mb-2">Your Feedback</p>
                <textarea
                  className="w-full min-h-[96px] px-3 py-2.5 rounded-xl text-xs font-family-regular text-slate-700 outline-none resize-none transition-colors placeholder-slate-400"
                  style={{ border: "1.5px solid #e2e8f0", background: "#f8fafc" }}
                  placeholder="Share your experience with this driver..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = "#004a70"; e.target.style.background = "#fff"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; }}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={submitReview}
                className="w-full h-11 rounded-xl text-white text-sm font-family-bold flex items-center justify-center gap-2 cursor-pointer !border-none transition-all duration-200 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #003855 0%, #004a70 50%, #006090 100%)" }}
              >
                Submit Review
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ===== TOUR BOOKING DETAIL MODAL (Matching Mobile TourBookingDetail.js) ===== */}
      {mounted && typeof document !== "undefined" && selectedTourBooking && createPortal(
        (() => {
          const booking = selectedTourBooking;
          const snap = booking?.tourSnapshot || booking?.tour || {};
          const title = snap?.title || booking?.tour?.title || "Tour Booking";
          const image = snap?.image || snap?.images?.[0] || booking?.tour?.images?.[0] || "/placeholder.jpg";
          const status = String(booking?.status || "pending").toLowerCase();
          const dateLabel = booking?.date ? moment(booking.date, "YYYY-MM-DD").format("ddd, DD MMM YYYY") : "Date TBD";
          const timeLabel = booking?.time ? (moment(booking.time, ["HH:mm", "H:mm", "hh:mm A"]).isValid() ? moment(booking.time, ["HH:mm", "H:mm", "hh:mm A"]).format("hh:mm A") : booking.time) : "";
          const tourId = booking?.tour?._id || booking?.tour;
          const hasPickupDropoff = booking?.locationType === "pickup_dropoff" || snap?.locationType === "pickup_dropoff" || booking?.pickup?.address || booking?.dropoff?.address;
          
          const guestsText = booking?.bookingType === "group"
            ? "Group Tour"
            : [
                booking?.guests?.adults ? `${booking.guests.adults} adult${booking.guests.adults === 1 ? "" : "s"}` : null,
                booking?.guests?.kids ? `${booking.guests.kids} child${booking.guests.kids === 1 ? "" : "ren"}` : null,
                booking?.guests?.infants ? `${booking.guests.infants} infant${booking.guests.infants === 1 ? "" : "s"}` : null,
              ].filter(Boolean).join(", ") || `${booking?.totalGuests || 1} guests`;
          
          const priceFareXCD = Number(booking?.totalPrice || booking?.price || 0);
          const serviceFeeXCD = Number(booking?.serviceFee || 0);
          const convenienceFeeXCD = Number(booking?.convenienceFee || 0);
          const totalXCD = priceFareXCD + serviceFeeXCD + convenienceFeeXCD;
          const totalUSD = (totalXCD / 2.7).toFixed(2);

          return (
            <div
              className="!fixed !inset-0 !z-[9999999] !flex !items-center !justify-center !p-4 !bg-black/75 !backdrop-blur-md !animate-fade-in"
              onClick={() => setSelectedTourBooking(null)}
            >
              <div
                className="relative w-full max-w-lg bg-white rounded-3xl !p-5 sm:!p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with Title and Close */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-family-semibold text-slate-900 !m-0">
                      Tour Booking Details
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTourBooking(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer border-none transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Hero Image */}
                <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100 border border-slate-200/80">
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={status} />
                  </div>
                </div>

                {/* Title & Status Notice */}
                <div className="mb-4">
                  <span className="text-[10px] font-family-semibold uppercase tracking-wider text-[#004a70] block mb-1">
                    {booking?.bookingType === "group" ? "Group Tour" : "Tour Booking"}
                  </span>
                  <h4 className="text-base sm:text-lg font-family-semibold text-slate-900 !m-0 leading-snug">
                    {title}
                  </h4>

                  {status === "pending" && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11.5px] text-amber-800 font-family-medium leading-relaxed">
                      ⏳ Payment is held. Admin / guide will approve or reject this booking request.
                    </div>
                  )}
                </div>

                {/* Summary Breakdown Card (Matching Mobile TourBookingDetail.js) */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs text-slate-600 mb-4">
                  <h5 className="text-xs font-family-semibold uppercase tracking-wider text-slate-800 !m-0 pb-1 border-b border-slate-200/80">
                    Booking Summary
                  </h5>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Date</span>
                    <span className="font-family-semibold text-slate-900">{dateLabel}</span>
                  </div>
                  {timeLabel && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Time Slot</span>
                      <span className="font-family-semibold text-slate-900">{timeLabel}</span>
                    </div>
                  )}
                  {booking?.day && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Day</span>
                      <span className="font-family-semibold text-slate-900">{booking.day}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Guests / Party</span>
                    <span className="font-family-semibold text-slate-900">{guestsText}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Booking Type</span>
                    <span className="font-family-semibold text-slate-900 capitalize">
                      {booking?.bookingType === "group" ? "Group" : "Individual"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Payment Method</span>
                    <span className="font-family-semibold text-slate-900 capitalize">
                      {booking?.paymentType === "wallet" ? "CabKn Wallet" : booking?.paymentType === "jad" || booking?.paymentType === "card" ? "Credit / Debit Card" : booking?.paymentType || "Card"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Fare</span>
                      <span className="font-family-semibold text-slate-800">${priceFareXCD.toFixed(2)} XCD</span>
                    </div>
                    {serviceFeeXCD > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Service Fee (20%)</span>
                        <span className="font-family-semibold text-slate-800">${serviceFeeXCD.toFixed(2)} XCD</span>
                      </div>
                    )}
                    {convenienceFeeXCD > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Convenience Fee</span>
                        <span className="font-family-semibold text-slate-800">${convenienceFeeXCD.toFixed(2)} XCD</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-family-semibold text-slate-900">
                      <span>Total Amount</span>
                      <div className="text-right">
                        <span className="text-[#004a70] text-base font-family-semibold block">
                          ${totalXCD.toFixed(2)} XCD
                        </span>
                        <span className="text-[10.5px] text-slate-400 font-family-regular block">
                          ≈ ${totalUSD} USD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pickup & Drop-off or Meeting Point Card */}
                {hasPickupDropoff ? (
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-1.5 text-slate-800 font-family-semibold">
                      <FaLocationDot size={13} className="text-[#004a70]" />
                      <span>Pickup & Drop-off</span>
                    </div>
                    {booking?.pickup?.address && (
                      <div className="pl-4">
                        <span className="text-[11px] font-family-semibold text-[#004a70] block">Pickup Location</span>
                        <p className="text-slate-700 font-family-medium !m-0 mt-0.5">{booking.pickup.address}</p>
                      </div>
                    )}
                    {booking?.dropoff?.address && (
                      <div className="pl-4 pt-1">
                        <span className="text-[11px] font-family-semibold text-[#004a70] block">Drop-off Location</span>
                        <p className="text-slate-700 font-family-medium !m-0 mt-0.5">{booking.dropoff.address}</p>
                      </div>
                    )}
                  </div>
                ) : (snap?.meetingPoint?.address || booking?.tour?.meetingPoint?.address) ? (
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-1.5 text-slate-800 font-family-semibold">
                      <FaLocationDot size={13} className="text-[#004a70]" />
                      <span>Meeting Point</span>
                    </div>
                    <p className="text-slate-600 font-family-medium leading-relaxed !m-0 pl-5">
                      {snap?.meetingPoint?.address || booking?.tour?.meetingPoint?.address}
                    </p>
                  </div>
                ) : null}

                {/* Special Note if any */}
                {booking?.note && (
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-1 text-xs text-slate-600 mb-4">
                    <span className="text-slate-800 font-family-semibold block">Special Instructions / Notes</span>
                    <p className="text-slate-600 font-family-medium leading-relaxed !m-0 italic">
                      "{booking.note}"
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  {tourId && (
                    <Link
                      href={`/tourDetails/${tourId}`}
                      className="flex-1 py-2.5 rounded-xl bg-[#004a70] hover:bg-[#003957] text-white text-xs font-family-semibold text-center no-underline transition-all shadow-xs"
                    >
                      View Tour Page
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedTourBooking(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-family-semibold transition-all cursor-pointer border-none"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })(),
        document.body
      )}

      {/* ===== SERVICE BOOKING DETAIL MODAL (Matching Mobile ServiceBookingDetail.js) ===== */}
      {mounted && typeof document !== "undefined" && selectedServiceBooking && createPortal(
        (() => {
          const booking = selectedServiceBooking;
          const snap = booking?.serviceSnapshot || booking?.service || {};
          const title = snap?.title || booking?.service?.title || "Service Booking";
          const image = snap?.image || snap?.images?.[0] || booking?.service?.images?.[0] || "/placeholder.jpg";
          const status = String(booking?.status || "pending").toLowerCase();
          const dateLabel = booking?.date ? moment(booking.date, "YYYY-MM-DD").format("ddd, DD MMM YYYY") : "Date TBD";
          const timeLabel = booking?.time ? (moment(booking.time, ["HH:mm", "H:mm", "hh:mm A"]).isValid() ? moment(booking.time, ["HH:mm", "H:mm", "hh:mm A"]).format("hh:mm A") : booking.time) : "";
          const atLocation = booking?.locationType === "at_your_location" || snap?.locationType === "at_your_location";
          const serviceId = booking?.service?._id || booking?.service;
          const guestsText = booking?.bookingType === "group"
            ? "Group Service"
            : [
                booking?.guests?.adults ? `${booking.guests.adults} adult${booking.guests.adults === 1 ? "" : "s"}` : null,
                booking?.guests?.kids ? `${booking.guests.kids} child${booking.guests.kids === 1 ? "" : "ren"}` : null,
                booking?.guests?.infants ? `${booking.guests.infants} infant${booking.guests.infants === 1 ? "" : "s"}` : null,
              ].filter(Boolean).join(", ") || `${booking?.totalGuests || 1} guests`;
          
          const priceFareXCD = Number(booking?.totalPrice || booking?.price || 0);
          const serviceFeeXCD = Number(booking?.serviceFee || 0);
          const convenienceFeeXCD = Number(booking?.convenienceFee || 0);
          const totalXCD = priceFareXCD + serviceFeeXCD + convenienceFeeXCD;
          const totalUSD = (totalXCD / 2.7).toFixed(2);

          return (
            <div
              className="!fixed !inset-0 !z-[9999999] !flex !items-center !justify-center !p-4 !bg-black/75 !backdrop-blur-md !animate-fade-in"
              onClick={() => setSelectedServiceBooking(null)}
            >
              <div
                className="relative w-full max-w-lg bg-white rounded-3xl !p-5 sm:!p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with Title and Close */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-family-semibold text-slate-900 !m-0">
                      Service Booking Details
                    </h3>
                  
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedServiceBooking(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer border-none transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Hero Image */}
                <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100 border border-slate-200/80">
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={status} />
                  </div>
                </div>

                {/* Title & Status Message */}
                <div className="mb-4">
                  <span className="text-[10px] font-family-semibold uppercase tracking-wider text-[#004a70] block mb-1">
                    {booking?.category?.name || (booking?.bookingType === "group" ? "Group Service" : "Service")}
                  </span>
                  <h4 className="text-base sm:text-lg font-family-semibold text-slate-900 !m-0 leading-snug">
                    {title}
                  </h4>

                  {status === "pending" && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11.5px] text-amber-800 font-family-medium leading-relaxed">
                      ⏳ Payment is held. Admin / provider will approve or reject this booking request.
                    </div>
                  )}
                </div>

                {/* Summary Breakdown Card (Matching Mobile Row list) */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs text-slate-600 mb-4">
                  <h5 className="text-xs font-family-semibold uppercase tracking-wider text-slate-800 !m-0 pb-1 border-b border-slate-200/80">
                    Booking Summary
                  </h5>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Date</span>
                    <span className="font-family-semibold text-slate-900">{dateLabel}</span>
                  </div>
                  {timeLabel && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Time Slot</span>
                      <span className="font-family-semibold text-slate-900">{timeLabel}</span>
                    </div>
                  )}
                  {booking?.day && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Day</span>
                      <span className="font-family-semibold text-slate-900">{booking.day}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Guests / Party</span>
                    <span className="font-family-semibold text-slate-900">{guestsText}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Payment Method</span>
                    <span className="font-family-semibold text-slate-900 capitalize">
                      {booking?.paymentType === "wallet" ? "CabKn Wallet" : booking?.paymentType === "jad" || booking?.paymentType === "card" ? "Credit / Debit Card" : booking?.paymentType || "Card"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Fare</span>
                      <span className="font-family-semibold text-slate-800">${priceFareXCD.toFixed(2)} XCD</span>
                    </div>
                    {serviceFeeXCD > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Service Fee (20%)</span>
                        <span className="font-family-semibold text-slate-800">${serviceFeeXCD.toFixed(2)} XCD</span>
                      </div>
                    )}
                    {convenienceFeeXCD > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Convenience Fee</span>
                        <span className="font-family-semibold text-slate-800">${convenienceFeeXCD.toFixed(2)} XCD</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-family-semibold text-slate-900">
                      <span>Total Amount</span>
                      <div className="text-right">
                        <span className="text-[#004a70] text-base font-family-semibold block">
                          ${totalXCD.toFixed(2)} XCD
                        </span>
                        <span className="text-[10.5px] text-slate-400 font-family-regular block">
                          ≈ ${totalUSD} USD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Card */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-1.5 text-slate-800 font-family-semibold">
                    <FaLocationDot size={13} className="text-[#004a70]" />
                    <span>{atLocation ? "Service Location (At Your Location)" : "Meeting Point"}</span>
                  </div>
                  <p className="text-slate-600 font-family-medium leading-relaxed !m-0 pl-5">
                    {booking?.location?.address || booking?.pickup?.address || snap?.meetingPoint?.address || snap?.address || "Independence Square, Basseterre, St Kitts & Nevis"}
                  </p>
                </div>

                {/* Special Note if any */}
                {booking?.note && (
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-1 text-xs text-slate-600 mb-4">
                    <span className="text-slate-800 font-family-semibold block">Special Instructions / Notes</span>
                    <p className="text-slate-600 font-family-medium leading-relaxed !m-0 italic">
                      "{booking.note}"
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  {serviceId && (
                    <Link
                      href={`/serviceDetails/${serviceId}`}
                      className="flex-1 py-2.5 rounded-xl bg-[#004a70] hover:bg-[#003957] text-white text-xs font-family-semibold text-center no-underline transition-all shadow-xs"
                    >
                      View Service Page
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedServiceBooking(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-family-semibold transition-all cursor-pointer border-none"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })(),
        document.body
      )}

      {/* ===== SHOP ORDER DETAILS MODAL (Matching Mobile ShopOrderDetails.js) ===== */}
      {mounted && typeof document !== "undefined" && selectedShopOrder && createPortal(
        (() => {
          const order = selectedShopOrder;
          const orderNum = order?.id || order?.order_id || order?._id?.slice(-8) || "N/A";
          const status = String(order?.status || "pending").toLowerCase();
          const dateFormatted = order?.createdAt ? moment(order.createdAt).format("MMMM DD, YYYY") : "";
          const timeFormatted = order?.createdAt ? moment(order.createdAt).format("hh:mm A") : "";
          const cartItems = order?.cart_items || [];
          
          const priceXCD = Number(order?.price || order?.total_price || 0);
          const serviceFee = Number(order?.serviceFee || 0);
          const convenienceFee = Number(order?.convenienceFee || 0);
          const catalogOff = Number(order?.catalogDiscount || 0);
          const specialDiscountAmt = Number(order?.specialDiscountAmount || 0);
          const priceUSD = (priceXCD / 2.7).toFixed(2);

          return (
            <div
              className="!fixed !inset-0 !z-[9999999] !flex !items-center !justify-center !p-4 !bg-black/75 !backdrop-blur-md !animate-fade-in"
              onClick={() => setSelectedShopOrder(null)}
            >
              <div
                className="relative w-full max-w-lg bg-white rounded-3xl !p-5 sm:!p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with Title and Close */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <span className="text-[10px] font-family-semibold tracking-widest text-[#004a70] uppercase block">
                      INVOICE
                    </span>
                    <h3 className="text-base sm:text-lg font-family-semibold text-slate-900 !m-0">
                      Order #{orderNum}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} />
                    <button
                      type="button"
                      onClick={() => setSelectedShopOrder(null)}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer border-none transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Order Date & Time Strip */}
                <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4">
                  <span className="font-family-medium">Placed on: {dateFormatted}</span>
                  {timeFormatted && <span className="font-family-medium">{timeFormatted}</span>}
                </div>

                {/* Ordered Items List */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-xs font-family-semibold uppercase tracking-wider text-slate-800 !m-0">
                    Order Items ({cartItems.length})
                  </h4>
                  <div className="divide-y divide-slate-100 bg-slate-50/60 rounded-2xl p-3 border border-slate-100 max-h-48 overflow-y-auto">
                    {cartItems.length > 0 ? (
                      cartItems.map((cItem, cIdx) => {
                        const itemPrice = Number(cItem?.location_price || cItem?.price || 0);
                        const itemQty = parseInt(cItem?.cartQuantity || cItem?.quantity || 1);
                        const itemTotal = itemPrice * itemQty;
                        const itemImg = cItem?.images?.[0] || cItem?.image || "/placeholder.jpg";

                        return (
                          <div key={cIdx} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                            <img
                              src={itemImg}
                              alt={cItem?.name || "Product"}
                              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200"
                            />
                            <div className="min-w-0 flex-1">
                              <h5 className="text-xs font-family-semibold text-slate-900 !m-0 truncate">
                                {cItem?.name || cItem?.title || "Product"}
                              </h5>
                              <span className="text-[11px] text-slate-400 font-family-regular block">
                                ${itemPrice.toFixed(2)} each
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-family-semibold text-[#004a70] block">
                                Qty: {itemQty}
                              </span>
                              <span className="text-xs font-family-semibold text-slate-800 block">
                                ${itemTotal.toFixed(2)} XCD
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 !m-0 py-2 text-center font-family-regular">
                        No item details available
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Location */}
                {order?.drop_location && (
                  <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 space-y-1 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-1.5 text-slate-800 font-family-semibold">
                      <FaLocationDot size={12} className="text-[#004a70]" />
                      <span>Delivery Location</span>
                    </div>
                    <p className="text-slate-600 font-family-medium leading-relaxed !m-0 pl-4">
                      {order.drop_location}
                    </p>
                  </div>
                )}

                {/* Price Breakdown / Summary */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs text-slate-600 mb-4">
                  <h5 className="text-xs font-family-semibold uppercase tracking-wider text-slate-800 !m-0 pb-1 border-b border-slate-200/80">
                    Payment Summary
                  </h5>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-family-semibold text-slate-800">
                      ${(priceXCD - serviceFee - convenienceFee + catalogOff).toFixed(2)} XCD
                    </span>
                  </div>
                  {catalogOff > 0 && (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Catalog Discount</span>
                      <span>-${catalogOff.toFixed(2)} XCD</span>
                    </div>
                  )}
                  {specialDiscountAmt > 0 && (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Special Discount</span>
                      <span>-${specialDiscountAmt.toFixed(2)} XCD</span>
                    </div>
                  )}
                  {serviceFee > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Service Fee</span>
                      <span className="font-family-semibold text-slate-800">${serviceFee.toFixed(2)} XCD</span>
                    </div>
                  )}
                  {convenienceFee > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Convenience Fee</span>
                      <span className="font-family-semibold text-slate-800">${convenienceFee.toFixed(2)} XCD</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-family-semibold text-slate-900">
                    <span>Total Amount Paid</span>
                    <div className="text-right">
                      <span className="text-[#004a70] text-base font-family-semibold block">
                        ${priceXCD.toFixed(2)} XCD
                      </span>
                      <span className="text-[10.5px] text-slate-400 font-family-regular block">
                        ≈ ${priceUSD} USD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Close Action */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedShopOrder(null)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-family-semibold transition-all cursor-pointer border-none"
                  >
                    Close Invoice
                  </button>
                </div>
              </div>
            </div>
          );
        })(),
        document.body
      )}
    </div>
  );
}

function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
      <Page />
    </Suspense>
  );
}

export default AdminPage;
