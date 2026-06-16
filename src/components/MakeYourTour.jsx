"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  FormFeedback,
  Input,
  Label,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import { Button, Form, Offcanvas, Spinner } from "react-bootstrap";
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
import ThingstodoCard from "@/components/home/ThingstodoCard";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useRouter } from "next/navigation";
import Slider from "react-slick";

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
    try {
      const response = await getData("/webcat/all/1", header1);
      const staticCategory = { _id: 0, name: "All" };
      const updatedCategories = [
        staticCategory,
        ...(response?.categories || []),
      ];

      setCategory(updatedCategories);
    } catch (error) {
      console.log(error);
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
    <div className={mounted ? "animate-fade-in" : "opacity-0"} style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* Blue Gradient Header */}
      <div
        className={mounted ? "animate-fade-in-down" : "opacity-0"}
        style={{
          background: "linear-gradient(135deg, #004a70 0%, #002d47 100%)",
          padding: "28px 0 44px",
          animationDelay: "50ms",
        }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8 }}>
            Home / Make Your Own Tour
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
            <div>
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
                <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Make Your Own Tour
              </h1>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: "4px 0 0" }}>
                Create a custom itinerary for your perfect trip
              </p>
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
              className={`section-card ${mounted ? "animate-fade-in-up" : "opacity-0"}`}
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                padding: 24,
                animationDelay: "150ms",
              }}
            >
              <h2 style={{ fontFamily: "Inter-Bold", fontSize: 18, color: "#0f172a", margin: "0 0 6px", textAlign: "center" }}>
                Create Your Tour
              </h2>
              <p style={{ fontFamily: "Inter-Regular", fontSize: 13, color: "#64748b", textAlign: "center", margin: "0 0 20px" }}>
                Set your start and end locations
              </p>

              <Form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontFamily: "Inter-Medium", fontSize: 13, color: "#374151", marginBottom: 6 }}>
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
                            invalid={errors.name && true}
                            style={{ borderRadius: 10, height: 46, fontSize: 13, borderColor: errors.name ? "#ef4444" : "#e2e8f0" }}
                          />
                          {errors.name && (
                            <FormFeedback>{errors.name.message}</FormFeedback>
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
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <BiCurrentLocation size={22} color="#004a70" />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: "Inter-Medium", fontSize: 13, color: "#374151", marginBottom: 6 }}>
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
                          invalid={errors.metaTitle && true}
                          style={{ borderRadius: 10, height: 46, fontSize: 13, borderColor: errors.metaTitle ? "#ef4444" : "#e2e8f0" }}
                        />
                        {errors.metaTitle && (
                          <FormFeedback>{errors.metaTitle.message}</FormFeedback>
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

                <Button
                  type="submit"
                  disabled={isLoading}
                  className={!isLoading ? "hover:shadow-lg hover:-translate-y-0.5" : ""}
                  style={{
                    width: "100%",
                    height: 48,
                    border: "none",
                    borderRadius: "9999px",
                    background: isLoading ? "#e2e8f0" : "#004a70",
                    color: "#fff",
                    fontFamily: "Inter-SemiBold",
                    fontSize: 15,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: isLoading ? "none" : "0 4px 14px rgba(0,74,112,0.25)",
                    transition: "all 0.2s",
                  }}
                >
                  {isLoading ? <Spinner size="sm" color="#fff" /> : "Next"}
                </Button>
              </Form>
            </div>
          </div>

          {/* Right: Add Places Section */}
          <div className="lg:col-span-8">
            <div
              className={`section-card ${mounted ? "animate-fade-in-up" : "opacity-0"}`}
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                padding: 24,
                animationDelay: "250ms",
              }}
            >
              <h2 style={{ fontFamily: "Inter-Bold", fontSize: 18, color: "#0f172a", margin: "0 0 16px" }}>
                Add places to your itinerary
              </h2>

              <div className="slider-container" style={{ marginBottom: 20 }}>
                <Slider {...settings2} key={Category.length}>
                  {Category.map((category, index) => {
                    const isSelected = selectedCategoryId === category._id;
                    return (
                      <div className="p-2" key={index}>
                        <div
                          className={`CategoryMain text-center cursor-pointer ${!isSelected ? "hover:border-brand-700 hover:bg-slate-100" : ""}`}
                          style={{
                            padding: "10px 14px",
                            background: isSelected
                              ? "linear-gradient(179.02deg, rgb(0, 74, 112) -69.5%, rgb(177, 176, 176) 99.16%)"
                              : "#fff",
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
                          }}
                          onClick={() => setSelectedCategoryId(category._id)}
                        >
                          <span style={{ fontSize: 13, fontFamily: "Inter-Medium" }}>{category?.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </Slider>
              </div>

              {SubCategory.length > 0 ? (
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
                      <Button
                        onClick={ShowMoreDAta}
                        className="hover:shadow-lg hover:-translate-y-0.5"
                        style={{
                          minWidth: 140,
                          padding: "10px 28px",
                          background: "linear-gradient(179.02deg, rgb(0, 74, 112) -69.5%, rgb(177, 176, 176) 99.16%)",
                          border: "none",
                          borderRadius: "9999px",
                          color: "#fff",
                          fontFamily: "Inter-Medium",
                          fontSize: 14,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          boxShadow: "0 4px 14px rgba(0,74,112,0.25)",
                          transition: "all 0.2s",
                        }}
                      >
                        {MoreLoading ? <Spinner size={"sm"} color="#fff" /> : "See more"}
                      </Button>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="d-flex flex-column align-items-center" style={{ padding: "40px 0" }}>
                  <Image
                    src={NoshowData}
                    style={{ width: 180, height: 180, objectFit: "cover", borderRadius: 12 }}
                    alt="No data available"
                  />
                  <h1 className="font-medium text-lg mt-3" style={{ color: "#94a3b8" }}>No Data Found!</h1>
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
      >
        <Offcanvas.Header style={{ paddingBottom: 0 }} closeButton>
          <Offcanvas.Title className="font-medium">
            Your Itinerary
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="pb-2" style={{ borderBottom: "1px solid #e5e5e5" }}>
            {MutiRides?.map((item, index) => {
              return (
                <>
                  <div className="flex items-center justify-between">
                    <div className="mt-1 flex items-center gap-2">
                      <FaLocationDot />
                      <p className="font-medium  text-xl text-[#004a70]  truncate-text mt-0 ">
                        {item?.title}
                      </p>
                      <p className="font-medium  text-xl text-[#004a70]  truncate-text mt-0 ">
                        {`$ ${item?.location_price}`}
                      </p>
                    </div>
                    <IoMdCloseCircle
                      onClick={() => removeIndex(index, item)}
                      className="cursor-pointer"
                      size={20}
                    />
                  </div>
                </>
              );
            })}
          </div>
          <div className="flex justify-between">
            <p className="font-medium  text-xl text-[#004a70]  truncate-text mt-3 ">
              Total Price
            </p>

            <p className="font-Bold  text-xl text-[#004a70]  truncate-text mt-3 ">
              {`$ ${TotalPrice}`}
            </p>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {ShowPermissionDialog && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
          <div className={`bg-white rounded-lg max-w-md w-full p-6 space-y-4 ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "50ms" }}>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Location Access Required
              </h2>
              <p className="font-Regular text-gray-600">
                Please enable location access to use this feature. You can
                enable it in your browser settings.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handlePermissionGuide(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 font-Regular"
              >
                Cancel
              </button>
              <button
                onClick={handlePermissionGuide}
                className="px-4 py-2 bg-[#005081]  text-white rounded transition-colors duration-200 font-Regular"
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
