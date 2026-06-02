import Script from "next/script";

import React from "react";

import "./globals.css";
import "../components/assets/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import ClientWrapper from "@/components/mainLayout/ClientWrapper";
import { ConfigProvider } from "antd";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "antd/dist/reset.css"; // For latest Ant Design (v5)
import "@ant-design/v5-patch-for-react-19";
import Head from "next/head";

export const metadata = {
  title: {
    default: "CabKn",
    template: `%s | CabKn`,
  },
  description: "Book your rides in St.kItts and Nevis today",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Your Head content */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function handleChunkError(e) {
                var isChunkLoadError = false;
                if (e.message && (e.message.indexOf('Loading chunk') !== -1 || e.message.indexOf('ChunkLoadError') !== -1)) {
                  isChunkLoadError = true;
                }
                if (e.reason && e.reason.message && (e.reason.message.indexOf('Loading chunk') !== -1 || e.reason.message.indexOf('ChunkLoadError') !== -1)) {
                  isChunkLoadError = true;
                }
                if (e.reason && e.reason.name === 'ChunkLoadError') {
                  isChunkLoadError = true;
                }
        
                if (isChunkLoadError) {
                  var lastReload = sessionStorage.getItem('last_chunk_error_reload');
                  var now = Date.now();
                  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
                    sessionStorage.setItem('last_chunk_error_reload', now.toString());
                    window.location.reload(true);
                  }
                }
              }
              window.addEventListener('error', handleChunkError, true);
              window.addEventListener('unhandledrejection', handleChunkError, true);
            `,
          }}
        />
      </head>
      <body>
        {/* Your Scripts */}

        {/* Your App Content */}
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
