/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
"use client";
import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Slider from "react-slick";
import ThingstodoCard from "./ThingstodoCard";
// import { useSelector } from "react-redux";
import { Button, Spinner } from "reactstrap";
import Image from "next/image";
import { NoshowData } from "../assets/Images";
import ApiFunction from "../ApiFunction/ApiFunction";
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
  const { getData, header1, postData } = ApiFunction();
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
        ...response?.categories,
      ]);
      setPagelength(response?.count?.currentPageSize);
      setMoreLoading(false);
    } catch (error) {
      setMoreLoading(false);
      console.log(error);
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
    setPredictions([]);
    setNoData(false);
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <div style={{ marginLeft: "1.4rem" }}>
          <h1 className="feedBack">Our Tour Recommendations</h1>
        </div>
        <div className="mt-2">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <div className={styles.searchWrapper}>
                <FaSearch />
                <Input
                  {...field}
                  placeholder="Search"
                  value={searchQuery}
                  className={styles.searchInput}
                  onChange={(e) => handleSearch(e.target.value)}
                  invalid={errors.name && true}
                />
                <ListGroup
                  style={{
                    position: "absolute",
                    zIndex: 10,
                    width: "100%",
                    left: 0,
                    right: "auto",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {predictions.map((prediction) => (
                    <ListGroupItem
                      key={prediction.place_id}
                      onClick={() => handlePredictionPress(prediction)}
                      style={{ cursor: "pointer" }}
                    >
                      {prediction.description}
                    </ListGroupItem>
                  ))}
                </ListGroup>
                {noData && <div>No results found</div>}
              </div>
            )}
          />
        </div>
      </div>

      <div className="slider-container p-2 ">
        <Slider {...settings2} key={Category.length}>
          {Category.map((category, index) => {
            const isSelected = selectedCategoryId === category._id;
            return (
              <div className="p-2">
                <div
                  className="CategoryMain text-center cursor-pointer"
                  style={{
                    padding: "10px",
                    background: isSelected
                      ? "linear-gradient(179.02deg, rgb(0, 74, 112) -69.5%, rgb(177, 176, 176) 99.16%)"
                      : "#ffff",
                    color: isSelected ? "white" : "black",
                    borderRadius: "9999px",
                    minWidth: "160px",
                    maxWidth: "250px",
                    overflow: "visible",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    margin: "0 auto",
                  }}
                  onClick={() => setSelectedCategoryId(category._id)}
                >
                  <h1 className="font-medium text-base">{category?.name}</h1>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>

      <div className="slider-container p-1">
        {/* Show spinner when location loading */}
        {locationLoading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "300px" }}
          >
            <div className="text-center">
              <Spinner
                size="lg"
                style={{
                  width: "3rem",
                  height: "3rem",
                  color: "#004a70",
                }}
              />
              <div className="mt-3">
                <h5 style={{ color: "#004a70" }}>
                  Loading recommendations for your location...
                </h5>
              </div>
            </div>
          </div>
        ) : /* Show content when not loading */
          SubCategory.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5  ">
                {SubCategory?.map((testimonial, index) => (
                  <ThingstodoCard
                    key={index}
                    testimonial={testimonial}
                    onClick={() => handleItemClick(testimonial)}
                    onClick2={() => handleSelection(testimonial)}
                  />
                ))}
              </div>
              <div className="flex justify-center items-center mt-5">
                {Pagelength > 0 ? (
                  <>
                    <Button
                      onClick={ShowMoreDAta}
                      className={`btnHome ${styles.roundedBtn}`}
                      style={{
                        width: "auto",
                        minWidth: "250px",
                        padding: "10px 24px",
                        // keep other styles unchanged
                        marginTop: 10,
                        margin: 0,
                        background: "linear-gradient(179.02deg, rgb(0, 74, 112) -69.5%, rgb(177, 176, 176) 99.16%)",
                        color: "#fff",
                        display: "inline-flex",
                        justifyContent: "center",
                        alignItems: "center",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textAlign: "center",
                        boxSizing: "border-box",
                        flexShrink: 0,
                      }}
                    >
                      {MoreLoading ? (
                        <>
                          <Spinner size={"sm"} color="#fff" />
                        </>
                      ) : (
                        "See more"
                      )}
                    </Button>
                  </>
                ) : (
                  ""
                )}
              </div>
            </>
          ) : (
            <div className="d-flex mt-5 flex-col justify-content-center align-items-center">
              <Image
                src={NoshowData}
                style={{
                  width: "200px",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "5px",
                  marginTop: "20px",
                }}
                alt="No data available"
              />
              <h1 className="font-medium text-xl mt-3">{"No Data Found!"}</h1>
            </div>
          )}
      </div>
    </div>
  );
}
