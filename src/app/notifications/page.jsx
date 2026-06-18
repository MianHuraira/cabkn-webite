"use client";
import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  FaCheckDouble,
  FaExclamationCircle,
  FaCheckCircle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";
import { MdNotificationsActive, MdNotificationsNone } from "react-icons/md";
import { IoMdTime } from "react-icons/io";
import ApiFunction from "@/components/ApiFunction/ApiFunction";

const Page = () => {
  const { getData, header1 } = ApiFunction();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gridCols, setGridCols] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setGridCols(1);
      else setGridCols(2);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  useEffect(() => {
    GetNotifications();
  }, []);

  const GetNotifications = async () => {
    try {
      const res = await getData("notification/all/", header1);
      if (res?.success) {
        setNotifications(res?.notifications || []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "error":
        return <FaExclamationCircle size={16} />;
      case "success":
        return <FaCheckCircle size={16} />;
      case "info":
        return <FaInfoCircle size={16} />;
      default:
        return <MdNotificationsActive size={18} />;
    }
  };

  const getNotifColor = (type) => {
    switch (type) {
      case "error":
        return { bg: "#fef2f2", icon: "#ef4444", border: "#fecaca" };
      case "success":
        return { bg: "#f0fdf4", icon: "#22c55e", border: "#bbf7d0" };
      case "info":
        return { bg: "#eff6ff", icon: "#3b82f6", border: "#bfdbfe" };
      default:
        return { bg: "#f0f7ff", icon: "#004a70", border: "#b8d4e3" };
    }
  };

  const formatTime = (date) => {
    const now = moment();
    const notifDate = moment(date);
    const diffHours = now.diff(notifDate, "hours");

    if (diffHours < 1) return notifDate.fromNow();
    if (diffHours < 24) return notifDate.fromNow();
    if (diffHours < 168) return notifDate.format("dddd [at] h:mm A");
    return notifDate.format("MMM D, YYYY [at] h:mm A");
  };

  const getTimeColor = (date) => {
    const diffHours = moment().diff(moment(date), "hours");
    if (diffHours < 1) return "#22c55e";
    if (diffHours < 24) return "#f59e0b";
    return "#9ca3af";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fc" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0a2540 0%, #004a70 40%, #005f8a 100%)",
          padding: "clamp(20px, 4vw, 32px) 0 clamp(40px, 6vw, 56px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
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
          {/* Breadcrumb */}
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
            <span style={{ color: "rgba(255,255,255,0.8)" }}>Notifications</span>
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
                <MdNotificationsActive size="clamp(20px, 3vw, 26px)" color="#fff" />
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
                  Notifications
                </h1>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(12px, 2vw, 14px)", margin: "2px 0 0", fontWeight: 400, wordBreak: "break-word" }}>
                  Stay updated with your latest activity
                </p>
              </div>
            </div>

            {notifications.length > 0 && (
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
                <span style={{ color: "#fbbf24", fontSize: 14, fontWeight: 700, lineHeight: 1 }}>
                  {notifications.length}
                </span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 500, lineHeight: 1, whiteSpace: "nowrap" }}>
                  new
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "-32px auto 0", padding: "0 clamp(12px, 3vw, 24px) clamp(40px, 6vw, 64px)" }}>
        {/* Loading state */}
        {loading ? (
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
                  display: "flex",
                  gap: "clamp(10px, 1.5vw, 14px)",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "clamp(36px, 5vw, 44px)",
                    height: "clamp(36px, 5vw, 44px)",
                    borderRadius: "clamp(10px, 1.5vw, 12px)",
                    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      width: "60%",
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
                      width: "85%",
                      height: 12,
                      borderRadius: 6,
                      background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                      marginBottom: 6,
                    }}
                  />
                  <div
                    style={{
                      width: "40%",
                      height: 10,
                      borderRadius: 6,
                      background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          /* Empty state */
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
                background: "linear-gradient(135deg, #f0f7ff, #e8f4f8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                position: "relative",
              }}
            >
              <MdNotificationsNone size={40} color="#004a70" opacity={0.35} />
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
              No notifications yet
            </h3>
            <p style={{ fontSize: "clamp(13px, 2.5vw, 14px)", color: "#9ca3af", margin: "0 auto", maxWidth: 400, padding: "0 12px", lineHeight: 1.6, wordBreak: "break-word" }}>
              You're all caught up! When you receive notifications, they'll show up here.
            </p>
          </div>
        ) : (
          /* Notification list */
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: 12 }}>
            {notifications.map((notification, index) => {
              const colors = getNotifColor(notification.type);
              return (
                <div
                  key={notification.id || index}
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    border: `1px solid ${notification.isRead ? "rgba(0,0,0,0.04)" : colors.border}`,
                    padding: "clamp(12px, 2vw, 18px)",
                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: notification.isRead
                      ? "0 1px 2px rgba(0,0,0,0.03)"
                      : `0 2px 8px ${colors.border}40`,
                    display: "flex",
                    gap: "clamp(10px, 1.5vw, 14px)",
                    alignItems: "flex-start",
                    opacity: 0,
                    animation: `fade-in-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.05}s forwards`,
                    position: "relative",
                    borderLeft: notification.isRead
                      ? "3px solid transparent"
                      : `3px solid ${colors.icon}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.07)";
                    e.currentTarget.style.transform = "translateY(-2px) scale(1.002)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = notification.isRead
                      ? "0 1px 2px rgba(0,0,0,0.03)"
                      : `0 2px 8px ${colors.border}40`;
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: "clamp(36px, 5vw, 44px)",
                      height: "clamp(36px, 5vw, 44px)",
                      borderRadius: "clamp(10px, 1.5vw, 12px)",
                      background: colors.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: colors.icon,
                      transition: "transform 0.2s",
                    }}
                  >
                    {notification.image ? (
                      <img
                        src={notification.image}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "clamp(10px, 1.5vw, 12px)",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      getNotifIcon(notification.type)
                    )}
                  </div>

                  {/* Content */}
                  {gridCols === 1 ? (
                    /* Mobile: full vertical stack */
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
                        {!notification.isRead && <UnreadDot color={colors.icon} />}
                        <p style={titleStyle(notification.isRead)}>{notification.title}</p>
                      </div>
                      <p style={descStyle}>{notification.description}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <span />
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              color: getTimeColor(notification.createdAt),
                            }}
                          >
                            <IoMdTime size={11} />
                            <span
                              style={{ fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}
                              title={moment(notification.createdAt).format("MMMM D, YYYY [at] h:mm A")}
                            >
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          {!notification.isRead && <TickButton />}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Desktop: time on right */
                    <div style={{ flex: 1, minWidth: 0, display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {!notification.isRead && <UnreadDot color={colors.icon} />}
                          <p style={titleStyle(notification.isRead)}>{notification.title}</p>
                        </div>
                        <p style={descStyle}>{notification.description}</p>
                      </div>
                      <TimeRow
                        createdAt={notification.createdAt}
                        isRead={notification.isRead}
                        getTimeColor={getTimeColor}
                        formatTime={formatTime}
                      />
                    </div>
                  )}
                </div>
              );
            })}


          </div>
        )}
      </div>
    </div>
  );
};

const TickButton = () => (
  <button
    style={{
      width: 26,
      height: 26,
      borderRadius: 8,
      border: "none",
      background: "#f0f7ff",
      color: "#004a70",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.15s",
      fontSize: 10,
    }}
    title="Mark as read"
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "#004a70";
      e.currentTarget.style.color = "#fff";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "#f0f7ff";
      e.currentTarget.style.color = "#004a70";
    }}
  >
    <FaCheckDouble size={10} />
  </button>
);

const UnreadDot = ({ color }) => (
  <span
    style={{
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: color,
      flexShrink: 0,
      display: "inline-block",
    }}
  />
);

const titleStyle = (isRead) => ({
  fontWeight: isRead ? 500 : 650,
  fontSize: "clamp(13px, 2vw, 15px)",
  color: "#1f2937",
  margin: 0,
  wordBreak: "break-word",
  lineHeight: 1.4,
});

const descStyle = {
  fontSize: "clamp(12px, 1.8vw, 13.5px)",
  color: "#6b7280",
  margin: "3px 0 0",
  lineHeight: 1.5,
  overflowWrap: "anywhere",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const TimeRow = ({ createdAt, isRead, getTimeColor, formatTime }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 4,
      flexShrink: 0,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        color: getTimeColor(createdAt),
      }}
    >
      <IoMdTime size={11} />
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
        title={moment(createdAt).format("MMMM D, YYYY [at] h:mm A")}
      >
        {formatTime(createdAt)}
      </span>
    </div>
    {!isRead && (
      <button
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          border: "none",
          background: "#f0f7ff",
          color: "#004a70",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
          fontSize: 11,
        }}
        title="Mark as read"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#004a70";
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#f0f7ff";
          e.currentTarget.style.color = "#004a70";
        }}
      >
        <FaCheckDouble size={11} />
      </button>
    )}
  </div>
);

export default Page;
