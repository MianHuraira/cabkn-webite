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
import Link from "next/link";
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
    let rawNumber = data?.cardnumber?.replace(/\D/g, "") || "";
    let formattedNumber = rawNumber.match(/.{1,4}/g)?.join(" ") || rawNumber;
    setCardDetails({
      cvc: "",
      expiry: data?.cardexpmonth + "/" + data?.cardexpyear,
      name: data?.name,
      number: formattedNumber,
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
    const cleanNumber = cardDetails.number.replace(/\D/g, "");
    if (!cardDetails.price || Number(cardDetails.price) <= 0 || Number(cardDetails.price) > 99999) errs.price = "Enter a valid amount ($1 - $99,999)";
    if (!cleanNumber || cleanNumber.length < 13) errs.number = "Enter a valid card number";
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
      cardnumber: cardDetails.number.replace(/\D/g, ""),
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
    <div className={`min-h-screen bg-slate-50/50 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      <style>{`
        .modern-wallet-form input {
          background-color: #f8fafc80 !important;
          border: 2px solid #f1f5f9 !important;
          border-radius: 12px !important;
          padding: 12px 16px !important;
          font-size: 14px !important;
          color: #0f172a !important;
          font-weight: 500 !important;
          outline: none !important;
          box-shadow: none !important;
          transition: all 0.2s ease-in-out !important;
          width: 100% !important;
        }
        .modern-wallet-form input:focus {
          background-color: #ffffff !important;
          border-color: #004a70 !important;
          box-shadow: 0 10px 15px -3px rgba(0, 74, 112, 0.05) !important;
        }
        .modern-wallet-form .price-input {
          padding-left: 32px !important;
        }
        .modern-wallet-form .react-tel-input .form-control {
          background-color: #f8fafc80 !important;
          border: 2px solid #f1f5f9 !important;
          border-radius: 12px !important;
          padding-left: 52px !important;
          height: 48px !important;
          width: 100% !important;
          font-size: 14px !important;
          color: #0f172a !important;
          font-weight: 500 !important;
        }
        .modern-wallet-form .react-tel-input .form-control:focus {
          background-color: #ffffff !important;
          border-color: #004a70 !important;
        }
        .modern-wallet-form .react-tel-input .flag-dropdown {
          background-color: #f1f5f9 !important;
          border: 2px solid #f1f5f9 !important;
          border-right: none !important;
          border-radius: 12px 0 0 12px !important;
          height: 48px !important;
        }
      `}</style>

      {/* ===== HERO BANNER ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 !pt-28 !pb-28">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }} />
        
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: "12s" }} />
        
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-family-medium !mb-4">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
            <span className="text-slate-500">/</span>
            <span className="text-slate-200">Wallet</span>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                <FaWallet size={24} color="#fff" />
              </div>
              <div>
                <h1 className="text-white text-3xl font-family-bold tracking-tight !m-0 leading-tight">
                  My{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
                    Wallet
                  </span>
                </h1>
                <p className="text-slate-400 text-sm !mt-1 !m-0 font-family-regular">
                  Manage your balance and transactions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTENT LAYOUT ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 !-mt-12 !pb-24">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Left Sticky Sidebar */}
          <div
            className={`flex flex-col gap-4 w-full md:w-[280px] shrink-0 md:sticky md:top-28 md:self-start z-10 ${mounted ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "150ms" }}
          >
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
              <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute -bottom-7 -left-7 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
              
              <span className="text-[10px] text-slate-400 font-family-bold uppercase tracking-wider block !mb-1.5 relative z-10">
                Available Balance
              </span>
              <p className="text-2xl font-family-extrabold text-white !m-0 tracking-tight truncate relative z-10">
                ${userData?.amount?.toFixed(2) || "0.00"}
              </p>
            </div>

            {/* Sidebar Tabs */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl !border !border-slate-100 p-1.5 shadow-sm">
              <div
                onClick={() => setTab("Topup")}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  Tab === "Topup"
                    ? "bg-brand-50/60 text-brand-900 font-family-semibold"
                    : "hover:bg-slate-50 text-slate-600 font-family-medium"
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  Tab === "Topup" ? "bg-brand-900 text-white" : "bg-slate-100 text-slate-400"
                }`}>
                  <FaWallet size={12} />
                </div>
                <span className="text-xs flex-grow">Top Up</span>
                {Tab === "Topup" && <div className="w-1.5 h-1.5 rounded-full bg-brand-900" />}
              </div>
              
              <div
                onClick={() => setTab("History")}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  Tab === "History"
                    ? "bg-brand-50/60 text-brand-900 font-family-semibold"
                    : "hover:bg-slate-50 text-slate-600 font-family-medium"
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  Tab === "History" ? "bg-brand-900 text-white" : "bg-slate-100 text-slate-400"
                }`}>
                  <FaHistory size={12} />
                </div>
                <span className="text-xs flex-grow">History</span>
                {Tab === "History" && <div className="w-1.5 h-1.5 rounded-full bg-brand-900" />}
              </div>
            </div>
          </div>

          {/* Right Content Panel */}
          <div className={`flex-1 min-w-0 w-full ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "250ms" }}>
            <div className="modern-wallet-form">
              {Tab === "Topup" ? (
                <div className="bg-white rounded-3xl !border !border-slate-100 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                  
                  {/* Saved Cards */}
                  {paymentCards?.length > 0 && (
                    <div className="!mb-6">
                      <h3 className="text-xs font-family-bold text-slate-700 uppercase tracking-wider !mb-3">
                        Saved Cards
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {paymentCards?.map((item, i) => (
                          <div
                            key={i}
                            onClick={() => onSelectCard(item)}
                            className="flex items-center gap-3 p-3.5 rounded-xl !border !border-slate-100 bg-slate-50/30 hover:bg-brand-50/30 hover:!border-brand-500 cursor-pointer transition-all duration-150"
                          >
                            <FaCreditCard className="text-brand-900 shrink-0" size={18} />
                            <div className="flex-grow min-w-0">
                              <p className="text-xs font-family-semibold text-slate-750 truncate !m-0">
                                {item?.email}
                              </p>
                              <p className="text-[10px] text-slate-400 font-family-medium !mt-0.5 !m-0">
                                **** {item?.cardnumber?.slice(-4)}
                              </p>
                            </div>
                            <FaCheckCircle className="text-emerald-600 shrink-0" size={14} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step indicator */}
                  <div className="flex items-center gap-3 !mb-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-900 shadow-sm shadow-brand-900/20 animate-pulse" />
                    <div className="flex-grow h-[2px] bg-slate-100" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <div className="flex-grow h-[2px] bg-slate-100" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  </div>

                  {/* Step 1: Amount */}
                  <div className="!mb-5">
                    <div className="flex items-center gap-2 !mb-3">
                      <div className="w-6 h-6 rounded-full bg-brand-900 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-family-bold text-white">1</span>
                      </div>
                      <h4 className="text-xs font-family-bold text-slate-700 uppercase tracking-wider !m-0">Enter Amount</h4>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-family-bold text-slate-400 select-none z-10">$</span>
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
                        className={`price-input ${formErrors.price ? "!border-rose-450 ring-2 ring-rose-500/10" : ""}`}
                      />
                      {formErrors.price && <p className="text-[10px] text-rose-500 font-family-medium !mt-1.5 !m-0">{formErrors.price}</p>}
                    </div>
                    <div className="flex gap-2 !mt-3 flex-wrap">
                      {[10, 25, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCardDetails((prev) => ({ ...prev, price: amt }))}
                          className={`px-4 py-1.5 rounded-full font-family-medium text-xs transition-colors cursor-pointer border ${
                            cardDetails.price == amt
                              ? "bg-brand-900 border-brand-900 text-white font-family-semibold"
                              : "bg-white border-slate-200 text-slate-600 hover:border-brand-650"
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-100 !my-5" />

                  {/* Step 2: Card Details */}
                  <div className="!mb-5">
                    <div className="flex items-center gap-2 !mb-4">
                      <div className="w-6 h-6 rounded-full bg-brand-900 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-family-bold text-white">2</span>
                      </div>
                      <h4 className="text-xs font-family-bold text-slate-700 uppercase tracking-wider !m-0">Card Information</h4>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="flex items-center justify-center bg-slate-50/50 rounded-2xl p-4 !border !border-slate-100">
                        <Cards
                          cvc={cardDetails.cvc}
                          expiry={cardDetails.expiry}
                          name={cardDetails.name}
                          number={cardDetails.number}
                        />
                      </div>
                      <div className="space-y-3.5">
                        <div>
                          <label className="text-[10px] font-family-bold text-slate-500 uppercase tracking-wider block !mb-1.5">
                            Card Number
                          </label>
                          <input
                            className={`${formErrors.number ? "!border-rose-450 ring-2 ring-rose-500/10" : ""}`}
                            type="text" name="number" placeholder="1234 5678 9012 3456"
                            value={cardDetails.number}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, "");
                              value = value.match(/.{1,4}/g)?.join(" ") || value;
                              e.target.value = value.slice(0, 19);
                              handleInputChange(e);
                            }}
                            maxLength="19" required
                          />
                          {formErrors.number && <p className="text-[10px] text-rose-500 font-family-medium !mt-1.5 !m-0">{formErrors.number}</p>}
                        </div>
                        <div>
                          <label className="text-[10px] font-family-bold text-slate-500 uppercase tracking-wider block !mb-1.5">
                            Card Holder Name
                          </label>
                          <input
                            className={`${formErrors.name ? "!border-rose-450 ring-2 ring-rose-500/10" : ""}`}
                            type="text" name="name" placeholder="John Doe"
                            value={cardDetails.name} onChange={handleInputChange} required
                          />
                          {formErrors.name && <p className="text-[10px] text-rose-500 font-family-medium !mt-1.5 !m-0">{formErrors.name}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <label className="text-[10px] font-family-bold text-slate-500 uppercase tracking-wider block !mb-1.5">Expiry</label>
                            <input
                              className={`${formErrors.expiry ? "!border-rose-450 ring-2 ring-rose-500/10" : ""}`}
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
                            {formErrors.expiry && <p className="text-[10px] text-rose-500 font-family-medium !mt-1.5 !m-0">{formErrors.expiry}</p>}
                          </div>
                          <div>
                            <label className="text-[10px] font-family-bold text-slate-500 uppercase tracking-wider block !mb-1.5">CVC</label>
                            <input
                              className={`${formErrors.cvc ? "!border-rose-450 ring-2 ring-rose-500/10" : ""}`}
                              type="text" name="cvc" placeholder="123"
                              value={cardDetails.cvc} onChange={handleInputChange} maxLength="3" required
                            />
                            {formErrors.cvc && <p className="text-[10px] text-rose-500 font-family-medium !mt-1.5 !m-0">{formErrors.cvc}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-100 !my-5" />

                  {/* Step 3: Contact */}
                  <div className="!mb-6">
                    <div className="flex items-center gap-2 !mb-4">
                      <div className="w-6 h-6 rounded-full bg-brand-900 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-family-bold text-white">3</span>
                      </div>
                      <h4 className="text-xs font-family-bold text-slate-700 uppercase tracking-wider !m-0">Contact Details</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-family-bold text-slate-500 uppercase tracking-wider block !mb-1.5">Email</label>
                        <input
                          className={`${formErrors.email ? "!border-rose-450 ring-2 ring-rose-500/10" : ""}`}
                          type="text" name="email" placeholder="email@example.com"
                          value={cardDetails.email} onChange={handleInputChange} required
                        />
                        {formErrors.email && <p className="text-[10px] text-rose-500 font-family-medium !mt-1.5 !m-0">{formErrors.email}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-family-bold text-slate-500 uppercase tracking-wider block !mb-1.5">Phone</label>
                        <PhoneInput
                          country={"us"}
                          value={cardDetails.phone}
                          onChange={(value) => { setCardDetails((prev) => ({ ...prev, phone: value })); setFormErrors((prev) => ({ ...prev, phone: undefined })); }}
                          dropdownStyle={{ borderRadius: 12, padding: 6 }}
                          containerStyle={{ width: "100%" }}
                          inputClass={`${formErrors.phone ? "ring-2 ring-rose-500/10" : ""}`}
                        />
                        {formErrors.phone && <p className="text-[10px] text-rose-500 font-family-medium !mt-1.5 !m-0">{formErrors.phone}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Submit Add Payment */}
                  <div className="!pt-2">
                    <CustomButton
                      onClick={jadAPiFunction}
                      loading={loading}
                      style={{ width: "100%" }}
                      size="lg"
                      className="w-full h-12 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-family-semibold rounded-full shadow-lg shadow-brand-600/10 border-none transition-all duration-300"
                      startContent={<FaPlus size={12} className="!mr-2" />}
                    >
                      Add Payment
                    </CustomButton>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl !border !border-slate-100 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                  <p className="text-sm font-family-bold text-slate-900 !m-0 !mb-4 pb-3 border-b border-slate-150/60 flex items-center gap-2">
                    <FaHistory className="text-brand-900" size={14} />
                    Transaction History
                  </p>

                  {TransLoading ? (
                    <div className="space-y-4 py-2">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="animate-pulse flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
                          <div className="flex-grow">
                            <div className="h-3 w-1/3 bg-slate-100 rounded-full" />
                            <div className="h-2.5 w-1/5 bg-slate-50 rounded-full !mt-2" />
                          </div>
                          <div className="h-3 w-12 bg-slate-100 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : TransectionData?.length > 0 ? (
                    <div className="space-y-1">
                      {TransectionData?.map((section, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50/30 px-2 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                section?.type === "deposit" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-650"
                              }`}
                            >
                              {section?.type === "deposit" ? (
                                <FaPlus size={12} />
                              ) : (
                                <FaTimesCircle size={12} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-family-semibold text-slate-800 capitalize truncate !m-0">
                                {section?.type || "Transaction"}
                              </p>
                              <span className="text-[10px] text-slate-400 block !mt-0.5">
                                {section?.createdAt ? moment(section.createdAt).format("MMM DD, YYYY") : ""}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-family-bold shrink-0 ${
                              section?.type === "deposit" ? "text-emerald-600" : "text-rose-650"
                            }`}
                          >
                            {section?.type === "deposit" ? "+" : "-"}${section?.amount || "0.00"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center !border !border-slate-150/80 shadow-[0_2px_10px_rgba(0,0,0,0.01)] text-slate-450 !mb-4">
                        <FaHistory size={18} className="text-slate-450" />
                      </div>
                      <h3 className="text-sm font-family-semibold text-slate-800 !m-0 !mb-1">
                        No Transactions Yet
                      </h3>
                      <p className="text-xs text-slate-400 font-family-medium max-w-xs !m-0 leading-relaxed">
                        You haven't made any wallet transactions or top-ups yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default page;
