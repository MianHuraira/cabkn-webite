"use client";

import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { FaHeart, FaRegHeart, FaStar, FaUser } from "react-icons/fa";
import { MdArrowForward } from "react-icons/md";

const Page = () => {
  const { getData, header1, putData } = ApiFunction();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favLoadingId, setFavLoadingId] = useState(null);
  const router = useRouter();

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
    let apiBody = {
      favUserId: data?._id,
    };
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

  useEffect(() => {
    getFavorites();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #004a70 0%, #002d47 100%)",
          padding: "28px 0 44px",
        }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8 }}>
            Home / Favorites
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
                }}
              >
                My Favorites
              </h1>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: "4px 0 0" }}>
                {favorites.length} saved {favorites.length === 1 ? "driver" : "drivers"}
              </p>
            </div>
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
              <FaHeart size={14} color="#f87171" />
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>
                {favorites.length} Favorites
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: "-24px auto 0", padding: "0 16px 48px" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "80px 0",
            }}
          >
            <Spinner
              animation="border"
              style={{ width: 40, height: 40, color: "#004a70" }}
            />
          </div>
        ) : favorites.length === 0 ? (
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
              <FaHeart size={28} color="#004a70" opacity={0.4} />
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#1f2937",
                margin: "0 0 8px",
              }}
            >
              No favorites yet
            </h3>
            <p style={{ fontSize: 14, color: "#9ca3af", margin: 0, maxWidth: 360, marginInline: "auto" }}>
              Start adding drivers to your favorites and they will appear here for quick booking.
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
            {favorites.map((item) => {
              const isFavorite = item?.likes;

              return (
                <div
                  key={item?._id}
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    border: "1px solid #f0f0f0",
                    padding: 20,
                    transition: "all 0.25s ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 14,
                          overflow: "hidden",
                          flexShrink: 0,
                          background: "#f3f4f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {item?.image ? (
                          <img
                            src={item?.image}
                            alt={item?.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <FaUser size={22} color="#9ca3af" />
                        )}
                      </div>
                      <div>
                        <p
                          style={{
                            fontWeight: 600,
                            fontSize: 16,
                            color: "#1f2937",
                            margin: 0,
                          }}
                        >
                          {item?.name}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                          <FaStar size={13} color="#f59e0b" />
                          <span
                            style={{
                              fontSize: 13,
                              color: "#6b7280",
                              fontWeight: 500,
                            }}
                          >
                            {item?.rating || "0.0"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => onAddFavorite(item)}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: isFavorite ? "#fef2f2" : "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isFavorite ? "#fee2e2" : "#e5e7eb";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isFavorite ? "#fef2f2" : "#f3f4f6";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      {favLoadingId === item?._id ? (
                        <Spinner animation="border" size="sm" style={{ color: "#004a70", width: 16, height: 16 }} />
                      ) : isFavorite ? (
                        <FaHeart color="#e11d48" size={17} />
                      ) : (
                        <FaRegHeart color="#9ca3af" size={17} />
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: "1px solid #f3f4f6",
                    }}
                  >
                    <button
                      onClick={() => addRideToFavRider(item)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 22px",
                        borderRadius: 10,
                        background: "#004a70",
                        color: "#fff",
                        border: "none",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#003353";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,74,112,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#004a70";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      Request a Ride
                      <MdArrowForward size={16} />
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
