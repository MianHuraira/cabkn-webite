"use client";

import React, { useEffect, useState } from "react";
import { Col } from "react-bootstrap";
import { Row } from "reactstrap";
import { BsFillTelephoneFill } from "react-icons/bs";
import { FiMapPin } from "react-icons/fi";
import { AiOutlineMail } from "react-icons/ai";
import { FaTwitter } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { useSelector } from "react-redux";
import ApiFunction from "../ApiFunction/ApiFunction";
import { ApplePlayBlack, GooglePlayblack } from "../assets/Images";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Footer() {
  const userData = useSelector((state) => state.auth.user?.user);
  const { header1, getData } = ApiFunction();
  const [FooterData, setFooterData] = useState([]);

  const router = useRouter();

  const getProfile = async () => {
    try {
      const response = await getData("users/footer", header1);
      setFooterData(response?.footer);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className="footer">
      <Row className="container g-3">
        <Col lg="4">
          <h1 className="footerHeader">CabKN</h1>
          <p className="footerDes">{FooterData?.short_title}</p>
          <button
            onClick={() => router.push(userData ? "/ride" : "/auth/login")}
            className="riderBtn"
          >
            Request a driver
          </button>
        </Col>
        <Col lg="4">
          <h1 className="FooterToppgrphy">Contacts</h1>
          <div className="d-flex align-items-center mt-2 gap-3 mt-3">
            <BsFillTelephoneFill size={20} color="#fff" />
            <div>
              <p className="linkFooter">{FooterData?.phone}</p>
              <p className="linkFooter">{FooterData?.tel}</p>
            </div>
          </div>

          <div className="d-flex align-items-center mt-2 gap-3  mt-3">
            <AiOutlineMail size={20} color="#fff" />

            <div>
              <p className="linkFooter">{FooterData?.emails}</p>
            </div>
          </div>

          <div className="d-flex align-items-center mt-2 gap-3  mt-3">
            <FiMapPin size={20} color="#fff" />
            <div>
              <p className="linkFooter">{FooterData?.location}</p>
            </div>
          </div>
        </Col>
        <Col lg="4" className="flex item-center flex-col justify-center">
          <div className="flex items-center gap-5 flex-wrap ">
            <div className="icnFooter">
              <FaTwitter color="#004a70" />
            </div>
            <div className="icnFooter">
              <FaFacebookF color="#004a70" />
            </div>
            <div className="icnFooter">
              <FaLinkedin color="#004a70" />
            </div>
            <div className="icnFooter">
              <FaYoutube color="#004a70" />
            </div>
          </div>

          <div className="flex items-center gap-3 max-[320px]:flex-col mt-4">
            <Image
              src={GooglePlayblack}
              onClick={() =>
                window.open(
                  "https://play.google.com/store/apps/details?id=com.cabkn.app",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
              style={{ objectFit: "contain", height: 51, width: 170 }}
              alt="Footer Image"
            />
            <Image
              src={ApplePlayBlack}
              style={{ objectFit: "contain", height: 51, width: 170 }}
              alt="Footer Image"
              onClick={() =>
                window.open(
                  "https://apps.apple.com/pk/app/cabkn/id6740235227",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            />
          </div>
          <div className="d-flex  align-items-center gap-3 mt-4">
            <p className="linkFooter">Privacy</p>
            <p className="linkFooter">Terms</p>
          </div>
        </Col>
      </Row>
    </div>
  );
}
