/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Slider from "react-slick";
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
      console.log(body);

      const res = await postData("websubcat/recommended", body);
      setSubCategory(res?.data?.categories || []);
      setPagelength(res?.data?.pagination?.itemsPerPage);
      setLocationLoading(false); // Stop loading on success
    } catch (error) {
      console.log(error);
      console.log("=========error", error?.response?.data);
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
    getCategory();
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
    router.push(`/popular/${category?._id}`);
  };

  const handleItemClick = (item) => {
    const encodedData = encodeURIComponent(JSON.stringify(item));
    router.push(`/ride?data=${encodedData}`);
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

  return (
    <div ref={sectionRef}>
      <div className={`container mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 mt-12 gap-5 reveal ${inView ? "visible" : ""}`} style={{ padding: "0 16px", transitionDelay: "50ms", position: "relative", zIndex: 100 }}>
        <div className="flex flex-col text-left w-full lg:w-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-['Inter-Bold'] text-slate-800 tracking-tight m-0 leading-tight">
            Our Tour Recommendations
          </h2>
        </div>
        <div className="w-full lg:w-[400px] shrink-0 relative z-[100]" ref={searchRef}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <div className="relative group w-full">
                <div className="flex items-center w-full px-3 py-0.5 bg-white border border-slate-200 rounded-[9999px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(0,74,112,0.1)] hover:border-brand-300 focus-within:!border-primary focus-within:!ring-4 focus-within:!ring-brand-100">
                  <FaSearch className="text-slate-400 group-focus-within:text-primary transition-colors duration-300 w-4 h-4 ml-2" />
                  <Input
                    {...field}
                    placeholder="Search locations..."
                    value={searchQuery}
                    className="flex-1 !border-none !shadow-none !outline-none !ring-0 !bg-transparent !py-1.5 !px-3 text-slate-700 font-['Inter-Medium'] placeholder:text-slate-400 placeholder:font-normal text-sm"
                    onChange={(e) => handleSearch(e.target.value)}
                    invalid={errors.name && true}
                    style={{ boxShadow: 'none', background: 'transparent', border: 'none', minHeight: 'unset' }}
                  />
                  {PridicLoading && <Spinner size="sm" color="#004a70" className="mr-2" />}
                </div>

                {predictions.length > 0 && (
                  <div className="absolute z-[100] w-full mt-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-fade-in-down">
                    <ul className="max-h-[300px] overflow-y-auto m-0 p-2 list-none">
                      {predictions.map((prediction, index) => (
                        <li
                          key={prediction.place_id || index}
                          onClick={() => handlePredictionPress(prediction)}
                          className="px-4 py-3 border-0 rounded-xl mb-1 last:mb-0 cursor-pointer transition-all duration-200 hover:bg-brand-50 hover:text-primary flex flex-row items-center gap-3"
                        >
                          {prediction.photoUrl ? (
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden shadow-sm bg-slate-100">
                              <img src={prediction.photoUrl} alt="Location" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                              <FaSearch className="w-4 h-4" />
                            </div>
                          )}
                          <span className="font-['Inter-Medium'] text-slate-700 text-sm truncate flex-1 block">{prediction.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {noData && (
                  <div className="absolute z-[100] w-full mt-3 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 p-5 text-center flex flex-col items-center gap-2 animate-fade-in-down">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <FaSearch className="w-4 h-4" />
                    </div>
                    <span className="text-slate-500 font-['Inter-Medium'] text-sm">No results found</span>
                  </div>
                )}
              </div>
            )}
          />
        </div>
      </div>

      <div className={`slider-container container mx-auto p-2 reveal ${inView ? "visible" : ""}`} style={{ transitionDelay: "150ms" }}>
        <Slider {...settings2} key={Category.length}>
          {Category.map((category, index) => {
            const isSelected = selectedCategoryId === category._id;
            return (
              <div className="p-2" key={index}>
                <div
                  className={`CategoryMain text-center cursor-pointer capitalize transition-all duration-300 ${isSelected
                    ? "text-white shadow-[0_2px_8px_rgba(0,74,112,0.25)]"
                    : "text-slate-800 bg-white border border-slate-200 hover:border-brand-600 hover:bg-slate-100"
                    }`}
                  style={{
                    padding: "10px 14px",
                    background: isSelected
                      ? "#004a70"
                      : "",
                    borderRadius: "9999px",
                    minWidth: "120px",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: isSelected ? "none" : "",
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

      <div className="slider-container container mx-auto p-3">
        {/* Show spinner when location loading */}
        {locationLoading ? (
          <div className="w-full py-4">
            <div className="flex justify-center mb-8">
              <div className="px-6 py-2.5 bg-brand-50 text-primary font-['Inter-Medium'] rounded-full text-sm animate-pulse border border-brand-100 flex items-center gap-3 shadow-sm">
                <Spinner size="sm" color="#004a70" />
                <span>Loading recommendations for your location...</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col h-[340px] animate-pulse">
                  <div className="bg-slate-200/70 h-[210px] w-full"></div>
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                {SubCategory?.map((testimonial, index) => (
                  <div key={index} className={`reveal ${inView ? "visible" : ""}`} style={{ transitionDelay: `${index * 60}ms` }}>
                    <ThingstodoCard
                      testimonial={testimonial}
                      onClick={() => handleItemClick(testimonial)}
                      onClick2={() => handleSelection(testimonial)}
                    />
                  </div>
                ))}
              </div>
              <div className={`flex justify-center items-center mt-5 reveal ${inView ? "visible" : ""}`} style={{ transitionDelay: "400ms" }}>
                {Pagelength > 0 ? (
                  <>
                    <CustomButton
                      onClick={ShowMoreDAta}
                      loading={MoreLoading}
                    >
                      See more
                    </CustomButton>
                  </>
                ) : (
                  ""
                )}
              </div>
            </>
          ) : (
            <EmptyState
              imageSrc={NoshowData}
              inView={inView}
              title="No Recommendations Found"
              description="We couldn't find any tours or activities matching your selection. Try exploring other categories!"
            />
          )}
      </div>
    </div>
  );
}
