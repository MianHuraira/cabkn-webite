"use client";
import React, { useEffect, useState } from "react";
import {
  FaWallet,
  FaHistory,
  FaPlus,
  FaCreditCard,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import axios from "axios";
import { Container } from "react-bootstrap";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import moment from "moment";
import { setPaymentCards, setUser } from "@/components/Redux/Slices/AuthSlice";
import { useSocket } from "@/components/ApiFunction/SoketProvider";
import CustomButton from "@/components/CustomButton";
import EmptyState from "@/components/EmptyState";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
const apiKey = "0FGR7.1720815360";
const apiSecret =
  "6EF4CAFCD82E689DECA28EDFDE15ADB35D12BF5982B182E468758A9F8DD072DF";
const tokenUrl = "https://jad.cash/HAPI/token";
const paymentUrl = "https://jad.cash/HAPI/cardpayment";

const page = () => {
  const { header1, putData, getData } = ApiFunction();
  const fullData = useSelector((state) => state.auth.user);
  const userData = useSelector((state) => state.auth.user?.user);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [Tab, setTab] = useState("Topup");
  const [TransLoading, setTransLoading] = useState(false);
  const [TransectionData, setTransectionData] = useState([]);

  const dispatch = useDispatch();
  const [cardDetails, setCardDetails] = useState({
    price: "",
    cvc: "",
    expiry: "",
    name: "",
    number: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const paymentCards = useSelector((state) => state.auth.paymentCards);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    setCardDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails, [name]: value };
      return updatedDetails;
    });
  };

  const TransectionHistory = async (Id) => {
    setTransLoading(true);
    try {
      const response = await getData("/users/transactions/1", header1);
      if (response?.success) {
        setTransectionData(response?.transactions);
        setTransLoading(false);
      } else {
        setTransLoading(false);
        message.error(response?.message);
      }
    } catch (error) {
      setTransLoading(false);
      message.error(error.response?.message);
    }
  };

  useEffect(() => {
    if (Tab === "History") {
      TransectionHistory();
    }
  }, [Tab]);

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
      setLoading(false);
      throw error;
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

  const validate = () => {
    const errs = {};
    if (!cardDetails.price || Number(cardDetails.price) <= 0 || Number(cardDetails.price) > 99999) errs.price = "Enter a valid amount ($1 - $99,999)";
    if (!cardDetails.number || cardDetails.number.length < 13) errs.number = "Enter a valid card number";
    if (!cardDetails.name) errs.name = "Card holder name is required";
    if (!cardDetails.expiry || cardDetails.expiry.length < 4) errs.expiry = "Enter a valid expiry";
    if (!cardDetails.cvc || cardDetails.cvc.length < 3) errs.cvc = "Enter a valid CVC";
    if (!cardDetails.email) errs.email = "Email is required";
    if (!cardDetails.phone || cardDetails.phone.length < 6) errs.phone = "Enter a valid phone number";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const jadAPiFunction = async () => {
    if (!validate()) return;
    setLoading(true);
    const tokenResponse = await getToken();
    if (tokenResponse.result !== "Success") {
      throw new Error(
        `Failed to obtain token: ${JSON.stringify(tokenResponse)}`
      );
    }

    const token = tokenResponse.data.token;

    const dateString = cardDetails?.expiry;
    const [month, year] = dateString.split("/");
    const finalPrice = cardDetails?.price * 2.7;

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
      setLoading(false);
      if (paymentResponse?.result == "Success") {
        if (paymentResponse?.refid) {
          handleUpdateUser(paymentResponse?.refid);
        }
      } else {
        message.error(paymentResponse?.message);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (Id) => {
    setLoading(true);
    try {
      const body = {
        amount: cardDetails?.price,
        refId: Id,
      };
      const response = await putData("/users/add-amount", body, header1);
      if (response?.success) {
        getProfile();
        message.success(response?.message);
        setLoading(false);
      } else {
        setLoading(false);
        message.error(response?.message);
      }
    } catch (error) {
      setLoading(false);

      message.error(error.response?.message);
    }
  };

  const getProfile = async () => {
    try {
      const response = await getData("/users/me", header1);
      const responseBody = {
        token: fullData?.token,
        success: true,
        newUser: false,
        user: response?.user,
      };
      dispatch(setUser(responseBody));
      setCardDetails({
        cvc: "",
        expiry: "",
        name: "",
        number: "",
        address: "",
        postalCode: "",
        firstName: "",
        lastName: "",
        city: "",
        state: "",
        email: "",
        phone: "",
        countary: "",
      });
    } catch (error) { }
  };

  const [isMobileSidebar, setIsMobileSidebar] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobileSidebar(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={mounted ? 'animate-fade-in' : 'opacity-0'} style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div
        className={`bg-gradient-to-br from-brand-800 to-brand-950 ${mounted ? 'animate-fade-in-down' : 'opacity-0'}`}
        style={{
          padding: "28px 0 44px",
          animationDelay: "50ms",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", position: "relative" }}>
          <div className="font-family-medium" style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 16 }}>
            <a href="/" className="font-family-medium" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>
              Home
            </a>
            <span className="font-family-medium" style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
            <span className="font-family-medium" style={{ color: "rgba(255,255,255,0.8)" }}>Wallet</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 2vw, 16px)" }}>
            <div style={{ width: "clamp(40px, 6vw, 52px)", height: "clamp(40px, 6vw, 52px)", borderRadius: "clamp(12px, 2vw, 16px)", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FaWallet size="clamp(18px, 3vw, 24px)" color="#fff" />
            </div>
            <div>
              <h1 className="font-family-bold" style={{ color: "#fff", fontSize: "clamp(20px, 5vw, 30px)", margin: 0, letterSpacing: "-0.5px", lineHeight: 1.2, wordBreak: "break-word" }}>
                My Wallet
              </h1>
              <p className="font-family-regular" style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(12px, 2vw, 14px)", margin: "2px 0 0", wordBreak: "break-word" }}>
                Manage your balance and transactions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "-24px auto 0", padding: "0 16px 48px" }}>
        <div
          style={{
            display: "flex",
            gap: 20,
            flexDirection: isMobileSidebar ? "column" : "row",
            alignItems: "flex-start",
          }}
        >
          {/* Left Sidebar */}
          <div
            className={mounted ? 'animate-fade-in-up' : 'opacity-0'}
            style={{
              width: isMobileSidebar ? "100%" : 280,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              animationDelay: "150ms",
            }}
          >
            {/* Balance Card */}
            <div
              style={{
                background: "linear-gradient(135deg, #004a70 0%, #002d47 100%)",
                borderRadius: 16,
                padding: "clamp(20px, 3vw, 28px)",
                color: "#fff",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -30,
                  left: -30,
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.03)",
                }}
              />
              <p className="font-family-medium" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: "0 0 8px", position: "relative", zIndex: 1 }}>
                Available Balance
              </p>
              <p
                className="font-family-bold"
                style={{
                  fontSize: "clamp(20px, 3vw, 28px)",
                  margin: 0,
                  position: "relative",
                  zIndex: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                ${userData?.amount?.toFixed(2) || "0.00"}
              </p>
            </div>

            {/* Tabs */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #f0f0f0",
                padding: 6,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                onClick={() => setTab("Topup")}
                className={(Tab !== "Topup" ? 'hover:bg-slate-50' : '') + (Tab === "Topup" ? " font-family-semibold" : " font-family-medium")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: Tab === "Topup" ? "linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%)" : "transparent",
                  color: Tab === "Topup" ? "#004a70" : "#4b5563",
                  fontSize: 14,
                  transition: "all 0.2s",
                  marginBottom: 2,
                  position: "relative",
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, background: Tab === "Topup" ? "#004a70" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                  <FaWallet size={13} color={Tab === "Topup" ? "#fff" : "#9ca3af"} />
                </div>
                <span className="font-family-medium" style={{ flex: 1 }}>Top Up</span>
                {Tab === "Topup" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#004a70" }} />}
              </div>
              <div
                onClick={() => setTab("History")}
                className={(Tab !== "History" ? 'hover:bg-slate-50' : '') + (Tab === "History" ? " font-family-semibold" : " font-family-medium")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: Tab === "History" ? "linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%)" : "transparent",
                  color: Tab === "History" ? "#004a70" : "#4b5563",
                  fontSize: 14,
                  transition: "all 0.2s",
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, background: Tab === "History" ? "#004a70" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                  <FaHistory size={13} color={Tab === "History" ? "#fff" : "#9ca3af"} />
                </div>
                <span className="font-family-medium" style={{ flex: 1 }}>History</span>
                {Tab === "History" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#004a70" }} />}
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className={mounted ? 'animate-fade-in-up' : 'opacity-0'} style={{ flex: 1, minWidth: 0, animationDelay: "250ms" }}>
            {Tab === "Topup" ? (
              <div
                className={mounted ? 'animate-fade-in-up' : 'opacity-0'}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid #f0f0f0",
                  padding: "clamp(20px, 3vw, 28px)",
                  animationDelay: "300ms",
                }}
              >
                {/* Saved Cards */}
                {paymentCards?.length > 0 && (
                  <>
                    <p className="font-family-semibold" style={{ fontSize: 15, color: "#1f2937", margin: "0 0 12px" }}>
                      Saved Cards
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                      {paymentCards?.map((item, i) => (
                        <div
                          key={i}
                          onClick={() => onSelectCard(item)}
                          className='hover:border-brand-700 hover:bg-blue-50'
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 16px",
                            borderRadius: 10,
                            border: "1px solid #f0f0f0",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          <FaCreditCard size={20} color="#004a70" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="font-family-medium" style={{ fontSize: 13, color: "#374151", margin: 0 }}>
                              {item?.email}
                            </p>
                            <p className="font-family-regular" style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>
                              **** {item?.cardnumber?.slice(-4)}
                            </p>
                          </div>
                          <FaCheckCircle size={16} color="#059669" />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Step indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#004a70" }} />
                  <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#d1d5db" }} />
                  <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#d1d5db" }} />
                </div>

                {/* Step 1: Amount */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#004a70", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span className="font-family-bold" style={{ color: "#fff", fontSize: 11 }}>1</span>
                    </div>
                    <p className="font-family-semibold" style={{ fontSize: 14, color: "#1f2937", margin: 0 }}>Enter Amount</p>
                  </div>
                  <div style={{ position: "relative" }}>
                    <span className="font-family-semibold" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#9ca3af", zIndex: 1 }}>$</span>
                    <input
                      name="price"
                      placeholder="0.00"
                      type="number"
                      min="0"
                      value={cardDetails.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith("-")) return;
                        handleInputChange(e);
                      }}
                      className={`bg-gray-50 border-0 font-family-semibold focus:ring-1 focus:ring-brand-600/30 focus:outline-none focus:bg-white${formErrors.price ? " ring-2 ring-red-400" : ""}`}
                      style={{
                        width: "100%",
                        padding: "12px 14px 12px 32px",
                        borderRadius: 10,
                        fontSize: 16,
                      }}
                    />
                    {formErrors.price && <p className="font-family-regular" style={{ fontSize: 12, color: "#ef4444", margin: "4px 0 0" }}>{formErrors.price}</p>}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    {[10, 25, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCardDetails((prev) => ({ ...prev, price: amt }))}
                        className={(cardDetails.price == amt ? 'bg-brand-700 text-white border-brand-700' : 'hover:border-brand-700 hover:text-brand-700') + ' font-family-medium'}
                        style={{
                          padding: "6px 16px",
                          borderRadius: 9999,
                          border: cardDetails.price == amt ? "1px solid #004a70" : "1px solid #d1d5db",
                          background: cardDetails.price == amt ? "#004a70" : "#fff",
                          color: cardDetails.price == amt ? "#fff" : "#4b5563",
                          fontSize: 13,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "#f3f4f6", margin: "0 0 20px" }} />

                {/* Step 2: Card Details */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#004a70", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span className="font-family-bold" style={{ color: "#fff", fontSize: 11 }}>2</span>
                    </div>
                    <p className="font-family-semibold" style={{ fontSize: 14, color: "#1f2937", margin: 0 }}>Card Information</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobileSidebar ? "1fr" : "1fr 1fr", gap: 20 }}>
                    <div>
                      <Cards
                        cvc={cardDetails.cvc}
                        expiry={cardDetails.expiry}
                        name={cardDetails.name}
                        number={cardDetails.number}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div>
                        <label className="font-family-medium focus-within:text-brand-700" style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 4, transition: "color 0.2s" }}>
                          Card Number
                        </label>
                        <input
                          className={`bg-gray-50 border-0 focus:ring-1 focus:ring-brand-600/30 focus:outline-none focus:bg-white${formErrors.number ? " ring-2 ring-red-400" : ""}`}
                          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14 }}
                          type="text" name="number" placeholder="1234 5678 9012 3456"
                          value={cardDetails.number} onChange={handleInputChange} maxLength="16" required
                        />
                        {formErrors.number && <p className="font-family-regular" style={{ fontSize: 12, color: "#ef4444", margin: "4px 0 0" }}>{formErrors.number}</p>}
                      </div>
                      <div>
                        <label className="font-family-medium" style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 4 }}>
                          Card Holder Name
                        </label>
                        <input
                          className={`bg-gray-50 border-0 focus:ring-1 focus:ring-brand-600/30 focus:outline-none focus:bg-white${formErrors.name ? " ring-2 ring-red-400" : ""}`}
                          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14 }}
                          type="text" name="name" placeholder="John Doe"
                          value={cardDetails.name} onChange={handleInputChange} required
                        />
                        {formErrors.name && <p className="font-family-regular" style={{ fontSize: 12, color: "#ef4444", margin: "4px 0 0" }}>{formErrors.name}</p>}
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <label className="font-family-medium" style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 4 }}>Expiry</label>
                          <input
                            className={`bg-gray-50 border-0 focus:ring-1 focus:ring-brand-600/30 focus:outline-none focus:bg-white${formErrors.expiry ? " ring-2 ring-red-400" : ""}`}
                            style={{ width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14 }}
                            type="text" name="expiry" placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, "");
                              if (value.length >= 3) value = value.slice(0, 2) + "/" + value.slice(2, 4);
                              e.target.value = value.slice(0, 5);
                              handleInputChange(e);
                            }}
                            maxLength="5" required
                          />
                          {formErrors.expiry && <p className="font-family-regular" style={{ fontSize: 12, color: "#ef4444", margin: "4px 0 0" }}>{formErrors.expiry}</p>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="font-family-medium" style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 4 }}>CVC</label>
                          <input
                            className={`bg-gray-50 border-0 focus:ring-1 focus:ring-brand-600/30 focus:outline-none focus:bg-white${formErrors.cvc ? " ring-2 ring-red-400" : ""}`}
                            style={{ width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14 }}
                            type="text" name="cvc" placeholder="123"
                            value={cardDetails.cvc} onChange={handleInputChange} maxLength="3" required
                          />
                          {formErrors.cvc && <p className="font-family-regular" style={{ fontSize: 12, color: "#ef4444", margin: "4px 0 0" }}>{formErrors.cvc}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "#f3f4f6", margin: "0 0 20px" }} />

                {/* Step 3: Contact */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#004a70", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span className="font-family-bold" style={{ color: "#fff", fontSize: 11 }}>3</span>
                    </div>
                    <p className="font-family-semibold" style={{ fontSize: 14, color: "#1f2937", margin: 0 }}>Contact Details</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobileSidebar ? "1fr" : "1fr 1fr", gap: 12 }}>
                    <div>
                      <label className="font-family-medium" style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 4 }}>Email</label>
                      <input
                        className={`bg-gray-50 border-0 focus:ring-1 focus:ring-brand-600/30 focus:outline-none focus:bg-white${formErrors.email ? " ring-2 ring-red-400" : ""}`}
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14 }}
                        type="text" name="email" placeholder="email@example.com"
                        value={cardDetails.email} onChange={handleInputChange} required
                      />
                      {formErrors.email && <p className="font-family-regular" style={{ fontSize: 12, color: "#ef4444", margin: "4px 0 0" }}>{formErrors.email}</p>}
                    </div>
                    <div>
                      <label className="font-family-medium" style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 4 }}>Phone</label>
                      <PhoneInput
                        country={"us"}
                        value={cardDetails.phone}
                        onChange={(value) => { setCardDetails((prev) => ({ ...prev, phone: value })); setFormErrors((prev) => ({ ...prev, phone: undefined })); }}
                        inputStyle={{
                          width: "100%",
                          padding: "11px 14px 11px 50px",
                          borderRadius: 10,
                          border: "none",
                          fontSize: 14,
                          background: "#f9fafb",
                          outline: "none",
                        }}
                        buttonStyle={{
                          borderRadius: "10px 0 0 10px",
                          border: "none",
                          background: "#f3f4f6",
                          padding: "11px 0 11px 8px",
                          height: "auto",
                        }}
                        dropdownStyle={{ borderRadius: 10 }}
                        containerStyle={{ borderRadius: 10, width: "100%" }}
                        inputClass={`${formErrors.phone ? "ring-2 ring-red-400" : ""}`}
                      />
                      {formErrors.phone && <p className="font-family-regular" style={{ fontSize: 12, color: "#ef4444", margin: "4px 0 0" }}>{formErrors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <CustomButton
                  onClick={jadAPiFunction}
                  loading={loading}
                  style={{ width: "100%" }}
                  size="lg"
                  startContent={
                    <FaPlus size={14} style={{ marginRight: 6 }} />
                  }
                >
                  Add Payment
                </CustomButton>
              </div>
            ) : (
              <div
                className={mounted ? 'animate-fade-in-up' : 'opacity-0'}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid #f0f0f0",
                  padding: "clamp(20px, 3vw, 28px)",
                  animationDelay: "350ms",
                }}
              >
                <p className="font-family-semibold" style={{ fontSize: 15, color: "#1f2937", margin: "0 0 16px", paddingBottom: 12, borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
                  <FaHistory size={15} color="#004a70" />
                  Transaction History
                </p>

                {TransLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "8px 0" }}>
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="animate-pulse" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#e5e7eb", flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 14, width: "40%", background: "#e5e7eb", borderRadius: 9999, marginBottom: 6 }} />
                          <div style={{ height: 12, width: "25%", background: "#f3f4f6", borderRadius: 9999 }} />
                        </div>
                        <div style={{ height: 14, width: "15%", background: "#e5e7eb", borderRadius: 9999 }} />
                      </div>
                    ))}
                  </div>
                ) : TransectionData?.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {TransectionData?.map((section, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "14px 0",
                          borderBottom: index < TransectionData.length - 1 ? "1px solid #f3f4f6" : "none",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              background: section?.type === "deposit" ? "#ecfdf5" : "#fef2f2",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {section?.type === "deposit" ? (
                              <FaPlus size={14} color="#059669" />
                            ) : (
                              <FaTimesCircle size={14} color="#ef4444" />
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p className="font-family-semibold" style={{ fontSize: 14, color: "#1f2937", margin: 0, textTransform: "capitalize", wordBreak: "break-word" }}>
                              {section?.type || "Transaction"}
                            </p>
                            <p className="font-family-regular" style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>
                              {section?.createdAt ? moment(section.createdAt).format("MMM DD, YYYY") : ""}
                            </p>
                          </div>
                        </div>
                        <span
                          className="font-family-semibold"
                          style={{
                            fontSize: 14,
                            color: section?.type === "deposit" ? "#059669" : "#ef4444",
                            flexShrink: 0,
                          }}
                        >
                          {section?.type === "deposit" ? "+" : "-"}${section?.amount || "0.00"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10">
                    <EmptyState
                      title="No Transactions Yet"
                      showBg={false}
                      description="You haven't made any transactions."
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
