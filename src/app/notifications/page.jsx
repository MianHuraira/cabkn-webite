"use client";
import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import moment from "moment";
import { FaUserAlt, FaBell, FaExternalLinkAlt } from "react-icons/fa";
import { MdNotificationsActive, MdNotificationsNone } from "react-icons/md";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { NoshowData } from "@/components/assets/Images";
import Image from "next/image";

const Page = () => {
  const { getData, header1 } = ApiFunction();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gridCols, setGridCols] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setGridCols(1);
      else if (window.innerWidth < 900) setGridCols(2);
      else setGridCols(3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const GetNotifications = async () => {
    try {
      const res = await getData("notification/all/", header1);
      if (res?.success) {
        setNotifications(res?.notifications);
        setLoading(false);
      } else {
        setNotifications([]);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    GetNotifications();
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
            Home / Notifications
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
                <MdNotificationsActive size={26} />
                Notifications
              </h1>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: "4px 0 0" }}>
                {notifications.length} {notifications.length === 1 ? "notification" : "notifications"}
              </p>
            </div>
            {notifications.length > 0 && (
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
                <FaBell size={14} color="#fbbf24" />
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>
                  {notifications.length} New
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
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
        ) : notifications.length === 0 ? (
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
              <MdNotificationsNone size={32} color="#004a70" opacity={0.4} />
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#1f2937",
                margin: "0 0 8px",
              }}
            >
              No notifications yet
            </h3>
            <p style={{ fontSize: 14, color: "#9ca3af", margin: 0, maxWidth: 360, marginInline: "auto" }}>
              You&#39;re all caught up! New notifications will appear here when you receive them.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              gap: 12,
              width: "100%",
            }}
          >
            {notifications.map((notification, index) => (
              <div
                key={notification.id || index}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid #f0f0f0",
                  padding: "14px 16px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "#f0f7ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {notification.image ? (
                    <img
                      src={notification.image}
                      alt=""
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <FaUserAlt size={18} color="#004a70" />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: 15,
                          color: "#1f2937",
                          margin: 0,
                          wordBreak: "break-word",
                        }}
                      >
                        {notification.title}
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          color: "#6b7280",
                          margin: "4px 0 0",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {notification.description}
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0, marginLeft: 8 }}>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                          whiteSpace: "nowrap",
                          fontWeight: 500,
                        }}
                      >
                        {moment(notification.createdAt).fromNow()}
                      </span>

                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
