/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
"use client";

import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import ThingstodoCard from "@/components/home/ThingstodoCard";
import CustomButton from "@/components/CustomButton";
import EmptyState from "@/components/EmptyState";
import { NoshowData } from "@/components/assets/Images";
import { useApi } from "@/components/ApiFunction/ApiFunction";
import { useRouter } from "next/navigation";
import { Loader } from "@googlemaps/js-api-loader";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaSearch } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { HiX } from "react-icons/hi";
import { MdOutlineExplore, MdOutlinePlace } from "react-icons/md";
import Link from "next/link";

const schema = yup.object().shape({
  name: yup.string().required("Location is required"),
});

export default function TopLocationsPage() {
  const router = useRouter();
  const { getData, header1, postData } = useApi();

  const [Category, setCategory] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [SubCategory, setSubCategory] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const [Count, setCount] = useState(1);
  const [Pagelength, setPagelength] = useState("");
  const [MoreLoading, setMoreLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);

  const [locationDetails, setLocationDetails] = useState({
    address: "",
    lat: null,
    lng: null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [PridicLoading, setPridicLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { control, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: "" },
  });

  const searchRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const getCategory = async () => {
    setCategoryLoading(true);
    try {
      const response = await getData("/webcat/all/1", header1);
      const staticCategory = { _id: 0, name: "All" };
      setCategory([staticCategory, ...(response?.categories || [])]);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategory([{ _id: 0, name: "All" }]);
    } finally {
      setCategoryLoading(false);
    }
  };

  const getCategorydata = async () => {
    setLoading(true);
    setCount(1);
    try {
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
      setSubCategory([]);
    } finally {
      setLoading(false);
    }
  };

  const getDataByLocation = async () => {
    setLocationLoading(true);
    try {
      const body = {
        location: { lat: locationDetails?.lat, lng: locationDetails?.lng },
      };
      const res = await postData("websubcat/recommended", body);
      setSubCategory(res?.data?.categories || []);
      setPagelength(res?.data?.pagination?.itemsPerPage);
    } catch (error) {
      console.error("Failed to load location recommendations:", error);
    } finally {
      setLocationLoading(false);
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
    setCount((prev) => prev + 1);
    setMoreLoading(true);

    try {
      const nextPage = Count + 1;
      const response = await getData(
        selectedCategoryId === 0
          ? `/websubcat/all/${nextPage}`
          : `/websubcat/all/${nextPage}/${selectedCategoryId}`,
        header1
      );
      setSubCategory((prevCategories) => [
        ...prevCategories,
        ...(response?.categories || []),
      ]);
      setPagelength(response?.count?.currentPageSize);
    } catch (error) {
      console.error("Failed to load more data:", error);
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
        async (preds, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            const placesService = new google.maps.places.PlacesService(
              document.createElement("div")
            );
            const detailedPredictions = await Promise.all(
              preds.map(
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
                            photoUrl:
                              result.photos && result.photos.length > 0
                                ? result.photos[0].getUrl({
                                  maxWidth: 100,
                                  maxHeight: 100,
                                })
                                : null,
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
        }
      );
    } catch (error) {
      console.error("Error importing Places API:", error);
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

  const selectedCategoryObj = Category.find((c) => c._id === selectedCategoryId);
  const currentCategoryName = selectedCategoryObj ? selectedCategoryObj.name : "All";

  return (
    <div className={`min-h-screen bg-[#f8fafc] font-poppins text-slate-800 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      {/* ===== 1. HERO HEADER (Same as /admin) ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#001726] via-[#002f4a] to-[#001f33] !pt-20 sm:!pt-28 !pb-24 sm:!pb-28 text-white">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001726]/90 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb row */}
          <div className="flex items-center gap-2 text-slate-300 text-xs font-family-medium mb-2.5">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors no-underline">
              Home
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-white">Top Locations</span>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 !border !border-white/15">
                <MdOutlineExplore size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-family-semibold text-white tracking-tight !m-0 leading-tight">
                  Top Locations
                </h1>
                <p className="text-slate-300 text-xs !mt-0.5 !m-0 font-family-regular">
                  Places travelers love right now in Saint Kitts & Nevis
                </p>
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* ===== 2. TABS & MAIN CONTENT GRID (Same layout as /admin) ===== */}
      <div className="!-mt-12 sm:!-mt-14 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-20 !pb-16">
        {/* Swiper Category Tabs */}
        <div className="w-full max-w-full overflow-hidden !mb-8">
          {categoryLoading ? (
            <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-hide">
              {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                <div
                  key={item}
                  className="flex-shrink-0 w-28 h-10 bg-white/80 rounded-full animate-pulse !border !border-slate-200"
                />
              ))}
            </div>
          ) : (
            <Swiper
              modules={[FreeMode, Mousewheel]}
              slidesPerView="auto"
              spaceBetween={10}
              freeMode={true}
              mousewheel={{ forceToAxis: true }}
              className="w-full py-1 category-swiper"
            >
              {Category?.map((category, index) => {
                const isSelected = selectedCategoryId === category._id;
                return (
                  <SwiperSlide key={category._id || index} style={{ width: "auto" }}>
                    <button
                      onClick={() => setSelectedCategoryId(category._id)}
                      className={`cursor-pointer transition-all duration-300 select-none flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-family-semibold whitespace-nowrap !border shadow-none ${isSelected
                          ? "text-white bg-[#004a70] !border-[#004a70]"
                          : "text-slate-700 bg-white !border-slate-200/90 hover:!border-[#004a70] hover:bg-slate-50 hover:text-[#004a70]"
                        }`}
                    >
                      <span>{category?.name}</span>
                    </button>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </div>

        {/* Section Sub-header & Search Input Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 !mb-6 px-1">
          <div>
            <h3 className="text-base sm:text-lg font-family-semibold text-slate-900 !m-0">
              {currentCategoryName === "All" ? "All Locations" : `${currentCategoryName} Places`}
            </h3>
            <p className="text-slate-500 text-xs font-family-regular !m-0 !mt-0.5">
              Browse top picks and book your ride seamlessly
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-[280px] shrink-0 relative z-[50]" ref={searchRef}>
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
                      className="!w-full !pl-10 !pr-10 !py-2 !rounded-xl !bg-white !border !border-slate-200/90 !text-[13px] !text-slate-800 !placeholder-slate-400 focus:!outline-none focus:!ring-1 focus:!ring-[#004a70] focus:!border-[#004a70] !transition-all !duration-200 !shadow-sm hover:!shadow-md"
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
                        className="absolute right-2.5 w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors !border-none z-10"
                        aria-label="Clear search"
                      >
                        <HiX size={12} />
                      </button>
                    ) : null}
                  </div>

                  {predictions.length > 0 && (
                    <div className="absolute z-[100] w-full mt-2 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-fade-in-down">
                      <ul className="max-h-[280px] overflow-y-auto m-0 p-1.5 list-none">
                        {predictions.map((prediction, index) => (
                          <li
                            key={prediction.place_id || index}
                            onClick={() => handlePredictionPress(prediction)}
                            className="px-3.5 py-2.5 border-0 rounded-xl mb-1 last:mb-0 cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:text-[#004a70] flex flex-row items-center gap-3"
                          >
                            {prediction.photoUrl ? (
                              <div className="flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden shadow-sm bg-slate-100">
                                <img
                                  src={prediction.photoUrl}
                                  alt="Location"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#004a70]/10 flex items-center justify-center text-[#004a70] shadow-sm">
                                <FaSearch className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <span className="font-family-medium text-slate-700 text-sm truncate flex-1 block">
                              {prediction.description}
                            </span>
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
                      <span className="text-slate-500 font-family-medium text-xs">
                        No results found
                      </span>
                    </div>
                  )}
                </div>
              )}
            />
          </div>
        </div>

        {/* Content Section - Pure Grid Layout (NO SWIPER ON ANY SCREEN) */}
        {locationLoading || loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl overflow-hidden shadow-sm !border !border-slate-200/90 flex flex-col h-[380px] animate-pulse"
              >
                <div className="bg-slate-200/70 h-[180px] w-full" />
                <div className="p-4 flex-1 flex flex-col gap-4">
                  <div className="flex justify-between items-center gap-4">
                    <div className="bg-slate-200/70 h-5 w-3/4 rounded-full" />
                    <div className="bg-slate-200/70 h-5 w-1/4 rounded-full" />
                  </div>
                  <div className="bg-slate-200/70 h-4 w-1/2 rounded-full" />
                  <div className="mt-auto bg-slate-200/70 h-10 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : SubCategory.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
              {SubCategory?.map((testimonial, index) => (
                <div key={testimonial._id || index} className="flex h-full">
                  <ThingstodoCard
                    testimonial={testimonial}
                    onClick={() => handleItemClick(testimonial)}
                    onClick2={() => handleSelection(testimonial)}
                  />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {Pagelength > 0 && (
              <div className="flex justify-center items-center mt-10">
                <CustomButton
                  onClick={ShowMoreDAta}
                  loading={MoreLoading}
                  className="font-family-semibold !px-8 !py-3 !rounded-full shadow-sm hover:shadow-md transition-all"
                >
                  Load More Locations
                </CustomButton>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl p-8 sm:p-12 !border !border-slate-200/90 shadow-sm mt-2 text-center">
            <EmptyState
              imageSrc={NoshowData}
              inView={true}
              title="No Locations Found"
              description="We couldn't find any locations matching your selected category. Try selecting another category or clearing your search."
            />
          </div>
        )}
      </div>
    </div>
  );
}
