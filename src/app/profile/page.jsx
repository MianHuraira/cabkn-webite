"use client";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Form, ListGroup, ListGroupItem } from "react-bootstrap";
import { FormFeedback, Input, Label, Spinner } from "reactstrap";
import ChangePassword from "./ChangePassword";
import HelpCenter from "./HelpCenter";
import { Loader } from "@googlemaps/js-api-loader";
import mapboxgl from "mapbox-gl";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { message } from "antd";

import Policy from "./Policy";
import Terms from "./Terms";
import { FaUser, FaUserCircle, FaLock, FaGift, FaHeadset, FaShieldAlt, FaFileContract } from "react-icons/fa";
import Referrals from "./Referrals";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { setUser } from "@/components/Redux/Slices/AuthSlice";
import CustomButton from "@/components/CustomButton";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  phone: yup.string().required("Phone is required"),
  email: yup.string().required("Email is required"),
  address: yup.string().required("Address is required"),
});

const tabs = [
  { key: "personalData", label: "Personal Data", icon: <FaUserCircle size={18} /> },
  { key: "changePassword", label: "Change Password", icon: <FaLock size={16} /> },
  { key: "Referrals", label: "Referrals", icon: <FaGift size={16} /> },
  { key: "helpCenter", label: "Help Center", icon: <FaHeadset size={16} /> },
  { key: "privacyPolicy", label: "Privacy & Policy", icon: <FaShieldAlt size={16} /> },
  { key: "termsConditions", label: "Terms & Conditions", icon: <FaFileContract size={16} /> },
];

