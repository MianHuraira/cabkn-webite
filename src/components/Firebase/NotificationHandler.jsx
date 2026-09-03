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
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);

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

  // Auto-unlock audio on user interaction so browsers don't block background chimes
  useEffect(() => {
    const unlock = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }).catch(() => {});
      }

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
          audioCtxRef.current = new AudioContext();
        }
        if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }
      }

      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };

    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock);

    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  // Play notification chime sound
  const playNotificationSound = () => {
    console.log("[Notification] Triggering notification sound...");

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1.0;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("[Notification] Chime played via audio element.");
          })
          .catch((err) => {
            console.warn("[Notification] HTML5 audio blocked, attempting Web Audio synth:", err);
            playWebAudioChime();
          });
        return;
      }
    }

    playWebAudioChime();
  };

  const playWebAudioChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      let ctx = audioCtxRef.current;
      if (!ctx || ctx.state === "closed") {
        ctx = new AudioContext();
        audioCtxRef.current = ctx;
      }

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Note 1: 784 Hz (G5) Ding
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(783.99, now);
      gain1.gain.setValueAtTime(0.7, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Note 2: 1046.5 Hz (C6) Dong
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1046.5, now + 0.15);
      gain2.gain.setValueAtTime(0.75, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.7);

      console.log("[Notification] Chime played via Web Audio synthesizer.");
    } catch (e) {
      console.warn("[Notification] Web Audio chime error:", e);
    }
  };

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

  return (
    <audio
      ref={audioRef}
      src="/notification.wav"
      preload="auto"
      playsInline
      style={{ display: "none" }}
    />
  );
};

export default NotificationHandler;
