import ServiceDetailsComponent from "@/components/ServiceDetailsComponent";
import React from "react";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

const frontendBaseURL = "https://cabkn.com/serviceDetails";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const response = await fetch(
      `https://api.welcometosaintkitts.com/api/top-services/details/${id}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    const resData = await response.json();
    const service = resData?.service || resData?.data?.service;

    if (!service?.title) {
      throw new Error("SEO service data not found");
    }

    const imageUrl = service?.images?.[0]
      ? new URL(service.images[0]).href
      : "https://firebasestorage.googleapis.com/v0/b/new-jesuspod.appspot.com/o/logoBlue.png?alt=media&token=8512e03c-5b30-4e1f-b805-d5facfa150a5";

    return {
      title: `${service.title} | CabKn Services`,
      description: service.about || `Book ${service.title} with CabKn`,
      openGraph: {
        title: service.title,
        description: service.about || `Book ${service.title} with CabKn`,
        type: "website",
        locale: "en_US",
        url: `${frontendBaseURL}/${id}`,
        images: imageUrl
          ? [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: service.title,
              },
            ]
          : [],
        siteName: "CabKn",
      },
      robots: {
        index: true,
        follow: true,
      },
      twitter: {
        card: "summary_large_image",
        title: service.title,
        description: service.about,
        images: imageUrl
          ? [imageUrl]
          : [
              "https://firebasestorage.googleapis.com/v0/b/new-jesuspod.appspot.com/o/logoBlue.png?alt=media&token=8512e03c-5b30-4e1f-b805-d5facfa150a5",
            ],
      },
    };
  } catch (error) {
    return {
      title: "Service Details | CabKn",
      description: "Explore on-location and wellness service details on CabKn",
      openGraph: {
        title: "CabKn Services",
        description: "Explore on-location and wellness service details on CabKn",
        type: "website",
        locale: "en_US",
        url: "https://cabkn.com",
      },
      robots: "noindex, nofollow",
    };
  }
}

export default function Page() {
  return <ServiceDetailsComponent />;
}
