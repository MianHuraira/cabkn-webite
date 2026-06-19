"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Input,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import { Form, Offcanvas } from "react-bootstrap";
import { FaLocationDot } from "react-icons/fa6";
import { MdOutlineMyLocation } from "react-icons/md";
import { message } from "antd";
import { theme } from "antd";
import { Loader } from "@googlemaps/js-api-loader";
import { getDistance } from "geolib";
import { IoMdCloseCircle } from "react-icons/io";
import { BiCurrentLocation } from "react-icons/bi";
import { NoshowData } from "@/components/assets/Images";
import Image from "next/image";
import EmptyState from "@/components/EmptyState";
import ThingstodoCard from "@/components/home/ThingstodoCard";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useRouter } from "next/navigation";
import Slider from "react-slick";
import CustomButton from "./CustomButton";

// const frontendBaseURL = "https://cabkn.com/popular";

// export async function generateMetadata({  }) {

//   try {

//     // Enhanced metadata for better social media compatibility
//     return {
//       title: 'CabKn',
//       description: category.about || `Explore ${'CabKn'}`,
//       openGraph: {
//         title: 'CabKn',
//         description: '' || `Explore ${'CabKn'}`,
//         type: "website",
//         locale: "en_US",
//         url: `${frontendBaseURL}/${id}`, // Using frontendBaseURL properly
//         images: imageUrl
//           ? [
//               {
//                 url: imageUrl,
//                 width: 1200,
//                 height: 630,
//                 alt: 'CabKn',
//               },
//             ]
//           : [],
//         siteName: "CabKn",
//       },

//       robots: {
//         index: true,
//         follow: true,
//       },
//       twitter: {
//         card: "summary_large_image",
//         title: category.name,
//         description: category.about,
//         images: imageUrl
//           ? [imageUrl]
//           : [
//               "https://firebasestorage.googleapis.com/v0/b/new-jesuspod.appspot.com/o/logoBlue.png?alt=media&token=8512e03c-5b30-4e1f-b805-d5facfa150a5",
//             ],
//       },
//     };
//   } catch (error) {
//     console.error(
//       "[generateMetadata] Error generating metadata:",
//       error.message
//     );
//     return {
//       title: "Error Title",
//       description: "Error fetching data.",
//       openGraph: {
//         title: "Cabkn",
//         description: "Error fetching data.",
//         type: "website",
//         locale: "en_US",
//         url: "https://cabkn.com", // Replace with your actual domain
//       },
//       robots: "noindex, nofollow",
//     };
//   }
// }

