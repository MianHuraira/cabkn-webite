import TourDetailsComponent from "@/components/TourDetailsComponent";
import React from "react";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

const frontendBaseURL = "https://cabkn.com/tourDetails";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const response = await fetch(
      `https://api.cabkn.com/api/tours/details/${id}`,
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
    const tour = resData?.tour || resData?.data?.tour;

    if (!tour?.title) {
      throw new Error("SEO tour data not found");
    }

    const imageUrl = tour?.images?.[0]
      ? new URL(tour.images[0]).href
      : "https://firebasestorage.googleapis.com/v0/b/new-jesuspod.appspot.com/o/logoBlue.png?alt=media&token=8512e03c-5b30-4e1f-b805-d5facfa150a5";

    return {
      title: tour.title,
      description: tour.about || tour.description || `Explore ${tour.title} on CabKn`,
      openGraph: {
        title: tour.title,
        description: tour.about || tour.description || `Explore ${tour.title} on CabKn`,
        type: "website",
        locale: "en_US",
        url: `${frontendBaseURL}/${id}`,
        images: imageUrl
          ? [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: tour.title,
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
        title: tour.title,
        description: tour.about || tour.description,
        images: imageUrl
          ? [imageUrl]
          : [
              "https://firebasestorage.googleapis.com/v0/b/new-jesuspod.appspot.com/o/logoBlue.png?alt=media&token=8512e03c-5b30-4e1f-b805-d5facfa150a5",
            ],
      },
    };
  } catch (error) {
    console.error("[generateMetadata] Error generating tour metadata:", error.message);
    return {
      title: "Tour Details",
      description: "Explore tour details on CabKn",
      openGraph: {
        title: "CabKn",
        description: "Explore tour details on CabKn",
        type: "website",
        locale: "en_US",
        url: "https://cabkn.com",
      },
      robots: "noindex, nofollow",
    };
  }
}

export default function Page() {
  return <TourDetailsComponent />;
}
