import MakeRIde from "@/components/MakeRIde";
import React from "react";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata() {
  return {
    title: "Send a Parcel | CabKN",
    description:
      "Send packages, boxes, and documents quickly and reliably across Saint Kitts and Nevis with CabKN courier delivery services.",
    openGraph: {
      title: "Send a Parcel | CabKN",
      description:
        "Fast, reliable island-wide package delivery in Saint Kitts and Nevis.",
      type: "website",
      locale: "en_US",
      siteName: "CabKN",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function SendParcelPage() {
  return (
    <div className="font-poppins">
      <MakeRIde defaultTab="parcel" />
    </div>
  );
}
