"use client"

import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import moment from "moment";
import { MdContentCopy, MdLocalOffer } from "react-icons/md";
import { FaTag, FaGift, FaPercentage } from "react-icons/fa";
import ApiFunction from "@/components/ApiFunction/ApiFunction";

export default function CouponPage() {
  const { getData, header1 } = ApiFunction();
  const [Coupons, setCoupons] = useState([]);
  const [show, setShow] = useState(false);
  const [CouponCode, setCouponCode] = useState("");
  const [loading, setloading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleClose = () => setShow(false);

  const GetCoupns = async () => {
    try {
      const res = await getData("coupon/me/1", header1);
      if (res?.success) {
        setCoupons(res?.coupons ?? []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    GetCoupns();
  }, []);

  const handleShow = (data) => {
    setShow(true);
    setCouponCode(data);
    setCopied(false);
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [gridCols, setGridCols] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setGridCols(1);
      else if (window.innerWidth < 900) setGridCols(2);
      else if (window.innerWidth < 1200) setGridCols(3);
      else setGridCols(4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getDiscountLabel = (item) => {
    if (item?.discount_type === "percentage") return `${item.discount}% OFF`;
    if (item?.discount) return `$${item.discount} OFF`;
    return null;
  };

  const SkeletonCard = () => (
    <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ height: 4, background: "#e5e7eb" }} />
      <div style={{ padding: "18px 20px 16px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: "70%", height: 14, borderRadius: 4, background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", marginBottom: 8 }} />
            <div style={{ width: "40%", height: 11, borderRadius: 4, background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
          </div>
        </div>
        <div style={{ width: "50%", height: 10, borderRadius: 4, background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", marginTop: 12 }} />
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`bg-gradient-to-br from-brand-800 to-brand-950 ${mounted ? 'animate-fade-in-down' : 'opacity-0'}`}
        style={{
          padding: "28px 0 52px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.02)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.015)" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <span>Home</span>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>Offers</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <MdLocalOffer size={22} color="#fbbf24" />
            </div>
            <div>
              <h1 style={{ color: "#fff", fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>
                Offers
              </h1>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13.5, margin: "2px 0 0" }}>
                {loading ? "Loading offers..." : `${Coupons.length} offer${Coupons.length !== 1 ? "s" : ""} available`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "-28px auto 0", padding: "0 16px 48px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : Coupons?.length === 0 ? (
          <div style={{
            background: "#fff",
            borderRadius: 16,
            padding: "60px 24px",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "#f0f7ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <MdLocalOffer size={28} color="#004a70" opacity={0.4} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: "#1f2937", margin: "0 0 8px" }}>
              No offers available
            </h3>
            <p style={{ fontSize: 14, color: "#9ca3af", margin: 0, maxWidth: 360, marginInline: "auto" }}>
              New offers and coupons will appear here. Check back later for exciting deals!
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: 16 }}>
            {Coupons?.map((item, index) => (
              <div
                key={index}
                onClick={() => handleShow(item)}
                className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'} hover:shadow-lg hover:-translate-y-1`}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid rgba(0,0,0,0.06)",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                  animationDelay: `${100 + index * 60}ms`,
                }}
              >
                <div style={{ height: 4, background: "linear-gradient(90deg, #004a70, #006994, #f59e0b)" }} />
                <div style={{ padding: "18px 20px 16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <FaTag size={20} color="#d97706" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 15, color: "#1f2937", margin: 0, overflowWrap: "anywhere", lineHeight: 1.3 }}>
                        {item?.title}
                      </p>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, background: "#f0f7ff", borderRadius: 6, padding: "2px 8px" }}>
                        <MdContentCopy size={11} color="#004a70" />
                        <span style={{ fontSize: 12, color: "#004a70", fontWeight: 600, fontFamily: "monospace", letterSpacing: 0.5 }}>
                          {item?.code}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                        {getDiscountLabel(item) && (
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#fff",
                            background: "linear-gradient(135deg, #f59e0b, #d97706)",
                            borderRadius: 6,
                            padding: "2px 8px",
                            lineHeight: "18px",
                          }}>
                            {getDiscountLabel(item)}
                          </span>
                        )}
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>
                          Exp: {moment(item?.expirey_date).format("MMM DD, YYYY")}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#f0f7ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#004a70" strokeWidth={2} width={12} height={12}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        centered
        show={show}
        onHide={handleClose}
        style={{ borderRadius: 20, overflow: "hidden" }}
        size="sm"
      >
        <div style={{
          background: "linear-gradient(135deg, #0a2540 0%, #004a70 50%, #005f8a 100%)",
          padding: "clamp(28px, 4vw, 36px) clamp(24px, 4vw, 32px)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
          <button
            onClick={handleClose}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#fff",
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              backdropFilter: "blur(4px)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; e.currentTarget.style.transform = "rotate(90deg)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "rotate(0deg)"; }}
          >
            ✕
          </button>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <FaGift size={28} color="#fbbf24" />
          </div>
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Special Offer
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, margin: 0 }}>
            Use this coupon code to save
          </p>
        </div>

        <div style={{ padding: "clamp(20px, 3vw, 28px)", textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: "#4b5563", margin: "0 0 14px", overflowWrap: "anywhere" }}>
            {CouponCode?.title}
          </p>

          {getDiscountLabel(CouponCode) && (
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "linear-gradient(135deg, #fef3c7, #fde68a)",
              borderRadius: 8,
              padding: "4px 14px",
              marginBottom: 14,
            }}>
              <FaPercentage size={12} color="#d97706" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>
                {getDiscountLabel(CouponCode)}
              </span>
            </div>
          )}

          <div style={{
            background: "#f1f5f9",
            border: "1.5px dashed #94a3b8",
            borderRadius: 12,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <MdContentCopy size={16} color="#64748b" />
              <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", fontFamily: "monospace", letterSpacing: 2 }}>
                {CouponCode?.code}
              </span>
            </div>
            <button
              onClick={() => handleCopy(CouponCode?.code)}
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                background: copied ? "#059669" : "#004a70",
                border: "none",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { if (!copied) e.currentTarget.style.background = "#003353"; }}
              onMouseLeave={(e) => { if (!copied) e.currentTarget.style.background = "#004a70"; }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
            Expires: {moment(CouponCode?.expirey_date).format("MMM DD, YYYY")}
          </p>
        </div>
      </Modal>
    </>
  );
}
