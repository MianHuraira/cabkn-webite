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
import { useRouter } from "next/navigation";

const Header = () => {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const [driverModal, SetdriverModal] = useState(false);
  const handleClosedriver = () => SetdriverModal(false);

  const dispatch = useDispatch();

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    const scrollToElementFromHash = () => {
      if (hash) {
        const elementId = hash.replace("#", "");
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    };
    scrollToElementFromHash();
  }, []);

  const handleScroll = (id) => {
    setActiveLink(id);
    const targetElement = document.getElementById(id);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
    handleClose();
  };

  useEffect(() => {
    const handleScrollEvent = () => {
      setIsScrolled(window.scrollY > 7);
    };

    handleScrollEvent();
    window.addEventListener("scroll", handleScrollEvent, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScrollEvent);
    };
  }, []);

  const Route = (data) => {
    router.push(`/${data}`);
    handleClose();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth");
    dispatch(userChat(0));
  };

  const navLinks = [
    { id: "whyUs", label: "Why Us" },
    { id: "benefits", label: "Benefits" },
    { id: "testimonials", label: "Testimonials" },
    { id: "contactUs", label: "Contact Us" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${mounted ? "animate-header-slide-down" : "opacity-0"} ${isScrolled
          ? "bg-black shadow-lg py-2"
          : "bg-transparent py-4"
          }`}
      >
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6 lg:gap-8">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 hover:scale-[1.02] transition-transform duration-300">
            <Image
              src={logoBlue}
              alt="Cabkn"
              width={110}
              height={38}
              className="w-auto h-auto max-h-8 sm:max-h-9 lg:max-h-10"
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleScroll(link.id)}
                className="relative group px-3 xl:px-4 py-2 text-[13px] xl:text-sm text-white/75 hover:text-white transition-colors duration-200 cursor-pointer bg-transparent border-none tracking-wide font-medium"
              >
                <span className="relative inline-block pb-0.5">
                  {link.label}
                  <span
                    className={`absolute -bottom-[2px] left-0 h-[2px] bg-gradient-to-r from-brand-400 to-brand-500 rounded-full transition-all duration-300 ease-out ${activeLink === link.id
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                      }`}
                  />
                </span>
              </button>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            <Link
              href="/auth/login"
              className="px-4 xl:px-6 py-2 xl:py-2.5 rounded-full text-[13px] xl:text-sm font-medium text-white/70 border border-white/25 hover:text-white hover:border-white/60 hover:bg-white/5 transition-all duration-300"
            >
              Login
            </Link>
            <Link
              href="/auth/stepOne"
              className="px-4 xl:px-5 py-2 xl:py-2.5 rounded-full text-[13px] xl:text-sm font-semibold text-[#0a1f2e] bg-white shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Sign Up
            </Link>
            <button
              onClick={() => SetdriverModal(true)}
              className="px-4 xl:px-5 py-2 xl:py-2.5 rounded-full text-[13px] xl:text-sm font-semibold text-[#0a1f2e] bg-white shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Driver Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer bg-transparent border-none"
            onClick={handleShow}
            aria-label="Toggle menu"
          >
            {show ? <IoClose size={26} /> : <HiMenuAlt3 size={26} />}
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[1001] transition-all duration-300 ${show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={handleClose}
      />

      <div
        className={`fixed top-0 right-0 w-[320px] max-w-[85vw] h-full bg-gradient-to-b from-[#0d2538] to-[#0a1f2e] z-[1002] shadow-[-20px_0_60px_rgba(0,0,0,0.4)] overflow-y-auto transition-all duration-300 ease-out ${show ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-[#0a1f2e]/80 backdrop-blur-xl">
          <Image
            src={logoBlue}
            alt="Cabkn"
            width={95}
            height={33}
            className="w-auto h-auto"
          />
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all duration-300 cursor-pointer bg-transparent border-none"
            onClick={handleClose}
            aria-label="Close menu"
          >
            <IoClose size={22} />
          </button>
        </div>

        <div className="px-6 pt-8 pb-6 flex flex-col gap-10">
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] uppercase tracking-[2px] text-white/30 font-medium px-1 mb-2">Menu</p>
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleScroll(link.id)}
                className={`relative flex items-center gap-3 w-full text-left px-4 py-3.5 text-[15px] rounded-xl transition-all duration-300 cursor-pointer bg-transparent border-none ${activeLink === link.id
                  ? "text-white bg-white/10 font-medium"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                  }`}
              >
                <span className={`w-1 h-1 rounded-full transition-all duration-300 ${activeLink === link.id ? "bg-brand-500 scale-150" : "bg-white/20"
                  }`} />
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[10px] uppercase tracking-[2px] text-white/30 font-medium px-1 mb-1">Account</p>
            <Link
              href="/auth/login"
              onClick={handleClose}
              className="w-full py-3.5 rounded-xl text-sm font-medium text-center text-white/80 border border-white/20 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all duration-300"
            >
              Login
            </Link>
            <Link
              href="/auth/stepOne"
              onClick={handleClose}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-center text-[#0a1f2e] bg-white shadow-lg shadow-white/20 hover:shadow-xl hover:bg-white/90 transition-all duration-300"
            >
              Sign Up
            </Link>
            <button
              onClick={() => {
                SetdriverModal(true);
                handleClose();
              }}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-center text-white bg-gradient-to-r from-brand-500 to-brand-600 shadow-lg shadow-brand-600/25 hover:shadow-xl hover:from-brand-400 hover:to-brand-500 transition-all duration-300"
            >
              Sign Up as Driver
            </button>
          </div>
        </div>
      </div>

      <Modal
        centered
        backdrop="static"
        show={driverModal}
        onHide={handleClosedriver}
        className="bg-transparent border-0"
        dialogClassName="bg-transparent mx-auto my-auto min-w-0"
        contentClassName="!bg-transparent !border-0 !shadow-none"
      >
        <div className="relative bg-white rounded-[28px] shadow-[0_25px_80px_rgba(0,0,0,0.25)] overflow-hidden max-w-[420px] mx-auto">
          <div className="relative bg-[#0a1f2e] px-8 pt-10 pb-14 text-center overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-500/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
            <button
              onClick={handleClosedriver}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white/40 hover:text-white transition-all duration-300 cursor-pointer border-none z-10"
            >
              <IoClose size={16} />
            </button>
            <div className="relative z-10">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-500 shadow-lg shadow-brand-500/30 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <h2 className="text-white text-xl font-bold m-0 tracking-tight">Driver App</h2>
              <p className="text-white/50 text-[13px] mt-1.5 m-0 font-normal">Take control of your rides</p>
            </div>
          </div>

          <div className="relative -mt-6 mx-4 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 px-6 py-6 z-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4.5 h-4.5 text-brand-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.362 1.093a.75.75 0 0 0-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925ZM18 6.443l-7.25 4v8.25l6.862-3.786A.75.75 0 0 0 18 14.25V6.443ZM9.25 18.693v-8.25l-7.25-4v7.807a.75.75 0 0 0 .388.657l6.862 3.786Z" />
                </svg>
              </div>
              <div>
                <p className="text-[#0a1f2e] font-semibold text-[15px] m-0 leading-tight">Download our app</p>
                <p className="text-gray-400 text-[12px] m-0 mt-0.5">Available on iOS & Android</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() =>
                  window.open(
                    "https://play.google.com/store/apps/details?id=com.cabkndriver.app&hl=en",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
                className="group w-full flex items-center gap-4 px-6 py-3 rounded-xl bg-[#0a1f2e] hover:bg-[#0f2a3e] text-white transition-all duration-300 cursor-pointer border-none shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#0a1f2e]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.98 3.5C4.36 3.5 3.8 3.88 3.6 4.5c-.32.98-.3 2.1-.3 3.5v8c0 1.4-.02 2.52.3 3.5.2.62.77 1 1.4 1 .3 0 .55-.1.77-.28l10.8-7.5c.45-.35.7-.88.7-1.43 0-.55-.25-1.08-.7-1.43L5.74 3.78c-.22-.18-.46-.28-.76-.28z" />
                  </svg>
                </span>
                <div className="text-left">
                  <p className="text-[9px] text-white/50 group-hover:text-white/70 m-0 leading-none tracking-wider uppercase">Get it on</p>
                  <p className="text-[14px] font-semibold m-0 leading-none mt-0.5">Google Play</p>
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
                className="group w-full flex items-center gap-4 px-6 py-3 rounded-xl bg-[#0a1f2e] hover:bg-[#0f2a3e] text-white transition-all duration-300 cursor-pointer border-none shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#0a1f2e]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                </span>
                <div className="text-left">
                  <p className="text-[9px] text-white/50 group-hover:text-white/70 m-0 leading-none tracking-wider uppercase">Download on</p>
                  <p className="text-[14px] font-semibold m-0 leading-none mt-0.5">App Store</p>
                </div>
              </button>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 text-center m-0 leading-relaxed">
              By continuing, you agree to our{" "}
              <span className="text-gray-500 underline underline-offset-2 cursor-pointer hover:text-gray-700 transition-colors">Terms</span>
              {" & "}
              <span className="text-gray-500 underline underline-offset-2 cursor-pointer hover:text-gray-700 transition-colors">Privacy Policy</span>
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Header;
