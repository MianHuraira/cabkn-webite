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
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { Badge } from "antd";
import Link from "next/link";
import { AppStore, GooglePlay } from "../assets/Images";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import DriverModal from "./DriverModal";
import { openCart } from "../Redux/Slices/CartSlice";

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
  const cartItems = useSelector((state) => state.cart?.cartItems) || [];
  const cartCount = cartItems.reduce((acc, item) => acc + (item.cartQuantity || 1), 0);

  const [isScrolled, setIsScrolled] = useState(false);
  const isHome = pathname === "/";
  const isDarkNav = isScrolled || !isHome;

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
      <header
        className={`fixed top-0 left-0 right-0 w-full z-[999] transition-all duration-300 ${
          mounted ? "animate-header-slide-down" : "opacity-0"
        } ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm !border-b !border-slate-200/80 py-2.5 sm:py-3"
            : "bg-transparent py-3.5 sm:py-5 !border-b !border-transparent shadow-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center flex-shrink-0 no-underline transition-transform duration-300 hover:scale-105"
          >
            <Image
              src={isDarkNav ? logoBlue : whiteLogo}
              alt="Welcome to Saint Kitts"
              width={72}
              height={40}
              className="h-8 sm:h-9 w-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden xl:flex items-center gap-1.5 flex-1 justify-center px-4 overflow-x-auto no-scrollbar">
            {navLinks.map((link) => {
              const active = isActive(link.id);
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3.5 py-1.5 rounded-full text-[13.5px] transition-all duration-200 whitespace-nowrap select-none cursor-pointer !border-0 ${
                    active
                      ? isDarkNav
                        ? "bg-[#004a70] text-white font-family-semibold shadow-sm"
                        : "bg-white/25 text-white font-family-semibold backdrop-blur-md shadow-sm"
                      : isDarkNav
                      ? "bg-transparent text-slate-900 hover:text-[#004a70] hover:bg-slate-100/80 font-family-medium"
                      : "bg-transparent text-white/90 hover:text-white hover:bg-white/15 font-family-medium"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          <div
            className="hidden xl:flex items-center gap-2 flex-shrink-0 animate-fade-in"
            style={{ animationDelay: "150ms" }}
          >
            {/* Shopping Cart Button */}
            <Badge
              count={cartCount}
              size="small"
              offset={[-2, 2]}
              style={{ backgroundColor: "#004a70" }}
            >
              <button
                type="button"
                onClick={() => dispatch(openCart())}
                title="Shopping Cart"
                className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 !border ${
                  isDarkNav
                    ? "!border-slate-200/90 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#004a70] shadow-sm"
                    : "!border-white/30 bg-white/15 hover:bg-white/25 text-white"
                }`}
              >
                <HiOutlineShoppingBag size={18} />
              </button>
            </Badge>

            <Link
              href="/auth/login"
              className={`font-family-medium px-4 py-2 rounded-full text-xs sm:text-sm transition-all duration-200 no-underline ${
                isDarkNav
                  ? "!border !border-slate-200 text-slate-700 hover:text-[#004a70] hover:!border-[#004a70] hover:bg-slate-50"
                  : "!border !border-white/30 text-white hover:!border-white/60 hover:bg-white/10"
              }`}
            >
              Login
            </Link>
            <Link
              href="/auth/stepOne"
              className={`font-family-semibold px-4 py-2 rounded-full text-xs sm:text-sm transition-all duration-200 no-underline shadow-sm ${
                isDarkNav
                  ? "bg-[#004a70] text-white hover:bg-[#003855]"
                  : "bg-white text-[#004a70] hover:bg-slate-100"
              }`}
            >
              Sign Up
            </Link>
            <button
              onClick={() => SetdriverModal(true)}
              className={`font-family-medium px-4 py-2 rounded-full text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                isDarkNav
                  ? "!border !border-[#004a70]/40 text-[#004a70] hover:bg-[#004a70] hover:text-white bg-transparent"
                  : "!border !border-white/40 text-white hover:bg-white/15 bg-transparent"
              }`}
            >
              Driver Sign Up
            </button>
          </div>

          <button
            className={`xl:hidden w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 !border shadow-sm ${
              isDarkNav
                ? "!border-slate-200/80 bg-slate-100 hover:bg-slate-200 text-[#004a70]"
                : "!border-white/30 bg-white/15 hover:bg-white/25 text-white"
            }`}
            onClick={handleShow}
            aria-label="Toggle menu"
          >
            {show ? (
              <HiX size={20} />
            ) : (
              <HiMenuAlt3 size={20} />
            )}
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[1001] transition-all duration-300 ${show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={handleClose}
      />

      <div
        className={`fixed top-0 left-0 w-[320px] max-w-[85vw] h-full z-[1002] flex flex-col justify-between overflow-hidden transition-all duration-300 ease-out bg-white shadow-[20px_0_60px_rgba(0,0,0,0.15)] !border-r !border-black/6 ${show ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between p-4 !border-b !border-gray-100">
            <Link href="/" className="flex items-center" onClick={handleClose}>
              <Image
                src={logoBlue}
                alt="Welcome to Saint Kitts"
                width={72}
                height={40}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <button
              onClick={handleClose}
              className="bg-gray-100 rounded-lg w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all cursor-pointer !border-none"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-250px)] no-scrollbar">
            {navLinks.map((link) => (
              <MobileNavItem
                key={link.id}
                label={link.label}
                active={isActive(link.id)}
                onClick={() => handleNavClick(link.id)}
              />
            ))}
          </div>
        </div>

        {/* Dedicated Auth CTA Container at bottom (Distinct styling) */}
        <div className="p-4 !border-t !border-slate-100 bg-slate-50/80 mt-auto flex flex-col gap-2.5">
          <button
            onClick={() => {
              handleClose();
              router.push("/auth/stepOne");
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#004a70] text-white font-family-semibold text-[13.5px] hover:bg-[#003855] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer !border-none"
          >
            Sign Up
          </button>
          
          <button
            onClick={() => {
              handleClose();
              router.push("/auth/login");
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white text-slate-700 !border !border-slate-200 font-family-semibold text-[13.5px] hover:text-[#004a70] hover:!border-[#004a70] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Login
          </button>

          <button
            onClick={() => {
              SetdriverModal(true);
              handleClose();
            }}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 text-slate-600 !border !border-slate-200/60 font-family-medium text-[12.5px] hover:bg-slate-200 hover:text-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-0.5"
          >
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="text-slate-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <span>Signup as Driver</span>
          </button>
        </div>
      </div>

      <DriverModal show={driverModal} onHide={handleClosedriver} />
    </>
  );
};

const MobileNavItem = ({ label, onClick, active, danger }) => (
  <div
    onClick={onClick}
    className={`transition-all duration-150 font-family-medium cursor-pointer px-3 py-2.5 rounded-lg ${active
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
