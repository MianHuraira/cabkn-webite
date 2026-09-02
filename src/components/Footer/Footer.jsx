"use client";

import React, { useEffect, useState, useRef } from "react";
import { BsFillTelephoneFill, BsTwitterX } from "react-icons/bs";
import { FiMapPin, FiArrowRight } from "react-icons/fi";
import { AiOutlineMail } from "react-icons/ai";
import { FaFacebookF, FaLinkedinIn, FaYoutube, FaApple, FaGooglePlay } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useApi } from "../ApiFunction/ApiFunction";
import { whiteLogo } from "../assets/Images";
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
      { threshold: 0.05 }
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
      className="bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 font-family-regular border-t border-white/[0.04]"
    >
      <div
        className="mx-auto px-5 sm:px-6 lg:px-8 pt-10 sm:pt-12 lg:pt-14 pb-8 sm:pb-10"
        style={{ maxWidth: 1200 }}
      >
        {/* Main Grid: Clean & Structured on both Mobile and Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          {/* Section 1: Brand & CTA */}
          <div
            className={`flex flex-col items-start gap-4 reveal ${inView ? "visible" : ""}`}
            style={{ transitionDelay: "50ms" }}
          >
            {/* Logo */}
            <Link
              href="/"
              className="inline-flex items-center focus:outline-none"
            >
              <Image
                src={whiteLogo}
                alt="Welcome to Saint Kitts"
                height={44}
                width={85}
                className="h-11 w-auto object-contain"
              />
            </Link>

            {/* Description */}
            <p className="text-white/75 text-sm leading-relaxed max-w-sm m-0 font-family-regular">
              If you're stuck deciding between booking a taxi or renting a car,
              Welcome to Saint Kitts is the perfect solution.
            </p>

            {/* CTA Button */}
            <button
              onClick={() => router.push(userData ? "/ride" : "/auth/login")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/[0.08] hover:bg-white/[0.16] text-white rounded-xl transition-all duration-300 font-family-semibold text-sm cursor-pointer mt-1"
            >
              <span>Request a driver</span>
              <FiArrowRight size={14} />
            </button>
          </div>

          {/* Section 2: Contact Information */}
          <div
            className={`flex flex-col items-start gap-4 reveal ${inView ? "visible" : ""}`}
            style={{ transitionDelay: "150ms" }}
          >
            <h4 className="text-white text-sm font-family-bold uppercase tracking-wider m-0">
              Contact Us
            </h4>

            <div className="flex flex-col gap-3.5 w-full">
              {/* Phone */}
              {FooterData?.phone && (
                <Link
                  href={`tel:${FooterData?.phone}`}
                  className="group flex items-center gap-3 text-white/85 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 group-hover:bg-white/[0.12] transition-colors">
                    <BsFillTelephoneFill size={12} className="text-white/90" />
                  </div>
                  <span className="text-sm font-family-medium">
                    {FooterData?.phone}
                  </span>
                </Link>
              )}

              {/* Email */}
              {FooterData?.emails && (
                <Link
                  href={`mailto:${FooterData?.emails}`}
                  className="group flex items-center gap-3 text-white/85 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 group-hover:bg-white/[0.12] transition-colors">
                    <AiOutlineMail size={14} className="text-white/90" />
                  </div>
                  <span className="text-sm font-family-medium">
                    {FooterData?.emails}
                  </span>
                </Link>
              )}

              {/* Location */}
              {FooterData?.location && (
                <div className="flex items-start gap-3 text-white/85">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                    <FiMapPin size={14} className="text-white/90" />
                  </div>
                  <span className="text-sm leading-snug font-family-regular">
                    {FooterData?.location}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Social Media & App Downloads */}
          <div
            className={`flex flex-col items-start gap-5 sm:col-span-2 lg:col-span-1 reveal ${inView ? "visible" : ""}`}
            style={{ transitionDelay: "250ms" }}
          >
            {/* Social Links */}
            <div className="flex flex-col items-start gap-2.5 w-full">
              <h4 className="text-white text-sm font-family-bold uppercase tracking-wider m-0">
                Follow Us
              </h4>
              <div className="flex items-center gap-2.5 flex-wrap">
                {socialLinks.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.16] hover:text-white flex items-center justify-center text-white/90 transition-all duration-300"
                  >
                    {item.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* App Downloads */}
            <div className="flex flex-col items-start gap-2.5 w-full">
              <h4 className="text-white text-sm font-family-bold uppercase tracking-wider m-0">
                Download Our App
              </h4>
              <p className="text-white/65 text-xs leading-relaxed max-w-sm m-0 font-family-regular">
                Book rides on the go with our mobile app.
              </p>

              {/* Seamless Borderless App Badges */}
              <div className="flex flex-row items-center gap-3 pt-1 flex-wrap">
                <Link
                  href="https://play.google.com/store/apps/details?id=com.cabkn.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3.5 py-2 bg-white/[0.07] hover:bg-white/[0.14] text-white rounded-xl backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer"
                >
                  <FaGooglePlay size={17} className="text-white/90 shrink-0 group-hover:scale-105 transition-transform" />
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[9px] uppercase tracking-wider text-white/60 font-family-medium">GET IT ON</span>
                    <span className="text-xs font-family-bold text-white mt-1">Google Play</span>
                  </div>
                </Link>

                <Link
                  href="https://apps.apple.com/pk/app/cabkn/id6740235227"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3.5 py-2 bg-white/[0.07] hover:bg-white/[0.14] text-white rounded-xl backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer"
                >
                  <FaApple size={20} className="text-white/90 shrink-0 group-hover:scale-105 transition-transform -mt-0.5" />
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[9px] uppercase tracking-wider text-white/60 font-family-medium">Download on</span>
                    <span className="text-xs font-family-bold text-white mt-1">App Store</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-brand-950/95 border-t border-white/[0.04]">
        <div
          className="mx-auto px-5 sm:px-6 lg:px-8 py-4"
          style={{ maxWidth: 1200 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-gray-400 text-xs m-0 font-family-regular">
              &copy; {new Date().getFullYear()} Welcome to Saint Kitts. All rights reserved.
            </p>
            <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors duration-200 font-family-regular"
              >
                Privacy Policy
              </Link>
              <span className="text-white/10">·</span>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors duration-200 font-family-regular"
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
