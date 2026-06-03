/* eslint-disable no-empty-pattern */
/* eslint-disable no-unused-vars */
"use client";

import { React, Suspense, useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";

import { useDispatch } from "react-redux";
import { message } from "antd";

import ApiFile from "@/components/ApiFunction/ApiFile";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Image1, LoginImg } from "@/components/assets/Images";
import {
  AuthInlineLink,
  AuthPrimaryButton,
  AuthShell,
  AuthTextField,
} from "@/components/auth/AuthShell";

const Signup = () => {
  const searchParams = useSearchParams();
  const encodedData = searchParams.get("data");
  const { postData, header1, putData, header2, getData, header3 } =
    ApiFunction();
  const [inputType, setInputType] = useState("password");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");
  const [userdata, setUserdata] = useState([]);
  const [GoogleLoading, setGoogleLoading] = useState(false);
  const [Rowdata, setRowdata] = useState([]);

  const router = useRouter();

  const handleImageUpload = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    try {
      formData.append("image", file);
      const res = await postData("image/upload", formData, header2);
      setImage(res?.image);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const dispatch = useDispatch();
  const api = ApiFunction();
  const { loginApi } = ApiFile;

  const initialValues = {
    fullname: "",
    date: "",
    address: "",
    phone: "",
    code: "", // Referral Code
  };

  const validationSchema = Yup.object().shape({
    fullname: Yup.string().required("Full Name is required"),
    date: Yup.string().required("Date is required"),
    address: Yup.string().required("Address  is required"),
    phone: Yup.string().required("Phone  is required"),
  });

  useEffect(() => {
    const row = encodedData;

    if (row) {
      const data = JSON.parse(row);
      setRowdata(data);
    }
  }, []);

  // handle submit

  const handleSubmit = async (values) => {
    const body = {
      email: Rowdata?.email,
      type: "customer",
    };
    try {
      setLoading(true);
      const res = await postData("users/send-code", body, header1);
      const apiData = {
        ...Rowdata,
        image,
        code: res?.verificationCode,
        signupData: JSON.stringify(values),
      };

      const encodedData = encodeURIComponent(JSON.stringify(apiData));
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
      title="Complete your profile"
      subtitle="A few details to personalize your CabKn experience."
      imageSrc={LoginImg}
      imageAlt="Sign up cover"
      imageHeadline="Premium ride booking, built for comfort"
      imageSubheadline="Complete your profile to finish creating your account."
      footer={
        <span>
          Prefer to sign in? <AuthInlineLink href="/auth/login">Go to login</AuthInlineLink>
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
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image
                  src={image || Image1}
                  alt="Profile"
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] rounded-2xl border border-slate-200 object-cover shadow-sm"
                />
                <label
                  htmlFor="file-upload"
                  className="absolute -bottom-2 -right-2 inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
                >
                  Upload
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  Profile photo (optional)
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Add a photo to make your account feel more personal.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AuthTextField
                id="fullname"
                name="fullname"
                type="text"
                label="Full name"
                placeholder="Enter your full name"
                value={values.fullname}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="name"
                error={touched.fullname ? errors.fullname : ""}
              />
              <AuthTextField
                id="date"
                name="date"
                type="date"
                label="Date of birth"
                value={values.date}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="bday"
                error={touched.date ? errors.date : ""}
              />
            </div>

            <AuthTextField
              id="address"
              name="address"
              type="text"
              label="Address"
              placeholder="Enter your address"
              value={values.address}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="street-address"
              error={touched.address ? errors.address : ""}
            />

            <AuthTextField
              id="phone"
              name="phone"
              type="tel"
              label="Phone"
              placeholder="Enter your phone number"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="tel"
              inputMode="tel"
              error={touched.phone ? errors.phone : ""}
            />

            <AuthTextField
              id="code"
              name="code"
              type="text"
              label="Referral code"
              placeholder="Optional"
              value={values.code}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="off"
            />

            <AuthPrimaryButton type="submit" loading={loading}>
              Continue
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
      <Signup />
    </Suspense>
  );
};

export default page;
