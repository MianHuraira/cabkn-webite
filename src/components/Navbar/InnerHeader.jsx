/* eslint-disable react/jsx-no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
"use client";
import React, { useEffect, useState, useRef } from "react";
import { Nav, Navbar, Form, Offcanvas, Modal } from "react-bootstrap";
import { FaUser } from "react-icons/fa";

import { message } from "antd";

import { useDispatch, useSelector } from "react-redux";
import { Badge } from "antd";
import { AiOutlineMenuFold } from "react-icons/ai";
import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import { MdNotificationsActive } from "react-icons/md";
import { IoHeart } from "react-icons/io5";

import Link from "next/link";
import { AppStore, GooglePlay, logoBlue } from "../assets/Images";
import Image from "next/image";
import ApiFunction from "../ApiFunction/ApiFunction";
import { logout, setUnreadCount } from "../Redux/Slices/AuthSlice";
import { useRouter, usePathname } from "next/navigation";
import { encryptData } from "../ApiFunction/encrypted";
import { useSocket } from "../ApiFunction/SoketProvider";
import ApiFile from "../ApiFunction/ApiFile";

const InnerHeader = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);


  const { getData, baseURL, userData } = ApiFunction();
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const unreadCount = useSelector((state) => state.auth.unreadCount);
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

  const [driverModal, SetdriverModal] = useState(false);
  const handleClosedriver = () => SetdriverModal(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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
    { label: "Chat", href: "/chat" },
    { label: "Favorites", href: "/favorites" },
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
    color: isActive(href) ? "#004a70" : "#4b5563",
    fontSize: 13.5,
    fontWeight: isActive(href) ? 600 : 500,
    textDecoration: "none",
    whiteSpace: "nowrap",
    position: "relative",
    transition: "color 0.2s ease",
    borderBottom: isActive(href) ? "2px solid #004a70" : "2px solid transparent",
    paddingBottom: 4,
  });

  return (
    <>
      <Navbar
        expand="xl"
        className={mounted ? "animate-header-slide-down" : "opacity-0"}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 999,
          width: "100%",
          height: 64,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          paddingLeft: 16,
          paddingRight: 24,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1400,
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
                className="animate-fade-in-down"
                style={{ ...linkStyle(link.href), animationDelay: `${index * 50}ms` }}
                onMouseEnter={(e) => {
                  if (!isActive(link.href)) {
                    e.currentTarget.style.color = "#004a70";
                    e.currentTarget.style.borderBottom = "2px solid #004a70";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.href)) {
                    e.currentTarget.style.color = "#4b5563";
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
            <Badge count={unreadCount} size="small" offset={[-2, 2]} style={{ backgroundColor: "#ef4444" }}>
              <button
                onClick={handleChatUser}
                className="w-[34px] h-[34px] rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer transition-all duration-200 text-gray-600 hover:bg-brand-600 hover:text-white hover:scale-110 border-0"
              >
                <HiOutlineChatBubbleOvalLeft size={16} />
              </button>
            </Badge>
            <button
              onClick={() => Route("notifications")}
              className="w-[34px] h-[34px] rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer transition-all duration-200 text-gray-600 hover:bg-brand-600 hover:text-white hover:scale-110 border-0"
            >
              <MdNotificationsActive size={16} />
            </button>
            <button
              onClick={() => Route("favorites")}
              className="w-[34px] h-[34px] rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer transition-all duration-200 text-gray-600 hover:bg-brand-600 hover:text-white hover:scale-110 border-0"
            >
              <IoHeart size={16} />
            </button>

            <div ref={userMenuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-[34px] h-[34px] rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer ml-[2px] transition-all duration-200 overflow-hidden hover:bg-gray-200 border-0"
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
                  <FaUser size={15} color="#6b7280" />
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
                          className="block px-3.5 py-2.5 rounded-lg text-gray-700 font-medium text-sm no-underline transition-all duration-150 hover:bg-gray-100 hover:translate-x-0.5"
                          style={{
                            display: "block",
                            padding: "10px 14px",
                            borderRadius: 8,
                            color: "#374151",
                            fontWeight: 500,
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
                          className="px-3.5 py-2.5 rounded-lg text-gray-700 font-medium text-sm cursor-pointer transition-all duration-150 hover:bg-gray-100 hover:translate-x-0.5"
                          style={{
                            padding: "10px 14px",
                            borderRadius: 8,
                            color: "#374151",
                            fontWeight: 500,
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
            className="d-xl-none transition-all duration-200 hover:bg-gray-100"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AiOutlineMenuFold color="#004A70" size={24} />
          </button>
        </div>
      </Navbar>

      {/* Mobile Offcanvas */}
      <Offcanvas
        show={show}
        onHide={handleClose}
        placement="start"
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
              width={75}
              height={26}
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
            }}
          >
            ✕
          </button>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {navLinks.map((link, index) => (
              <div key={link.href} className="animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
                <MobileNavItem
                  label={link.label}
                  active={isActive(link.href)}
                  onClick={() => Route(link.href === "/" ? "" : link.href.slice(1))}
                />
              </div>
            ))}

            <div style={{ borderTop: "1px solid #f0f0f0", margin: "12px 0", paddingTop: 12 }}>
              <div className="animate-fade-in" style={{ animationDelay: "500ms" }}>
                <MobileNavItem
                  label="Profile"
                  onClick={() => Route("profile")}
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: "550ms" }}>
                <MobileNavItem
                  label="Notifications"
                  onClick={() => Route("notifications")}
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: "600ms" }}>
                <MobileNavItem
                  label="Signup as Driver"
                  onClick={HandleModal}
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: "650ms" }}>
                <MobileNavItem
                  label="Logout"
                  onClick={handleLogout}
                  danger
                />
              </div>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      <Modal
        centered
        backdrop="static"
        show={driverModal}
        onHide={handleClosedriver}
        style={{ borderRadius: 20, overflow: "hidden" }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #004a70 0%, #003353 100%)",
            padding: "40px 32px 32px",
            textAlign: "center",
            position: "relative",
          }}
        >
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
              borderRadius: 16,
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg
              width={28}
              height={28}
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
              />
            </svg>
          </div>
          <h2
            style={{
              color: "#fff",
              fontSize: 22,
              fontWeight: 700,
              margin: "0 0 4px",
              letterSpacing: "-0.3px",
            }}
          >
            Driver App
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
              margin: 0,
            }}
          >
            Take control of your rides
          </p>
        </div>

        <div style={{ padding: "20px 24px 24px" }}>
          <div
            style={{
              background: "#f9fafb",
              borderRadius: 14,
              padding: 16,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
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
              <svg
                width={20}
                height={20}
                viewBox="0 0 20 20"
                fill="#004a70"
              >
                <path d="M10.362 1.093a.75.75 0 0 0-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925ZM18 6.443l-7.25 4v8.25l6.862-3.786A.75.75 0 0 0 18 14.25V6.443ZM9.25 18.693v-8.25l-7.25-4v7.807a.75.75 0 0 0 .388.657l6.862 3.786Z" />
              </svg>
            </div>
            <div>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#1f2937",
                  margin: 0,
                }}
              >
                Download our app
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#9ca3af",
                  margin: "2px 0 0",
                }}
              >
                Available on iOS & Android
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() =>
                window.open(
                  "https://play.google.com/store/apps/details?id=com.cabkndriver.app&hl=en",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 18px",
                borderRadius: 12,
                background: "#0a1f2e",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#153044";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#0a1f2e";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <svg
                width={22}
                height={22}
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ flexShrink: 0 }}
              >
                <path d="M4.98 3.5C4.36 3.5 3.8 3.88 3.6 4.5c-.32.98-.3 2.1-.3 3.5v8c0 1.4-.02 2.52.3 3.5.2.62.77 1 1.4 1 .3 0 .55-.1.77-.28l10.8-7.5c.45-.35.7-.88.7-1.43 0-.55-.25-1.08-.7-1.43L5.74 3.78c-.22-.18-.46-.28-.76-.28z" />
              </svg>
              <div>
                <p
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.5)",
                    margin: 0,
                    lineHeight: 1,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Get it on
                </p>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    margin: "3px 0 0",
                    lineHeight: 1,
                  }}
                >
                  Google Play
                </p>
              </div>
            </button>
            <button
              onClick={() =>
                window.open(
                  "https://apps.apple.com/pk/app/cabkn-driver/id6740235396",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 18px",
                borderRadius: 12,
                background: "#0a1f2e",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#153044";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#0a1f2e";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <svg
                width={22}
                height={22}
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ flexShrink: 0 }}
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <div>
                <p
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.5)",
                    margin: 0,
                    lineHeight: 1,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Download on
                </p>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    margin: "3px 0 0",
                    lineHeight: 1,
                  }}
                >
                  App Store
                </p>
              </div>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const MobileNavItem = ({ label, onClick, active, danger }) => (
  <div
    onClick={onClick}
    className={`transition-all duration-150 ${
      active
        ? "bg-indigo-50 font-semibold"
        : danger
          ? "hover:bg-red-50"
          : "hover:bg-gray-100"
    }`}
    style={{
      padding: "11px 12px",
      borderRadius: 10,
      cursor: "pointer",
      color: active ? "#004a70" : danger ? "#ef4444" : "#374151",
      fontSize: 14,
      fontWeight: active ? 600 : 500,
    }}
  >
    {label}
  </div>
);

export default InnerHeader;
