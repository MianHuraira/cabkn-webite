/* eslint-disable @next/next/no-img-element */

"use client";

import React, { useEffect, useState, useRef } from "react";
import moment from "moment/moment";
import { FaEye, FaStar, FaPlus } from "react-icons/fa";
import { Spinner } from "react-bootstrap";
import { FaLocationDot } from "react-icons/fa6";
import { MdOutlineMyLocation, MdOutlineCalendarMonth, MdPayment, MdOutlineBookOnline, MdListAlt, MdForwardToInbox, MdOutlineSchedule, MdCheckCircleOutline, MdDoneAll, MdHighlightOff } from "react-icons/md";
import { IoWallet } from "react-icons/io5";
import Image from "next/image";
import { tableMap } from "@/components/assets/Images";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import EmptyState from "@/components/EmptyState";
import { useRouter } from "next/navigation";
import { Button, message, Rate } from "antd";
import { X } from "react-feather";
import Modal from "react-bootstrap/Modal";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "@/components/ApiFunction/SoketProvider";
import { setPaymentCards, setUser } from "@/components/Redux/Slices/AuthSlice";
import axios from "axios";

const apiKey = "0FGR7.1720815360";
const apiSecret = "6EF4CAFCD82E689DECA28EDFDE15ADB35D12BF5982B182E468758A9F8DD072DF";
const tokenUrl = "https://jad.cash/HAPI/token";
const paymentUrl = "https://jad.cash/HAPI/cardpayment";

