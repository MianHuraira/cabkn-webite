"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { message } from "antd";
import { Spinner } from "react-bootstrap";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { otpImage } from "@/components/assets/Images";
import { setAuthenticated, setUser } from "@/components/Redux/Slices/AuthSlice";
import { useRouter, useSearchParams } from "next/navigation";

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
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 3) {
        document.getElementById(`input-${index + 1}`).focus();
      }
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
      <div className="flex min-h-screen">
      {/* Left Section */}
      <div
        className="flex-1 bg-cover bg-center d-none d-sm-block"
        style={{
          backgroundImage: `url(${otpImage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="bg-black bg-opacity-50 text-white flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-bold mb-4">
              Track your ride in real-time for a smooth journey
            </h1>
            <p className="text-lg">We Give Better Services To You.</p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="max-w-sm w-full px-6">
          <h2 className="text-2xl font-Bold mb-4 ">Verification code</h2>
          <p className="text-sm text-gray-500 mb-6 font-medium">
            We just sent you a verification code to your phone. Check your inbox
            to get it.
          </p>

          {/* Input Boxes */}
          <div className="flex justify-between mb-6 mt-6">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`input-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="w-14 h-14 border-2 border-gray-300 rounded-md text-center text-xl focus:outline-none focus:border-blue-500"
              />
            ))}
          </div>

          <button
            type="submit"
            onClick={handlePass}
            disabled={Loading}
            className={`w-full loginBtn mt-3 ${Loading ? "disablbtn" : ""}`}
          >
            {Loading ? (
              <Spinner
                animation="border"
                size="sm"
                className="me-2"
                style={{ width: "1.2rem", height: "1.2rem" }}
              />
            ) : (
              <>{rowdata?.isForgot == "true" ? "Reset" : "Sign Up"}</>
            )}
          </button>

          <p className="text-sm font-Regular text-gray-500 mt-4">
            Re-send code in{" "}
            <span className="text-blue-500  font-Regular">{`0:${timer
              .toString()
              .padStart(2, "0")}`}</span>
          </p>
        </div>
      </div>
    </div>
  );
}


const page = () =>{
   return (
    <Suspense fallback={<Spinner animation="border" />}>
        <Otp/>
      </Suspense>
   )
   
}


export default page; 