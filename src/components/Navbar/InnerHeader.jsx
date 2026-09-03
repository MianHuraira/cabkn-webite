/* eslint-disable react/jsx-no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
"use client";
import React, { useEffect, useState, useRef } from "react";
import { Nav, Navbar, Form, Offcanvas, Modal } from "react-bootstrap";
import {
  FaUser,
  FaCheckDouble,
  FaExclamationCircle,
  FaCheckCircle,
  FaInfoCircle,
  FaTimes,
  FaCar,
  FaPlaneArrival,
  FaBox,
  FaCompass,
  FaHiking,
  FaMapMarkedAlt,
  FaStore,
  FaShoppingBag,
  FaTags,
  FaStar,
  FaCalendarCheck,
  FaChevronDown,
  FaChevronUp,
  FaWallet,
} from "react-icons/fa";
import { IoMdTime } from "react-icons/io";

import { message } from "antd";

import { useDispatch, useSelector } from "react-redux";
import { Badge } from "antd";
import { AiOutlineMenuFold } from "react-icons/ai";
import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import { MdNotificationsActive, MdNotificationsNone, MdLogout } from "react-icons/md";
import { IoHeart } from "react-icons/io5";
import moment from "moment";

import Link from "next/link";
import { AppStore, GooglePlay, logoBlue, whiteLogo } from "../assets/Images";
import Image from "next/image";
import ApiFunction from "../ApiFunction/ApiFunction";
import { logout, setUnreadCount, setNotifUnreadCount, setNotifLastTotal } from "../Redux/Slices/AuthSlice";
import { useRouter, usePathname } from "next/navigation";
import { encryptData } from "../ApiFunction/encrypted";
import { useSocket } from "../ApiFunction/SoketProvider";
import ApiFile from "../ApiFunction/ApiFile";
import DriverModal from "./DriverModal";

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

  // Dropdown States for Categorized Navigation
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileOpenCat, setMobileOpenCat] = useState(null);
  const dropdownTimeoutRef = useRef(null);
  const navMenuRef = useRef(null);

  const handleMouseEnter = (id) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const handleToggleDropdown = (id) => {
    setActiveDropdown((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navMenuRef.current && !navMenuRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveDropdown(null);
  }, [pathname]);

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
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [notifShow, setNotifShow] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifFilter, setNotifFilter] = useState("all");
  const [notifLoading, setNotifLoading] = useState(false);
  const notifMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setNotifShow(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const navCategories = [
    {
      id: "rides",
      label: "Rides & Transit",
      hrefPrefixes: ["/ride", "/airport-pickups", "/sendparcel", "/admin"],
      items: [
        {
          title: "Book a Ride",
          desc: "Book certified drivers for island transfers, sightseeing, and travel.",
          href: "/ride",
          icon: <FaCar size={16} />,
        },
        {
          title: "Airport Pickups",
          desc: "Scheduled airport transfers with live flight tracking and luggage help.",
          href: "/airport-pickups",
          icon: <FaPlaneArrival size={16} />,
        },
        {
          title: "Send a Parcel",
          desc: "Fast door-to-door courier service for packages, food, and documents.",
          href: "/sendparcel",
          icon: <FaBox size={16} />,
        },
        {
          title: "My Bookings",
          desc: "Manage your requested rides, view upcoming trips, and receipts.",
          href: "/admin",
          icon: <FaCalendarCheck size={16} />,
        },
      ],
      featured: {
        tag: "BOOK A RIDE",
        title: "Island transportation, on demand",
        desc: "One account for instant cabs, airport shuttles, and courier delivery — booked with verified local drivers.",
        buttonText: "Book a Ride",
        buttonHref: "/ride",
      },
    },
    {
      id: "tours",
      label: "Explore & Tours",
      hrefPrefixes: ["/makeowntours", "/tours", "/popularplaces", "/listownplace"],
      items: [
        {
          title: "Make Own Tours",
          desc: "Custom-build your island itinerary, choose scenic stops, and explore.",
          href: "/makeowntours",
          icon: <FaCompass size={16} />,
        },
        {
          title: "Top Island Tours",
          desc: "Book guided volcano hikes, scenic railway tours, and rainforest trips.",
          href: "/tours",
          icon: <FaHiking size={16} />,
        },
        {
          title: "Popular Places",
          desc: "Explore Brimstone Hill Fortress, Cockleshell Bay, and scenic sights.",
          href: "/popularplaces",
          icon: <FaMapMarkedAlt size={16} />,
        },
        {
          title: "List Own Place",
          desc: "Partner with us and showcase your resort, villa, or venue to tourists.",
          href: "/listownplace",
          icon: <FaStore size={16} />,
        },
      ],
      featured: {
        tag: "EXPLORE TOURS",
        title: "Tours & excursions, on demand",
        desc: "Discover historic fortresses, breathtaking turquoise beaches, and lush rainforest trails with certified guides.",
        buttonText: "Book a Tour",
        buttonHref: "/tours",
      },
    },
    {
      id: "services",
      label: "Services & More",
      hrefPrefixes: ["/serviceLocations", "/coupon", "/userreviews"],
      items: [
        {
          title: "Shop & Services",
          desc: "Order local Caribbean food, catering, beach equipment, and rentals.",
          href: "/serviceLocations",
          icon: <FaShoppingBag size={16} />,
        },
        {
          title: "Special Offers",
          desc: "Access seasonal travel discounts, promotional coupons, and deals.",
          href: "/coupon",
          icon: <FaTags size={16} />,
        },
        {
          title: "Customer Reviews",
          desc: "Read authentic reviews and ratings from fellow island travelers.",
          href: "/userreviews",
          icon: <FaStar size={16} />,
        },
        {
          title: "Drive & Earn",
          desc: "Join our driver network, register your vehicle, and start earning.",
          action: "driverModal",
          icon: <FaCar size={16} />,
        },
      ],
      featured: {
        tag: "BOOK A SERVICE",
        title: "Cleanup & site services, on demand",
        desc: "One account for verified local services, equipment rentals, certified vendors, and trusted providers.",
        buttonText: "Book a Service",
        buttonHref: "/serviceLocations",
      },
    },
  ];

  const isCategoryActive = (category) => {
    return category.hrefPrefixes.some((prefix) => pathname.startsWith(prefix));
  };

  return (
    <div className="font-poppins">
      <header
        className={`!fixed !top-0 !left-0 !right-0 !w-full !z-[999] !transition-all !duration-300 ${
          mounted ? "!animate-header-slide-down" : "!opacity-0"
        } ${
          isScrolled
            ? "!bg-white/95 !backdrop-blur-md !shadow-sm !border-b !border-slate-200/80 !py-2 sm:!py-2.5"
            : "!bg-transparent !py-3 sm:!py-4 !border-b !border-transparent !shadow-none"
        }`}
      >
        <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !flex !items-center !justify-between !relative">
          {/* Logo */}
          <Link
            href={"/"}
            className="!flex !items-center !flex-shrink-0 !no-underline !transition-transform !duration-300 hover:!scale-105"
          >
            <Image
              src={isScrolled ? logoBlue : whiteLogo}
              alt="Welcome to Saint Kitts"
              width={72}
              height={40}
              className="!h-7 sm:!h-8 !w-auto !object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav - Categorized with Mega Dropdown */}
          <div ref={navMenuRef} className="hidden xl:!flex !items-center !gap-1 !flex-1 !justify-center !px-4 !relative">
            {/* 1. Home Link */}
            <Link
              href="/"
              className={`!px-3.5 !py-1.5 !rounded-full !text-[13px] !transition-all !duration-200 !whitespace-nowrap !select-none !no-underline ${
                isActive("/")
                  ? isScrolled
                    ? "!bg-[#004a70] !text-white !font-family-semibold !font-semibold !shadow-sm"
                    : "!bg-white/25 !text-white !font-family-semibold !font-semibold !backdrop-blur-md !shadow-sm"
                  : isScrolled
                  ? "!text-slate-700 hover:!text-[#004a70] hover:!bg-slate-100/80 !font-family-medium !font-normal"
                  : "!text-white/90 hover:!text-white hover:!bg-white/15 !font-family-medium !font-normal"
              }`}
            >
              Home
            </Link>

            {/* 2. Categorized Mega Dropdown Triggers */}
            {navCategories.map((category) => {
              const active = isCategoryActive(category);
              const isOpen = activeDropdown === category.id;

              return (
                <div
                  key={category.id}
                  className="!relative"
                  onMouseEnter={() => handleMouseEnter(category.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleDropdown(category.id)}
                    className={`!px-3.5 !py-1.5 !rounded-full !text-[13px] !transition-all !duration-200 !whitespace-nowrap !select-none !flex !items-center !gap-1.5 !border-none !cursor-pointer ${
                      active || isOpen
                        ? isScrolled
                          ? "!bg-[#004a70] !text-white !font-family-semibold !font-semibold !shadow-sm"
                          : "!bg-white/25 !text-white !font-family-semibold !font-semibold !backdrop-blur-md !shadow-sm"
                        : isScrolled
                        ? "!text-slate-700 hover:!text-[#004a70] hover:!bg-slate-100/80 !font-family-medium !font-normal !bg-transparent"
                        : "!text-white/90 hover:!text-white hover:!bg-white/15 !font-family-medium !font-normal !bg-transparent"
                    }`}
                  >
                    <span>{category.label}</span>
                    <FaChevronDown
                      size={9}
                      className={`!transition-transform !duration-200 ${
                        isOpen ? "!rotate-180" : ""
                      } ${
                        active || isOpen
                          ? "!text-white"
                          : isScrolled
                          ? "!text-slate-500"
                          : "!text-white/80"
                      }`}
                    />
                  </button>

                  {/* Mega Menu Dropdown (Matches User Screenshot: Single column of items + Right Featured Card) */}
                  {isOpen && (
                    <div
                      className={`!animate-fade-in-up !absolute !top-[calc(100%+12px)] ${
                        category.id === "rides"
                          ? "!left-0"
                          : category.id === "services"
                          ? "!right-0"
                          : "!left-1/2 !-translate-x-1/2"
                      } !w-[660px] sm:!w-[700px] !bg-white !rounded-3xl !shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22)] !border !border-slate-150/70 !p-7 sm:!p-8 !z-[9999] !flex !items-stretch !text-left !cursor-default`}
                      onMouseEnter={() => handleMouseEnter(category.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Left Column: 4 items stacked vertically with generous right clearance from line */}
                      <div className="!flex !flex-col !gap-2.5 !flex-1 !pr-6 sm:!pr-7">
                        {category.items.map((item) => {
                          if (item.action === "driverModal") {
                            return (
                              <div
                                key={item.title}
                                onClick={() => {
                                  setActiveDropdown(null);
                                  HandleModal();
                                }}
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
                              onClick={() => setActiveDropdown(null)}
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

                      {/* Clean Vertical Divider with independent clearance on both sides */}
                      <div className="!w-px !bg-slate-200/90 !self-stretch !shrink-0 !my-1" />

                      {/* Right Column: Featured Section with Primary App Color Scheme (#004a70) */}
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
                            onClick={() => setActiveDropdown(null)}
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

            {/* 3. Wallet Link */}
            <Link
              href="/wallet"
              className={`!px-3.5 !py-1.5 !rounded-full !text-[13px] !transition-all !duration-200 !whitespace-nowrap !select-none !no-underline !flex !items-center !gap-1.5 ${
                isActive("/wallet")
                  ? isScrolled
                    ? "!bg-[#004a70] !text-white !font-family-semibold !font-semibold !shadow-sm"
                    : "!bg-white/25 !text-white !font-family-semibold !font-semibold !backdrop-blur-md !shadow-sm"
                  : isScrolled
                  ? "!text-slate-700 hover:!text-[#004a70] hover:!bg-slate-100/80 !font-family-medium !font-normal"
                  : "!text-white/90 hover:!text-white hover:!bg-white/15 !font-family-medium !font-normal"
              }`}
            >
              <FaWallet size={11} className="!opacity-80" />
              <span>Wallet</span>
            </Link>
          </div>

          {/* Right: Icons + User + Mobile Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Chat Icon Button */}
            <Link
              href="/chat"
              title="Messages"
              className="no-underline"
            >
              <Badge
                count={unreadCount}
                size="small"
                offset={[-2, 2]}
                style={{ backgroundColor: "#ef4444" }}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 !border ${
                    isScrolled
                      ? "!border-slate-200/90 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#004a70] shadow-sm"
                      : "!border-white/30 bg-white/15 hover:bg-white/25 text-white"
                  }`}
                >
                  <HiOutlineChatBubbleOvalLeft size={18} />
                </div>
              </Badge>
            </Link>

            {/* Notification Dropdown Button (Visible on Both Desktop & Mobile) */}
            <div ref={notifMenuRef} className="relative">
              <Badge
                count={notifUnreadCount}
                size="small"
                offset={[-2, 2]}
                style={{ backgroundColor: "#ef4444" }}
              >
                <button
                  onClick={() => setNotifShow((prev) => !prev)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 !border ${
                    isScrolled
                      ? "!border-slate-200/90 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#004a70] shadow-sm"
                      : "!border-white/30 bg-white/15 hover:bg-white/25 text-white"
                  }`}
                >
                  <MdNotificationsActive size={17} />
                </button>
              </Badge>

              {/* Notification Popover Dropdown */}
              {notifShow && (
                <div
                  className="animate-fade-in-up absolute top-[calc(100%+12px)] right-[-60px] sm:right-0 w-[330px] sm:w-[380px] max-w-[calc(100vw-32px)] !bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] !border !border-slate-100 z-[9999] overflow-hidden flex flex-col max-h-[500px]"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  {/* Header */}
                  <div className="p-4 sm:p-4.5 !border-b !border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#004a70]">
                        <MdNotificationsActive size={16} color="#004a70" />
                      </div>
                      <div>
                        <h4 className="font-family-semibold text-sm text-slate-800 !m-0 leading-tight">
                          Notifications
                        </h4>
                        <p className="font-family-medium text-[11px] text-slate-400 !m-0 mt-0.5">
                          {notifications.length} {notifications.length === 1 ? "update" : "updates"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setNotifShow(false)}
                      className="w-7 h-7 rounded-lg !border-none bg-slate-200/70 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center text-xs transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex gap-1.5 px-4 py-2.5 !border-b !border-slate-100 bg-white">
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
                          className={`px-3 py-1 rounded-full text-xs font-family-medium transition-all duration-200 cursor-pointer !border-0 ${
                            isActive
                              ? "bg-[#004a70] text-white font-family-semibold shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                          }`}
                        >
                          {btn.label} {count > 0 && `(${count})`}
                        </button>
                      );
                    })}
                  </div>

                  {/* List */}
                  <div className="flex-1 overflow-y-auto max-h-[320px] divide-y divide-slate-100">
                    {notifLoading ? (
                      <div className="p-4 space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex gap-3 items-start animate-pulse">
                            <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
                            <div className="flex-1 space-y-1.5">
                              <div className="h-3 w-3/4 bg-slate-200 rounded" />
                              <div className="h-2.5 w-full bg-slate-100 rounded" />
                              <div className="h-2 w-1/4 bg-slate-100 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredNotifs.length === 0 ? (
                      <div className="py-10 px-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-2 text-slate-400">
                          <MdNotificationsNone size={24} color="#004a70" opacity={0.4} />
                        </div>
                        <p className="font-family-semibold text-xs text-slate-600 !m-0">
                          {notifFilter === "all"
                            ? "No notifications yet"
                            : notifFilter === "unread"
                              ? "No unread notifications"
                              : "No read notifications"}
                        </p>
                        <p className="font-family-regular text-[11px] text-slate-400 !m-0 mt-1">
                          {notifFilter === "all"
                            ? "Updates will appear here."
                            : "Try switching the filter tab."}
                        </p>
                      </div>
                    ) : (
                      filteredNotifs.map((notification, index) => {
                        const colors = getNotifColor(notification.type);
                        return (
                          <div
                            key={notification.id || index}
                            className={`p-3.5 flex gap-3 items-start transition-colors duration-150 cursor-pointer ${
                              notification.isRead ? "bg-white hover:bg-slate-50/80" : "bg-blue-50/30 hover:bg-blue-50/60"
                            }`}
                          >
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                              style={{ backgroundColor: colors.bg, color: colors.icon }}
                            >
                              {notification.image ? (
                                <img
                                  src={notification.image}
                                  alt=""
                                  className="w-full h-full rounded-xl object-cover"
                                />
                              ) : (
                                getNotifIcon(notification.type)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                {!notification.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-[#004a70] shrink-0 inline-block" />
                                )}
                                <p className={`text-xs !m-0 truncate leading-snug ${
                                  notification.isRead ? "text-slate-700 font-family-medium" : "text-slate-900 font-family-semibold"
                                }`}>
                                  {notification.title}
                                </p>
                              </div>
                              {notification.description && (
                                <p className="text-[11.5px] text-slate-500 font-family-regular !m-0 mt-0.5 line-clamp-2 leading-relaxed">
                                  {notification.description}
                                </p>
                              )}
                              <div className="flex items-center gap-1 text-[10.5px] text-slate-400 font-family-medium mt-1">
                                <IoMdTime size={11} color={getTimeColor(notification.createdAt)} />
                                <span style={{ color: getTimeColor(notification.createdAt) }}>
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
              )}
            </div>

            {/* Desktop User Avatar Menu / Auth Buttons */}
            {userData?.user ? (
              <div ref={userMenuRef} className="hidden xl:block relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden !border-2 shadow-sm hover:scale-105 ${
                    isScrolled ? "!border-slate-200 bg-slate-100" : "!border-white/40 bg-white/20"
                  }`}
                >
                  {userData?.user?.image ? (
                    <Image
                      width={36}
                      height={36}
                      src={userData?.user?.image}
                      className="w-full h-full object-cover"
                      alt="userImage"
                    />
                  ) : (
                    <FaUser size={15} className={isScrolled ? "text-slate-600" : "text-white"} />
                  )}
                </button>
                {userMenuOpen && (
                  <div
                    className="animate-fade-in-up absolute top-[calc(100%+12px)] right-0 w-[230px] !bg-white rounded-2xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] !border !border-slate-100 z-[9999]"
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    {/* User Header */}
                    <div className="px-3 py-2.5 !border-b !border-slate-100 mb-1">
                      <p className="font-family-semibold text-[13.5px] text-slate-800 !m-0 truncate leading-tight">
                        {userData?.user?.name || "Account"}
                      </p>
                      <p className="font-family-medium text-[11.5px] text-slate-400 !m-0 truncate mt-0.5">
                        {userData?.user?.email || "Logged In"}
                      </p>
                    </div>

                    {/* Links */}
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 font-family-medium text-[13px] no-underline transition-all duration-150 hover:bg-slate-100/80 hover:text-[#004a70]"
                    >
                      <FaUser size={13} className="text-slate-400" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      href="/chat"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 font-family-medium text-[13px] no-underline transition-all duration-150 hover:bg-slate-100/80 hover:text-[#004a70]"
                    >
                      <div className="flex items-center gap-2.5">
                        <HiOutlineChatBubbleOvalLeft size={15} className="text-slate-400" />
                        <span>Chat</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-family-semibold px-1.5 py-0.2 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/favorites"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 font-family-medium text-[13px] no-underline transition-all duration-150 hover:bg-slate-100/80 hover:text-[#004a70]"
                    >
                      <IoHeart size={14} className="text-slate-400" />
                      <span>Favorites</span>
                    </Link>

                    <div
                      onClick={() => {
                        HandleModal();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 font-family-medium text-[13px] cursor-pointer transition-all duration-150 hover:bg-slate-100/80 hover:text-[#004a70]"
                    >
                      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                      <span>Signup as Driver</span>
                    </div>

                    {/* Divider */}
                    <div className="!border-t !border-slate-100 my-1" />

                    {/* Logout Button (At the bottom, distinct danger style) */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setUserMenuOpen(false);
                        router.push("/auth/login");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 font-family-semibold text-[13px] transition-all duration-150 hover:bg-red-50 cursor-pointer !border-none bg-transparent"
                    >
                      <MdLogout size={15} className="text-red-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden xl:flex items-center gap-2 flex-shrink-0 animate-fade-in">
                <Link
                  href="/auth/login"
                  className={`font-family-medium px-4 py-2 rounded-full text-xs sm:text-sm transition-all duration-200 no-underline ${
                    isScrolled
                      ? "!border !border-slate-200 text-slate-700 hover:text-[#004a70] hover:!border-[#004a70] hover:bg-slate-50"
                      : "!border !border-white/30 text-white hover:!border-white/60 hover:bg-white/10"
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/auth/stepOne"
                  className={`font-family-semibold px-4 py-2 rounded-full text-xs sm:text-sm transition-all duration-200 no-underline shadow-sm ${
                    isScrolled
                      ? "bg-[#004a70] text-white hover:bg-[#003855]"
                      : "bg-white text-[#004a70] hover:bg-slate-100"
                  }`}
                >
                  Sign Up
                </Link>
                <button
                  onClick={() => SetdriverModal(true)}
                  className={`font-family-medium px-4 py-2 rounded-full text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                    isScrolled
                      ? "!border !border-[#004a70]/40 text-[#004a70] hover:bg-[#004a70] hover:text-white bg-transparent"
                      : "!border !border-white/40 text-white hover:bg-white/15 bg-transparent"
                  }`}
                >
                  Driver Sign Up
                </button>
              </div>
            )}

            {/* Mobile/Tablet Toggle Button */}
            <button
              onClick={() => setShow((prev) => !prev)}
              className={`xl:hidden w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 !border shadow-sm ${
                isScrolled
                  ? "!border-slate-200 bg-slate-100 hover:bg-slate-200 text-[#004A70]"
                  : "!border-white/30 bg-white/15 hover:bg-white/25 text-white"
              }`}
            >
              <AiOutlineMenuFold size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Offcanvas */}
      <Offcanvas
        show={show}
        onHide={handleClose}
        placement="start"
        className="font-poppins !bg-white"
        style={{
          width: 320,
          maxWidth: "85vw",
          borderRight: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Offcanvas.Header
          style={{
            borderBottom: "1px solid #f1f5f9",
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
              alt="Welcome to Saint Kitts"
              width={72}
              height={40}
              className="h-9 w-auto object-contain"
              style={{ objectFit: "contain" }}
            />
          </Link>
          <button
            onClick={handleClose}
            className="bg-slate-100 rounded-lg w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all cursor-pointer !border-none"
          >
            ✕
          </button>
        </Offcanvas.Header>

        <Offcanvas.Body className="!p-0 flex flex-col justify-between h-[calc(100vh-70px)] bg-white overflow-hidden">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 no-scrollbar">
            {/* If Logged In: User Profile Header Card */}
            {userData?.user && (
              <div className="bg-slate-50/80 !border !border-slate-100 rounded-2xl p-3.5 mb-1 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#004a70]/10 flex items-center justify-center shrink-0 overflow-hidden !border !border-[#004a70]/20">
                    {userData?.user?.image ? (
                      <Image
                        width={40}
                        height={40}
                        src={userData.user.image}
                        className="w-full h-full object-cover"
                        alt="user"
                      />
                    ) : (
                      <FaUser size={16} className="text-[#004a70]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-family-semibold text-[14px] text-slate-800 !m-0 truncate leading-tight">
                      {userData?.user?.name || "My Account"}
                    </p>
                    <p className="font-family-medium text-[11.5px] text-slate-400 !m-0 truncate mt-0.5">
                      {userData?.user?.email || "Member"}
                    </p>
                  </div>
                </div>

                {/* Quick actions row */}
                <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 !border-t !border-slate-200/60 text-center">
                  <button
                    onClick={() => {
                      Route("profile");
                    }}
                    className="py-1.5 px-1 rounded-lg bg-white !border !border-slate-200/70 text-slate-700 font-family-medium text-[11.5px] hover:text-[#004a70] hover:!border-[#004a70] transition-all cursor-pointer"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      Route("chat");
                    }}
                    className="py-1.5 px-1 rounded-lg bg-white !border !border-slate-200/70 text-slate-700 font-family-medium text-[11.5px] hover:text-[#004a70] hover:!border-[#004a70] transition-all cursor-pointer relative"
                  >
                    Chat
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-family-semibold w-4 h-4 rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      Route("favorites");
                    }}
                    className="py-1.5 px-1 rounded-lg bg-white !border !border-slate-200/70 text-slate-700 font-family-medium text-[11.5px] hover:text-[#004a70] hover:!border-[#004a70] transition-all cursor-pointer"
                  >
                    Favorites
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Links - Categorized Accordions on Mobile */}
            <div className="flex flex-col gap-1.5">
              {/* Home */}
              <MobileNavItem
                label="Home"
                active={isActive("/")}
                onClick={() => Route("")}
              />

              {/* Categorized Dropdowns on Mobile */}
              {navCategories.map((cat) => {
                const isOpen = mobileOpenCat === cat.id;
                const isCatActive = isCategoryActive(cat);

                return (
                  <div key={cat.id} className="rounded-xl border border-slate-150/70 overflow-hidden bg-slate-50/50">
                    <button
                      type="button"
                      onClick={() => setMobileOpenCat((prev) => (prev === cat.id ? null : cat.id))}
                      className={`w-full flex items-center justify-between p-3 text-xs font-family-semibold transition-colors border-none cursor-pointer ${
                        isCatActive
                          ? "text-[#004a70] bg-sky-50/60"
                          : "text-slate-700 hover:bg-slate-100/80 bg-transparent"
                      }`}
                    >
                      <span className="text-[13px]">{cat.label}</span>
                      <FaChevronDown
                        size={10}
                        className={`transition-transform duration-200 text-slate-400 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="p-2 pt-0 space-y-1 bg-white border-t border-slate-100">
                        {cat.items.map((item) => {
                          if (item.action === "driverModal") {
                            return (
                              <div
                                key={item.title}
                                onClick={() => {
                                  handleClose();
                                  HandleModal();
                                }}
                                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                              >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${item.color}`}>
                                  {item.icon}
                                </div>
                                <span className="text-xs font-family-medium text-slate-800">
                                  {item.title}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={handleClose}
                              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 no-underline"
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${item.color}`}>
                                {item.icon}
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-family-medium text-slate-800 block">
                                  {item.title}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Wallet */}
              <MobileNavItem
                label="Customer Wallet"
                active={isActive("/wallet")}
                onClick={() => Route("wallet")}
              />
            </div>
          </div>

          {/* Bottom Sticky Section ("niche") */}
          <div className="p-4 !border-t !border-slate-100 bg-slate-50/80 shrink-0 flex flex-col gap-2">
            {userData?.user ? (
              <>
                <button
                  onClick={() => {
                    handleClose();
                    HandleModal();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white !border !border-slate-200/80 text-slate-700 font-family-medium text-[12.5px] hover:text-[#004a70] hover:!border-[#004a70] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="text-slate-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  <span>Signup as Driver</span>
                </button>

                {/* Logout Button placed distinctly at the bottom ("niche") */}
                <button
                  onClick={() => {
                    handleLogout();
                    handleClose();
                    router.push("/auth/login");
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 !border !border-red-200/70 font-family-semibold text-[13.5px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <MdLogout size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
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
                    handleClose();
                    HandleModal();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 text-slate-600 !border !border-slate-200/60 font-family-medium text-[12.5px] hover:bg-slate-200 hover:text-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-0.5"
                >
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="text-slate-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  <span>Signup as Driver</span>
                </button>
              </>
            )}
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      <DriverModal show={driverModal} onHide={handleClosedriver} />
    </div>
  );
};

const MobileNavItem = ({ label, onClick, active, danger }) => (
  <div
    onClick={onClick}
    className={`transition-all duration-150 ${active
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
