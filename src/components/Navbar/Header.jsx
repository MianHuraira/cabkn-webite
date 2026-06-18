/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

import { logout } from "../Redux/Slices/AuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { logoBlue } from "../assets/Images";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import Link from "next/link";
import { AppStore, GooglePlay } from "../assets/Images";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

const Header = () => {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  const [driverModal, SetdriverModal] = useState(false);
  const handleClosedriver = () => SetdriverModal(false);

  const dispatch = useDispatch();

  const [isScrolled, setIsScrolled] = useState(false);


  useEffect(() => {
    const handleScrollEvent = () => {
      setIsScrolled(window.scrollY > 7);
    };
    handleScrollEvent();
    window.addEventListener("scroll", handleScrollEvent, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollEvent);
  }, []);

  const navLinks = [
    { id: "why-us", label: "Why Us" },
    { id: "benefits", label: "Benefits" },
    { id: "testimonials", label: "Testimonials" },
    { id: "contact-us", label: "Contact Us" },
  ];

  const handleNavClick = (id) => {
    handleClose();
    router.push(`/${id}`);
  };

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === `/${href}` || pathname.startsWith(`/${href}`);
  };

  const linkStyle = (id) => ({
    padding: "8px 12px",
    color: isActive(id) ? "#004a70" : "#4b5563",
    fontSize: 13.5,
    fontWeight: isActive(id) ? 600 : 500,
    textDecoration: "none",
    whiteSpace: "nowrap",
    position: "relative",
    transition: "color 0.2s ease",
    borderBottom: isActive(id) ? "2px solid #004a70" : "2px solid transparent",
    paddingBottom: 4,
  });

  return (
    <>
      <header
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
          borderBottom: isScrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
          paddingLeft: 16,
          paddingRight: 24,
          display: "flex",
          alignItems: "center",
          transition: "border-color 0.3s ease",
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
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Image
              src={logoBlue}
              alt="Cabkn"
              width={30}
              height={26}
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
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
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="animate-fade-in-down"
                style={{
                  ...linkStyle(link.id),
                  animationDelay: `${index * 50}ms`,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  if (!isActive(link.id)) {
                    e.currentTarget.style.color = "#004a70";
                    e.currentTarget.style.borderBottom = "2px solid #004a70";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.id)) {
                    e.currentTarget.style.color = "#4b5563";
                    e.currentTarget.style.borderBottom = "2px solid transparent";
                  }
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop Right Buttons */}
          <div className="d-none d-xl-flex animate-fade-in" style={{ alignItems: "center", gap: 8, flexShrink: 0, animationDelay: "150ms" }}>
            <Link
              href="/auth/login"
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: "#4b5563",
                textDecoration: "none",
                transition: "all 0.2s",
                border: "1px solid #e5e7eb",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#004a70"; e.currentTarget.style.borderColor = "#004a70"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#4b5563"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
            >
              Login
            </Link>
            <Link
              href="/auth/stepOne"
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                textDecoration: "none",
                background: "#004a70",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#003353"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#004a70"; }}
            >
              Sign Up
            </Link>
            <button
              onClick={() => SetdriverModal(true)}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: "#004a70",
                textDecoration: "none",
                border: "1px solid #004a70",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#004a70"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#004a70"; }}
            >
              Driver Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
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
            onClick={handleShow}
            aria-label="Toggle menu"
          >
            {show ? <IoClose color="#004A70" size={24} /> : <HiMenuAlt3 color="#004A70" size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[1001] transition-all duration-300 ${show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={handleClose}
      />

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 left-0 w-[320px] max-w-[85vw] h-full z-[1002] overflow-y-auto transition-all duration-300 ease-out ${show ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          background: "#fff",
          boxShadow: "20px 0 60px rgba(0,0,0,0.15)",
          borderRight: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid #f0f0f0",
        }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }} onClick={handleClose}>
            <Image src={logoBlue} alt="Cabkn" width={75} height={26} style={{ objectFit: "contain" }} />
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
        </div>

        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navLinks.map((link, index) => (
            <div key={link.id} className="animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
              <MobileNavItem
                label={link.label}
                active={isActive(link.id)}
                onClick={() => handleNavClick(link.id)}
              />
            </div>
          ))}

          <div style={{ borderTop: "1px solid #f0f0f0", margin: "12px 0", paddingTop: 12 }}>
            <div className="animate-fade-in" style={{ animationDelay: "500ms" }}>
              <MobileNavItem label="Login" onClick={() => { handleClose(); router.push("/auth/login"); }} />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "550ms" }}>
              <MobileNavItem label="Sign Up" onClick={() => { handleClose(); router.push("/auth/stepOne"); }} />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "600ms" }}>
              <MobileNavItem label="Signup as Driver" onClick={() => { SetdriverModal(true); handleClose(); }} />
            </div>
          </div>
        </div>
      </div>

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
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.3px" }}>
            Driver App
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0 }}>
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
              <svg width={20} height={20} viewBox="0 0 20 20" fill="#004a70">
                <path d="M10.362 1.093a.75.75 0 0 0-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925ZM18 6.443l-7.25 4v8.25l6.862-3.786A.75.75 0 0 0 18 14.25V6.443ZM9.25 18.693v-8.25l-7.25-4v7.807a.75.75 0 0 0 .388.657l6.862 3.786Z" />
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, color: "#1f2937", margin: 0 }}>Download our app</p>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>Available on iOS & Android</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => window.open("https://play.google.com/store/apps/details?id=com.cabkndriver.app&hl=en", "_blank", "noopener,noreferrer")}
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
              onMouseEnter={(e) => { e.currentTarget.style.background = "#153044"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#0a1f2e"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M4.98 3.5C4.36 3.5 3.8 3.88 3.6 4.5c-.32.98-.3 2.1-.3 3.5v8c0 1.4-.02 2.52.3 3.5.2.62.77 1 1.4 1.3 0 .55-.1.77-.28l10.8-7.5c.45-.35.7-.88.7-1.43 0-.55-.25-1.08-.7-1.43L5.74 3.78c-.22-.18-.46-.28-.76-.28z" />
              </svg>
              <div>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1, letterSpacing: 1, textTransform: "uppercase" }}>Get it on</p>
                <p style={{ fontSize: 14, fontWeight: 600, margin: "3px 0 0", lineHeight: 1 }}>Google Play</p>
              </div>
            </button>
            <button
              onClick={() => window.open("https://apps.apple.com/pk/app/cabkn-driver/id6740235396", "_blank", "noopener,noreferrer")}
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
              onMouseEnter={(e) => { e.currentTarget.style.background = "#153044"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#0a1f2e"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <div>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1, letterSpacing: 1, textTransform: "uppercase" }}>Download on</p>
                <p style={{ fontSize: 14, fontWeight: 600, margin: "3px 0 0", lineHeight: 1 }}>App Store</p>
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

export default Header;
