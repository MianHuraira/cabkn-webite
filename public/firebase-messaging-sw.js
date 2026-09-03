// Firebase Cloud Messaging Background Service Worker
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

// Read Firebase config dynamically from URL parameters passed at registration
// No hardcoded keys are stored in this file
const urlParams = new URL(location).searchParams;
const firebaseConfig = {
  apiKey: urlParams.get("apiKey") || "",
  authDomain: urlParams.get("authDomain") || "",
  projectId: urlParams.get("projectId") || "",
  storageBucket: urlParams.get("storageBucket") || "",
  messagingSenderId: urlParams.get("messagingSenderId") || "",
  appId: urlParams.get("appId") || "",
};

let messaging = null;

if (firebaseConfig.projectId) {
  try {
    firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging();
    console.log("[Firebase SW] Service worker initialized with environment configuration.");
  } catch (initErr) {
    console.warn("[Firebase SW] Firebase initialize warning:", initErr);
  }
} else {
  console.warn("[Firebase SW] Firebase config parameters not found in registration URL.");
}

self.addEventListener("install", function (event) {
  console.log("[Firebase SW] Service worker installed.");
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  console.log("[Firebase SW] Service worker activated.");
  event.waitUntil(clients.claim());
});

// Background message handler
if (messaging) {
  messaging.onBackgroundMessage(function (payload) {
    console.log("[Firebase SW] Received background message: ", payload);

    const notificationTitle =
      payload.notification?.title || payload.data?.title || "CabKn";
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || "",
      icon: payload.notification?.icon || payload.data?.icon || "/logoBlue.png",
      image: payload.notification?.image || payload.data?.image,
      data: payload.data || {},
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Notification click handler to open or focus the window
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const targetUrl =
    event.notification.data?.click_action ||
    event.notification.data?.url ||
    "/admin";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (windowClients) {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
