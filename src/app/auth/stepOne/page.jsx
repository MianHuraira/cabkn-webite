/* eslint-disable no-empty-pattern */
/* eslint-disable no-unused-vars */
"use client";
import { React, useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { message } from "antd";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import Link from "next/link";
import { Eye, EyeOff, Google, LoginImg } from "@/components/assets/Images";
import Image from "next/image";
import ApiFile from "@/components/ApiFunction/ApiFile";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { setAuthenticated, setUser } from "@/components/Redux/Slices/AuthSlice";
import { useRouter } from "next/navigation";
import {
  AuthDivider,
  AuthInlineLink,
  AuthPrimaryButton,
  AuthSecondaryButton,
  AuthShell,
  AuthTextField,
} from "@/components/auth/AuthShell";

const page = () => {
  const [inputType, setInputType] = useState("password");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userdata, setUserdata] = useState([]);
  const [GoogleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  const [profile, setProfile] = useState([]);

  const dispatch = useDispatch();
  const api = ApiFunction();
  const { postData, header3 } = ApiFunction();
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
          loginWithGoogle(res.data); // Define this function to handle user data
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
          localStorage.setItem("isLogin", true);
          localStorage.setItem("Cabkn-token", res?.token);
          message.success("Log in Sucessfully");
          setGoogleLoading(false);
        } else {
          message.error(res?.message);
          setGoogleLoading(false);
        }
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || error.message || "An error occurred";
        console.log(errorMessage);

        message.error(error);
        setGoogleLoading(false);
      });
  };

  const handleSubmit = (values) => {
    const apiData = {
      email: values?.email,
      password: values?.password,
      fcmtoken: "",
      type: "customer",
    };

    const encodedData = encodeURIComponent(JSON.stringify(apiData));
    router.push(`/auth/signup?data=${encodedData}`);
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start with your email and a secure password."
      imageSrc={LoginImg}
      imageAlt="Sign up cover"
      imageHeadline="A smarter way to get around"
      imageSubheadline="Create an account to book rides, manage trips, and track everything in one place."
      footer={
        <span>
          Already have an account?{" "}
          <AuthInlineLink href="/auth/login">Login</AuthInlineLink>
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
            <AuthTextField
              id="email"
              name="email"
              type="email"
              label="Email address"
              placeholder="name@company.com"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
              error={touched.email ? errors.email : ""}
            />

            <AuthTextField
              id="password"
              name="password"
              type={inputType}
              label="Password"
              placeholder="Create a password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="new-password"
              error={touched.password ? errors.password : ""}
              rightAdornment={
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="rounded-lg p-2 text-slate-500 transition hover:text-slate-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                >
                  <Image
                    src={passwordVisible ? Eye : EyeOff}
                    alt=""
                    className="h-5 w-5"
                  />
                </button>
              }
            />

            <div className="flex items-center justify-end">
              <AuthInlineLink
                href="/auth/forgotpss"
                className="text-sm font-semibold text-slate-700 hover:text-brand-700"
              >
                Forgot password?
              </AuthInlineLink>
            </div>

            <AuthPrimaryButton type="submit" loading={loading}>
              Continue
            </AuthPrimaryButton>

            <AuthDivider label="or continue with" />

            <AuthSecondaryButton
              type="button"
              onClick={googlLogin}
              disabled={GoogleLoading}
            >
              <Image src={Google} alt="" className="h-6 w-6" />
              {GoogleLoading ? "Signing in..." : "Google"}
            </AuthSecondaryButton>
          </form>
        )}
      </Formik>
    </AuthShell>
  );
};

export default page;
