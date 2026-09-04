"use client";
import "@ant-design/v5-patch-for-react-19";
import Script from "next/script";

import React from "react";
import { store } from "@/components/Redux/Store";
import { Provider } from "react-redux";
import MainLayout from "@/components/mainLayout/mainLayout";
import { StyleProvider, createCache, extractStyle } from "@ant-design/cssinjs";
import { useServerInsertedHTML, usePathname } from "next/navigation";
import { ConfigProvider, App } from "antd";
import { useEffect } from "react";

const ClientWrapper = ({ children }) => {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      const allowedRoutes = ["/auth/signup", "/auth/stepOne", "/auth/optCode"];
      const isSignupFlow = allowedRoutes.some(route => pathname.startsWith(route));
      if (!isSignupFlow) {
        sessionStorage.removeItem("signup_draft");
      }
    }
  }, [pathname]);

  // Auto-clear sessionStorage 1 minute after data is stored
  useEffect(() => {
    if (typeof window === "undefined") return;

    const EXPIRY_TIME = 60 * 1000; // 1 minute (60 seconds)
    let clearTimer = null;

    const clearStorage = () => {
      try {
        sessionStorage.clear();
      } catch (e) {
        console.warn("Could not clear sessionStorage:", e);
      }
    };

    const scheduleClear = (delay) => {
      if (clearTimer) clearTimeout(clearTimer);
      clearTimer = setTimeout(() => {
        clearStorage();
      }, delay);
    };

    // 1. Check existing timestamp on mount
    try {
      const savedTime = sessionStorage.getItem("_cabkn_session_timestamp");
      if (savedTime) {
        const elapsed = Date.now() - parseInt(savedTime, 10);
        if (elapsed >= EXPIRY_TIME) {
          clearStorage();
        } else {
          scheduleClear(EXPIRY_TIME - elapsed);
        }
      }
    } catch (_) {}

    // 2. Periodic check (every 10s) and on tab visibility change
    const checkExpiry = () => {
      try {
        const savedTime = sessionStorage.getItem("_cabkn_session_timestamp");
        if (savedTime && Date.now() - parseInt(savedTime, 10) >= EXPIRY_TIME) {
          clearStorage();
        }
      } catch (_) {}
    };

    const intervalId = setInterval(checkExpiry, 10000);
    document.addEventListener("visibilitychange", checkExpiry);

    // 3. Patch sessionStorage.setItem to update timestamp and start 1-minute timer on any write
    try {
      if (!window._cabkn_session_patched) {
        window._cabkn_session_patched = true;
        const originalSetItem = sessionStorage.setItem;
        sessionStorage.setItem = function (key) {
          const result = originalSetItem.apply(this, arguments);
          if (key !== "_cabkn_session_timestamp") {
            try {
              originalSetItem.call(sessionStorage, "_cabkn_session_timestamp", Date.now().toString());
            } catch (_) {}
            scheduleClear(EXPIRY_TIME);
          }
          return result;
        };
      }
    } catch (_) {}

    return () => {
      if (clearTimer) clearTimeout(clearTimer);
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", checkExpiry);
    };
  }, []);

  useEffect(() => {
    const checkTidio = () => {
      if (typeof window.tidioChatApi !== "undefined") {
        if (pathname && pathname.startsWith("/rider-request/")) {
          window.tidioChatApi.hide();
        } else {
          window.tidioChatApi.show();
        }
      }
    };

    if (window.tidioChatApi) {
      checkTidio();
    } else {
      document.addEventListener("tidioChatApiReady", checkTidio);
    }

    return () => {
      document.removeEventListener("tidioChatApiReady", checkTidio);
    };
  }, [pathname]);

  const StyledComponentsRegistry = ({ children }) => {
    const cache = React.useMemo(() => createCache(), []);
    const isServerInserted = React.useRef(false);

    useServerInsertedHTML(() => {
      if (isServerInserted.current) {
        return;
      }
      isServerInserted.current = true;
      return (
        <style
          id="antd"
          dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }}
        />
      );
    });

    return (
      <StyleProvider cache={cache}>
        <ConfigProvider>
          <App>{children}</App>
        </ConfigProvider>
      </StyleProvider>
    );
  };

  return (
    <>
      <Script
        src="https://code.tidio.co/58c3oqohlxcbme9g3rrfxz0gdeygp7i3.js"
        strategy="afterInteractive"
      />
      <StyledComponentsRegistry>
        <Provider store={store}>
          <MainLayout>{children}</MainLayout>
        </Provider>
      </StyledComponentsRegistry>
    </>
  );
};

export default ClientWrapper;
