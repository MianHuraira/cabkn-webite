"use client";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaStar, FaStarHalfAlt, FaRegStar, FaUserCircle } from "react-icons/fa";
import { MdRateReview, MdReviews } from "react-icons/md";
import moment from "moment";

export default function Page() {
  const [Reviews, setReviews] = useState([]);
  const [Loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { getData, header1 } = ApiFunction();
  const userData = useSelector((state) => state.auth.user?.user);

  const getReviews = async () => {
    try {
      const response = await getData(
        "rating/all/" + userData?._id,
        header1
      );
      setReviews(response.ratings || []);
    } catch (error) {
      console.log("errr----", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (userData) {
      getReviews();
    }
  }, [userData]);

  const [gridCols, setGridCols] = useState(2);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setGridCols(1);
      else setGridCols(2);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push(<FaStar key={i} size={13} color="#f59e0b" />);
      else if (i === full && half)
        stars.push(<FaStarHalfAlt key={i} size={13} color="#f59e0b" />);
      else stars.push(<FaRegStar key={i} size={13} color="#d1d5db" />);
    }
    return stars;
  };

  const avgRating =
    Reviews.length > 0
      ? (Reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / Reviews.length).toFixed(1)
      : 0;

  const getRatingColor = (rating) => {
    if (rating >= 4) return "#22c55e";
    if (rating >= 3) return "#f59e0b";
    return "#ef4444";
  };

  const formatReviewDate = (date) => {
    if (!date) return "";
    const now = moment();
    const reviewDate = moment(date);
    const diffHours = now.diff(reviewDate, "hours");
    if (diffHours < 1) return reviewDate.fromNow();
    if (diffHours < 24) return reviewDate.fromNow();
    if (diffHours < 168) return reviewDate.format("dddd [at] h:mm A");
    return reviewDate.format("MMM D, YYYY");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fc" }}>
      {/* Header */}
      <div
        className="bg-gradient-to-br from-brand-800 to-brand-950"
        style={{
          padding: "28px 0 44px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 16,
            }}
          >
            <a href="/" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>
              Home
            </a>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>Reviews</span>
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
            <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 2vw, 16px)" }}>
              <div
                style={{
                  width: "clamp(40px, 6vw, 52px)",
                  height: "clamp(40px, 6vw, 52px)",
                  borderRadius: "clamp(12px, 2vw, 16px)",
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <MdRateReview size="clamp(20px, 3vw, 26px)" color="#fff" />
              </div>
              <div>
                <h1
                  style={{
                    color: "#fff",
                    fontSize: "clamp(20px, 5vw, 30px)",
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: "-0.5px",
                    lineHeight: 1.2,
                    wordBreak: "break-word",
                  }}
                >
                  Reviews
                </h1>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(12px, 2vw, 14px)", margin: "2px 0 0", fontWeight: 400, wordBreak: "break-word" }}>
                  What your customers are saying
                </p>
              </div>
            </div>

            {Reviews.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 12,
                  padding: "6px 14px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  height: 36,
                  boxSizing: "border-box",
                }}
              >
                <FaStar size={13} color="#fbbf24" />
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600, lineHeight: 1, whiteSpace: "nowrap" }}>
                  {avgRating}
                </span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 400, lineHeight: 1, whiteSpace: "nowrap" }}>
                  avg ({Reviews.length})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "-32px auto 0", padding: "0 clamp(12px, 3vw, 24px) clamp(40px, 6vw, 64px)" }}>
        {Loading ? (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: 12 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: "clamp(12px, 2vw, 20px)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", gap: "clamp(10px, 1.5vw, 14px)", alignItems: "center", marginBottom: 12 }}>
                  <div
                    style={{
                      width: "clamp(36px, 5vw, 44px)",
                      height: "clamp(36px, 5vw, 44px)",
                      borderRadius: "50%",
                      background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        width: "50%",
                        height: 14,
                        borderRadius: 6,
                        background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.5s infinite",
                        marginBottom: 8,
                      }}
                    />
                    <div
                      style={{
                        width: "35%",
                        height: 12,
                        borderRadius: 6,
                        background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.5s infinite",
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    width: "90%",
                    height: 10,
                    borderRadius: 6,
                    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                    marginBottom: 6,
                  }}
                />
                <div
                  style={{
                    width: "70%",
                    height: 10,
                    borderRadius: 6,
                    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
              </div>
            ))}
          </div>
        ) : Reviews.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px)",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              border: "1px solid rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: 24,
                background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <MdRateReview size={40} color="#d97706" opacity={0.5} />
            </div>
            <h3
              style={{
                fontSize: "clamp(18px, 4vw, 22px)",
                fontWeight: 700,
                color: "#1f2937",
                margin: "0 0 8px",
                letterSpacing: "-0.3px",
                wordBreak: "break-word",
                padding: "0 12px",
              }}
            >
              No reviews yet
            </h3>
            <p style={{ fontSize: "clamp(13px, 2.5vw, 14px)", color: "#9ca3af", margin: "0 auto", maxWidth: 400, padding: "0 12px", lineHeight: 1.6, wordBreak: "break-word" }}>
              Reviews from your customers will appear here once they rate your service.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: 12 }}>
            {Reviews.map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid rgba(0,0,0,0.04)",
                  padding: "clamp(12px, 2vw, 18px)",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                  opacity: 0,
                  animation: `fade-in-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.05}s forwards`,
                  borderLeft: `3px solid ${getRatingColor(item.rating || 0)}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.07)";
                  e.currentTarget.style.transform = "translateY(-2px) scale(1.002)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                }}
              >
                {/* User info row */}
                <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 1.5vw, 14px)", marginBottom: 12 }}>
                  {item.user?.image ? (
                    <img
                      src={item.user.image}
                      alt={item.user?.name || "User"}
                      style={{
                        width: "clamp(36px, 5vw, 44px)",
                        height: "clamp(36px, 5vw, 44px)",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #f0f0f0",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "clamp(36px, 5vw, 44px)",
                        height: "clamp(36px, 5vw, 44px)",
                        borderRadius: "50%",
                        background: "#f0f7ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid #f0f0f0",
                        flexShrink: 0,
                      }}
                    >
                      <FaUserCircle size="clamp(20px, 3vw, 24px)" color="#004a70" />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "clamp(13px, 2vw, 15px)", color: "#1f2937", margin: 0, wordBreak: "break-word", lineHeight: 1.3 }}>
                      {item.user?.name || "User"}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <div style={{ display: "flex", gap: 1, alignItems: "center" }}>
                        {renderStars(item.rating || 0)}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: getRatingColor(item.rating || 0) }}>
                        {item.rating}
                      </span>
                      {item.createdAt && (
                        <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>
                          {formatReviewDate(item.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Review text */}
                <p
                  style={{
                    fontSize: "clamp(13px, 1.8vw, 14px)",
                    color: "#6b7280",
                    margin: 0,
                    lineHeight: 1.6,
                    overflowWrap: "anywhere",
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {item.review}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
