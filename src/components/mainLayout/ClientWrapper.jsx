"use client";
import Script from "next/script";

import React from "react";
import { store } from "@/components/Redux/Store";
import { Provider } from "react-redux";
import MainLayout from "@/components/mainLayout/mainLayout";
import { StyleProvider, createCache, extractStyle } from "@ant-design/cssinjs";
import { useServerInsertedHTML, usePathname } from "next/navigation";
import { ConfigProvider } from "antd";
import { useEffect } from "react";

const ClientWrapper = ({ children }) => {
  const pathname = usePathname();

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
        <ConfigProvider>{children}</ConfigProvider>
      </StyleProvider>
    );
  };

  return (
    <html lang="en">
      <Script
        src="https://code.tidio.co/58c3oqohlxcbme9g3rrfxz0gdeygp7i3.js"
        strategy="afterInteractive"
      />
      <body>
        <StyledComponentsRegistry>
          <Provider store={store}>
            <MainLayout>{children}</MainLayout>
          </Provider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
};

export default ClientWrapper;
