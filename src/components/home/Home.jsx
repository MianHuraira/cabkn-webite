"use client";
import React from "react";

import { Button, Col, Container, Row } from "reactstrap";
// import { useSelector } from "react-redux";
import Tingstodo from "./Tingstodo";
import IntroVideo from "./IntroVideo";
import DownloadApp from "./DownloadApp";
import { CarBanner } from "../assets/Images";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Script from "next/script";

const HomeComponent = () => {
  const router = useRouter();
  const userData = useSelector((state) => state.auth.user?.user);

  const Routing = () => {
    router.push(userData ? "/ride" : "/auth/login");
  };

  return (
    <>
      {/* <Script src="//code.tidio.co/58c3oqohlxcbme9g3rrfxz0gdeygp7i3.js" strategy="afterInteractive" /> */}

      <div className="mainbanner h-[70vh] max-[768px]:h-[50vh] d-flex justify-content-center align-items-center overflow-hidden">
        <Row>
          <Col
            lg="6"
            className="d-flex flex-column justify-content-center align-items-center"
          >
            <div style={{ width: "81%" }}>
              <h1 className=" text-2xl sm:text-3xl  md:text-3xl lg:text-5xl font-bold text-[#fff]">
                Experience seamless rides with reliable and affordable travel
                options
              </h1>
              <h5 className="subheading sm:text-lg lg:text-xl mt-2">
                Discover a smarter way to travel with our reliable ride
                services. Book effortlessly, track your rides in real-time, and
                enjoy a hassle-free journey. Your comfort and convenience are
                our priority
              </h5>
              <Button onClick={Routing} className="btnHome ">
                Book a Ride
              </Button>
            </div>
          </Col>
          <Col lg="6" className="flex item-center justify-center max-lg:hidden">
            <Image
              src={CarBanner}
              style={{ objectFit: "contain", height: 360 }}
              alt=""
            />
          </Col>
        </Row>
      </div>
      <div id="whyUs">
        <Tingstodo />
      </div>

      <div id="whyUs">
        <IntroVideo />
      </div>

      <DownloadApp />
    </>
  );
};

// wefwef÷

export default HomeComponent;
