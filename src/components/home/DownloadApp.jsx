import React, { useEffect, useState, useRef } from "react";
import { Col, Row } from "reactstrap";
import { mobiledown } from "../assets/Images";
import Image from "next/image";
import { TiVendorApple } from "react-icons/ti";
import { FaGooglePlay } from "react-icons/fa";
import { BsCheck2Square } from "react-icons/bs";

export default function DownloadApp() {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 lg:py-20 overflow-hidden bg-slate-50"
      style={{
        background: "linear-gradient(135deg, rgba(0, 74, 112, 0.05) 0%, rgba(0, 45, 69, 0.03) 50%, rgba(248, 250, 252, 0.95) 100%)",
      }}
    >
      <Row
        className="mx-auto align-items-center g-0 px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 1200 }}
      >
        <Col lg={6} className="text-center py-6 sm:py-8 lg:py-10 order-1 lg:order-1">
          <div className="relative inline-block w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[380px] mx-auto">
            <Image
              src={mobiledown}
              className="animate-[float-car_6s_ease-in-out_infinite]"
              style={{
                objectFit: "contain",
                width: "100%",
                height: "auto",
                filter: "drop-shadow(0 25px 50px rgba(0,74,112,0.15))",
              }}
              alt="Download App Image"
            />
          </div>
        </Col>
        <Col lg={6} className="p-4 sm:p-6 lg:p-8 order-2 lg:order-2">
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5">
            <span
              className={`inline-block px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-md text-xs font-family-semibold w-fit reveal ${inView ? "visible" : ""}`}
              style={{ transitionDelay: "100ms" }}
            >
              Get the App
            </span>
            <h1
              className={`text-2xl sm:text-3xl lg:text-4xl text-slate-900 leading-tight font-family-extrabold reveal ${inView ? "visible" : ""}`}
              style={{ transitionDelay: "200ms" }}
            >
              Unlock seamless experiences with our <span className="text-brand-600">Mobile App</span>
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="flex items-start gap-2.5">
                <BsCheck2Square className="text-brand-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-600 font-family-regular leading-relaxed">
                  Download the Cabkn app for seamless, reliable transportation between Nevis and Saint Kitts.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <BsCheck2Square className="text-brand-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-600 font-family-regular leading-relaxed">
                  Book rides in seconds, track your driver in real-time, and enjoy a premium travel experience.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 w-full sm:w-auto">
              <button
                onClick={() =>
                  window.open(
                    "https://play.google.com/store/apps/details?id=com.cabkn.app",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer font-family-regular w-full sm:w-auto"
              >
                <FaGooglePlay size={24} />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-brand-100">GET IT ON</span>
                  <span className="text-sm font-bold">Google Play</span>
                </div>
              </button>
              <button
                onClick={() =>
                  window.open(
                    "https://apps.apple.com/pk/app/cabkn/id6740235227",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer font-family-regular w-full sm:w-auto"
              >
                <TiVendorApple size={32} />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-brand-100">Download on the</span>
                  <span className="text-sm font-bold">App Store</span>
                </div>
              </button>
            </div>
          </div>
        </Col>
      </Row>
    </section>
  );
}
