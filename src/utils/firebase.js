import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App (singleton)
export const getFirebaseApp = () => {
  if (typeof window === "undefined") return null;
  if (!getApps().length) {
    console.log(
      "%c[Firebase]%c Initializing Firebase App for project: " + firebaseConfig.projectId,
      "background: #ff9800; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
      "color: #ff9800; font-weight: bold;"
    );
    return initializeApp(firebaseConfig);
  }
  return getApp();
};

// Get Firebase Messaging instance if supported
export const getFirebaseMessaging = async () => {
  if (typeof window === "undefined") return null;
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("[Firebase] Messaging is not supported in this browser environment.");
      return null;
    }
    const app = getFirebaseApp();
    if (!app) return null;
    return getMessaging(app);
  } catch (err) {
    console.warn("[Firebase] isSupported check error:", err);
    return null;
  }
};

/**
 * Request notification permission and obtain FCM device token.
 * Registers /firebase-messaging-sw.js service worker.
 */
export const requestNotificationPermission = async () => {
  if (typeof window === "undefined") return null;

  console.log(
    "%c[Firebase]%c Checking Notification Permission...",
    "background: #004a70; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
    "color: #004a70; font-weight: bold;"
  );

  if (!("Notification" in window)) {
    console.warn("[Firebase] This browser does not support desktop notifications.");
    return null;
  }

  console.log("[Firebase] Current browser notification permission:", Notification.permission);

  try {
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
      console.log("[Firebase] Notification permission prompt result:", permission);
    }

    if (permission !== "granted") {
      console.warn("[Firebase] Notification permission was NOT granted:", permission);
      return null;
    }

    console.log("%c[Firebase]%c Permission granted! Fetching FCM Messaging...", "color: #16a34a; font-weight: bold;", "");

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn("[Firebase] Firebase Messaging instance could not be created.");
      return null;
    }

    // Register service worker with environment variables passed as query params (no hardcoded keys in file)
    let swRegistration = null;
    if ("serviceWorker" in navigator) {
      try {
        const swParams = new URLSearchParams({
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
        });

        swRegistration = await navigator.serviceWorker.register(
          `/firebase-messaging-sw.js?${swParams.toString()}`,
          { scope: "/" }
        );
        await navigator.serviceWorker.ready;
        console.log(
          "%c[Firebase]%c Service Worker ready:",
          "color: #16a34a; font-weight: bold;",
          "",
          swRegistration.scope
        );
      } catch (swErr) {
        console.error("[Firebase] Service Worker registration failed:", swErr);
      }
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_ID?.trim();
    if (!vapidKey) {
      console.warn(
        "[Firebase] Notice: NEXT_PUBLIC_FIREBASE_VAPID_ID is empty in .env.local.\nIf getToken fails, please generate a Web Push Certificate (VAPID key) in Firebase Console -> Project Settings -> Cloud Messaging -> Web configuration, and paste it into NEXT_PUBLIC_FIREBASE_VAPID_ID in .env.local."
      );
    }

    const tokenOptions = {};
    if (vapidKey) tokenOptions.vapidKey = vapidKey;
    if (swRegistration) tokenOptions.serviceWorkerRegistration = swRegistration;

    console.log("[Firebase] Requesting FCM Token from Google servers...");
    const currentToken = await getToken(messaging, tokenOptions);

    if (currentToken) {
      console.log(
        "%c[Firebase] FCM Token Generated Successfully!%c\n",
        "background: #16a34a; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
        "color: #0f172a; font-weight: 600; font-family: monospace; display: block; margin-top: 4px;"
      );
      localStorage.setItem("fcmToken", currentToken);
      return currentToken;
    } else {
      console.warn("[Firebase] No FCM registration token available. Request permission to generate one.");
      return null;
    }
  } catch (error) {
    console.error("[Firebase] Error retrieving FCM token:", error);
    return null;
  }
};

/**
 * Listen for foreground push notifications.
 * Calls callback with payload when a message is received.
 */
export const onForegroundMessage = async (callback) => {
  if (typeof window === "undefined") return () => {};
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return () => {};

    console.log("[Firebase] Foreground notification listener registered.");

    return onMessage(messaging, (payload) => {
      console.log(
        "%c[Firebase] Foreground Push Notification Received:%c",
        "background: #0284c7; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
        "",
        payload
      );
      if (typeof callback === "function") {
        callback(payload);
      }
    });
  } catch (error) {
    console.error("[Firebase] Error setting up foreground message listener:", error);
    return () => {};
  }
};

