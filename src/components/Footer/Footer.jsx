"use client";

import React, { useEffect, useState, useRef } from "react";
import { BsFillTelephoneFill, BsTwitterX } from "react-icons/bs";
import { FiMapPin, FiArrowRight } from "react-icons/fi";
import { AiOutlineMail } from "react-icons/ai";
import { FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useApi } from "../ApiFunction/ApiFunction";
import { ApplePlayBlack, GooglePlayblack, whiteLogo } from "../assets/Images";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Footer() {
  const userData = useSelector((state) => state.auth.user?.user);
  const { header1, getData } = useApi();
  const [FooterData, setFooterData] = useState({});
  const [hasError, setHasError] = useState(false);

  const router = useRouter();

  const getProfile = async () => {
    try {
      setHasError(false);
      const response = await getData("users/footer", header1);
      setFooterData(response?.footer || {});
    } catch (error) {
      console.error("Failed to load footer data:", error);
      setHasError(true);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const socialLinks = [
    { icon: <BsTwitterX size={14} />, key: "twitter", href: "#" },
    { icon: <FaFacebookF size={14} />, key: "facebook", href: "#" },
    { icon: <FaLinkedinIn size={14} />, key: "linkedin", href: "#" },
    { icon: <FaYoutube size={14} />, key: "youtube", href: "#" },
  ];

  return (
    <footer
      ref={sectionRef}
      className="bg-gradient-to-br from-brand-700 to-brand-950 font-family-regular"
    >
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-14 pb-8 lg:pb-10"
        style={{ maxWidth: 1200 }}
      >
        {/* Main 3-Column Grid - Clean Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Section: Brand Area */}
          <div
            className={`flex flex-col gap-4 items-center md:items-start reveal ${inView ? "visible" : ""}`}
            style={{ transitionDelay: "50ms" }}
          >
            {/* Logo */}
            <Link
              href="/"
              className="inline-flex items-center gap-3 focus:outline-none"
            >
              <div className="flex items-center justify-center">
                <Image
                  src={whiteLogo}
                  alt="CabKN"
                  height={32}
                  width={128}
                  className="h-[3rem] w-[3rem] object-contain"
                />
              </div>
            </Link>

            {/* Description */}
            <p className="text-white align-start text-sm leading-relaxed max-w-[280px] md:max-w-none  md:text-left font-family-regular">
              If you're stuck deciding between booking a taxi or renting a car,
              Cabkn is the perfect solution.
            </p>

            {/* CTA Button */}
            <button
              onClick={() => router.push(userData ? "/ride" : "/auth/login")}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white/10 backdrop-blur-md border-2 border-white/60 text-white rounded-xl shadow-xl hover:-translate-y-0.5 hover:bg-white/20 transition-all duration-300 font-family-semibold"
            >
              Request a driver
              <FiArrowRight size={14} />
            </button>
          </div>

          {/* Center Section: Contact Information - Simple Clean */}
          <div
            className={`flex flex-col gap-4 items-center md:items-start reveal ${inView ? "visible" : ""}`}
            style={{ transitionDelay: "150ms" }}
          >
            <h4 className="text-white text-sm font-family-semibold m-0">
              Contact Us
            </h4>

            <div className="flex flex-col gap-2 items-center md:items-start">
              {/* Phone */}
              {FooterData?.phone && (
                <Link
                  href={`tel:${FooterData?.phone}`}
                  className="group flex items-center gap-2.5 text-white hover:text-white transition-colors"
                >
                  <BsFillTelephoneFill size={13} className="text-white/80" />
                  <span className="text-sm font-family-regular">
                    {FooterData?.phone}
                  </span>
                </Link>
              )}

              {/* Email */}
              {FooterData?.emails && (
                <Link
                  href={`mailto:${FooterData?.emails}`}
                  className="group flex items-center gap-2.5 text-white hover:text-white transition-colors"
                >
                  <AiOutlineMail size={14} className="text-white/80" />
                  <span className="text-sm font-family-regular">
                    {FooterData?.emails}
                  </span>
                </Link>
              )}

              {/* Location */}
              {FooterData?.location && (
                <div className="group flex items-start gap-2.5 text-white">
                  <FiMapPin size={14} className="text-white/80 mt-0.5" />
                  <span className="text-sm leading-relaxed text-center md:text-left max-w-[200px] md:max-w-none font-family-regular">
                    {FooterData?.location}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Section: Social & App Downloads */}
          <div
            className={`flex flex-col gap-4 items-center md:items-start reveal ${inView ? "visible" : ""}`}
            style={{ transitionDelay: "250ms" }}
          >
            {/* Social Media - Clean */}
            <div className="flex flex-col gap-2 items-center md:items-start">
              <h4 className="text-white text-sm font-family-semibold m-0">
                Follow Us
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                {socialLinks.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="group w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white hover:text-[#004a70] transition-all duration-300"
                  >
                    {item.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* App Downloads */}
            <div className="flex flex-col gap-2 items-center md:items-start">
              <h4 className="text-white text-sm font-family-semibold m-0">
                Download Our App
              </h4>
              <p className="text-white/70 text-xs leading-relaxed max-w-[200px] md:max-w-none text-center md:text-left font-family-regular">
                Book rides on the go with our mobile app.
              </p>

              {/* App Store Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1 items-center sm:items-start">
                <Link
                  href="https://play.google.com/store/apps/details?id=com.cabkn.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center bg-black rounded-lg p-1 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                >
                  <Image
                    src={GooglePlayblack}
                    alt="Download on Google Play"
                    height={36}
                    width={120}
                    className="h-9 w-auto max-w-[140px]"
                  />
                </Link>
                <Link
                  href="https://apps.apple.com/pk/app/cabkn/id6740235227"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center bg-black rounded-lg p-1 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                >
                  <Image
                    src={ApplePlayBlack}
                    alt="Download on App Store"
                    height={36}
                    width={120}
                    className="h-9 w-auto max-w-[140px]"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar - Clean */}
      <div className="bg-brand-950/90 border-t border-white/10">
        <div
          className="mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4"
          style={{ maxWidth: 1200 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3">
           
              <p className="text-gray-400 text-[12px] m-0 text-center sm:text-left font-family-regular">
                &copy; {new Date().getFullYear()} CabKN. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/privacy"
                className="text-gray-400 text-[12px] cursor-pointer hover:text-white transition-colors duration-300 font-family-regular"
              >
                Privacy Policy
              </Link>
              <span className="text-white/30 text-[12px]">·</span>
              <Link
                href="/terms"
                className="text-gray-400 text-[12px] cursor-pointer hover:text-white transition-colors duration-300 font-family-regular"
              >
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
