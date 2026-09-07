"use client";

import {
  FaCar,
  FaPlaneArrival,
  FaBox,
  FaCalendarCheck,
  FaCompass,
  FaHiking,
  FaStore,
  FaShoppingBag,
  FaTags,
  FaStar,
} from "react-icons/fa";

export const navCategories = [
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
    hrefPrefixes: ["/makeowntours", "/tours", "/listownplace"],
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