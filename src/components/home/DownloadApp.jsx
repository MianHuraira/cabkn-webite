import React, { useEffect, useState, useRef } from "react";
import { Col, Row } from "reactstrap";
import { mobiledown } from "../assets/Images";
import Image from "next/image";
import { TiVendorApple } from "react-icons/ti";
import { FaGooglePlay } from "react-icons/fa";

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
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-brand-50 via-white to-brand-50"
    >
      <Row
        className="mx-auto align-items-center g-0 px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 1200 }}
      >
        <Col lg={6} className="p-4 sm:p-6 lg:p-12">
          <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
            <span
              className={`inline-block px-3 sm:px-4 py-1.5 bg-brand-100 text-brand-700 rounded-full text-xs sm:text-sm font-family-semibold w-fit tracking-wider uppercase reveal ${inView ? "visible" : ""}`}
              style={{ transitionDelay: "100ms" }}
            >
              Get the App
            </span>
            <h1
              className={`text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-tight font-family-extrabold reveal ${inView ? "visible" : ""}`}
              style={{ transitionDelay: "200ms" }}
            >
              Download our <span className="text-brand-600">Mobile App</span>
            </h1>
            <p
              className={`text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-lg font-family-regular reveal ${inView ? "visible" : ""}`}
              style={{ transitionDelay: "300ms" }}
            >
              Download the Cabkn app for seamless, reliable transportation
              between Nevis and Saint Kitts. Book rides in seconds, track your
              driver in real-time, and enjoy a premium travel experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-1 sm:mt-2 w-full sm:w-auto">
              <button
                onClick={() =>
                  window.open(
                    "https://play.google.com/store/apps/details?id=com.cabkn.app",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 text-white bg-slate-900 rounded-xl sm:rounded-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-2xl cursor-pointer border-0 font-family-regular w-full sm:w-auto"
                style={{
                  minHeight: 48,
                }}
              >
                <FaGooglePlay size={28} className="sm:w-9 sm:h-9" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] sm:text-xs text-slate-300">GET IT ON</span>
                  <span className="text-base sm:text-lg lg:text-xl font-bold">Google Play</span>
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
                className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-2xl cursor-pointer border-0 font-family-regular w-full sm:w-auto"
                style={{
                  minHeight: 48,
                }}
              >
                <TiVendorApple size={32} className="sm:w-10 sm:h-10" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] sm:text-xs text-slate-300">Download on the</span>
                  <span className="text-base sm:text-lg lg:text-xl font-bold">App Store</span>
                </div>
              </button>
            </div>
          </div>
        </Col>
        <Col lg={6} className="text-center py-8 sm:py-10 lg:py-12">
          <div className="relative inline-block w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[400px] mx-auto">
            <div
              className="absolute inset-0 -z-10"
              style={{
                background: "radial-gradient(circle, rgba(0,74,112,0.2) 0%, transparent 70%)",
                transform: "scale(1.3)",
              }}
            />
            <Image
              src={mobiledown}
              className="animate-[float-car_6s_ease-in-out_infinite]"
              style={{
                objectFit: "contain",
                width: "100%",
                height: "auto",
                filter: "drop-shadow(0 40px 80px rgba(0,74,112,0.25))",
              }}
              alt="Download App Image"
            />
          </div>
        </Col>
      </Row>
    </section>
  );
}
