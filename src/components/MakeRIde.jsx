"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ListGroup, ListGroupItem } from "reactstrap";
import Select from "react-select";
import { Spinner } from "react-bootstrap";
import { message, TimePicker, Calendar, ConfigProvider } from "antd";
import moment from "moment";
import { Loader } from "@googlemaps/js-api-loader";
import { getDistance } from "geolib";
import { IoMdCloseCircle } from "react-icons/io";
import { IoMdAddCircleOutline } from "react-icons/io";
import { BiCurrentLocation } from "react-icons/bi";
import { FaCar, FaBox, FaMapMarkedAlt, FaHistory } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import CustomButton from "./CustomButton";

const rideTabs = [
  { key: "driver", label: "Book a Driver", icon: <FaCar size={16} /> },
  { key: "parcel", label: "Send a Parcel", icon: <FaBox size={15} /> },
  { key: "tour", label: "Make Own Tour", icon: <FaMapMarkedAlt size={16} /> },
  { key: "myBookings", label: "My Bookings", icon: <FaHistory size={15} /> },
];

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

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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
        const travelers = Number(RowData?.travelers);
        return !isNaN(travelers) && travelers > 0;
      },
      then: (schema) =>
        schema
          .required("Number of travelers is required")
          .test(
            "is-less-than-parsedTravelers",
            `${RowData?.travelers} Travelers Available`,
            function (value) {
              const travelers = Number(RowData?.travelers);
              return (
                typeof value === "number" &&
                !isNaN(value) &&
                !isNaN(travelers) &&
                value > 0 &&
                value <= travelers
              );
            },
          ),
      otherwise: (schema) => schema.notRequired(),
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
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCkw_MZd-894MZUR4g1_p2XohCWTSTR8S4`,
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
        },
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
      ? [Currentlocation?.longitude, Currentlocation?.latitude]
      : (locationDetails?.lng ? [locationDetails.lng, locationDetails.lat] : null);

    const end = data?.lat
      ? [data?.lng, data?.lat]
      : (locationDetails1?.lng ? [locationDetails1.lng, locationDetails1.lat] : null);

    const hasStart = start && start[0] && start[1];
    const hasEnd = end && end[0] && end[1];
    const hasStops = (LocationDetails3 && LocationDetails3.length > 0) || (selectedStop && selectedStop.latLng && selectedStop.latLng.lng);

    if (!hasStart && !hasEnd && !hasStops) return;

    if (mapRef.current) {
      mapRef.current.remove();
    }

    let defaultCenter = [17.363747, -62.754593];
    if (hasStart) {
      defaultCenter = start;
    } else if (hasEnd) {
      defaultCenter = end;
    } else if (hasStops) {
      const stopLng = LocationDetails3 && LocationDetails3.length > 0 ? LocationDetails3[0].longitude : selectedStop.latLng.lng;
      const stopLat = LocationDetails3 && LocationDetails3.length > 0 ? LocationDetails3[0].latitude : selectedStop.latLng.lat;
      defaultCenter = [stopLng, stopLat];
    }

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: defaultCenter,
      zoom: hasStart && (hasEnd || hasStops) ? 8 : 11,
    });

    const bounds = new mapboxgl.LngLatBounds();

    const createCustomMarker = (text, type) => {
      const el = document.createElement("div");
      el.className = "custom-mapbox-marker flex items-center justify-center shadow-md cursor-pointer transition-transform duration-200 hover:scale-110";
      
      let bgColor = "#f59e0b"; // Amber/orange for stops
      let textColor = "#ffffff";
      let size = "26px";
      
      if (type === "start") {
        bgColor = "#22c55e"; // Green for start
        size = "30px";
      } else if (type === "end") {
        bgColor = "#ef4444"; // Red for end
        size = "30px";
      }
      
      el.style.backgroundColor = bgColor;
      el.style.color = textColor;
      el.style.width = size;
      el.style.height = size;
      el.style.borderRadius = "50% 50% 50% 0";
      el.style.transform = "rotate(-45deg)";
      el.style.border = "2px solid #ffffff";
      el.style.boxShadow = "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
      
      const span = document.createElement("span");
      span.innerText = text;
      span.style.transform = "rotate(45deg)";
      span.style.fontSize = type === "start" || type === "end" ? "11px" : "10px";
      span.style.fontFamily = "Inter, sans-serif";
      span.style.fontWeight = "bold";
      span.className = "flex items-center justify-center h-full w-full";
      
      el.appendChild(span);
      return el;
    };

    const createPopup = (title, address) => {
      return new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div style="font-family: 'Inter', sans-serif; padding: 4px 8px; max-width: 220px;">
            <p style="margin: 0; font-size: 11px; font-weight: 700; color: #0f172a;">${title}</p>
            ${address ? `<p style="margin: 2px 0 0; font-size: 10px; color: #64748b; line-height: 1.4; white-space: normal; word-break: break-word;">${address}</p>` : ""}
          </div>
        `);
    };

    if (hasStart) {
      const el = createCustomMarker("S", "start");
      const startAddress = locationDetails?.address || Currentlocation?.address || "Pickup Point";
      const popup = createPopup("Pickup (Start)", startAddress);
      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(start)
        .setPopup(popup)
        .addTo(mapRef.current);
      
      el.addEventListener("mouseenter", () => {
        if (!marker.getPopup().isOpen()) marker.togglePopup();
      });
      el.addEventListener("mouseleave", () => {
        if (marker.getPopup().isOpen()) marker.togglePopup();
      });
      bounds.extend(start);
    }

    if (hasEnd) {
      const el = createCustomMarker("E", "end");
      const endAddress = locationDetails1?.address || "Destination Point";
      const popup = createPopup("Destination (End)", endAddress);
      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(end)
        .setPopup(popup)
        .addTo(mapRef.current);

      el.addEventListener("mouseenter", () => {
        if (!marker.getPopup().isOpen()) marker.togglePopup();
      });
      el.addEventListener("mouseleave", () => {
        if (marker.getPopup().isOpen()) marker.togglePopup();
      });
      bounds.extend(end);
    }

    let stopLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    let stopCount = 0;

    if (LocationDetails3 && LocationDetails3.length > 0) {
      LocationDetails3.forEach((stop) => {
        const letter = stopLetters[stopCount % stopLetters.length];
        stopCount++;
        
        const el = createCustomMarker(letter, "stop");
        const popup = createPopup(`Stop ${letter}`, stop.address);
        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([stop.longitude, stop.latitude])
          .setPopup(popup)
          .addTo(mapRef.current);

        el.addEventListener("mouseenter", () => {
          if (!marker.getPopup().isOpen()) marker.togglePopup();
        });
        el.addEventListener("mouseleave", () => {
          if (marker.getPopup().isOpen()) marker.togglePopup();
        });
        bounds.extend([stop.longitude, stop.latitude]);
      });
    }

    if (selectedStop && selectedStop.latLng && selectedStop.latLng.lng) {
      const letter = stopLetters[stopCount % stopLetters.length];
      stopCount++;
      
      const el = createCustomMarker(letter, "stop");
      const popup = createPopup(`Stop ${letter} (Preview)`, selectedStop.description);
      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([selectedStop.latLng.lng, selectedStop.latLng.lat])
        .setPopup(popup)
        .addTo(mapRef.current);

      el.addEventListener("mouseenter", () => {
        if (!marker.getPopup().isOpen()) marker.togglePopup();
      });
      el.addEventListener("mouseleave", () => {
        if (marker.getPopup().isOpen()) marker.togglePopup();
      });
      bounds.extend([selectedStop.latLng.lng, selectedStop.latLng.lat]);
    }

    // Draw route if start is selected and we have either end or stops (so at least 2 points)
    if (hasStart && (hasEnd || hasStops)) {
      // Build coordinates string: start;stop1;stop2;...;end
      let coordsString = `${start[0]},${start[1]}`;
      if (LocationDetails3 && LocationDetails3.length > 0) {
        LocationDetails3.forEach((stop) => {
          coordsString += `;${stop.longitude},${stop.latitude}`;
        });
      }
      if (selectedStop && selectedStop.latLng && selectedStop.latLng.lng) {
        coordsString += `;${selectedStop.latLng.lng},${selectedStop.latLng.lat}`;
      }
      if (hasEnd) {
        coordsString += `;${end[0]},${end[1]}`;
      }

      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsString}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

      fetch(directionsUrl)
        .then((response) => response.json())
        .then((data) => {
          const route = data.routes[0]?.geometry?.coordinates;
          if (!route || route.length === 0) return;

          route.forEach((coord) => bounds.extend(coord));
          mapRef.current.fitBounds(bounds, { padding: 50 });

          if (hasEnd) {
            const startCoords = { latitude: start[1], longitude: start[0] };
            const endCoords = { latitude: end[1], longitude: end[0] };
            const distanceVal = getDistance(startCoords, endCoords) / 1000;
            setDistance(distanceVal.toFixed(1));
          }

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
              "line-color": "#004a70",
              "line-width": 6,
            },
          });
        })
        .catch((error) => console.log("Failed to fetch directions"));
    } else {
      if (hasStart || hasEnd || hasStops) {
        mapRef.current.fitBounds(bounds, { padding: 100, maxZoom: 14 });
      }
    }
  };

  useEffect(() => {
    locationSet();
  }, [locationDetails, Currentlocation, locationDetails1, LocationDetails3, selectedStop]);

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
              document.createElement("div"),
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
                  }),
              ),
            );
            setPredictions(detailedPredictions.filter((item) => item));
            setPridicLoading(false);
            setNoData(false);
          } else {
            setNoData(true);
            setPridicLoading(false);
          }
          setPridicLoading(false);
        },
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
              document.createElement("div"),
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
                  }),
              ),
            );
            setStopPredictions(detailedPredictions.filter((item) => item));
            setPridicLoadingStop(false);
            setNoData(false);
          } else {
            setNoData(true);
            setPridicLoadingStop(false);
          }
          setPridicLoadingStop(false);
        },
      );
    } catch (error) {
      setNoData(true);
      setPridicLoadingStop(false);
    }
  };

  const HadleStopPridication = (prediction) => {
    const isDuplicate = LocationDetails3.some(
      (loc) => loc.address === prediction?.description,
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

        const isDuplicate = locationsArray.some(
          (loc) => loc.address === selectedStop?.description,
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
              document.createElement("div"),
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
                  }),
              ),
            );
            setEndPredictions(detailedPredictions.filter((item) => item));
            setPridicLoadingEnd(false);
            setNoData(false);
          } else {
            setNoData(true);
            setPridicLoadingEnd(false);
          }
          setPridicLoadingEnd(false);
        },
      );
    } catch (error) {
      setNoData(true);
      setPridicLoadingEnd(false);
    }
  };

  const RemoveStop = (indexToRemove) => {
    setLocationDetails3((prevLocations) =>
      prevLocations.filter((_, index) => index !== indexToRemove),
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
    if (Number(distance) === 0) {
      message.error("Distance cannot be 0 Km");
    } else {
      const utcDate = moment(data?.date?.$d).utc().format();
      const body = {
        ...data,
        bookingtype: Schuale || RideTime ? "schedule" : "live",
        rideType: TypeRide,
        schedule_date: utcDate,
        schedule_time: RideTime ? RideTime : data?.time,
        distance: distance,
        start: [locationDetails?.lng || Currentlocation?.longitude, locationDetails?.lat || Currentlocation?.latitude],
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

  const hasAnyLocation = (locationDetails?.lng && locationDetails?.lat) || (Currentlocation?.longitude && Currentlocation?.latitude) || (locationDetails1?.lng && locationDetails1?.lat) || (LocationDetails3 && LocationDetails3.length > 0) || (selectedStop && selectedStop.latLng && selectedStop.latLng.lng);

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
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
            <span className="text-slate-500">/</span>
            <span className="text-slate-200">Book a Ride</span>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <div>
                <h1 className="text-white text-3xl font-family-bold tracking-tight !m-0 leading-tight">
                  Book a{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
                    Ride
                  </span>
                </h1>
                <p className="text-slate-400 text-sm !mt-1 !m-0 font-family-regular">
                  Set pickup, drop-off, and schedule your trip details
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FORM & MAP CONTAINER ===== */}
      <div className="!-mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 !pb-24">
        {/* Swiper Tabs */}
        <div className="w-full max-w-full overflow-hidden !mb-8">
          <Swiper
            modules={[FreeMode, Mousewheel]}
            slidesPerView="auto"
            spaceBetween={10}
            freeMode={true}
            mousewheel={{ forceToAxis: true }}
            className="w-full py-1 category-swiper"
          >
            {rideTabs.map((tab) => {
              const isSelected = (TypeRide === tab.key) || (!TypeRide && tab.key === "driver");
              return (
                <SwiperSlide key={tab.key} style={{ width: "auto" }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (tab.key === "tour") {
                        router.push("/makeowntours");
                      } else if (tab.key === "myBookings") {
                        router.push("/admin");
                      } else {
                        setTypeRide(tab.key);
                        setValue("category", tab.key);
                      }
                    }}
                    className={`cursor-pointer transition-all duration-300 select-none flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-family-semibold whitespace-nowrap !border shadow-none ${
                      isSelected
                        ? "text-white bg-brand-600 !border-brand-600"
                        : "text-slate-700 bg-white !border-slate-200/90 hover:!border-brand-600 hover:bg-slate-50 hover:text-brand-600"
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Card (5 Cols) */}
          <div className="lg:col-span-5 bg-white/95 backdrop-blur-xl rounded-3xl !border !border-slate-100 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Category */}
              <div>
                <label className="text-xs text-slate-700 block !mb-2 font-family-semibold">
                  Category
                </label>
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
                        value={value ? { value, label: value.charAt(0).toUpperCase() + value.slice(1) } : null}
                        isClearable
                      />
                      {errors.category && (
                        <span className="text-xs text-rose-500 block !mt-1.5 font-family-medium">
                          {errors.category.message}
                        </span>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Start Location */}
              <div>
                <label className="text-xs text-slate-700 block !mb-2 font-family-semibold">
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
                          className={`w-full px-4 py-3 bg-slate-50/50 !border-2 rounded-xl text-sm font-family-medium text-slate-900 focus:bg-white outline-none transition-all duration-200 ${
                            errors.name ? "!border-rose-300 focus:!border-rose-500" : "!border-slate-100 focus:!border-brand-600"
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

              {/* Add Stop */}
              <div>
                <label className="text-xs text-slate-700 block !mb-2 font-family-semibold">
                  Add Stop
                </label>
                <div className="flex items-center gap-2.5">
                  <Controller
                    name="stop"
                    control={control}
                    render={({ field }) => (
                      <div className="relative flex-grow">
                        <input
                          {...field}
                          placeholder="Enter stop location"
                          value={SearchQueryStop}
                          onChange={(e) => HandleStopSearch(e.target.value)}
                          className={`w-full px-4 py-3 bg-slate-50/50 !border-2 rounded-xl text-sm font-family-medium text-slate-900 focus:bg-white outline-none transition-all duration-200 ${
                            errors.stop ? "!border-rose-300 focus:!border-rose-500" : "!border-slate-100 focus:!border-brand-600"
                          }`}
                        />
                        {errors.stop && (
                          <span className="text-xs text-rose-500 block !mt-1.5 font-family-medium">
                            {errors.stop.message}
                          </span>
                        )}
                        {PridicLoadingStop && (
                          <div className="text-xs text-slate-400 !mt-2 font-family-medium flex items-center gap-1.5">
                            <Spinner animation="border" size="sm" style={{ width: 12, height: 12 }} />
                            <span>Fetching locations...</span>
                          </div>
                        )}
                        {StopPredictions.length > 0 && (
                          <ListGroup className="absolute z-20 w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl !border !border-slate-100 max-h-[200px] overflow-y-auto !mt-2.5">
                            {StopPredictions.map((prediction) => (
                              <ListGroupItem
                                key={prediction.place_id}
                                onClick={() => HadleStopPridication(prediction)}
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
                    onClick={addlocation}
                    className="w-11 h-11 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-650 flex items-center justify-center shrink-0 !border !border-brand-100 transition-colors shadow-inner"
                  >
                    <IoMdAddCircleOutline size={20} />
                  </button>
                </div>

                {LocationDetails3.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 p-3 bg-slate-50/70 !border !border-slate-100 rounded-2xl !mt-2.5 shadow-sm"
                  >
                    <p className="text-xs font-family-medium text-slate-800 truncate !m-0">
                      {item?.address}
                    </p>
                    <button
                      type="button"
                      onClick={() => RemoveStop(index)}
                      className="text-rose-500 hover:text-rose-700 bg-transparent !border-none p-0 flex items-center shrink-0 cursor-pointer"
                    >
                      <IoMdCloseCircle size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* End Location */}
              <div>
                <label className="text-xs text-slate-700 block !mb-2 font-family-semibold">
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
                        className={`w-full px-4 py-3 bg-slate-50/50 !border-2 rounded-xl text-sm font-family-medium text-slate-900 focus:bg-white outline-none transition-all duration-200 ${
                          errors.metaTitle ? "!border-rose-300 focus:!border-rose-500" : "!border-slate-100 focus:!border-brand-600"
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
                <p className="text-[11px] text-slate-400 !mt-2 !m-0 font-family-regular">
                  Copy and paste End location if it doesn&rsquo;t fetch automatically
                </p>
              </div>

              {/* Schedule Checkbox */}
              {!RideTime && (
                <label className="flex items-center gap-2.5 !my-4 cursor-pointer text-sm font-family-semibold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={Schuale}
                    onChange={onChangeSchedule}
                    className="w-4 h-4 accent-brand-900 rounded cursor-pointer"
                  />
                  <span>Schedule Ride</span>
                </label>
              )}

              {/* Travelers */}
              {RideTime && (
                <div>
                  <label className="text-xs text-slate-700 block !mb-2 font-family-semibold">
                    Travelers
                  </label>
                  <Controller
                    name="travlers"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <input
                          type="number"
                          required
                          {...field}
                          placeholder="Travelers Count"
                          className={`w-full px-4 py-3 bg-slate-50/50 !border-2 rounded-xl text-sm font-family-medium text-slate-900 focus:bg-white outline-none transition-all duration-200 ${
                            errors.travlers ? "!border-rose-300 focus:!border-rose-500" : "!border-slate-100 focus:!border-brand-600"
                          }`}
                        />
                        {errors.travlers && (
                          <span className="text-xs text-rose-500 block !mt-1.5 font-family-medium">
                            {errors.travlers.message}
                          </span>
                        )}
                      </div>
                    )}
                  />
                </div>
              )}

              {/* Calendar & Time section */}
              {Schuale && (
                <div className="!mt-5 space-y-4">
                  <div className="!border !border-slate-100 p-4 rounded-3xl bg-slate-50/30">
                    <Controller
                      name="date"
                      control={control}
                      defaultValue={null}
                      render={({ field }) => (
                        <Calendar
                          fullscreen={false}
                          {...field}
                          onSelect={(value) => {
                            field.onChange(value);
                          }}
                        />
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
                          className="w-full h-12 rounded-xl !border-2 !border-slate-100 bg-slate-50/50 focus:bg-white"
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

              {/* Submit CTA */}
              <div className="!pt-4">
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
            </form>
          </div>

          {/* Map Card (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl !border !border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden min-h-[500px] h-[550px] relative">
            <div
              id="map-container"
              ref={mapContainerRef}
              className="w-full h-full"
            />
            
            {/* Map Placeholder Prompt Overlay */}
            {!hasAnyLocation && (
              <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-10 select-none">
                <div className="w-16 h-16 rounded-2xl bg-white text-brand-600 flex items-center justify-center !mb-4 shadow-md !border !border-slate-100 flex-shrink-0 animate-bounce" style={{ animationDuration: '4s' }}>
                  <BiCurrentLocation size={28} />
                </div>
                <h3 className="text-base font-family-bold text-slate-800 !m-0">
                  Ready to Map Your Route?
                </h3>
                <p className="text-xs text-slate-400 !m-0 !mt-2 leading-relaxed max-w-[280px] font-family-regular">
                  Please enter your start and end locations in the booking form to display the live map route.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Geolocation Permission Dialog */}
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
};

const selectStyles = (error) => ({
  control: (base) => ({
    ...base,
    borderRadius: 12,
    borderColor: error ? "#fca5a5" : "#f1f5f9",
    borderWidth: 2,
    minHeight: 46,
    fontSize: 14,
    fontFamily: "Inter, sans-serif",
    boxShadow: "none",
    backgroundColor: "#f8fafc80",
    "&:hover": { borderColor: "#004a70" },
  }),
  placeholder: (base) => ({ ...base, fontSize: 14, color: "#9ca3af" }),
});

const MakeRIde = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-12"><Spinner animation="border" /></div>}>
      <RidePage />
    </Suspense>
  );
};

export default MakeRIde;
