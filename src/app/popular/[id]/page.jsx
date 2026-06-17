import PopularPlaces from "@/components/popularPlaces";
import React from "react";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
// clinet side url

const frontendBaseURL = "https://cabkn.com/popular";

export async function generateMetadata({ params }) {

  const { id } = params;

  try {
    const response = await fetch(
      `https://api.cabkn.com/api/websubcat/details/${id}`,
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
    const { success, category } = await response.json();

    if (!success || !category?.title) {
      throw new Error("SEO data not found");
    }

    const imageUrl = category?.images?.[0]
      ? new URL(category.images[0]).href
      : "https://firebasestorage.googleapis.com/v0/b/new-jesuspod.appspot.com/o/logoBlue.png?alt=media&token=8512e03c-5b30-4e1f-b805-d5facfa150a5";

    // Enhanced metadata for better social media compatibility
    return {
      title: category.title,
      description: category.about || `Explore ${category.title}`,
      openGraph: {
        title: category.title,
        description: category.about || `Explore ${category.title}`,
        type: "website",
        locale: "en_US",
        url: `${frontendBaseURL}/${id}`, // Using frontendBaseURL properly
        images: imageUrl
          ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: category.title,
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
        title: category.title,
        description: category.about,
        images: imageUrl
          ? [imageUrl]
          : [
            "https://firebasestorage.googleapis.com/v0/b/new-jesuspod.appspot.com/o/logoBlue.png?alt=media&token=8512e03c-5b30-4e1f-b805-d5facfa150a5",
          ],
      },
    };
  } catch (error) {
    console.error(
      "[generateMetadata] Error generating metadata:",
      error.message
    );
    return {
      title: "Error Title",
      description: "Error fetching data.",
      openGraph: {
        title: "Cabkn",
        description: "Error fetching data.",
        type: "website",
        locale: "en_US",
        url: "https://cabkn.com", // Replace with your actual domain
      },
      robots: "noindex, nofollow",
    };
  }
}

export default function Page() {
  return (
    <div>
      <PopularPlaces />
    </div>
  );
}
