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
    <div
      ref={sectionRef}
      style={{
        marginTop: "5rem",
        marginBottom: "5rem",
        background:
          "linear-gradient(135deg, #f0f7ff 0%, #ffffff 40%, #eff6fb 100%)",
      }}
    >
      <Row
        className="max-w-7xl mx-auto align-items-center g-0"
        style={{ minHeight: 520, padding: "2rem 0" }}
      >
        <Col lg={6} className="p-5 lg:p-8">
          <div className="d-flex flex-column gap-4">
            <span
              className={`reveal ${inView ? "visible" : ""}`}
              style={{
                color: "#004a70",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: "uppercase",
                transitionDelay: "100ms",
                fontFamily: "Inter-Bold",
              }}
            >
              Get the App
            </span>
            <h1
              className={`reveal ${inView ? "visible" : ""}`}
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1.1,
                margin: 0,
                transitionDelay: "200ms",
                fontFamily: "Inter-ExtraBold",
              }}
            >
              Download our <span style={{ color: "#004a70" }}>Mobile app</span>
            </h1>
            <p
              className={`reveal ${inView ? "visible" : ""}`}
              style={{
                color: "#475569",
                fontSize: 17,
                lineHeight: 1.8,
                maxWidth: 460,
                transitionDelay: "300ms",
                fontFamily: "Inter-Regular",
              }}
            >
              Download the Cabkn app for seamless, reliable transportation
              between Nevis and Saint Kitts. Book rides in seconds, track your
              driver in real-time, and enjoy a premium travel experience.
            </p>
            <div
              className={`d-flex flex-wrap gap-4 mt-4 reveal ${inView ? "visible" : ""}`}
              style={{ transitionDelay: "400ms" }}
            >
              {/* Google Play Button */}
              <button
                onClick={() =>
                  window.open(
                    "https://play.google.com/store/apps/details?id=com.cabkn.app",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                className="flex items-center gap-3 px-3 py-2 text-white bg-black rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer border border-gray-200"
                style={{
                  minWidth: 190,
                  minHeight: 58,
                  fontFamily: "Inter-SemiBold",
                }}
              >
                <FaGooglePlay size={32} />
                <div className="flex flex-col text-left">
                  <span style={{ fontSize: 10, lineHeight: 1.2 }}>
                    GET IT ON
                  </span>
                  <span
                    style={{ fontSize: 18, lineHeight: 1.3, }}
                  >
                    Google Play
                  </span>
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
                className="flex items-center gap-3 px-3 py-2 bg-black text-white rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer border border-gray-200"
                style={{
                  minWidth: 190,
                  minHeight: 58,
                  fontFamily: "Inter-SemiBold",
                }}
              >
                <TiVendorApple size={36} />
                <div className="flex flex-col text-left">
                  <span style={{ fontSize: 10, lineHeight: 1.2 }}>
                    Download on the
                  </span>
                  <span
                    style={{ fontSize: 18, lineHeight: 1.3, fontWeight: 700 }}
                  >
                    App Store
                  </span>
                </div>
              </button>
            </div>
          </div>
        </Col>
        <Col lg={6} className="text-center">
          <div
            className={`reveal ${inView ? "visible" : ""}`}
            style={{
              display: "inline-block",
              position: "relative",
              transitionDelay: "300ms",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 30,
                background:
                  "radial-gradient(circle, rgba(0,74,112,0.15) 0%, transparent 70%)",
                borderRadius: "50%",
                zIndex: 0,
              }}
            />
            <Image
              src={mobiledown}
              className="animate-[float-car_6s_ease-in-out_infinite]"
              style={{
                objectFit: "contain",
                width: "100%",
                height: 460,
                position: "relative",
                zIndex: 1,
                filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.15))",
              }}
              alt="Download App Image"
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}
