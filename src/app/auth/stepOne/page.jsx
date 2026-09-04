/* eslint-disable no-empty-pattern */
/* eslint-disable no-unused-vars */
"use client";
import { React, useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import Link from "next/link";
import { Eye, EyeOff, Google, LoginImg } from "@/components/assets/Images";
import Image from "next/image";
import ApiFile from "@/components/ApiFunction/ApiFile";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { setAuthenticated, setUser } from "@/components/Redux/Slices/AuthSlice";
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

const page = () => {
  const [inputType, setInputType] = useState("password");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userdata, setUserdata] = useState([]);
  const [GoogleLoading, setGoogleLoading] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const router = useRouter();

  const handleCheckEmail = async (email, setFieldError, setFieldTouched) => {
    if (!email) return;
    const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
    if (!isValidEmail) return;

    try {
      setEmailChecking(true);
      const body = {
        email: email.trim(),
        type: "customer"
      };
      const res = await postData("users/check-email", body, header3);
      if (!res || res.success === false) {
        setEmailChecking(false);
        setEmailChecked(false);
        const errMsg = res?.message || "Email already existed";
        setFieldError("email", errMsg);
        setFieldTouched("email", true, false);
        return;
      }
      setEmailChecking(false);
      setEmailChecked(true);
    } catch (error) {
      setEmailChecking(false);
      setEmailChecked(false);
      const errMsg = error.response?.data?.message || "Email already existed";
      setFieldError("email", errMsg);
      setFieldTouched("email", true, false);
    }
  };

  const [profile, setProfile] = useState([]);

  const dispatch = useDispatch();
  const api = ApiFunction();
  const { postData, header3 } = ApiFunction();
  const { loginApi } = ApiFile;

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    setInputType(passwordVisible ? "password" : "text");
  };

  const [initialValues, setInitialValues] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const draft = sessionStorage.getItem("signup_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setInitialValues({
          email: parsed.email || "",
          password: parsed.password || "",
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

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
    const apiData = {
      name: googleUser.name,
      email: googleUser.email,
      // image: googleUser.picture,
      // googleId: googleUser.id,
      fcmtoken: "",
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

  const handleSubmit = async (values, { setFieldError, setFieldTouched }) => {
    if (emailChecking) return;

    // Save to draft
    const draft = JSON.parse(sessionStorage.getItem("signup_draft") || "{}");
    draft.email = values.email;
    draft.password = values.password;
    sessionStorage.setItem("signup_draft", JSON.stringify(draft));

    try {
      setLoading(true);
      const body = {
        email: values.email.trim(),
        type: "customer"
      };
      const res = await postData("users/check-email", body, header3);
      if (!res || res.success === false) {
        setLoading(false);
        setEmailChecked(false);
        const errMsg = res?.message || "Email already existed";
        setFieldError("email", errMsg);
        setFieldTouched("email", true, false);
        return;
      }
      setEmailChecked(true);
    } catch (error) {
      setLoading(false);
      const errMsg = error.response?.data?.message || "Email already existed";
      setFieldError("email", errMsg);
      setFieldTouched("email", true, false);
      return;
    }

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
      reverseLayout={true}
      title="Create your account"
      subtitle="Start with your email and a secure password."
      imageSrc={LoginImg}
      imageAlt="Sign up cover"
      imageHeadline="A smarter way to get around"
      imageSubheadline="Create an account to book rides, manage trips, and track everything in one place."
      footer={
        <span className="font-family-regular">
          Already have an account?{" "}
          <AuthInlineLink href="/auth/login">Login</AuthInlineLink>
        </span>
      }
    >
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, helpers) => handleSubmit(values, helpers)}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldError, setFieldTouched }) => (
          <form noValidate onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            <AuthTextField
              id="email"
              name="email"
              type="email"
              label="Email address"
              placeholder="name@company.com"
              value={values.email}
              onChange={(e) => {
                handleChange(e);
                setEmailChecked(false);
              }}
              onBlur={(e) => {
                handleBlur(e);
                handleCheckEmail(values.email, setFieldError, setFieldTouched);
              }}
              autoComplete="email"
              error={touched.email ? errors.email : ""}
              rightAdornment={
                emailChecking ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
                ) : null
              }
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

            <div className="flex items-center justify-end">
              <AuthInlineLink
                href="/auth/forgotpss"
                className="text-xs font-family-semibold text-[#004a70] hover:text-[#003856]"
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
              loading={GoogleLoading}
            >
              {!GoogleLoading && (
                <Image src={Google} alt="Google" className="h-4 w-4 object-contain" />
              )}
              <span>{GoogleLoading ? "Signing in..." : "Sign In with Google"}</span>
            </AuthSecondaryButton>
          </form>
        )}
      </Formik>
    </AuthShell>
  );
};

export default page;
