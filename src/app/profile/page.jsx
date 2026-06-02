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
import { FaUser } from "react-icons/fa6";
import Referrals from "./Referrals";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { setUser } from "@/components/Redux/Slices/AuthSlice";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  phone: yup.string().required("Phone  is required"),
  email: yup.string().required("Email is required"),
  address: yup.string().required("Address is required"),
});

export default function EditProfile() {
  const { postData, header1, putData, header2, getData, userData } =
    ApiFunction();
  const [isLoading, setisLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personalData"); // Default active tab
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

  useEffect(() => {
    setSearchQuery(userData?.user?.address);
  }, [""]);

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

  const mapContainerRef = useRef();
  const mapRef = useRef();
  mapboxgl.accessToken =
    "pk.eyJ1IjoibWFybGVncmFudCIsImEiOiJjbTgwdmV0MjkweXB2MnFzNXBjM2x6NThnIn0.3oz3YGaDHiFDh8W5ALk09w";
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
          <div className="flex-1 ">
            <div className="bg-white rounded-lg shadow-md p-6 probg">
              <div className="mt-6 flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  {image ? (
                    <img
                      src={image}
                      alt="Profile"
                      className="w-24 h-24 rounded-full border mx-auto md:mx-0 object-cover cursor-pointer"
                      onClick={() =>
                        document.getElementById("file-upload").click()
                      }
                    />
                  ) : (
                    <div
                      onClick={() =>
                        document.getElementById("file-upload").click()
                      }
                      className="navicon001 cursor-pointer w-24 h-24 "
                    >
                      <FaUser size={50} color="#fff" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="file-upload"
                  />
                </div>
              </div>
              <Form onSubmit={handleSubmit(onSubmit)} className="mt-3">
                <h2 className="font-medium text-lg">Personal Info</h2>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="mt-2">
                      <Label for="startLocation">Full Name</Label>
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Enter Full Name"
                            className="w-full p-3 border rounded-lg hideFocus2"
                            invalid={errors.name && true}
                          />
                        )}
                      />
                      {errors.name && (
                        <FormFeedback>{errors.name.message}</FormFeedback>
                      )}
                    </div>

                    <div className="mt-4">
                      <Label for="startLocation">Phone Number</Label>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            readOnly
                            placeholder="Enter Phone"
                            className="w-full p-3 border rounded-lg hideFocus2"
                            invalid={errors.phone && true}
                          />
                        )}
                      />
                      {errors.phone && (
                        <FormFeedback>{errors.phone.message}</FormFeedback>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="mt-2">
                      <Label for="startLocation">Email</Label>
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <Input
                            readOnly
                            {...field}
                            placeholder="Enter Phone"
                            className="w-full p-3 border rounded-lg hideFocus2"
                            invalid={errors.email && true}
                          />
                        )}
                      />
                      {errors.email && (
                        <FormFeedback>{errors.email.message}</FormFeedback>
                      )}
                    </div>
                    <div className="mt-4">
                      <Label for="startLocation">Address</Label>
                      <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                          <div style={{ position: "relative" }}>
                            <Input
                              {...field}
                              placeholder="Enter start location"
                              value={searchQuery}
                              onChange={(e) => handleSearch(e.target.value)}
                              invalid={errors.address && true}
                            />
                            {errors.address && (
                              <FormFeedback>
                                {errors.address.message}
                              </FormFeedback>
                            )}
                            {PridicLoading && <div>Loading...</div>}
                            {predictions.length > 0 && (
                              <ListGroup
                                style={{
                                  position: "absolute",
                                  zIndex: 10,
                                  width: "100%",
                                  maxHeight: "200px",
                                  overflowY: "auto",
                                }}
                              >
                                {predictions.map((prediction) => (
                                  <ListGroupItem
                                    key={prediction.place_id}
                                    onClick={() =>
                                      handlePredictionPress(prediction)
                                    }
                                    style={{ cursor: "pointer" }}
                                  >
                                    {prediction.description}
                                  </ListGroupItem>
                                ))}
                              </ListGroup>
                            )}
                            {noData && <div>No results found</div>}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                  }}
                >
                  <Button
                    style={{ width: "30%" }}
                    type="submit"
                    className="btnForm mt-5"
                    color="primary"
                    disabled={isLoading}
                  >
                    {isLoading ? <Spinner size="sm" /> : "Update"}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        );
      case "changePassword":
        return (
          <div className="bg-white rounded-lg shadow-md p-6 probg">
            <ChangePassword />
          </div>
        );
      case "Referrals":
        return (
          <div className="bg-white rounded-lg shadow-md p-6 probg">
            <Referrals />
          </div>
        );
      case "helpCenter":
        return (
          <div className="bg-white rounded-lg shadow-md p-6 probg">
            <HelpCenter />
          </div>
        );
      case "privacyPolicy":
        return (
          <div className="bg-white rounded-lg shadow-md p-6 probg">
            <Policy />
          </div>
        );
      case "termsConditions":
        return (
          <div className="bg-white rounded-lg shadow-md p-6 probg">
            <Terms />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bread">
        <h5 className="medium-font">Home/Profile</h5>
        <h3 className="medium-font">Profile</h3>
      </div>

      <div className="h-screen">
        <div className="flex flex-col md:flex-row h-full mt-3">
          {/* Sidebar */}
          <div className="w-full md:w-1/4 shadow-md probg rounded-lg">
            <div className="ulPadding">
              <div
                className={`font-semibold cursor-pointer rounded-lg p-3 ${
                  activeTab == "personalData" ? "bg-[#1e3a5f]" : "bg-white"
                }`}
                onClick={() => setActiveTab("personalData")}
              >
                <p
                  className={`font-bold ${
                    activeTab == "personalData" ? "text-white" : "text-blackq"
                  }`}
                >
                  Personal Data
                </p>
              </div>
              <div
                className={`font-semibold cursor-pointer rounded-lg p-3 ${
                  activeTab == "changePassword" ? "bg-[#1e3a5f]" : "bg-white"
                }`}
                onClick={() => setActiveTab("changePassword")}
              >
                <p
                  className={`font-bold ${
                    activeTab == "changePassword" ? "text-white" : "text-blackq"
                  }`}
                >
                  Change Password
                </p>
              </div>
              <div
                className={`font-semibold cursor-pointer rounded-lg p-3 ${
                  activeTab == "Referrals" ? "bg-[#1e3a5f]" : "bg-white"
                }`}
                onClick={() => setActiveTab("Referrals")}
              >
                <p
                  className={`font-bold ${
                    activeTab == "Referrals" ? "text-white" : "text-blackq"
                  }`}
                >
                  Referrals
                </p>
              </div>

              <div
                className={`font-semibold cursor-pointer rounded-lg p-3 ${
                  activeTab == "helpCenter" ? "bg-[#1e3a5f]" : "bg-white"
                }`}
                onClick={() => setActiveTab("helpCenter")}
              >
                <p
                  className={`font-bold ${
                    activeTab == "helpCenter" ? "text-white" : "text-blackq"
                  }`}
                >
                  Help Center
                </p>
              </div>
              <div
                className={`font-semibold cursor-pointer rounded-lg p-3 ${
                  activeTab == "privacyPolicy" ? "bg-[#1e3a5f]" : "bg-white"
                }`}
                onClick={() => setActiveTab("privacyPolicy")}
              >
                <p
                  className={`font-bold ${
                    activeTab == "privacyPolicy" ? "text-white" : "text-blackq"
                  }`}
                >
                  Privacy & Policy
                </p>
              </div>
              <div
                className={`font-semibold cursor-pointer rounded-lg p-3 ${
                  activeTab == "termsConditions" ? "bg-[#1e3a5f]" : "bg-white"
                }`}
                onClick={() => setActiveTab("termsConditions")}
              >
                <p
                  className={`font-bold ${
                    activeTab == "termsConditions"
                      ? "text-white"
                      : "text-blackq"
                  }`}
                >
                  Terms And Conditions
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 ps-2">{renderContent()}</div>
        </div>
      </div>
    </>
  );
}
