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
      className="py-24 bg-gradient-to-br from-brand-50 via-white to-brand-50"
    >
      <Row
        className="mx-auto align-items-center g-0"
        style={{ maxWidth: 1200, minHeight: 520 }}
      >
        <Col lg={6} className="p-6 lg:p-12">
          <div className="flex flex-col gap-6">
            <span
              className="inline-block px-4 py-1.5 bg-brand-100 text-brand-700 rounded-full text-sm font-['Inter-Bold'] w-fit tracking-wider uppercase"
            >
              Get the App
            </span>
            <h1
              className="text-4xl lg:text-5xl font-['Inter-ExtraBold'] text-slate-900 leading-tight"
            >
              Download our <span className="text-brand-600">Mobile App</span>
            </h1>
            <p
              className="text-slate-600 text-lg leading-relaxed max-w-lg font-['Inter-Regular']"
            >
              Download the Cabkn app for seamless, reliable transportation
              between Nevis and Saint Kitts. Book rides in seconds, track your
              driver in real-time, and enjoy a premium travel experience.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              {/* Google Play Button */}
              <button
                onClick={() =>
                  window.open(
                    "https://play.google.com/store/apps/details?id=com.cabkn.app",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                className="flex items-center gap-4 px-6 py-4 text-white bg-slate-900 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer border-0"
                style={{
                  minWidth: 200,
                  fontFamily: "Inter-SemiBold",
                }}
              >
                <FaGooglePlay size={36} />
                <div className="flex flex-col text-left">
                  <span className="text-xs text-slate-300">GET IT ON</span>
                  <span className="text-xl font-bold">Google Play</span>
                </div>
              </button>
              {/* App Store Button */}
              <button
                onClick={() =>
                  window.open(
                    "https://apps.apple.com/pk/app/cabkn/id6740235227",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                className="flex items-center gap-4 px-6 py-4 bg-slate-900 text-white rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer border-0"
                style={{
                  minWidth: 200,
                  fontFamily: "Inter-SemiBold",
                }}
              >
                <TiVendorApple size={40} />
                <div className="flex flex-col text-left">
                  <span className="text-xs text-slate-300">Download on the</span>
                  <span className="text-xl font-bold">App Store</span>
                </div>
              </button>
            </div>
          </div>
        </Col>
        <Col lg={6} className="text-center py-12">
          <div className="relative inline-block">
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
                maxWidth: 400,
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
