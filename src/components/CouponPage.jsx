"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import moment from "moment";
import { MdLocalOffer, MdContentCopy } from "react-icons/md";
import { FaTag } from "react-icons/fa";
import { IoCheckmark, IoClose, IoCopyOutline } from "react-icons/io5";
import ApiFunction from "@/components/ApiFunction/ApiFunction";

export default function CouponPage() {
  const { getData, header1 } = ApiFunction();
  const [Coupons, setCoupons] = useState([]);
  const [show, setShow] = useState(false);
  const [CouponCode, setCouponCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    setShow(false);
    setCouponCode(null);
  };

  const GetCoupons = async () => {
    try {
      setLoading(true);
      const res = await getData("coupon/me/1", header1);
      if (res?.success) {
        setCoupons(res?.coupons ?? []);
      }
    } catch (error) {
      console.log("Error loading coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetCoupons();
  }, []);

  const handleShow = (coupon) => {
    setCouponCode(coupon);
    setShow(true);
  };

  const handleCopy = (code) => {
    if (!code) return;
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(""), 2200);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  // Suppress Tidio chat and lock body scroll when modal is open
  useEffect(() => {
    if (show) {
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
  }, [show]);

  const getDiscountLabel = (item) => {
    if (!item) return null;
    if (item?.discount_type === "percentage") return `${item.discount}% OFF`;
    if (item?.discount) return `$${item.discount} OFF`;
    return null;
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-5 w-20 bg-slate-100 rounded-full" />
        <div className="h-4 w-24 bg-slate-100 rounded-md" />
      </div>
      <div className="h-5 w-3/4 bg-slate-100 rounded-md mt-2" />
      <div className="h-3.5 w-1/2 bg-slate-50 rounded-md" />
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="h-8 flex-1 bg-slate-50 rounded-xl" />
        <div className="h-8 w-16 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-poppins">
      {/* ===== HERO BANNER ===== */}
      <section
        className={`relative overflow-hidden bg-gradient-to-br from-[#001726] via-[#002f4a] to-[#001f33] !pt-20 sm:!pt-24 !pb-20 sm:!pb-24 text-white ${
          mounted ? "animate-fade-in" : "opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001726]/90 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-slate-300 text-xs font-family-medium mb-3">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors no-underline">
              Home
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-white font-family-semibold">Offers</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md !border border-white/15 text-xs font-family-medium text-sky-200 mb-2.5">
                <MdLocalOffer size={14} className="text-amber-300" />
                <span>Special Promotions</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-family-semibold text-white tracking-tight !m-0">
                Exclusive Coupons & Offers
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1.5 !m-0 font-family-regular max-w-xl">
                Apply these codes during checkout to save on rides, island excursions, and concierge services.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto bg-white/10 backdrop-blur-md !border border-white/15 px-3.5 py-2 rounded-2xl shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-family-semibold text-white">
                {loading ? "Checking offers..." : `${Coupons.length} Active Deal${Coupons.length !== 1 ? "s" : ""}`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COUPONS CONTENT GRID (Floating over hero) ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-14 relative z-20 pb-16 sm:pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : Coupons?.length === 0 ? (
          <div className="py-16 bg-white rounded-3xl border border-slate-200/80 text-center shadow-xs max-w-md mx-auto p-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 mb-3 mx-auto">
              <MdLocalOffer size={22} className="text-slate-400" />
            </div>
            <h3 className="text-base font-family-semibold text-slate-800 !m-0 mb-1">
              No Active Coupons
            </h3>
            <p className="text-xs text-slate-500 font-family-medium !m-0 leading-relaxed">
              You don't have any active promo codes right now. Please check back later for upcoming promotions!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Coupons.map((item, index) => {
              const discountLabel = getDiscountLabel(item);
              const isExpired = item?.expirey_date && moment(item.expirey_date).isBefore(moment(), "day");
              const expiryFormatted = item?.expirey_date
                ? moment(item.expirey_date).format("MMM DD, YYYY")
                : "Ongoing Offer";
              const isThisCopied = copiedCode === item?.code;

              return (
                <div
                  key={item?._id || index}
                  onClick={() => handleShow(item)}
                  className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-[#004a70]/40 shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_35px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Top Row: Discount Badge + Expiry */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {discountLabel ? (
                        <span className="inline-flex items-center text-[11px] font-family-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                          {discountLabel}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-family-semibold text-[#004a70] bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                          Promo Deal
                        </span>
                      )}

                      <span
                        className={`text-[11px] font-family-medium ${
                          isExpired ? "text-rose-500 font-family-semibold" : "text-slate-400"
                        }`}
                      >
                        {isExpired ? "Expired" : `Exp: ${expiryFormatted}`}
                      </span>
                    </div>

                    {/* Coupon Title */}
                    <h3 className="text-sm sm:text-[15px] font-family-semibold text-slate-900 group-hover:text-[#004a70] transition-colors leading-snug !m-0 line-clamp-2">
                      {item?.title || "Special Promotional Coupon"}
                    </h3>

                    {/* Description if present */}
                    {item?.description && (
                      <p className="text-xs text-slate-500 font-family-regular line-clamp-2 mt-1.5 !m-0">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom: Monospace Code Box & Quick Copy */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 bg-slate-50 border border-dashed border-slate-300/85 rounded-xl px-2.5 py-1.5 min-w-0 flex-1">
                      <FaTag size={11} className="text-[#004a70] shrink-0" />
                      <span className="font-mono text-xs font-family-semibold text-slate-800 tracking-wider truncate">
                        {item?.code}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(item?.code);
                      }}
                      className={`h-8 px-3 rounded-xl text-xs font-family-semibold border-none flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                        isThisCopied
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-[#004a70] hover:text-white text-slate-700"
                      }`}
                      title="Copy Coupon Code"
                    >
                      {isThisCopied ? (
                        <>
                          <IoCheckmark size={14} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <IoCopyOutline size={13} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== COUPON DETAILS MODAL ===== */}
      {mounted && typeof document !== "undefined" && show && CouponCode && createPortal(
        <div
          className="!fixed !inset-0 !z-[9999999] !flex !items-center !justify-center !p-4 !bg-black/75 !backdrop-blur-md !animate-fade-in"
          onClick={handleClose}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl !p-5 sm:!p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Title & Close */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="inline-flex items-center gap-1 text-[10.5px] font-family-semibold uppercase tracking-wider text-[#004a70] bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full mb-1">
                  Coupon Details
                </span>
                <h3 className="text-base sm:text-lg font-family-semibold text-slate-900 !m-0 leading-tight">
                  {CouponCode?.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer border-none transition-colors shrink-0"
              >
                <IoClose size={18} />
              </button>
            </div>

            {/* Discount Offer Banner */}
            {getDiscountLabel(CouponCode) && (
              <div className="p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 flex items-center justify-between mb-4">
                <span className="text-xs font-family-semibold text-emerald-800">Savings Discount</span>
                <span className="text-sm font-family-semibold text-emerald-900 font-mono">
                  {getDiscountLabel(CouponCode)}
                </span>
              </div>
            )}

            {/* Code Box & 1-Click Copy */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-300/90 text-center mb-4">
              <span className="text-[11px] font-family-semibold text-slate-400 uppercase tracking-widest block mb-1">
                Coupon Code
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-family-semibold text-[#004a70] tracking-widest select-all mb-3">
                {CouponCode?.code}
              </div>
              <button
                type="button"
                onClick={() => handleCopy(CouponCode?.code)}
                className={`w-full py-2.5 rounded-xl text-xs font-family-semibold border-none flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  copiedCode === CouponCode?.code
                    ? "bg-emerald-600 text-white"
                    : "bg-[#004a70] hover:bg-[#003957] text-white"
                }`}
              >
                {copiedCode === CouponCode?.code ? (
                  <>
                    <IoCheckmark size={16} />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <IoCopyOutline size={15} />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Summary Information */}
            <div className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-100 space-y-2 text-xs text-slate-600 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-family-medium">Validity</span>
                <span className="font-family-semibold text-slate-800">
                  {CouponCode?.expirey_date
                    ? moment(CouponCode.expirey_date).format("MMM DD, YYYY")
                    : "Ongoing Offer"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-family-medium">Applicable On</span>
                <span className="font-family-semibold text-slate-800">Rides, Tours & Services</span>
              </div>
            </div>

            {/* Instructions */}
            <p className="text-[11.5px] text-slate-500 font-family-regular leading-relaxed mb-4 px-1 !m-0">
              Paste this coupon code in the promo/coupon code field during booking checkout to apply your discount.
            </p>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-family-semibold transition-all cursor-pointer border-none"
            >
              Done
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