function MakeYourTour() {
  const router = useRouter();
  const [Currentlocation, setCurrentLocation] = useState({
    latitude: null,
    longitude: null,
    address: "",
  });
  const [Count, setCount] = useState(1);

  const [MoreLoading, setMoreLoading] = useState(false);

  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  const { getData, header1 } = ApiFunction();
  const [distance, setDistance] = useState("");
  const [Rideprice, setPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [Schuale, setSchuale] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [TypeRide, setTypeRide] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [noData, setNoData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [PridicLoading, setPridicLoading] = useState(false);
  const [ShowPermissionDialog, setShowPermissionDialog] = useState(false);

  const [EndPredictions, setEndPredictions] = useState([]);
  const [SearchQueryEnd, setSearchQueryEnd] = useState("");
  const [PridicLoadingEnd, setPridicLoadingEnd] = useState(false);
  const [SubCategory, setSubCategory] = useState([]);

  const [loading, setloading] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  const [Pagelength, setPagelength] = useState("");
  const [MutiRides, setMutiRides] = useState([]);
  const [Category, setCategory] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);

  const [TotalPrice, setTotalPrice] = useState(0);

  const schema = yup.object().shape({
    name: yup.string().required("Start Location is required"),
    metaTitle: yup.string().required("End Location is required"),
  });

  const [locationDetails, setLocationDetails] = useState({
    address: "",
    lat: null,
    lng: null,
  });

  const [locationDetails1, setLocationDetails1] = useState({
    address: "",
    lat: null,
    lng: null,
  });
  const [LocationDetails3, setLocationDetails3] = useState([]);

  const { token } = theme.useToken();

  const getCategory = async () => {
    setCatLoading(true);
    try {
      const response = await getData("/webcat/all/1", header1);
      const staticCategory = { _id: 0, name: "All" };
      const updatedCategories = [
        staticCategory,
        ...(response?.categories || []),
      ];

      setCategory(updatedCategories);
      setCatLoading(false);
    } catch (error) {
      console.log(error);
      setCatLoading(false);
    }
  };

  useEffect(() => {
    getCategorydata();
  }, [selectedCategoryId]);

  useEffect(() => {
    getCategory();
  }, []);

  const getCategorydata = async () => {
    setloading(true);
    try {
      const response = await getData(
        selectedCategoryId === 0
          ? `/websubcat/all/${1}`
          : `/websubcat/all/${1}/${selectedCategoryId}`,
        header1
      );
      setSubCategory(response?.categories);
      setPagelength(response?.count?.currentPageSize);
      setloading(false);
    } catch (error) {
      setloading(false);
      console.log(error);
    }
  };
  useEffect(() => {
    getCategorydata();
  }, []);

  const ShowMoreDAta = async () => {
    setCount(Count + 1);
    setMoreLoading(true);

    try {
      const response = await getData(
        `/websubcat/all/${Count + 1}?catId=${"67926fec38cf4bb3a6b3b9a7"}`,
        header1
      );
      setSubCategory((prevCategories) => [
        ...prevCategories,
        ...response?.categories,
      ]);
      setPagelength(response?.count?.currentPageSize);
      setMoreLoading(false);
    } catch (error) {
      setMoreLoading(false);
      console.log(error);
    }
  };
  const getLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          setCurrentLocation({
            latitude,
            longitude,
          });

          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCkw_MZd-894MZUR4g1_p2XohCWTSTR8S4`
            );
            const data = await response.json();
            if (data.status === "OK") {
              const address = data.results[0].formatted_address;
              setLocationDetails({
                address: address,
                lat: latitude,
                lng: longitude,
              });
              setValue("name", address || "");
              setSearchQuery(address);
              setError(null);
            } else {
              setError("Unable to fetch address.");
            }
          } catch (error) {
            setError("Error fetching address.");
          }
        },
        (err) => {
          if (err.code === 1) {
            setShowPermissionDialog(true);
          }
          setError(err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };
  const handlePermissionGuide = () => {
    setShowPermissionDialog(false);
    // Show instructions based on browser
    const instructions = `
      To enable location access:
      1. Click the lock/info icon in your browser's address bar
      2. Find "Location" in the site settings
      3. Change the permission to "Allow"
      4. Refresh the page and try again
    `;
    alert(instructions);
  };

  useEffect(() => {
    getLocation();
  }, [navigator.geolocation]);

  const settings2 = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 3,
    arrows: false,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const onChangeSchedule = (e) => {
    setSchuale(e.target.checked);
  };

  mapboxgl.accessToken =
    "pk.eyJ1IjoibWFybGVncmFudCIsImEiOiJjbTgwdmV0MjkweXB2MnFzNXBjM2x6NThnIn0.3oz3YGaDHiFDh8W5ALk09w";

  const locationSet = () => {
    const start = {
      latitude: locationDetails?.lat,
      longitude: locationDetails?.lng,
    };
    const end = {
      latitude: locationDetails1?.lat,
      longitude: locationDetails1?.lng,
    };
    const distance = getDistance(start, end) / 1000;

    setDistance(distance.toFixed(1));
  };

  useEffect(() => {
    if (locationDetails?.lat && locationDetails1?.lat) {
      locationSet();
    }
  }, [locationDetails?.lat, locationDetails1?.lat]);

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
    setValue("name", prediction?.description || "");

    setSearchQuery(prediction.description);
    setCurrentLocation({});
    // locationSet();
    setPredictions([]);
    setNoData(false);
  };

  const HandleEndSearch = async (text) => {
    setSearchQueryEnd(text);
    setPridicLoadingEnd(true);

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
            setEndPredictions(detailedPredictions.filter((item) => item));
            setPridicLoadingEnd(false);
            setNoData(false);
          } else {
            console.error("Error fetching place predictions:", status);
            setNoData(true);
            setPridicLoadingEnd(false);
          }
          setPridicLoadingEnd(false);
        }
      );
    } catch (error) {
      console.error("Error importing Places API library:", error);
      setNoData(true);
      setPridicLoadingEnd(false);
    }
  };

  const HadleEndPridication = (prediction) => {
    setLocationDetails1({
      address: prediction?.description || "",
      lat: prediction?.latLng?.lat || 0,
      lng: prediction?.latLng?.lng || 0,
    });
    setValue("metaTitle", prediction?.description || "");
    setSearchQueryEnd(prediction.description);
    setEndPredictions([]);
    setNoData(false);
    locationSet();
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
      name: "",
      metaTitle: "",
      category: "",
      Type: "",
    },
  });

  const handleSelection = (selectedItem) => {
    setMutiRides((prevRides) => {
      const exists = prevRides.some(
        (ride) => ride.title === selectedItem.title
      );
      if (exists) return prevRides;

      const updatedRides = [...prevRides, selectedItem];
      updateTotalPrice(updatedRides);
      return updatedRides;
    });
    setShow(true);
  };

  const removeIndex = (indexToRemove, item) => {
    setMutiRides((prevRides) => {
      const updatedRides = prevRides.filter(
        (_, index) => index !== indexToRemove
      );
      updateTotalPrice(updatedRides);
      return updatedRides;
    });
  };

  const updateTotalPrice = (rides) => {
    const total = rides.reduce(
      (sum, ride) => sum + Number(ride.location_price),
      0
    );
    setTotalPrice(total);
  };

  const handleClose = () => {
    setTotalPrice(0);
    setMutiRides([]);
    setShow(false);
  };

  const onSubmit = (data) => {
    if (MutiRides?.length > 0) {
      const coordinates = MutiRides.map(({ address, lat, lng }) => ({
        address,
        latitude: lat,
        longitude: lng,
      }));

      if (distance == 0) {
        message.error("Distance cannot (0) Km");
      } else {
        const body = {
          ...data,
          bookingtype: "live",
          rideType: "driver",
          distance: distance,
          tourPrice: TotalPrice,
          start: [locationDetails?.lng, locationDetails.lat],
          end: [locationDetails1?.lng, locationDetails1.lat],
          stop: coordinates,
        };
        const encodedData = encodeURIComponent(JSON.stringify(body));
        router.push(`/bookRide?data=${encodedData}`);
      }
    } else {
      message.error("Add places to your Itinerary");
    }
  };

  return (
    <div className={`${mounted ? "animate-fade-in" : "opacity-0"}`} style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <style>{`
        .make-tour-input input,
        .make-tour-input .form-control {
          background: #f9fafb !important;
          border: none !important;
          outline: none !important;
        }
        .make-tour-input input:focus,
        .make-tour-input .form-control:focus {
          box-shadow: 0 0 0 2px rgba(0,74,112,0.3) !important;
          background: #fff !important;
          border-color: transparent !important;
          outline: none !important;
        }
      `}</style>
      {/* Blue Gradient Header */}
      <div
        className={`bg-gradient-to-br from-brand-800 to-brand-950 ${mounted ? "animate-fade-in-down" : "opacity-0"} overflow-hidden`}
        style={{ padding: "28px 0 44px", position: "relative", animationDelay: "50ms" }}
      >
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -80, right: -40, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -20, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 10, right: 200, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 16px", position: "relative", zIndex: 1 }}>
          <div className="hover:opacity-80 transition-opacity" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 12 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }} className="hover:text-white/80 transition-colors">Home</a>
            <span style={{ margin: "0 6px" }}>/</span>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>Make Your Own Tour</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div>
                <h1
                  style={{
                    color: "#fff",
                    fontSize: "clamp(22px, 4vw, 28px)",
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: "-0.3px",
                  }}
                >
                  Make Your Own Tour
                </h1>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: "4px 0 0" }}>
                  Create a custom itinerary for your perfect trip
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Side by Side */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "20px 16px", width: "100%" }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Create Your Tour Form */}
          <div className="lg:col-span-4">
            <div
              className={`make-tour-input ${mounted ? "animate-fade-in-up" : "opacity-0"}`}
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                padding: 24,
                animationDelay: "150ms",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "none"; }}
            >
              <h2 style={{ fontFamily: "Inter-Bold", fontSize: 18, color: "#0f172a", margin: "0 0 6px", textAlign: "center" }}>
                Create Your Tour
              </h2>
              <p style={{ fontFamily: "Inter-Regular", fontSize: 13, color: "#64748b", textAlign: "center", margin: "0 0 20px" }}>
                Set your start and end locations
              </p>

              <Form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ marginBottom: 18 }}>
                  <div className="d-flex align-items-center" style={{ fontFamily: "Inter-Medium", fontSize: 13, color: "#374151", marginBottom: 6 }}>
                    <FaLocationDot size={12} color="#004a70" style={{ marginRight: 4 }} />
                    Start Location
                  </div>
                  <div className="flex items-center gap-2">
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <div style={{ position: "relative", width: "100%" }}>
                          <Input
                            {...field}
                            placeholder="Enter start location"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{ width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14 }}
                            className={`bg-gray-50 border-0 focus:ring-1 focus:ring-brand-600/30 focus:outline-none focus:bg-white${errors.name ? " ring-2 ring-red-400" : ""}`}
                          />
                          {errors.name && (
                            <p style={{ fontSize: 12, color: "#ef4444", margin: "4px 0 0" }}>{errors.name.message}</p>
                          )}
                          {PridicLoading && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Loading...</div>}
                          {predictions.length > 0 && (
                            <ListGroup style={{
                              position: "absolute",
                              zIndex: 10,
                              width: "100%",
                              maxHeight: "180px",
                              overflowY: "auto",
                              borderRadius: 10,
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            }}>
                              {predictions.map((prediction) => (
                                <ListGroupItem
                                  key={prediction.place_id}
                                  onClick={() => handlePredictionPress(prediction)}
                                  style={{ cursor: "pointer", fontSize: 13, padding: "10px 14px", border: "none", borderBottom: "1px solid #f1f5f9" }}
                                >
                                  {prediction.description}
                                </ListGroupItem>
                              ))}
                            </ListGroup>
                          )}
                          {noData && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>No results found</div>}
                        </div>
                      )}
                    />
                    <div
                      onClick={getLocation}
                      className="hover:bg-slate-200"
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 10,
                        background: "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                        transition: "all 0.2s",
                        border: "none",
                      }}
                    >
                      <BiCurrentLocation size={22} color="#004a70" />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div className="d-flex align-items-center" style={{ fontFamily: "Inter-Medium", fontSize: 13, color: "#374151", marginBottom: 6 }}>
                    <MdOutlineMyLocation size={14} color="#004a70" style={{ marginRight: 4 }} />
                    End Location
                  </div>
                  <Controller
                    name="metaTitle"
                    control={control}
                    render={({ field }) => (
                      <div style={{ position: "relative" }}>
                        <Input
                          {...field}
                          placeholder="Enter end location"
                          value={SearchQueryEnd}
                          onChange={(e) => HandleEndSearch(e.target.value)}
                          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14 }}
                          className={`bg-gray-50 border-0 focus:ring-1 focus:ring-brand-600/30 focus:outline-none focus:bg-white${errors.metaTitle ? " ring-2 ring-red-400" : ""}`}
                        />
                        {errors.metaTitle && (
                          <p style={{ fontSize: 12, color: "#ef4444", margin: "4px 0 0" }}>{errors.metaTitle.message}</p>
                        )}
                        {PridicLoadingEnd && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Loading...</div>}
                        {EndPredictions.length > 0 && (
                          <ListGroup style={{
                            position: "absolute",
                            zIndex: 10,
                            width: "100%",
                            maxHeight: "180px",
                            overflowY: "auto",
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          }}>
                            {EndPredictions.map((prediction) => (
                              <ListGroupItem
                                key={prediction.place_id}
                                onClick={() => HadleEndPridication(prediction)}
                                style={{ cursor: "pointer", fontSize: 13, padding: "10px 14px", border: "none", borderBottom: "1px solid #f1f5f9" }}
                              >
                                {prediction.description}
                              </ListGroupItem>
                            ))}
                          </ListGroup>
                        )}
                        {noData && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>No results found</div>}
                      </div>
                    )}
                  />
                </div>

                {distance && (
                  <div style={{
                    textAlign: "center",
                    padding: "10px 16px",
                    background: "#f0fdf4",
                    borderRadius: 10,
                    marginBottom: 16,
                    border: "1px solid #bbf7d0",
                  }}>
                    <span style={{ fontFamily: "Inter-Medium", fontSize: 13, color: "#16a34a" }}>
                      Distance: {distance} km
                    </span>
                  </div>
                )}

                <CustomButton
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isLoading}
                  className="!w-full !h-12"
                >
                  Next
                </CustomButton>
              </Form>
            </div>
          </div>

          {/* Right: Add Places Section */}
          <div className="lg:col-span-8">
            <div
              className={`${mounted ? "animate-fade-in-up" : "opacity-0"}`}
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                padding: 24,
                animationDelay: "250ms",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "none"; }}
            >
              <h2 style={{ fontFamily: "Inter-Bold", fontSize: 18, color: "#0f172a", margin: "0 0 16px" }}>
                Add places to your itinerary
              </h2>

              <div className="slider-container" style={{ marginBottom: 20 }}>
                {catLoading ? (
                  <div style={{ display: "flex", gap: 8, overflow: "hidden", paddingBottom: 4 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div key={s} className="animate-pulse" style={{ minWidth: 120, padding: "10px 16px", borderRadius: "9999px", background: "#f1f5f9", height: 42 }} />
                    ))}
                  </div>
                ) : (
                  <Slider {...settings2} key={Category.length}>
                    {Category.map((category, index) => {
                      const isSelected = selectedCategoryId === category._id;
                      return (
                        <div className="p-2" key={index}>
                          <div
                            className={`cursor-pointer capitalize`}
                            style={{
                              padding: "10px 16px",
                              background: isSelected ? "#004a70" : "#f8fafc",
                              color: isSelected ? "white" : "#1e293b",
                              borderRadius: "9999px",
                              minWidth: "120px",
                              textAlign: "center",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.3s ease",
                              border: isSelected ? "none" : "1px solid #e2e8f0",
                              boxShadow: isSelected ? "0 2px 8px rgba(0,74,112,0.25)" : "none",
                              margin: "0 auto",
                              whiteSpace: "nowrap",
                              fontSize: 14,
                              fontWeight: 500,
                              fontFamily: "Inter-Medium",
                              cursor: "pointer",
                            }}
                            onClick={() => setSelectedCategoryId(category._id)}
                            onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#004a70"; } }}
                            onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; } }}
                          >
                            <span style={{ fontSize: 13, fontFamily: "Inter-Medium" }}>{category?.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </Slider>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((s) => (
                    <div
                      key={s}
                      className="animate-pulse"
                      style={{
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        overflow: "hidden",
                        background: "#fff",
                      }}
                    >
                      <div className="shimmer" style={{ height: 140, width: "100%", background: "#f1f5f9" }} />
                      <div style={{ padding: "12px 14px" }}>
                        <div className="shimmer" style={{ height: 14, width: "70%", borderRadius: 6, marginBottom: 8, background: "#f1f5f9" }} />
                        <div className="shimmer" style={{ height: 14, width: "40%", borderRadius: 6, background: "#f1f5f9" }} />
                      </div>
                      <div style={{ padding: "0 14px 12px" }}>
                        <div className="shimmer" style={{ height: 36, width: "100%", borderRadius: 8, background: "#f1f5f9" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : SubCategory.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {SubCategory?.map((testimonial, index) => (
                      <ThingstodoCard
                        key={index}
                        testimonial={testimonial}
                        isTour={true}
                        onClick={() => handleSelection(testimonial)}
                        btnTitle={"Add to Itinerary"}
                      />
                    ))}
                  </div>
                  <div className="flex justify-center items-center mt-6 mb-2">
                    {Pagelength > 0 ? (
                      <CustomButton
                        onClick={ShowMoreDAta}
                        variant="primary"
                        size="md"
                        loading={MoreLoading}
                      >
                        See more
                      </CustomButton>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="py-10">
                  <EmptyState
                    title="No Places Found"
                    showBg={false}
                    description="We couldn't find any places matching your selected category."
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Offcanvas
        scroll={true}
        backdrop={false}
        placement="bottom"
        show={show}
        onHide={handleClose}
        style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        <Offcanvas.Header style={{ padding: "16px 20px 0", borderBottom: "1px solid #f1f5f9" }} closeButton>
          <Offcanvas.Title className="font-medium" style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
            Your Itinerary
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ padding: "12px 20px 20px" }}>
          {MutiRides?.length > 0 ? (
            <>
              <div style={{ marginBottom: 12 }}>
                {MutiRides?.map((item, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f8fafc" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <FaLocationDot size={14} color="#004a70" />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>{item?.title}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#004a70", margin: "2px 0 0" }}>{`$${item?.location_price}`}</p>
                      </div>
                    </div>
                    <IoMdCloseCircle
                      onClick={() => removeIndex(index, item)}
                      style={{ cursor: "pointer", color: "#9ca3af", flexShrink: 0 }}
                      size={20}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0 0", borderTop: "2px solid #f1f5f9" }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: 0 }}>Total Price</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#004a70", margin: 0 }}>{`$${TotalPrice}`}</p>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", margin: "20px 0" }}>No items in your itinerary yet</p>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {ShowPermissionDialog && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 ${mounted ? "animate-fade-in" : "opacity-0"}`} style={{ zIndex: 9999 }}>
          <div className={`bg-white rounded-2xl max-w-md w-full p-6 space-y-4 ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "50ms", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#004a70" strokeWidth={2}>
                  <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: 0 }}>Location Access Required</h2>
                <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>Enable location to use this feature</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
              Please enable location access in your browser settings to automatically fill your start location.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <button
                onClick={() => handlePermissionGuide(false)}
                style={{ padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: 8, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handlePermissionGuide}
                style={{ padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "#fff", background: "#004a70", border: "none", borderRadius: 8, cursor: "pointer" }}
              >
                Show Instructions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MakeYourTour;
