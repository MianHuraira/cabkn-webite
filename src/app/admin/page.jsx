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
    completed: { bg: "#e8f5e9", text: "#2e7d32", border: "#a5d6a7" },
    cancelled: { bg: "#fbe9e7", text: "#c62828", border: "#ffab91" },
    accepted: { bg: "#e3f2fd", text: "#1565c0", border: "#90caf9" },
    pending: { bg: "#fff3e0", text: "#e65100", border: "#ffcc80" },
    upcoming: { bg: "#f3e5f5", text: "#7b1fa2", border: "#ce93d8" },
    active: { bg: "#e0f7fa", text: "#00695c", border: "#80deea" },
  };
  
  const st = statusColorMap[(status || "").toLowerCase()] || { bg: "#f5f5f5", text: "#616161", border: "#e0e0e0" };
  
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 12px",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "600",
      backgroundColor: st.bg,
      color: st.text,
      border: `1px solid ${st.border}`,
      textTransform: "capitalize",
    }}>
      <span style={{
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        backgroundColor: st.text,
      }} />
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
    <div className={mounted ? "animate-fade-in" : "opacity-0"} style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <div
        className={`bg-gradient-to-br from-brand-800 to-brand-950 ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
        style={{
          padding: "28px 0 80px",
          position: "relative",
          animationDelay: "50ms",
        }}
      >
        <div style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
        }} />
        <div style={{
          position: "absolute",
          bottom: -40,
          left: -40,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
        }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "rgba(255,255,255,0.5)",
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 16,
          }}>
            <a href="/" style={{
              color: "rgba(255,255,255,0.5)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>
              Home
            </a>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>My Bookings</span>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <MdOutlineBookOnline size={26} color="#fff" />
              </div>
              <div>
                <h1 style={{
                  color: "#fff",
                  fontSize: 30,
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: "-0.5px",
                  lineHeight: 1.2,
                }}>
                  My Bookings
                </h1>
                <p style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 14,
                  margin: "2px 0 0",
                  fontWeight: 400,
                }}>
                  {Orders?.length || 0} booking{Orders?.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              borderRadius: 12,
              padding: "6px 14px",
              border: "1px solid rgba(255,255,255,0.06)",
              height: 36,
            }}>
              <MdOutlineCalendarMonth size={14} color="#fbbf24" />
              <span style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
              }}>
                {Orders?.length || 0} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div ref={contentRef} style={{
        maxWidth: 1200,
        margin: "-40px auto 0",
        padding: "0 16px 48px",
        position: "relative",
        zIndex: 10,
      }}>
        <div className={`reveal ${contentInView ? "visible" : ""}`} style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
        }}>
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            overflowX: "auto",
            background: "#fafbfc",
          }}>
            <div style={{
              display: "flex",
              gap: 8,
              minWidth: "max-content",
              paddingBottom: "2px",
            }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabSelect(tab.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    background: activeTab === tab.key ? "#004a70" : "transparent",
                    color: activeTab === tab.key ? "#fff" : "#64748b",
                    fontWeight: activeTab === tab.key ? 600 : 500,
                    fontSize: 13,
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.key) {
                      e.currentTarget.style.background = "#f1f5f9";
                      e.currentTarget.style.color = "#334155";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.key) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#64748b";
                    }
                  }}
                >
                  <span style={{ opacity: activeTab === tab.key ? 1 : 0.8 }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: "24px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}>
              <h3 style={{
                fontSize: 16,
                color: "#0f172a",
                margin: 0,
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
              }}>
                {activeTab === "all" ? "All" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Bookings
              </h3>
              <span style={{
                fontSize: 13,
                color: "#64748b",
                fontWeight: 500,
                fontFamily: "Inter, sans-serif",
              }}>
                {Orders?.length || 0} booking{Orders?.length !== 1 ? "s" : ""}
              </span>
            </div>

            {isLoading ? (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 20px",
              }}>
                <div style={{
                  position: "relative",
                  width: 40,
                  height: 40,
                }}>
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "2px solid #e2e8f0",
                  }} />
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "2px solid #004a70",
                    borderTopColor: "transparent",
                    animation: "spin 1s linear infinite",
                  }} />
                </div>
                <p style={{
                  marginTop: 16,
                  color: "#64748b",
                  fontWeight: 500,
                  fontSize: 14,
                  fontFamily: "Inter, sans-serif",
                }}>Loading bookings...</p>
              </div>
            ) : Orders?.length === 0 ? (
              <div style={{ padding: "40px 0" }}>
                <EmptyState
                  title={`No ${activeTab === "all" ? "" : activeTab} bookings found`}
                  message="You don't have any bookings in this category yet."
                  showBg={false}
                />
              </div>
            ) : (
              <>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "20px",
                  marginBottom: lastId < count ? "20px" : "0px",
                }}>
                  {Orders?.map((order, index) => (
                    <div
                      key={`${order?._id}-${index}`}
                      style={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 16,
                        padding: "20px",
                        transition: "all 0.3s ease",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "360px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 74, 112, 0.12)";
                        e.currentTarget.style.borderColor = "#004a70";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "16px",
                      }}>
                        <StatusBadge status={order?.status} />
                        <div style={{ textAlign: "right" }}>
                          <p style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: "#059669",
                            margin: 0,
                            fontFamily: "Inter, sans-serif",
                          }}>
                            ${order?.price || 0}
                          </p>
                          <p style={{
                            fontSize: 12,
                            color: "#94a3b8",
                            margin: "4px 0 0",
                            fontFamily: "Inter, sans-serif",
                          }}>
                            {moment(order?.createdAt).format("DD MMM YYYY")} • {moment(order?.createdAt).format("hh:mm A")}
                          </p>
                        </div>
                      </div>

                      <div style={{
                        display: "flex",
                        gap: "12px",
                        marginBottom: "16px",
                        flex: 1,
                      }}>
                        <div style={{
                          width: 56,
                          height: 56,
                          borderRadius: 14,
                          overflow: "hidden",
                          flexShrink: 0,
                          border: "1px solid #f1f5f9",
                          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <Image
                            alt=""
                            width={56}
                            height={56}
                            src={tableMap}
                            style={{ objectFit: "cover" }}
                          />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                            <div style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #004a70 0%, #006699 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              marginTop: "2px",
                              boxShadow: "0 3px 8px rgba(0, 74, 112, 0.2)",
                            }}>
                              <FaLocationDot size={10} color="#fff" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                fontSize: 13,
                                color: "#0f172a",
                                margin: 0,
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontFamily: "Inter, sans-serif",
                              }}>
                                {order?.start_address || "Pickup location"}
                              </p>
                            </div>
                          </div>

                          <div style={{
                            width: 2,
                            height: 20,
                            background: "linear-gradient(180deg, #004a70 0%, #e2e8f0 100%)",
                            marginLeft: "9px",
                            marginRight: "9px",
                            marginTop: 3,
                            marginBottom: 3,
                          }} />

                          <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                            <div style={{
                              width: 20,
                              height: 20,
                              borderRadius: "5px",
                              background: "linear-gradient(135deg, #004a70 0%, #006699 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              marginTop: "2px",
                              boxShadow: "0 3px 8px rgba(0, 74, 112, 0.2)",
                            }}>
                              <MdOutlineMyLocation size={10} color="#fff" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                fontSize: 13,
                                color: "#64748b",
                                margin: 0,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontFamily: "Inter, sans-serif",
                              }}>
                                {order?.end_address || "Dropoff location"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {order?.to_id && (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "12px",
                          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                          borderRadius: 12,
                          marginBottom: "16px",
                          border: "1px solid #e2e8f0",
                        }}>
                          <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            overflow: "hidden",
                            flexShrink: 0,
                            border: "2px solid #fff",
                            boxShadow: "0 3px 10px rgba(0, 0, 0, 0.06)",
                          }}>
                            <img
                              alt=""
                              width={44}
                              height={44}
                              src={order?.to_id?.image || "/placeholder.jpg"}
                              style={{ width: 44, height: 44, objectFit: "cover" }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontSize: 14,
                              color: "#0f172a",
                              margin: 0,
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontFamily: "Inter, sans-serif",
                            }}>
                              {order?.to_id?.name || "Driver"}
                            </p>
                            <p style={{
                              fontSize: 11,
                              color: "#94a3b8",
                              margin: "3px 0 0",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontFamily: "Inter, sans-serif",
                            }}>
                              {order?.to_id?.email || ""}
                            </p>
                          </div>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                        <Button
                          disabled={order?.tip === 1}
                          onClick={() => { openModal(true); setTipOrderId(order?._id); }}
                          style={{
                            flex: 1,
                            height: 44,
                            fontSize: 13,
                            fontWeight: 700,
                            borderRadius: 10,
                            border: order?.tip === 1 ? "1px solid #e2e8f0" : "none",
                            background: order?.tip === 1 ? "#f8fafc" : "linear-gradient(135deg, #004a70 0%, #003353 100%)",
                            color: order?.tip === 1 ? "#94a3b8" : "#fff",
                            padding: "0 14px",
                            cursor: order?.tip === 1 ? "not-allowed" : "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            fontFamily: "Inter, sans-serif",
                            boxShadow: order?.tip === 1 ? "none" : "0 6px 16px rgba(0, 74, 112, 0.2)",
                          }}
                        >
                          <FaPlus size={14} />
                          {order?.tip === 1 ? "Tipped" : "Add Tip"}
                        </Button>

                        <button
                          onClick={() => gotoDetails(order)}
                          title="View Details"
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            background: "linear-gradient(135deg, #fff 0%, #f8fafc 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#64748b",
                            transition: "all 0.2s ease",
                            boxShadow: "0 3px 10px rgba(0, 0, 0, 0.03)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#004a70";
                            e.currentTarget.style.color = "#fff";
                            e.currentTarget.style.background = "linear-gradient(135deg, #004a70 0%, #003353 100%)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#e2e8f0";
                            e.currentTarget.style.color = "#64748b";
                            e.currentTarget.style.background = "linear-gradient(135deg, #fff 0%, #f8fafc 100%)";
                          }}
                        >
                          <FaEye size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {lastId < count && (
                  <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                    <button
                      onClick={handleSeeMore}
                      disabled={seeMoreLoading}
                      style={{
                        padding: "12px 28px",
                        borderRadius: 12,
                        border: "2px solid #004a70",
                        background: "#fff",
                        color: "#004a70",
                        fontSize: 14,
                        fontWeight: 700,
                        fontFamily: "Inter, sans-serif",
                        cursor: seeMoreLoading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!seeMoreLoading) {
                          e.currentTarget.style.background = "#004a70";
                          e.currentTarget.style.color = "#fff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!seeMoreLoading) {
                          e.currentTarget.style.background = "#fff";
                          e.currentTarget.style.color = "#004a70";
                        }
                      }}
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
              <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0, fontFamily: "Inter, sans-serif" }}>
                Add a Tip
              </h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "6px 0 0", fontFamily: "Inter, sans-serif" }}>
                Show appreciation for great service
              </p>
            </div>

            <div style={{ padding: "24px 28px 28px" }}>
              {CustomAmount && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 6, fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                    Enter amount
                  </label>
                  <input
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 12,
                      fontSize: 16,
                      fontFamily: "Inter, sans-serif",
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
                  <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 12px", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
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
                          fontWeight: 600,
                          fontSize: 15,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          textAlign: "center",
                          fontFamily: "Inter, sans-serif",
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
                      fontWeight: 500,
                      fontSize: 13,
                      cursor: "pointer",
                      padding: "8px 0",
                      display: "block",
                      width: "100%",
                      textAlign: "center",
                      transition: "color 0.2s",
                      fontFamily: "Inter, sans-serif",
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
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s",
                    fontFamily: "Inter, sans-serif",
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
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s",
                    fontFamily: "Inter, sans-serif",
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
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0, fontFamily: "Inter, sans-serif" }}>
              <MdPayment size={20} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Payment Details
            </h3>
            <button
              onClick={handleClose}
              style={{
                width: 32, height: 32,
                borderRadius: 8, border: "1px solid #e2e8f0",
                background: "#fff", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", color: "#94a3b8",
              }}
            >
              <X size={16} />
            </button>
          </div>
          <div style={{ padding: "24px 24px 28px" }}>
            {paymentCards?.length ? (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 14, color: "#0f172a", marginBottom: 12, fontWeight: 700, fontFamily: "Inter, sans-serif" }}>
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
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 2px", fontFamily: "Inter, sans-serif" }}>Email</p>
                        <p style={{ fontSize: 14, color: "#0f172a", margin: 0, fontWeight: 600, fontFamily: "Inter, sans-serif" }}>{item?.email}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 2px", fontFamily: "Inter, sans-serif" }}>Card</p>
                        <p style={{ fontSize: 14, color: "#0f172a", margin: 0, fontWeight: 600, fontFamily: "Inter, sans-serif" }}>
                          •••• {item?.cardnumber?.slice(-4) || item?.cardnumber}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <p style={{ fontSize: 16, color: "#0f172a", marginBottom: 16, fontWeight: 700, fontFamily: "Inter, sans-serif" }}>
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
                    outline: "none",
                    transition: "border-color 0.2s",
                    fontFamily: "Inter, sans-serif",
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
                    outline: "none",
                    transition: "border-color 0.2s",
                    fontFamily: "Inter, sans-serif",
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
                      outline: "none",
                      transition: "border-color 0.2s",
                      fontFamily: "Inter, sans-serif",
                    }}
                    type="text"
                    name="expiry"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={handleInputChange}
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
                      outline: "none",
                      transition: "border-color 0.2s",
                      fontFamily: "Inter, sans-serif",
                    }}
                    type="text"
                    name="cvc"
                    placeholder="CVC"
                    value={cardDetails.cvc}
                    onChange={handleInputChange}
                    maxLength="4"
                    required
                    onFocus={(e) => e.currentTarget.style.borderColor = "#004a70"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                  />
                </div>
                <input
                  style={{
                    padding: "10px 14px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 10,
                    fontSize: 13,
                    outline: "none",
                    transition: "border-color 0.2s",
                    fontFamily: "Inter, sans-serif",
                  }}
                  type="email"
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
                    outline: "none",
                    transition: "border-color 0.2s",
                    fontFamily: "Inter, sans-serif",
                  }}
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={cardDetails.phone}
                  onChange={handleInputChange}
                  required
                  onFocus={(e) => e.currentTarget.style.borderColor = "#004a70"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                />
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <button
                onClick={jadAPiFunction}
                disabled={!areAllFieldsFilled()}
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 12,
                  border: "none",
                  background: areAllFieldsFilled() ? "linear-gradient(135deg, #004a70 0%, #003353 100%)" : "#e2e8f0",
                  color: areAllFieldsFilled() ? "#fff" : "#94a3b8",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: areAllFieldsFilled() ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {loading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Spinner animation="border" role="status" style={{ width: 18, height: 18 }}>
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    Processing...
                  </div>
                ) : (
                  "Pay Now"
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {show1 && (
        <Modal
          show={show1}
          onHide={() => setShow1(false)}
          centered
        >
          <div style={{
            background: "#fff",
            borderRadius: 20,
            overflow: "hidden",
            textAlign: "center",
            padding: "40px 30px",
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#dcfce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <MdDoneAll size={40} color="#16a34a" />
            </div>
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#0f172a",
              margin: "0 0 8px",
              fontFamily: "Inter, sans-serif",
            }}>
              Tip Added!
            </h2>
            <p style={{
              fontSize: 14,
              color: "#64748b",
              margin: 0,
              fontFamily: "Inter, sans-serif",
            }}>
              Your tip has been added successfully
            </p>
            <button
              onClick={() => setShow1(false)}
              style={{
                marginTop: 24,
                width: "100%",
                height: 44,
                borderRadius: 10,
                border: "none",
                background: "#004a70",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Done
            </button>
          </div>
        </Modal>
      )}

      {reviewModal && (
        <Modal
          show={reviewModal}
          onHide={() => setReviewModal(false)}
          centered
        >
          <div style={{
            background: "#fff",
            borderRadius: 20,
            overflow: "hidden",
          }}>
            <div style={{
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              padding: "20px 24px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <h3 style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
                fontFamily: "Inter, sans-serif",
              }}>
                Leave a Review
              </h3>
              <button
                onClick={() => setReviewModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <Rate
                  value={reviewRating}
                  onChange={setReviewRating}
                  style={{ fontSize: 32 }}
                />
              </div>
              <textarea
                style={{
                  width: "100%",
                  minHeight: 120,
                  padding: "12px 16px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 12,
                  fontSize: 14,
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "Inter, sans-serif",
                }}
                placeholder="Write your review here..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                <button
                  onClick={() => setReviewModal(false)}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    color: "#64748b",
                    fontWeight: 500,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 10,
                    border: "none",
                    background: "#004a70",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                  }}
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
