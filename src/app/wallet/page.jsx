"use client";
import React, { useEffect, useState } from "react";
import {
  FaWallet,
  FaHistory,
  FaPlus,
  FaCreditCard,
  FaCheckCircle,
  FaCar,
  FaCompass,
  FaGift,
  FaShoppingBag,
  FaArrowDown,
  FaReceipt,
  FaShieldAlt,
  FaCoins,
  FaLock,
} from "react-icons/fa";

import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import axios from "axios";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import moment from "moment";
import { setPaymentCards, setUser } from "@/components/Redux/Slices/AuthSlice";
import Link from "next/link";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { AuthSpinner } from "@/components/auth/AuthShell";

const apiKey = process.env.NEXT_PUBLIC_JAD_API_KEY;
const apiSecret = process.env.NEXT_PUBLIC_JAD_API_SECRET;
const tokenUrl = process.env.NEXT_PUBLIC_JAD_TOKEN_URL;
const paymentUrl = process.env.NEXT_PUBLIC_JAD_PAYMENT_URL;
const jadNumber = process.env.NEXT_PUBLIC_JAD_NUMBER;

const QUICK_AMOUNTS = [20, 50, 100, 200];
const XCD_RATE = 2.7;

/**
 * Normalizes a transaction record to match the mobile app's categorization and credit/debit rules.
 */
