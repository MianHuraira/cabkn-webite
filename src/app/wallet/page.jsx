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
import { Spinner } from "reactstrap";
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
  const paymentCards = useSelector((state) => state.auth.paymentCards);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

  const jadAPiFunction = async () => {
    if (!cardDetails.price || !cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.email || !cardDetails.phone) {
      message.warning("Please fill all required fields");
      return;
    }
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
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8 }}>
            Home / Wallet
          </div>
          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(22px, 4vw, 28px)",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.3px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <FaWallet size={24} />
            My Wallet
          </h1>
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
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: "0 0 8px", position: "relative", zIndex: 1 }}>
                Available Balance
              </p>
              <p
                style={{
                  fontSize: "clamp(28px, 4vw, 36px)",
                  fontWeight: 700,
                  margin: 0,
                  position: "relative",
                  zIndex: 1,
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
              }}
            >
              <div
                onClick={() => setTab("Topup")}
                className={Tab !== "Topup" ? 'hover:bg-gray-100' : ''}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: Tab === "Topup" ? "#f0f7ff" : "transparent",
                  color: Tab === "Topup" ? "#004a70" : "#4b5563",
                  fontWeight: Tab === "Topup" ? 600 : 500,
                  fontSize: 14,
                  transition: "all 0.15s",
                  marginBottom: 2,
                }}
              >
                <FaWallet size={16} color={Tab === "Topup" ? "#004a70" : "#9ca3af"} />
                <span style={{ flex: 1 }}>Top Up</span>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={Tab === "Topup" ? "#004a70" : "#d1d5db"} strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div
                onClick={() => setTab("History")}
                className={Tab !== "History" ? 'hover:bg-gray-100' : ''}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: Tab === "History" ? "#f0f7ff" : "transparent",
                  color: Tab === "History" ? "#004a70" : "#4b5563",
                  fontWeight: Tab === "History" ? 600 : 500,
                  fontSize: 14,
                  transition: "all 0.15s",
                }}
              >
                <FaHistory size={16} color={Tab === "History" ? "#004a70" : "#9ca3af"} />
                <span style={{ flex: 1 }}>History</span>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={Tab === "History" ? "#004a70" : "#d1d5db"} strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className={mounted ? 'animate-fade-in-up' : 'opacity-0'} style={{ flex: 1, minWidth: 0, animationDelay: "250ms" }}>
            {Tab === "Topup" ? (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid #f0f0f0",
                  padding: "clamp(20px, 3vw, 28px)",
                }}
              >
                {/* Saved Cards */}
                {paymentCards?.length > 0 && (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#1f2937", margin: "0 0 12px" }}>
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
                            <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", margin: 0 }}>
                              {item?.email}
                            </p>
                            <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>
                              **** {item?.cardnumber?.slice(-4)}
                            </p>
                          </div>
                          <FaCheckCircle size={16} color="#059669" />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <p style={{ fontSize: 15, fontWeight: 600, color: "#1f2937", margin: "0 0 16px" }}>
                  Add Funds
                </p>

                {/* Amount Input */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>
                    Amount
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#9ca3af",
                      }}
                    >
                      $
                    </span>
                    <input
                      name="price"
                      placeholder="0.00"
                      type="number"
                      value={cardDetails.price}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: "12px 14px 12px 32px",
                        borderRadius: 10,
                        border: "1px solid #d1d5db",
                        fontSize: 16,
                        fontWeight: 600,
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Card Preview + Fields */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobileSidebar ? "1fr" : "1fr 1fr",
                    gap: 20,
                    marginBottom: 20,
                  }}
                >
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
                      <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 4 }}>
                        Card Number
                      </label>
                      <input
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: 10,
                          border: "1px solid #d1d5db",
                          fontSize: 14,
                          outline: "none",
                        }}
                        type="text"
                        name="number"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={handleInputChange}
                        maxLength="16"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 4 }}>
                        Card Holder Name
                      </label>
                      <input
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: 10,
                          border: "1px solid #d1d5db",
                          fontSize: 14,
                          outline: "none",
                        }}
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 4 }}>
                          Expiry
                        </label>
                        <input
                          style={{
                            width: "100%",
                            padding: "11px 14px",
                            borderRadius: 10,
                            border: "1px solid #d1d5db",
                            fontSize: 14,
                            outline: "none",
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
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 4 }}>
                          CVC
                        </label>
                        <input
                          style={{
                            width: "100%",
                            padding: "11px 14px",
                            borderRadius: 10,
                            border: "1px solid #d1d5db",
                            fontSize: 14,
                            outline: "none",
                          }}
                          type="text"
                          name="cvc"
                          placeholder="123"
                          value={cardDetails.cvc}
                          onChange={handleInputChange}
                          maxLength="3"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email & Phone */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobileSidebar ? "1fr" : "1fr 1fr",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 4 }}>
                      Email
                    </label>
                    <input
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: 10,
                        border: "1px solid #d1d5db",
                        fontSize: 14,
                        outline: "none",
                      }}
                      type="text"
                      name="email"
                      placeholder="email@example.com"
                      value={cardDetails.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 4 }}>
                      Phone
                    </label>
                    <input
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: 10,
                        border: "1px solid #d1d5db",
                        fontSize: 14,
                        outline: "none",
                      }}
                      type="text"
                      name="phone"
                      placeholder="+1 (___)-___-____"
                      value={cardDetails.phone}
                      onChange={handleInputChange}
                      required
                    />
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
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid #f0f0f0",
                  padding: "clamp(20px, 3vw, 28px)",
                }}
              >
                <p style={{ fontSize: 15, fontWeight: 600, color: "#1f2937", margin: "0 0 16px", paddingBottom: 12, borderBottom: "1px solid #f3f4f6" }}>
                  Transaction History
                </p>

                {TransLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                    <Spinner style={{ color: "#004a70" }} />
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
                            <p style={{ fontSize: 14, fontWeight: 600, color: "#1f2937", margin: 0, textTransform: "capitalize", wordBreak: "break-word" }}>
                              {section?.type || "Transaction"}
                            </p>
                            <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>
                              {section?.createdAt ? moment(section.createdAt).format("MMM DD, YYYY") : ""}
                            </p>
                          </div>
                        </div>
                        <span
                          style={{
                            fontWeight: 600,
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
