"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiAlertTriangle } from "react-icons/fi";
import { subscribeLoginRequest } from "./ApiFunction/actionToast";

export const ACTION_TOAST_ID = "login-required-toast";

const ActionToast = () => {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = subscribeLoginRequest((message) => {
      toast.dismiss(ACTION_TOAST_ID);
      toast.custom(
        (t) => (
          <div className="!flex !items-center !gap-3 !w-[400px] sm:!w-[450px] !bg-white !rounded-2xl !px-4 !py-3.5 !shadow-[0_20px_50px_-12px_rgba(0,23,38,0.35)] !border !border-slate-200/90">
            <div className="!w-8 !h-8 !shrink-0 !rounded-full !bg-red-100 !flex !items-center !justify-center">
              <FiAlertTriangle className="!w-4 !h-4 !text-red-500" />
            </div>

            <p className="!flex-1 !min-w-0 !m-0 !text-[13px] !leading-snug !text-slate-800 !font-family-semibold">
              {message}
            </p>

            <div className="!flex !items-center !gap-2 !shrink-0">
              <button
                type="button"
                onClick={() => {
                  toast.dismiss(t.id);
                  router.push("/auth/login");
                }}
                className="!px-3 !py-1 !rounded-full !bg-green-500 hover:!bg-green-600 !text-white !font-family-semibold !text-[11.5px] !shadow-sm !transition-all !cursor-pointer !border-none !whitespace-nowrap"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => toast.dismiss(t.id)}
                className="!px-3 !py-1 !rounded-full !bg-slate-200 hover:!bg-slate-300 !text-slate-600 !font-family-medium !text-[11.5px] !transition-all !cursor-pointer !border-none !whitespace-nowrap"
              >
                Dismiss
              </button>
            </div>
          </div>
        ),
        { id: ACTION_TOAST_ID, duration: 6000, position: "top-center" }
      );
    });

    return unsubscribe;
  }, [router]);

  return null;
};

export default ActionToast;