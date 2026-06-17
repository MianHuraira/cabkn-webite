import React, { useEffect, useState, useRef } from "react";
import { Col, Row } from "reactstrap";
import { ApplePlayBlack as AppStore, GooglePlayblack as GooglePlay, mobiledown } from "../assets/Images";
import Image from "next/image";

export default function DownloadApp() {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.08 }
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
        background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f0f4f8 100%)",
      }}
    >
      <Row className="container mx-auto align-items-center g-0" style={{ minHeight: 500 }}>
        <Col lg={6} className="p-5">
          <div className="d-flex flex-column gap-3">
            <span
              className={`reveal ${inView ? "visible" : ""}`}
              style={{
                color: "#004a70",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: "uppercase",
                transitionDelay: "100ms",
              }}
            >
              Download
            </span>
            <h1
              className={`reveal ${inView ? "visible" : ""}`}
              style={{
                fontSize: 42,
                fontWeight: 700,
                color: "#1a1a2e",
                lineHeight: 1.15,
                margin: 0,
                transitionDelay: "200ms",
              }}
            >
              Download our{" "}
              <span style={{ color: "#004a70" }}>Mobile app</span>
            </h1>
            <p
              className={`reveal ${inView ? "visible" : ""}`}
              style={{
                color: "#6b7280",
                fontSize: 16,
                lineHeight: 1.7,
                maxWidth: 440,
                transitionDelay: "300ms",
              }}
            >
              Download the Cabkn app for easy transportation between Nevis And
              Saint Kitts
            </p>
            <div className={`d-flex flex-wrap gap-3 mt-3 reveal ${inView ? "visible" : ""}`}
              style={{ transitionDelay: "400ms" }}>
              <div
                onClick={() =>
                  window.open(
                    "https://play.google.com/store/apps/details?id=com.cabkn.app",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                className="cursor-pointer transition-all duration-200 hover:scale-105"
              >
                <Image
                  src={GooglePlay}
                  style={{ objectFit: "contain", height: 54, width: 180, mixBlendMode: "multiply" }}
                  alt="Google Play"
                />
              </div>
              <div
                onClick={() =>
                  window.open(
                    "https://apps.apple.com/pk/app/cabkn/id6740235227",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                className="cursor-pointer transition-all duration-200 hover:scale-105"
              >
                <Image
                  src={AppStore}
                  style={{ objectFit: "contain", height: 54, width: 180, mixBlendMode: "multiply" }}
                  alt="App Store"
                />
              </div>
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
                inset: 20,
                background: "radial-gradient(circle, rgba(0,74,112,0.1) 0%, transparent 70%)",
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
                height: 420,
                position: "relative",
                zIndex: 1,
                filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.1))",
              }}
              alt="Download App Image"
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}
