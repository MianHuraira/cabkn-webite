
"use client"
import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { useApi } from "../ApiFunction/ApiFunction";

function IntroVideo() {
  const { header1, getData } = useApi();
  const [FooterData, setFooterData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const getProfile = async () => {
    try {
      setHasError(false);
      const response = await getData("users/footer", header1);
      setFooterData(response?.footer);
    } catch (error) {
      console.error("Failed to load footer data:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 1200 }}>
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-brand-100 text-brand-700 rounded-full text-sm font-['Inter-SemiBold'] mb-4">
            Watch Our Story
          </span>
          <h2 className="text-3xl md:text-4xl font-['Inter-Bold'] text-slate-900 mb-4">
            See How We're Transforming Travel
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto font-['Inter-Regular']">
            Discover what makes Cabkn the preferred choice for riders across Saint Kitts and Nevis.
          </p>
        </div>
        
        <div
          className={`video-container relative rounded-3xl overflow-hidden shadow-2xl ${loaded ? "animate-fade-in" : "opacity-0"}`}
          style={{ minHeight: "300px" }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-96 bg-slate-50">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center justify-center h-96 bg-slate-50 text-center">
              <p className="text-slate-600 font-['Inter-Regular']">Unable to load video</p>
            </div>
          ) : (
            FooterData?.videourl && (
              <video 
                width="100%" 
                height="auto" 
                controls 
                className="w-full h-auto"
                onLoadedData={() => setLoaded(true)}
              >
                <source src={FooterData?.videourl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )
          )}
        </div>
      </div>
    </section>
  );
}

export default IntroVideo;
