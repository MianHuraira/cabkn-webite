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
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const router = useRouter();

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
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScrollEvent);
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
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
          isScrolled
            ? "bg-[rgba(10,31,46,0.95)] backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.3)] py-2 sm:py-2.5 border-b border-white/10"
            : "bg-transparent py-3 sm:py-4"
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
                    className={`absolute -bottom-[2px] left-0 h-[2px] bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300 ease-out ${
                      activeLink === link.id
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
              className="px-5 xl:px-7 py-2 xl:py-2.5 rounded-full text-[13px] xl:text-sm font-semibold text-[#0a1f2e] bg-white shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Sign Up
            </Link>
            <button
              onClick={() => SetdriverModal(true)}
              className="px-4 xl:px-5 py-2 xl:py-2.5 rounded-full text-[13px] xl:text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg shadow-orange-600/25 hover:shadow-xl hover:from-amber-400 hover:to-orange-500 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
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
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[1001] transition-all duration-300 ${
          show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      <div
        className={`fixed top-0 right-0 w-[320px] max-w-[85vw] h-full bg-gradient-to-b from-[#0d2538] to-[#0a1f2e] z-[1002] shadow-[-20px_0_60px_rgba(0,0,0,0.4)] overflow-y-auto transition-all duration-300 ease-out ${
          show ? "translate-x-0" : "translate-x-full"
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
                className={`relative flex items-center gap-3 w-full text-left px-4 py-3.5 text-[15px] rounded-xl transition-all duration-300 cursor-pointer bg-transparent border-none ${
                  activeLink === link.id
                    ? "text-white bg-white/10 font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <span className={`w-1 h-1 rounded-full transition-all duration-300 ${
                  activeLink === link.id ? "bg-amber-500 scale-150" : "bg-white/20"
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
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-center text-white bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg shadow-orange-600/25 hover:shadow-xl hover:from-amber-400 hover:to-orange-500 transition-all duration-300"
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
        className="driver-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>To Use Our Driver App</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h1 className="text-[#004a70] text-3xl font-bold">Download our</h1>
          <h1 className="text-2xl font-semibold mt-2">Mobile app</h1>
          <p className="mt-2 text-gray-600">
            Download the Cabkn driver app for easy transportation access!
          </p>
          <div className="mt-5 flex gap-3">
            <Image
              src={GooglePlay}
              className="cursor-pointer object-contain h-[50px] w-[170px]"
              alt="Google Play"
              onClick={() =>
                window.open(
                  "https://play.google.com/store/apps/details?id=com.cabkndriver.app&hl=en",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            />
            <Image
              className="cursor-pointer object-contain h-[50px] w-[170px]"
              src={AppStore}
              alt="App Store"
              onClick={() =>
                window.open(
                  "https://apps.apple.com/pk/app/cabkn-driver/id6740235396",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Header;
