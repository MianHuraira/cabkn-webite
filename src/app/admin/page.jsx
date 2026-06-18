/* eslint-disable @next/next/no-img-element */

"use client";

import React, { useEffect, useState, useRef } from "react";
import moment from "moment/moment";
import { FaEye, FaStar } from "react-icons/fa";
import { Spinner } from "react-bootstrap";
import { FaLocationDot } from "react-icons/fa6";
import { MdOutlineMyLocation, MdOutlineCalendarMonth } from "react-icons/md";
import { IoWallet } from "react-icons/io5";
import { MdPayment, MdOutlineBookOnline, MdListAlt, MdForwardToInbox, MdOutlineSchedule, MdCheckCircleOutline, MdDoneAll, MdHighlightOff } from "react-icons/md";
import Image from "next/image";
import { tableMap } from "@/components/assets/Images";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import ProductTable from "@/components/dataTable/productTable";
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
const apiSecret =
  "6EF4CAFCD82E689DECA28EDFDE15ADB35D12BF5982B182E468758A9F8DD072DF";
const tokenUrl = "https://jad.cash/HAPI/token";
const paymentUrl = "https://jad.cash/HAPI/cardpayment";
function Page() {
  const router = useRouter();
  const socket = useSocket();

  const [lastId, setLastId] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
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
      ([entry]) => { if (entry.isIntersecting) { setContentInView(true); observer.disconnect(); } },
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
          socket.emit("tip-order-customer", data, (data) => {
            if (data?.success) {
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
      console.log(res?.data?.response?.message, "error");
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

      // if (isSavedCard) {
      dispatch(setPaymentCards(paydata));
      // }

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
      throw new Error(
        `Failed to obtain token: ${JSON.stringify(tokenResponse)}`
      );
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
      cardcvv: cardDetails.cvc,
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
      if (paymentResponse?.result == "Success") {
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

  const handleChatDriver = (order) => {
    if (order?.to_id?._id) {
      router.push(`/chat?userId=${order.to_id._id}`);
    } else {
      message.info("Driver information not available");
    }
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

  const getOrders = async () => {
    setIsLoading(true);
    try {
      const body = {
        bookingtype: activeTab == "upcoming" ? "schedule" : "live",
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
      setOrders(res?.orders);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const gotoDetails = (data) => {
    const encodedData = encodeURIComponent(JSON.stringify(data));
    router.push(`/ridedetails?data=${encodedData}`);
  };

  useEffect(() => {
    getOrders();
  }, [activeTab, lastId]);

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
          const data = {
            orderId: TipOrderId,
            amount: tipAmount,
          };
          socket.emit("tip-order-customer", data, (socketRes) => {
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
      console.log(
        "======error",
        error?.response?.data?.message || error.message
      );
      message.error(error?.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  const statusColorMap = {
    completed: { bg: "#e8f5e9", text: "#2e7d32" },
    cancelled: { bg: "#fbe9e7", text: "#c62828" },
    accepted: { bg: "#e3f2fd", text: "#1565c0" },
    pending: { bg: "#fff3e0", text: "#e65100" },
    upcoming: { bg: "#f3e5f5", text: "#7b1fa2" },
    active: { bg: "#e0f7fa", text: "#00695c" },
  };

  const getStatusStyle = (status) => {
    const s = (status || "").toLowerCase();
    return statusColorMap[s] || { bg: "#f5f5f5", text: "#616161" };
  };

  const columns = [
    {
      name: "#",
      width: "50px",
      selector: (row, index) => (
        <span className="medium-font" style={{ color: "#9ca3af", fontSize: 13 }}>
          {String(index + 1).padStart(2, "0")}
        </span>
      ),
    },
    {
      name: "Ride Details",
      minWidth: "320px",
      cell: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Image
              alt=""
              width={64}
              height={64}
              src={tableMap}
              style={{
                objectFit: "cover",
                borderRadius: 12,
                border: "1px solid #f0f0f0",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, paddingTop: 2 }}>
              <FaLocationDot color="#004a70" size={14} />
              <div style={{ width: 1.5, height: 28, background: "#d1d5db" }} />
              <MdOutlineMyLocation color="#004a70" size={14} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, color: "#374151", margin: 0, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {row?.start_address}
              </p>
              <p style={{ fontSize: 12, color: "#6b7280", margin: "12px 0 0", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {row?.end_address}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "Pincode",
      width: "100px",
      selector: (row) => (
        <span className="medium-font" style={{ fontSize: 13, color: "#374151" }}>{row?.pincode}</span>
      ),
    },
    {
      name: "Driver",
      minWidth: "240px",
      cell: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, overflow: "hidden", flexShrink: 0, border: "1px solid #f0f0f0" }}>
            <img
              alt=""
              width={42}
              height={42}
              src={row?.to_id?.image || "/placeholder.jpg"}
              style={{ width: 42, height: 42, objectFit: "cover" }}
            />
          </div>
          <div>
            <p className="medium-font" style={{ fontSize: 13, color: "#1f2937", margin: 0 }}>{row?.to_id?.name || "N/A"}</p>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>{row?.to_id?.email || ""}</p>
          </div>
        </div>
      ),
    },
    {
      name: "Date & Time",
      width: "140px",
      selector: (row) => (
        <div>
          <p className="medium-font" style={{ fontSize: 13, color: "#374151", margin: 0 }}>
            {moment(row?.createdAt).format("DD MMM, YYYY")}
          </p>
          <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>
            {moment(row?.createdAt).format("hh:mm A")}
          </p>
        </div>
      ),
    },
    {
      name: "Fare",
      width: "100px",
      selector: (row) => (
        <span className="bold-font" style={{ fontSize: 14, color: "#059669" }}>
          ${row?.price || 0}
        </span>
      ),
    },
    {
      name: "Status",
      width: "130px",
      selector: (row) => {
        const st = getStatusStyle(row?.status);
        return (
          <div
            style={{
              padding: "4px 14px",
              fontSize: 12,
              fontFamily: "Inter-Medium",
              borderRadius: 20,
              background: st.bg,
              color: st.text,
              textTransform: "capitalize",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.text, display: "inline-block" }} />
            {row.status}
          </div>
        );
      },
    },
    {
      name: "Add Tip",
      width: "110px",
      cell: (row) => (
        <Button
          disabled={row?.tip === 1}
          onClick={() => { openModal(true); setTipOrderId(row?._id); }}
          className={row?.tip !== 1 ? "hover:bg-brand-700 hover:text-white" : ""}
          style={{
            height: 34,
            fontSize: 12,
            fontFamily: "Inter-Medium",
            borderRadius: 8,
            border: row?.tip === 1 ? "1px solid #e5e7eb" : "1px solid #004a70",
            background: row?.tip === 1 ? "#f9fafb" : "transparent",
            color: row?.tip === 1 ? "#d1d5db" : "#004a70",
            padding: "0 16px",
            cursor: row?.tip === 1 ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2v20M2 12h20" /></svg>
          {row?.tip === 1 ? "Tipped" : "Tip"}
        </Button>
      ),
    },
    {
      name: "",
      width: "60px",
      cell: (row) => (
        <button
          onClick={() => gotoDetails(row)}
          title="View Details"
          className="hover:bg-indigo-50 hover:text-brand-700 hover:border-brand-700"
          style={{
            width: 32, height: 32,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#6b7280",
            transition: "all 0.2s",
          }}
        >
          <FaEye size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className={mounted ? "animate-fade-in" : "opacity-0"}>
      {/* Header - matching notifications pattern */}
      <div
        className={`bg-gradient-to-br from-brand-800 to-brand-950 ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
        style={{ padding: "28px 0 44px", position: "relative", animationDelay: "50ms" }}
      >
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>
              Home
            </a>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>My Bookings</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 2vw, 16px)" }}>
              <div style={{
                width: "clamp(40px, 6vw, 52px)", height: "clamp(40px, 6vw, 52px)",
                borderRadius: "clamp(12px, 2vw, 16px)", background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <MdOutlineBookOnline size="clamp(20px, 3vw, 26px)" color="#fff" />
              </div>
              <div>
                <h1 style={{ color: "#fff", fontSize: "clamp(20px, 5vw, 30px)", fontWeight: 700, margin: 0, letterSpacing: "-0.5px", lineHeight: 1.2, wordBreak: "break-word" }}>
                  My Bookings
                </h1>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(12px, 2vw, 14px)", margin: "2px 0 0", fontWeight: 400, wordBreak: "break-word" }}>
                  {Orders?.length || 0} booking{Orders?.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)",
              borderRadius: 12, padding: "6px 14px",
              border: "1px solid rgba(255,255,255,0.06)", height: 36,
            }}>
              <MdOutlineCalendarMonth size={14} color="#fbbf24" />
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>
                {Orders?.length || 0} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Separate from Table */}
      <div ref={contentRef} style={{ maxWidth: 1320, margin: "-24px auto 0", padding: "0 16px 48px" }}>
        <div className={`reveal ${contentInView ? "visible" : ""}`} style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
        }}>
          {/* Tab Bar */}
          <div style={{
            padding: "16px 20px 0",
            borderBottom: "1px solid #f1f5f9",
            overflowX: "auto",
          }}>
            <div style={{ display: "flex", gap: 8, minWidth: "max-content", paddingBottom: "2px" }}>
              {[
                { key: "all", label: "All Bookings", icon: <MdListAlt size={18} /> },
                { key: "requested", label: "Requested", icon: <MdForwardToInbox size={18} /> },
                { key: "upcoming", label: "Upcoming", icon: <MdOutlineSchedule size={18} /> },
                { key: "accepted", label: "Accepted", icon: <MdCheckCircleOutline size={18} /> },
                { key: "completed", label: "Completed", icon: <MdDoneAll size={18} /> },
                { key: "cancelled", label: "Cancelled", icon: <MdHighlightOff size={18} /> },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabSelect(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-medium text-[14px] transition-all duration-300 border-b-2 ${activeTab === tab.key
                    ? "text-brand-700 bg-brand-50/50 border-brand-700"
                    : "text-slate-500 border-transparent hover:text-brand-600 hover:bg-slate-50"
                    }`}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <span className={`${activeTab === tab.key ? "text-brand-700" : "text-slate-400"}`}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table Section */}
          <div className="min-h-[400px] relative">
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 className="font-semibold" style={{ fontSize: 16, color: "#0f172a", margin: 0 }}>
                {activeTab === "all" ? "All" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Bookings
              </h3>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                {Orders?.length || 0} booking{Orders?.length !== 1 ? "s" : ""}
              </span>
            </div>

            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 min-h-[300px]">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full border-2 border-slate-100"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-brand-600 border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-4 text-slate-500 font-medium text-sm animate-pulse">Loading bookings...</p>
              </div>
            ) : Orders?.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  title={`No ${activeTab === 'all' ? '' : activeTab} bookings found`}
                  message="You don't have any bookings in this category yet."
                  showBg={false}
                />
              </div>
            ) : (
              <ProductTable
                loading={isLoading}
                columns={columns}
                setLastId={setLastId}
                count={count}
                data={Orders}
              />
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className={mounted ? "animate-fade-in" : "opacity-0"}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 5000,
          }}
          onClick={closeModal}
        >
          <div
            className={mounted ? "animate-fade-in-up" : "opacity-0"}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
              width: "100%",
              maxWidth: 440,
              position: "relative",
              overflow: "hidden",
              animationDelay: "50ms",
            }}
          >
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #004a70 0%, #003353 100%)",
              padding: "28px 28px 24px",
              textAlign: "center",
              position: "relative",
            }}>
              <button
                onClick={closeModal}
                className="hover:bg-white/25"
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.12)",
                  border: "none",
                  color: "#fff",
                  fontSize: 16,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                <X size={18} />
              </button>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8" />
                </svg>
              </div>
              <h3 style={{ color: "#fff", fontSize: 20, fontFamily: "Inter-Bold", margin: 0 }}>
                Add a Tip
              </h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter-Regular", margin: "6px 0 0" }}>
                Show appreciation for great service
              </p>
            </div>

            {/* Body */}
            <div style={{ padding: "24px 28px 28px" }}>
              {CustomAmount && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontFamily: "Inter-Medium", color: "#374151", display: "block", marginBottom: 6 }}>
                    Enter amount
                  </label>
                  <input
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 12,
                      fontSize: 16,
                      fontFamily: "Inter-Medium",
                      color: "#0f172a",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    type="text"
                    name="price"
                    placeholder="Enter amount"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    maxLength="16"
                    required
                    onFocus={(e) => e.currentTarget.style.borderColor = "#004a70"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                  />
                </div>
              )}
              {!CustomAmount && (
                <>
                  <p style={{ fontSize: 13, fontFamily: "Inter-Medium", color: "#64748b", margin: "0 0 12px" }}>
                    Quick select
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 12 }}>
                    {["1", "2", "5", "10", "20"].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleTipSelection(amount)}
                        style={{
                          padding: "12px 8px",
                          borderRadius: 12,
                          border: tipAmount === amount ? "1.5px solid #004a70" : "1.5px solid #e2e8f0",
                          background: tipAmount === amount ? "#eef2ff" : "#fff",
                          color: tipAmount === amount ? "#004a70" : "#64748b",
                          fontFamily: "Inter-SemiBold",
                          fontSize: 15,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          textAlign: "center",
                        }}
                        onMouseEnter={(e) => {
                          if (tipAmount !== amount) {
                            e.currentTarget.style.borderColor = "#004a70";
                            e.currentTarget.style.background = "#f8fafc";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (tipAmount !== amount) {
                            e.currentTarget.style.borderColor = "#e2e8f0";
                            e.currentTarget.style.background = "#fff";
                          }
                        }}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleChangeCustom}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#004a70",
                      fontFamily: "Inter-Medium",
                      fontSize: 13,
                      cursor: "pointer",
                      padding: "8px 0",
                      display: "block",
                      width: "100%",
                      textAlign: "center",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#003353"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#004a70"}
                  >
                    Enter other amount
                  </button>
                </>
              )}

              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={() => { setShow(true); setIsModalOpen(false); }}
                  style={{
                    width: "100%",
                    height: 48,
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #004a70 0%, #003353 100%)",
                    color: "#fff",
                    fontFamily: "Inter-SemiBold",
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "0.92"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  <MdPayment size={18} />
                  Pay with Card
                </button>
                <button
                  onClick={handlePay}
                  style={{
                    width: "100%",
                    height: 48,
                    borderRadius: 12,
                    border: "1.5px solid #e2e8f0",
                    background: "#fff",
                    color: "#0f172a",
                    fontFamily: "Inter-SemiBold",
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#004a70"; e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#fff"; }}
                >
                  {Loading ? (
                    <Spinner animation="border" role="status" style={{ width: 18, height: 18 }}>
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  ) : (
                    <><IoWallet size={18} /> Pay with Wallet</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal centered size="lg" show={show} onHide={handleClose} style={{ borderRadius: 20 }}>
        <div style={{ borderRadius: 20, overflow: "hidden" }}>
          <div style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <h3 style={{ fontSize: 18, fontFamily: "Inter-Bold", color: "#0f172a", margin: 0 }}>
              <MdPayment size={20} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Payment Details
            </h3>
            <button
              onClick={handleClose}
              style={{
                width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0",
                background: "#fff", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", color: "#94a3b8",
              }}
            ><X size={16} /></button>
          </div>
          <div style={{ padding: "24px 24px 28px" }}>
            {paymentCards?.length ? (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 14, fontFamily: "Inter-Bold", color: "#0f172a", marginBottom: 12 }}>
                  Saved Cards
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {paymentCards?.map((item, i) => (
                    <div
                      onClick={() => onSelectCard(item)}
                      key={i}
                      style={{
                        padding: "14px 18px",
                        borderRadius: 12,
                        border: "1.5px solid #e2e8f0",
                        background: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = "#004a70"}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                    >
                      <div>
                        <p style={{ fontSize: 12, color: "#94a3b8", fontFamily: "Inter-Regular", margin: "0 0 2px" }}>Email</p>
                        <p style={{ fontSize: 14, fontFamily: "Inter-SemiBold", color: "#0f172a", margin: 0 }}>{item?.email}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 12, color: "#94a3b8", fontFamily: "Inter-Regular", margin: "0 0 2px" }}>Card</p>
                        <p style={{ fontSize: 14, fontFamily: "Inter-SemiBold", color: "#0f172a", margin: 0 }}>
                          •••• {item?.cardnumber?.slice(-4) || item?.cardnumber}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <p style={{ fontSize: 16, fontFamily: "Inter-Bold", color: "#0f172a", marginBottom: 16 }}>
              {paymentCards?.length ? "Add New Card" : "Card Information"}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <Cards
                  cvc={cardDetails.cvc}
                  expiry={cardDetails.expiry}
                  name={cardDetails.name}
                  number={cardDetails.number}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  style={{
                    padding: "10px 14px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 10,
                    fontSize: 13,
                    fontFamily: "Inter-Regular",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  type="text"
                  name="number"
                  placeholder="Card Number"
                  value={cardDetails.number}
                  onChange={handleInputChange}
                  maxLength="16"
                  required
                  onFocus={(e) => e.currentTarget.style.borderColor = "#004a70"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                />
                <input
                  style={{
                    padding: "10px 14px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 10,
                    fontSize: 13,
                    fontFamily: "Inter-Regular",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  type="text"
                  name="name"
                  placeholder="Cardholder Name"
                  value={cardDetails.name}
                  onChange={handleInputChange}
                  required
                  onFocus={(e) => e.currentTarget.style.borderColor = "#004a70"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input
                    style={{
                      padding: "10px 14px",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 10,
                      fontSize: 13,
                      fontFamily: "Inter-Regular",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    type="text"
                    name="expiry"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length >= 3) {
                        value = value.slice(0, 2) + "/" + value.slice(2, 4);
                      }
                      e.target.value = value.slice(0, 5);
                      handleInputChange(e);
                    }}
                    maxLength="5"
                    required
                    onFocus={(e) => e.currentTarget.style.borderColor = "#004a70"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                  />
                  <input
                    style={{
                      padding: "10px 14px",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 10,
                      fontSize: 13,
                      fontFamily: "Inter-Regular",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    type="text"
                    name="cvc"
                    placeholder="CVC"
                    value={cardDetails.cvc}
                    onChange={handleInputChange}
                    maxLength="3"
                    required
                    onFocus={(e) => e.currentTarget.style.borderColor = "#004a70"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
              <input
                style={{
                  padding: "10px 14px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 10,
                  fontSize: 13,
                  fontFamily: "Inter-Regular",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                type="text"
                name="email"
                placeholder="Email"
                value={cardDetails.email}
                onChange={handleInputChange}
                required
                onFocus={(e) => e.currentTarget.style.borderColor = "#004a70"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
              />
              <input
                style={{
                  padding: "10px 14px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 10,
                  fontSize: 13,
                  fontFamily: "Inter-Regular",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                type="text"
                name="phone"
                placeholder="Phone"
                value={cardDetails.phone}
                onChange={handleInputChange}
                required
                onFocus={(e) => e.currentTarget.style.borderColor = "#004a70"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
              />
            </div>

            <button
              onClick={jadAPiFunction}
              disabled={!areAllFieldsFilled()}
              style={{
                width: "100%",
                height: 50,
                borderRadius: 12,
                border: "none",
                marginTop: 20,
                background: !areAllFieldsFilled() ? "#e2e8f0" : "linear-gradient(135deg, #004a70 0%, #003353 100%)",
                color: !areAllFieldsFilled() ? "#94a3b8" : "#fff",
                fontFamily: "Inter-SemiBold",
                fontSize: 14,
                cursor: !areAllFieldsFilled() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (areAllFieldsFilled()) e.currentTarget.style.opacity = "0.92";
              }}
              onMouseLeave={(e) => {
                if (areAllFieldsFilled()) e.currentTarget.style.opacity = "1";
              }}
            >
              {loading ? (
                <Spinner animation="border" role="status" style={{ width: 18, height: 18 }}>
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              ) : (
                <><MdPayment size={18} /> Pay Now</>
              )}
            </button>
          </div>
        </div>
      </Modal>

      <Modal show={show1} onHide={() => setShow1(false)} centered style={{ borderRadius: 20 }}>
        <div style={{ borderRadius: 20, overflow: "hidden" }}>
          <div style={{ padding: "40px 32px 32px", textAlign: "center" }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontFamily: "Inter-Bold", color: "#0f172a", margin: "0 0 8px" }}>
              Payment Successful!
            </h2>
            <p style={{ fontSize: 14, fontFamily: "Inter-Regular", color: "#64748b", margin: "0 0 28px", lineHeight: 1.5 }}>
              Your transaction has been completed successfully
            </p>
            <button
              onClick={() => { setShow1(false); router.push("/"); }}
              style={{
                width: "100%",
                height: 50,
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #004a70 0%, #003353 100%)",
                color: "#fff",
                fontFamily: "Inter-SemiBold",
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.92"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              Back to Home
            </button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal show={reviewModal} onHide={() => setReviewModal(false)} centered style={{ borderRadius: 20 }}>
        <div style={{ borderRadius: 20, overflow: "hidden" }}>
          <div style={{
            background: "linear-gradient(135deg, #004a70 0%, #002d47 100%)",
            padding: "28px 28px 24px",
            textAlign: "center",
            position: "relative",
          }}>
            <button
              onClick={() => setReviewModal(false)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 32, height: 32,
                borderRadius: 10,
                background: "rgba(255,255,255,0.12)",
                border: "none",
                color: "#fff",
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
            >
              <X size={18} />
            </button>
            <div style={{
              width: 56, height: 56,
              borderRadius: 16,
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}>
              <FaStar size={26} color="#f59e0b" />
            </div>
            <h3 style={{ color: "#fff", fontSize: 20, fontFamily: "Inter-Bold", margin: 0 }}>
              Write a Review
            </h3>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter-Regular", margin: "6px 0 0" }}>
              Share your experience with {selectedOrder?.to_id?.name || "the driver"}
            </p>
          </div>

          <div style={{ padding: "24px 28px 28px" }}>
            {/* Driver Info Card */}
            {selectedOrder?.to_id && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                background: "#f8fafc",
                borderRadius: 12,
                marginBottom: 20,
                border: "1px solid #e2e8f0",
              }}>
                <img
                  src={selectedOrder?.to_id?.image || "/placeholder.jpg"}
                  alt=""
                  style={{
                    width: 44, height: 44,
                    borderRadius: 10,
                    objectFit: "cover",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <div>
                  <p className="medium-font" style={{ fontSize: 14, color: "#0f172a", margin: 0 }}>
                    {selectedOrder?.to_id?.name || "N/A"}
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>
                    {selectedOrder?.start_address?.slice(0, 30)}...
                  </p>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Booking</p>
                  <p className="medium-font" style={{ fontSize: 13, color: "#004a70", margin: "2px 0 0" }}>
                    #{selectedOrder?._id?.slice(-6)}
                  </p>
                </div>
              </div>
            )}

            {/* Rating */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontFamily: "Inter-Medium", color: "#374151", margin: "0 0 10px" }}>
                Your Rating
              </p>
              <Rate
                value={reviewRating}
                onChange={setReviewRating}
                style={{ fontSize: 32 }}
              />
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "8px 0 0" }}>
                {reviewRating === 1 ? "Poor" : reviewRating === 2 ? "Fair" : reviewRating === 3 ? "Good" : reviewRating === 4 ? "Very Good" : "Excellent"}
              </p>
            </div>

            {/* Review Text */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontFamily: "Inter-Medium", color: "#374151", display: "block", marginBottom: 6 }}>
                Your Review
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 12,
                  fontSize: 13,
                  fontFamily: "Inter-Regular",
                  color: "#0f172a",
                  outline: "none",
                  resize: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#004a70"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={submitReview}
              style={{
                width: "100%",
                height: 48,
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #004a70 0%, #002d47 100%)",
                color: "#fff",
                fontFamily: "Inter-SemiBold",
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.92"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              <FaStar size={16} />
              Submit Review
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Page;
