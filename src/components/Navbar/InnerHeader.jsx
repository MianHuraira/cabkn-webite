/* eslint-disable react/jsx-no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Nav, Navbar, Form, Offcanvas, Modal } from "react-bootstrap";
import { FaUser } from "react-icons/fa";

import { Dropdown, Menu, message } from "antd";

import { useDispatch, useSelector } from "react-redux";
// import { logoBlue } from "../../assets/Images";
import { AiOutlineMenuFold } from "react-icons/ai";
import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import { MdNotificationsActive } from "react-icons/md";
import { IoHeart } from "react-icons/io5";
import Link from "next/link";
import { AppStore, GooglePlay, logoBlue } from "../assets/Images";
import Image from "next/image";
import ApiFunction from "../ApiFunction/ApiFunction";
import { logout } from "../Redux/Slices/AuthSlice";
import { useRouter } from "next/navigation";
import { encryptData } from "../ApiFunction/encrypted";

const InnerHeader = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const handleShow = () => setShow(true);
  const { getData, header3, header1, baseURL, userData } = ApiFunction();
  const router = useRouter();


  const [driverModal, SetdriverModal] = useState(false);
  const handleClosedriver = () => SetdriverModal(false);

  const dispatch = useDispatch();

  useEffect(() => {
    handleClose();
  }, []);

  const handleChatUser = () => {
    if (!userData?.user) {
      message.error("Please login first");
      return;
    }
    const user = userData?.user;
    const chatUser = {
      _id: user?._id,
      username: user?.name,
      profileImage: user?.profileImage || "",
      email: user?.email || "",
    };

    router.push("/chat");
  };

  const [isScrolled, setIsScrolled] = useState(false);
  const Route = (data) => {
    router.push(`/${data}`);
    handleClose();
  };

  const handleLogout = () => {
    dispatch(logout());
    window.localStorage.clear();
  };

  const HandleModal = () => {
    SetdriverModal(true);
  };

  const AuthDrop = [
    {
      label: "Porfile",
      key: "1",
      to: "/profile",
      // onClick: HandleProfile,
    },
    {
      label: "Signup as Driver",
      key: "2",
      onClick: HandleModal,
    },
    {
      label: "Logout",
      key: "3",
      to: "/auth/login",
      onClick: handleLogout,
    },
  ];

  // modal data
  const menu = (
    <Menu>
      {AuthDrop.map((item) => (
        <Menu.Item key={item.key} onClick={item.onClick}>
          {item.to ? (
            <Link href={item?.to}>{item.label}</Link>
          ) : (
            <Link href={"/"} onClick={item.onClick}>
              {item.label}
            </Link>
          )}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <>
      <Navbar
        expand="xl"
        className={`navBar00inner`}
        style={{
          background: "transparent", // Set default background
          paddingLeft: 10,
          paddingRight: 20,
          height: 75,
        }}
      >
        <Link
          style={{ textDecoration: "none" }}
          className="text_primary"
          href={"/"}
        >
          <Image className="logoICon" src={logoBlue} alt="" />
        </Link>

        {/* {!allPath ? ( */}
        <>
          <button onClick={handleShow} className="d-lg-none me-4">
            <AiOutlineMenuFold color="#004A70" size={25} />
          </button>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="naviner m-auto gap-5">
              <Link
                className="navbarLinkinner "
                // className={({ isActive }) =>
                //   isActive ? "navbarLinkinner active" : "navbarLinkinner"
                // }
                href={"/admin"}
              >
                My Bookings
              </Link>
              <Link
                className="navbarLinkinner "
                // className={({ isActive }) =>
                //   isActive ? "navbarLinkinner active" : "navbarLinkinner"
                // }
                href={"/ride"}
              >
                Book Ride
              </Link>
              <Link className="navbarLinkinner" href={"/makeowntours"}>
                Make Own Tours
              </Link>
              <Link className="navbarLinkinner" href={"/listownplace"}>
                List Own Place
              </Link>
              <Link className="navbarLinkinner " href={"/serviceLocations"}>
                Shop
              </Link>
              <Link className="navbarLinkinner " href={"/wallet"}>
                Wallet
              </Link>

              <Link className="navbarLinkinner " href={"/chat"}>
                Chat
              </Link>
              <Link className="navbarLinkinner " href={"/favorites"}>
                Favorites
              </Link>

              <Link href={"/coupon"} className="navbarLinkinner ">
                Offers
              </Link>
              <Link className="navbarLinkinner" href={"/userreviews"}>
                Reviews
              </Link>
            </Nav>
            <div className="flex items-center gap-3">
              <div className="navIcons cursor-pointer" onClick={handleChatUser}>
                <HiOutlineChatBubbleOvalLeft color="#004a70" />
              </div>
              <div
                className="navIcons cursor-pointer"
                onClick={() => Route("notifications")}
              >
                <MdNotificationsActive color="#004a70" />
              </div>
              <div
                className="navIcons cursor-pointer"
                onClick={() => Route("favorites")}
              >
                <IoHeart color="#004a70" />
              </div>
              <Link
                href={""}
                className="border-0 navbarLink flex items-center gap-3"
              >
                <Dropdown overlay={menu}>
                  <div>
                    <span
                      className="ant-dropdown-link navicon rounded-full"
                      onClick={(e) => e.preventDefault()}
                    >
                      {userData?.user?.image ? (
                        <Image
                          width={40}
                          height={40}
                          src={userData?.user?.image}
                          className="w-10 h-10 rounded-full object-cover"
                          alt="userImage"
                        />
                      ) : (
                        <FaUser />
                      )}
                    </span>
                  </div>
                </Dropdown>
              </Link>
            </div>
          </Navbar.Collapse>
        </>
        {/* ) : (
          ""
        )} */}
      </Navbar>

      <Offcanvas
        show={show}
        onHide={handleClose}
        className=" pb-3 max-w-[280px] "
      >
        <Offcanvas.Header closeButton>
          <Link
            href={"/"}
            style={{ textDecoration: "none" }}
            className="text_primary"
          >
            <Image className="logoICon" src={logoBlue} alt="" />
          </Link>
        </Offcanvas.Header>
        <Offcanvas.Body className="pt-0">
          {/* <Nav> */}
          <div className="flex flex-col gap-3">
            <Nav className="naviner flex-col  gap-3">
              <div onClick={() => Route("admin")} className="navbarLinkinner">
                My Bookings
              </div>

              <div onClick={() => Route("ride")} className="navbarLinkinner">
                Book Ride
              </div>
              <div
                onClick={() => Route("makeowntours")}
                className="navbarLinkinner"
              >
                Make Own Tours
              </div>

              <div
                onClick={() => Route("listownplace")}
                className="navbarLinkinner"
              >
                List Own Place
              </div>

              <div
                onClick={() => Route("serviceLocations")}
                className="navbarLinkinner"
              >
                Shop
              </div>

              <div onClick={() => Route("wallet")} className="navbarLinkinner">
                Wallet
              </div>

              <div onClick={() => Route("coupon")} className="navbarLinkinner">
                Offers
              </div>

              <div
                onClick={() => Route("userreviews")}
                className="navbarLinkinner"
              >
                Reviews
              </div>
            </Nav>

            <div className="flex flex-col  gap-3">
              <div onClick={() => Route("chat")} className="navbarLinkinner">
                Chat
              </div>
              <div
                className="navbarLinkinner cursor-pointer"
                onClick={() => Route("notifications")}
              >
                Notifications
              </div>
              <div
                className="navbarLinkinner cursor-pointer"
                onClick={() => Route("favorites")}
              >
                Favorites
              </div>
              <Link
                href={""}
                className="border-0 navbarLink flex items-center gap-3"
              >
                <Dropdown overlay={menu}>
                  <div>
                    <span
                      className="ant-dropdown-link navicon   rounded-full"
                      onClick={(e) => e.preventDefault()}
                    >
                      {userData?.user?.image ? (
                        <Image
                          width={40}
                          height={40}
                          src={userData?.user?.image}
                          className="w-10 h-10 rounded-full object-cover"
                          alt="userImage"
                        />
                      ) : (
                        <FaUser />
                      )}
                    </span>
                  </div>
                </Dropdown>
              </Link>
            </div>
          </div>

          {/* </Nav> */}
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

export default InnerHeader;
