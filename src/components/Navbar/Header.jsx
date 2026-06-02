/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { Nav, Navbar, Offcanvas } from "react-bootstrap";
import { Modal } from "react-bootstrap";

import { logout } from "../Redux/Slices/AuthSlice";
import { useDispatch, useSelector } from "react-redux";
// import { Logo, logoBlue } from "../../assets/Images";
import { AiOutlineMenuFold } from "react-icons/ai";
import Link from "next/link";
import { AppStore, GooglePlay } from "../assets/Images";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Header = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const router = useRouter();

  const [driverModal, SetdriverModal] = useState(false);
  const handleClosedriver = () => SetdriverModal(false);

  const dispatch = useDispatch();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const scrollToElementFromHash = () => {
      if (hash) {
        const elementId = hash.replace("#", "");
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    scrollToElementFromHash();
  }, []);

  const handleScroll = (id) => {
    const targetElement = document.getElementById(id);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 550);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);



  const Route = (data) => {
    router.push(`/${data}`);
    handleClose();
  };

  


  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth");
    dispatch(userChat(0));
  };

  return (
    <>
      <Navbar
        expand="xl"
        className={`navBar00 ${isScrolled ? "scrolled" : ""}`}
        style={{
          background:
            isScrolled === "/ContactUs"
              ? "linear-gradient(179.02deg, #004A70 -69.5%, #B1B0B0 99.16%)"
              : "transparent",
        }}
      >
        <Link href={"/"}>
          {/* <img className="logoICon" src={Logo} alt="" /> */}
        </Link>

        {/* {publicPaths ? ( */}
        <>
          <button onClick={handleShow} className="d-lg-none me-4">
            <AiOutlineMenuFold color="#fff" size={25} />
          </button>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="naviner m-auto gap-5">
              <span
                className="navbarLink cursor-pointer"
                onClick={() => handleScroll("whyUs")}
              >
                Why Us
              </span>
              <span
                className="navbarLink cursor-pointer"
                onClick={() => handleScroll("benefits")}
              >
                Benefits
              </span>
              <span
                className="navbarLink cursor-pointer"
                onClick={() => handleScroll("testimonials")}
              >
                Testimonials
              </span>
              <span
                className="navbarLink cursor-pointer"
                onClick={() => navigate("/ContactUs")}
              >
                Contact Us
              </span>
            </Nav>

            <div className="d-flex align-items-center icondiv00 position-relative gap-3">
              <Link href={"/auth/login"} className="loginBtnNav ">
                Login
              </Link>
              <Link href={"/auth/stepOne"} className="loginBtnNav2">
                Sign up
              </Link>
              <div
                onClick={() => SetdriverModal(true)}
                className="loginBtnNav2 me-4 cursor-pointer"
                style={{ width: 150 }}
              >
                Sign up as Driver
              </div>
            </div>
          </Navbar.Collapse>
        </>
      </Navbar>

      <Offcanvas
        show={show}
        onHide={handleClose}
        className=" pb-3 max-w-[280px]"
      >
        <Offcanvas.Header closeButton></Offcanvas.Header>
        <Offcanvas.Body className="pt-0">
          <Nav>
            <div className="flex flex-col w-100 gap-3">
              <Link className="navbarLinkSidebar" href="/">
                Why us
              </Link>
              <Link className="navbarLinkSidebar" href="/">
                Benefits
              </Link>
              <Link className="navbarLinkSidebar" href="/">
                Testimonials
              </Link>
              <Link className="navbarLinkSidebar" href="/">
                Contact us
              </Link>
              <div className="flex  gap-3 flex-col items-center w-100">
                <Link href="/auth/login" className="loginBtnNavSidebar ">
                  Login
                </Link>
                <Link href="/auth/stepOne" className="loginBtnNavSidebar2 ">
                  Sign up
                </Link>
                <div
                  onClick={() => {SetdriverModal(true), handleClose()}}
                  className="loginBtnNavSidebar2 cursor-pointer"
                  style={{ width: 150 }}
                >
                  Sign up as Driver
                </div>
              </div>
            </div>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      <Modal
        centered
        backdrop="static"
        show={driverModal}
        onHide={handleClosedriver}
      >
        <Modal.Header closeButton>
          <Modal.Title>To Use Our Driver App</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h1 className="text-[#004a70] text-3xl  font-bold">
            Download our
          </h1>
          <h1 className="text-2xl font-semibold mt-2">
            Mobile app
          </h1>
          <p className="DownloadSub mt-2">
            Download the Cabkn driver app for easy transportation access !
          </p>
          <div className="mt-5 gap-3 flex item-center max-[320px]:flex-col">
            <Image
              src={GooglePlay}
              className="max-[567px]:w-[45%]"
              style={{ objectFit: "contain", height: 50, width: 170 }}
              alt=""
              onClick={() =>
                window.open(
                  "https://play.google.com/store/apps/details?id=com.cabkndriver.app&hl=en",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            />

            <Image
              className="max-[567px]:w-[45%]"
              src={AppStore}
              style={{ objectFit: "contain", height: 50, width: 170 }}
              alt=""
              onClick={() =>
                window.open(
                  "https://apps.apple.com/pk/app/cabkn-driver/id6740235396",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Header;
