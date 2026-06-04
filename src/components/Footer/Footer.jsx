"use client";

import React, { useEffect, useState } from "react";
import { BsFillTelephoneFill } from "react-icons/bs";
import { FiMapPin, FiArrowRight } from "react-icons/fi";
import { AiOutlineMail } from "react-icons/ai";
import { FaTwitter, FaFacebookF, FaLinkedin, FaYoutube } from "react-icons/fa";
import { useSelector } from "react-redux";
import ApiFunction from "../ApiFunction/ApiFunction";
import { ApplePlayBlack, GooglePlayblack } from "../assets/Images";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Footer() {
  const userData = useSelector((state) => state.auth.user?.user);
  const { header1, getData } = ApiFunction();
  const [FooterData, setFooterData] = useState([]);

  const router = useRouter();

  const getProfile = async () => {
    try {
      const response = await getData("users/footer", header1);
      setFooterData(response?.footer);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const socialLinks = [
    { icon: <FaTwitter size={18} />, key: "twitter" },
    { icon: <FaFacebookF size={18} />, key: "facebook" },
    { icon: <FaLinkedin size={18} />, key: "linkedin" },
    { icon: <FaYoutube size={18} />, key: "youtube" },
  ];

  return (
    <footer className="bg-[#004a70]">
      {/* Top Wave Divider */}


      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pt-5">
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <h3 className="text-white text-[28px] sm:text-[32px] font-bold m-0 tracking-tight">
              CabKN
            </h3>
            <p className="text-white/75 text-[15px] sm:text-base leading-relaxed m-0 max-w-[360px]">
              {FooterData?.short_title}
            </p>
            <button
              onClick={() => router.push(userData ? "/ride" : "/auth/login")}
              className="inline-flex items-center gap-2.5 w-fit px-6 py-3 rounded-xl bg-white text-[#004a70] font-semibold text-sm border-none cursor-pointer shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
            >
              Request a driver
              <FiArrowRight size={15} />
            </button>
          </div>

          {/* Contacts Column */}
          <div className="lg:col-span-4">
            <h4 className="text-white text-lg font-bold m-0 mb-5 relative inline-block pb-2.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:rounded-full after:bg-white/50">
              Contacts
            </h4>
            <div className="flex flex-col gap-4">
              {FooterData?.phone && (
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5 backdrop-blur-sm">
                    <BsFillTelephoneFill size={15} className="text-white/90" />
                  </div>
                  <div>
                    <p className="text-white/90 text-sm font-medium m-0">
                      {FooterData?.phone}
                    </p>
                    {FooterData?.tel && (
                      <p className="text-white/60 text-[13px] m-0 mt-0.5">
                        {FooterData?.tel}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {FooterData?.emails && (
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5 backdrop-blur-sm">
                    <AiOutlineMail size={16} className="text-white/90" />
                  </div>
                  <div>
                    <p className="text-white/90 text-sm font-medium m-0">
                      {FooterData?.emails}
                    </p>
                  </div>
                </div>
              )}

              {FooterData?.location && (
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5 backdrop-blur-sm">
                    <FiMapPin size={16} className="text-white/90" />
                  </div>
                  <div>
                    <p className="text-white/90 text-sm font-medium m-0">
                      {FooterData?.location}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social & Apps Column */}
          <div className="lg:col-span-4">
            <h4 className="text-white text-lg font-bold m-0 mb-5 relative inline-block pb-2.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:rounded-full after:bg-white/50">
              Follow Us
            </h4>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              {socialLinks.map((item, idx) => (
                <div
                  key={idx}
                  className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white/80 backdrop-blur-sm cursor-pointer hover:bg-white hover:text-[#004a70] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {item.icon}
                </div>
              ))}
            </div>

            {/* App Store Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div
                onClick={() =>
                  window.open(
                    "https://play.google.com/store/apps/details?id=com.cabkn.app",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
                className="cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 active:scale-[0.98]"
              >
                <Image
                  src={GooglePlayblack}
                  alt="Google Play"
                  height={48}
                  style={{ objectFit: "contain", height: 48, width: 160 }}
                />
              </div>
              <div
                onClick={() =>
                  window.open(
                    "https://apps.apple.com/pk/app/cabkn/id6740235227",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
                className="cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 active:scale-[0.98]"
              >
                <Image
                  src={ApplePlayBlack}
                  alt="App Store"
                  height={48}
                  style={{ objectFit: "contain", height: 48, width: 160 }}
                />
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-5 mt-6 pt-5">
              <Link href="/privacy" className="text-white/60 text-[13px] cursor-pointer hover:text-white transition-colors">
                Privacy
              </Link>
              <span className="text-white/30 text-[13px]">|</span>
              <Link href="/terms" className="text-white/60 text-[13px] cursor-pointer hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#003d5e]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-white/50 text-[13px] text-center m-0">
            &copy; {new Date().getFullYear()} CabKN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
