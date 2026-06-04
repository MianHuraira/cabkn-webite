import React from "react";
import { Col, Row } from "reactstrap";
import { AppStore, GooglePlay, mobiledown } from "../assets/Images";
import Image from "next/image";

export default function DownloadApp() {
  return (
    <div
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
              style={{
                color: "#004a70",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Download
            </span>
            <h1
              style={{
                fontSize: 42,
                fontWeight: 700,
                color: "#1a1a2e",
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Download our{" "}
              <span style={{ color: "#004a70" }}>Mobile app</span>
            </h1>
            <p
              style={{
                color: "#6b7280",
                fontSize: 16,
                lineHeight: 1.7,
                maxWidth: 440,
              }}
            >
              Download the Cabkn app for easy transportation between Nevis And
              Saint Kitts
            </p>
            <div className="d-flex flex-wrap gap-3 mt-3">
              <div
                onClick={() =>
                  window.open(
                    "https://play.google.com/store/apps/details?id=com.cabkn.app",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                style={{
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Image
                  src={GooglePlay}
                  style={{ objectFit: "contain", height: 54, width: 180 }}
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
                style={{
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Image
                  src={AppStore}
                  style={{ objectFit: "contain", height: 54, width: 180 }}
                  alt="App Store"
                />
              </div>
            </div>
          </div>
        </Col>
        <Col lg={6} className="text-center">
          <div
            style={{
              display: "inline-block",
              position: "relative",
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
