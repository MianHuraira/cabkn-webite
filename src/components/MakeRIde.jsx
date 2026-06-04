"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import Select from "react-select";
import { Spinner } from "react-bootstrap";
import { message, TimePicker } from "antd";

import { Calendar } from "antd";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  }, []);

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
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #004a70 0%, #002d47 100%)", padding: "28px 0 44px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8 }}>Home / Book Ride</div>
          <h1 style={{ color: "#fff", fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 700, margin: 0, letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: 10 }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            Book a Ride
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "-24px auto 0", padding: "0 16px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "4fr 8fr", gap: 24, alignItems: "start" }}>
          {/* Form Card */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0f0f0", padding: "clamp(20px, 3vw, 32px)" }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Category */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Category</p>
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
                        styles={selectStyles(errors.category)}
                        onChange={(selectedOption) => {
                          setTypeRide(selectedOption?.value);
                          onChange(selectedOption ? selectedOption.value : null);
                        }}
                        value={value?.label}
                        isClearable
                      />
                      {errors.category && (
                        <span style={{ fontSize: 12, marginTop: 4, color: "#ef4444", display: "block" }}>
                          {errors.category.message}
                        </span>
                      )}
                    </>
                  )}
                />
              </div>

              <div style={{ height: 1, background: "#f3f4f6", margin: "20px 0" }} />

              {/* Start Location */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Start Location</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <div style={{ position: "relative", width: "100%" }}>
                        <input
                          {...field}
                          placeholder="Enter start location"
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          style={inputStyle(errors.name)}
                        />
                        {errors.name && (
                          <span style={{ fontSize: 12, marginTop: 4, color: "#ef4444", display: "block" }}>
                            {errors.name.message}
                          </span>
                        )}
                        {PridicLoading && <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Loading...</div>}
                        {predictions.length > 0 && (
                          <ListGroup
                            style={{
                              position: "absolute",
                              zIndex: 10,
                              width: "100%",
                              maxHeight: "200px",
                              overflowY: "auto",
                              marginTop: 2,
                              borderRadius: 8,
                            }}
                          >
                            {predictions.map((prediction) => (
                              <ListGroupItem
                                key={prediction.place_id}
                                onClick={() => handlePredictionPress(prediction)}
                                style={{ cursor: "pointer", fontSize: 13, padding: "8px 12px" }}
                              >
                                {prediction.description}
                              </ListGroupItem>
                            ))}
                          </ListGroup>
                        )}
                        {noData && <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>No results found</div>}
                      </div>
                    )}
                  />
                  <BiCurrentLocation
                    size={28}
                    onClick={getLocation}
                    style={{ cursor: "pointer", color: "#004a70", flexShrink: 0 }}
                  />
                </div>
              </div>

              <div style={{ height: 1, background: "#f3f4f6", margin: "20px 0" }} />

              {/* Add Stop */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Add Stop</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Controller
                    name="stop"
                    control={control}
                    render={({ field }) => (
                      <div style={{ position: "relative", width: "100%" }}>
                        <input
                          {...field}
                          placeholder="Enter stop location"
                          value={SearchQueryStop}
                          onChange={(e) => HandleStopSearch(e.target.value)}
                          style={inputStyle(errors.stop)}
                        />
                        {errors.stop && (
                          <span style={{ fontSize: 12, marginTop: 4, color: "#ef4444", display: "block" }}>
                            {errors.stop.message}
                          </span>
                        )}
                        {PridicLoadingStop && <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Loading...</div>}
                        {StopPredictions.length > 0 && (
                          <ListGroup
                            style={{
                              position: "absolute",
                              zIndex: 10,
                              width: "100%",
                              maxHeight: "200px",
                              overflowY: "auto",
                              marginTop: 2,
                              borderRadius: 8,
                            }}
                          >
                            {StopPredictions.map((prediction) => (
                              <ListGroupItem
                                key={prediction.place_id}
                                onClick={() => HadleStopPridication(prediction)}
                                style={{ cursor: "pointer", fontSize: 13, padding: "8px 12px" }}
                              >
                                {prediction.description}
                              </ListGroupItem>
                            ))}
                          </ListGroup>
                        )}
                        {noData && <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>No results found</div>}
                      </div>
                    )}
                  />
                  <IoMdAddCircleOutline
                    onClick={addlocation}
                    size={28}
                    style={{ cursor: "pointer", color: "#004a70", flexShrink: 0 }}
                  />
                </div>

                {LocationDetails3.map((item, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, cursor: "pointer" }}>
                    <p style={{ fontSize: 13, color: "#374151", margin: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item?.address}
                    </p>
                    <div onClick={() => RemoveStop(index)} style={{ color: "#ef4444", flexShrink: 0 }}>
                      <IoMdCloseCircle size={18} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: "#f3f4f6", margin: "20px 0" }} />

              {/* End Location */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>End Location</p>
                <Controller
                  name="metaTitle"
                  control={control}
                  render={({ field }) => (
                    <div style={{ position: "relative" }}>
                      <input
                        {...field}
                        placeholder="Enter end location"
                        value={SearchQueryEnd}
                        onChange={(e) => HandleEndSearch(e.target.value)}
                        style={inputStyle(errors.metaTitle)}
                      />
                      {errors.metaTitle && (
                        <span style={{ fontSize: 12, marginTop: 4, color: "#ef4444", display: "block" }}>
                          {errors.metaTitle.message}
                        </span>
                      )}
                      {PridicLoadingEnd && <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Loading...</div>}
                      {EndPredictions.length > 0 && (
                        <ListGroup
                          style={{
                            position: "absolute",
                            zIndex: 10,
                            width: "100%",
                            maxHeight: "200px",
                            overflowY: "auto",
                            marginTop: 2,
                            borderRadius: 8,
                          }}
                        >
                          {EndPredictions.map((prediction) => (
                            <ListGroupItem
                              key={prediction.place_id}
                              onClick={() => HadleEndPridication(prediction)}
                              style={{ cursor: "pointer", fontSize: 13, padding: "8px 12px" }}
                            >
                              {prediction.description}
                            </ListGroupItem>
                          ))}
                        </ListGroup>
                      )}
                      {noData && <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>No results found</div>}
                    </div>
                  )}
                />
              </div>

              <p style={{ fontSize: 12, color: "#6b7280", margin: "8px 0 4px" }}>
                Copy and paste End location if it doesn&rsquo;t fetch automatically
              </p>

              {/* Schedule Checkbox */}
              {!RideTime && (
                <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#374151" }}>
                  <input type="checkbox" checked={Schuale} onChange={onChangeSchedule} style={{ width: 16, height: 16, accentColor: "#004a70", cursor: "pointer" }} />
                  Schedule
                </label>
              )}

              {/* Travelers */}
              {RideTime && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Travelers</p>
                  <Controller
                    name="travlers"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <input type="number" required {...field} placeholder="Travelers" style={inputStyle(errors.travlers)} />
                        {errors.travlers && (
                          <span style={{ fontSize: 12, marginTop: 4, color: "#ef4444", display: "block" }}>
                            {errors.travlers.message}
                          </span>
                        )}
                      </div>
                    )}
                  />
                </div>
              )}

              {/* Schedule Calendar & Time */}
              {Schuale && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, marginBottom: 12 }}>
                    <Controller
                      name="date"
                      control={control}
                      defaultValue={null}
                      render={({ field }) => (
                        <Calendar fullscreen={false} {...field} onSelect={(value) => { field.onChange(value) }} />
                      )}
                    />
                  </div>
                  {!RideTime && (
                    <Controller
                      name="time"
                      control={control}
                      defaultValue={null}
                      render={({ field }) => (
                        <TimePicker
                          style={{ width: "100%", borderRadius: 10 }}
                          use12Hours
                          format="h:mm a"
                          {...field}
                          value={field.value ? moment(field.value, "h:mm a") : null}
                          onChange={(value) => field.onChange(value ? value.format("h:mm a") : null)}
                        />
                      )}
                    />
                  )}
                </div>
              )}

              <div style={{ height: 1, background: "#f3f4f6", margin: "20px 0" }} />

              {/* Submit */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: "12px 36px",
                    borderRadius: 12,
                    background: isLoading ? "#9ca3af" : "#004a70",
                    border: "none",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) { e.currentTarget.style.background = "#003353"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,74,112,0.3)" }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) { e.currentTarget.style.background = "#004a70"; e.currentTarget.style.boxShadow = "none" }
                  }}
                >
                  {isLoading ? <Spinner size="sm" style={{ color: "#fff" }} /> : "Next"}
                </button>
              </div>
            </form>
          </div>

          {/* Map Card */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0f0f0", overflow: "hidden", minHeight: isMobile ? 300 : 500 }}>
            <div
              id="map-container"
              ref={mapContainerRef}
              style={{ width: "100%", height: isMobile ? 300 : 500 }}
            />
          </div>
        </div>
      </div>

      {/* Location Permission Dialog */}
      {ShowPermissionDialog && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 1050 }}>
          <div style={{ background: "#fff", borderRadius: 14, maxWidth: 400, width: "100%", padding: "clamp(20px, 3vw, 28px)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1f2937", margin: "0 0 8px" }}>Location Access Required</h2>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 20px" }}>
              Please enable location access to use this feature. You can enable it in your browser settings.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                onClick={() => handlePermissionGuide(false)}
                style={{
                  padding: "10px 20px", borderRadius: 10, background: "#f3f4f6", border: "none",
                  color: "#374151", fontSize: 14, fontWeight: 500, cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePermissionGuide}
                style={{
                  padding: "10px 20px", borderRadius: 10, background: "#004a70", border: "none",
                  color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer",
                }}
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

const inputStyle = (error) => ({
  borderRadius: 10,
  border: error ? "1px solid #ef4444" : "1px solid #d1d5db",
  padding: "10px 14px",
  fontSize: 14,
  marginTop: 0,
  width: "100%",
});

const selectStyles = (error) => ({
  control: (base) => ({
    ...base,
    borderRadius: 10,
    borderColor: error ? "#ef4444" : "#d1d5db",
    minHeight: 42,
    fontSize: 14,
    boxShadow: "none",
    "&:hover": { borderColor: "#004a70" },
  }),
  placeholder: (base) => ({ ...base, fontSize: 14, color: "#9ca3af" }),
});

const MakeRIde = () => {
  return (
    <Suspense fallback={<Spinner animation="border" />}>
      <RidePage />
    </Suspense>
  );
};
export default MakeRIde;
