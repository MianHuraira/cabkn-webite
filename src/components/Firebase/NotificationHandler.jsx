"use client";

import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { requestNotificationPermission, onForegroundMessage } from "@/utils/firebase";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { playNotificationSound, initAudioUnlock } from "@/utils/notificationSound";
import { FaBell } from "react-icons/fa";

const NotificationHandler = () => {
  const { header1, putData } = ApiFunction();
  const userData = useSelector((state) => state.auth?.user?.user);
  const tokenSyncedRef = useRef(false);

  useEffect(() => {
    initAudioUnlock();

    // Global event listener so any component or socket can trigger notification audio
    const handleSoundEvent = () => {
      playNotificationSound();
    };
    window.addEventListener("cabkn-play-notification-sound", handleSoundEvent);
    return () => {
      window.removeEventListener("cabkn-play-notification-sound", handleSoundEvent);
    };
  }, []);

  useEffect(() => {
    // Listen for foreground push messages
    let unsubscribe = () => {};

    const setupListener = async () => {
      unsubscribe = await onForegroundMessage((payload) => {
        const title = payload?.notification?.title || payload?.data?.title || "New Notification";
        const body = payload?.notification?.body || payload?.data?.body || "";

        // Play audio chime on notification arrival
        playNotificationSound();

        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 !p-4 border border-slate-100 cursor-pointer transition-all hover:shadow-2xl`}
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
