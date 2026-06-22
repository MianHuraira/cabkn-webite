import MakeRIde from "@/components/MakeRIde";
import React from "react";

export const dynamic = "force-dynamic";
export const dynamicParams = true;


export async function generateMetadata() {
  try {
    return {
      title: "Make Ride",
      description:
        "Make your own tour with cabkn to enjoy the places where you wanna go",
      openGraph: {
        title: "Make Ride",
        description:
          "Make your own tour with cabkn to enjoy the places where you wanna go",
        type: "website",
        locale: "en_US",
        images: [
          {
            url: "https://storage.googleapis.com/cabkn-63397.firebasestorage.app/uploads/1745326042935.jpeg?GoogleAccessId=firebase-adminsdk-mhhwd%40cabkn-63397.iam.gserviceaccount.com&Expires=1804550400&Signature=jdM9dxZbwFI9d94GoPJ09rqwnavpr4JIsfa0UVwqvZwPuyLjR4FGMKZr4%2BriblDvXR%2BefSguESUY9jx6xcxJTh2dNqHaoSuPo7q%2FX51BBlnx6bl4Q2p3m9qHinCLHprpOuNRk5kh2r4dPQkSR9KRZTMcRlKFro28TrZIhpW27A0%2BqEJQhediUWSg1U8axHrb6m3wrawsr0bLP2ygSsl9VrlhGSgbsUd9XAAYg62PO5Ffe5A0gy43fkgqEoTa7c4UuF2w1yTxEH5zcqL0iH2YSlBHGUJ1M7EW8px%2BG2c%2FZDtbmr%2BeR54xEPzGFW3BfPKonPyR2RLkFcEWTm7IIgSa7A%3D%3D",
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
          "https://storage.googleapis.com/cabkn-63397.firebasestorage.app/uploads/1745326042935.jpeg?GoogleAccessId=firebase-adminsdk-mhhwd%40cabkn-63397.iam.gserviceaccount.com&Expires=1804550400&Signature=jdM9dxZbwFI9d94GoPJ09rqwnavpr4JIsfa0UVwqvZwPuyLjR4FGMKZr4%2BriblDvXR%2BefSguESUY9jx6xcxJTh2dNqHaoSuPo7q%2FX51BBlnx6bl4Q2p3m9qHinCLHprpOuNRk5kh2r4dPQkSR9KRZTMcRlKFro28TrZIhpW27A0%2BqEJQhediUWSg1U8axHrb6m3wrawsr0bLP2ygSsl9VrlhGSgbsUd9XAAYg62PO5Ffe5A0gy43fkgqEoTa7c4UuF2w1yTxEH5zcqL0iH2YSlBHGUJ1M7EW8px%2BG2c%2FZDtbmr%2BeR54xEPzGFW3BfPKonPyR2RLkFcEWTm7IIgSa7A%3D%3D",
        ],
      },
    };
  } catch (error) {
    console.error(
      "[generateMetadata] Error generating metadata:",
      error.message
    );
    return {
      title: "Make Ride",
      description:
        "Make your own tour with cabkn to enjoy the places where you wanna go",
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

export default function page() {
  return (
    <div className="font-poppins">
      <MakeRIde />
    </div>
  );
}
