"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader } from "@googlemaps/js-api-loader";
import { message, Modal } from "antd";
import {
  FiX,
  FiShoppingBag,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiMapPin,
  FiCheckCircle,
  FiCreditCard,
  FiArrowRight,
  FiChevronDown,
} from "react-icons/fi";
import { IoWalletOutline } from "react-icons/io5";
import { FaMoneyBillWave } from "react-icons/fa";
import { BiCurrentLocation } from "react-icons/bi";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import axios from "axios";
import moment from "moment";

import {
  closeCart,
  updateQuantity,
  removeFromCart,
  updateCartItemDetails,
  clearCart,
} from "@/components/Redux/Slices/CartSlice";
import { setUser } from "@/components/Redux/Slices/AuthSlice";
import ApiFunction from "@/components/ApiFunction/ApiFunction";

const XCD_PER_USD = 2.7;
const CONVENIENCE_FEE_XCD = 3.0;
const SERVICE_FEE_PERCENT = 0.2; // 20%

const apiKey = process.env.NEXT_PUBLIC_JAD_API_KEY;
const apiSecret = process.env.NEXT_PUBLIC_JAD_API_SECRET;
const tokenUrl = process.env.NEXT_PUBLIC_JAD_TOKEN_URL;
const paymentUrl = process.env.NEXT_PUBLIC_JAD_PAYMENT_URL;
const jadNumber = process.env.NEXT_PUBLIC_JAD_NUMBER;