export default function EditProfile() {
  const { postData, header1, putData, header2, getData, userData } =
    ApiFunction();
  const [isLoading, setisLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personalData");
  const [predictions, setPredictions] = useState([]);
  const [noData, setNoData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [PridicLoading, setPridicLoading] = useState(false);
  const [locationDetails, setLocationDetails] = useState({
    address: "",
    lat: null,
    lng: null,
  });
  const dispatch = useDispatch();


  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setSearchQuery(userData?.user?.address);
  }, []);

  const [image, setImage] = useState(userData?.user?.image || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
      setIsUploadingImage(true);
      formData.append("image", file);
      const res = await postData("image/upload", formData, header2);
      setImage(res?.image);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: userData?.user?.name,
      phone: userData?.user?.phone,
      email: userData?.user?.email,
      address: userData?.user?.address,
    },
  });

  const onSubmit = async (data) => {
    setisLoading(true);
    try {
      let body = {
        name: data?.name,
        email: data?.email,
        address: searchQuery,
        image: image,
      };
      const res = await putData("users/update-user", body, header1);
      if (res?.success) {
        setisLoading(false);
        getProfile();
        message.success(res?.message || "Profile updated successfully");
      } else {
        setisLoading(false);
        message.error(res?.message || "Failed to update profile");
      }
    } catch (error) {
      setisLoading(false);
      message.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const getProfile = async () => {
    try {
      const response = await getData("/users/me", header1);
      const responseBody = {
        token: userData?.token,
        success: true,
        newUser: false,
        user: response?.user,
      };
      dispatch(setUser(responseBody));
    } catch (error) { }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
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
          }
          setPridicLoading(false);
        }
      );
    } catch (error) {
      console.error("Error importing Places API library:", error);
      setNoData(true);
      setPridicLoading(false);
    }
  };

  const handlePredictionPress = (prediction) => {
    setLocationDetails({
      address: prediction?.description || "",
      lat: prediction?.latLng?.lat || 0,
      lng: prediction?.latLng?.lng || 0,
    });
    setValue("address", prediction?.description || "");
    setSearchQuery(prediction.description);
    setPredictions([]);
    setNoData(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "personalData":
        return (
          <div>
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #f0f0f0",
                padding: 28,
              }}
            >
              {/* Profile Image */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  marginBottom: 28,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "3px solid #e5e7eb",
                    cursor: isUploadingImage ? "not-allowed" : "pointer",
                    flexShrink: 0,
                  }}
                  onClick={() =>
                    !isUploadingImage && document.getElementById("file-upload-profile").click()
                  }
                >
                  {mounted && image ? (
                    <img
                      src={image}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: "#f0f7ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaUser size={32} color="#004a70" />
                    </div>
                  )}
                  {isUploadingImage && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                      }}
                    >
                      <Spinner
                        size="sm"
                        color="light"
                        style={{ width: "1.5rem", height: "1.5rem" }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <h5
                    className="font-family-semibold"
                    style={{
                      fontSize: 18,
                      color: "#1f2937",
                      margin: 0,
                    }}
                  >
                    {mounted ? (userData?.user?.name || "Your Name") : "Your Name"}
                  </h5>
                  <span
                    className="font-family-regular"
                    style={{
                      fontSize: 13,
                      color: "#6b7280",
                      margin: "4px 0 0",
                    }}
                  >
                    {mounted ? (userData?.user?.email || "email@example.com") : "email@example.com"}
                  </span>
                  <br />
                  <button
                    className="font-family-semibold"
                    onClick={() =>
                      !isUploadingImage && document.getElementById("file-upload-profile").click()
                    }
                    disabled={isUploadingImage}
                    style={{
                      marginTop: 8,
                      background: "none",
                      border: "none",
                      color: isUploadingImage ? "#9ca3af" : "#004a70",
                      fontSize: 13,
                      cursor: isUploadingImage ? "not-allowed" : "pointer",
                      padding: 0,
                    }}
                  >
                    {isUploadingImage ? "Uploading..." : "Change Photo"}
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  id="file-upload-profile"
                  style={{ display: "none" }}
                />
              </div>

              <Form onSubmit={handleSubmit(onSubmit)}>
                <p
                  className="font-family-semibold"
                  style={{
                    fontSize: 16,
                    color: "#1f2937",
                    margin: "0 0 16px",
                    paddingBottom: 12,
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  Personal Information
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                    gap: 20,
                  }}
                >
                  <div>
                    <div className={`rounded-xl border p-3.5 transition-all duration-300 ${
                      errors.name 
                        ? 'border-red-400 bg-red-50/10 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100' 
                        : 'border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10'
                    }`}>
                      <label className="block text-[10px] font-family-semibold uppercase tracking-wider text-slate-400 mb-1">Full Name *</label>
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            placeholder="Enter Full Name"
                            className="w-full bg-transparent text-sm text-slate-800 outline-none border-none p-0 focus:ring-0 placeholder-slate-400"
                          />
                        )}
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1.5 ml-1 font-family-regular">{errors.name.message}</p>}
                  </div>

                  <div>
                    <div className={`rounded-xl border p-3.5 transition-all duration-300 ${
                      errors.phone 
                        ? 'border-red-400 bg-red-50/10 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100' 
                        : 'border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10'
                    }`}>
                      <label className="block text-[10px] font-family-semibold uppercase tracking-wider text-slate-400 mb-1">Phone Number *</label>
                      <style>{`
                        .react-tel-input {
                          display: flex !important;
                          align-items: center !important;
                          height: 24px !important;
                        }
                        .react-tel-input .form-control {
                          height: 24px !important;
                          line-height: 24px !important;
                          padding-top: 0 !important;
                          padding-bottom: 0 !important;
                          margin-top: 0 !important;
                          margin-bottom: 0 !important;
                        }
                        .react-tel-input .flag-dropdown {
                          height: 24px !important;
                          top: 50% !important;
                          transform: translateY(-50%) !important;
                          border: none !important;
                          background: transparent !important;
                        }
                        .react-tel-input .selected-flag {
                          height: 24px !important;
                          padding: 0 !important;
                          background: transparent !important;
                        }
                      `}</style>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <PhoneInput
                            country={"us"}
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            onBlur={field.onBlur}
                            disabled={true}
                            inputStyle={{
                              width: "100%",
                              padding: "0px 0px 0px 42px",
                              borderRadius: "0",
                              border: "none",
                              fontSize: "0.875rem",
                              outline: "none",
                              background: "transparent",
                              height: "24px",
                              lineHeight: "24px",
                              color: "#1e293b",
                              fontFamily: "inherit",
                              cursor: "not-allowed"
                            }}
                            buttonStyle={{
                              border: "none",
                              background: "transparent",
                              borderRadius: "0",
                              paddingLeft: "0",
                              height: "24px",
                              minWidth: "auto",
                              cursor: "not-allowed"
                            }}
                            dropdownStyle={{ borderRadius: "0.75rem", color: "#333" }}
                          />
                        )}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1.5 ml-1 font-family-regular">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <div className={`rounded-xl border p-3.5 transition-all duration-300 ${
                      errors.email 
                        ? 'border-red-400 bg-red-50/10 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100' 
                        : 'border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10'
                    }`}>
                      <label className="block text-[10px] font-family-semibold uppercase tracking-wider text-slate-400 mb-1">Email *</label>
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            readOnly
                            placeholder="Enter Email"
                            className="w-full bg-transparent text-sm text-slate-500 outline-none border-none p-0 focus:ring-0 placeholder-slate-400 cursor-not-allowed"
                          />
                        )}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-1 font-family-regular">{errors.email.message}</p>}
                  </div>

                  <div>
                    <div className={`rounded-xl border p-3.5 transition-all duration-300 ${
                      errors.address 
                        ? 'border-red-400 bg-red-50/10 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100' 
                        : 'border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10'
                    }`}>
                      <label className="block text-[10px] font-family-semibold uppercase tracking-wider text-slate-400 mb-1">Address *</label>
                      <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                          <div style={{ position: "relative" }}>
                            <input
                              {...field}
                              placeholder="Enter address"
                              value={searchQuery}
                              onChange={(e) => handleSearch(e.target.value)}
                              className="w-full bg-transparent text-sm text-slate-800 outline-none border-none p-0 focus:ring-0 placeholder-slate-400"
                            />
                            {PridicLoading && (
                              <span className="font-family-regular" style={{ fontSize: 12, color: "#6b7280", marginTop: 4, display: "block" }}>
                                Loading...
                              </span>
                            )}
                            {predictions.length > 0 && (
                              <ListGroup
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  left: 0,
                                  zIndex: 10,
                                  width: "100%",
                                  maxHeight: "200px",
                                  overflowY: "auto",
                                  borderRadius: 10,
                                  border: "1px solid #e5e7eb",
                                  background: "#fff",
                                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                                  marginTop: "8px"
                                }}
                              >
                                {predictions.map((prediction) => (
                                  <ListGroupItem
                                    key={prediction.place_id}
                                    onClick={() =>
                                      handlePredictionPress(prediction)
                                    }
                                    className="font-family-medium hover:bg-slate-50 transition-colors"
                                    style={{ cursor: "pointer", fontSize: 13, padding: "10px 14px", border: "none", borderBottom: "1px solid #f1f5f9" }}
                                  >
                                    {prediction.description}
                                  </ListGroupItem>
                                ))}
                              </ListGroup>
                            )}
                            {noData && (
                              <span className="font-family-regular" style={{ fontSize: 12, color: "#6b7280", marginTop: 4, display: "block" }}>
                                No results found
                              </span>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    {errors.address && <p className="text-red-500 text-xs mt-1.5 ml-1 font-family-regular">{errors.address.message}</p>}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 24,
                    paddingTop: 20,
                    borderTop: "1px solid #f3f4f6",
                  }}
                >
                  <CustomButton
                    type="submit"
                    loading={isLoading}
                    style={{ minWidth: 140 }}
                  >
                    Update Profile
                  </CustomButton>
                </div>
              </Form>
            </div>
          </div>
        );
      case "changePassword":
        return (
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #f0f0f0",
              padding: 28,
            }}
          >
            <ChangePassword />
          </div>
        );
      case "Referrals":
        return (
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #f0f0f0",
              padding: 28,
            }}
          >
            <Referrals />
          </div>
        );
      case "helpCenter":
        return (
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #f0f0f0",
              padding: 28,
            }}
          >
            <HelpCenter />
          </div>
        );
      case "privacyPolicy":
        return (
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #f0f0f0",
              padding: 28,
            }}
          >
            <Policy />
          </div>
        );
      case "termsConditions":
        return (
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #f0f0f0",
              padding: 28,
            }}
          >
            <Terms />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={mounted ? 'animate-fade-in' : 'opacity-0'} style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* ===== HERO BANNER ===== */}
      <section className={`relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 !pt-28 !pb-28 ${mounted ? 'animate-fade-in-down' : 'opacity-0'}`} style={{ animationDelay: "50ms" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }} />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: "12s" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-family-medium !mb-4">
            <a href="/" className="text-slate-400 hover:text-white transition-colors">Home</a>
            <span className="text-slate-500">/</span>
            <span className="text-slate-200">Profile</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
              <FaUserCircle size={24} color="#fff" />
            </div>
            <div>
              <h1 className="text-white text-3xl font-family-bold tracking-tight !m-0 leading-tight">
                My{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
                  Profile
                </span>
              </h1>
              <p className="text-slate-400 text-sm !mt-1 !m-0 font-family-regular">
                Manage your account settings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className={mounted ? 'animate-fade-in-up' : 'opacity-0'} style={{ maxWidth: 1200, margin: "-24px auto 0", padding: "0 16px 48px", animationDelay: "150ms" }}>
        <div
          style={{
            display: "flex",
            gap: 24,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          {/* Sidebar / Mobile Tabs */}
          {isMobile ? (
            <div
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                whiteSpace: "nowrap",
                padding: "4px 0",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {tabs.map((tab, idx) => (
                <div
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'} ${activeTab === tab.key ? "font-family-semibold" : "font-family-medium"}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 16px",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: activeTab === tab.key ? "#004a70" : "#fff",
                    color: activeTab === tab.key ? "#fff" : "#4b5563",
                    fontSize: 13,
                    border: activeTab === tab.key ? "none" : "1px solid #e5e7eb",
                    flexShrink: 0,
                    transition: "all 0.15s",
                    boxShadow: activeTab === tab.key ? "0 2px 8px rgba(0,74,112,0.25)" : "none",
                    animationDelay: `${200 + idx * 50}ms`,
                  }}
                >
                  <span style={{ display: "flex", color: "inherit" }}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                width: 260,
                flexShrink: 0,
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #f0f0f0",
                padding: 8,
                alignSelf: "flex-start",
                position: "sticky",
                top: 88,
              }}
            >
              {tabs.map((tab, idx) => (
                <div
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'} ${activeTab !== tab.key ? 'hover:bg-gray-100' : ''} ${activeTab === tab.key ? "font-family-semibold" : "font-family-medium"}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: activeTab === tab.key ? "#f0f7ff" : "transparent",
                    color: activeTab === tab.key ? "#004a70" : "#4b5563",
                    fontSize: 14,
                    transition: "all 0.15s",
                    marginBottom: 2,
                    animationDelay: `${200 + idx * 50}ms`,
                  }}
                >
                  <span style={{ color: activeTab === tab.key ? "#004a70" : "#9ca3af", display: "flex" }}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </div>
              ))}
            </div>
          )}

          {/* Main Content */}
          <div style={{ flex: 1, minWidth: 0 }}>{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
