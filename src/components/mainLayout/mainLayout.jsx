/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";

import { store } from "../Redux/Store";

import InnerHeader from "../Navbar/InnerHeader";
import Header from "../Navbar/Header";
import "@/components/assets/style.css";
import Footer from "../Footer/Footer";
import { SocketProvider } from "../ApiFunction/SoketProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { usePathname } from "next/navigation";
import ApiFunction from "../ApiFunction/ApiFunction";
import { Toaster } from "react-hot-toast";

const MainLayout = ({ children }) => {
  const [toggled, setToggled] = useState(false);
  const [broken, setBroken] = useState(false);
  const pathname = usePathname();
  const { userData } = ApiFunction();
  const isTipModal = useSelector((state) => state.auth.isTipModal);

  const pubRoute = ["/"];
  const authRoute = [
    "/auth/login",
    "/payment",
    "/auth/signup",
    "/auth/forgotpss",
    "/auth/optCode",
    "/auth/stepOne",
    "/auth/resetPass",
  ];
  const isPublicRoute = pubRoute.includes(pathname);
  const isPrivteRoute =
    authRoute.includes(pathname) || pathname.startsWith("/rider-request/");
  const isRiderRequest = pathname.startsWith("/rider-request/");

  return (
    <>
      <GoogleOAuthProvider
        onScriptLoadError={(e) => console.error("error", e)}
        onScriptLoadSuccess={() => console.log("first ko")}
        clientId="384564999775-vlt6uskvpmk0jkts0juu2v5hpv4tul02.apps.googleusercontent.com"
      >
        <SocketProvider>
          <Provider store={store}>
            {!isPrivteRoute &&
              (userData?.user ? (
                <>
                  <InnerHeader />
                </>
              ) : (
                <>
                  <Header />
                </>
              ))}
            {children}
            {isPublicRoute && !isRiderRequest ? <Footer /> : ""}
          </Provider>
        </SocketProvider>
      </GoogleOAuthProvider>
      <Toaster />
    </>
  );
};

export default MainLayout;
