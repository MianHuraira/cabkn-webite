"use client";

import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaHeart, FaRegHeart, FaStar, FaUser, FaTimes } from "react-icons/fa";
import { MdArrowForward } from "react-icons/md";

const Page = () => {
  const { getData, header1, putData } = ApiFunction();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favLoadingId, setFavLoadingId] = useState(null);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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

  const getFavorites = async () => {
    setLoading(true);
    try {
      const res = await getData("users/favorite/1", header1);
      if (res?.success) {
        setFavorites(res?.users);
      }
    } catch (error) {
      console.log("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const addRideToFavRider = (data) => {
    let apiBody = { favUserId: data?._id };
    const encodedData = encodeURIComponent(JSON.stringify(apiBody));
    router.push(`/ride?data=${encodedData}`);
  };

  const onAddFavorite = async (data) => {
    setFavLoadingId(data?._id);
    try {
      const res = await putData(`users/like/${data?._id}`, {}, header1);
      if (res?.message) {
        getFavorites();
      }
    } catch (error) {
      console.log("Error adding to favorites: ", error);
    } finally {
      setFavLoadingId(null);
    }
  };

  useEffect(() => {
    getFavorites();
  }, []);

  return (
    <div className={`${mounted ? 'animate-fade-in' : 'opacity-0'} `} style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div
        className={`${mounted ? 'animate-fade-in-down' : 'opacity-0'} bg-gradient-to-br from-brand-800 to-brand-950`}
        style={{
          padding: "28px 0 44px",
          animationDelay: "50ms",
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

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(12px, 3vw, 24px)", position: "relative" }}>
          <div className="font-family-medium"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            <a href="/" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>
              Home
            </a>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>Favorites</span>
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
                <FaHeart size="clamp(18px, 2.5vw, 24px)" color="#f87171" />
              </div>
              <div>
                <h1 className="font-family-bold"
                  style={{
                    color: "#fff",
                    fontSize: "clamp(20px, 5vw, 30px)",
                    margin: 0,
                    letterSpacing: "-0.5px",
                    lineHeight: 1.2,
                    wordBreak: "break-word",
                  }}
                >
                  My Favorites
                </h1>
                <p className="font-family-regular" style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(12px, 2vw, 14px)", margin: "2px 0 0", wordBreak: "break-word" }}>
                  {favorites.length} saved {favorites.length === 1 ? "driver" : "drivers"}
                </p>
              </div>
            </div>

            {favorites.length > 0 && (
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
                <FaHeart size={12} color="#f87171" />
                <span className="font-family-semibold" style={{ color: "#fff", fontSize: 13, whiteSpace: "nowrap" }}>
                  {favorites.length} saved
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "-32px auto 0", padding: "0 clamp(12px, 3vw, 24px) clamp(40px, 6vw, 64px)" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: 12 }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: "clamp(16px, 2vw, 24px)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        width: "55%",
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
                    width: "100%",
                    height: 42,
                    borderRadius: 10,
                    marginTop: 16,
                    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
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
                background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                position: "relative",
              }}
            >
              <FaHeart size={36} color="#f87171" opacity={0.4} />
              <div
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "3px solid #fff",
                }}
              >
                <FaTimes size={10} color="#9ca3af" />
              </div>
            </div>
            <h3 className="font-family-bold" style={{ fontSize: "clamp(18px, 4vw, 22px)", color: "#1f2937", margin: "0 0 8px", letterSpacing: "-0.3px", wordBreak: "break-word" }}>
              No favorites yet
            </h3>
            <p className="font-family-regular" style={{ fontSize: "clamp(13px, 2.5vw, 14px)", color: "#9ca3af", margin: "0 auto", maxWidth: 400, padding: "0 12px", lineHeight: 1.6, wordBreak: "break-word" }}>
              Start adding drivers to your favorites and they will appear here for quick booking.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              gap: 12,
            }}
          >
            {favorites.map((item, index) => {
              const isFavorite = item?.likes;

              return (
                <div
                  key={item?._id}
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    border: `1px solid rgba(0,0,0,0.04)`,
                    padding: "clamp(16px, 2vw, 24px)",
                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                    opacity: 0,
                    animation: `fade-in-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.06}s forwards`,
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.07)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Top: Avatar + Info + Heart */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 12,
                          overflow: "hidden",
                          flexShrink: 0,
                          background: "#f3f4f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "2px solid #f0f0f0",
                        }}
                      >
                        {item?.image ? (
                          <img
                            src={item?.image}
                            alt={item?.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <FaUser size={20} color="#9ca3af" />
                        )}
                      </div>
                      <div>
                        <p className="font-family-semibold" style={{ fontSize: 15, color: "#1f2937", margin: 0 }}>
                          {item?.name}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 3 }}>
                          <FaStar size={12} color="#f59e0b" />
                          <span className="font-family-medium" style={{ fontSize: 12, color: "#6b7280" }}>
                            {item?.rating || "0.0"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Heart toggle */}
                    <div
                      onClick={() => onAddFavorite(item)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: isFavorite ? "#fef2f2" : "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        if (!isFavorite) {
                          e.currentTarget.style.background = "#fee2e2";
                          e.currentTarget.style.transform = "scale(1.05)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isFavorite) {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.transform = "scale(1)";
                        }
                      }}
                    >
                      {favLoadingId === item?._id ? (
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            border: "2px solid #004a70",
                            borderTopColor: "transparent",
                            borderRadius: "50%",
                            animation: "spin 0.6s linear infinite",
                          }}
                        />
                      ) : isFavorite ? (
                        <FaHeart color="#e11d48" size={14} />
                      ) : (
                        <FaRegHeart color="#9ca3af" size={14} />
                      )}
                    </div>
                  </div>

                  {/* Bottom: Request button */}
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => addRideToFavRider(item)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        padding: "8px 18px",
                        borderRadius: 8,
                        background: "#004a70",
                        border: "none",
                        color: "#fff",
                        fontSize: 13,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        whiteSpace: "nowrap",
                      }}
                      className="font-family-semibold"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#003c5a";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,74,112,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#004a70";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      Request a Ride
                      <MdArrowForward size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
