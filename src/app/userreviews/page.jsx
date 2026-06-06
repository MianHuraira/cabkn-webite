"use client";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { NoshowData } from "@/components/assets/Images";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Spinner } from "reactstrap";
import { FaStar, FaStarHalfAlt, FaRegStar, FaUserCircle } from "react-icons/fa";

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

  return (
    <div className={mounted ? 'animate-fade-in' : 'opacity-0'} style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div
        className={mounted ? 'animate-fade-in-down' : 'opacity-0'}
        style={{
          background: "linear-gradient(135deg, #004a70 0%, #002d47 100%)",
          padding: "28px 0 44px",
          animationDelay: "50ms",
        }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8 }}>
            Home / Reviews
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
                <FaStar size={24} color="#f59e0b" />
                My Reviews
              </h1>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: "4px 0 0" }}>
                {Reviews.length} review{Reviews.length !== 1 ? "s" : ""}
              </p>
            </div>
            {Reviews.length > 0 && (
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
                <FaStar size={14} color="#f59e0b" />
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>
                  {avgRating} avg
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={mounted ? 'animate-fade-in' : 'opacity-0'} style={{ maxWidth: 1320, margin: "-24px auto 0", padding: "0 16px 48px" }}>
        {Loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "80px 0",
            }}
          >
            <Spinner style={{ width: 40, height: 40, color: "#004a70" }} />
          </div>
        ) : Reviews.length === 0 ? (
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
              <FaStar size={28} color="#004a70" opacity={0.4} />
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#1f2937",
                margin: "0 0 8px",
              }}
            >
              No reviews yet
            </h3>
            <p style={{ fontSize: 14, color: "#9ca3af", margin: 0, maxWidth: 360, marginInline: "auto" }}>
              Reviews from your customers will appear here once they rate your service.
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
            {Reviews.map((item, index) => (
              <div
                key={index}
                className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'} hover:shadow-lg hover:-translate-y-0.5`}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid #f0f0f0",
                  padding: 20,
                  transition: "all 0.25s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  animationDelay: `${100 + index * 60}ms`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  {item.user?.image ? (
                    <Image
                      src={item.user.image}
                      alt={item.user?.name || "User"}
                      width={44}
                      height={44}
                      style={{
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #f0f0f0",
                        width: 44,
                        height: 44,
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "#f0f7ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid #f0f0f0",
                        flexShrink: 0,
                      }}
                    >
                      <FaUserCircle size={24} color="#004a70" />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 15, color: "#1f2937", margin: 0 }}>
                      {item.user?.name || "User"}
                    </p>
                    <div style={{ display: "flex", gap: 2, alignItems: "center", marginTop: 4 }}>
                      {renderStars(item.rating || 0)}
                      <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 4 }}>
                        {item.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "#6b7280",
                    margin: 0,
                    lineHeight: 1.7,
                    wordBreak: "break-word",
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