export default function CartDrawer() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isCartOpen, cartItems, totalPrice } = useSelector((state) => state.cart);
  const userData = useSelector((state) => state.auth.user);
  const paymentCards = useSelector((state) => state.auth.paymentCards) || [];
  const { postData, putData, header1 } = ApiFunction();

  // Drop Location Search State (Exact same as Signup page)
  const [dropLocation, setDropLocation] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [noData, setNoData] = useState(false);
  const [pridicLoading, setPridicLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [dropLocationError, setDropLocationError] = useState("");

  useEffect(() => {
    if (!dropLocation && (userData?.user?.address || userData?.address)) {
      setDropLocation(userData?.user?.address || userData?.address);
    }
  }, [userData]);

  // Payment Selection State
  const [selectedPayment, setSelectedPayment] = useState("Cash"); // 'Cash' | 'Wallet' | 'Card'
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  // Credit Card Form State
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
    email: userData?.user?.email || "",
    phone: userData?.user?.phone || "",
    focused: "",
  });
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState("");

  // Ensure Ant Design toast messages always appear on top of all modals
  useEffect(() => {
    message.config({
      top: 24,
      duration: 3.5,
      maxCount: 3,
      zIndex: 20000000,
    });
  }, []);

  // Price calculations
  const subtotalXCD = useMemo(() => Number(totalPrice || 0), [totalPrice]);
  const convenienceFeeXCD = subtotalXCD > 0 ? CONVENIENCE_FEE_XCD : 0;
  const serviceFeeXCD = useMemo(
    () => Number((subtotalXCD * SERVICE_FEE_PERCENT).toFixed(2)),
    [subtotalXCD]
  );
  const totalXCD = useMemo(
    () => Number((subtotalXCD + convenienceFeeXCD + serviceFeeXCD).toFixed(2)),
    [subtotalXCD, convenienceFeeXCD, serviceFeeXCD]
  );
  const totalUSD = useMemo(
    () => Number((totalXCD / XCD_PER_USD).toFixed(2)),
    [totalXCD]
  );

  const walletBalance = Number(userData?.user?.amount || 0);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  // Hide Tidio live chat when Cart drawer is open so it doesn't block the checkout button
  useEffect(() => {
    const handleTidio = () => {
      if (typeof window !== "undefined" && window.tidioChatApi) {
        if (isCartOpen) {
          window.tidioChatApi.hide();
        } else {
          window.tidioChatApi.show();
        }
      }
    };
    handleTidio();
    if (typeof window !== "undefined") {
      document.addEventListener("tidioChatApiReady", handleTidio);
      return () => {
        document.removeEventListener("tidioChatApiReady", handleTidio);
        if (typeof window !== "undefined" && window.tidioChatApi) {
          window.tidioChatApi.show();
        }
      };
    }
  }, [isCartOpen]);

  // Google Places Search (Exact logic from Signup page)
  const handleSearch = async (text) => {
    setDropLocation(text);
    setDropLocationError("");
    if (!text || !text.trim()) {
      setPredictions([]);
      setNoData(false);
      return;
    }
    setPridicLoading(true);

    const loader = new Loader({
      apiKey: "AIzaSyCkw_MZd-894MZUR4g1_p2XohCWTSTR8S4",
      version: "weekly",
    });

    try {
      await loader.importLibrary("places");

      const autocompleteService = new google.maps.places.AutocompleteService();

      autocompleteService.getPlacePredictions(
        {
          input: text,
          componentRestrictions: { country: "KN" },
        },
        async (preds, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
            const placesService = new google.maps.places.PlacesService(
              document.createElement("div")
            );
            const detailedPredictions = await Promise.all(
              preds.map(
                (prediction) =>
                  new Promise((resolve) => {
                    placesService.getDetails(
                      { placeId: prediction.place_id },
                      (result, detailsStatus) => {
                        if (
                          detailsStatus ===
                          google.maps.places.PlacesServiceStatus.OK
                        ) {
                          resolve({
                            description: prediction.description,
                            latLng: result.geometry.location.toJSON(),
                          });
                        } else {
                          resolve(null);
                        }
                      }
                    );
                  })
              )
            );
            setPredictions(detailedPredictions.filter((item) => item));
            setPridicLoading(false);
            setNoData(false);
          } else {
            console.error("Error fetching place predictions:", status);
            setNoData(true);
            setPridicLoading(false);
            setPredictions([]);
          }
        }
      );
    } catch (error) {
      console.error("Error importing Places API library:", error);
      setNoData(true);
      setPridicLoading(false);
      setPredictions([]);
    }
  };

  const handlePredictionPress = (prediction) => {
    setDropLocation(prediction?.description || "");
    setPredictions([]);
    setNoData(false);
    setDropLocationError("");
  };

  // Get Current Location via Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      message.error("Geolocation is not supported by your browser");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCkw_MZd-894MZUR4g1_p2XohCWTSTR8S4`
          );
          const data = await res.json();
          if (data.status === "OK" && data.results?.[0]) {
            const addr = data.results[0].formatted_address;
            setDropLocation(addr);
            setDropLocationError("");
          } else {
            setDropLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          }
        } catch (err) {
          setDropLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        message.warning("Could not obtain current location: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Card Inputs with Auto-Formatting
  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardError("");

    if (name === "expiry") {
      const isDeleting = value.length < (cardDetails.expiry || "").length;
      let raw = value.replace(/\D/g, "").slice(0, 4);

      if (isDeleting) {
        if (
          (cardDetails.expiry || "").endsWith("/") &&
          value === (cardDetails.expiry || "").slice(0, -1)
        ) {
          raw = raw.slice(0, -1);
        }
        setCardDetails((prev) => ({ ...prev, expiry: raw }));
        return;
      }

      let formatted = raw;
      if (raw.length === 1 && parseInt(raw, 10) > 1) {
        formatted = `0${raw}/`;
      } else if (raw.length === 2) {
        const monthNum = parseInt(raw, 10);
        if (monthNum > 12) {
          formatted = "12/";
        } else if (monthNum === 0) {
          formatted = "01/";
        } else {
          formatted = `${raw}/`;
        }
      } else if (raw.length > 2) {
        const monthPart = raw.slice(0, 2);
        const yearPart = raw.slice(2);
        const monthNum = parseInt(monthPart, 10);
        const validMonth = monthNum > 12 ? "12" : monthNum === 0 ? "01" : monthPart;
        formatted = `${validMonth}/${yearPart}`;
      }

      setCardDetails((prev) => ({ ...prev, expiry: formatted }));
      return;
    }

    if (name === "number") {
      const raw = value.replace(/\D/g, "").slice(0, 16);
      const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
      setCardDetails((prev) => ({ ...prev, number: formatted }));
      return;
    }

    if (name === "cvc") {
      const raw = value.replace(/\D/g, "").slice(0, 4);
      setCardDetails((prev) => ({ ...prev, cvc: raw }));
      return;
    }

    setCardDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardInputFocus = (e) => {
    setCardDetails((prev) => ({ ...prev, focused: e.target.name }));
  };

  // Obtain JAD Gateway Token
  const getJadToken = async () => {
    const url = `${tokenUrl}`;
    const params = new URLSearchParams({
      apikey: apiKey,
      secret: apiSecret,
      grant_type: "credentials",
    });
    const res = await fetch(`${url}?${params.toString()}`, { method: "GET" });
    return await res.json();
  };

  // Submit Shop Order
  const submitShopOrder = async (paymentMethod, paymentId = "") => {
    const orderPayload = {
      cart_items: cartItems.map((item) => ({
        ...item,
        selectedColor: item.selectedColor || "",
        selectedSize: item.selectedSize || "",
        cartQuantity: item.cartQuantity || 1,
      })),
      payment_method: paymentMethod,
      subtotal_price: subtotalXCD,
      convenienceFee: convenienceFeeXCD,
      serviceFee: serviceFeeXCD,
      total_price: totalXCD,
      drop_location: dropLocation,
      ...(paymentId ? { paymentId, jadHold: true } : {}),
    };

    const res = await postData("shop-order/", orderPayload, header1);
    if (res?.success || res?.data?.success) {
      setPlacedOrderDetails({
        orderId: res?.data?.order?._id || res?.order?._id || "Placed",
        total: totalXCD,
        method: paymentMethod,
      });
      dispatch(clearCart());
      setShowCardModal(false);
      setShowSuccessModal(true);
    } else {
      throw new Error(res?.message || res?.data?.message || "Order creation failed");
    }
  };

  // Checkout Execution
  const handleProceedCheckout = async () => {
    if (!userData?.token) {
      message.error("Please log in to place an order");
      router.push("/auth/login");
      dispatch(closeCart());
      return;
    }

    if (!dropLocation.trim()) {
      setDropLocationError("Please select or type your delivery drop location");
      message.warning("Please provide delivery drop location");
      return;
    }

    if (cartItems.length === 0) {
      message.warning("Your cart is empty");
      return;
    }

    setIsCheckingOut(true);

    try {
      if (selectedPayment === "Cash") {
        await submitShopOrder("Cash");
      } else if (selectedPayment === "Wallet") {
        if (walletBalance < totalXCD) {
          message.error(
            `Insufficient wallet balance. You have $${walletBalance.toFixed(
              2
            )} XCD but need $${totalXCD.toFixed(2)} XCD.`
          );
          setIsCheckingOut(false);
          return;
        }

        // Deduct from Wallet
        const payRes = await putData(
          "users/order-wallet-payment",
          { amount: totalXCD },
          header1
        );
        if (!payRes?.success) {
          throw new Error(payRes?.message || "Wallet payment failed");
        }

        // Update Redux User state
        dispatch(
          setUser({
            token: userData.token,
            success: true,
            newUser: false,
            user: payRes.user,
          })
        );

        await submitShopOrder("Wallet");
      } else if (selectedPayment === "Card") {
        // Open Card Modal
        setShowCardModal(true);
        setIsCheckingOut(false);
        return;
      }
    } catch (err) {
      console.error(err);
      message.error(err.message || "Failed to place order. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Process Card Checkout
  const handleCardPaymentSubmit = async (e) => {
    e.preventDefault();
    setCardLoading(true);

    try {
      const tokenRes = await getJadToken();
      if (tokenRes?.result !== "Success") {
        throw new Error("Unable to obtain payment gateway token");
      }

      const token = tokenRes.data.token;
      const cleanNumber = (cardDetails.number || "").replace(/\D/g, "");
      const [month, year] = (cardDetails.expiry || "").includes("/")
        ? cardDetails.expiry.split("/")
        : [cardDetails.expiry.slice(0, 2), cardDetails.expiry.slice(2)];

      const nameParts = (cardDetails.name || "").trim().split(" ");
      const firstName = nameParts[0] || "Customer";
      const lastName = nameParts.slice(1).join(" ") || "Shopper";

      const payData = {
        live: "1",
        timestamp: moment().format("YYYYMMDDHHmmss"),
        refnum: "202",
        jadnumber: jadNumber,
        amount: totalXCD.toFixed(2),
        cardnumber: cleanNumber,
        cardexpmonth: month?.trim() || "",
        cardexpyear: year?.trim() || "",
        cardcvv: (cardDetails.cvc || "").trim(),
        cardfirstname: firstName,
        cardlastname: lastName,
        address: dropLocation,
        city: "Basseterre",
        state: "St. Kitts",
        postalcode: "00000",
        country: "KN",
        email: cardDetails.email || userData?.user?.email || "customer@cabkn.com",
        phone: cardDetails.phone || userData?.user?.phone || "0000000000",
      };

      const postParams = new URLSearchParams({
        token: token,
        paydata: JSON.stringify(payData),
      }).toString();

      const payRes = await axios.post(paymentUrl, postParams, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (payRes.data?.result === "Success" && payRes.data?.refid) {
        const paymentRef = payRes.data.refid;

        // Record card payment on backend
        await putData(
          "users/order-card-payment",
          { paymentId: paymentRef, amount: totalXCD },
          header1
        );

        // Submit shop order with Paid method
        await submitShopOrder("Paid", paymentRef);
      } else {
        const errMsg = payRes.data?.message || "Card payment transaction was declined";
        setCardError(errMsg);
        message.error(errMsg);
      }
    } catch (err) {
      console.error("Card payment error:", err);
      const errMsg = err.message || "Failed to process card payment";
      setCardError(errMsg);
      message.error(errMsg);
    } finally {
      setCardLoading(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Suppress third-party live chat widgets (Tidio) from blocking drawer checkout buttons */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #tidio-chat,
            #tidio-chat-iframe,
            div[id*="tidio-chat"] {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
          `,
        }}
      />

      {/* ===== BACKDROP (Highest z-index to cover fixed Header and all page content) ===== */}
      <div
        onClick={() => dispatch(closeCart())}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        style={{ zIndex: 999980 }}
      />

      {/* ===== SLIDE-OVER DRAWER (Rendered above backdrop & fixed headers) ===== */}
      <div
        className="fixed inset-y-0 right-0 max-w-full flex"
        style={{ zIndex: 999990 }}
      >
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-in-right h-full">
          
          {/* 1. DRAWER HEADER */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#004a70] text-white flex items-center justify-center shadow-xs">
                <FiShoppingBag size={18} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-family-semibold text-slate-800 m-0 leading-tight">
                  Shopping Cart
                </h2>
                <span className="text-xs text-slate-500 font-family-regular">
                  {cartItems.reduce((sum, item) => sum + (item.cartQuantity || 1), 0)} items selected
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => dispatch(closeCart())}
              className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer border-none"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* 2. DRAWER BODY */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                  <FiShoppingBag size={36} />
                </div>
                <h3 className="text-lg font-family-semibold text-slate-700 m-0">
                  Your cart is empty
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1 mb-6 font-family-regular">
                  Explore our Saint Kitts products, souvenirs & apparel and add them to your cart.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(closeCart());
                    router.push("/serviceLocations");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#004a70] text-white text-xs font-family-semibold shadow-md hover:bg-[#003855] transition-all cursor-pointer border-none flex items-center gap-2"
                >
                  <span>Explore Shop</span>
                  <FiArrowRight size={14} />
                </button>
              </div>
            ) : (
              <>
                {/* CART ITEMS LIST */}
                <div className="space-y-3">
                  {cartItems.map((item, idx) => {
                    const unitPrice = Number(item.location_price || item.price || 0);
                    const itemQty = item.cartQuantity || 1;
                    const maxStock = Number(item.quantity || 99);
                    const linePrice = unitPrice * itemQty;
                    const imageSrc = item.images?.[0] || item.image || "/placeholder.png";

                    return (
                      <div
                        key={`${item._id}-${item.selectedColor}-${item.selectedSize}-${idx}`}
                        className="p-3 sm:p-3.5 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 transition-all shadow-xs flex gap-3 sm:gap-3.5 items-start"
                      >
                        {/* Thumbnail */}
                        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden relative shrink-0">
                          <img
                            src={imageSrc}
                            alt={item.title || "Product"}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs sm:text-[13.5px] font-family-semibold text-slate-800 line-clamp-1 m-0">
                                {item.title || item.name}
                              </h4>
                              {item.category?.name && (
                                <span className="text-[10px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded font-family-medium inline-block mt-0.5">
                                  {item.category.name}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                dispatch(
                                  removeFromCart({
                                    productId: item._id,
                                    selectedColor: item.selectedColor,
                                    selectedSize: item.selectedSize,
                                  })
                                )
                              }
                              title="Remove item"
                              className="text-slate-400 hover:text-rose-500 transition-colors p-1 border-none bg-transparent cursor-pointer"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>

                          {/* Color / Size Selector / Display */}
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            {Array.isArray(item.color) && item.color.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400">Color:</span>
                                <select
                                  value={item.selectedColor || ""}
                                  onChange={(e) =>
                                    dispatch(
                                      updateCartItemDetails({
                                        productId: item._id,
                                        selectedColor: e.target.value,
                                        oldColor: item.selectedColor,
                                        oldSize: item.selectedSize,
                                      })
                                    )
                                  }
                                  className="text-[11px] bg-slate-50 border border-slate-200 rounded px-1 py-0.5 font-family-medium text-slate-700 focus:outline-none"
                                >
                                  {item.color.map((c) => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {Array.isArray(item.size) && item.size.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400">Size:</span>
                                <select
                                  value={item.selectedSize || ""}
                                  onChange={(e) =>
                                    dispatch(
                                      updateCartItemDetails({
                                        productId: item._id,
                                        selectedSize: e.target.value,
                                        oldColor: item.selectedColor,
                                        oldSize: item.selectedSize,
                                      })
                                    )
                                  }
                                  className="text-[11px] bg-slate-50 border border-slate-200 rounded px-1 py-0.5 font-family-medium text-slate-700 focus:outline-none"
                                >
                                  {item.size.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>

                          {/* Price & Quantity Controls */}
                          <div className="flex items-center justify-between pt-1">
                            <div>
                              <span className="text-xs sm:text-[13px] font-family-semibold text-[#004a70]">
                                ${linePrice.toFixed(2)} XCD
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                ≈ ${(linePrice / XCD_PER_USD).toFixed(2)} USD
                              </span>
                            </div>

                            {/* Stepper */}
                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
                              <button
                                type="button"
                                onClick={() =>
                                  dispatch(
                                    updateQuantity({
                                      productId: item._id,
                                      quantity: itemQty - 1,
                                      selectedColor: item.selectedColor,
                                      selectedSize: item.selectedSize,
                                    })
                                  )
                                }
                                className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 border-none bg-transparent cursor-pointer"
                              >
                                <FiMinus size={11} />
                              </button>
                              <span className="w-7 text-center text-xs font-family-semibold text-slate-800 select-none">
                                {itemQty}
                              </span>
                              <button
                                type="button"
                                disabled={itemQty >= maxStock}
                                onClick={() => {
                                  if (itemQty < maxStock) {
                                    dispatch(
                                      updateQuantity({
                                        productId: item._id,
                                        quantity: itemQty + 1,
                                        selectedColor: item.selectedColor,
                                        selectedSize: item.selectedSize,
                                      })
                                    );
                                  } else {
                                    message.warning("Maximum stock reached");
                                  }
                                }}
                                className={`w-6 h-6 flex items-center justify-center border-none bg-transparent ${
                                  itemQty >= maxStock
                                    ? "text-slate-300 cursor-not-allowed"
                                    : "text-slate-600 hover:bg-slate-100 cursor-pointer"
                                }`}
                              >
                                <FiPlus size={11} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* DELIVERY DROP LOCATION SECTION (Exact design & logic from Signup page) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 relative">
                  <div className="flex items-center justify-between pl-0.5">
                    <label
                      htmlFor="address"
                      className="inline-block w-fit text-[13px] font-family-semibold text-slate-700 select-none cursor-pointer m-0 flex items-center gap-1.5"
                    >
                      <FiMapPin className="text-[#004a70]" size={14} />
                      <span>Address</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={geoLoading}
                      className="text-[11px] text-[#004a70] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer p-0 font-family-medium"
                    >
                      <BiCurrentLocation size={13} />
                      <span>{geoLoading ? "Locating..." : "Use GPS"}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      id="address"
                      type="text"
                      name="address"
                      placeholder="Enter your address"
                      value={dropLocation}
                      onChange={(e) => handleSearch(e.target.value)}
                      onBlur={() => {
                        setTimeout(() => {
                          setPredictions([]);
                          setNoData(false);
                        }, 250);
                      }}
                      className={`input-field ${
                        dropLocationError
                          ? "!border-rose-400 !focus:border-rose-500 !focus:ring-rose-500/20"
                          : ""
                      }`}
                      autoComplete="street-address"
                    />
                    {pridicLoading && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#004a70]" />
                      </div>
                    )}
                  </div>

                  {predictions.length > 0 && (
                    <div className="absolute z-50 left-3.5 right-3.5 mt-1 max-h-52 overflow-y-auto rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md py-1.5 shadow-xl">
                      {predictions.map((prediction, idx) => (
                        <div
                          key={idx}
                          onClick={() => handlePredictionPress(prediction)}
                          className="font-family-regular w-full text-left px-4 py-2.5 text-[13.5px] text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          {prediction.description}
                        </div>
                      ))}
                    </div>
                  )}

                  {noData && (
                    <div className="font-family-regular absolute z-50 left-3.5 right-3.5 mt-1 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md py-2.5 px-4 shadow-xl text-[13.5px] text-slate-500">
                      No results found
                    </div>
                  )}

                  {dropLocationError ? (
                    <p className="text-[11px] text-rose-500 font-family-medium mt-0.5 pl-1 m-0">
                      {dropLocationError}
                    </p>
                  ) : null}
                </div>

                {/* PAYMENT METHOD SELECTOR */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-100 space-y-2">
                  <label className="text-xs font-family-semibold text-slate-700 block m-0">
                    Payment Method
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Cash */}
                    <div
                      onClick={() => setSelectedPayment("Cash")}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                        selectedPayment === "Cash"
                          ? "border-[#004a70] bg-sky-50/50 text-[#004a70] font-family-semibold shadow-xs"
                          : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <FaMoneyBillWave size={16} />
                      <span className="text-[11px]">Cash</span>
                    </div>

                    {/* Wallet */}
                    <div
                      onClick={() => setSelectedPayment("Wallet")}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                        selectedPayment === "Wallet"
                          ? "border-[#004a70] bg-sky-50/50 text-[#004a70] font-family-semibold shadow-xs"
                          : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <IoWalletOutline size={17} />
                      <span className="text-[11px]">Wallet</span>
                      <span className="text-[9.5px] text-slate-400">
                        ${walletBalance.toFixed(0)} XCD
                      </span>
                    </div>

                    {/* Card */}
                    <div
                      onClick={() => setSelectedPayment("Card")}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                        selectedPayment === "Card"
                          ? "border-[#004a70] bg-sky-50/50 text-[#004a70] font-family-semibold shadow-xs"
                          : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <FiCreditCard size={16} />
                      <span className="text-[11px]">Card</span>
                    </div>
                  </div>
                </div>

                {/* PRICE BREAKDOWN */}
                <div className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-family-medium">${subtotalXCD.toFixed(2)} XCD</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Convenience Fee</span>
                    <span className="font-family-medium">${convenienceFeeXCD.toFixed(2)} XCD</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Service Fee (20%)</span>
                    <span className="font-family-medium">${serviceFeeXCD.toFixed(2)} XCD</span>
                  </div>
                  <div className="h-px bg-slate-200 my-1" />
                  <div className="flex justify-between text-slate-800 text-sm font-family-semibold">
                    <span>Total Amount</span>
                    <div className="text-right">
                      <span className="text-[#004a70] block">${totalXCD.toFixed(2)} XCD</span>
                      <span className="text-[10px] text-slate-400 font-family-regular">
                        ≈ ${totalUSD.toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 3. DRAWER FOOTER / CHECKOUT BUTTON */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white">
              <button
                type="button"
                onClick={handleProceedCheckout}
                disabled={isCheckingOut}
                className="w-full py-3.5 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white text-xs sm:text-sm font-family-semibold shadow-md hover:shadow-lg transition-all cursor-pointer border-none flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isCheckingOut ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed with {selectedPayment} • ${totalXCD.toFixed(2)} XCD</span>
                    <FiArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== JAD CREDIT/DEBIT CARD PAYMENT MODAL ===== */}
      <Modal
        open={showCardModal}
        onCancel={() => setShowCardModal(false)}
        footer={null}
        centered
        width={440}
        zIndex={1000000}
        styles={{ body: { padding: "20px 24px" } }}
      >
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-base font-family-semibold text-slate-800 m-0">
              Credit / Debit Card Checkout
            </h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Total: ${totalXCD.toFixed(2)} XCD (≈ ${totalUSD.toFixed(2)} USD)
            </p>
          </div>

          {/* Interactive Card Visual */}
          <div className="mb-2">
            <Cards
              number={cardDetails.number}
              name={cardDetails.name || "CARDHOLDER"}
              expiry={cardDetails.expiry}
              cvc={cardDetails.cvc}
              focused={cardDetails.focused}
            />
          </div>

          <form onSubmit={handleCardPaymentSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-family-medium text-slate-600 block mb-1">
                Card Number
              </label>
              <input
                type="tel"
                name="number"
                placeholder="•••• •••• •••• ••••"
                value={cardDetails.number}
                onChange={handleCardInputChange}
                onFocus={handleCardInputFocus}
                maxLength={19}
                required
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#004a70]"
              />
            </div>

            <div>
              <label className="text-[11px] font-family-medium text-slate-600 block mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Full name as on card"
                value={cardDetails.name}
                onChange={handleCardInputChange}
                onFocus={handleCardInputFocus}
                required
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#004a70]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-family-medium text-slate-600 block mb-1">
                  Expiry (MM/YY)
                </label>
                <input
                  type="text"
                  name="expiry"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={handleCardInputChange}
                  onFocus={handleCardInputFocus}
                  maxLength={5}
                  required
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#004a70]"
                />
              </div>

              <div>
                <label className="text-[11px] font-family-medium text-slate-600 block mb-1">
                  CVC / CVV
                </label>
                <input
                  type="tel"
                  name="cvc"
                  placeholder="•••"
                  value={cardDetails.cvc}
                  onChange={handleCardInputChange}
                  onFocus={handleCardInputFocus}
                  maxLength={4}
                  required
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#004a70]"
                />
              </div>
            </div>

            {cardError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-family-medium flex items-center gap-2">
                <span className="text-sm">⚠️</span>
                <span>{cardError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={cardLoading}
              className="w-full py-3 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white text-xs font-family-semibold shadow-md transition-all cursor-pointer border-none flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {cardLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Processing Card...</span>
                </>
              ) : (
                <span>Pay ${totalXCD.toFixed(2)} XCD Now</span>
              )}
            </button>
          </form>
        </div>
      </Modal>

      {/* ===== ORDER SUCCESS CELEBRATION MODAL ===== */}
      <Modal
        open={showSuccessModal}
        onCancel={() => {
          setShowSuccessModal(false);
          dispatch(closeCart());
        }}
        footer={null}
        centered
        width={400}
        zIndex={1000000}
        styles={{ body: { padding: "28px 24px" } }}
      >
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-100 animate-bounce">
            <FiCheckCircle size={28} />
          </div>

          <h3 className="text-lg font-family-semibold text-slate-800 m-0">
            Order Placed Successfully!
          </h3>

          <p className="text-xs text-slate-500 max-w-xs mx-auto font-family-regular leading-relaxed m-0">
            Your shop order has been confirmed. The store will prepare your items for delivery to{" "}
            <span className="font-family-medium text-slate-700">{dropLocation}</span>.
          </p>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Total Paid:</span>
              <span className="font-family-semibold text-slate-800">${placedOrderDetails?.total} XCD</span>
            </div>
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="font-family-medium text-brand-600">{placedOrderDetails?.method}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                dispatch(closeCart());
                router.push("/admin?category=shop");
              }}
              className="w-full py-2.5 rounded-xl bg-[#004a70] text-white text-xs font-family-semibold shadow-md hover:bg-[#003855] transition-all cursor-pointer border-none"
            >
              View in My Bookings
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                dispatch(closeCart());
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-family-medium hover:bg-slate-200 transition-all cursor-pointer border-none"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
