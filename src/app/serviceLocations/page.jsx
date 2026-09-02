import React from "react";

import ServiceComponent from "@/components/home/ServiceComponent";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

const frontendBaseURL = "https://cabkn.com/popular";

export async function generateMetadata() {
  try {
    return {
      title: "Services & Tours",
      openGraph: {
        title: "Services & Tours",
        type: "website",
        locale: "en_US",
        images: [
          {
            url: "https://storage.googleapis.com/cabkn-63397.firebasestorage.app/uploads/1745326321294.jpeg?GoogleAccessId=firebase-adminsdk-mhhwd%40cabkn-63397.iam.gserviceaccount.com&Expires=1804550400&Signature=LL%2Bs34iniDd3jbzL%2By3iFmbnzpdJW%2F6cB5eP00v9y2NN2%2F5zNRZx7iOIXzm1zdlu18X0m3TD9R4a2oTTZ0EvACRPWP%2BIbNIJCcKwUUlfu2Sl1LuDVZeH%2FO10hdO8d0AZq5xSLxj%2FV2Llq%2FFUhV4bUg9PLqNR%2B9Ijb36gtH74e55TAf0Z3jjsbT1079z%2By5YgXhcssg6pzZxxlMxQQM8NAKh67%2BWlUWcU8ftzOCVVLC2EnCL08Xjl6dDONzeA6wrPhCD8kYFImSQZQ7H6vpFR6oqw6l3aEWSIhpzf%2F%2FafxcZ1s9CRqzpm%2FATzgIq4SEd8HSYMdGDJuRFdMd8pgjpkEw%3D%3D",
            width: 1200,
            height: 630,
            alt: "Welcome to Saint Kitts",
          },
        ],
        siteName: "Welcome to Saint Kitts",
      },
      robots: {
        index: true,
        follow: true,
      },
      twitter: {
        card: "summary_large_image",
        title: "Welcome to Saint Kitts",
        description: "Book your rides and explore tours in Saint Kitts and Nevis today",
        images: [
          "https://storage.googleapis.com/cabkn-63397.firebasestorage.app/uploads/1745326321294.jpeg?GoogleAccessId=firebase-adminsdk-mhhwd%40cabkn-63397.iam.gserviceaccount.com&Expires=1804550400&Signature=LL%2Bs34iniDd3jbzL%2By3iFmbnzpdJW%2F6cB5eP00v9y2NN2%2F5zNRZx7iOIXzm1zdlu18X0m3TD9R4a2oTTZ0EvACRPWP%2BIbNIJCcKwUUlfu2Sl1LuDVZeH%2FO10hdO8d0AZq5xSLxj%2FV2Llq%2FFUhV4bUg9PLqNR%2B9Ijb36gtH74e55TAf0Z3jjsbT1079z%2By5YgXhcssg6pzZxxlMxQQM8NAKh67%2BWlUWcU8ftzOCVVLC2EnCL08Xjl6dDONzeA6wrPhCD8kYFImSQZQ7H6vpFR6oqw6l3aEWSIhpzf%2F%2FafxcZ1s9CRqzpm%2FATzgIq4SEd8HSYMdGDJuRFdMd8pgjpkEw%3D%3D",
        ],
      },
    };
  } catch (error) {
    console.error(
      "[generateMetadata] Error generating metadata:",
      error.message
    );
    return {
      title: "Services & Tours",
      openGraph: {
        title: "Make Your Own Tour",
        description:
          "Make your own tour with Welcome to Saint Kitts to enjoy the places where you wanna go",
        type: "website",
        locale: "en_US",
        url: "https://cabkn.com",
        images: [
          {
            url: "https://storage.googleapis.com/cabkn-63397.firebasestorage.app/uploads/1745305193450.jpeg?GoogleAccessId=firebase-adminsdk-mhhwd%40cabkn-63397.iam.gserviceaccount.com&Expires=1804550400&Signature=X8USXYg9rSdS9rNqI%2FCyWF0N%2BRLpofCUPzCBsldjRM3iOWfkQ9kWfBiu1AKtSdTEA69j3yS%2BQOuFbC6sagtcf6aPV4FlmIOBBRPHLtFaoPh2Fna%2BNuPaoebdlxR%2BlDIq5lUZUgXdyaVEMOA%2FlAl1A58MzSHa1shcXUKZ%2BXZsI%2FoCUFii0T%2BFQmH2hT%2FE3l93OKrMciQFUazd1xpW8VBdxLEiKQxcd7wCOrZQVQKpxJAzp8dUgTT%2Fvj%2FsvRv7Yqvx6I46PnZjeFxceZVFco98%2FjT7rIE8Y7BuAJk7lTtw%2BDLXRK7TSvkn1w%2Fs5lDwULDsyFFVeLBDtYA0vTzO0Ua3Bw%3D%3D",
            width: 1200,
            height: 630,
            alt: "Welcome to Saint Kitts",
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
    <div className="font-poppins" id="whyUs">
      <ServiceComponent />
    </div>
    </>
  );
};

// wefwef÷

export default page;
