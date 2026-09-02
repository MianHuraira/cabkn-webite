"use client";

import React, { Suspense } from "react";
import ServiceDetailsComponent from "@/components/ServiceDetailsComponent";

export default function ServiceDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#004a70]" />
        </div>
      }
    >
      <ServiceDetailsComponent />
    </Suspense>
  );
}
