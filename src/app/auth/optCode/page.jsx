"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { otpImage } from "@/components/assets/Images";
import { setAuthenticated, setUser } from "@/components/Redux/Slices/AuthSlice";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { IoChevronBack } from "react-icons/io5";
import { AuthPrimaryButton, AuthShell } from "@/components/auth/AuthShell";

const Otp = () => {
  const searchParams = useSearchParams();
  const encodedData = searchParams.get("data");
  const { postData, header1 } = ApiFunction();
  const [code, setCode] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(20);
  const [timerActive, setTimerActive] = useState(true);
  const [Image, setImage] = useState(false);
  const [SginUpdata, setSginUpdata] = useState([]);

  const [Loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const dispatch = useDispatch();
  const [rowdata, setRowdata] = useState("");
  const router = useRouter();
  const [Alldata, setAlldata] = useState([]);

  const otpComplete = code.every((d) => String(d || "").trim().length === 1);

  const focusFirstEmptyOtp = () => {
    const firstEmptyIndex = code.findIndex((d) => !String(d || "").trim());
    const indexToFocus = firstEmptyIndex >= 0 ? firstEmptyIndex : 0;
    document.getElementById(`otp-${indexToFocus}`)?.focus();
  };

  const handleInputChange = (index, value) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    // Auto-advance to next field when a digit is entered
    if (digit && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newCode = [...code];
      if (newCode[index]) {
        // Current field has value — clear it
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        // Current field is empty — move back and clear previous
        newCode[index - 1] = "";
        setCode(newCode);
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
    }
    if (e.key === "Enter") {
      e.preventDefault();
      attemptVerify();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.slice(0, 4).split("");
    const newCode = ["", "", "", ""];
    for (let i = 0; i < 4; i += 1) newCode[i] = next[i] || "";
    setCode(newCode);
    const lastIndex = Math.min(next.length, 4) - 1;
    if (lastIndex >= 0) {
      document.getElementById(`otp-${lastIndex}`)?.focus();
    }
  };

  useEffect(() => {
    if (!encodedData) {
      console.error("No data found for parsing.");
      return;
    }
    try {
      const navData = JSON.parse(encodedData);
      setRowdata(navData);
      setImage(navData?.image);

      if (navData?.signupData) {
        const preData = JSON.parse(navData.signupData);
        setSginUpdata(preData);
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  }, []);

  useEffect(() => {
    if (!timerActive) return;
    if (timer === 0) {
      setTimerActive(false);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, timerActive]);

  const handleResend = async () => {
    if (timerActive || Loading || resendLoading) return;
    try {
      setResendLoading(true);
      const body = {
        email: rowdata?.email,
        type: "customer",
      };
      const isForgot = rowdata?.isForgot == "true";
      const url = isForgot ? "users/forget-password" : "users/send-code";
      const res = await postData(url, body, header1);
      if (res?.success !== false) {
        if (isForgot && res?.token) {
          setRowdata((prev) => ({ ...prev, token: res.token }));
        }
        toast.success(res?.message || "Verification code resent!");
        setCode(["", "", "", ""]);
        setTimer(30);
        setTimerActive(true);
        document.getElementById("otp-0")?.focus();
      } else {
        toast.error(res?.message || "Failed to resend code.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setResendLoading(false);
    }
  };

  const handlePass = () => {
    if (rowdata?.isForgot == "true") {
      Fogotpassword();
    } else {
      handleSubmit();
    }
  };

  const attemptVerify = () => {
    if (Loading || resendLoading) return;
    if (!otpComplete) {
      toast.error("Please enter the complete 4-digit verification code.");
      focusFirstEmptyOtp();
      return;
    }
    handlePass();
  };

  const Fogotpassword = () => {
    setLoading(true);
    const codeString = code.join(""); // Combine the array into a single string
    let data = {
      token: rowdata?.token,
      code: codeString,
    };
    postData("users/verify-otp/forget-password", data, header1)
      .then((res) => {
        if (res?.success) {
          const resData = {
            code: codeString,
            token: rowdata?.token,
          };

          const encodedData = encodeURIComponent(JSON.stringify(resData));
          router.push(`/auth/resetPass?data=${encodedData}`);
          toast.success(res?.message || "Verification successful!");
        } else {
          toast.error(res?.message || res?.response?.data?.message || "Verification failed");
        }
      })
      .catch((error) => {
        const errorMsg = error?.response?.data?.message || error?.message || "Verification failed!";
        toast.error(errorMsg);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = async () => {
    const codeString = code.join("");
    setLoading(true);
    const rawPhone = SginUpdata?.phone ? String(SginUpdata.phone).trim() : "";
    const formattedPhone = rawPhone ? (rawPhone.startsWith("+") ? rawPhone : `+${rawPhone}`) : "";
    const apiData = {
      name: SginUpdata?.fullname,
      password: rowdata?.password,
      email: rowdata?.email,
      dob: SginUpdata?.date,
      phone: formattedPhone,
      gender: SginUpdata?.gender,
      image: Image,
      code: codeString,
      address: SginUpdata?.address,
      fcmtoken: "",
    };

    postData("users/signup/customer", apiData, header1)
      .then((res) => {
        if (res?.success) {
          sessionStorage.removeItem("signup_draft");
          dispatch(setUser(res));
          dispatch(setAuthenticated(true));
          localStorage.setItem("isLogin", true);
          localStorage.setItem("Cabkn-token", res?.token);
          toast.success(res?.message || "Sign up successful! Redirecting...");
          router.push("/");
        } else {
          toast.error(res?.message || res?.response?.data?.message || "Signup failed!");
        }
      })
      .catch((error) => {
        const errorMsg = error?.response?.data?.message || error?.message || "Signup failed!";
        toast.error(errorMsg);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleBack = () => {
    if (rowdata?.isForgot !== "true" && encodedData) {
      router.push(`/auth/signup?data=${encodeURIComponent(encodedData)}`);
    } else if (rowdata?.isForgot == "true") {
      router.push("/auth/forgotpss");
    } else if (rowdata?.isLogin == "true") {
      router.push("/auth/login");
    } else {
      router.push("/auth/signup");
    }
  };

  return (
    <AuthShell
      onBack={handleBack}
      title="Verification Code"
      subtitle={
        rowdata?.email ? (
          <span>
            Enter the 4-digit code sent to{" "}
            <span className="font-family-semibold text-white md:text-slate-700 block mt-0.5 truncate max-w-[280px] mx-auto">
              {rowdata.email}
            </span>
          </span>
        ) : (
          "Enter the 4-digit code we sent you to continue."
        )
      }
    >
      <div className="space-y-4">
        {/* Square OTP Inputs */}
        <div
          className="flex items-center justify-center gap-3 py-1"
          onPaste={handlePaste}
          role="group"
          aria-label="One-time password"
        >
          {code.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`h-12 w-12 sm:h-13 sm:w-13 text-center text-xl font-family-semibold rounded-xl !border transition-all duration-200 outline-none shadow-sm !text-white md:!text-slate-900 bg-transparent caret-white md:caret-slate-900 ${
                digit
                  ? "border-white md:border-[#004a70] md:bg-[#004a70]/5 shadow-md ring-2 ring-white/30 md:ring-[#004a70]/20"
                  : "border-white/40 md:border-gray-200 md:bg-white hover:border-white/60 md:hover:border-gray-300 focus:border-white md:focus:border-[#004a70] focus:ring-2 focus:ring-white/30 md:focus:ring-[#004a70]/20"
              }`}
              aria-label={`Digit ${index + 1}`}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <AuthPrimaryButton
            type="button"
            onClick={attemptVerify}
            loading={Loading}
            disabled={!otpComplete || Loading || resendLoading}
          >
            {rowdata?.isForgot == "true"
              ? "Verify & Reset Password"
              : "Verify & Create Account"}
          </AuthPrimaryButton>
        </div>

        {/* Resend Countdown / Link with inline spinner */}
        <div className="text-center pt-1">
          <p className="font-family-regular text-xs text-white/80 md:text-slate-500">
            Didn&apos;t get a code?{" "}
            {timer === 0 ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={Loading || resendLoading}
                className="font-family-semibold text-sky-300 md:text-[#004a70] hover:text-sky-100 md:hover:text-[#003856] hover:underline cursor-pointer bg-transparent border-none p-0 transition-colors disabled:opacity-60 inline-flex items-center gap-1.5 ml-1"
              >
                {resendLoading ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Resending...</span>
                  </>
                ) : (
                  <span>Resend code</span>
                )}
              </button>
            ) : (
              <span className="text-white/60 md:text-slate-400 font-family-medium">
                Resend in <span className="text-sky-300 md:text-[#004a70] font-family-semibold">{timer}s</span>
              </span>
            )}
          </p>
        </div>
      </div>
    </AuthShell>
  );
};

const page = () => {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-white">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
        </div>
      }
    >
      <Otp />
    </Suspense>
  );
};

export default page;
