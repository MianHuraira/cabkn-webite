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
import {
  FaThumbsUp,
  FaAward,
  FaComments,
  FaEnvelope,
} from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { Badge } from "antd";
import Link from "next/link";
import { AppStore, GooglePlay } from "../assets/Images";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import DriverModal from "./DriverModal";
import { navCategories } from "./navData";
import { openCart } from "../Redux/Slices/CartSlice";
import ApiFunction from "../ApiFunction/ApiFunction";

const Header = () => {
  const { userData } = ApiFunction();
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
  const isDarkNav = isScrolled;

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

const aboutLinks = [
    {
      title: "Why Us",
      desc: "Discover what makes Cab K&N your trusted local travel partner.",
      href: "/why-us",
      icon: <FaThumbsUp size={16} />,
    },
    {
      title: "Benefits",
      desc: "Member perks, wallet savings, exclusive deals, and rewards.",
      href: "/benefits",
      icon: <FaAward size={16} />,
    },
    {
      title: "Testimonials",
      desc: "Real stories and reviews from our travelers and partners.",
      href: "/testimonials",
      icon: <FaComments size={16} />,
    },
    {
      title: "Contact Us",
      desc: "Talk to our team for support, partnerships, or bookings.",
      href: "/contact-us",
      icon: <FaEnvelope size={16} />,
    },
  ];

  const aboutFeatured = {
    tag: "ABOUT US",
    title: "Your trusted island travel partner",
    desc: "Local expertise, verified drivers, and 24/7 support for every ride, tour, and delivery.",
    buttonText: "Contact Us",
    buttonHref: "/contact-us",
  };

  const [openDropdown, setOpenDropdown] = useState(null);
  const [openMobileMenu, setOpenMobileMenu] = useState(null);
  const navRef = useRef(null);

  const closeMenus = () => {
    setOpenDropdown(null);
    setOpenMobileMenu(null);
  };

  const handleNavItemClick = (item) => {
    handleClose();
    closeMenus();
    if (item?.action === "driverModal") {
      SetdriverModal(true);
      return;
    }
    router.push(item?.href || "/");
  };

  useEffect(() => {
    closeMenus();
  }, [pathname]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

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

          <div ref={navRef} className="hidden xl:flex items-center gap-1.5 flex-1 justify-center px-4 no-scrollbar">
            {/* Standalone Home Link (always visible, not inside a dropdown) */}
            <Link
              href="/"
              onClick={() => setOpenDropdown(null)}
              className={`!px-3.5 !py-1.5 !rounded-full !text-[13px] !transition-all !duration-200 !whitespace-nowrap !select-none !no-underline ${
                pathname === "/"
                  ? isDarkNav
                    ? "!bg-[#004a70] !text-white !font-family-semibold !font-semibold !shadow-sm"
                    : "!bg-white/25 !text-white !font-family-semibold !font-semibold !backdrop-blur-md !shadow-sm"
                  : isDarkNav
                  ? "!text-slate-900 hover:!text-[#004a70] hover:!bg-slate-100/80 !font-family-medium !font-normal"
                  : "!text-white/90 hover:!text-white hover:!bg-white/15 !font-family-medium !font-normal"
              }`}
            >
              <span>Home</span>
            </Link>

            {navCategories.map((category) => {
              const open = openDropdown === category.id;
              const active = category.hrefPrefixes.some((prefix) =>
                pathname.startsWith(prefix)
              );
              return (
                <div
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(category.id)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(open ? null : category.id)}
                    className={`!px-3 !py-1.5 !rounded-full !text-[13px] !transition-all !duration-200 !whitespace-nowrap !select-none !flex !items-center !gap-1.5 !border-none !cursor-pointer ${
                      active || open
                        ? isDarkNav
                          ? "!bg-[#004a70] !text-white !font-family-semibold !font-semibold !shadow-sm"
                          : "!bg-white/25 !text-white !font-family-semibold !font-semibold !backdrop-blur-md !shadow-sm"
                        : isDarkNav
                        ? "!text-slate-900 hover:!text-[#004a70] hover:!bg-slate-100/80 !font-family-medium !font-normal !bg-transparent"
                        : "!text-white/90 hover:!text-white hover:!bg-white/15 !font-family-medium !font-normal !bg-transparent"
                    }`}
                  >
                    <span>{category.label}</span>
                    <FiChevronDown
                      size={9}
                      className={`!transition-transform !duration-200 ${
                        open ? "!rotate-180" : ""
                      } ${
                        active || open
                          ? "!text-white"
                          : isDarkNav
                          ? "!text-slate-700"
                          : "!text-white/80"
                      }`}
                    />
                  </button>

                  {open && (
                    <div
                      className={`!animate-fade-in-up !absolute !top-[calc(100%+12px)] ${
                        category.id === "rides"
                          ? "!left-0"
                          : category.id === "services"
                          ? "!right-0"
                          : "!left-1/2 !-translate-x-1/2"
                      } !w-[660px] sm:!w-[700px] !bg-white !rounded-3xl !shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22)] !border !border-slate-150/70 !p-3 sm:!p-5 !z-[9999] !flex !items-stretch !text-left !cursor-default`}
                      onMouseEnter={() => setOpenDropdown(category.id)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {/* Left Column: stacked items with icon */}
                      <div className="!flex !flex-col !gap-2.5 !flex-1 !pr-6 sm:!pr-7">
                        {category.items.map((item) => {
                          if (item.action === "driverModal") {
                            return (
                              <div
                                key={item.title}
                                onClick={() => handleNavItemClick(item)}
                                className="!flex !items-start !gap-3.5 !p-2.5 !rounded-2xl hover:!bg-slate-50/90 !transition-all !duration-150 !cursor-pointer !group !text-left"
                              >
                                <div className="!w-10 !h-10 !rounded-xl !flex !items-center !justify-center !shrink-0 !bg-slate-100/70 !text-slate-700 !border !border-slate-200/60 group-hover:!bg-sky-50 group-hover:!text-[#004a70] group-hover:!border-sky-200 !transition-colors">
                                  {item.icon}
                                </div>
                                <div className="!min-w-0">
                                  <span className="!text-[13.5px] !font-family-semibold !font-semibold !text-slate-900 group-hover:!text-[#004a70] !transition-colors !leading-tight !block">
                                    {item.title}
                                  </span>
                                  <p className="!text-[11.5px] !text-slate-500 !font-family-regular !font-normal !mt-1 !leading-snug !m-0">
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setOpenDropdown(null)}
                              className="!flex !items-start !gap-3.5 !p-2.5 !rounded-2xl hover:!bg-slate-50/90 !transition-all !duration-150 !no-underline !cursor-pointer !group !text-left"
                            >
                              <div className="!w-10 !h-10 !rounded-xl !flex !items-center !justify-center !shrink-0 !bg-slate-100/70 !text-slate-700 !border !border-slate-200/60 group-hover:!bg-sky-50 group-hover:!text-[#004a70] group-hover:!border-sky-200 !transition-colors">
                                {item.icon}
                              </div>
                              <div className="!min-w-0">
                                <span className="!text-[13.5px] !font-family-semibold !font-semibold !text-slate-900 group-hover:!text-[#004a70] !transition-colors !leading-tight !block">
                                  {item.title}
                                </span>
                                <p className="!text-[11.5px] !text-slate-500 !font-family-regular !font-normal !mt-1 !leading-snug !m-0">
                                  {item.desc}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Vertical Divider */}
                      <div className="!w-px !bg-slate-200/90 !self-stretch !shrink-0 !my-1" />

                      {/* Right Column: Featured */}
                      <div className="!w-[230px] !shrink-0 !pl-6 sm:!pl-7 !flex !flex-col !justify-between">
                        <div>
                          <span className="!text-[11px] !font-family-semibold !font-semibold !uppercase !tracking-wider !text-[#004a70] !block">
                            {category.featured.tag}
                          </span>
                          <div className="!text-[16px] !font-family-semibold !font-semibold !text-slate-900 !mt-2 !leading-snug">
                            {category.featured.title}
                          </div>
                          <p className="!text-[11.5px] !text-slate-500 !font-family-regular !font-normal !mt-2 !leading-relaxed !m-0">
                            {category.featured.desc}
                          </p>
                        </div>
                        <div className="!pt-4">
                          <Link
                            href={category.featured.buttonHref}
                            onClick={() => setOpenDropdown(null)}
                            className="!w-full !py-2.5 !rounded-xl !text-[13px] !font-family-semibold !font-semibold !text-white !bg-[#004a70] hover:!bg-[#003856] !flex !items-center !justify-center !transition-all !shadow-md hover:!shadow-lg !cursor-pointer !no-underline"
                          >
                            {category.featured.buttonText}
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* "More" Dropdown for all simple pages */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown("more")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "more" ? null : "more")}
                className={`!px-3 !py-1.5 !rounded-full !text-[13px] !transition-all !duration-200 !whitespace-nowrap !select-none !flex !items-center !gap-1.5 !border-none !cursor-pointer ${
                  openDropdown === "more" || aboutLinks.some((link) => isActive(link.href))
                    ? isDarkNav
                      ? "!bg-[#004a70] !text-white !font-family-semibold !font-semibold !shadow-sm"
                      : "!bg-white/25 !text-white !font-family-semibold !font-semibold !backdrop-blur-md !shadow-sm"
                    : isDarkNav
                    ? "!text-slate-900 hover:!text-[#004a70] hover:!bg-slate-100/80 !font-family-medium !font-normal !bg-transparent"
                    : "!text-white/90 hover:!text-white hover:!bg-white/15 !font-family-medium !font-normal !bg-transparent"
                }`}
              >
                <span>About Us</span>
                <FiChevronDown
                  size={9}
                  className={`!transition-transform !duration-200 ${
                    openDropdown === "more" ? "!rotate-180" : ""
                  } ${
                    openDropdown === "more"
                      ? "!text-white"
                      : isDarkNav
                      ? "!text-slate-700"
                      : "!text-white/80"
                  }`}
                />
              </button>

              {openDropdown === "more" && (
                <div
                  className="!animate-fade-in-up !absolute !right-0 !top-[calc(100%+12px)] !w-[660px] sm:!w-[700px] !bg-white !rounded-3xl !shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22)] !border !border-slate-150/70 !p-3 sm:!p-5 !z-[9999] !flex !items-stretch !text-left !cursor-default"
                  onMouseEnter={() => setOpenDropdown("more")}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  {/* Left Column: stacked items with icon */}
                  <div className="!flex !flex-col !gap-2.5 !flex-1 !pr-6 sm:!pr-7">
                    {aboutLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpenDropdown(null)}
                        className="!flex !items-start !gap-3.5 !p-2.5 !rounded-2xl hover:!bg-slate-50/90 !transition-all !duration-150 !no-underline !cursor-pointer !group !text-left"
                      >
                        <div className="!w-10 !h-10 !rounded-xl !flex !items-center !justify-center !shrink-0 !bg-slate-100/70 !text-slate-700 !border !border-slate-200/60 group-hover:!bg-sky-50 group-hover:!text-[#004a70] group-hover:!border-sky-200 !transition-colors">
                          {link.icon}
                        </div>
                        <div className="!min-w-0">
                          <span className="!text-[13.5px] !font-family-semibold !font-semibold !text-slate-900 group-hover:!text-[#004a70] !transition-colors !leading-tight !block">
                            {link.title}
                          </span>
                          <p className="!text-[11.5px] !text-slate-500 !font-family-regular !font-normal !mt-1 !leading-snug !m-0">
                            {link.desc}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Vertical Divider */}
                  <div className="!w-px !bg-slate-200/90 !self-stretch !shrink-0 !my-1" />

                  {/* Right Column: Featured */}
                  <div className="!w-[230px] !shrink-0 !pl-6 sm:!pl-7 !flex !flex-col !justify-between">
                    <div>
                      <span className="!text-[11px] !font-family-semibold !font-semibold !uppercase !tracking-wider !text-[#004a70] !block">
                        {aboutFeatured.tag}
                      </span>
                      <div className="!text-[16px] !font-family-semibold !font-semibold !text-slate-900 !mt-2 !leading-snug">
                        {aboutFeatured.title}
                      </div>
                      <p className="!text-[11.5px] !text-slate-500 !font-family-regular !font-normal !mt-2 !leading-relaxed !m-0">
                        {aboutFeatured.desc}
                      </p>
                    </div>
                    <div className="!pt-4">
                      <Link
                        href={aboutFeatured.buttonHref}
                        onClick={() => setOpenDropdown(null)}
                        className="!w-full !py-2.5 !rounded-xl !text-[13px] !font-family-semibold !font-semibold !text-white !bg-[#004a70] hover:!bg-[#003856] !flex !items-center !justify-center !transition-all !shadow-md hover:!shadow-lg !cursor-pointer !no-underline"
                      >
                        {aboutFeatured.buttonText}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className="hidden xl:flex items-center gap-2 flex-shrink-0 animate-fade-in"
            style={{ animationDelay: "150ms" }}
          >
            {/* Shopping Cart Button (Visible only when user is logged in) */}
            {userData && (
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
            )}

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
            <MobileNavItem
              label="Home"
              active={isActive("/")}
              onClick={() => handleNavItemClick({ href: "/" })}
            />

            {navCategories.map((category) => {
              const open = openMobileMenu === category.id;
              const active = category.hrefPrefixes.some((prefix) =>
                pathname.startsWith(prefix)
              );
              return (
                <div key={category.id}>
                  <div
                    onClick={() => setOpenMobileMenu(open ? null : category.id)}
                    className={`flex items-center justify-between transition-all duration-150 font-family-medium cursor-pointer px-3 py-2.5 rounded-lg ${
                      active
                        ? "bg-brand-50 text-[#004a70] font-family-semibold"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span>{category.label}</span>
                    <FiChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                  </div>
                  {open && (
                    <div className="ml-3 mt-1 flex flex-col gap-1 border-l-2 border-slate-100 pl-3">
                      {category.items.map((item) => (
                        <div
                          key={item.title}
                          className="px-3 py-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                          onClick={() => handleNavItemClick(item)}
                        >
                          <p className="!m-0 text-[13px] font-family-semibold text-slate-800 group-hover:text-[#004a70]">
                            {item.title}
                          </p>
                          <p className="!m-0 text-[11px] text-slate-500 font-family-regular leading-snug mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* "More" Accordion for simple pages */}
            <div>
              <div
                onClick={() => setOpenMobileMenu(openMobileMenu === "more" ? null : "more")}
                className={`flex items-center justify-between transition-all duration-150 font-family-medium cursor-pointer px-3 py-2.5 rounded-lg ${
                  openMobileMenu === "more" || aboutLinks.some((link) => isActive(link.href))
                    ? "bg-brand-50 text-[#004a70] font-family-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <span>About Us</span>
                <FiChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${openMobileMenu === "more" ? "rotate-180" : ""}`}
                />
              </div>
              {openMobileMenu === "more" && (
                <div className="ml-3 mt-1 flex flex-col gap-1 border-l-2 border-slate-100 pl-3">
                  {aboutLinks.map((link) => (
                    <MobileNavItem
                      key={link.href}
                      label={link.title}
                      active={isActive(link.href)}
                      onClick={() => handleNavItemClick(link)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dedicated Auth CTA Container at bottom (Distinct styling) */}
        <div className="px-4 pt-2 pb-3 !border-t !border-slate-100 bg-slate-50/80 mt-auto flex flex-col gap-1.5">
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
