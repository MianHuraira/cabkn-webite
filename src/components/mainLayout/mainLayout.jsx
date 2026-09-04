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

import NotificationHandler from "../Firebase/NotificationHandler";
import CartDrawer from "../cart/CartDrawer";

const MainLayout = ({ children }) => {
  const [toggled, setToggled] = useState(false);
  const [broken, setBroken] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { userData } = ApiFunction();
  const isTipModal = useSelector((state) => state.auth.isTipModal);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const renderHeader = () => {
    if (!isPrivteRoute) {
      return userData?.user ? <InnerHeader /> : <Header />;
    }
    return null;
  };

  return (
    <>
      <GoogleOAuthProvider
        onScriptLoadError={(e) => console.error("error", e)}
        onScriptLoadSuccess={() => console.log("first ko")}
        clientId="384564999775-vlt6uskvpmk0jkts0juu2v5hpv4tul02.apps.googleusercontent.com"
      >
        <SocketProvider>
          <Provider store={store}>
            <NotificationHandler />
            <CartDrawer />
            {mounted ? renderHeader() : null}
            {children}
            {isPublicRoute && !isRiderRequest ? <Footer /> : ""}
          </Provider>
        </SocketProvider>
      </GoogleOAuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "!bg-white !text-slate-900 !rounded-2xl !border !border-slate-200/95 !shadow-[0_18px_38px_-4px_rgba(0,74,112,0.15),0_6px_12px_-2px_rgba(0,0,0,0.06)] !font-family-semibold !text-[13.5px] !py-3 !px-4",
          duration: 3500,
          success: {
            iconTheme: {
              primary: "#059669",
              secondary: "#ecfdf5",
            },
          },
          error: {
            iconTheme: {
              primary: "#e11d48",
              secondary: "#fff1f2",
            },
          },
        }}
      />
    </>
  );
};

export default MainLayout;
