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
import { Eye, EyeOff, Google, CarBanner, LoginImg } from "@/components/assets/Images";
import { setAuthenticated, setUser } from "@/components/Redux/Slices/AuthSlice";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  AuthDivider,
  AuthInlineLink,
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
  const [profile, setProfile] = useState([]);

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
          router.push("/");
          toast.success("Log in Sucessfully");
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
          toast.success("Log in Sucessfully");
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
      title="Login"
      subtitle="Welcome back. Sign in to continue."
      imageSrc={LoginImg}
      imageAlt="Login cover"
      footer={
        <span>
          New here? <AuthInlineLink href="/auth/stepOne">Create an account</AuthInlineLink>
        </span>
      }
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <CustomButton
              type="submit"
              loading={loading}
              variant="primary"
              className="w-full"
            >
              Sign in
            </CustomButton>

            <AuthDivider label="or continue with" />

            <CustomButton
              type="button"
              onClick={googlLogin}
              loading={GoogleLoading}
              variant="secondary"
              className="w-full !bg-white !text-slate-700 text-black border border-slate-200 hover:!bg-slate-50"
              startContent={<Image src={Google} alt="" className="h-5 w-5 mr-1" />}
            >
              {GoogleLoading ? "Signing in..." : "Google"}
            </CustomButton>
          </form>
        )}
      </Formik>
    </AuthShell>
  );
};

export default Login;
