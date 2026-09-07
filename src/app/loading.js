"use client";

import React from "react";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-50/40 px-4">
      {/* Brand Spinner with Center Logo */}
      <div className="relative flex items-center justify-center w-24 h-24">
        <div className="absolute inset-0 rounded-full !border-2 !border-brand-100 !border-t-brand-600 animate-spin" />
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center !border !border-slate-100 shadow-sm overflow-hidden p-2">
          <Image
            src="/logoBlue.png"
            alt="Welcome to Saint Kitts"
            width={64}
            height={64}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      </div>

      <p className="mt-6 text-sm sm:text-[15px] font-family-semibold text-slate-800 animate-fade-in">
        Welcome to Saint Kitts
      </p>
      <p className="mt-1.5 text-xs sm:text-[13px] font-family-regular text-slate-500 animate-fade-in">
        Loading your journey...
      </p>
    </div>
  );
}
