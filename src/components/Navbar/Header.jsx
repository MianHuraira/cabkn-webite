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
                className={`animate-fade-in-down font-family-medium px-3 py-2 text-sm transition-all duration-200 ${isActive(link.id)
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
              className={`font-family-medium px-4 py-2 rounded-lg text-sm transition-all duration-200 !border ${isScrolled
                ? "!border-gray-200 text-gray-600 hover:text-[#004a70] hover:!border-[#004a70]"
                : "!border-white/30 text-white hover:!border-white/50 hover:bg-white/10"
                }`}
            >
              Login
            </Link>
            <Link
              href="/auth/step-one"
              className={`font-family-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200 !border-transparent ${isScrolled
                ? "bg-[#004a70] text-white hover:bg-[#003353]"
                : "bg-white text-[#004a70] hover:bg-gray-100"
                }`}
            >
              Sign Up
            </Link>
            <button
              onClick={() => SetdriverModal(true)}
              className={`font-family-medium px-4 py-2 rounded-lg text-sm transition-all duration-200 !border ${isScrolled
                ? "!border-[#004a70]/30 text-[#004a70] hover:bg-[#004a70] hover:text-white"
                : "!border-white/30 text-white hover:bg-white/10 hover:!border-white/50"
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
        dialogClassName="!max-w-md font-poppins"
        contentClassName="bg-transparent border-none shadow-none"
      >
        <div className="relative bg-white rounded-[24px] overflow-hidden shadow-2xl">
          {/* Header Gradient */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 p-8 pt-10 text-center">
            {/* Mesh pattern overlay */}
            <div className="absolute inset-0 opacity-[0.05]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "24px 24px"
            }} />

            {/* Floating blobs */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-400/20 rounded-full blur-[40px] animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] animate-pulse" style={{ animationDelay: '1s' }} />

            <button
              onClick={handleClosedriver}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 border-none text-white hover:bg-white/25 hover:rotate-90 transition-all duration-300 backdrop-blur-sm z-10 cursor-pointer"
            >
              <HiX size={14} />
            </button>

            <div className="relative z-10 flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5} className="relative z-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
            </div>

            <h2 className="relative z-10 text-white text-[22px] font-family-bold !m-0 !mb-1 tracking-tight leading-tight">
              Driver App
            </h2>
            <p className="relative z-10 text-brand-100/80 text-[13px] font-family-medium !m-0">
              Take control of your rides
            </p>
          </div>

          <div className="p-6">
            <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 mb-5 flex items-center gap-4 transition-colors hover:bg-slate-50">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                <svg width={22} height={22} viewBox="0 0 20 20" fill="#004a70">
                  <path d="M10.362 1.093a.75.75 0 0 0-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925ZM18 6.443l-7.25 4v8.25l6.862-3.786A.75.75 0 0 0 18 14.25V6.443ZM9.25 18.693v-8.25l-7.25-4v7.807a.75.75 0 0 0 .388.657l6.862 3.786Z" />
                </svg>
              </div>
              <div>
                <p className="font-family-semibold text-[14px] text-slate-800 !m-0 leading-tight !mb-1">
                  Download our app
                </p>
                <p className="text-[12px] text-slate-500 font-family-medium !m-0">
                  Available on iOS & Android
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => window.open("https://play.google.com/store/apps/details?id=com.cabkndriver.app&hl=en", "_blank")}
                className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <svg width={20} height={20} viewBox="0 0 512 512" fill="#fff" className="shrink-0 group-hover:scale-110 transition-transform">
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                </svg>
                <div className="text-left">
                  <p className="text-[9px] text-white/60 !m-0 leading-none tracking-wider uppercase font-family-medium !mb-1">
                    Get it on
                  </p>
                  <p className="text-[12px] font-family-bold !m-0 leading-none tracking-tight">
                    Google Play
                  </p>
                </div>
              </button>

              <button
                onClick={() => window.open("https://apps.apple.com/pk/app/cabkn-driver/id6740235396", "_blank")}
                className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <svg width={22} height={22} viewBox="0 0 384 512" fill="#fff" className="shrink-0 group-hover:scale-110 transition-transform mb-1">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-111.9-39.7-143.6zM240.5 25.3c-23.5-26.7-54.3-38.3-91.5-34.2-3.3 30.5 7.3 59.4 28.7 81.7 21.9 22.9 50.4 35.8 80.3 33.1 2.6-29-6.3-57.5-27.5-80.6z" />
                </svg>
                <div className="text-left">
                  <p className="text-[9px] text-white/60 !m-0 leading-none tracking-wider uppercase font-family-medium !mb-1">
                    Download on the
                  </p>
                  <p className="text-[12px] font-family-bold !m-0 leading-none tracking-tight">
                    App Store
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Modal>
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
