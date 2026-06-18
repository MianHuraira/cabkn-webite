"use client"

import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import moment from "moment";
import { MdContentCopy, MdLocalOffer } from "react-icons/md";
import { Spinner } from "react-bootstrap";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import Image from "next/image";
import { Bag, cross, discount, NoshowData } from "@/components/assets/Images";
import { FaTag, FaGift } from "react-icons/fa";

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

  return (
    <>
      {/* Header */}
      <div
        className={`bg-gradient-to-br from-brand-800 to-brand-950 ${mounted ? 'animate-fade-in-down' : 'opacity-0'}`}
        style={{
          padding: "28px 0 44px",
          animationDelay: "50ms",
        }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8 }}>
            Home / Offers
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
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
                <MdLocalOffer size={26} color="#f59e0b" />
                Offers
              </h1>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: "4px 0 0" }}>
                {Coupons.length} offer{Coupons.length !== 1 ? "s" : ""} available
              </p>
            </div>
            {Coupons.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "6px 14px 6px 10px",
                }}
              >
                <FaGift size={14} color="#fbbf24" />
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>
                  {Coupons.length} Offers
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={mounted ? 'animate-fade-in' : 'opacity-0'} style={{ maxWidth: 1320, margin: "-24px auto 0", padding: "0 16px 48px" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "80px 0",
            }}
          >
            <Spinner animation="border" style={{ width: 40, height: 40, color: "#004a70" }} />
          </div>
        ) : Coupons?.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "60px 24px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: "#f0f7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <MdLocalOffer size={28} color="#004a70" opacity={0.4} />
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#1f2937",
                margin: "0 0 8px",
              }}
            >
              No offers available
            </h3>
            <p style={{ fontSize: 14, color: "#9ca3af", margin: 0, maxWidth: 360, marginInline: "auto" }}>
              New offers and coupons will appear here. Check back later for exciting deals!
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              gap: 16,
            }}
          >
            {Coupons?.map((item, index) => (
              <div
                key={index}
                onClick={() => handleShow(item)}
                className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'} hover:shadow-lg hover:-translate-y-0.5`}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid #f0f0f0",
                  padding: 20,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  position: "relative",
                  overflow: "hidden",
                  animationDelay: `${100 + index * 60}ms`,
                }}
              >
                {/* Top accent bar */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: "linear-gradient(90deg, #004a70, #f59e0b)",
                    borderRadius: "14px 14px 0 0",
                  }}
                />

                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      background: "#fefce8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FaTag size={22} color="#f59e0b" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: 15,
                        color: "#1f2937",
                        margin: 0,
                        wordBreak: "break-word",
                      }}
                    >
                      {item?.title}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#004a70",
                        fontWeight: 500,
                        margin: "6px 0 0",
                        fontFamily: "monospace",
                        letterSpacing: 0.5,
                      }}
                    >
                      {item?.code}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        margin: "6px 0 0",
                      }}
                    >
                      Expires: {moment(item?.expirey_date).format("MMM DD, YYYY")}
                    </p>
                  </div>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#f0f7ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#004a70"
                      strokeWidth={2}
                      width={14}
                      height={14}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Coupon Detail Modal */}
      <Modal
        centered
        show={show}
        onHide={handleClose}
        style={{ borderRadius: 20, overflow: "hidden" }}
        size="sm"
      >
        <div
          style={{
            background: "linear-gradient(135deg, #004a70 0%, #002d47 100%)",
            padding: "clamp(24px, 4vw, 32px)",
            textAlign: "center",
            position: "relative",
          }}
        >
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
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          >
            ✕
          </button>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              backdropFilter: "blur(4px)",
            }}
          >
            <FaGift size={26} color="#fbbf24" />
          </div>
          <h2
            style={{
              color: "#fff",
              fontSize: "clamp(18px, 3vw, 22px)",
              fontWeight: 700,
              margin: "0 0 4px",
              letterSpacing: "-0.3px",
            }}
          >
            Special Offer
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
              margin: 0,
            }}
          >
            Use this coupon code to save
          </p>
        </div>

        <div style={{ padding: "clamp(20px, 3vw, 28px)", textAlign: "center" }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#6b7280",
              margin: "0 0 12px",
              wordBreak: "break-word",
            }}
          >
            {CouponCode?.title}
          </p>

          <div
            style={{
              background: "#fefce8",
              border: "2px dashed #f59e0b",
              borderRadius: 12,
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#1f2937",
                fontFamily: "monospace",
                letterSpacing: 2,
              }}
            >
              {CouponCode?.code}
            </span>
          </div>

          <p
            style={{
              fontSize: 12,
              color: "#9ca3af",
              margin: "0 0 14px",
            }}
          >
            Expires: {moment(CouponCode?.expirey_date).format("MMM DD, YYYY")}
          </p>

          <button
            onClick={() => handleCopy(CouponCode?.code)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              background: copied ? "#059669" : "#004a70",
              border: "none",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => {
              if (!copied) e.currentTarget.style.background = "#003353";
            }}
            onMouseLeave={(e) => {
              if (!copied) e.currentTarget.style.background = "#004a70";
            }}
          >
            <MdContentCopy size={16} />
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
      </Modal>
    </>
  );
}
