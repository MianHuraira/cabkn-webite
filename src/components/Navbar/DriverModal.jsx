"use client";

import React from "react";
import { Modal } from "react-bootstrap";
import { HiX } from "react-icons/hi";
import { FaGooglePlay, FaApple } from "react-icons/fa";

const DriverModal = ({ show, onHide }) => {
  const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.cabkndriver.app&hl=en";
  const APP_STORE_URL = "https://apps.apple.com/pk/app/cabkn-driver/id6740235396";

  return (
    <Modal
      centered
      show={show}
      onHide={onHide}
      dialogClassName="!max-w-[450px] font-poppins !m-auto !p-4 sm:!p-0"
      contentClassName="!bg-transparent !border-none !shadow-none"
    >
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,74,112,0.18)] !border !border-slate-100 text-center animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onHide}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer !border-none"
        >
          <HiX size={16} />
        </button>

        {/* Brand Vehicle Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-[#004a70]/10 !border !border-[#004a70]/20 text-[#004a70] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-[22px] font-family-semibold text-slate-900 !m-0 tracking-tight">
          Download Driver App
        </h3>

        {/* Subtitle with extra bottom spacing */}
        <p className="text-[13.5px] text-slate-500 font-family-regular !m-0 mt-2 !mb-7 max-w-[350px] mx-auto leading-relaxed">
          Available on iOS & Android. Download now to start taking rides and earning on your schedule.
        </p>

        {/* Download Buttons in a Single Row */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.open(PLAY_STORE_URL, "_blank")}
            className="flex items-center justify-center gap-2.5 py-3 px-3 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md cursor-pointer !border-none group"
          >
            <FaGooglePlay size={17} className="text-white shrink-0 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[9px] uppercase tracking-wider text-white/75 font-family-medium">GET IT ON</span>
              <span className="text-[12.5px] sm:text-[13px] font-family-semibold text-white mt-0.5 whitespace-nowrap">Google Play</span>
            </div>
          </button>

          <button
            onClick={() => window.open(APP_STORE_URL, "_blank")}
            className="flex items-center justify-center gap-2.5 py-3 px-3 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md cursor-pointer !border-none group"
          >
            <FaApple size={20} className="text-white shrink-0 group-hover:scale-105 transition-transform -mt-0.5" />
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[9px] uppercase tracking-wider text-white/75 font-family-medium">DOWNLOAD ON</span>
              <span className="text-[12.5px] sm:text-[13px] font-family-semibold text-white mt-0.5 whitespace-nowrap">App Store</span>
            </div>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DriverModal;
