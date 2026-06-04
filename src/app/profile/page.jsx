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

import { message } from "antd";

import Policy from "./Policy";
import Terms from "./Terms";
import { FaUser, FaUserCircle, FaLock, FaGift, FaHeadset, FaShieldAlt, FaFileContract } from "react-icons/fa";
import Referrals from "./Referrals";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { setUser } from "@/components/Redux/Slices/AuthSlice";

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
        message.success(res?.message);
      }
    } catch (error) {
      setisLoading(false);
      message.success(error.response?.data?.message);
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
    } catch (error) {}
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
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  onClick={() =>
                    document.getElementById("file-upload-profile").click()
                  }
                >
                  {image ? (
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
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: 18,
                      color: "#1f2937",
                      margin: 0,
                    }}
                  >
                    {userData?.user?.name || "Your Name"}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#6b7280",
                      margin: "4px 0 0",
                    }}
                  >
                    {userData?.user?.email || "email@example.com"}
                  </p>
                  <button
                    onClick={() =>
                      document.getElementById("file-upload-profile").click()
                    }
                    style={{
                      marginTop: 8,
                      background: "none",
                      border: "none",
                      color: "#004a70",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Change Photo
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
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
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
                    <Label for="name" style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                      Full Name
                    </Label>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Enter Full Name"
                          style={{
                            borderRadius: 10,
                            border: errors.name ? "1px solid #ef4444" : "1px solid #d1d5db",
                            padding: "10px 14px",
                            fontSize: 14,
                            marginTop: 6,
                          }}
                          invalid={errors.name && true}
                        />
                      )}
                    />
                    {errors.name && (
                      <FormFeedback style={{ fontSize: 12, marginTop: 4 }}>
                        {errors.name.message}
                      </FormFeedback>
                    )}
                  </div>

                  <div>
                    <Label for="phone" style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                      Phone Number
                    </Label>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          readOnly
                          placeholder="Enter Phone"
                          style={{
                            borderRadius: 10,
                            border: errors.phone ? "1px solid #ef4444" : "1px solid #d1d5db",
                            padding: "10px 14px",
                            fontSize: 14,
                            marginTop: 6,
                            background: "#f9fafb",
                          }}
                          invalid={errors.phone && true}
                        />
                      )}
                    />
                    {errors.phone && (
                      <FormFeedback style={{ fontSize: 12, marginTop: 4 }}>
                        {errors.phone.message}
                      </FormFeedback>
                    )}
                  </div>

                  <div>
                    <Label for="email" style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                      Email
                    </Label>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <Input
                          readOnly
                          {...field}
                          placeholder="Enter Email"
                          style={{
                            borderRadius: 10,
                            border: errors.email ? "1px solid #ef4444" : "1px solid #d1d5db",
                            padding: "10px 14px",
                            fontSize: 14,
                            marginTop: 6,
                            background: "#f9fafb",
                          }}
                          invalid={errors.email && true}
                        />
                      )}
                    />
                    {errors.email && (
                      <FormFeedback style={{ fontSize: 12, marginTop: 4 }}>
                        {errors.email.message}
                      </FormFeedback>
                    )}
                  </div>

                  <div>
                    <Label for="address" style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                      Address
                    </Label>
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <div style={{ position: "relative" }}>
                          <Input
                            {...field}
                            placeholder="Enter address"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{
                              borderRadius: 10,
                              border: errors.address ? "1px solid #ef4444" : "1px solid #d1d5db",
                              padding: "10px 14px",
                              fontSize: 14,
                              marginTop: 6,
                            }}
                            invalid={errors.address && true}
                          />
                          {errors.address && (
                            <FormFeedback style={{ fontSize: 12 }}>
                              {errors.address.message}
                            </FormFeedback>
                          )}
                          {PridicLoading && (
                            <span style={{ fontSize: 12, color: "#6b7280", marginTop: 4, display: "block" }}>
                              Loading...
                            </span>
                          )}
                          {predictions.length > 0 && (
                            <ListGroup
                              style={{
                                position: "absolute",
                                zIndex: 10,
                                width: "100%",
                                maxHeight: "200px",
                                overflowY: "auto",
                                borderRadius: 10,
                                border: "1px solid #e5e7eb",
                              }}
                            >
                              {predictions.map((prediction) => (
                                <ListGroupItem
                                  key={prediction.place_id}
                                  onClick={() =>
                                    handlePredictionPress(prediction)
                                  }
                                  style={{ cursor: "pointer", fontSize: 13, padding: "10px 14px" }}
                                >
                                  {prediction.description}
                                </ListGroupItem>
                              ))}
                            </ListGroup>
                          )}
                          {noData && (
                            <span style={{ fontSize: 12, color: "#6b7280", marginTop: 4, display: "block" }}>
                              No results found
                            </span>
                          )}
                        </div>
                      )}
                    />
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
                  <Button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      padding: "10px 32px",
                      borderRadius: 10,
                      background: "#004a70",
                      border: "none",
                      fontWeight: 600,
                      fontSize: 14,
                      minWidth: 140,
                    }}
                  >
                    {isLoading ? <Spinner size="sm" style={{ color: "#fff" }} /> : "Update Profile"}
                  </Button>
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
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #004a70 0%, #002d47 100%)",
          padding: "28px 0 44px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8 }}>
            Home / Profile
          </div>
          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(22px, 4vw, 28px)",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.3px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <FaUserCircle size={26} />
            My Profile
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "-24px auto 0", padding: "0 16px 48px" }}>
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
              {tabs.map((tab) => (
                <div
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 16px",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: activeTab === tab.key ? "#004a70" : "#fff",
                    color: activeTab === tab.key ? "#fff" : "#4b5563",
                    fontWeight: activeTab === tab.key ? 600 : 500,
                    fontSize: 13,
                    border: activeTab === tab.key ? "none" : "1px solid #e5e7eb",
                    flexShrink: 0,
                    transition: "all 0.15s",
                    boxShadow: activeTab === tab.key ? "0 2px 8px rgba(0,74,112,0.25)" : "none",
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
              {tabs.map((tab) => (
                <div
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: activeTab === tab.key ? "#f0f7ff" : "transparent",
                    color: activeTab === tab.key ? "#004a70" : "#4b5563",
                    fontWeight: activeTab === tab.key ? 600 : 500,
                    fontSize: 14,
                    transition: "all 0.15s",
                    marginBottom: 2,
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.key) e.currentTarget.style.background = "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.key) e.currentTarget.style.background = "transparent";
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
