import React from "react";

import ServiceComponent from "@/components/home/ServiceComponent";
import CouponPage from "@/components/CouponPage";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

const frontendBaseURL = "https://cabkn.com/popular";

export async function generateMetadata() {
  try {
    return {
      title: "Special Coupon from Cabkn",
      openGraph: {
        title: "Special Coupon from Cabkn",
        type: "website",
        locale: "en_US",
        images: [
          {
            url: "https://storage.googleapis.com/cabkn-63397.firebasestorage.app/uploads/1745326618907.jpeg?GoogleAccessId=firebase-adminsdk-mhhwd%40cabkn-63397.iam.gserviceaccount.com&Expires=1804550400&Signature=gSSeH3DyI99%2FxMZaPE8%2Fd6KrAoqTBEHUTJcQE%2FmqXEs7j7UqPx2hI5HtRotiYypBlDIzMRrEkDRxLK60ImmbUXPLg0EB1g9m7o9HOFuJy%2BLXT7SAIr2Uy5vSDpK51tydyXxBgvua6ancVP3E40GGkpQvFxblzdZd2bKXjhpxyQkMzc4zBtOPwiTizjlp62Jr%2FVjw0jCrGsgWwq6wdwE4iQ50SUUeeG8EqxdrHZ1GpQAkzGzsYa5N3eiUwM5Is%2FoXFbLe0rtIjw8FAG95wET%2BQtKlCXzYjy65Yvl07SwulZtKrL4KNH2928DPvJp2LMynfPCJrvQBo2Y%2BCwaoKDp8Qw%3D%3D",
            width: 1200,
            height: 630,
            alt: "CabKn",
          },
        ],
        siteName: "CabKn",
      },
      robots: {
        index: true,
        follow: true,
      },
      twitter: {
        card: "summary_large_image",
        title: "CabKn",
        description: "Book your rides in St. Kitts and Nevis today",
        images: [
          "https://storage.googleapis.com/cabkn-63397.firebasestorage.app/uploads/1745326618907.jpeg?GoogleAccessId=firebase-adminsdk-mhhwd%40cabkn-63397.iam.gserviceaccount.com&Expires=1804550400&Signature=gSSeH3DyI99%2FxMZaPE8%2Fd6KrAoqTBEHUTJcQE%2FmqXEs7j7UqPx2hI5HtRotiYypBlDIzMRrEkDRxLK60ImmbUXPLg0EB1g9m7o9HOFuJy%2BLXT7SAIr2Uy5vSDpK51tydyXxBgvua6ancVP3E40GGkpQvFxblzdZd2bKXjhpxyQkMzc4zBtOPwiTizjlp62Jr%2FVjw0jCrGsgWwq6wdwE4iQ50SUUeeG8EqxdrHZ1GpQAkzGzsYa5N3eiUwM5Is%2FoXFbLe0rtIjw8FAG95wET%2BQtKlCXzYjy65Yvl07SwulZtKrL4KNH2928DPvJp2LMynfPCJrvQBo2Y%2BCwaoKDp8Qw%3D%3D",
        ],
      },
    };
  } catch (error) {
    console.error(
      "[generateMetadata] Error generating metadata:",
      error.message
    );
    return {
      title: "Special Coupon from Cabkn",
      openGraph: {
        title: "Make Your Own Tour",
        description:
          "Make your own tour with cabkn to enjoy the places where you wanna go",
        type: "website",
        locale: "en_US",
        url: "https://cabkn.com",
        images: [
          {
            url: "https://storage.googleapis.com/cabkn-63397.firebasestorage.app/uploads/1745305193450.jpeg?GoogleAccessId=firebase-adminsdk-mhhwd%40cabkn-63397.iam.gserviceaccount.com&Expires=1804550400&Signature=X8USXYg9rSdS9rNqI%2FCyWF0N%2BRLpofCUPzCBsldjRM3iOWfkQ9kWfBiu1AKtSdTEA69j3yS%2BQOuFbC6sagtcf6aPV4FlmIOBBRPHLtFaoPh2Fna%2BNuPaoebdlxR%2BlDIq5lUZUgXdyaVEMOA%2FlAl1A58MzSHa1shcXUKZ%2BXZsI%2FoCUFii0T%2BFQmH2hT%2FE3l93OKrMciQFUazd1xpW8VBdxLEiKQxcd7wCOrZQVQKpxJAzp8dUgTT%2Fvj%2FsvRv7Yqvx6I46PnZjeFxceZVFco98%2FjT7rIE8Y7BuAJk7lTtw%2BDLXRK7TSvkn1w%2Fs5lDwULDsyFFVeLBDtYA0vTzO0Ua3Bw%3D%3D",
            width: 1200,
            height: 630,
            alt: "CabKn",
          },
        ],
      },
      robots: "noindex, nofollow",
    };
  }
}

const page = () => {
  return (
    <>
      <div id="whyUs">
        <CouponPage />
      </div>
    </>
  );
};

// wefwef÷

export default page;
