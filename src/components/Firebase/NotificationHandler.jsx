"use client";

import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { requestNotificationPermission, onForegroundMessage } from "@/utils/firebase";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { FaBell } from "react-icons/fa";

const NotificationHandler = () => {
  const { header1, putData } = ApiFunction();
  const userData = useSelector((state) => state.auth?.user?.user);
  const tokenSyncedRef = useRef(false);

  useEffect(() => {
    console.log(
      "%c[Firebase NotificationHandler]%c Handler initialized.",
      "background: #ff9800; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
      "color: #ff9800; font-weight: bold;"
    );

    const initPushNotifications = async () => {
      try {
        const token = await requestNotificationPermission();
        if (token) {
          console.log("[Firebase] Device is ready to receive notifications with token:", token.substring(0, 20) + "...");
          
          if (userData?._id && !tokenSyncedRef.current) {
            const lastSyncedToken = localStorage.getItem("lastSyncedFcmToken");
            if (lastSyncedToken !== token) {
              console.log("[Firebase] Syncing FCM token with server for user ID:", userData._id);
              const res = await putData(
                "/users/update-user",
                { fcmtoken: token },
                header1
              );
              console.log("%c[Firebase] Server sync response:%c", "color: #16a34a; font-weight: bold;", "", res);
              if (res?.message || res?.success) {
                localStorage.setItem("lastSyncedFcmToken", token);
                tokenSyncedRef.current = true;
              }
            } else {
              console.log("[Firebase] FCM token is already synced with backend.");
              tokenSyncedRef.current = true;
            }
          }
        }
      } catch (err) {
        console.warn("[Firebase] Notification initialization error:", err);
      }
    };

    initPushNotifications();
  }, [userData?._id]);

  useEffect(() => {
    // Listen for foreground push messages
    let unsubscribe = () => {};

    const setupListener = async () => {
      unsubscribe = await onForegroundMessage((payload) => {
        const title = payload?.notification?.title || payload?.data?.title || "New Notification";
        const body = payload?.notification?.body || payload?.data?.body || "";

        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 p-4 border border-slate-100 cursor-pointer transition-all hover:shadow-2xl`}
              onClick={() => {
                toast.dismiss(t.id);
                const clickUrl = payload?.data?.url || payload?.data?.click_action || "/admin";
                if (typeof window !== "undefined") {
                  window.location.href = clickUrl;
                }
              }}
            >
              <div className="flex-1 w-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-50 text-[#004a70] flex items-center justify-center shrink-0">
                  <FaBell size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-family-semibold text-slate-900 truncate !m-0">
                    {title}
                  </p>
                  <p className="text-[11px] text-slate-500 font-family-regular mt-0.5 line-clamp-2 !m-0">
                    {body}
                  </p>
                </div>
              </div>
              <div className="flex border-l border-slate-100 pl-3 ml-3 items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss(t.id);
                  }}
                  className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center text-xs font-family-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          ),
          { duration: 5000 }
        );
      });
    };

    setupListener();

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  return null;
};

export default NotificationHandler;
