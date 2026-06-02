import React from "react";
import { Col, Row } from "reactstrap";
import { AppStore, GooglePlay, mobiledown } from "../assets/Images";
import Image from "next/image";

export default function DownloadApp() {
  return (
    <div
      className="appDownload  d-flex  justify-content-center"
      style={{ marginTop: "5rem", marginBottom: "5rem" }}
    >
      <Row className="container mb-5 g-3">
        <p className="mt-5 head">Download</p>
        <h1 className="sub">Download our mobile app</h1>
        <Col lg="6">
          <Image
            src={mobiledown}
            className="mt-5"
            style={{ objectFit: "contain", width: "100%", height: 400 }}
            alt="Download App Image"
          />
        </Col>
        <Col lg="6" className="d-flex flex-column justify-content-center">
          <h1 className="text-[#004a70] text-5xl md:text-4xl lg:text-5xl font-bold">
            Download our
          </h1>
          <h1 className="text-5xl md:text-3xl lg:text-4xl font-semibold mt-2">
            Mobile app
          </h1>
          <p className="DownloadSub mt-2">
            Download the Cabkn app for easy transportation between Nevis And
            Sainkitts
          </p>
          <div className="mt-5 gap-3 flex item-center max-[320px]:flex-col">
            <Image
              src={GooglePlay}
              className="max-[567px]:w-[45%]"
              style={{ objectFit: "contain", height: 50, width: 170 }}
              alt="Google Play"
              onClick={() =>
                window.open(
                  "https://play.google.com/store/apps/details?id=com.cabkn.app",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            />

            <Image
              className="max-[567px]:w-[45%]"
              src={AppStore}
              style={{ objectFit: "contain", height: 50, width: 170 }}
              alt="App Store"
              onClick={() =>
                window.open(
                  "https://apps.apple.com/pk/app/cabkn/id6740235227",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}
