/* eslint-disable @next/next/no-img-element */

"use client";

import React, { useEffect, useState, useRef } from "react";
import moment from "moment/moment";
import { FaEye, FaStar, FaPlus } from "react-icons/fa";
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
import { useRouter } from "next/navigation";
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

const apiKey = "0FGR7.1720815360";
const apiSecret = "6EF4CAFCD82E689DECA28EDFDE15ADB35D12BF5982B182E468758A9F8DD072DF";
const tokenUrl = "https://jad.cash/HAPI/token";
const paymentUrl = "https://jad.cash/HAPI/cardpayment";

// Status Badge with pulsing dot
const StatusBadge = ({ status }) => {
  const statusColorMap = {
    completed: { bg: "bg-emerald-50 text-emerald-700 !border-emerald-200/80", dot: "bg-emerald-500" },
    cancelled: { bg: "bg-rose-50 text-rose-700 !border-rose-200/80", dot: "bg-rose-500" },
    accepted: { bg: "bg-sky-50 text-sky-700 !border-sky-200/80", dot: "bg-sky-500" },
    pending: { bg: "bg-amber-50 text-amber-700 !border-amber-200/80", dot: "bg-amber-500" },
    upcoming: { bg: "bg-purple-50 text-purple-700 !border-purple-200/80", dot: "bg-purple-500" },
    active: { bg: "bg-teal-50 text-teal-700 !border-teal-200/80", dot: "bg-teal-500" },
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

  const [lastId, setLastId] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
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
        jadnumber: "101310573865",
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
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

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

  const fetchOrders = async ({ isFirstPage = false }) => {
    try {
      const body = {
        bookingtype: activeTab === "upcoming" ? "schedule" : "live",
      };

      const endpoint =
        activeTab === "completed" || activeTab === "cancelled"
          ? `order/customer/${activeTab}/${lastId}`
          : activeTab === "upcoming" || activeTab === "active"
            ? `order/customer/accepted/${lastId}`
            : activeTab === "requested"
              ? `order/customer/pending/${lastId}`
              : `order/customer/${activeTab}/${lastId}`;

      const res = await postData(endpoint, body, header1);
      setCount(res?.count?.totalPage);

      if (isFirstPage) {
        setOrders(res?.orders || []);
      } else {
        setOrders((prevOrders) => [...prevOrders, ...(res?.orders || [])]);
      }
    } catch (error) {
      console.log(error);
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
  }, [activeTab]);

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

          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 !border !border-white/15">
                <MdOutlineBookOnline size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-family-semibold text-white tracking-tight !m-0 leading-tight">
                  My Bookings
                </h1>
                <p className="text-slate-300 text-xs !mt-0.5 !m-0 font-family-regular">
                  Manage and track your Nevis & Saint Kitts transfers
                </p>
              </div>
            </div>

            
          </div>
        </div>
      </section>

      {/* ===== 2. TABS & MAIN CONTENT GRID ===== */}
      <div className="!-mt-12 sm:!-mt-14 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-20 !pb-16">
        {/* Swiper Tabs */}
        <div className="w-full max-w-full overflow-hidden !mb-8">
          <Swiper
            modules={[FreeMode, Mousewheel]}
            slidesPerView="auto"
            spaceBetween={10}
            freeMode={true}
            mousewheel={{ forceToAxis: true }}
            className="w-full py-1 category-swiper"
          >
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.key;
              return (
                <SwiperSlide key={tab.key} style={{ width: "auto" }}>
                  <button
                    onClick={() => handleTabSelect(tab.key)}
                    className={`cursor-pointer transition-all duration-300 select-none flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-family-semibold whitespace-nowrap !border shadow-none ${isSelected
                        ? "text-white bg-[#004a70] !border-[#004a70]"
                        : "text-slate-700 bg-white !border-slate-200/90 hover:!border-[#004a70] hover:bg-slate-50 hover:text-[#004a70]"
                      }`}
                  >
                    <span className={isSelected ? "opacity-100" : "opacity-75"}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        <div>
          <div className="flex justify-between items-center !mb-4 px-1">
            <h3 className="text-base sm:text-lg font-family-semibold text-slate-900 !m-0">
              {activeTab === "all" ? "All" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Records
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
                No {activeTab === "all" ? "" : activeTab} bookings found
              </h4>
              <p className="text-xs text-slate-400 !m-0 !mt-1 leading-relaxed max-w-sm font-family-regular">
                We couldn't find any data matching this category in your account.
              </p>
            </div>
          ) : (
            <>
              {/* Bookings Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 !mb-8">
                {Orders?.map((order, index) => (
                  <div
                    key={`${order?._id}-${index}`}
                    className="group bg-white rounded-2xl !border !border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Top Row: Status + Price */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={order?.status} />
                        {order?.order_id && (
                          <span className="text-[10.5px] font-family-medium text-slate-400 pl-0.5">
                            #{order.order_id}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-lg sm:text-xl font-family-semibold text-emerald-600 block leading-tight">
                          ${Number(order?.price || 0).toFixed(2)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-family-regular block mt-0.5">
                          {moment(order?.createdAt).format("DD MMM YYYY • hh:mm A")}
                        </span>
                      </div>
                    </div>

                    {/* Route Itinerary Strip */}
                    <div className="bg-slate-50/70 p-2.5 rounded-xl !border !border-slate-100 space-y-2 mb-3 flex-grow">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <FaLocationDot size={8} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9.5px] font-family-semibold uppercase tracking-wider text-emerald-600 block leading-tight">
                            Pickup
                          </span>
                          <p className="text-xs font-family-medium text-slate-800 !m-0 leading-snug truncate">
                            {order?.start_address || "Nevis Island"}
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
                          <p className="text-xs font-family-medium text-slate-800 !m-0 leading-snug truncate">
                            {order?.end_address || "Saint Kitts"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Driver Section */}
                    {order?.to_id ? (
                      <div className="flex items-center justify-between gap-2.5 p-2 bg-slate-50/80 !border !border-slate-100 rounded-xl mb-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 !border !border-slate-200 bg-slate-100">
                            <img
                              alt=""
                              width={32}
                              height={32}
                              src={order?.to_id?.image || "/placeholder.jpg"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-family-semibold text-slate-900 !m-0 truncate">
                              {order?.to_id?.name || "Assigned Driver"}
                            </h4>
                            <p className="text-[10.5px] text-slate-400 font-family-regular !m-0 truncate">
                              {order?.to_id?.email || "driver@cabkn.com"}
                            </p>
                          </div>
                        </div>
                        {order?.to_id?.rating && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-family-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded !border !border-amber-200/50 shrink-0">
                            <FaStar size={8} className="text-amber-500" />
                            {order?.to_id?.rating}.0
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="p-2 bg-slate-50/50 !border !border-slate-100 rounded-xl mb-3 text-center">
                        <p className="text-[11px] text-slate-400 font-family-regular !m-0">
                          Driver not assigned yet
                        </p>
                      </div>
                    )}

                    {/* Card Action Buttons */}
                    <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 !mt-auto">
                      <button
                        onClick={() => gotoDetails(order)}
                        className="flex-1 h-9 sm:h-10 rounded-xl bg-[#004a70] hover:bg-[#003957] text-white text-xs font-family-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer !border-none shadow-xs active:scale-[0.99]"
                      >
                        <FaEye size={13} />
                        <span>View Details</span>
                      </button>

                      <button
                        disabled={order?.tip === 1}
                        onClick={() => { openModal(true); setTipOrderId(order?._id); }}
                        className={`h-9 sm:h-10 px-3.5 rounded-xl text-xs font-family-medium transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] ${order?.tip === 1
                            ? "bg-slate-100 text-slate-400 !border !border-slate-200 cursor-not-allowed"
                            : "bg-white hover:bg-slate-50 text-slate-700 !border !border-slate-200 hover:!border-[#004a70] shadow-xs"
                          }`}
                      >
                        <FaPlus size={11} className={order?.tip === 1 ? "text-slate-400" : "text-[#004a70]"} />
                        <span>{order?.tip === 1 ? "Tipped" : "Tip"}</span>
                      </button>
                    </div>
                  </div>
                ))}
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

      {/* ===== TIP MODAL ===== */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] relative overflow-hidden !border !border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-[#001726] via-[#002f4a] to-[#001f33] p-5 text-center relative text-white">
              <button
                onClick={closeModal}
                className="absolute top-3.5 right-3.5 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all !border-none cursor-pointer"
              >
                <X size={15} />
              </button>
              <h3 className="text-white text-base font-family-semibold !m-0">
                Add a Tip
              </h3>
              <p className="text-slate-300 text-xs mt-1 !m-0 font-family-regular">
                Show appreciation for great service
              </p>
            </div>

            <div className="p-5">
              {CustomAmount ? (
                <div className="!mb-4">
                  <label className="text-xs text-slate-700 block !mb-1.5 font-family-medium">
                    Enter Amount ($)
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 !border !border-slate-200 rounded-xl text-sm font-family-medium text-slate-900 focus:!border-[#004a70] outline-none transition-colors bg-slate-50/50"
                    type="text"
                    name="price"
                    placeholder="Enter amount"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    maxLength="16"
                    required
                  />
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-400 !mb-2.5 font-family-medium uppercase tracking-wider">
                    Quick Select
                  </p>
                  <div className="grid grid-cols-5 gap-2 !mb-3">
                    {["1", "2", "5", "10", "20"].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleTipSelection(amount)}
                        className={`py-2 rounded-xl !border font-family-semibold text-xs cursor-pointer transition-all text-center ${tipAmount === amount
                            ? "!border-[#004a70] bg-[#004a70]/10 text-[#004a70]"
                            : "!border-slate-200 text-slate-600 bg-white hover:!border-[#004a70]"
                          }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleChangeCustom}
                    className="bg-transparent !border-none text-[#004a70] hover:underline font-family-medium text-xs cursor-pointer py-1 block w-full text-center"
                  >
                    Enter other amount
                  </button>
                </>
              )}

              <div className="!mt-5 flex flex-col gap-2">
                <button
                  onClick={() => { setShow(true); setIsModalOpen(false); }}
                  className="w-full h-10 rounded-xl bg-[#004a70] hover:bg-[#003957] text-white font-family-semibold text-xs flex items-center justify-center gap-1.5 transition-colors !border-none cursor-pointer"
                >
                  <MdPayment size={16} />
                  Pay with Card
                </button>
                <button
                  onClick={handlePay}
                  className="w-full h-10 rounded-xl !border !border-slate-200 bg-white text-slate-800 hover:bg-slate-50 font-family-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {Loading ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><IoWallet size={16} /> Pay with Wallet</>
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
            <div className="bg-slate-50 p-4 !border-b !border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-family-semibold text-slate-900 !m-0">
                Leave a Review
              </h3>
              <button
                onClick={() => setReviewModal(false)}
                className="w-7 h-7 rounded-lg !border !border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-5">
              <div className="text-center !mb-4">
                <Rate
                  value={reviewRating}
                  onChange={setReviewRating}
                  style={{ fontSize: 26 }}
                />
              </div>
              <textarea
                className="w-full min-h-[100px] p-3 !border !border-slate-200 rounded-xl text-xs outline-none resize-none focus:!border-[#004a70] transition-colors bg-slate-50/50"
                placeholder="Write your review here..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <div className="!mt-4 flex gap-2.5">
                <button
                  onClick={() => setReviewModal(false)}
                  className="flex-grow h-9 rounded-xl !border !border-slate-200 bg-white text-slate-600 font-family-medium text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  className="flex-grow h-9 rounded-xl bg-[#004a70] hover:bg-[#003957] text-white font-family-semibold text-xs transition-colors !border-none cursor-pointer"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Page;
