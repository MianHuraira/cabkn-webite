/* eslint-disable no-empty-pattern */
/* eslint-disable no-unused-vars */
"use client";

import { React, useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { message } from "antd";
import axios from "axios";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import ApiFile from "@/components/ApiFunction/ApiFile";
import { forgotpass } from "@/components/assets/Images";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AuthInlineLink,
  AuthPrimaryButton,
  AuthShell,
  AuthTextField,
} from "@/components/auth/AuthShell";

const page = () => {
  const [loading, setLoading] = useState(false); 
  const router = useRouter();
  const dispatch = useDispatch();
  const api = ApiFunction();
  const { postData, header3, header1 } = api;
  const { loginApi } = ApiFile;
  const initialValues = {
    email: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .trim()
      .email("Invalid email")
      .required("Email is required"),
  });

   const handleSubmit = async (values) => {
     const body = {
       email: values?.email,
       type: "customer",
     };
     try {
       setLoading(true);
       const res = await postData("users/forget-password", body, header1);
       const resData = {
           token : res?.token,
          isForgot: "true",
       }

       const encodedData = encodeURIComponent(JSON.stringify(resData));
       router.push(`/auth/optCode?data=${encodedData}`);
  
       setLoading(false);
     } catch (error) {
       setLoading(false);
       message.error(error?.response?.data?.message);
       console.log("==========error: ", error?.response?.data?.message);
     } finally {
       setLoading(false);
     }
   };
  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter your email and we’ll send a verification code to reset your password."
      imageSrc={forgotpass}
      imageAlt="Forgot password cover"
      imageHeadline="Secure account recovery"
      imageSubheadline="We’ll guide you through a quick, secure reset flow."
      footer={
        <span>
          Remembered it? <AuthInlineLink href="/auth/login">Back to login</AuthInlineLink>
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

            <AuthPrimaryButton type="submit" loading={loading}>
              Send code
            </AuthPrimaryButton>
          </form>
        )}
      </Formik>
    </AuthShell>
  );
};

export default page;
