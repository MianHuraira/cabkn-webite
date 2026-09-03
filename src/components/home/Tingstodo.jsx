/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import ThingstodoCard from "./ThingstodoCard";
// import { useSelector } from "react-redux";
import { Button, Spinner } from "reactstrap";
import Image from "next/image";
import CustomButton from "../CustomButton";
import EmptyState from "../EmptyState";
import { NoshowData } from "../assets/Images";
import { useApi } from "../ApiFunction/ApiFunction";
import { useRouter } from "next/navigation";
import { Loader } from "@googlemaps/js-api-loader";
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
import { FaSearch } from "react-icons/fa";
import { HiX } from "react-icons/hi";
import styles from "./Tingstodo.module.css";

const schema = yup.object().shape({
  name: yup.string().required("Start Location is required"),
});

export default function Tingstodo() {
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  const { getData, header1, postData } = useApi();
  const [Category, setCategory] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [SubCategory, setSubCategory] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // const userData = useSelector((state) => state.auth.user?.user);
  const [loading, setloading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false); // New loading state for location search
  const [noData, setNoData] = useState(false);

  const [Count, setCount] = useState(1);
  const [Pagelength, setPagelength] = useState("");
  const [MoreLoading, setMoreLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [Currentlocation, setCurrentLocation] = useState({
    latitude: null,
    longitude: null,
    address: "",
  });

  const [locationDetails, setLocationDetails] = useState({
    address: "",
    lat: null,
    lng: null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [PridicLoading, setPridicLoading] = useState(false);

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
      stop: "",
    },
  });

  const [categoryError, setCategoryError] = useState(false);
  const [subCategoryError, setSubCategoryError] = useState(false);

  const getCategory = async () => {
    setCategoryLoading(true);
    try {
      setCategoryError(false);
      const response = await getData("/webcat/all/1", header1);
      const staticCategory = { _id: 0, name: "All" };
      const updatedCategories = [
        staticCategory,
        ...(response?.categories || []),
      ];

      setCategory(updatedCategories);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategoryError(true);
      // Set at least the "All" category to show something
      setCategory([{ _id: 0, name: "All" }]);
    } finally {
      setCategoryLoading(false);
    }
  };

  const getCategorydata = async () => {
    setloading(true);
    try {
      setSubCategoryError(false);
      const response = await getData(
        selectedCategoryId === 0
          ? `/websubcat/all/${1}`
          : `/websubcat/all/${1}/${selectedCategoryId}`,
        header1
      );
      setSubCategory(response?.categories || []);
      setPagelength(response?.count?.currentPageSize);
    } catch (error) {
      console.error("Failed to load category data:", error);
      setSubCategoryError(true);
      setSubCategory([]);
    } finally {
      setloading(false);
    }
  };

  const getDataByLocation = async () => {
    setLocationLoading(true); // Start loading
    try {
      const body = {
        location: { lat: locationDetails?.lat, lng: locationDetails?.lng },
      };

      const res = await postData("websubcat/recommended", body);
      setSubCategory(res?.data?.categories || []);
      setPagelength(res?.data?.pagination?.itemsPerPage);
      setLocationLoading(false); // Stop loading on success
    } catch (error) {
      setLocationLoading(false); // Stop loading on error
    }
  };

  useEffect(() => {
    if (locationDetails?.lat) {
      getDataByLocation();
    }
  }, [locationDetails?.lat]);

  useEffect(() => {
    getCategorydata();
  }, [selectedCategoryId]);

  const ShowMoreDAta = async () => {
    setCount(Count + 1);
    setMoreLoading(true);

    try {
      const response = await getData(
        selectedCategoryId === 0
          ? `/websubcat/all/${Count + 1}`
          : `/websubcat/all/${Count + 1}/${selectedCategoryId}`,
        header1
      );
      setSubCategory((prevCategories) => [
        ...prevCategories,
        ...(response?.categories || []),
      ]);
      setPagelength(response?.count?.currentPageSize);
    } catch (error) {
      console.error("Failed to load more data:", error);
      // Don't increment count if there was an error
      setCount(Count);
    } finally {
      setMoreLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await getCategory();
      getCategorydata();
    };
    loadData();
  }, []);

  const settings2 = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 8,
    slidesToScroll: 3,
    arrows: false,
    autoplay: false,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    centerMode: false,
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

  const handleSelection = (category) => {
    if (category?._id) {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`tour_${category._id}`, JSON.stringify(category));
          sessionStorage.setItem("selected_tour", JSON.stringify(category));
        } catch (e) {
          console.warn("sessionStorage save error:", e);
        }
      }
      router.push(`/popular/${category._id}`);
    }
  };

  const handleItemClick = (item) => {
    if (item?._id) {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`tour_${item._id}`, JSON.stringify(item));
          sessionStorage.setItem("selected_tour", JSON.stringify(item));
        } catch (e) {
          console.warn("sessionStorage save error:", e);
        }
      }
      router.push(`/popular/${item._id}`);
    }
  };

  const sectionRef = useRef(null);
  const searchRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setPredictions([]);
        setNoData(false);
        setPridicLoading(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (!text || text.trim() === "") {
      setPredictions([]);
      setNoData(false);
      setPridicLoading(false);
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
                            place_id: prediction.place_id,
                            latLng: result.geometry.location.toJSON(),
                            photoUrl: result.photos && result.photos.length > 0 ? result.photos[0].getUrl({ maxWidth: 100, maxHeight: 100 }) : null,
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
    setPredictions([]);
    setNoData(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setValue("name", "");
    setPredictions([]);
    setNoData(false);
    setPridicLoading(false);
  };

  return (
    <div ref={sectionRef} className="w-full max-w-full overflow-hidden">
      <Container>
        <div className={`flex flex-col select-none lg:flex-row justify-between items-start lg:items-center !mb-2 mt-5 gap-3 px-1 reveal ${inView ? "visible" : ""}`} style={{ transitionDelay: "50ms", position: "relative", zIndex: 100 }}>
        <div className="flex flex-col text-left w-full lg:w-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-family-semibold text-slate-800 tracking-tight m-0 leading-tight">
            Top Locations
          </h2>
          <p className="text-slate-500 font-family-regular text-sm sm:text-[15px] !m-0 mt-0.5">
            Places travelers love right now
          </p>
        </div>
        <div className="w-full lg:w-[300px] shrink-0 relative z-[100]" ref={searchRef}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <div className="relative w-full">
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                    <FaSearch className="w-3.5 h-3.5" />
                  </div>
                  <input
                    {...field}
                    type="text"
                    placeholder="Search locations..."
                    value={searchQuery}
                    className="!w-full !pl-10 !pr-10 !py-2.5 !rounded-xl !bg-white !border !border-gray-200 !text-[13.5px] !text-gray-900 !placeholder-gray-400 focus:!outline-none focus:!ring-1 focus:!ring-primary-500 focus:!ring-offset-1 focus:!border-none !transition-all !duration-200 !shadow-sm hover:!shadow-md"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  {PridicLoading ? (
                    <div className="absolute right-3 flex items-center z-10">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
                    </div>
                  ) : searchQuery ? (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors !border-none z-10"
                      aria-label="Clear search"
                    >
                      <HiX size={12} />
                    </button>
                  ) : null}
                </div>

                {predictions.length > 0 && (
                  <div className="absolute z-[100] w-full mt-2 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-fade-in-down">
                    <ul className="max-h-[300px] overflow-y-auto m-0 p-1.5 list-none">
                      {predictions.map((prediction, index) => (
                        <li
                          key={prediction.place_id || index}
                          onClick={() => handlePredictionPress(prediction)}
                          className="px-3.5 py-2.5 border-0 rounded-xl mb-1 last:mb-0 cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:text-[#004a70] flex flex-row items-center gap-3"
                        >
                          {prediction.photoUrl ? (
                            <div className="flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden shadow-sm bg-slate-100">
                              <img src={prediction.photoUrl} alt="Location" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#004a70]/10 flex items-center justify-center text-[#004a70] shadow-sm">
                              <FaSearch className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <span className="font-family-medium text-slate-700 text-sm truncate flex-1 block">{prediction.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                  {noData && (
                    <div className="absolute z-[100] w-full mt-2 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 p-4 text-center flex flex-col items-center gap-2 animate-fade-in-down">
                      <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                        <FaSearch className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-slate-500 font-family-medium text-xs">No results found</span>
                    </div>
                  )}
              </div>
            )}
          />
        </div>
      </div>

      <div className="p-1 w-full max-w-full overflow-hidden">
        {/* Show spinner when location loading or category loading */}
        {locationLoading || loading ? (
          <div className="w-full py-4">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="w-[280px] sm:w-[300px] shrink-0 bg-white rounded-[20px] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col h-[380px] animate-pulse">
                  <div className="bg-slate-200/70 h-[180px] w-full"></div>
                  <div className="p-4 flex-1 flex flex-col gap-4">
                    <div className="flex justify-between items-center gap-4">
                      <div className="bg-slate-200/70 h-5 w-3/4 rounded-full"></div>
                      <div className="bg-slate-200/70 h-5 w-1/4 rounded-full"></div>
                    </div>
                    <div className="bg-slate-200/70 h-4 w-1/2 rounded-full"></div>
                    <div className="mt-auto bg-slate-200/70 h-11 w-full rounded-[9999px]"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : /* Show content when not loading */
          SubCategory.length > 0 ? (
            <div className="w-full max-w-full overflow-hidden pb-1">
              <Swiper
                slidesPerView={1.15}
                spaceBetween={14}
                className="w-full top-locations-swiper !py-1"
                breakpoints={{
                  0: { slidesPerView: 1.15, spaceBetween: 12 },
                  480: { slidesPerView: 1.5, spaceBetween: 14 },
                  640: { slidesPerView: 2.2, spaceBetween: 16 },
                  768: { slidesPerView: 2.8, spaceBetween: 18 },
                  1024: { slidesPerView: 3.5, spaceBetween: 20 },
                  1280: { slidesPerView: 4.1, spaceBetween: 20 },
                }}
              >
                {SubCategory?.map((testimonial, index) => (
                  <SwiperSlide key={testimonial._id || index} className="h-auto flex">
                    <div className="w-full h-full flex flex-col">
                      <ThingstodoCard
                        testimonial={testimonial}
                        onClick={() => handleItemClick(testimonial)}
                        onClick2={() => handleSelection(testimonial)}
                      />
                    </div>
                  </SwiperSlide>
                ))}

                {/* Final "See More" Card Slide */}
                <SwiperSlide className="h-auto flex">
                  <div
                    onClick={() => router.push("/top-locations")}
                    className="w-full h-full min-h-[240px] sm:min-h-[250px] rounded-2xl bg-gradient-to-br from-[#002842] via-[#004a70] to-[#006699] p-4 sm:p-5 flex flex-col items-center justify-center text-center text-white cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden !border !border-white/15 select-none"
                  >
                    {/* Ambient Glow */}
                    <div className="absolute -top-12 -right-12 w-28 h-28 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-sky-400/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                    {/* Icon Badge */}
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/15 backdrop-blur-md !border !border-white/30 flex items-center justify-center text-white mb-2 sm:mb-2.5 shadow-inner group-hover:scale-105 group-hover:bg-white/30 transition-all duration-300">
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="text-white group-hover:translate-x-0.5 transition-transform duration-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>

                    <h3 className="text-base sm:text-lg font-family-semibold !font-bold text-white !m-0 mb-1 tracking-tight">
                      Explore All
                    </h3>
                    <p className="text-white/80 text-[11.5px] sm:text-xs font-family-regular !font-normal !m-0 mb-3 sm:mb-3.5 max-w-[200px] leading-relaxed">
                      Discover all top attractions, restaurants & places.
                    </p>

                    <span className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white text-[#004a70] font-family-semibold !font-semibold text-[11px] sm:text-xs shadow-xs group-hover:bg-sky-50 transition-all">
                      <span>View All</span>
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform duration-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>
          ) : (
            <EmptyState
              imageSrc={NoshowData}
              inView={inView}
              title="No Recommendations Found"
              description="We couldn't find any tours or activities matching your selection. Try exploring other categories!"
            />
          )}
        </div>
      </Container>
    </div>
  );
}
