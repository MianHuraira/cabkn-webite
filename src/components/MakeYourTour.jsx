"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ListGroup, ListGroupItem } from "reactstrap";
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
import CustomButton from "./CustomButton";

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
  useEffect(() => {
    setMounted(true);
  }, []);

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

  const tabsRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDown(true);
    setStartX(e.pageX - tabsRef.current.offsetLeft);
    setScrollLeft(tabsRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - tabsRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    tabsRef.current.scrollLeft = scrollLeft - walk;
  };

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
    }
  };

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
  }, []);

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
                      },
                    );
                  })
              )
            );
            setPredictions(detailedPredictions.filter((item) => item));
            setPridicLoading(false);
            setNoData(false);
          } else {
            setNoData(true);
            setPridicLoading(false);
          }
          setPridicLoading(false);
        }
      );
    } catch (error) {
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
                      },
                    );
                  })
              )
            );
            setEndPredictions(detailedPredictions.filter((item) => item));
            setPridicLoadingEnd(false);
            setNoData(false);
          } else {
            setNoData(true);
            setPridicLoadingEnd(false);
          }
          setPridicLoadingEnd(false);
        }
      );
    } catch (error) {
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
    <div className={`min-h-screen bg-slate-50/50 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      {/* ===== HERO BANNER ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 !pt-28 !pb-28">
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
            <span className="text-slate-200">Make Your Own Tour</span>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div>
                <h1 className="text-white text-3xl font-family-bold tracking-tight !m-0 leading-tight">
                  Make Your Own{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
                    Tour
                  </span>
                </h1>
                <p className="text-slate-400 text-sm !mt-1 !m-0 font-family-regular">
                  Create a custom itinerary for your perfect trip
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTENT LAYOUT ===== */}
      <div className="!-mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 !pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Form Card (4 Cols) */}
          <div className="lg:col-span-4 bg-white/95 backdrop-blur-xl rounded-3xl !border !border-slate-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] lg:sticky lg:top-28 lg:self-start z-10">
            <h2 className="text-base font-family-bold text-slate-900 text-center !mb-1">
              Create Your Tour
            </h2>
            <p className="text-xs text-slate-400 text-center !mb-6 font-family-regular">
              Set your start and end locations
            </p>

            <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Start Location */}
              <div>
                <label className="text-xs text-slate-700 block !mb-2 font-family-semibold flex items-center gap-1">
                  <FaLocationDot size={12} className="text-brand-600" />
                  Start Location
                </label>
                <div className="flex items-center gap-2.5">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <div className="relative flex-grow">
                        <input
                          {...field}
                          placeholder="Enter start location"
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          className={`w-full px-4 py-3 bg-slate-50/50 !border-2 rounded-xl text-sm font-family-medium text-slate-900 focus:bg-white outline-none transition-all duration-200 ${errors.name ? "!border-rose-300 focus:!border-rose-500" : "!border-slate-100 focus:!border-brand-600"
                            }`}
                        />
                        {errors.name && (
                          <span className="text-xs text-rose-500 block !mt-1.5 font-family-medium">
                            {errors.name.message}
                          </span>
                        )}
                        {PridicLoading && (
                          <div className="text-xs text-slate-400 !mt-2 font-family-medium flex items-center gap-1.5">
                            <Spinner animation="border" size="sm" style={{ width: 12, height: 12 }} />
                            <span>Fetching locations...</span>
                          </div>
                        )}
                        {predictions.length > 0 && (
                          <ListGroup className="absolute z-20 w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl !border !border-slate-100 max-h-[200px] overflow-y-auto !mt-2.5">
                            {predictions.map((prediction) => (
                              <ListGroupItem
                                key={prediction.place_id}
                                onClick={() => handlePredictionPress(prediction)}
                                className="px-4 py-3 text-xs text-slate-700 font-family-medium cursor-pointer hover:bg-slate-50 hover:text-slate-950 transition-colors !border-b !border-slate-100 last:!border-none"
                              >
                                {prediction.description}
                              </ListGroupItem>
                            ))}
                          </ListGroup>
                        )}
                      </div>
                    )}
                  />
                  <button
                    type="button"
                    onClick={getLocation}
                    className="w-11 h-11 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-650 flex items-center justify-center shrink-0 !border !border-brand-100 transition-colors shadow-inner"
                  >
                    <BiCurrentLocation size={18} />
                  </button>
                </div>
              </div>

              {/* End Location */}
              <div>
                <label className="text-xs text-slate-700 block !mb-2 font-family-semibold flex items-center gap-1">
                  <MdOutlineMyLocation size={13} className="text-brand-600" />
                  End Location
                </label>
                <Controller
                  name="metaTitle"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <input
                        {...field}
                        placeholder="Enter end location"
                        value={SearchQueryEnd}
                        onChange={(e) => HandleEndSearch(e.target.value)}
                        className={`w-full px-4 py-3 bg-slate-50/50 !border-2 rounded-xl text-sm font-family-medium text-slate-900 focus:bg-white outline-none transition-all duration-200 ${errors.metaTitle ? "!border-rose-300 focus:!border-rose-500" : "!border-slate-100 focus:!border-brand-600"
                          }`}
                      />
                      {errors.metaTitle && (
                        <span className="text-xs text-rose-500 block !mt-1.5 font-family-medium">
                          {errors.metaTitle.message}
                        </span>
                      )}
                      {PridicLoadingEnd && (
                        <div className="text-xs text-slate-400 !mt-2 font-family-medium flex items-center gap-1.5">
                          <Spinner animation="border" size="sm" style={{ width: 12, height: 12 }} />
                          <span>Fetching locations...</span>
                        </div>
                      )}
                      {EndPredictions.length > 0 && (
                        <ListGroup className="absolute z-20 w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl !border !border-slate-100 max-h-[200px] overflow-y-auto !mt-2.5">
                          {EndPredictions.map((prediction) => (
                            <ListGroupItem
                              key={prediction.place_id}
                              onClick={() => HadleEndPridication(prediction)}
                              className="px-4 py-3 text-xs text-slate-700 font-family-medium cursor-pointer hover:bg-slate-50 hover:text-slate-950 transition-colors !border-b !border-slate-100 last:!border-none"
                            >
                              {prediction.description}
                            </ListGroupItem>
                          ))}
                        </ListGroup>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Distance Display */}
              {distance && (
                <div className="text-center p-3 bg-emerald-50/60 !border !border-emerald-100 rounded-2xl">
                  <span className="text-xs font-family-semibold text-emerald-700">
                    Distance: {distance} km
                  </span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="!pt-2">
                <CustomButton
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-family-semibold rounded-full shadow-lg shadow-brand-600/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  Next
                </CustomButton>
              </div>

            </Form>
          </div>

          {/* Right Column: Places List Grid (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl !border !border-slate-100 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
            <h2 className="text-lg font-family-bold text-slate-900 !mb-5">
              Add places to your itinerary
            </h2>

            {/* Scrollable categories bar */}
            <div
              ref={tabsRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`flex gap-2.5 overflow-x-auto pb-3 scrollbar-hide !my-4 select-none ${isDown ? "cursor-grabbing" : "cursor-grab"
                }`}
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {catLoading ? (
                <div className="flex gap-2.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="animate-pulse bg-slate-100 rounded-full h-9 w-24 shrink-0" />
                  ))}
                </div>
              ) : (
                Category.map((category, index) => {
                  const isSelected = selectedCategoryId === category._id;
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedCategoryId(category._id)}
                      className={`cursor-pointer capitalize font-family-medium text-xs px-5 py-2.5 rounded-full shrink-0 transition-all duration-300 border ${isSelected
                          ? "bg-brand-900 text-white border-brand-900 shadow-md shadow-brand-900/10 font-family-semibold"
                          : "bg-slate-50 text-slate-700 border-slate-150 hover:bg-slate-100"
                        }`}
                    >
                      {category?.name}
                    </div>
                  );
                })
              )}
            </div>

            {/* Grid list of things to do */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <div
                    key={s}
                    className="animate-pulse rounded-2xl !border !border-slate-100 overflow-hidden bg-white"
                  >
                    <div className="h-36 w-full bg-slate-100" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-slate-100" />
                      <div className="h-4.5 w-1/2 rounded bg-slate-100" />
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
                {Pagelength > 0 && (
                  <div className="flex justify-center items-center !mt-8">
                    <CustomButton
                      onClick={ShowMoreDAta}
                      variant="primary"
                      size="md"
                      loading={MoreLoading}
                      className="px-6 py-2 bg-slate-900 hover:bg-black text-white rounded-full font-family-semibold text-xs shadow-md transition-colors"
                    >
                      See more
                    </CustomButton>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12">
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

      {/* Itinerary Drawer */}
      <Offcanvas
        scroll={true}
        backdrop={false}
        placement="bottom"
        show={show}
        onHide={handleClose}
        style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        className="bg-white/95 backdrop-blur-xl border-t !border-slate-100 shadow-[0_-10px_35px_rgba(0,0,0,0.05)]"
      >
        <Offcanvas.Header className="!px-6 !pt-5 !pb-3 !border-b !border-slate-100" closeButton>
          <Offcanvas.Title className="font-family-bold text-sm text-slate-800 uppercase tracking-wider">
            Your Itinerary
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="!px-6 !py-4">
          {MutiRides?.length > 0 ? (
            <div className="max-w-3xl mx-auto">
              <div className="max-h-[160px] overflow-y-auto pr-1 space-y-2 !mb-4">
                {MutiRides?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 p-3 bg-slate-50/50 hover:bg-slate-50 !border !border-slate-100 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                        <FaLocationDot size={13} className="text-brand-650" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-family-semibold text-xs text-slate-800 truncate !m-0">
                          {item?.title}
                        </h4>
                        <span className="text-[11px] font-family-bold text-brand-650 block !mt-0.5">
                          {`$${item?.location_price}`}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIndex(index, item)}
                      className="text-slate-400 hover:text-rose-500 bg-transparent border-none p-0 flex items-center shrink-0 cursor-pointer transition-colors"
                    >
                      <IoMdCloseCircle size={20} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center !pt-4 !border-t-2 !border-slate-100">
                <span className="text-xs font-family-bold text-slate-500 uppercase tracking-wider">Total Price</span>
                <span className="text-base font-family-extrabold text-brand-650">{`$${TotalPrice}`}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center font-family-medium py-4">No items in your itinerary yet</p>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Geolocation Permissions Modal */}
      {ShowPermissionDialog && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl max-w-sm w-full text-center relative !border !border-slate-100">
            <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto !mb-4">
              <BiCurrentLocation size={30} />
            </div>
            <h2 className="text-lg font-family-bold text-slate-900 !mb-2">
              Location Access Required
            </h2>
            <p className="text-xs text-slate-500 font-family-regular leading-relaxed !mb-6">
              Please enable location access to use this feature. You can enable it in your browser settings.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowPermissionDialog(false)}
                className="px-6 py-2.5 rounded-full !border-2 !border-slate-150 bg-white text-slate-550 hover:bg-slate-50 font-family-semibold text-sm transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePermissionGuide}
                className="px-6 py-2.5 rounded-full bg-brand-900 hover:bg-brand-950 text-white font-family-semibold text-sm transition-all duration-200 !border-none cursor-pointer"
              >
                Show Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MakeYourTour;