const normalizeTransaction = (item = {}) => {
  const rawType = String(item?.type || item?.category || item?.transactionType || "").trim();
  const lowerType = rawType.toLowerCase();
  const direction = String(item?.direction || "").toLowerCase();
  const flow = String(item?.flow || "").toLowerCase();
  const amount = Math.abs(Number(item?.amount ?? item?.price ?? 0));

  // Determine if transaction is Credit (money added into wallet) or Debit (money spent)
  const isCredit =
    direction === "credit" ||
    direction === "in" ||
    flow === "credit" ||
    lowerType.includes("deposit") || // Catches "Admin-Deposit", "deposit"
    lowerType.includes("topup") ||
    lowerType.includes("top") ||
    lowerType.includes("credit") ||
    lowerType.includes("refund");

  // Determine category visual styling & icons matching mobile CATEGORY_META
  let category = "ride";
  let label = rawType || "Transaction";
  let icon = <FaCar size={13} />;
  let iconBg = "!bg-sky-50 !text-[#004a70] !border !border-sky-100";
  let badgeClass = "!bg-sky-50 !text-[#004a70] !border !border-sky-200/70";

  if (isCredit) {
    category = "topup";
    label = lowerType.includes("admin") ? "Admin Deposit" : "Top Up";
    icon = <FaArrowDown size={13} />;
    iconBg = "!bg-emerald-50 !text-emerald-600 !border !border-emerald-100";
    badgeClass = "!bg-emerald-50 !text-emerald-700 !border !border-emerald-200/80";
  } else if (lowerType.includes("tip")) {
    category = "tip";
    label = "Driver Tip";
    icon = <FaGift size={13} />;
    iconBg = "!bg-purple-50 !text-purple-600 !border !border-purple-100";
    badgeClass = "!bg-purple-50 !text-purple-700 !border !border-purple-200/80";
  } else if (lowerType.includes("tour")) {
    category = "tour";
    label = "Tour Booking";
    icon = <FaCompass size={13} />;
    iconBg = "!bg-teal-50 !text-teal-700 !border !border-teal-100";
    badgeClass = "!bg-teal-50 !text-teal-700 !border !border-teal-200/80";
  } else if (lowerType.includes("shop") || lowerType.includes("cart") || lowerType.includes("product")) {
    category = "shop";
    label = "Shop Purchase";
    icon = <FaShoppingBag size={13} />;
    iconBg = "!bg-amber-50 !text-amber-700 !border !border-amber-100";
    badgeClass = "!bg-amber-50 !text-amber-700 !border !border-amber-200/80";
  } else if (lowerType.includes("purchase")) {
    category = "purchase";
    label = item?.title || item?.note || "Purchase";
    icon = <FaReceipt size={13} />;
    iconBg = "!bg-rose-50 !text-rose-600 !border !border-rose-100";
    badgeClass = "!bg-rose-50 !text-rose-700 !border !border-rose-200/80";
  }

  return {
    id: item?._id || item?.id,
    title: label,
    rawType,
    amount,
    isCredit,
    category,
    icon,
    iconBg,
    badgeClass,
    createdAt: item?.createdAt || item?.date || null,
    referenceId: item?.refId || item?.referenceId || "",
    paymentMethod: item?.paymentMethod || "",
    note: item?.note || "",
  };
};

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
    setCardDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const TransectionHistory = async () => {
    setTransLoading(true);
    try {
      const response = await getData("/users/transactions/1", header1);
      if (response?.success) {
        setTransectionData(response?.transactions || []);
      } else {
        message.error(response?.message || "Failed to load transactions");
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to load transactions");
    } finally {
      setTransLoading(false);
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
    setCardDetails((prev) => ({
      ...prev,
      cvc: "",
      expiry: data?.cardexpmonth ? `${data.cardexpmonth}/${data.cardexpyear}` : prev.expiry,
      name: data?.name || prev.name,
      number: formattedNumber || prev.number,
      email: data?.email || prev.email,
      phone: data?.phone || prev.phone,
    }));
  };

  const submitPayment = async (token, paydata) => {
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
  };

  async function getToken() {
    const url = `${tokenUrl}`;
    const params = new URLSearchParams({
      apikey: apiKey,
      secret: apiSecret,
      grant_type: "credentials",
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  const validate = () => {
    const errs = {};
    const cleanNumber = cardDetails.number.replace(/\D/g, "");
    if (!cardDetails.price || Number(cardDetails.price) <= 0 || Number(cardDetails.price) > 99999) {
      errs.price = "Enter a valid amount ($1 - $99,999)";
    }
    if (!cleanNumber || cleanNumber.length < 13) {
      errs.number = "Enter a valid 16-digit card number";
    }
    if (!cardDetails.name.trim()) {
      errs.name = "Card holder name is required";
    }
    if (!cardDetails.expiry || cardDetails.expiry.length < 5) {
      errs.expiry = "Enter a valid expiry (MM/YY)";
    }
    if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
      errs.cvc = "Enter a valid 3 or 4-digit CVC";
    }
    if (!cardDetails.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cardDetails.email)) {
      errs.email = "Enter a valid email address";
    }
    if (!cardDetails.phone || cardDetails.phone.length < 6) {
      errs.phone = "Enter a valid phone number";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const jadAPiFunction = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const tokenResponse = await getToken();
      if (tokenResponse?.result !== "Success") {
        throw new Error(tokenResponse?.message || "Failed to obtain token from JAD Cash");
      }

      const token = tokenResponse?.data?.token;
      if (!token) {
        throw new Error("No token returned from JAD Cash");
      }

      const dateString = cardDetails?.expiry;
      const [month, year] = dateString.split("/");
      const finalPrice = Number(cardDetails?.price) * XCD_RATE;

      const paydata = {
        live: "1",
        timestamp: moment(new Date()).format("YYYYMMDDHHmmss"),
        refnum: "101",
        jadnumber: jadNumber,
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

      const paymentResponse = await submitPayment(token, paydata);
      if (paymentResponse?.result === "Success") {
        if (paymentResponse?.refid) {
          handleUpdateUser(paymentResponse?.refid);
        } else {
          setLoading(false);
          message.success("Payment completed successfully");
        }
      } else {
        message.error(paymentResponse?.message || "Payment failed");
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      message.error(error?.response?.data?.message || error?.message || "Payment processing failed");
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
        message.success(response?.message || "Funds added to wallet successfully!");
        setLoading(false);
      } else {
        setLoading(false);
        message.error(response?.message || "Failed to update wallet balance");
      }
    } catch (error) {
      setLoading(false);
      message.error(error?.response?.data?.message || "Error updating wallet");
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
        email: "",
        phone: "",
        price: "",
      });
    } catch (error) {
      console.log("getProfile error:", error);
    }
  };

  const rawBalanceXcd = Number(userData?.amount ?? userData?.wallet ?? 0);
  const balanceUsd = rawBalanceXcd / XCD_RATE;
  const userPoints = Number(userData?.points || 0);

  return (
    <div className={`!min-h-screen !bg-[#f8fafc] font-poppins ${mounted ? "!animate-fade-in" : "!opacity-0"}`}>
      {/* ===== HERO BANNER (Matches MakeRide & BookRide) ===== */}
      <section className="!relative !overflow-hidden !bg-gradient-to-br !from-[#001726] !via-[#002842] !to-[#002f4a] !pt-28 !pb-14 sm:!pb-16 !text-white">
        <div
          className="!absolute !inset-0 !opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="!absolute !top-1/4 !-left-20 !w-80 !h-80 !bg-sky-500/10 !rounded-full !blur-[100px] !pointer-events-none" />
        <div className="!absolute !bottom-1/4 !-right-20 !w-96 !h-96 !bg-brand-500/10 !rounded-full !blur-[120px] !pointer-events-none" />

        <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !relative !z-10">
          <div className="!flex !items-center !gap-2 !text-slate-400 !text-xs !font-family-medium !mb-4">
            <Link href="/" className="!text-slate-400 hover:!text-white !transition-colors !no-underline">
              Home
            </Link>
            <span className="!text-slate-500">/</span>
            <span className="!text-slate-200 !font-family-semibold">Wallet</span>
          </div>

          <div className="!flex !flex-wrap !justify-between !items-center !gap-4">
            <div className="!flex !items-center !gap-4">
              <div className="!w-12 !h-12 !rounded-2xl !bg-white/10 !backdrop-blur-md !border !border-white/15 !flex !items-center !justify-center !shrink-0 !shadow-inner">
                <FaWallet className="!text-white !text-2xl" />
              </div>
              <div>
                <h1 className="!text-white !text-2xl sm:!text-3xl !font-family-semibold !tracking-tight !m-0 !leading-tight">
                  Customer Wallet
                </h1>
                <p className="!text-slate-300 !text-xs sm:!text-sm !mt-1 !m-0 !font-family-regular">
                  Manage your balance, add funds, and track payments in real-time
                </p>
              </div>
            </div>

            {/* Quick Balance Header Pill */}
            {/* <div className="!flex !items-center !gap-3 !bg-white/10 !backdrop-blur-md !px-4 !py-2.5 !rounded-2xl !border !border-white/15 !w-fit">
              <span className="!w-7 !h-7 !rounded-xl !bg-emerald-500/20 !text-emerald-300 !flex !items-center !justify-center !shrink-0">
                <FaCoins size={14} />
              </span>
              <div>
                <span className="!text-[10px] !text-slate-300 !font-semibold !uppercase !tracking-wider !block !leading-none">
                  Available Balance
                </span>
                <span className="!text-sm !font-bold !text-white !tracking-tight !mt-1 !block !leading-none">
                  ${rawBalanceXcd.toFixed(2)}{" "}
                  <span className="!text-[10.5px] !text-slate-300 !font-medium">XCD</span>
                </span>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* ===== CONTENT LAYOUT ===== */}
      <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !relative !z-10 !-mt-7 !pb-20">
        <div className="!flex !flex-col lg:!flex-row !gap-5 !items-start">
          {/* Left Column: Balance & Navigation Card */}
          <div className="!w-full lg:!w-[300px] !shrink-0 !space-y-3.5 lg:!sticky lg:!top-24">
            {/* Balance Hero Card */}
            <div className="!bg-white !rounded-2xl !p-5 !border !border-slate-200/90 !shadow-[0_4px_25px_rgba(0,0,0,0.04)] !relative !overflow-hidden">
              <div className="!flex !items-center !justify-between !mb-1.5">
                <span className="!text-[10.5px] !font-semibold !text-slate-400 !uppercase !tracking-wider">
                  Available Balance
                </span>
                <span className="!px-2 !py-0.5 !rounded-full !text-[9.5px] !font-semibold !bg-sky-50 !text-[#004a70] !border !border-sky-100">
                  XCD
                </span>
              </div>

              <div className="!flex !items-baseline !gap-1.5 !mb-1">
                <span className="!text-xl !font-semibold !text-slate-900 !tracking-tight">
                  ${rawBalanceXcd.toFixed(2)}
                </span>
                <span className="!text-xs !font-semibold !text-slate-400">XCD</span>
              </div>

              <p className="!text-[11.5px] !font-family-medium !text-slate-500 !m-0 !mb-3.5">
                ≈ ${balanceUsd.toFixed(2)} USD
              </p>

              {/* Bonus Points Row */}
              <div className="!pt-3 !border-t !border-slate-100 !flex !items-center !justify-between">
                <div className="!flex !items-center !gap-2.5">
                  <div className="!w-7 !h-7 !rounded-lg !bg-amber-50 !text-amber-600 !flex !items-center !justify-center !shrink-0 !border !border-amber-100">
                    <FaGift size={13} />
                  </div>
                  <div>
                    <span className="!text-[9.5px] !text-slate-400 !font-family-medium !block !leading-none">
                      Bonus Points
                    </span>
                    <span className="!text-xs !font-family-bold !text-slate-800 !leading-tight !mt-0.5 !block">
                      {userPoints}
                    </span>
                  </div>
                </div>
                <span className="!text-[10px] !font-family-semibold !text-[#004a70] !bg-brand-50/70 !px-2 !py-0.5 !rounded-md">
                  Loyalty Active
                </span>
              </div>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="!bg-white !rounded-2xl !p-1.5 !border !border-slate-200/90 !shadow-[0_2px_15px_rgba(0,0,0,0.02)] !flex !flex-col !gap-1">
              <button
                type="button"
                onClick={() => setTab("Topup")}
                className={`!w-full !flex !items-center !justify-between !px-3.5 !py-2.5 !rounded-xl !text-xs !font-family-semibold !transition-all !duration-200 !cursor-pointer !border-none ${
                  Tab === "Topup"
                    ? "!bg-[#004a70] !text-white !shadow-sm !shadow-[#004a70]/20"
                    : "!bg-transparent !text-slate-600 hover:!bg-slate-50 hover:!text-slate-900"
                }`}
              >
                <div className="!flex !items-center !gap-2.5">
                  <FaWallet size={13} className={Tab === "Topup" ? "!text-sky-300" : "!text-slate-400"} />
                  <span>Add Funds (Top Up)</span>
                </div>
                {Tab === "Topup" && <span className="!w-1.5 !h-1.5 !rounded-full !bg-white" />}
              </button>

              <button
                type="button"
                onClick={() => setTab("History")}
                className={`!w-full !flex !items-center !justify-between !px-3.5 !py-2.5 !rounded-xl !text-xs !font-family-semibold !transition-all !duration-200 !cursor-pointer !border-none ${
                  Tab === "History"
                    ? "!bg-[#004a70] !text-white !shadow-sm !shadow-[#004a70]/20"
                    : "!bg-transparent !text-slate-600 hover:!bg-slate-50 hover:!text-slate-900"
                }`}
              >
                <div className="!flex !items-center !gap-2.5">
                  <FaHistory size={13} className={Tab === "History" ? "!text-sky-300" : "!text-slate-400"} />
                  <span>Transaction History</span>
                </div>
                {Tab === "History" && <span className="!w-1.5 !h-1.5 !rounded-full !bg-white" />}
              </button>
            </div>

          
          </div>

          {/* Right Column: Main Panel */}
          <div className="!flex-1 !w-full !min-w-0">
            {Tab === "Topup" ? (
              /* TOP UP FORM */
              <div className="!bg-white !rounded-2xl !border !border-slate-200/90 !p-5 sm:!p-6 !shadow-[0_4px_25px_rgba(0,0,0,0.04)] !space-y-4">
                {/* Header */}
                <div>
                  <h2 className="!text-base sm:!text-lg !font-family-semibold !text-slate-900 !m-0">
                    Add Funds to Wallet
                  </h2>
                  <p className="!text-xs !text-slate-500 !font-family-regular !mt-1 !m-0">
                    Enter amount in USD. Your wallet will be credited in East Caribbean Dollars (XCD).
                  </p>
                </div>

                {/* Saved Cards Selection if any */}
                {paymentCards?.length > 0 && (
                  <div className="!p-3.5 !rounded-xl !bg-slate-50/70 !border !border-slate-200/80">
                    <span className="!text-[10.5px] !font-family-semibold !text-slate-600 !uppercase !tracking-wider !block !mb-2">
                      Previously Used Cards
                    </span>
                    <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-2">
                      {paymentCards.map((item, i) => (
                        <div
                          key={i}
                          onClick={() => onSelectCard(item)}
                          className="!flex !items-center !gap-2.5 !p-2.5 !rounded-lg !bg-white !border !border-slate-200 hover:!border-[#004a70] hover:!bg-sky-50/30 !cursor-pointer !transition-all !shadow-xs"
                        >
                          <FaCreditCard className="!text-[#004a70] !shrink-0" size={14} />
                          <div className="!flex-grow !min-w-0">
                            <p className="!text-xs !font-family-semibold !text-slate-800 !truncate !m-0">
                              {item?.email || "Card"}
                            </p>
                            <p className="!text-[9.5px] !text-slate-400 !font-family-medium !m-0">
                              •••• {item?.cardnumber?.slice(-4)}
                            </p>
                          </div>
                          <FaCheckCircle className="!text-emerald-500 !shrink-0" size={12} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1: Amount Selection */}
                <div className="!space-y-2.5">
                  <div className="!flex !items-center !gap-2">
                    <span className="!w-5 !h-5 !rounded-full !bg-[#004a70] !text-white !flex !items-center !justify-center !text-[10px] !font-family-bold">
                      1
                    </span>
                    <label className="!text-[11.5px] !font-family-semibold !text-slate-700 !uppercase !tracking-wider !m-0">
                      Select or Enter Amount (USD)
                    </label>
                  </div>

                  {/* Input with Currency Prefix (Matches Auth inputs) */}
                  <div className="!relative">
                    <span className="!absolute !left-3.5 !top-1/2 !-translate-y-1/2 !text-sm !font-family-bold !text-slate-400 !select-none">
                      $
                    </span>
                    <input
                      name="price"
                      type="number"
                      min="1"
                      placeholder="0.00"
                      value={cardDetails.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith("-")) return;
                        handleInputChange(e);
                      }}
                      className={`input-field !pl-7 !pr-14 !h-11 !text-[14px] !font-family-bold !text-slate-900 ${
                        formErrors.price ? "!border-rose-400 ring-1 ring-rose-400/20" : ""
                      }`}
                    />
                    <span className="!absolute !right-3.5 !top-1/2 !-translate-y-1/2 !text-xs !font-family-bold !text-slate-400 !uppercase !select-none">
                      USD
                    </span>
                  </div>

                  {/* Conversion Preview notice */}
                  {cardDetails.price && Number(cardDetails.price) > 0 && (
                    <div className="!flex !items-center !gap-1.5 !text-[11px] !font-family-semibold !text-emerald-700 !bg-emerald-50 !px-3 !py-1.5 !rounded-lg !w-fit !border !border-emerald-100">
                      <FaCheckCircle size={11} className="!text-emerald-500" />
                      <span>
                        ≈ ${(Number(cardDetails.price) * XCD_RATE).toFixed(2)} XCD will be credited to your wallet balance
                      </span>
                    </div>
                  )}

                  {formErrors.price && (
                    <p className="!text-[11px] !text-rose-500 !font-family-medium !m-0 !pl-0.5">{formErrors.price}</p>
                  )}

                  {/* Quick Amount Chips */}
                  <div className="!flex !items-center !gap-2 !flex-wrap !pt-0.5">
                    {QUICK_AMOUNTS.map((amt) => {
                      const isSelected = String(cardDetails.price) === String(amt);
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCardDetails((prev) => ({ ...prev, price: String(amt) }))}
                          className={`!px-3.5 !py-1.5 !rounded-lg !text-xs !font-family-semibold !transition-all !cursor-pointer !border ${
                            isSelected
                              ? "!bg-[#004a70] !text-white !border-[#004a70] !shadow-xs"
                              : "!bg-white !text-slate-700 !border-slate-200 hover:!border-[#004a70] hover:!bg-slate-50"
                          }`}
                        >
                          +${amt} USD
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="!h-px !bg-slate-100 !my-2" />

                {/* Step 2: Card Details */}
                <div className="!space-y-3">
                  <div className="!flex !items-center !gap-2">
                    <span className="!w-5 !h-5 !rounded-full !bg-[#004a70] !text-white !flex !items-center !justify-center !text-[10px] !font-family-bold">
                      2
                    </span>
                    <label className="!text-[11.5px] !font-family-semibold !text-slate-700 !uppercase !tracking-wider !m-0">
                      Card Details
                    </label>
                  </div>

                  <div className="!grid !grid-cols-1 lg:!grid-cols-12 !gap-4 !items-center">
                    {/* Visual Card */}
                    <div className="lg:!col-span-5 !flex !justify-center !bg-slate-50/70 !p-3 !rounded-xl !border !border-slate-200/80">
                      <Cards
                        cvc={cardDetails.cvc}
                        expiry={cardDetails.expiry}
                        name={cardDetails.name}
                        number={cardDetails.number}
                      />
                    </div>

                    {/* Inputs */}
                    <div className="lg:!col-span-7 !space-y-2.5">
                      <div>
                        <label className="!inline-block !w-fit !text-[12px] !font-family-semibold !text-slate-700 !select-none !pl-0.5 !mb-1 !cursor-pointer">
                          Card Number
                        </label>
                        <input
                          name="number"
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={cardDetails.number}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            val = val.match(/.{1,4}/g)?.join(" ") || val;
                            e.target.value = val.slice(0, 19);
                            handleInputChange(e);
                          }}
                          maxLength={19}
                          className={`input-field !h-10 !text-xs !font-family-medium ${
                            formErrors.number ? "!border-rose-400 ring-1 ring-rose-400/20" : ""
                          }`}
                        />
                        {formErrors.number && (
                          <p className="!text-[11px] !text-rose-500 !font-family-medium !mt-0.5 !pl-0.5 !m-0">
                            {formErrors.number}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="!inline-block !w-fit !text-[12px] !font-family-semibold !text-slate-700 !select-none !pl-0.5 !mb-1 !cursor-pointer">
                          Cardholder Name
                        </label>
                        <input
                          name="name"
                          type="text"
                          placeholder="John Doe"
                          value={cardDetails.name}
                          onChange={handleInputChange}
                          className={`input-field !h-10 !text-xs !font-family-medium ${
                            formErrors.name ? "!border-rose-400 ring-1 ring-rose-400/20" : ""
                          }`}
                        />
                        {formErrors.name && (
                          <p className="!text-[11px] !text-rose-500 !font-family-medium !mt-0.5 !pl-0.5 !m-0">
                            {formErrors.name}
                          </p>
                        )}
                      </div>

                      <div className="!grid !grid-cols-2 !gap-2.5">
                        <div>
                          <label className="!inline-block !w-fit !text-[12px] !font-family-semibold !text-slate-700 !select-none !pl-0.5 !mb-1 !cursor-pointer">
                            Expiry (MM/YY)
                          </label>
                          <input
                            name="expiry"
                            type="text"
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              if (val.length >= 3) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                              e.target.value = val.slice(0, 5);
                              handleInputChange(e);
                            }}
                            maxLength={5}
                            className={`input-field !h-10 !text-xs !font-family-medium ${
                              formErrors.expiry ? "!border-rose-400 ring-1 ring-rose-400/20" : ""
                            }`}
                          />
                          {formErrors.expiry && (
                            <p className="!text-[11px] !text-rose-500 !font-family-medium !mt-0.5 !pl-0.5 !m-0">
                              {formErrors.expiry}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="!inline-block !w-fit !text-[12px] !font-family-semibold !text-slate-700 !select-none !pl-0.5 !mb-1 !cursor-pointer">
                            CVC
                          </label>
                          <input
                            name="cvc"
                            type="password"
                            placeholder="123"
                            value={cardDetails.cvc}
                            onChange={handleInputChange}
                            maxLength={4}
                            className={`input-field !h-10 !text-xs !font-family-medium ${
                              formErrors.cvc ? "!border-rose-400 ring-1 ring-rose-400/20" : ""
                            }`}
                          />
                          {formErrors.cvc && (
                            <p className="!text-[11px] !text-rose-500 !font-family-medium !mt-0.5 !pl-0.5 !m-0">
                              {formErrors.cvc}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="!h-px !bg-slate-100 !my-2" />

                {/* Step 3: Contact Details */}
                <div className="!space-y-3">
                  <div className="!flex !items-center !gap-2">
                    <span className="!w-5 !h-5 !rounded-full !bg-[#004a70] !text-white !flex !items-center !justify-center !text-[10px] !font-family-bold">
                      3
                    </span>
                    <label className="!text-[11.5px] !font-family-semibold !text-slate-700 !uppercase !tracking-wider !m-0">
                      Billing Contact
                    </label>
                  </div>

                  <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-3">
                    <div>
                      <label className="!inline-block !w-fit !text-[12px] !font-family-semibold !text-slate-700 !select-none !pl-0.5 !mb-1 !cursor-pointer">
                        Email Address
                      </label>
                      <input
                        name="email"
                        type="email"
                        placeholder="yourname@example.com"
                        value={cardDetails.email}
                        onChange={handleInputChange}
                        className={`input-field !h-10 !text-xs !font-family-medium ${
                          formErrors.email ? "!border-rose-400 ring-1 ring-rose-400/20" : ""
                        }`}
                      />
                      {formErrors.email && (
                        <p className="!text-[11px] !text-rose-500 !font-family-medium !mt-0.5 !pl-0.5 !m-0">
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="!inline-block !w-fit !text-[12px] !font-family-semibold !text-slate-700 !select-none !pl-0.5 !mb-1 !cursor-pointer">
                        Phone Number
                      </label>
                      <PhoneInput
                        country={"us"}
                        value={cardDetails.phone}
                        onChange={(value) => {
                          setCardDetails((prev) => ({ ...prev, phone: value }));
                          setFormErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                        dropdownStyle={{ borderRadius: 12, padding: 6, zIndex: 100 }}
                        containerStyle={{ width: "100%" }}
                        inputStyle={{
                          width: "100%",
                          height: "40px",
                          borderRadius: "12px",
                          fontSize: "13.5px",
                          backgroundColor: "#ffffff",
                          borderColor: formErrors.phone ? "#fb7185" : "#e5e7eb",
                          fontFamily: "inherit",
                        }}
                      />
                      {formErrors.phone && (
                        <p className="!text-[11px] !text-rose-500 !font-family-medium !mt-0.5 !pl-0.5 !m-0">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button with Auth Form button styling and AuthSpinner */}
                <div className="!pt-2">
                  <button
                    type="button"
                    onClick={jadAPiFunction}
                    disabled={loading}
                    className="!group !relative !inline-flex !w-full !items-center !justify-center !gap-2 !rounded-xl !px-4 !py-2.5 !text-[13.5px] !font-family-semibold !text-white !shadow-sm !outline-none !transition-all !duration-200 !bg-[#004a70] hover:!bg-[#003856] hover:!shadow active:!scale-[0.99] disabled:!cursor-not-allowed disabled:!opacity-60 !border-none !cursor-pointer !h-11"
                  >
                    {loading ? (
                      <>
                        <AuthSpinner className="!h-4 !w-4" />
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <FaLock size={12} className="!text-sky-300" />
                        <span>
                          Pay ${cardDetails.price ? Number(cardDetails.price).toFixed(2) : "0.00"} USD & Top Up
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* TRANSACTION HISTORY */
              <div className="!bg-white !rounded-2xl !border !border-slate-200/90 !p-5 sm:!p-6 !shadow-[0_4px_25px_rgba(0,0,0,0.04)] !space-y-3.5">
                <div className="!flex !items-center !justify-between !pb-3 !border-b !border-slate-100">
                  <div className="!flex !items-center !gap-2.5">
                    <div className="!w-8 !h-8 !rounded-xl !bg-brand-50 !text-[#004a70] !flex !items-center !justify-center">
                      <FaHistory size={13} />
                    </div>
                    <div>
                      <h2 className="!text-sm sm:!text-base !font-family-semibold !text-slate-900 !m-0">
                        Transaction History
                      </h2>
                      <p className="!text-[11px] !text-slate-400 !font-family-regular !m-0">
                        All ledger activities, top-ups, and bookings
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={TransectionHistory}
                    disabled={TransLoading}
                    className="!px-3 !py-1 !rounded-lg !text-xs !font-family-semibold !text-[#004a70] !bg-sky-50 hover:!bg-sky-100 !transition-colors !border !border-sky-100 !cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>

                {TransLoading ? (
                  <div className="!space-y-2.5 !py-2">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div
                        key={item}
                        className="!animate-pulse !flex !items-center !justify-between !p-3 !rounded-xl !bg-slate-50/70 !border !border-slate-100"
                      >
                        <div className="!flex !items-center !gap-3">
                          <div className="!w-9 !h-9 !rounded-xl !bg-slate-200 !shrink-0" />
                          <div className="!space-y-1.5">
                            <div className="!h-3 !w-24 !bg-slate-200 !rounded-full" />
                            <div className="!h-2.5 !w-16 !bg-slate-150 !rounded-full" />
                          </div>
                        </div>
                        <div className="!h-4 !w-14 !bg-slate-200 !rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : TransectionData?.length > 0 ? (
                  <div className="!space-y-2">
                    {TransectionData.map((rawItem, index) => {
                      const tx = normalizeTransaction(rawItem);
                      const signedAmount = `${tx.isCredit ? "+" : "-"}$${tx.amount.toFixed(2)}`;

                      return (
                        <div
                          key={tx.id || index}
                          className="!flex !items-center !justify-between !p-3 sm:!p-3.5 !rounded-xl !border !border-slate-150/70 !bg-white hover:!bg-slate-50/50 hover:!border-slate-200 !transition-all !duration-150 !group !shadow-xs"
                        >
                          {/* Left Icon & Meta */}
                          <div className="!flex !items-center !gap-3 !min-w-0">
                            <div className={`!w-9 !h-9 !rounded-xl !flex !items-center !justify-center !shrink-0 ${tx.iconBg}`}>
                              {tx.icon}
                            </div>
                            <div className="!min-w-0">
                              <div className="!flex !items-center !gap-2 !flex-wrap">
                                <span className="!text-xs sm:!text-[13px] !font-family-semibold !text-slate-800 !truncate !leading-tight">
                                  {tx.title}
                                </span>
                                <span className={`!px-1.5 !py-0.5 !rounded-full !text-[9px] !font-family-semibold ${tx.badgeClass}`}>
                                  {tx.isCredit ? "Credit" : "Debit"}
                                </span>
                              </div>
                              <div className="!flex !items-center !gap-2 !mt-0.5 !text-[10.5px] !text-slate-400 !font-family-regular">
                                <span>
                                  {tx.createdAt ? moment(tx.createdAt).format("DD MMM YYYY • hh:mm A") : "Recent"}
                                </span>
                                {tx.referenceId && (
                                  <>
                                    <span>•</span>
                                    <span className="!truncate !max-w-[120px] !font-mono !text-[9.5px]">
                                      Ref: {tx.referenceId}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Signed Amount */}
                          <div className="!text-right !shrink-0 !ml-3">
                            <span
                              className={`!text-xs sm:!text-sm !font-family-bold !tracking-tight ${
                                tx.isCredit ? "!text-emerald-600" : "!text-red-800"
                              }`}
                            >
                              {signedAmount}
                            </span>
                            <span className="!block !text-[9.5px] !text-slate-400 !font-family-medium">
                              USD
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="!py-14 !flex !flex-col !items-center !justify-center !text-center">
                    <div className="!w-12 !h-12 !rounded-xl !bg-slate-50 !flex !items-center !justify-center !border !border-slate-200 !shadow-sm !text-slate-400 !mb-2.5">
                      <FaHistory size={18} />
                    </div>
                    <h3 className="!text-xs sm:!text-sm !font-family-semibold !text-slate-800 !m-0 !mb-1">
                      No Transactions Yet
                    </h3>
                    <p className="!text-[11px] !text-slate-400 !font-family-regular !max-w-xs !m-0 !leading-relaxed">
                      You haven't made any wallet transactions or top-ups yet. Added funds will appear here.
                    </p>
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
