/* eslint-disable no-empty-pattern */
/* eslint-disable no-unused-vars */
"use client";

import { React, Suspense, useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Loader } from "@googlemaps/js-api-loader";

import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

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
  const [imageUploading, setImageUploading] = useState(false);
  const [userdata, setUserdata] = useState([]);
  const [GoogleLoading, setGoogleLoading] = useState(false);
  const [Rowdata, setRowdata] = useState([]);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [noData, setNoData] = useState(false);
  const [pridicLoading, setPridicLoading] = useState(false);
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [phoneChecked, setPhoneChecked] = useState(false);

  const handleCheckPhone = async (phone, setFieldError, setFieldTouched) => {
    if (!phone) return;
    if (phone.trim().length < 8) return;

    try {
      setPhoneChecking(true);
      const body = {
        phone: phone.trim()
      };
      const res = await postData("users/check-phone", body, header1);
      if (!res || res.success === false) {
        setPhoneChecking(false);
        setPhoneChecked(false);
        const errMsg = res?.message || "Phone already existed";
        setFieldError("phone", errMsg);
        setFieldTouched("phone", true, false);
        return;
      }
      setPhoneChecking(false);
      setPhoneChecked(true);
    } catch (error) {
      setPhoneChecking(false);
      setPhoneChecked(false);
      const errMsg = error.response?.data?.message || "Phone already existed";
      setFieldError("phone", errMsg);
      setFieldTouched("phone", true, false);
    }
  };

  const handleSearch = async (text, setFieldValue) => {
    setFieldValue("address", text);
    if (!text.trim()) {
      setPredictions([]);
      setNoData(false);
      return;
    }
    setPridicLoading(true);

    const loader = new Loader({
      apiKey: "AIzaSyCkw_MZd-894MZUR4g1_p2XohCWTSTR8S4",
      version: "weekly",
    });

    try {
      await loader.importLibrary("places");

      const autocompleteService = new google.maps.places.AutocompleteService();

      autocompleteService.getPlacePredictions(
        {
          input: text,
          componentRestrictions: { country: "KN" },
        },
        async (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            const placesService = new google.maps.places.PlacesService(
              document.createElement("div")
            );
            const detailedPredictions = await Promise.all(
              predictions.map(
                (prediction) =>
                  new Promise((resolve) => {
                    placesService.getDetails(
                      { placeId: prediction.place_id },
                      (result, detailsStatus) => {
                        if (
                          detailsStatus ===
                          google.maps.places.PlacesServiceStatus.OK
                        ) {
                          resolve({
                            description: prediction.description,
                            latLng: result.geometry.location.toJSON(),
                          });
                        } else {
                          resolve(null);
                        }
                      }
                    );
                  })
              )
            );
            setPredictions(detailedPredictions.filter((item) => item));
            setPridicLoading(false);
            setNoData(false);
          } else {
            console.error("Error fetching place predictions:", status);
            setNoData(true);
            setPridicLoading(false);
            setPredictions([]);
          }
        }
      );
    } catch (error) {
      console.error("Error importing Places API library:", error);
      setNoData(true);
      setPridicLoading(false);
      setPredictions([]);
    }
  };

  const handlePredictionPress = (prediction, setFieldValue) => {
    setFieldValue("address", prediction?.description || "");
    setPredictions([]);
    setNoData(false);
  };

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
      setImageUploading(true);
      formData.append("image", file);
      const res = await postData("image/upload", formData, header2);
      setImage(res?.image);
      setImageUploading(false);
    } catch (error) {
      setImageUploading(false);
      console.error("Error uploading image:", error);
    }
  };

  const dispatch = useDispatch();
  const api = ApiFunction();
  const { loginApi } = ApiFile;

  const [initialValues, setInitialValues] = useState({
    fullname: "",
    date: "",
    address: "",
    phone: "",
    code: "", // Referral Code
  });

  const validationSchema = Yup.object().shape({
    fullname: Yup.string().required("Full Name is required"),
    date: Yup.string().required("Date is required"),
    address: Yup.string().required("Address  is required"),
    phone: Yup.string().required("Phone  is required"),
  });

  useEffect(() => {
    let data = null;
    const row = encodedData;

    if (row) {
      data = JSON.parse(row);
      setRowdata(data);
    }

    // Load draft
    const draftStr = sessionStorage.getItem("signup_draft");
    if (draftStr) {
      try {
        const draftObj = JSON.parse(draftStr);
        setInitialValues({
          fullname: draftObj.fullname || "",
          date: draftObj.date || "",
          address: draftObj.address || "",
          phone: draftObj.phone || "",
          code: draftObj.code || "",
        });
        if (draftObj.image) {
          setImage(draftObj.image);
        }
        if (!data && (draftObj.email || draftObj.password)) {
          setRowdata({
            email: draftObj.email,
            password: draftObj.password,
            type: draftObj.type || "customer",
            fcmtoken: draftObj.fcmtoken || "",
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleBack = (values) => {
    const draft = JSON.parse(sessionStorage.getItem("signup_draft") || "{}");
    const updatedDraft = {
      ...draft,
      fullname: values.fullname,
      date: values.date,
      address: values.address,
      phone: values.phone,
      code: values.code,
      image: image,
    };
    sessionStorage.setItem("signup_draft", JSON.stringify(updatedDraft));
    router.push("/auth/stepOne");
  };

  // handle submit

  const handleSubmit = async (values, { setFieldError, setFieldTouched }) => {
    if (phoneChecking) return;

    try {
      setLoading(true);
      const body = {
        phone: values.phone.trim(),
      };
      const res = await postData("users/check-phone", body, header1);
      if (!res || res.success === false) {
        setLoading(false);
        setPhoneChecked(false);
        const errMsg = res?.message || "Phone already existed";
        setFieldError("phone", errMsg);
        setFieldTouched("phone", true, false);
        return;
      }
      setPhoneChecked(true);
    } catch (error) {
      setLoading(false);
      const errMsg = error.response?.data?.message || "Phone already existed";
      setFieldError("phone", errMsg);
      setFieldTouched("phone", true, false);
      return;
    }

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
      toast.error(error?.response?.data?.message);
      console.log("==========error: ", error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, helpers) => handleSubmit(values, helpers)}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, setFieldTouched, setFieldError }) => (
        <AuthShell
          title={
            <div className="flex items-center gap-2 -ml-2">
              <button
                type="button"
                onClick={() => handleBack(values)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span>Complete your profile</span>
            </div>
          }
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center justify-center w-full mb-6">
              <div className="relative group cursor-pointer">
                <label
                  htmlFor="file-upload"
                  className="block relative cursor-pointer rounded-full overflow-hidden border-2 border-slate-200 shadow-md hover:border-brand-500 transition-colors w-24 h-24"
                >
                  <Image
                    src={image || Image1}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      className="w-6 h-6 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                      />
                    </svg>
                  </div>
                </label>
                {imageUploading && (
                  <div className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center z-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
                  </div>
                )}
              </div>
              
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="text-center mt-2">
                <p className="text-sm font-semibold text-slate-800">
                  Profile photo (optional)
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click on the circle to upload a profile photo
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

            <div className="space-y-2 relative">
              <label htmlFor="address" className="text-sm font-medium text-slate-700">
                Address
              </label>
              <div className="relative">
                <input
                  id="address"
                  type="text"
                  name="address"
                  placeholder="Enter your address"
                  value={values.address}
                  onChange={(e) => handleSearch(e.target.value, setFieldValue)}
                  onBlur={() => {
                    setTimeout(() => {
                      setPredictions([]);
                      setNoData(false);
                    }, 200);
                    setFieldTouched("address", true);
                  }}
                  className={`block w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                    touched.address && errors.address
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                      : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
                  }`}
                  autoComplete="street-address"
                />
                {pridicLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
                  </div>
                )}
              </div>
              
              {predictions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  {predictions.map((prediction, idx) => (
                    <div
                      key={idx}
                      onClick={() => handlePredictionPress(prediction, setFieldValue)}
                      className="w-full text-left px-4 py-2.5 text-[14px] text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      {prediction.description}
                    </div>
                  ))}
                </div>
              )}
              
              {noData && (
                <div className="absolute z-50 left-0 right-0 mt-1 rounded-xl border border-slate-200 bg-white py-2.5 px-4 shadow-lg text-[14px] text-slate-500">
                  No results found
                </div>
              )}
              
              {touched.address && errors.address ? (
                <p className="text-sm leading-5 text-rose-600">{errors.address}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-slate-700">
                Phone
              </label>
              <div className="relative">
                <PhoneInput
                  country={"us"}
                  value={values.phone}
                  onChange={(val) => {
                    setFieldValue("phone", val);
                    setPhoneChecked(false);
                  }}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => {
                    setPhoneFocused(false);
                    setFieldTouched("phone", true);
                    handleCheckPhone(values.phone, setFieldError, setFieldTouched);
                  }}
                  inputStyle={{
                    width: "100%",
                    padding: "12px 16px 12px 48px",
                    borderRadius: "0.75rem",
                    border: touched.phone && errors.phone
                      ? "1px solid #fda4af"
                      : phoneFocused
                        ? "1px solid #188fe0"
                        : "1px solid #e2e8f0",
                    boxShadow: phoneFocused
                      ? touched.phone && errors.phone
                        ? "0 0 0 4px #ffe4e6"
                        : "0 0 0 4px #d7f0ff"
                      : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                    fontSize: "15px",
                    color: "#0f172a",
                    outline: "none",
                    background: "#fff",
                    height: "46px",
                    transition: "all 0.15s ease-in-out",
                  }}
                  buttonStyle={{
                    border: "none",
                    background: "transparent",
                    borderRadius: "0.75rem 0 0 0.75rem",
                    paddingLeft: "8px",
                  }}
                  dropdownStyle={{
                    borderRadius: "0.75rem",
                  }}
                  placeholder="Enter your phone number"
                />
                {phoneChecking && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
                  </div>
                )}
              </div>
              {touched.phone && errors.phone ? (
                <p className="text-sm leading-5 text-rose-600">{errors.phone}</p>
              ) : null}
            </div>

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
        </AuthShell>
      )}
    </Formik>
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
