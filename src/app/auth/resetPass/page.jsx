/* eslint-disable no-empty-pattern */
/* eslint-disable no-unused-vars */
"use client";

import { React, Suspense, useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";

import { useRouter, useSearchParams } from "next/navigation";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import ApiFile from "@/components/ApiFunction/ApiFile";
import { Eye, EyeOff, forgotpass } from "@/components/assets/Images";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  AuthInlineLink,
  AuthPrimaryButton,
  AuthShell,
  AuthTextField,
} from "@/components/auth/AuthShell";

const Reset = () => {
  const searchParams = useSearchParams();
  const encodedData = searchParams.get("data");

  const [loading, setLoading] = useState(false);
  const [Rowdata, setRowdata] = useState("");
  const router = useRouter();
  const [inputType, setInputType] = useState("password");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [inputType1, setInputType1] = useState("password");
  const [passwordVisible1, setPasswordVisible1] = useState(false);

  const dispatch = useDispatch();
  const api = ApiFunction();
  const { putData } = api;
  const { loginApi } = ApiFile;
  const initialValues = {
    npassword: "",
    cpassword: "",
  };

  const validationSchema = Yup.object().shape({
    npassword: Yup.string().required("Passowrd is required"),
    cpassword: Yup.string()
      .required("Confirm Password is required")
      .oneOf([Yup.ref("npassword")], "Passwords must match"),
  });

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    setInputType(passwordVisible ? "password" : "text");
  };

  const togglePasswordVisibility1 = () => {
    setPasswordVisible1(!passwordVisible1);
    setInputType1(passwordVisible1 ? "password" : "text");
  };

  useEffect(() => {
    if (!encodedData) return;
    try {
      const row = JSON.parse(encodedData);
      setRowdata(row);
    } catch (e) {
      setRowdata("");
    }
  }, [encodedData]);

  const handleSubmit = async (values) => {
    const body = {
      password: values.npassword,
      code: Rowdata?.code,
      token: Rowdata?.token,
    };

    const headers = {
      "x-auth-token": Rowdata?.token,
    };

    try {
      setLoading(true);
      const res = await putData("users/update-password", body, headers);
      if (res?.success) {
        toast.success(res?.message || "Password updated successfully");
        router.push("/auth/login");
      } else {
        toast.error(res?.message || "Failed to update password");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
      console.log("==========error: ", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password to secure your account."
      imageSrc={forgotpass}
      imageAlt="Reset password cover"
      imageHeadline="Your security matters"
      imageSubheadline="Update your password and get back to booking rides in minutes."
      footer={
        <span>
          <AuthInlineLink href="/auth/login">Back to login</AuthInlineLink>
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
              id="npassword"
              name="npassword"
              type={inputType}
              label="New password"
              placeholder="Create a new password"
              value={values.npassword}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="new-password"
              error={touched.npassword ? errors.npassword : ""}
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

            <AuthTextField
              id="cpassword"
              name="cpassword"
              type={inputType1}
              label="Confirm password"
              placeholder="Re-enter your new password"
              value={values.cpassword}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="new-password"
              error={touched.cpassword ? errors.cpassword : ""}
              rightAdornment={
                <button
                  type="button"
                  onClick={togglePasswordVisibility1}
                  className="rounded-lg p-2 text-slate-500 transition hover:text-slate-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
                  aria-label={passwordVisible1 ? "Hide password" : "Show password"}
                >
                  <Image
                    src={passwordVisible1 ? Eye : EyeOff}
                    alt=""
                    className="h-5 w-5"
                  />
                </button>
              }
            />

            <AuthPrimaryButton type="submit" loading={loading}>
              Update password
            </AuthPrimaryButton>
          </form>
        )}
      </Formik>
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
      <Reset />
    </Suspense>
  );
};

export default page;
