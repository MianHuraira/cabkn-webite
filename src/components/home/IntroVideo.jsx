"use client"
import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { useApi } from "../ApiFunction/ApiFunction";
import { FaCheckCircle } from "react-icons/fa";

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

  const features = [
    "Premium Ride Service",
    "Certified Drivers",
    "Competitive Pricing",
    "24/7 Support",
    "Safe & Reliable",
    "Easy Booking",
  ];

  return (
    <section className="py-24 bg-slate-100">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 1400 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Video */}
          <div className={`relative rounded-3xl overflow-hidden shadow-2xl ${loaded ? "animate-fade-in" : "opacity-0"}`}>
            {isLoading ? (
              <div className="flex items-center justify-center h-96 bg-slate-200 rounded-3xl">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : hasError ? (
              <div className="flex flex-col items-center justify-center h-96 bg-slate-200 rounded-3xl text-center">
                <p className="text-slate-600 font-family-regular text-lg">Unable to load video</p>
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
          
          {/* Right: Content */}
          <div className="flex flex-col gap-8">
            
            <span className="inline-block px-4 py-2 bg-white text-brand-700 rounded-lg text-sm font-semibold w-fit shadow-md">
              Watch Our Story
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              See How We're Transforming Travel
            </h2>
            <p className="text-slate-600 text-base md:text-lg font-normal leading-relaxed">
              Discover what makes Cabkn the preferred choice for riders across Saint Kitts and Nevis.
            </p>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 mt-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <FaCheckCircle className="text-[#004A70] w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-normal text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default IntroVideo;
