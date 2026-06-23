/* eslint-disable react/jsx-no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
"use client";
import React, { useEffect, useState, useRef } from "react";
import { Nav, Navbar, Form, Offcanvas, Modal } from "react-bootstrap";
import { FaUser, FaCheckDouble, FaExclamationCircle, FaCheckCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";

import { message } from "antd";

import { useDispatch, useSelector } from "react-redux";
import { Badge } from "antd";
import { AiOutlineMenuFold } from "react-icons/ai";
import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import { MdNotificationsActive, MdNotificationsNone } from "react-icons/md";
import { IoHeart } from "react-icons/io5";
import moment from "moment";

import Link from "next/link";
import { AppStore, GooglePlay, logoBlue } from "../assets/Images";
import Image from "next/image";
import ApiFunction from "../ApiFunction/ApiFunction";
import { logout, setUnreadCount, setNotifUnreadCount, setNotifLastTotal } from "../Redux/Slices/AuthSlice";
import { useRouter, usePathname } from "next/navigation";
import { encryptData } from "../ApiFunction/encrypted";
import { useSocket } from "../ApiFunction/SoketProvider";
import ApiFile from "../ApiFunction/ApiFile";

const InnerHeader = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);


  const { getData, baseURL, userData, header1 } = ApiFunction();
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const unreadCount = useSelector((state) => state.auth.unreadCount);
  const notifUnreadCount = useSelector((state) => state.auth.notifUnreadCount);
  const notifLastTotalRef = useRef(0);
  const socket = useSocket();
  const { getAllConversation } = ApiFile;

  useEffect(() => {
    if (!userData?.token) return;
    const h1 = { "Content-Type": "application/json", "x-auth-token": userData.token };
    const fetchUnreadCount = async () => {
      try {
        const res = await getData(`${getAllConversation}?page=1&limit=50`, h1);
        if (res?.success) {
          const userId = userData?.user?._id || userData?._id;
          const total = (res?.conversations || []).reduce((sum, conv) => {
            const sender = conv?.lastMsg?.sender;
            const senderId = typeof sender === "object" ? sender?._id : sender;
            if (senderId && senderId !== userId && conv?.unseen > 0) {
              return sum + (Number(conv?.unseen) || 0);
            }
            return sum;
          }, 0);
          dispatch(setUnreadCount(total));
        }
      } catch (e) {
        console.error("Failed to fetch unread count", e);
      }
    };
    fetchUnreadCount();
  }, [userData?.token]);

  useEffect(() => {
    if (!socket || !userData?.token) return;
    const userId = userData?.user?._id || userData?._id;
    const handleMessage = (message) => {
      const msgSenderId = typeof message?.sender === "object" ? message?.sender?._id : message?.sender;
      if (msgSenderId && msgSenderId !== userId) {
        dispatch(setUnreadCount(unreadCount + 1));
      }
    };
    socket.on("recieved-message", handleMessage);
    return () => socket.off("recieved-message", handleMessage);
  }, [socket, userData?.token, unreadCount]);

  useEffect(() => {
    if (!userData?.token) return;
    const fetchNotifCount = async () => {
      try {
        const res = await getData("notification/all/", header1);
        if (res?.success) {
          const total = res?.notifications?.length || 0;
          if (notifLastTotalRef.current === -1) {
            notifLastTotalRef.current = total;
            dispatch(setNotifLastTotal(total));
            return;
          }
          const diff = Math.max(0, total - notifLastTotalRef.current);
          notifLastTotalRef.current = total;
          if (diff > 0) {
            dispatch(setNotifUnreadCount((prev) => prev + diff));
          }
          dispatch(setNotifLastTotal(total));
        }
      } catch (e) { /* ignore */ }
    };
    notifLastTotalRef.current = -1;
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 30000);
    return () => clearInterval(interval);
  }, [userData?.token, header1]);

  const [driverModal, SetdriverModal] = useState(false);
  const handleClosedriver = () => SetdriverModal(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [notifShow, setNotifShow] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifFilter, setNotifFilter] = useState("all");
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      const scrolled = window.scrollY > 0 || document.documentElement.scrollTop > 0 || document.body.scrollTop > 0;
      setIsScrolled(scrolled);
    };
    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
    document.addEventListener("scroll", checkScroll, { passive: true });
    const intervalId = setInterval(checkScroll, 100);
    return () => {
      window.removeEventListener("scroll", checkScroll);
      document.removeEventListener("scroll", checkScroll);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!notifShow) return;
    const fetchNotifs = async () => {
      if (!userData?.token) return;
      setNotifLoading(true);
      try {
        const res = await getData("notification/all/", header1);
        if (res?.success) {
          setNotifications(res?.notifications || []);
        } else {
          setNotifications([]);
        }
      } catch (e) { /* ignore */ }
      setNotifLoading(false);
    };
    fetchNotifs();
  }, [notifShow]);

  const getNotifIcon = (type) => {
    switch (type) {
      case "error": return <FaExclamationCircle size={14} />;
      case "success": return <FaCheckCircle size={14} />;
      case "info": return <FaInfoCircle size={14} />;
      default: return <MdNotificationsActive size={16} />;
    }
  };

  const getNotifColor = (type) => {
    switch (type) {
      case "error": return { bg: "#fef2f2", icon: "#ef4444", border: "#fecaca" };
      case "success": return { bg: "#f0fdf4", icon: "#22c55e", border: "#bbf7d0" };
      case "info": return { bg: "#eff6ff", icon: "#3b82f6", border: "#bfdbfe" };
      default: return { bg: "#f0f7ff", icon: "#004a70", border: "#b8d4e3" };
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

  const filteredNotifs = notifications.filter((n) => {
    if (notifFilter === "all") return true;
    if (notifFilter === "read") return n.isRead;
    if (notifFilter === "unread") return !n.isRead;
    return true;
  });

  useEffect(() => { setMounted(true); }, []);

  const handleChatUser = () => {
    if (!userData?.user) {
      message.error("Please login first");
      return;
    }
    const user = userData?.user;
    const chatUser = {
      _id: user?._id,
      username: user?.name,
      profileImage: user?.profileImage || "",
      email: user?.email || "",
    };

    router.push("/chat");
  };

  const Route = (data) => {
    router.push(`/${data}`);
    handleClose();
  };

  const handleLogout = () => {
    dispatch(logout());
    window.localStorage.clear();
  };

  const HandleModal = () => {
    SetdriverModal(true);
  };

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "My Bookings", href: "/admin" },
    { label: "Book Ride", href: "/ride" },
    { label: "Make Own Tours", href: "/makeowntours" },
    { label: "List Own Place", href: "/listownplace" },
    { label: "Shop", href: "/serviceLocations" },
    { label: "Wallet", href: "/wallet" },
    // { label: "Chat", href: "/chat" },
    // { label: "Favorites", href: "/favorites" },
    { label: "Offers", href: "/coupon" },
    { label: "Reviews", href: "/userreviews" },
  ];

  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const AuthDrop = [
    {
      label: "Profile",
      key: "1",
      to: "/profile",
    },
    {
      label: "Chat",
      key: "4",
      to: "/chat",
    },
    {
      label: "Favorites",
      key: "5",
      to: "/favorites",
    },
    {
      label: "Signup as Driver",
      key: "2",
      onClick: HandleModal,
    },
    {
      label: "Logout",
      key: "3",
      to: "/auth/login",
      onClick: handleLogout,
    },
  ];

  const linkStyle = (href) => ({
    padding: "8px 12px",
    color: isActive(href) ? (isScrolled ? "#004a70" : "#fff") : (isScrolled ? "#4b5563" : "rgba(255,255,255,0.9)"),
    fontSize: 13.5,
    textDecoration: "none",
    whiteSpace: "nowrap",
    position: "relative",
    transition: "color 0.2s ease",
    borderBottom: isActive(href) ? `2px solid ${isScrolled ? "#004a70" : "#fff"}` : "2px solid transparent",
    paddingBottom: 4,
  });

  return (
    <div className="font-poppins">
      <style jsx global>{`
        .navBar00 {
          background: transparent !important;
          border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
        .navBar00.scrolled {
          background-color: rgba(255, 255, 255, 0.75) !important;
          background: rgba(255, 255, 255, 0.75) !important;
          box-shadow: 0px 4px 22.9px 0px #0000000d !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border-top: 1px solid rgba(255, 255, 255, 0.3) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3) !important;
        }
      `}</style>
      <Navbar
        expand="xl"
        className={`navBar00 ${mounted ? "animate-header-slide-down " : "opacity-0 "} ${isScrolled ? "scrolled" : ""} font-poppins`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          width: "100%",
          height: 64,
          background: isScrolled ? "rgba(255,255,255,0.75)" : "transparent",
          backdropFilter: isScrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: isScrolled ? "blur(20px)" : "none",
          borderTop: "1px solid rgba(255,255,255,0.2)",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          paddingLeft: 16,
          paddingRight: 24,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link href={"/"} style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Image
              src={logoBlue}
              alt="Cabkn"
              width={30}
              height={26}
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>

          {/* Desktop Nav - Centered */}
          <div
            className="d-none d-xl-flex"
            style={{
              alignItems: "center",
              gap: 1,
              overflowX: "auto",
              flex: 1,
              justifyContent: "center",
              paddingLeft: 16,
              paddingRight: 16,
            }}
          >
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={`animate-fade-in-down ${isActive(link.href) ? "font-family-semibold" : "font-family-medium"}`}
                style={{ ...linkStyle(link.href), animationDelay: `${index * 50}ms` }}
                onMouseEnter={(e) => {
                  if (!isActive(link.href)) {
                    e.currentTarget.style.color = isScrolled ? "#004a70" : "#fff";
                    e.currentTarget.style.borderBottom = `2px solid ${isScrolled ? "#004a70" : "#fff"}`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.href)) {
                    e.currentTarget.style.color = isScrolled ? "#4b5563" : "rgba(255,255,255,0.9)";
                    e.currentTarget.style.borderBottom = "2px solid transparent";
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Icons + User */}
          <div className="d-none d-xl-flex animate-fade-in" style={{ alignItems: "center", gap: 6, flexShrink: 0, animationDelay: "150ms" }}>
            <Badge count={notifUnreadCount} size="small" offset={[-2, 2]} style={{ backgroundColor: "#ef4444" }}>
              <button
                onClick={() => { setNotifShow(true); }}
                className="w-[34px] h-[34px] rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 border-0"
                style={{
                  background: isScrolled ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)",
                  color: isScrolled ? "#4b5563" : "#fff"
                }}
              >
                <MdNotificationsActive size={16} />
              </button>
            </Badge>

            <div ref={userMenuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-[34px] h-[34px] rounded-lg flex items-center justify-center cursor-pointer ml-[2px] transition-all duration-200 overflow-hidden border-0"
                style={{
                  background: isScrolled ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)"
                }}
              >
                {userData?.user?.image ? (
                  <Image
                    width={34}
                    height={34}
                    src={userData?.user?.image}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      objectFit: "cover",
                    }}
                    alt="userImage"
                  />
                ) : (
                  <FaUser size={15} color={isScrolled ? "#6b7280" : "#fff"} />
                )}
              </button>
              {userMenuOpen && (
                <div
                  className="animate-fade-in-up"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    minWidth: 180,
                    background: "#fff",
                    borderRadius: 12,
                    padding: 6,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                    border: "1px solid #f0f0f0",
                    zIndex: 9999,
                  }}
                >
                  {AuthDrop.map((item) => (
                    <div key={item.key}>
                      {item.to ? (
                        <Link
                          href={item.to}
                          onClick={() => {
                            item.onClick?.();
                            setUserMenuOpen(false);
                          }}
                          className="block px-3.5 py-2.5 rounded-lg text-gray-700 font-family-medium text-sm no-underline transition-all duration-150 hover:bg-gray-100 hover:translate-x-0.5"
                          style={{
                            display: "block",
                            padding: "10px 14px",
                            borderRadius: 8,
                            color: "#374151",
                            fontSize: 14,
                            textDecoration: "none",
                          }}
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <div
                          onClick={() => {
                            item.onClick?.();
                            setUserMenuOpen(false);
                          }}
                          className="px-3.5 py-2.5 rounded-lg text-gray-700 font-family-medium text-sm cursor-pointer transition-all duration-150 hover:bg-gray-100 hover:translate-x-0.5"
                          style={{
                            padding: "10px 14px",
                            borderRadius: 8,
                            color: "#374151",
                            fontSize: 14,
                            cursor: "pointer",
                          }}
                        >
                          {item.label}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setShow((prev) => !prev)}
            className="d-xl-none transition-all duration-200"
            style={{
              background: isScrolled ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)",
              border: "none",
              cursor: "pointer",
              padding: 8,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AiOutlineMenuFold color={isScrolled ? "#004A70" : "#fff"} size={24} />
          </button>
        </div>
      </Navbar>

      {/* Mobile Offcanvas */}
      <Offcanvas
        show={show}
        onHide={handleClose}
        placement="start"
        className="font-poppins"
        style={{
          width: 300,
          maxWidth: "85vw",
          borderRight: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Offcanvas.Header
          style={{
            borderBottom: "1px solid #f0f0f0",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href={"/"}
            style={{ textDecoration: "none", display: "flex", alignItems: "center" }}
            onClick={handleClose}
          >
            <Image
              src={logoBlue}
              alt="Cabkn"
             className="w-[4rem] h-[4rem] object-contain"
              style={{ objectFit: "contain" }}
            />
          </Link>
          <button
            onClick={handleClose}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: 8,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 16,
              color: "#6b7280",
              flexShrink: 0,
              marginLeft: "auto",
            }}
          >
            ✕
          </button>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Profile Dropdown */}
            <div className="animate-fade-in" style={{ animationDelay: "0ms" }}>
              <div
                onClick={() => setMobileProfileOpen(!mobileProfileOpen)}
                  className="transition-all duration-150 hover:bg-gray-100 font-family-medium"
                  style={{
                    padding: "11px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    color: "#374151",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {userData?.user?.image ? (
                      <Image
                        width={40}
                        height={40}
                        src={userData.user.image}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                        alt="userImage"
                      />
                    ) : (
                      <FaUser size={18} color="#6b7280" />
                    )}
                  </div>
                  {/* User info */}
                  <div>
                    <div className="font-family-semibold" style={{ fontSize: 14, color: "#1f2937" }}>
                      {userData?.user?.name || "Profile"}
                    </div>
                    <div className="font-family-regular" style={{ fontSize: 12, color: "#6b7280" }}>
                      Profile actions
                    </div>
                  </div>
                </div>
                {/* Chevron */}
                <span style={{
                  transform: mobileProfileOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  color: "#6b7280",
                  fontSize: 14,
                }}>
                  ▼
                </span>
              </div>
              {mobileProfileOpen && (
                <div style={{ paddingLeft: 12, marginTop: 4 }}>
                  {AuthDrop.map((item, idx) => (
                    <div key={item.key} className="animate-fade-in" style={{ animationDelay: `${idx * 20}ms` }}>
                      {item.to ? (
                        <div
                          onClick={() => {
                            item.onClick?.();
                            Route(item.to === "/" ? "" : item.to.slice(1));
                          }}
                          className="transition-all duration-150 hover:bg-gray-100 font-family-medium"
                          style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            cursor: "pointer",
                            color: item.label === "Logout" ? "#ef4444" : "#374151",
                            fontSize: 13,
                          }}
                        >
                          {item.label}
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            item.onClick?.();
                          }}
                          className="transition-all duration-150 hover:bg-gray-100 font-family-medium"
                          style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            cursor: "pointer",
                            color: "#374151",
                            fontSize: 13,
                          }}
                        >
                          {item.label}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="animate-fade-in" style={{ animationDelay: `${AuthDrop.length * 20}ms` }}>
                    <div
                      onClick={() => {
                        setNotifShow(true);
                        handleClose();
                      }}
                      className="transition-all duration-150 hover:bg-gray-100 font-family-medium"
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                        color: "#374151",
                        fontSize: 13,
                      }}
                    >
                      Notifications
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            {navLinks.map((link, index) => (
              <div key={link.href} className="animate-fade-in" style={{ animationDelay: `${(index + 1) * 40}ms` }}>
                <MobileNavItem
                  label={link.label}
                  active={isActive(link.href)}
                  onClick={() => Route(link.href === "/" ? "" : link.href.slice(1))}
                />
              </div>
            ))}
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      <Modal
        centered
        backdrop="static"
        show={driverModal}
        onHide={handleClosedriver}
        dialogClassName="driver-modal-sm font-poppins"
        style={{ borderRadius: 20, overflow: "hidden" }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #0a2540 0%, #004a70 50%, #005f8a 100%)",
            padding: "48px 32px 32px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.03)",
            }}
          />
          <button
            onClick={handleClosedriver}
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
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
          <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Driver App
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, margin: 0, fontWeight: 400 }}>
            Take control of your rides
          </p>
        </div>

        <div style={{ padding: "24px 28px 28px" }}>
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 14,
              padding: "14px 16px",
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: "1px solid #f0f0f0",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#e8f0fe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width={20} height={20} viewBox="0 0 20 20" fill="#004a70">
                <path d="M10.362 1.093a.75.75 0 0 0-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925ZM18 6.443l-7.25 4v8.25l6.862-3.786A.75.75 0 0 0 18 14.25V6.443ZM9.25 18.693v-8.25l-7.25-4v7.807a.75.75 0 0 0 .388.657l6.862 3.786Z" />
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, color: "#1f2937", margin: 0 }}>
                Download our app
              </p>
              <p style={{ fontSize: 12.5, color: "#9ca3af", margin: "2px 0 0" }}>
                Available on iOS &amp; Android
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button
              onClick={() => window.open("https://play.google.com/store/apps/details?id=com.cabkndriver.app&hl=en", "_blank")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 8px",
                borderRadius: 10,
                background: "#111827",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#fff",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1d2939";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                e.currentTarget.style.transform = "translateY(-1px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#111827";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <svg width={16} height={16} viewBox="0 0 512 512" fill="#fff" style={{ flexShrink: 0 }}>
                <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
              </svg>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1, letterSpacing: 0.6, textTransform: "uppercase", fontWeight: 400 }}>
                  Get it on
                </p>
                <p style={{ fontSize: 11, fontWeight: 700, margin: "2px 0 0", lineHeight: 1, letterSpacing: "-0.2px" }}>
                  Google Play
                </p>
              </div>
            </button>
            <button
              onClick={() => window.open("https://apps.apple.com/pk/app/cabkn-driver/id6740235396", "_blank")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 8px",
                borderRadius: 10,
                background: "#111827",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#fff",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1d2939";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                e.currentTarget.style.transform = "translateY(-1px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#111827";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <svg width={16} height={16} viewBox="0 0 384 512" fill="#fff" style={{ flexShrink: 0 }}>
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-111.9-39.7-143.6zM240.5 25.3c-23.5-26.7-54.3-38.3-91.5-34.2-3.3 30.5 7.3 59.4 28.7 81.7 21.9 22.9 50.4 35.8 80.3 33.1 2.6-29-6.3-57.5-27.5-80.6z" />
              </svg>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1, letterSpacing: 0.6, textTransform: "uppercase", fontWeight: 400 }}>
                  Download on
                </p>
                <p style={{ fontSize: 11, fontWeight: 700, margin: "2px 0 0", lineHeight: 1, letterSpacing: "-0.2px" }}>
                  App Store
                </p>
              </div>
            </button>
          </div>
        </div>
      </Modal>

      {/* Notification Drawer - Right Side */}
      <Offcanvas
        show={notifShow}
        onHide={() => setNotifShow(false)}
        placement="end"
        className="font-poppins"
        style={{
          width: 380,
          maxWidth: "90vw",
          borderRight: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div
            style={{
              padding: "20px 20px 16px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#f0f7ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MdNotificationsActive size={18} color="#004a70" />
              </div>
              <div>
                <h3 className="font-family-bold" style={{ margin: 0, fontSize: 16, color: "#1f2937", lineHeight: 1.3 }}>
                  Notifications
                </h3>
                <p className="font-family-medium" style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
                  {notifications.length} {notifications.length === 1 ? "notification" : "notifications"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setNotifShow(false)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: "none",
                background: "#f3f4f6",
                color: "#6b7280",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#e5e7eb"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#f3f4f6"; }}
            >
              ✕
            </button>
          </div>

          {/* Filter Buttons */}
          <div
            style={{
              display: "flex",
              gap: 6,
              padding: "12px 20px",
              borderBottom: "1px solid #f0f0f0",
              flexShrink: 0,
            }}
          >
            {[
              { key: "all", label: "All" },
              { key: "unread", label: "Unread" },
              { key: "read", label: "Read" },
            ].map((btn) => {
              const isActive = notifFilter === btn.key;
              const count = btn.key === "all"
                ? notifications.length
                : btn.key === "unread"
                  ? notifications.filter((n) => !n.isRead).length
                  : notifications.filter((n) => n.isRead).length;
              return (
                <button
                  key={btn.key}
                  onClick={() => setNotifFilter(btn.key)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 8,
                    border: "none",
                    fontSize: 12,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: isActive ? "#004a70" : "#f3f4f6",
                    color: isActive ? "#fff" : "#6b7280",
                  }}
                  className={isActive ? "font-family-semibold" : "font-family-medium"}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#e5e7eb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#f3f4f6";
                    }
                  }}
                >
                  {btn.label} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

          {/* Notification List */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            {notifLoading ? (
              <div style={{ padding: "20px" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "12px 20px", alignItems: "flex-start" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0f0f0", flexShrink: 0, animation: "pulse 1.5s infinite" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 12, width: "70%", background: "#f0f0f0", borderRadius: 6, marginBottom: 8, animation: "pulse 1.5s infinite" }} />
                      <div style={{ height: 10, width: "90%", background: "#f0f0f0", borderRadius: 6, marginBottom: 6, animation: "pulse 1.5s infinite" }} />
                      <div style={{ height: 8, width: "30%", background: "#f0f0f0", borderRadius: 6, animation: "pulse 1.5s infinite" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifs.length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: "#f0f7ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <MdNotificationsNone size={30} color="#004a70" opacity={0.35} />
                </div>
                <p className="font-family-semibold" style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
                  {notifFilter === "all"
                    ? "No notifications yet"
                    : notifFilter === "unread"
                      ? "No unread notifications"
                      : "No read notifications"}
                </p>
                <p className="font-family-regular" style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>
                  {notifFilter === "all"
                    ? "When you receive notifications, they'll show up here."
                    : "Try switching the filter."}
                </p>
              </div>
            ) : (
              filteredNotifs.map((notification, index) => {
                const colors = getNotifColor(notification.type);
                return (
                  <div
                    key={notification.id || index}
                    className="notif-item"
                    style={{
                      padding: "14px 20px",
                      borderBottom: "1px solid #f0f0f0",
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      cursor: "default",
                      transition: "all 0.2s ease",
                      background: notification.isRead ? "#fff" : "#f8faff",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f0f4ff"; e.currentTarget.style.paddingLeft = "24px"; }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = notification.isRead ? "#fff" : "#f8faff";
                      e.currentTarget.style.paddingLeft = "20px";
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: colors.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: colors.icon,
                        marginTop: 2,
                      }}
                    >
                      {notification.image ? (
                        <img
                          src={notification.image}
                          alt=""
                          style={{ width: "100%", height: "100%", borderRadius: 12, objectFit: "cover" }}
                        />
                      ) : (
                        getNotifIcon(notification.type)
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {!notification.isRead && (
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: colors.icon, flexShrink: 0, display: "inline-block" }} />
                        )}
                        <p className={notification.isRead ? "font-family-medium" : "font-family-semibold"} style={{
                          margin: 0,
                          fontSize: 13,
                          color: notification.isRead ? "#4b5563" : "#111827",
                          lineHeight: 1.4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {notification.title}
                        </p>
                      </div>
                      {notification.description && (
                        <p style={{
                          margin: "4px 0 0",
                          fontSize: 12,
                          color: notification.isRead ? "#9ca3af" : "#6b7280",
                          lineHeight: 1.4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {notification.description}
                        </p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
                        <IoMdTime size={11} color={getTimeColor(notification.createdAt)} />
                        <span className="font-family-medium" style={{ fontSize: 11, color: getTimeColor(notification.createdAt) }}>
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Offcanvas>
    </div>
  );
};

const MobileNavItem = ({ label, onClick, active, danger }) => (
  <div
    onClick={onClick}
    className={`transition-all duration-150 ${
      active
        ? "bg-indigo-50 font-family-semibold"
        : danger
          ? "hover:bg-red-50 font-family-medium"
          : "hover:bg-gray-100 font-family-medium"
    }`}
    style={{
      padding: "11px 12px",
      borderRadius: 10,
      cursor: "pointer",
      color: active ? "#004a70" : danger ? "#ef4444" : "#374151",
      fontSize: 14,
    }}
  >
    {label}
  </div>
);

export default InnerHeader;