const StatusBadge = ({ status }) => {
  const statusColorMap = {
    completed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "!border-emerald-200" },
    cancelled: { bg: "bg-rose-50", text: "text-rose-700", border: "!border-rose-200" },
    accepted: { bg: "bg-blue-50", text: "text-blue-700", border: "!border-blue-200" },
    pending: { bg: "bg-amber-50", text: "text-amber-700", border: "!border-amber-200" },
    upcoming: { bg: "bg-purple-50", text: "text-purple-700", border: "!border-purple-200" },
    active: { bg: "bg-cyan-50", text: "text-cyan-700", border: "!border-cyan-200" },
  };

  const st = statusColorMap[(status || "").toLowerCase()] || { bg: "bg-slate-50", text: "text-slate-600", border: "!border-slate-200" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-family-semibold capitalize ${st.bg} ${st.text} !border ${st.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${st.text.replace("text-", "bg-")}`} />
      {status}
    </span>
  );
};

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
  useEffect(() => { setMounted(true); }, []);

  const contentRef = useRef(null);
  const [contentInView, setContentInView] = useState(false);
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setContentInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
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
        if (socket) {
          socket.emit("tip-order-customer", { orderId: TipOrderId, amount: tipAmount }, (socketRes) => {
            if (socketRes?.success) {
              setIsModalOpen(false);
              setTimeout(() => {
                setShow1(true);
              }, 500);
              message.success("Add Tip Successfully");
            }
          });
        }
      } else {
        message.success("Add Not Added");
      }
    } catch (error) {
      console.error(error);
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
    const tokenResponse = await getToken();
    if (tokenResponse.result !== "Success") {
      throw new Error(`Failed to obtain token: ${JSON.stringify(tokenResponse)}`);
    }

    const token = tokenResponse.data.token;
    const finalPrice = 10 * 2.7;

    const dateString = cardDetails?.expiry;
    const [month, year] = dateString.split("/");
    const paydata = {
      live: "1",
      timestamp: moment(new Date()).format("YYYYMMDDHHmmss"),
      refnum: "101",
      jadnumber: "101310573865",
      amount: finalPrice?.toFixed(2),
      cardnumber: cardDetails.number,
      cardexpmonth: month,
      cardexpyear: year,
      cardcvc: cardDetails.cvc,
      cardfirstname: "",
      cardlastname: "",
      address: "",
      city: "",
      state: "",
      postalcode: "",
      country: "",
      email: cardDetails?.email,
      phone: cardDetails?.phone,
    };

    try {
      const paymentResponse = await submitPayment(token, paydata);
      setloading(false);
      if (paymentResponse?.result === "Success") {
        if (paymentResponse?.refid) {
          ActivePayment(paymentResponse?.refid);
        }
      } else {
        message.error(paymentResponse?.message);
        setloading(false);
      }
    } catch (error) {
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
  const [ReFresh, setReFresh] = useState(true);
  const [CustomAmount, setCustomAmount] = useState(false);

  const handleChangeCustom = () => {
    setCustomAmount(true);
  };

  const [Price, setPrice] = useState("");
  const handleTabSelect = async (key) => {
    setActiveTab(key);
    setLastId(1); // Reset to first page when tab changes
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

      const endpoint = activeTab === "completed" || activeTab === "cancelled"
        ? `order/customer/${activeTab}/${lastId}`
        : activeTab === "upcoming" || activeTab === "active"
          ? `order/customer/accepted/${lastId}`
          : activeTab === "requested"
            ? `order/customer/pending/${lastId}`
            : `order/customer/${activeTab}/${lastId}`;

      const res = await postData(endpoint, body, header1);
      setCount(res?.count?.totalPage);

      if (isFirstPage) {
        setOrders(res?.orders);
      } else {
        setOrders(prevOrders => [...prevOrders, ...(res?.orders || [])]);
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
    const encodedData = encodeURIComponent(JSON.stringify(data));
    router.push(`/ridedetails?data=${encodedData}`);
  };

  useEffect(() => {
    // When activeTab changes, reset to first page and reload
    setLastId(1);
    getOrders();
  }, [activeTab]);

  const handlePay = async () => {
    try {
      setLoading(true);

      if (Number(tipAmount) > userDataStore?.amount) {
        message.error("Insufficient wallet balance");
        setLoading(false);
        return;
      }

      const body = {
        amount: tipAmount,
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
        if (socket) {
          socket.emit("tip-order-customer", { orderId: TipOrderId, amount: tipAmount }, (socketRes) => {
            if (socketRes?.success) {
              message.success("Tip added successfully");
              setIsModalOpen(false);
              setTimeout(() => {
                setShow1(true);
              }, 500);
            } else {
              message.error("Failed to process tip via socket");
            }
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      } else {
        message.error(res?.data?.message || "Payment failed");
        setLoading(false);
      }
    } catch (error) {
      console.log("======error", error?.response?.data?.message || error.message);
      message.error(error?.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  const tabs = [
    { key: "all", label: "All Bookings", icon: <MdListAlt size={18} /> },
    { key: "requested", label: "Requested", icon: <MdForwardToInbox size={18} /> },
    { key: "upcoming", label: "Upcoming", icon: <MdOutlineSchedule size={18} /> },
    { key: "accepted", label: "Accepted", icon: <MdCheckCircleOutline size={18} /> },
    { key: "completed", label: "Completed", icon: <MdDoneAll size={18} /> },
    { key: "cancelled", label: "Cancelled", icon: <MdHighlightOff size={18} /> },
  ];

  return (
    <div className={`min-h-screen bg-slate-50/50 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      {/* ===== HERO DASHBOARD HEADER ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 !pt-28 !pb-28">
        {/* High-tech Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }} />

        {/* Neon blurred blobs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: "12s" }} />

        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb row */}
          <div className="flex items-center gap-2 text-slate-400 text-xs font-family-medium !mb-4">
            <a href="/" className="text-slate-400 hover:text-white transition-colors">
              Home
            </a>
            <span className="text-slate-500">/</span>
            <span className="text-slate-200">My Bookings</span>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                <MdOutlineBookOnline size={26} className="text-white" />
              </div>
              <div>
                <h1 className="text-white text-3xl font-family-bold tracking-tight !m-0 leading-tight">
                  My Bookings
                </h1>
                <p className="text-slate-400 text-sm !mt-1 !m-0 font-family-regular">
                  Manage and track your Nevis & Saint Kitts transfers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md !border !border-white/10 rounded-2xl px-4 py-2 text-xs font-family-semibold text-white shadow-sm select-none">
              <MdOutlineCalendarMonth size={16} className="text-amber-400" />
              <span>
                {Orders?.length || 0} Booking{Orders?.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TABS & MAIN CONTENT GRID ===== */}
      <div ref={contentRef} className="!-mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 !pb-20">
        <div className="bg-white rounded-3xl !border !border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">

          {/* Tabs bar */}
          <div className="px-6 py-4 !border-b !border-slate-100 overflow-x-auto bg-slate-50/50">
            <div className="flex gap-2 min-w-max pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabSelect(tab.key)}
                  className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-family-semibold transition-all duration-350 cursor-pointer !border-none ${activeTab === tab.key
                      ? "bg-brand-900 text-white shadow-md shadow-brand-900/10 scale-105"
                      : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                >
                  <span className={activeTab === tab.key ? "opacity-100" : "opacity-80"}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center !mb-6">
              <h3 className="text-base font-family-bold text-slate-900 !m-0">
                {activeTab === "all" ? "All" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Records
              </h3>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center !py-20">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full !border-2 !border-slate-100" />
                  <div className="absolute inset-0 rounded-full !border-2 !border-brand-900 !border-t-transparent animate-spin" />
                </div>
                <p className="!mt-4 text-sm font-family-semibold text-slate-400">Loading bookings...</p>
              </div>
            ) : Orders?.length === 0 ? (
              <div className="flex flex-col items-center text-center !py-12 bg-slate-50/40 rounded-3xl !border !border-slate-100/80 max-w-md mx-auto !my-2">
                <div className="w-12 h-12 rounded-2xl bg-white text-brand-600 flex items-center justify-center !mb-4 shadow-sm !border !border-slate-100 flex-shrink-0">
                  <MdOutlineBookOnline size={22} />
                </div>
                <h4 className="text-sm font-family-semibold text-slate-800 !m-0 capitalize">
                  No {activeTab === "all" ? "" : activeTab} bookings found
                </h4>
                <p className="text-xs text-slate-400 !m-0 !mt-1.5 leading-relaxed max-w-[280px] font-family-regular">
                  We couldn't find any data matching this category in your account.
                </p>
              </div>
            ) : (
              <>
                {/* Bookings Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 !mb-8">
                  {Orders?.map((order, index) => (
                    <div
                      key={`${order?._id}-${index}`}
                      className="group bg-white rounded-3xl !border !border-slate-100 p-6 hover:shadow-[0_20px_50px_rgba(0,74,112,0.06)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between min-h-[380px] relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start !mb-5">
                        <StatusBadge status={order?.status} />
                        <div className="text-right">
                          <p className="text-2xl font-family-bold text-emerald-600 !m-0 leading-none">
                            ${order?.price || 0}
                          </p>
                          <p className="text-[11px] text-slate-400 !mt-2 leading-none font-family-regular">
                            {moment(order?.createdAt).format("DD MMM YYYY")} • {moment(order?.createdAt).format("hh:mm A")}
                          </p>
                        </div>
                      </div>

                      {/* Timeline addresses row */}
                      <div className="flex gap-3.5 !mb-5 flex-grow">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 !border !border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center shadow-inner">
                          <Image
                            alt="trip-map"
                            width={56}
                            height={56}
                            src={tableMap}
                            className="object-cover w-full h-full"
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          {/* Pickup */}
                          <div className="flex gap-2 items-start">
                            <div className="w-5 h-5 rounded-full bg-brand-50 text-brand-650 flex items-center justify-center shrink-0 shadow-inner">
                              <FaLocationDot size={10} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-family-bold text-slate-800 truncate !m-0 leading-none">
                                {order?.start_address || "Pickup point"}
                              </p>
                            </div>
                          </div>

                          {/* Connector vertical dashed line */}
                          <div className="w-0.5 h-5 bg-slate-100 !ml-2.5 !my-1 border-l border-dashed border-slate-300" />

                          {/* Dropoff */}
                          <div className="flex gap-2 items-start">
                            <div className="w-5 h-5 rounded-lg bg-brand-50 text-brand-650 flex items-center justify-center shrink-0 shadow-inner">
                              <MdOutlineMyLocation size={10} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-family-medium text-slate-500 truncate !m-0 leading-none">
                                {order?.end_address || "Dropoff point"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Driver Partner Box */}
                      {order?.to_id && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50/70 !border !border-slate-100 rounded-2xl !mb-5">
                          <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 !border-2 !border-white shadow-sm">
                            <img
                              alt="driver-avatar"
                              width={44}
                              height={44}
                              src={order?.to_id?.image || "/placeholder.jpg"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-family-semibold text-slate-900 !m-0 leading-tight truncate">
                              {order?.to_id?.name || "Driver"}
                            </p>
                            <p className="text-[11px] text-slate-400 !m-0 mt-0.5 leading-none truncate">
                              {order?.to_id?.email || ""}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Card Buttons */}
                      <div className="flex gap-2.5 !mt-auto">
                        <Button
                          disabled={order?.tip === 1}
                          onClick={() => { openModal(true); setTipOrderId(order?._id); }}
                          className={`flex-grow h-11 rounded-xl font-family-semibold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 ${order?.tip === 1
                              ? "bg-slate-100 text-slate-400 !border !border-slate-200 cursor-not-allowed shadow-none"
                              : "bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white shadow-md shadow-brand-600/10 hover:-translate-y-0.5 active:translate-y-0 !border-none"
                            }`}
                        >
                          <FaPlus size={12} />
                          {order?.tip === 1 ? "Tipped" : "Add Tip"}
                        </Button>

                        <button
                          onClick={() => gotoDetails(order)}
                          title="View Details"
                          className="w-11 h-11 rounded-xl !border !border-slate-200 bg-white text-slate-550 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center shrink-0 shadow-sm transition-all duration-350"
                        >
                          <FaEye size={16} />
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
                      className="px-7 py-3 rounded-full !border-2 !border-brand-600 bg-white text-brand-600 hover:bg-brand-600 hover:text-white font-family-semibold text-sm transition-all duration-300 flex items-center gap-2"
                    >
                      {seeMoreLoading ? (
                        <Spinner animation="border" role="status" style={{ width: 16, height: 16 }} />
                      ) : (
                        <>See More</>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== TIP MODAL ===== */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-[420px] relative overflow-hidden !border !border-slate-100 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
            style={{ animationDelay: "50ms" }}
          >
            <div className="bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 p-7 text-center relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all !border-none cursor-pointer"
              >
                <X size={18} />
              </button>
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto !mb-4 shadow-inner">
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-family-bold !m-0">
                Add a Tip
              </h3>
              <p className="text-slate-400 text-xs mt-1.5 !m-0 font-family-regular">
                Show appreciation for great service
              </p>
            </div>

            <div className="p-6 md:p-8">
              {CustomAmount && (
                <div className="!mb-5">
                  <label className="text-xs text-slate-700 block !mb-2 font-family-semibold">
                    Enter Amount
                  </label>
                  <input
                    className="w-full px-4 py-3 !border-2 !border-slate-100 rounded-xl text-sm font-family-medium text-slate-900 focus:!border-brand-600 outline-none transition-all duration-200 bg-slate-50/50"
                    type="text"
                    name="price"
                    placeholder="Enter amount"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    maxLength="16"
                    required
                  />
                </div>
              )}

              {!CustomAmount && (
                <>
                  <p className="text-xs text-slate-400 !mb-3 font-family-semibold uppercase tracking-wider">
                    Quick Select
                  </p>
                  <div className="grid grid-cols-5 gap-2 !mb-4">
                    {["1", "2", "5", "10", "20"].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleTipSelection(amount)}
                        className={`py-2.5 rounded-xl !border font-family-semibold text-sm cursor-pointer transition-all duration-200 text-center ${tipAmount === amount
                            ? "!border-brand-600 bg-brand-50 text-brand-600"
                            : "!border-slate-200 text-slate-500 bg-white hover:!border-brand-600"
                          }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleChangeCustom}
                    className="bg-transparent !border-none text-brand-600 hover:text-brand-700 font-family-semibold text-xs cursor-pointer py-2 block w-full text-center transition-colors font-family-semibold"
                  >
                    Enter other amount
                  </button>
                </>
              )}

              <div className="!mt-6 flex flex-col gap-2.5">
                <button
                  onClick={() => { setShow(true); setIsModalOpen(false); }}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-family-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-brand-600/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 !border-none cursor-pointer"
                >
                  <MdPayment size={18} />
                  Pay with Card
                </button>
                <button
                  onClick={handlePay}
                  className="w-full h-12 rounded-xl !border-2 !border-slate-100 bg-white text-slate-800 hover:bg-slate-50 font-family-semibold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
                >
                  {Loading ? (
                    <Spinner animation="border" role="status" style={{ width: 18, height: 18 }} />
                  ) : (
                    <><IoWallet size={18} /> Pay with Wallet</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CARD PAYMENT MODAL ===== */}
      <Modal centered size="lg" show={show} onHide={handleClose}>
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-slate-50/50 p-6 !border-b !border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-family-bold text-slate-900 !m-0 flex items-center gap-2">
              <MdPayment size={20} className="text-slate-700" />
              Payment Details
            </h3>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg !border !border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center color-slate-400 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 md:p-8">
            {paymentCards?.length ? (
              <div className="!mb-6">
                <p className="text-sm font-family-bold text-slate-900 !mb-3">
                  Saved Cards
                </p>
                <div className="flex flex-col gap-2.5">
                  {paymentCards?.map((item, i) => (
                    <div
                      onClick={() => onSelectCard(item)}
                      key={i}
                      className="p-4 rounded-xl !border !border-slate-150 bg-white hover:!border-brand-600 cursor-pointer flex justify-between items-center transition-all"
                    >
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider !m-0 leading-none">Email</p>
                        <p className="text-sm text-slate-800 font-family-semibold !mt-1.5 !m-0">{item?.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider !m-0 leading-none">Card</p>
                        <p className="text-sm text-slate-850 font-family-bold !mt-1.5 !m-0">
                          •••• {item?.cardnumber?.slice(-4) || item?.cardnumber}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <p className="text-sm font-family-bold text-slate-900 !mb-4">
              {paymentCards?.length ? "Add New Card" : "Card Information"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="flex justify-center">
                <Cards
                  cvc={cardDetails.cvc}
                  expiry={cardDetails.expiry}
                  name={cardDetails.name}
                  number={cardDetails.number}
                />
              </div>
              <div className="flex flex-col gap-3">
                <input
                  className="px-4 py-3 !border-2 !border-slate-100 rounded-xl text-sm outline-none focus:!border-brand-600 transition-all bg-slate-50/50"
                  type="text"
                  name="number"
                  placeholder="Card Number"
                  value={cardDetails.number}
                  onChange={handleInputChange}
                  maxLength="16"
                  required
                />
                <input
                  className="px-4 py-3 !border-2 !border-slate-100 rounded-xl text-sm outline-none focus:!border-brand-600 transition-all bg-slate-50/50"
                  type="text"
                  name="name"
                  placeholder="Cardholder Name"
                  value={cardDetails.name}
                  onChange={handleInputChange}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="px-4 py-3 !border-2 !border-slate-100 rounded-xl text-sm outline-none focus:!border-brand-600 transition-all bg-slate-50/50"
                    type="text"
                    name="expiry"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={handleInputChange}
                    maxLength="5"
                    required
                  />
                  <input
                    className="px-4 py-3 !border-2 !border-slate-100 rounded-xl text-sm outline-none focus:!border-brand-600 transition-all bg-slate-50/50"
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
                  className="px-4 py-3 !border-2 !border-slate-100 rounded-xl text-sm outline-none focus:!border-brand-600 transition-all bg-slate-50/50"
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={cardDetails.email}
                  onChange={handleInputChange}
                  required
                />
                <input
                  className="px-4 py-3 !border-2 !border-slate-100 rounded-xl text-sm outline-none focus:!border-brand-600 transition-all bg-slate-50/50"
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={cardDetails.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="!mt-6">
              <button
                onClick={jadAPiFunction}
                disabled={!areAllFieldsFilled()}
                className={`w-full h-12 rounded-xl text-sm font-family-semibold flex items-center justify-center gap-2 transition-all duration-300 ${areAllFieldsFilled()
                    ? "bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white hover:shadow-lg hover:shadow-brand-600/10 hover:-translate-y-0.5 active:translate-y-0 !border-none cursor-pointer"
                    : "bg-slate-100 text-slate-400 !border !border-slate-200 cursor-not-allowed shadow-none"
                  }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner animation="border" role="status" style={{ width: 18, height: 18 }} />
                    <span>Processing...</span>
                  </div>
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
          <div className="bg-white rounded-3xl text-center p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto !mb-5 shadow-inner">
              <MdDoneAll size={40} />
            </div>
            <h2 className="text-2xl font-family-bold text-slate-900 !mb-2">
              Tip Added!
            </h2>
            <p className="text-sm text-slate-500 font-family-regular !m-0">
              Your driver tip has been processed successfully.
            </p>
            <button
              onClick={() => setShow1(false)}
              className="!mt-6 w-full h-11 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-family-semibold text-sm transition-all duration-200 !border-none cursor-pointer"
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
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-slate-50/50 p-6 !border-b !border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-family-bold text-slate-900 !m-0">
                Leave a Review
              </h3>
              <button
                onClick={() => setReviewModal(false)}
                className="w-8 h-8 rounded-lg !border !border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center color-slate-400 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center !mb-5">
                <Rate
                  value={reviewRating}
                  onChange={setReviewRating}
                  style={{ fontSize: 32 }}
                />
              </div>
              <textarea
                className="w-full min-h-[120px] p-4 !border-2 !border-slate-100 rounded-2xl text-sm outline-none resize-none focus:!border-brand-600 transition-all duration-200 bg-slate-50/50"
                placeholder="Write your review here..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <div className="!mt-5 flex gap-3">
                <button
                  onClick={() => setReviewModal(false)}
                  className="flex-grow h-11 rounded-xl !border-2 !border-slate-150 bg-white text-slate-500 font-family-semibold text-sm hover:bg-slate-50 transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  className="flex-grow h-11 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-family-semibold text-sm transition-all duration-200 !border-none cursor-pointer"
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
