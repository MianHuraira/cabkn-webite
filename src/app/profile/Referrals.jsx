import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import Image from "next/image";
import { ApplePlayBlack as AppStore, GooglePlayblack as GooglePlay } from "@/components/assets/Images";
import {
  FaTwitter,
  FaFacebook,
  FaRedditAlien,
  FaDiscord,
  FaWhatsapp,
  FaFacebookMessenger,
  FaTelegram,
  FaWeixin,
  FaClone,
} from "react-icons/fa";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import CustomButton from "@/components/CustomButton";

export default function Referrals() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { userData } = ApiFunction()
  const customStyle = {
    root: {
      background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
      borderRadius: 3,
      border: 0,
      boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
      color: "white",
    },
    copyContainer: {
      border: "1px solid blue",
      background: "rgb(0,0,0,0.7)",
    },
    title: {
      color: "aquamarine",
      fontStyle: "italic",
    },
  };
  const shareUrl = "https://cabkn.com/";
  const shareText = `Check out these amazing discounts on Cabkn! Use my referral code: ${userData?.user?.referral_code} to sign up and save.`;

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const copyToClipboard = () => {
    const copyText = document.getElementById("myInput");
    navigator.clipboard.writeText(copyText.value);
    alert("Copied to clipboard!");
    handleClose();
  };

  const openShareLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={mounted ? 'animate-fade-in-up' : 'opacity-0'}>
      <h2 className="font-semibold text-lg text-gray-900 mb-4">Referrals</h2>
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-100 p-4 rounded-xl shadow-sm mt-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center flex-shrink-0">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#004a70" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-0">Referral Code</h3>
            <p className="text-sm font-bold text-brand-600 mb-0">{userData?.user?.referral_code || "—"}</p>
          </div>
        </div>
        <CustomButton onClick={handleShow} style={{ padding: "8px 20px" }}>
          Invite
        </CustomButton>
      </div>

      {/* Share Modal */}
      <Modal show={show} onHide={handleClose} centered className="!mx-2 sm:!mx-0">
        <div className="overflow-hidden rounded-md">
          {/* Modal Header - brand gradient */}
          <div className="bg-gradient-to-br from-brand-800 to-brand-950 px-6 pt-6 pb-8 text-center relative">
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border-none cursor-pointer transition-colors"
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Share & Earn</h3>
            <p className="text-white/70 text-sm">Invite friends with your referral code</p>
          </div>

          {/* Modal Body */}
          <div className="bg-white px-6 pt-5 pb-6">
            {/* Referral code copy bar */}
            <div className="flex items-center gap-2 mb-5 p-3 bg-slate-50 rounded-xl">
              <input
                id="myInput"
                type="text"
                className="flex-grow bg-transparent border-none outline-none text-sm font-medium text-gray-700 min-w-0"
                value={shareText}
                readOnly
              />
              <button
                onClick={copyToClipboard}
                className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-brand-700 transition-colors border-none cursor-pointer"
              >
                <FaClone color="#fff" size={13} />
              </button>
            </div>

            {/* Social share grid */}
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Share via</p>
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { icon: <FaWhatsapp size={20} color="#25D366" />, label: "WhatsApp", onClick: () => openShareLink(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`) },
                { icon: <FaTelegram size={20} color="#229ED9" />, label: "Telegram", onClick: () => openShareLink(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`) },
                { icon: <FaFacebook size={20} color="#1877F2" />, label: "Facebook", onClick: () => openShareLink(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`) },
                { icon: <FaTwitter size={20} color="#1DA1F2" />, label: "Twitter", onClick: () => openShareLink(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`) },
              ].map((item, i) => (
                <div key={i} onClick={item.onClick} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                  <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-xs text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>

            {/* App download buttons - side by side */}
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Get the App</p>
            <div className="flex flex-row gap-3">
              <div
                onClick={() => openShareLink("https://play.google.com/store/apps/details?id=com.cabkn.app")}
                className="cursor-pointer hover:scale-[1.02] transition-transform flex-1"
              >
                <Image
                  src={GooglePlay}
                  style={{ objectFit: "contain", height: 48, width: "100%", mixBlendMode: "multiply" }}
                  alt="Google Play"
                />
              </div>
              <div
                onClick={() => openShareLink("https://apps.apple.com/pk/app/cabkn/id6740235227")}
                className="cursor-pointer hover:scale-[1.02] transition-transform flex-1"
              >
                <Image
                  src={AppStore}
                  style={{ objectFit: "contain", height: 48, width: "100%", mixBlendMode: "multiply" }}
                  alt="App Store"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
