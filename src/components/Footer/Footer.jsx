"use client";

import React, { useEffect, useState, useRef } from "react";
import { BsFillTelephoneFill, BsTwitterX } from "react-icons/bs";
import { FiMapPin, FiArrowRight } from "react-icons/fi";
import { AiOutlineMail } from "react-icons/ai";
import { FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useApi } from "../ApiFunction/ApiFunction";
import { ApplePlayBlack, GooglePlayblack, logoBlue } from "../assets/Images";
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
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const socialLinks = [
    { icon: <BsTwitterX size={16} />, key: "twitter", href: "#" },
    { icon: <FaFacebookF size={16} />, key: "facebook", href: "#" },
    { icon: <FaLinkedinIn size={16} />, key: "linkedin", href: "#" },
    { icon: <FaYoutube size={16} />, key: "youtube", href: "#" },
  ];

  return (
    <footer ref={sectionRef} className="bg-gradient-to-br from-brand-700 to-brand-950">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-14 pb-8 lg:pb-10">
        {/* Main 3-Column Grid - Clean Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Left Section: Brand Area */}
          <div className={`flex flex-col gap-4 items-center md:items-start reveal ${inView ? "visible" : ""}`}
               style={{ transitionDelay: "50ms" }}>
            
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-3 focus:outline-none">
              <div className="flex items-center justify-center">
                <Image 
                  src={logoBlue} 
                  alt="CabKN" 
                  height={36} 
                  width={144}
                  className="h-9 w-auto"
                />
              </div>
            </Link>
            
            {/* Description */}
            <p className="text-white/80 text-sm leading-relaxed max-w-[300px] md:max-w-none text-center md:text-left">
              {FooterData?.short_title || "Your reliable ride partner, connecting you to your destinations safely and comfortably."}
            </p>
            
            {/* CTA Button - Proper width on mobile */}
            <button
              onClick={() => router.push(userData ? "/ride" : "/auth/login")}
              className="group flex items-center justify-center gap-2 w-[260px] px-4 py-2.5 rounded-xl bg-white text-[#004a70] font-semibold text-sm shadow-lg shadow-black/12 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
            >
              Request a driver
              <FiArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
            
          </div>

          {/* Center Section: Contact Information - Simple Clean */}
          <div className={`flex flex-col gap-4 items-center md:items-start reveal ${inView ? "visible" : ""}`}
               style={{ transitionDelay: "150ms" }}>
            
            <h4 className="text-white text-sm font-semibold m-0">
              Contact Us
            </h4>
            
            <div className="flex flex-col gap-2 items-center md:items-start">
              
              {/* Phone */}
              {FooterData?.phone && (
                <Link 
                  href={`tel:${FooterData?.phone}`} 
                  className="group flex items-center gap-2.5 text-white/90 hover:text-white transition-colors"
                >
                  <BsFillTelephoneFill size={14} className="text-white/70" />
                  <span className="text-sm">{FooterData?.phone}</span>
                </Link>
              )}
              
              {/* Email */}
              {FooterData?.emails && (
                <Link 
                  href={`mailto:${FooterData?.emails}`} 
                  className="group flex items-center gap-2.5 text-white/90 hover:text-white transition-colors"
                >
                  <AiOutlineMail size={15} className="text-white/70" />
                  <span className="text-sm">{FooterData?.emails}</span>
                </Link>
              )}
              
              {/* Location */}
              {FooterData?.location && (
                <div className="group flex items-start gap-2.5 text-white/90">
                  <FiMapPin size={15} className="text-white/70 mt-0.5" />
                  <span className="text-sm leading-relaxed text-center md:text-left max-w-[220px] md:max-w-none">{FooterData?.location}</span>
                </div>
              )}
              
            </div>
          </div>

          {/* Right Section: Social & App Downloads */}
          <div className={`flex flex-col gap-5 items-center md:items-start reveal ${inView ? "visible" : ""}`}
               style={{ transitionDelay: "250ms" }}>
            
            {/* Social Media - Clean */}
            <div className="flex flex-col gap-2.5 items-center md:items-start">
              <h4 className="text-white text-sm font-semibold m-0">
                Follow Us
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                {socialLinks.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="group w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/85 cursor-pointer hover:bg-white hover:text-[#004a70] transition-all duration-300"
                  >
                    {item.icon}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* App Downloads */}
            <div className="flex flex-col gap-2.5 items-center md:items-start">
              <h4 className="text-white text-sm font-semibold m-0">
                Download Our App
              </h4>
              <p className="text-white/70 text-sm leading-relaxed max-w-[220px] md:max-w-none text-center md:text-left">
                Book rides on the go with our mobile app.
              </p>
              
              {/* App Store Buttons - Fixed max width on mobile */}
              <div className="flex flex-col sm:flex-row gap-2 pt-0.5 items-center sm:items-start">
                <Link
                  href="https://play.google.com/store/apps/details?id=com.cabkn.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center bg-black rounded-lg p-1.5 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 flex-shrink-0"
                >
                  <Image
                    src={GooglePlayblack}
                    alt="Download on Google Play"
                    height={40}
                    width={132}
                    className="h-10 w-auto max-w-[160px]"
                  />
                </Link>
                <Link
                  href="https://apps.apple.com/pk/app/cabkn/id6740235227"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center bg-black rounded-lg p-1.5 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 flex-shrink-0"
                >
                  <Image
                    src={ApplePlayBlack}
                    alt="Download on App Store"
                    height={40}
                    width={132}
                    className="h-10 w-auto max-w-[160px]"
                  />
                </Link>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar - Clean */}
      <div className="bg-brand-950/80 border-t border-white/10">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/60 text-[12px] m-0 text-center sm:text-left">
              &copy; {new Date().getFullYear()} CabKN. All rights reserved.
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/privacy" className="text-white/60 text-[12px] cursor-pointer hover:text-white transition-colors duration-300">
                Privacy Policy
              </Link>
              <span className="text-white/30 text-[12px]">·</span>
              <Link href="/terms" className="text-white/60 text-[12px] cursor-pointer hover:text-white transition-colors duration-300">
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
