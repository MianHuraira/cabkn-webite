"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ListGroup, ListGroupItem } from "reactstrap";
import { Form } from "react-bootstrap";
import { FaLocationDot, FaMapLocationDot, FaPlus, FaCheck, FaStar, FaEye } from "react-icons/fa6";
import { MdOutlineMyLocation, MdOutlinePlace, MdOutlineLocationOn } from "react-icons/md";
import { message } from "antd";
import { Loader } from "@googlemaps/js-api-loader";
import { getDistance } from "geolib";
import { IoMdClose } from "react-icons/io";
import { BiCurrentLocation } from "react-icons/bi";
import { NoshowData } from "@/components/assets/Images";
import EmptyState from "@/components/EmptyState";
import { FaCar, FaBox, FaMapMarkedAlt, FaHistory, FaSearch, FaTrash } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CustomButton from "./CustomButton";

const tourTabs = [
  { key: "tour", label: "Make Own Tour", icon: <FaMapMarkedAlt size={15} /> },
  { key: "driver", label: "Book a Driver", icon: <FaCar size={15} /> },
  { key: "parcel", label: "Send a Parcel", icon: <FaBox size={14} /> },
  { key: "myBookings", label: "My Bookings", icon: <FaHistory size={14} /> },
];

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
  const [showDrawer, setShowDrawer] = useState(false);
  const { getData, header1 } = ApiFunction();
  const [distance, setDistance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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
      const response = await getData("/webcat/all/1?limit=12", header1);
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
          ? `/websubcat/all/${1}?limit=12`
          : `/websubcat/all/${1}/${selectedCategoryId}?limit=12`,
        header1
      );
      setSubCategory(response?.categories || []);
      setPagelength(response?.count?.currentPageSize || 0);
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
        ...(response?.categories || []),
      ]);
      setPagelength(response?.count?.currentPageSize || 0);
      setMoreLoading(false);
    } catch (error) {
      setMoreLoading(false);
    }
  };

  const getLocation = async () => {
    if (navigator.geolocation) {
      setGeoLoading(true);
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
              setValue("name", address || "", { shouldValidate: true });
              clearErrors("name");
              setSearchQuery(address);
              setError(null);
            } else {
              setError("Unable to fetch address.");
            }
          } catch (error) {
            setError("Error fetching address.");
          } finally {
            setGeoLoading(false);
          }
        },
        (err) => {
          setGeoLoading(false);
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
    const dist = getDistance(start, end) / 1000;
    setDistance(dist.toFixed(1));
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
    setValue("name", prediction?.description || "", { shouldValidate: true });
    clearErrors("name");
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
                      }
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
    setValue("metaTitle", prediction?.description || "", { shouldValidate: true });
    clearErrors("metaTitle");
    setSearchQueryEnd(prediction.description);
    setEndPredictions([]);
    setNoData(false);
    locationSet();
  };

  const {
    handleSubmit,
    control,
    setValue,
    clearErrors,
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
    const exists = MutiRides.some((ride) => ride.title === selectedItem.title);
    if (exists) {
      removeIndex(MutiRides.findIndex((ride) => ride.title === selectedItem.title));
      message.info(`${selectedItem.title} removed from itinerary`);
      return;
    }

    setMutiRides((prevRides) => {
      const updatedRides = [...prevRides, selectedItem];
      updateTotalPrice(updatedRides);
      return updatedRides;
    });
    setShowDrawer(true);
  };

  const removeIndex = (indexToRemove) => {
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
      (sum, ride) => sum + Number(ride.location_price || 0),
      0
    );
    setTotalPrice(total);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
  };

  const handleClearAllItinerary = () => {
    setTotalPrice(0);
    setMutiRides([]);
    setShowDrawer(false);
  };

  const onSubmit = (data) => {
    if (MutiRides?.length > 0) {
      const coordinates = MutiRides.map(({ address, lat, lng }) => ({
        address,
        latitude: lat,
        longitude: lng,
      }));

      if (distance == 0) {
        message.error("Distance cannot be (0) Km");
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
      message.error("Please add at least one place to your itinerary");
    }
  };

  return (
    <div className={`!min-h-screen !bg-[#f8fafc] !select-none ${mounted ? "animate-fade-in" : "!opacity-0"}`}>
      {/* ===== 1. HERO BANNER ===== */}
      <section className="!relative !overflow-hidden !bg-gradient-to-br !from-[#001726] !via-[#002842] !to-[#002f4a] !pt-28 !pb-14 sm:!pb-16">
        {/* Subtle grid pattern */}
        <div
          className="!absolute !inset-0 !opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Ambient floating glows */}
        <div
          className="!absolute !top-1/4 !-left-20 !w-80 !h-80 !bg-sky-500/10 !rounded-full !blur-[100px] !animate-pulse !pointer-events-none"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="!absolute !bottom-1/4 !-right-20 !w-96 !h-96 !bg-brand-500/10 !rounded-full !blur-[120px] !animate-pulse !pointer-events-none"
          style={{ animationDuration: "12s" }}
        />

        <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !relative !z-10">
          {/* Breadcrumbs */}
          <div className="!flex !items-center !gap-2 !text-slate-400 !text-xs !font-family-medium !mb-4">
            <Link
              href="/"
              className="!text-slate-400 hover:!text-white !transition-colors !no-underline"
            >
              Home
            </Link>
            <span className="!text-slate-500">/</span>
            <span className="!text-slate-200">Make Your Own Tour</span>
          </div>

          <div className="!flex !flex-wrap !justify-between !items-center !gap-4">
            <div className="!flex !items-center !gap-3.5 sm:!gap-4">
              <div className="!w-12 !h-12 sm:!w-14 sm:!h-14 !rounded-2xl !bg-white/10 !backdrop-blur-md !border !border-white/15 !flex !items-center !justify-center !shrink-0 !shadow-inner">
                <FaMapLocationDot className="!text-white !text-xl sm:!text-2xl" />
              </div>
              <div>
                <h1 className="!text-white !text-2xl sm:!text-3xl !font-family-bold !tracking-tight !m-0 !leading-tight">
                  Make Your Own Tour
                </h1>
                <p className="!text-slate-300 !text-xs sm:!text-sm !mt-1 !m-0 !font-family-regular">
                  Plan your customized route, pick your favorite stops & enjoy St. Kitts
                </p>
              </div>
            </div>

            {/* Quick Itinerary Status Badge */}
            {MutiRides.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDrawer(true)}
                className="!flex !items-center !gap-2 !bg-[#004a70] hover:!bg-[#003855] !text-white !px-4 !py-2.5 !rounded-xl !text-xs sm:!text-sm !font-family-semibold !shadow-md !transition-all !cursor-pointer !border !border-white/20"
              >
                <MdOutlinePlace size={16} className="!text-sky-300" />
                <span>
                  {MutiRides.length} Stop{MutiRides.length !== 1 ? "s" : ""} • ${TotalPrice} USD
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ===== NAVIGATION TABS (Perfect 50/50 Top/Bottom Centered on Edge with Position) ===== */}
      <div className="!relative !z-30 !-translate-y-1/2 !max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !pointer-events-auto">
        <Swiper
          modules={[FreeMode, Mousewheel]}
          slidesPerView="auto"
          spaceBetween={10}
          freeMode={true}
          mousewheel={{ forceToAxis: true }}
          className="!w-full !py-1 category-swiper"
        >
          {tourTabs.map((tab) => {
            const isSelected = tab.key === "tour";
            return (
              <SwiperSlide key={tab.key} style={{ width: "auto" }}>
                <button
                  type="button"
                  onClick={() => {
                    if (tab.key === "driver" || tab.key === "parcel") {
                      router.push("/ride");
                    } else if (tab.key === "myBookings") {
                      router.push("/admin");
                    }
                  }}
                  className={`!cursor-pointer !transition-all !duration-200 !select-none !flex !items-center !gap-2 !px-5 !py-2.5 !rounded-full !text-xs sm:!text-sm !font-family-semibold !whitespace-nowrap !border ${
                    isSelected
                      ? "!text-white !bg-[#004a70] !border-[#004a70] "
                      : "!text-slate-700 !bg-white !border-slate-200/90 hover:!border-[#004a70] hover:!bg-slate-50 hover:!text-[#004a70]"
                  }`}
                >
                  <span className={isSelected ? "opacity-100" : "opacity-75"}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* ===== 2. CONTENT LAYOUT ===== */}
      <div className="!-mt-2 sm:!-mt-3 !max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !relative !z-20 !pb-24">
        <div className="!grid !grid-cols-1 lg:!grid-cols-12 !gap-5 !items-start">
          {/* ===== Left Column: Compact Form Card (4 Cols) ===== */}
          <div className="lg:!col-span-4 !bg-white !rounded-2xl !border !border-slate-200/90 !p-4 sm:!p-4.5 !shadow-[0_4px_25px_rgba(0,0,0,0.04)] lg:!sticky lg:!top-24 !z-10">
            <div className="!flex !items-center !justify-between !mb-3.5">
              <div>
                <h2 className="!text-sm sm:!text-[15px] !font-family-semibold !text-slate-800 !m-0">
                  Create Your Tour
                </h2>
                <p className="!text-[11.5px] !text-slate-500 !font-family-regular !m-0 !mt-0.5">
                  Set your start and end points
                </p>
              </div>

              {MutiRides.length > 0 && (
                <span className="!px-2.5 !py-0.5 !rounded-full !bg-sky-50 !text-[#004a70] !text-[11px] !font-family-bold">
                  {MutiRides.length} Stop{MutiRides.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <Form onSubmit={handleSubmit(onSubmit)} className="!space-y-3.5">
              {/* Start Location Input with Inside Locate Button / Spinner */}
              <div>
                <label className="!text-xs !text-slate-700 !block !mb-1 !font-family-semibold !flex !items-center !gap-1.5">
                  <FaLocationDot size={11} className="!text-[#004a70]" />
                  Start Location
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <div className="!relative !flex-1">
                      <div className="!relative !flex !items-center">
                        <div className="!absolute !left-3.5 !flex !items-center !pointer-events-none !text-slate-400 !z-10">
                          <FaSearch className="!w-3.5 !h-3.5" />
                        </div>
                        <input
                          {...field}
                          type="text"
                          placeholder="Enter start location"
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="!w-full !pl-10 !pr-11 !py-2.5 !rounded-xl !bg-white !border !border-gray-200 !text-[13.5px] !text-gray-900 !placeholder-gray-400 focus:!outline-none focus:!ring-1 focus:!ring-primary-500 focus:!ring-offset-1 focus:!border-none !transition-all !duration-200 !shadow-xs hover:!shadow-sm"
                        />

                        {/* Inside End Locate Icon / Spinner */}
                        <div className="!absolute !right-2.5 !flex !items-center !gap-1 !z-10">
                          {geoLoading || PridicLoading ? (
                            <div className="!h-4 !w-4 !animate-spin !rounded-full !border-2 !border-slate-200 !border-t-brand-600" />
                          ) : (
                            <button
                              type="button"
                              onClick={getLocation}
                              title="Use Current Location"
                              className="!w-7 !h-7 !rounded-lg !bg-brand-50 hover:!bg-brand-100 !text-[#004a70] !flex !items-center !justify-center !border-none !transition-colors !cursor-pointer"
                            >
                              <BiCurrentLocation size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {errors.name && (
                        <span className="!text-[11px] !text-rose-500 !block !mt-1 !font-family-medium">
                          {errors.name.message}
                        </span>
                      )}

                      {predictions.length > 0 && (
                        <ListGroup className="!absolute !z-30 !w-full !bg-white !rounded-2xl !shadow-xl !border !border-slate-100 !max-h-[220px] !overflow-y-auto !mt-1.5 !p-1">
                          {predictions.map((prediction, idx) => (
                            <ListGroupItem
                              key={prediction.place_id || idx}
                              onClick={() => handlePredictionPress(prediction)}
                              className="!px-3 !py-2 !text-xs !text-slate-700 !font-family-medium !cursor-pointer hover:!bg-slate-50 hover:!text-[#004a70] !rounded-xl !transition-colors !border-none"
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

              {/* End Location Input */}
              <div>
                <label className="!text-xs !text-slate-700 !block !mb-1 !font-family-semibold !flex !items-center !gap-1.5">
                  <MdOutlineMyLocation size={12} className="!text-[#004a70]" />
                  End Location
                </label>
                <Controller
                  name="metaTitle"
                  control={control}
                  render={({ field }) => (
                    <div className="!relative">
                      <div className="!relative !flex !items-center">
                        <div className="!absolute !left-3.5 !flex !items-center !pointer-events-none !text-slate-400 !z-10">
                          <FaSearch className="!w-3.5 !h-3.5" />
                        </div>
                        <input
                          {...field}
                          type="text"
                          placeholder="Enter destination location"
                          value={SearchQueryEnd}
                          onChange={(e) => HandleEndSearch(e.target.value)}
                          className="!w-full !pl-10 !pr-10 !py-2.5 !rounded-xl !bg-white !border !border-gray-200 !text-[13.5px] !text-gray-900 !placeholder-gray-400 focus:!outline-none focus:!ring-1 focus:!ring-primary-500 focus:!ring-offset-1 focus:!border-none !transition-all !duration-200 !shadow-xs hover:!shadow-sm"
                        />

                        {PridicLoadingEnd && (
                          <div className="!absolute !right-3 !flex !items-center !z-10">
                            <div className="!h-4 !w-4 !animate-spin !rounded-full !border-2 !border-slate-200 !border-t-brand-600" />
                          </div>
                        )}
                      </div>

                      {errors.metaTitle && (
                        <span className="!text-[11px] !text-rose-500 !block !mt-1 !font-family-medium">
                          {errors.metaTitle.message}
                        </span>
                      )}

                      {EndPredictions.length > 0 && (
                        <ListGroup className="!absolute !z-30 !w-full !bg-white !rounded-2xl !shadow-xl !border !border-slate-100 !max-h-[220px] !overflow-y-auto !mt-1.5 !p-1">
                          {EndPredictions.map((prediction, idx) => (
                            <ListGroupItem
                              key={prediction.place_id || idx}
                              onClick={() => HadleEndPridication(prediction)}
                              className="!px-3 !py-2 !text-xs !text-slate-700 !font-family-medium !cursor-pointer hover:!bg-slate-50 hover:!text-[#004a70] !rounded-xl !transition-colors !border-none"
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

              {/* Distance Pill */}
              {distance && (
                <div className="!flex !items-center !justify-between !p-2 !bg-emerald-50/70 !border !border-emerald-200/80 !rounded-xl !text-xs !font-family-semibold !text-emerald-800">
                  <span className="!flex !items-center !gap-1.5">
                    <FaCheck className="!text-emerald-600 !text-[10px]" />
                    Estimated Distance:
                  </span>
                  <span className="!font-family-bold">{distance} km</span>
                </div>
              )}

              {/* Itinerary Preview in Left Card */}
              {MutiRides.length > 0 && (
                <div
                  onClick={() => setShowDrawer(true)}
                  className="!p-2.5 !bg-slate-50 hover:!bg-sky-50/60 !border !border-slate-200/80 !rounded-xl !cursor-pointer !transition-colors"
                >
                  <div className="!flex !items-center !justify-between">
                    <div className="!flex !items-center !gap-2">
                      <div className="!w-5 !h-5 !rounded-full !bg-[#004a70] !text-white !flex !items-center !justify-center !text-[10px] !font-family-bold">
                        {MutiRides.length}
                      </div>
                      <span className="!text-xs !font-family-semibold !text-slate-800">
                        Selected Places
                      </span>
                    </div>
                    <span className="!text-xs !font-family-bold !text-[#004a70]">
                      ${TotalPrice} USD
                    </span>
                  </div>
                  <span className="!text-[11px] !text-slate-400 !block !mt-0.5">
                    Click to view / manage your stops →
                  </span>
                </div>
              )}

              {/* Next Button */}
              <div className="!pt-1">
                <CustomButton
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isLoading}
                  className="!w-full !py-2.5 !bg-[#004a70] hover:!bg-[#003855] !text-white !font-family-semibold !rounded-xl !shadow-md !transition-all !cursor-pointer !border-none !text-xs sm:!text-sm"
                >
                  <span>Next</span>
                  <FiArrowRight className="!inline-block !ml-1" />
                </CustomButton>
              </div>
            </Form>
          </div>

          {/* ===== Right Column: Places Grid (8 Cols) ===== */}
          <div className="lg:!col-span-8 !bg-white !rounded-2xl !border !border-slate-200/90 !p-4 sm:!p-5 !shadow-[0_4px_25px_rgba(0,0,0,0.04)]">
            <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-2.5 !mb-3.5">
              <div>
                <h2 className="!text-base sm:!text-lg !font-family-semibold !text-slate-800 !m-0">
                  Add places to your itinerary
                </h2>
                <p className="!text-xs !text-slate-500 !font-family-regular !m-0 !mt-0.5">
                  Choose sightseeing spots, restaurants, and attractions to visit
                </p>
              </div>

              {MutiRides.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowDrawer(true)}
                  className="!inline-flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !bg-brand-50 hover:!bg-brand-100 !text-[#004a70] !font-family-semibold !text-xs !transition-colors !shrink-0 !border !border-brand-200 !cursor-pointer"
                >
                  <MdOutlinePlace size={14} />
                  <span>View Itinerary ({MutiRides.length})</span>
                </button>
              )}
            </div>

            {/* Category Swiper Filter */}
            <div className="!w-full !max-w-full !overflow-hidden !mb-4">
              {catLoading ? (
                <div className="!flex !gap-2 !overflow-x-auto !py-1 scrollbar-hide">
                  {[1, 2, 3, 4, 5, 6].map((s) => (
                    <div
                      key={s}
                      className="!animate-pulse !bg-slate-100 !rounded-full !h-8 !w-20 !shrink-0"
                    />
                  ))}
                </div>
              ) : (
                <Swiper
                  modules={[FreeMode, Mousewheel]}
                  slidesPerView="auto"
                  spaceBetween={8}
                  freeMode={true}
                  mousewheel={{ forceToAxis: true }}
                  className="!w-full !py-1 category-swiper"
                >
                  {Category.map((category, index) => {
                    const isSelected = selectedCategoryId === category._id;
                    return (
                      <SwiperSlide key={category._id || index} style={{ width: "auto" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedCategoryId(category._id)}
                          className={`!cursor-pointer !capitalize !font-family-medium !text-xs !px-3.5 !py-1.5 !rounded-full !shrink-0 !transition-all !duration-200 !border ${
                            isSelected
                              ? "!bg-[#004a70] !text-white !border-[#004a70] !shadow-xs !font-family-semibold"
                              : "!bg-white !text-slate-700 !border-slate-200/90 hover:!border-[#004a70] hover:!text-[#004a70] hover:!bg-slate-50"
                          }`}
                        >
                          {category?.name}
                        </button>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              )}
            </div>

            {/* Places Grid with Top-Services Style Cards */}
            {loading ? (
              <div className="!grid !grid-cols-1 sm:!grid-cols-2 xl:!grid-cols-3 !gap-3.5">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <div
                    key={s}
                    className="!animate-pulse !rounded-2xl !border !border-slate-100 !overflow-hidden !bg-white !h-[300px]"
                  >
                    <div className="!h-36 !w-full !bg-slate-100" />
                    <div className="!p-3.5 !space-y-2">
                      <div className="!h-4 !w-3/4 !rounded !bg-slate-100" />
                      <div className="!h-3 !w-1/2 !rounded !bg-slate-100" />
                      <div className="!h-8 !w-full !rounded-xl !bg-slate-100 !mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : SubCategory.length > 0 ? (
              <>
                <div className="!grid !grid-cols-1 sm:!grid-cols-2 xl:!grid-cols-3 !gap-3.5">
                  {SubCategory?.map((item, index) => {
                    const isAdded = MutiRides.some((ride) => ride.title === item.title);
                    const imageUrl =
                      Array.isArray(item?.images) && item.images.length > 0
                        ? item.images[0]
                        : typeof item?.images === "string"
                          ? item.images
                          : "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80";
                    const price = item?.location_price || item?.price_per_person || item?.price || 135;

                    return (
                      <div
                        key={item._id || index}
                        className={`!w-full !flex !flex-col !bg-white !rounded-2xl !overflow-hidden !border !transition-all !duration-300 !shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:!shadow-[0_8px_25px_rgba(0,74,112,0.1)] hover:!-translate-y-1 group !select-none ${
                          isAdded
                            ? "!border-emerald-500/80 !ring-1 !ring-emerald-500/30"
                            : "!border-slate-200/90"
                        }`}
                      >
                        {/* Card Image */}
                        <div
                          onClick={() => router.push(`/popular/${item._id}`)}
                          className="!relative !h-[155px] !w-full !overflow-hidden !bg-slate-100 !cursor-pointer"
                        >
                          <img
                            src={imageUrl}
                            alt={item?.title || "Place"}
                            className="!w-full !h-full !object-cover group-hover:!scale-105 !transition-transform !duration-500"
                          />
                          <div className="!absolute !inset-0 !bg-gradient-to-t !from-black/50 !via-transparent !to-transparent !pointer-events-none" />

                          {/* Category Tag */}
                          {item?.category?.name && (
                            <div className="!absolute !top-2.5 !left-2.5">
                              <span className="!px-2.5 !py-0.5 !rounded-full !text-[10px] !font-family-semibold !text-white !uppercase !tracking-wider !bg-[#004a70]/90 !backdrop-blur-md !shadow-xs">
                                {item.category.name}
                              </span>
                            </div>
                          )}

                          {/* Rating Pill */}
                          <div className="!absolute !top-2.5 !right-2.5 !flex !items-center !gap-1 !px-2 !py-0.5 !rounded-full !bg-black/50 !backdrop-blur-md !text-white !text-[11px] !font-family-semibold !shadow-xs">
                            <FaStar className="!text-amber-400 !text-[10px]" />
                            <span>{item?.avgRating ? Number(item.avgRating).toFixed(1) : "5.0"}</span>
                            <span className="!text-white/60 !text-[9px]">
                              ({item?.totalReviews || 0})
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="!p-3 !flex-1 !flex !flex-col !justify-between">
                          <div>
                            <h3
                              onClick={() => router.push(`/popular/${item._id}`)}
                              className="!text-[13.5px] !font-family-semibold !text-slate-800 !line-clamp-1 !m-0 !mb-1 !leading-snug !cursor-pointer hover:!text-[#004a70] !transition-colors"
                            >
                              {item?.title}
                            </h3>

                            <p className="!text-[11px] !text-slate-500 !font-family-regular !line-clamp-1 !m-0 !mb-2.5 !flex !items-center !gap-1">
                              <MdOutlineLocationOn className="!text-slate-400 !text-xs !shrink-0" />
                              <span className="!truncate">{item?.address || "St. Kitts & Nevis"}</span>
                            </p>
                          </div>

                          {/* Price & Action Row */}
                          <div className="!pt-2 !border-t !border-slate-100 !flex !items-center !justify-between !mt-auto">
                            <div>
                              <span className="!text-[10px] !text-slate-400 !block !font-family-medium !leading-none !mb-0.5">
                                Price
                              </span>
                              <span className="!text-[14px] !font-family-bold !text-[#004a70]">
                                ${price} <span className="!text-[10px] !font-family-regular !text-slate-400">USD</span>
                              </span>
                            </div>

                            <div className="!flex !items-center !gap-2">
                              {/* View Details Link */}
                              <Link
                                href={`/popular/${item._id}`}
                                className="!text-[11.5px] !font-family-medium !text-slate-600 hover:!text-[#004a70] !transition-colors !no-underline !flex !items-center !gap-1 !py-1 !px-2 hover:!bg-slate-100 !rounded-lg"
                              >
                                <FaEye size={11} className="!text-slate-400" />
                                <span>Details</span>
                              </Link>

                              {/* Add / Added Circular Button */}
                              <button
                                type="button"
                                onClick={() => handleSelection(item)}
                                title={isAdded ? "Remove from Itinerary" : "Add to Itinerary"}
                                className={`!w-8 !h-8 !rounded-full !flex !items-center !justify-center !transition-all !duration-200 !cursor-pointer !border-none !shadow-xs ${
                                  isAdded
                                    ? "!bg-emerald-600 hover:!bg-emerald-700 !text-white !scale-105"
                                    : "!bg-[#004a70] hover:!bg-[#003855] !text-white hover:!scale-105"
                                }`}
                              >
                                {isAdded ? <FaCheck size={11} /> : <FaPlus size={11} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {Pagelength > 0 && (
                  <div className="!flex !justify-center !items-center !mt-7">
                    <CustomButton
                      onClick={ShowMoreDAta}
                      variant="primary"
                      size="md"
                      loading={MoreLoading}
                      className="!px-6 !py-2 !bg-[#004a70] hover:!bg-[#003855] !text-white !rounded-full !font-family-semibold !text-xs !shadow-xs !transition-colors !border-none"
                    >
                      See more
                    </CustomButton>
                  </div>
                )}
              </>
            ) : (
              <div className="!py-10">
                <EmptyState
                  imageSrc={NoshowData}
                  title="No Places Found"
                  showBg={false}
                  description="We couldn't find any places matching your selected category."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== 3. SLEEK SLIDE-OVER LEFT DRAWER ===== */}
      {showDrawer && (
        <div className="!fixed !inset-0 !z-[999999] !overflow-hidden animate-fade-in">
          {/* Backdrop */}
          <div
            className="!fixed !inset-0 !bg-slate-900/60 !backdrop-blur-xs !transition-opacity !z-[999998]"
            onClick={handleCloseDrawer}
          />

          <div className="!fixed !inset-y-0 !left-0 !max-w-full !flex !pr-10 !z-[999999]">
            <div className="!w-screen !max-w-md !bg-white !shadow-2xl !flex !flex-col !border-r !border-slate-200/80 animate-slide-in-left">
              {/* Drawer Header */}
              <div className="!px-5 !py-4 !border-b !border-slate-100 !flex !items-center !justify-between !bg-slate-50/70">
                <div className="!flex !items-center !gap-3">
                  <div className="!w-9 !h-9 !rounded-xl !bg-brand-50 !text-[#004a70] !flex !items-center !justify-center !shrink-0 !shadow-xs">
                    <FaLocationDot size={16} />
                  </div>
                  <div>
                    <h3 className="!text-sm sm:!text-base !font-family-semibold !text-slate-800 !m-0">
                      Your Tour Itinerary
                    </h3>
                    <p className="!text-[11.5px] !text-slate-500 !font-family-regular !m-0 !mt-0.5">
                      {MutiRides.length} stop{MutiRides.length !== 1 ? "s" : ""} selected for this trip
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="!w-8 !h-8 !rounded-full !bg-slate-100 hover:!bg-slate-200 !text-slate-500 hover:!text-slate-800 !flex !items-center !justify-center !transition-colors !cursor-pointer !border-none"
                >
                  <IoMdClose size={18} />
                </button>
              </div>

              {/* Drawer Body: Selected Stops List */}
              <div className="!p-4 sm:!p-5 !overflow-y-auto !flex-1 !space-y-3">
                {MutiRides.length > 0 ? (
                  MutiRides.map((item, index) => {
                    const imageUrl =
                      Array.isArray(item?.images) && item.images.length > 0
                        ? item.images[0]
                        : typeof item?.images === "string"
                          ? item.images
                          : "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&auto=format&fit=crop&q=80";

                    return (
                      <div
                        key={item._id || index}
                        className="!flex !items-center !justify-between !gap-3 !p-3 !bg-white hover:!bg-slate-50/90 !border !border-slate-200/80 !rounded-2xl !transition-all !shadow-xs group"
                      >
                        <div className="!flex !items-center !gap-3 !min-w-0 !flex-1">
                          {/* Place Thumbnail */}
                          <div className="!w-14 !h-14 !rounded-xl !overflow-hidden !bg-slate-100 !shrink-0">
                            <img
                              src={imageUrl}
                              alt={item?.title || "Place"}
                              className="!w-full !h-full !object-cover group-hover:!scale-105 !transition-transform duration-300"
                            />
                          </div>

                          {/* Details */}
                          <div className="!min-w-0 !flex-1">
                            <h4 className="!font-family-semibold !text-xs sm:!text-[13.5px] !text-slate-800 !truncate !m-0">
                              {item?.title}
                            </h4>

                            <p className="!text-[11px] !text-slate-400 !truncate !m-0 !mt-1 !flex !items-center !gap-1 !font-family-regular">
                              <MdOutlinePlace size={12} className="!shrink-0 !text-slate-400" />
                              <span className="!truncate">{item?.address || "St. Kitts & Nevis"}</span>
                            </p>

                            <span className="!text-[13px] !font-family-bold !text-[#004a70] !block !mt-1">
                              ${item?.location_price || 135} <span className="!text-[9.5px] !font-family-regular !text-slate-400">USD</span>
                            </span>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeIndex(index)}
                          title="Remove stop"
                          className="!w-8 !h-8 !rounded-full !text-slate-400 hover:!text-rose-600 hover:!bg-rose-50 !flex !items-center !justify-center !transition-colors !cursor-pointer !border-none !shrink-0"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="!text-center !py-16 !px-4">
                    <div className="!w-16 !h-16 !rounded-2xl !bg-sky-50 !text-[#004a70] !flex !items-center !justify-center !mx-auto !mb-3">
                      <MdOutlinePlace size={28} />
                    </div>
                    <p className="!text-sm !text-slate-700 !font-family-semibold !m-0">
                      Your itinerary is empty
                    </p>
                    <p className="!text-xs !text-slate-400 !font-family-regular !mt-1 !max-w-xs !mx-auto">
                      Click the + button on any place from the catalog to add stops to your custom tour.
                    </p>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="!p-4 sm:!p-5 !border-t !border-slate-100 !bg-slate-50/70 !space-y-3">
                <div className="!flex !items-center !justify-between">
                  <span className="!text-xs !text-slate-500 !font-family-medium">
                    Total Estimated Price
                  </span>
                  <span className="!text-lg sm:!text-xl !font-family-bold !text-[#004a70]">
                    ${TotalPrice} <span className="!text-xs !font-family-regular !text-slate-500">USD</span>
                  </span>
                </div>

                <div className="!flex !items-center !gap-2.5">
                  {MutiRides.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllItinerary}
                      className="!px-4 !py-2.5 !rounded-xl !text-xs !font-family-semibold !text-rose-600 hover:!bg-rose-50 !transition-colors !border !border-rose-200 !cursor-pointer !whitespace-nowrap !bg-white"
                    >
                      Clear All
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="!flex-1 !py-2.5 !rounded-xl !text-xs sm:!text-sm !font-family-semibold !bg-[#004a70] hover:!bg-[#003855] !text-white !transition-colors !cursor-pointer !border-none !shadow-sm !whitespace-nowrap !text-center"
                  >
                    Done & Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Geolocation Permissions Modal */}
      {ShowPermissionDialog && (
        <div className="!fixed !inset-0 !bg-slate-900/65 !backdrop-blur-sm !flex !items-center !justify-center !p-4 !z-[9999] animate-fade-in">
          <div className="!bg-white !rounded-3xl !p-5 md:!p-6 !shadow-2xl !max-w-sm !w-full !text-center !relative !border !border-slate-100">
            <div className="!w-14 !h-14 !rounded-full !bg-brand-50 !text-brand-600 !flex !items-center !justify-center !mx-auto !mb-3">
              <BiCurrentLocation size={26} />
            </div>
            <h2 className="!text-base !font-family-semibold !text-slate-900 !mb-1.5">
              Location Access Required
            </h2>
            <p className="!text-xs !text-slate-500 !font-family-regular !leading-relaxed !mb-5">
              Please enable location access to use this feature. You can enable it in your browser settings.
            </p>
            <div className="!flex !gap-2.5 !justify-center">
              <button
                type="button"
                onClick={() => setShowPermissionDialog(false)}
                className="!px-5 !py-2 !rounded-full !border-2 !border-slate-150 !bg-white !text-slate-550 hover:!bg-slate-50 !font-family-semibold !text-xs !transition-all !duration-200 !cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePermissionGuide}
                className="!px-5 !py-2 !rounded-full !bg-[#004a70] hover:!bg-[#003855] !text-white !font-family-semibold !text-xs !transition-all !duration-200 !border-none !cursor-pointer"
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
