"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
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
import { Button, Form, Spinner } from "react-bootstrap";
import { FaLocationDot } from "react-icons/fa6";
import { MdOutlineMyLocation } from "react-icons/md";
import { message, Space, TimePicker } from "antd";
import { Checkbox } from "antd";

import { Calendar, theme } from "antd";
import moment from "moment";
import { Loader } from "@googlemaps/js-api-loader";
import { getDistance } from "geolib";
import { IoMdCloseCircle } from "react-icons/io";
import { IoMdAddCircleOutline } from "react-icons/io";
import { BiCurrentLocation } from "react-icons/bi";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useRouter, useSearchParams } from "next/navigation";

const RidePage = () => {
  const searchParams = useSearchParams();
  const encodedData = searchParams.get("data");
  const router = useRouter();
  const [Currentlocation, setCurrentLocation] = useState({
    latitude: null,
    longitude: null,
    address: "",
  });

  const [error, setError] = useState("");
  const [ShowPermissionDialog, setShowPermissionDialog] = useState(false);
  const { getData, header1 } = ApiFunction();
  const [Next, setNext] = useState(false);
  const [lastId, setLastId] = useState(1);
  const [MutiplePrice, setMutiplePrice] = useState("");
  const [distance, setDistance] = useState("");
  const [Rideprice, setPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [Count, setCount] = useState("");
  const [RowData, setRowData] = useState([]);

  const [productData, setProductData] = useState("");
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [TypeRide, setTypeRide] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [noData, setNoData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [PridicLoading, setPridicLoading] = useState(false);
  const [StopPredictions, setStopPredictions] = useState([]);
  const [SearchQueryStop, setSearchQueryStop] = useState("");
  const [PridicLoadingStop, setPridicLoadingStop] = useState(false);

  const [EndPredictions, setEndPredictions] = useState([]);
  const [SearchQueryEnd, setSearchQueryEnd] = useState("");
  const [PridicLoadingEnd, setPridicLoadingEnd] = useState(false);

  const [RideTime, SetRideTime] = useState("");

  const [Schuale, setSchuale] = useState(false);

  const [selectedStop, setSelectedStop] = useState(null);
  const [FavUserId, setFavUserId] = useState("");

  const schema = yup.object().shape({
    name: yup.string().required("Start Location is required"),
    metaTitle: yup.string().required("End Location is required"),
    category: yup.string().required("Category is required"),
    Type: yup.string(),
    travlers: yup.number().when([], {
      is: () => {
        const travelers = Number(RowData?.travelers); // Convert to number if possible
        return !isNaN(travelers) && travelers > 0; // Only validate if it's a valid positive number
      },
      then: (schema) =>
        schema
          .required("Number of travelers is required")
          .test(
            "is-less-than-parsedTravelers",
            `${RowData?.travelers} Travelers Available`,
            function (value) {
              const travelers = Number(RowData?.travelers); // Convert to number
              return (
                typeof value === "number" &&
                !isNaN(value) &&
                !isNaN(travelers) &&
                value > 0 &&
                value <= travelers
              );
            }
          ),
      otherwise: (schema) => schema.notRequired(), // Make it optional if travelers is undefined, null, or not a valid number
    }),
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

  const wrapperStyle = {
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    marginTop: 15,
    marginBottom: 15,
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

  useEffect(() => {
    try {
      const row = encodedData
        ? JSON.parse(decodeURIComponent(encodedData))
        : null;

      if (row) {
        setFavUserId(row?.favUserId);
        
        setRowData(row);
        if (row?.time) {
          const time = JSON?.parse(row?.time);
          SetRideTime(time);
          setSchuale(time ? true : false);
        }
        if (row) {
          setValue("metaTitle", row?.address || "");
          setSearchQueryEnd(row.address);
          setLocationDetails1({
            address: row?.address || "",
            lat: row?.lat || 0,
            lng: row?.lng || 0,
          });
          locationSet(row);
        }
      }
    } catch (error) {
      console.error("Error parsing row or data:", error);
    }
  }, [Currentlocation?.latitude]);

  const onPanelChange = (value, mode) => {
    <></>
  };

  const onChangeTime = (time, timeString) => {
    <></>
  };

  const onChangeSchedule = (e) => {
    setSchuale(e.target.checked);
  };

  mapboxgl.accessToken =
    "pk.eyJ1IjoibWFybGVncmFudCIsImEiOiJjbTgwdmV0MjkweXB2MnFzNXBjM2x6NThnIn0.3oz3YGaDHiFDh8W5ALk09w";

  const locationSet = (data) => {
    const start = Currentlocation?.longitude
      ? [Currentlocation?.longitude, Currentlocation?.longitude]
      : [locationDetails?.lng, locationDetails.lat];
    console.log(start)

    const end = data?.lat
      ? [data?.lng, data?.lat]
      : [locationDetails1?.lng, locationDetails1.lat];

    if (mapRef.current) {
      mapRef.current.remove();
    }

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: start ?? [17.363747, -62.754593],
      zoom: 8,
    });

    new mapboxgl.Marker({ color: "green" })
      .setLngLat(start)
      .addTo(mapRef.current);

    mapRef.current.on("load", () => {
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=pk.eyJ1IjoibWFybGVncmFudCIsImEiOiJjbTgwdmV0MjkweXB2MnFzNXBjM2x6NThnIn0.3oz3YGaDHiFDh8W5ALk09w`;

      fetch(directionsUrl)
        .then((response) => response.json())
        .then((data) => {
          const route = data.routes[0]?.geometry?.coordinates;

          if (!route || route.length === 0) {
            console.error("No route found.");
            return;
          }

          const bounds = new mapboxgl.LngLatBounds();
          route.forEach((coord) => bounds.extend(coord));

          const start = {
            latitude: locationDetails?.lat,
            longitude: locationDetails?.lng,
          };
          const end = {
            latitude: locationDetails1?.lat,
            longitude: locationDetails1?.lng,
          };

          const distance = getDistance(start, end) / 1000; // Convert meters to kilometers

          setDistance(distance.toFixed(1));

          mapRef.current.fitBounds(bounds, { padding: 50 });

          const animateMarker = (route) => {
            let index = 0;
            const marker = new mapboxgl.Marker({ color: "blue" })
              .setLngLat(route[index])
              .addTo(mapRef.current);

            const moveMarker = () => {
              if (index < route.length - 1) {
                index++;
                marker.setLngLat(route[index]);
                requestAnimationFrame(moveMarker);
              }
            };

            moveMarker();
          };

          mapRef.current.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: route,
              },
            },
          });

          mapRef.current.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#888",
              "line-width": 6,
            },
          });

          animateMarker(route);
        })
        .catch((error) => console.log("Failed to fetch directions"));
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  };


  useEffect(() => {
    const hasLocationDetails = locationDetails?.lng && locationDetails?.lat;
    const hasCurrentLocation = Currentlocation?.lng && Currentlocation?.lat;
  
    if (hasLocationDetails || hasCurrentLocation || SearchQueryEnd) {
      locationSet();
    }
  }, [locationDetails, Currentlocation, SearchQueryEnd]);


  const HandleCategory = () => {
    const apiGet = `https://api.cabkn.com/api/users/liabilty/1`;
    getData(apiGet, header1)
      .then((res) => {
        if (res?.success && res?.liabilties?.length > 0) {
          const selectOptions = res?.liabilties?.map((item) => ({
            value: item._id,
            label: item.title,
            price: item?.price,
          }));
          setProductData(selectOptions);
          setCount(res?.count?.totalPage);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    HandleCategory();
  }, [lastId]);

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

  const HandleStopSearch = async (text) => {
    setSearchQueryStop(text);
    setPridicLoadingStop(true);

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
            setStopPredictions(detailedPredictions.filter((item) => item));
            setPridicLoadingStop(false);
            setNoData(false);
          } else {
            console.error("Error fetching place predictions:", status);
            setNoData(true);
            setPridicLoadingStop(false);
          }
          setPridicLoadingStop(false);
        }
      );
    } catch (error) {
      console.error("Error importing Places API library:", error);
      setNoData(true);
      setPridicLoadingStop(false);
    }
  };

  // const HadleStopPridication = (prediction) => {
  //   setLocationDetails3((prevLocations) => {
  //     const locationsArray = Array.isArray(prevLocations) ? prevLocations : [];

  //     const isDuplicate = locationsArray.some(
  //       (loc) => loc.address === prediction?.description
  //     );

  //     if (!isDuplicate) {
  //       return [
  //         ...locationsArray,
  //         {
  //           address: prediction?.description || "",
  //           latitude: prediction?.latLng?.lat || 0,
  //           longitude: prediction?.latLng?.lng || 0,
  //         },
  //       ];
  //     }

  //     return locationsArray;
  //   });
  //   setValue("stop", prediction?.description || "");
  //   setSearchQueryStop(prediction.description);
  //   setStopPredictions([]);
  //   setNoData(false);
  // };

  const HadleStopPridication = (prediction) => {
    const isDuplicate = LocationDetails3.some(
      (loc) => loc.address === prediction?.description
    );

    if (!isDuplicate) {
      setSelectedStop({
        description: prediction?.description || "",
        latLng: prediction?.latLng || { lat: 0, lng: 0 },
      });

      setSearchQueryStop(prediction.description);
      setStopPredictions([]);
      setNoData(false);
    } else {
      setNoData(true);
    }
  };

  const addlocation = () => {
    if (selectedStop) {
      setLocationDetails3((prevLocations) => {
        const locationsArray = Array.isArray(prevLocations)
          ? prevLocations
          : [];

        // Avoid adding duplicates
        const isDuplicate = locationsArray.some(
          (loc) => loc.address === selectedStop?.description
        );

        if (!isDuplicate) {
          return [
            ...locationsArray,
            {
              address: selectedStop?.description || "",
              latitude: selectedStop?.latLng?.lat || 0,
              longitude: selectedStop?.latLng?.lng || 0,
            },
          ];
        }

        return locationsArray;
      });

      // Clear the temporary selected stop after adding
      setSearchQueryStop("");
      setSelectedStop(null);
    }
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

  const RemoveStop = (indexToRemove) => {
    setLocationDetails3((prevLocations) =>
      prevLocations.filter((_, index) => index !== indexToRemove)
    );
  };

  const HadleEndPridication = (prediction) => {
    setLocationDetails1({
      address: prediction?.description || "",
      lat: prediction?.latLng?.lat || 0,
      lng: prediction?.latLng?.lng || 0,
    });
    setValue("metaTitle", prediction?.description || "");
    setSearchQueryEnd(prediction.description);
    setCurrentLocation({});
    setEndPredictions([]);
    setNoData(false);
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
      stop: "",
    },
  });

  const onSubmit = (data) => {
    if (distance == 0) {
      message.error("Distance cannot (0) Km");
    } else {
      const utcDate = moment(data?.date?.$d).utc().format();
      const body = {
        ...data,
        bookingtype: Schuale || RideTime ? "schedule" : "live",
        rideType: TypeRide,
        schedule_date: utcDate,
        schedule_time: RideTime ? RideTime : data?.time,
        distance: distance,
        start: [locationDetails?.lng, locationDetails.lat],
        end: [locationDetails1?.lng, locationDetails1.lat],
        stop: LocationDetails3,
        service: RowData?._id,
        perPersonPrice: RowData?.price_per_person,
        servicePrice: RowData?.location_price,
        color: RowData?.ProductColor,
        size: RowData?.Size,
        qty: RowData?.incDec,
        productPrice: RowData?.productPrice,
        ...(FavUserId ? { FavUserId } : {}),
      };
      const encodedData = encodeURIComponent(JSON.stringify(body));
      router.push(`/bookRide?data=${encodedData}`);
    }
  };

  return (
    <div className="mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
      <div className="RideForm col-span-12 md:col-span-4">
        <h1 className="rideHeader">Get a Ride</h1>
        <h5 className="medium-font mt-4">Select your category</h5>
        <Form onSubmit={handleSubmit(onSubmit)} className="mt-3">
          <div>
            <Label for="category" className="">
              Category
            </Label>
            <Controller
              name="category"
              control={control}
              rules={{ required: "Category is required" }}
              render={({ field: { onChange, value, ref } }) => (
                <>
                  <Select
                    ref={ref}
                    placeholder="Select Category"
                    options={[
                      { value: "driver", label: "Driver" },
                      { value: "parcel", label: "Parcel" },
                    ]}
                    onChange={(selectedOption) => {
                      setTypeRide(selectedOption?.value);
                      onChange(selectedOption ? selectedOption.value : null);
                    }}
                    value={value?.label} // Bind the selected value
                    isClearable
                    className={errors.category ? "is-invalid" : ""}
                  />
                  {errors.category && (
                    <FormFeedback className="text-danger">
                      {errors.category.message}
                    </FormFeedback>
                  )}
                </>
              )}
            />
          </div>

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
            <Label for="startLocation">Add Stop</Label>
            <div className="flex items-center gap-2">
              <Controller
                name="stop"
                control={control}
                render={({ field }) => (
                  <div style={{ position: "relative", width: "100%" }}>
                    <Input
                      {...field}
                      placeholder="Enter stop location"
                      value={SearchQueryStop}
                      onChange={(e) => HandleStopSearch(e.target.value)}
                      invalid={errors.stop && true}
                    />
                    {errors.stop && (
                      <FormFeedback>{errors.stop.message}</FormFeedback>
                    )}
                    {PridicLoadingStop && <div>Loading...</div>}
                    {StopPredictions.length > 0 && (
                      <ListGroup
                        style={{
                          position: "absolute",
                          zIndex: 10,
                          width: "100%",
                          maxHeight: "200px",
                          overflowY: "auto",
                        }}
                      >
                        {StopPredictions.map((prediction) => (
                          <ListGroupItem
                            key={prediction.place_id}
                            onClick={() => HadleStopPridication(prediction)}
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
              <IoMdAddCircleOutline
                onClick={addlocation}
                className="cursor-pointer"
                size={30}
              />
            </div>

            {LocationDetails3.map((item, index) => {
              return (
                <div className="flex items-center gap-3 cursor-pointer mt-2">
                  <p className="font-Regular truncate-textLocation">
                    {item?.address}
                  </p>
                  <div onClick={() => RemoveStop(index)}>
                    <IoMdCloseCircle />
                  </div>
                </div>
              );
            })}
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

          <p className="text-sm font-medium mt-2 mb-2">Copy and paste End location  if it doesn’t fetch automatically </p>

          {!RideTime && (
            <Checkbox className="mt-2 mb-2" onChange={onChangeSchedule}>
              Schedule
            </Checkbox>
          )}

          {RideTime && (
            <div className="mt-2">
              <Label for="startLocation">Travlers</Label>
              <>
                <Controller
                  name="travlers"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Input
                        type="number"
                        required
                        {...field}
                        placeholder="Travlers"
                        invalid={errors.travlers && true}
                      />
                      {errors.travlers && (
                        <FormFeedback>{errors.travlers.message}</FormFeedback>
                      )}
                    </div>
                  )}
                />
              </>
            </div>
          )}

          {Schuale ? (
            <>
              <div style={wrapperStyle}>
                <div style={{ marginBottom: "20px" }}>
                  <Controller
                    name="date"
                    control={control}
                    defaultValue={null}
                    render={({ field }) => (
                      <Calendar
                        fullscreen={false}
                        {...field}
                        onSelect={(value, dateString) => {
                          field.onChange(value);
                        }}
                      />
                    )}
                  />
                </div>
              </div>
              {!RideTime && (
                <div style={{ marginBottom: "20px" }}>
                  <Controller
                    name="time"
                    control={control}
                    defaultValue={null}
                    render={({ field }) => (
                      <TimePicker
                        style={{ width: "100%" }}
                        use12Hours
                        format="h:mm a"
                        {...field}
                        value={
                          field.value ? moment(field.value, "h:mm a") : null
                        }
                        onChange={(value) =>
                          field.onChange(value ? value.format("h:mm a") : null)
                        }
                      />
                    )}
                  />
                </div>
              )}
            </>
          ) : null}

          {/* <div>
            <Button
              onClick={locationSet}
              className="btnForm mt-3"
              color="primary"
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="sm" /> : "Create Route"}
            </Button>
          </div> */}

          <Button type="submit" className="btnForm mt-3" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : "Next"}
          </Button>
        </Form>
      </div>
      <div className="col-span-12 md:col-span-8">
        <div
          id="map-container"
          className="w-full responsive-map"
          ref={mapContainerRef}
        />
      </div>

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
};

const MakeRIde = () => {
  return (
    <Suspense fallback={<Spinner animation="border" />}>
      <RidePage />
    </Suspense>
  );
};
export default MakeRIde;
