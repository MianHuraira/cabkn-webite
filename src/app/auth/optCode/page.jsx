"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { message } from "antd";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { otpImage } from "@/components/assets/Images";
import { setAuthenticated, setUser } from "@/components/Redux/Slices/AuthSlice";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AuthPrimaryButton,
  AuthShell,
} from "@/components/auth/AuthShell";

const Otp =() =>{

  const searchParams = useSearchParams();
  const encodedData = searchParams.get("data");
  const { postData, header1 } = ApiFunction();
  const [code, setCode] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(20);
  const [Image, setImage] = useState(false);
  const [SginUpdata, setSginUpdata] = useState([]);

  const [Loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [rowdata, setRowdata] = useState("");
  const router = useRouter();
  const [Alldata, setAlldata] = useState([]);

  const handleInputChange = (index, value) => {
    const next = value.replace(/\D/g, "").slice(0, 1);
    const newCode = [...code];
    newCode[index] = next;
    setCode(newCode);
    if (next && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
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
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePass = () => {
    if (rowdata?.isForgot == "true") {
      Fogotpassword();
    } else {
      handleSubmit();
    }
  };

  const Fogotpassword = () => {
    console.log("ersr");

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
          message.success(res?.message);
        } else {
          message.error(res?.message);
        }
      })
      .catch((error) => {
        message.error(error?.response?.data?.message || "Signup failed!");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = async () => {
    const codeString = code.join("");
    setLoading(true);
    const apiData = {
      name: SginUpdata?.fullname,
      password: rowdata?.password,
      email: rowdata?.email,
      dob: SginUpdata?.date,
      phone: SginUpdata?.phone,
      gender: SginUpdata?.gender,
      image: Image,
      code: codeString,
      address: SginUpdata?.address,
    };

    postData("users/signup/customer", apiData, header1)
      .then((res) => {
        if (res?.success) {
          dispatch(setUser(res));
          dispatch(setAuthenticated(true));
          localStorage.setItem("isLogin", true);
          localStorage.setItem("Cabkn-token", res?.token);
          message.success("Sign up successful! Redirecting...");
          router.push('/')
        } else {
          message.error(res?.message);
        }
      })
      .catch((error) => {
        message.error(error?.response?.data?.message || "Signup failed!");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <AuthShell
      title="Verification code"
      subtitle="Enter the 4‑digit code we sent you to continue."
      imageSrc={otpImage}
      imageAlt="OTP cover"
      imageHeadline="Track your ride in real-time"
      imageSubheadline="A smooth journey starts with a secure account."
    >
      <div className="space-y-5">
        <div
          className="grid grid-cols-4 gap-3"
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
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white text-center text-xl font-semibold text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              aria-label={`Digit ${index + 1}`}
              autoFocus={index === 0}
            />
          ))}
        </div>

        <AuthPrimaryButton type="button" onClick={handlePass} loading={Loading}>
          {rowdata?.isForgot == "true" ? "Verify & reset" : "Verify & sign up"}
        </AuthPrimaryButton>

        <p className="text-sm text-slate-600">
          Didn’t get a code?{" "}
          <span className="font-semibold text-brand-700">{`Resend in 0:${timer
            .toString()
            .padStart(2, "0")}`}</span>
        </p>
      </div>
    </AuthShell>
  );
}


const page = () =>{
   return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-white">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
        </div>
      }
    >
        <Otp/>
      </Suspense>
   )
   
}


export default page; 
