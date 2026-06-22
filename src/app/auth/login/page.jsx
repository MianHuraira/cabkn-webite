/* eslint-disable no-empty-pattern */
/* eslint-disable no-unused-vars */
"use client";

import { React, useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useApi } from "@/components/ApiFunction/ApiFunction";
import ApiFile from "@/components/ApiFunction/ApiFile";
import Link from "next/link";
import { Eye, EyeOff, Google, otpImage } from "@/components/assets/Images";
import { setAuthenticated, setUser } from "@/components/Redux/Slices/AuthSlice";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  AuthDivider,
  AuthInlineLink,
  AuthPrimaryButton,
  AuthShell,
  AuthTextField,
} from "@/components/auth/AuthShell";
import CustomButton from "@/components/CustomButton";

const Login = () => {
  const router = useRouter();
  const [inputType, setInputType] = useState("password");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userdata, setUserdata] = useState([]);
  const [GoogleLoading, setGoogleLoading] = useState(false);

  const dispatch = useDispatch();
  const { postData, header3 } = useApi();
  const { loginApi } = ApiFile;

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    setInputType(passwordVisible ? "password" : "text");
  };

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .trim()
      .email("Invalid email")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters"),
  });

  const googlLogin = useGoogleLogin({
    onSuccess: (codeResponse) => setUserdata(codeResponse),
    onError: (error) => console.log("Login Failed:", error),
  });

  useEffect(() => {
    if (userdata && userdata.access_token) {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${userdata.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${userdata.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          loginWithGoogle(res.data);
        })
        .catch((err) => console.log("Error fetching user info:", err));
    }
  }, [userdata]);

  const loginWithGoogle = (user) => {
    setGoogleLoading(true);
    const body = {
      name: user?.given_name + " " + user?.family_name,
      email: user?.email,
      type: "customer",
    };

    postData("auth/social-login", body, header3)
      .then((res) => {
        if (res?.success) {
          dispatch(setUser(res));
          dispatch(setAuthenticated(true));
          router.push("/");
          toast.success("Log in Successfully");
          setGoogleLoading(false);
        } else {
          toast.error(res?.message);
          setGoogleLoading(false);
        }
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || error.message || "An error occurred";
        toast.error(errorMessage);
        setGoogleLoading(false);
      });
  };

  const handleSubmit = (values) => {
    setLoading(true);
    const apiSendCode = loginApi;
    const apiData = {
      email: values?.email,
      password: values?.password,
      fcmtoken: "",
      type: "customer",
    };
    postData(apiSendCode, apiData, header3)
      .then((res) => {
        if (res?.success) {
          dispatch(setUser(res));
          dispatch(setAuthenticated(true));
          localStorage.setItem("isLogin", true);
          localStorage.setItem("Cabkn-token", res?.token);
          router.push("/");
          toast.success("Log in Successfully");
        } else {
          toast.error(res?.message);
        }
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <AuthShell
      title="Welcome Back"
      isShow={true}
      subtitle="Enter your email and password to access your account"
      imageSrc={otpImage}
      imageAlt="Premium Ride Booking"
      footer={
        <span className="font-family-regular">
          Don't have an account?{" "}
          <AuthInlineLink href="/auth/stepOne">Sign Up</AuthInlineLink>
        </span>
      }
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <AuthTextField
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
              error={touched.email ? errors.email : ""}
            />

            {/* Password Input */}
            <AuthTextField
              id="password"
              name="password"
              type={inputType}
              label="Password"
              placeholder="Enter your password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="current-password"
              error={touched.password ? errors.password : ""}
              rightAdornment={
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="rounded-lg p-2 text-slate-400 hover:text-slate-600 transition focus:outline-none"
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                >
                  <Image
                    src={passwordVisible ? Eye : EyeOff}
                    alt=""
                    className="h-5 w-5 opacity-70"
                  />
                </button>
              }
            />

            {/* Checkbox and Forgot Password Link */}
            <div className="flex items-center justify-between text-xs lg:text-sm mt-3 pt-1">
              <label className="flex items-center gap-2 text-slate-500 hover:text-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-slate-400 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                />
<span className="font-family-semibold font-bold text-slate-500 hover:text-slate-700 transition">
  Remember me
</span>
              </label>
              <Link
                href="/auth/forgotpss"
                className="font-family-semibold font-bold text-brand-600 hover:text-brand-800 transition hover:underline"
              >
                Forgot Password
              </Link>
            </div>

            {/* Submit Button */}
            <AuthPrimaryButton type="submit" loading={loading}>
              Sign In
            </AuthPrimaryButton>

            {/* Custom Divider */}
            <AuthDivider label="or continue with" />

            {/* Google Login Button */}
            <CustomButton
              type="button"
              onClick={googlLogin}
              loading={GoogleLoading}
              variant="secondary"
              className="w-full flex !bg-white !text-slate-700 text-black border border-slate-200 hover:!bg-slate-50"
              startContent={<Image src={Google} alt="" className="h-5 w-5 mr-1" />}
            >

              <span className="font-family-regular">Sign In with Google</span>
            </CustomButton>
          </form>
        )}
      </Formik>
    </AuthShell>
  );
};

export default Login;
