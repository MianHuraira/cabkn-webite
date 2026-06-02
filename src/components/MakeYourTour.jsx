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
import Select from "react-select";
import { Button, Form, Offcanvas, Spinner } from "react-bootstrap";
import { FaLocationDot } from "react-icons/fa6";
import { message, Space, TimePicker } from "antd";

import { Calendar, theme } from "antd";
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
    <div className="mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-4 p-4  ">
      <div className="RideForm col-span-12 md:col-span-4">
        <h1 className="rideHeader">Create custom tour</h1>
        <Form onSubmit={handleSubmit(onSubmit)} className="mt-3">
          <div className="mt-2">
            <Label for="startLocation">Start Location</Label>
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
                    />
                    {errors.name && (
                      <FormFeedback>{errors.name.message}</FormFeedback>
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
                            onClick={() => handlePredictionPress(prediction)}
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
              <BiCurrentLocation
                className="cursor-pointer"
                size={30}
                onClick={getLocation}
              />
            </div>
          </div>

          <div className="mt-2">
            <Label for="startLocation">End Location</Label>
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
                  />
                  {errors.metaTitle && (
                    <FormFeedback>{errors.metaTitle.message}</FormFeedback>
                  )}
                  {PridicLoadingEnd && <div>Loading...</div>}
                  {EndPredictions.length > 0 && (
                    <ListGroup
                      style={{
                        position: "absolute",
                        zIndex: 10,
                        width: "100%",
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      {EndPredictions.map((prediction) => (
                        <ListGroupItem
                          key={prediction.place_id}
                          onClick={() => HadleEndPridication(prediction)}
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

          <Button type="submit" className="btnForm mt-5" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : "Next"}
          </Button>
        </Form>
      </div>
      <div
        className="col-span-12 md:col-span-8"
        style={{
          maxHeight: "90vh", // Adjust height as needed
          overflowY: "auto", // Enables vertical scrolling
          overflowX: "hidden", // Prevents horizontal scrolling
          paddingBottom: "15rem",
        }}
      >
        <h1 className="font-medium text-xl ms-3">
          Add places to your itinerary
        </h1>

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
                        ? "linear-gradient(179.02deg, rgb(0, 74, 112) -69.5%, rgb(177, 176, 176) 99.16%)" // Gradient when selected
                        : "#ffff", // Default neutral gradient
                      color: isSelected ? "white" : "black",
                      borderRadius: "5px",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => setSelectedCategoryId(category._id)} // Set only the clicked ID
                  >
                    <h1 className="font-medium text-base">{category?.name}</h1>
                  </div>
                </div>
              );
            })}
          </Slider>
        </div>

        {SubCategory.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
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
            <div className="flex justify-center items-center mt-5">
              {Pagelength > 0 ? (
                <>
                  <Button
                    onClick={ShowMoreDAta}
                    className="btnHome"
                    style={{
                      width: 100,
                      marginTop: 10,
                      margin: 0,
                      background:
                        "linear-gradient(179.02deg, rgb(0, 74, 112) -69.5%, rgb(177, 176, 176) 99.16%)",
                      marginBottom: 100,
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
                objectFit: "cover", // Ensure the image covers the card nicely
                borderRadius: "5px",
              }}
              alt="No data available"
            />
            <h1 className="font-medium text-xl mt-3">{"No Data Found!"}</h1>
          </div>
        )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
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
