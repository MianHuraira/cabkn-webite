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
  AuthSecondaryButton,
  AuthShell,
  AuthTextField,
} from "@/components/auth/AuthShell";

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
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address"
      )
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

  const loginWithGoogle = async (googleUser) => {
    const storedFcm = typeof window !== "undefined" ? localStorage.getItem("fcmToken") || "" : "";
    const apiData = {
      name: googleUser.name,
      email: googleUser.email,
      // image: googleUser.picture,
      // googleId: googleUser.id,
      fcmtoken: storedFcm,
      type: "customer",
    };

    setGoogleLoading(true);
    postData("auth/social-login", apiData, header3)
      .then((res) => {
        if (res?.token || res?.success) {
          dispatch(setUser(res));
          dispatch(setAuthenticated(true));
          localStorage.setItem("isLogin", true);
          localStorage.setItem("Cabkn-token", res?.token);
          toast.success(res?.message || "Login Successfully");
          router.push("/");
        } else {
          toast.error(res?.message || "Google login failed");
        }
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || "Google login failed");
      })
      .finally(() => {
        setGoogleLoading(false);
      });
  };

  const handleSubmit = async (values) => {
    const storedFcm = typeof window !== "undefined" ? localStorage.getItem("fcmToken") || "" : "";
    const body = {
      email: values.email.trim(),
      password: values.password,
      type: "customer",
      fcmtoken: storedFcm,
    };

    setLoading(true);
    postData("auth", body, header3)
      .then((res) => {
        if (res?.token) {
          dispatch(setUser(res));
          dispatch(setAuthenticated(true));
          localStorage.setItem("isLogin", true);
          localStorage.setItem("Cabkn-token", res?.token);
          toast.success('Login Successfully');
          router.push("/");
        } else {
          toast.error(res?.message);
        }
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || error.message || "An error occurred";
        toast.error(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Enter your email and password to access your account"
      imageSrc={otpImage}
      imageAlt="Login cover"
      imageHeadline="Track your ride in real-time"
      imageSubheadline="A smooth journey starts with a secure account."
      footer={
        <span className="font-family-regular">
          Don&apos;t have an account?{" "}
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
          <form noValidate onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
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

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end text-xs">
              <Link
                href="/auth/forgotpss"
                className="font-family-semibold text-sky-300 md:text-[#004a70] hover:text-sky-100 md:hover:text-[#003856] transition hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <AuthPrimaryButton type="submit" loading={loading}>
              Sign In
            </AuthPrimaryButton>

            {/* Custom Divider */}
            <AuthDivider label="or continue with" />

            {/* Google Login Button */}
            <AuthSecondaryButton
              onClick={googlLogin}
              disabled={GoogleLoading}
            >
              <Image src={Google} alt="Google" className="h-4 w-4 object-contain" />
              <span>{GoogleLoading ? "Signing in..." : "Sign In with Google"}</span>
            </AuthSecondaryButton>
          </form>
        )}
      </Formik>
    </AuthShell>
  );
};

export default Login;
