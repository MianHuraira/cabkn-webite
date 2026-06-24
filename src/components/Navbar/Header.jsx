/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
"use client";

import React, { useEffect, useState, useRef } from "react";
import { Modal } from "react-bootstrap";

import { logout } from "../Redux/Slices/AuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { logoBlue, whiteLogo } from "../assets/Images";
import { HiMenuAlt3, HiX } from "react-icons/hi";
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const [driverModal, SetdriverModal] = useState(false);
  const handleClosedriver = () => SetdriverModal(false);

  const dispatch = useDispatch();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      const scrolled =
        window.scrollY > 0 ||
        document.documentElement.scrollTop > 0 ||
        document.body.scrollTop > 0;
   
      setIsScrolled(scrolled);
    };

    // Check immediately
    checkScroll();

    // Check on scroll event
    window.addEventListener("scroll", checkScroll, { passive: true });
    document.addEventListener("scroll", checkScroll, { passive: true });

    // Also check every 100ms to be safe
    const intervalId = setInterval(checkScroll, 100);

    return () => {
      window.removeEventListener("scroll", checkScroll);
      document.removeEventListener("scroll", checkScroll);
      clearInterval(intervalId);
    };
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

  return (
    <>
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
      <header
        className={`navBar00 ${mounted ? "animate-header-slide-down" : "opacity-0"} ${isScrolled ? "scrolled" : ""}`}
      >
        <div className="w-full max-w-7xl mx-auto h-full flex items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src={isScrolled ? logoBlue : whiteLogo}
              alt="Cabkn"
              width={30}
              height={26}
              className="object-contain"
              priority
            />
          </Link>

          <div className="hidden xl:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link, index) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`animate-fade-in-down font-family-medium px-3 py-2 text-sm transition-all duration-200 ${
                  isActive(link.id)
                    ? isScrolled
                      ? "text-[#004a70] border-b-2 border-[#004a70]"
                      : "text-white border-b-2 border-white"
                    : isScrolled
                      ? "text-gray-600 hover:text-[#004a70] hover:border-b-2 hover:border-[#004a70]"
                      : "text-white/90 hover:text-white hover:border-b-2 hover:border-white"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div
            className="hidden xl:flex items-center gap-2 animate-fade-in"
            style={{ animationDelay: "150ms" }}
          >
            <Link
              href="/auth/login"
              className={`font-family-medium px-4 py-2 rounded-lg text-sm transition-all duration-200 border ${
                isScrolled
                  ? "border-gray-200 text-gray-600 hover:text-[#004a70] hover:border-[#004a70]"
                  : "border-white/30 text-white hover:border-white/50 hover:bg-white/10"
              }`}
            >
              Login
            </Link>
            <Link
              href="/auth/step-one"
              className={`font-family-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                isScrolled
                  ? "bg-[#004a70] text-white hover:bg-[#003353]"
                  : "bg-white text-[#004a70] hover:bg-gray-100"
              }`}
            >
              Sign Up
            </Link>
            <button
              onClick={() => SetdriverModal(true)}
              className={`font-family-medium px-4 py-2 rounded-lg text-sm transition-all duration-200 border ${
                isScrolled
                  ? "border-[#004a70] text-[#004a70] hover:bg-[#004a70] hover:text-white"
                  : "border-white/30 text-white hover:bg-white/10"
              }`}
            >
              Driver Sign Up
            </button>
          </div>

          <button
            className="xl:hidden transition-all duration-200 p-2 rounded-lg"
            style={{
              background: isScrolled
                ? "rgba(0,0,0,0.05)"
                : "rgba(255,255,255,0.1)",
            }}
            onClick={handleShow}
            aria-label="Toggle menu"
          >
            {show ? (
              <HiX color={isScrolled ? "#004a70" : "#fff"} size={24} />
            ) : (
              <HiMenuAlt3 color={isScrolled ? "#004a70" : "#fff"} size={24} />
            )}
          </button>
        </div>

        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[1001] transition-all duration-300 ${show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onClick={handleClose}
        />

        <div
          className={`fixed top-0 left-0 w-[320px] max-w-[85vw] h-full z-[1002] overflow-y-auto transition-all duration-300 ease-out bg-white shadow-[20px_0_60px_rgba(0,0,0,0.15)] border-r border-black/6 ${show ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <Link href="/" className="flex items-center" onClick={handleClose}>
              <Image
                src={logoBlue}
                alt="Cabkn"
                width={75}
                height={26}
                className="object-contain"
              />
            </Link>
            <button
              onClick={handleClose}
              className="bg-gray-100 rounded-lg w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all"
            >
              ✕
            </button>
          </div>

          <div className="p-4 flex flex-col gap-2">
            {navLinks.map((link, index) => (
              <MobileNavItem
                key={link.id}
                label={link.label}
                active={isActive(link.id)}
                onClick={() => handleNavClick(link.id)}
              />
            ))}

            <div className="border-t border-gray-100 mt-3 pt-3">
              <MobileNavItem
                label="Login"
                onClick={() => {
                  handleClose();
                  router.push("/auth/login");
                }}
              />
              <MobileNavItem
                label="Sign Up"
                onClick={() => {
                  handleClose();
                  router.push("/auth/step-one");
                }}
              />
              <MobileNavItem
                label="Signup as Driver"
                onClick={() => {
                  SetdriverModal(true);
                  handleClose();
                }}
              />
            </div>
          </div>
        </div>
      </header>

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
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
            }
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
            className="font-family-bold"
            style={{
              color: "#fff",
              fontSize: 22,
              margin: "0 0 4px",
              letterSpacing: "-0.3px",
            }}
          >
            Driver App
          </h2>
          <p
            className="font-family-regular"
            style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0 }}
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
              <svg width={20} height={20} viewBox="0 0 20 20" fill="#004a70">
                <path d="M10.362 1.093a.75.75 0 0 0-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925ZM18 6.443l-7.25 4v8.25l6.862-3.786a.75.75 0 0 0 .388-.657V6.443ZM9.25 18.693v-8.25l-7.25-4v7.807a.75.75 0 0 0 .388.657l6.862 3.786Z" />
              </svg>
            </div>
            <div>
              <p
                className="font-family-semibold"
                style={{ fontSize: 14, color: "#1f2937", margin: 0 }}
              >
                Download our app
              </p>
              <p
                className="font-family-regular"
                style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}
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
                  "noopener,noreferrer",
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
                <path d="M4.98 3.5C4.36 3.5 3.8 3.88 3.6 4.5c-.32.98-.3 2.1-.3 3.5v8c0 1.4-.02 2.52.3 3.5.2.62.77 1 1.4 1.3 0 .55-.1.77-.28l10.8-7.5c.45-.35.7-.88.7-1.43 0-.55-.25-1.08-.7-1.43L5.74 3.78c-.22-.18-.46-.28-.76-.28z" />
              </svg>
              <div>
                <p
                  className="font-family-medium"
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
                  className="font-family-semibold"
                  style={{ fontSize: 14, margin: "3px 0 0", lineHeight: 1 }}
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
                  "noopener,noreferrer",
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
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <div>
                <p
                  className="font-family-medium"
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
                  className="font-family-semibold"
                  style={{ fontSize: 14, margin: "3px 0 0", lineHeight: 1 }}
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
    className={`transition-all duration-150 font-family-medium cursor-pointer px-3 py-2.5 rounded-lg ${
      active
        ? "bg-indigo-50 font-family-semibold text-[#004a70]"
        : danger
          ? "hover:bg-red-50 text-red-500"
          : "hover:bg-gray-100 text-gray-700"
    }`}
  >
    {label}
  </div>
);

export default Header;
