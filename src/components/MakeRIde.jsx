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
import axios from "axios";
import { Loader } from "@googlemaps/js-api-loader";
import { getDistance } from "geolib";
import { IoMdCloseCircle, IoMdAddCircleOutline } from "react-icons/io";
import { BiCurrentLocation } from "react-icons/bi";
import { FaCar, FaBox, FaMapMarkedAlt, FaHistory, FaSearch } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { MdOutlineMyLocation, MdOutlinePlace } from "react-icons/md";
import { FiUploadCloud, FiTrash2, FiCamera } from "react-icons/fi";
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
  const { getData, header1, postData, header2 } = ApiFunction();
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
  const [TypeRide, setTypeRide] = useState("driver");
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

  // Geo loading state for inside locate spinner
  const [geoLoading, setGeoLoading] = useState(false);

  // Parcel Specific States
  const [parcelTitle, setParcelTitle] = useState("");
  const [parcelImage, setParcelImage] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const parcelInputRef = useRef(null);

  const handleParcelImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to Base64 data URL immediately (100% reliable across pages, never breaks)
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result;
      if (base64Data) {
        setParcelImage(base64Data);
      }

      setUploadLoading(true);
      try {
        const formData = new FormData();
        formData.append("image", file);
        // Direct axios post without hardcoding Content-Type header so browser adds boundary correctly
        const res = await axios.post("https://api.cabkn.com/api/image/upload", formData, {
          headers: header1?.["x-auth-token"] ? { "x-auth-token": header1["x-auth-token"] } : {},
        });
        const serverUrl = res?.data?.image || res?.data?.imageUrl;
        if (serverUrl) {
          setParcelImage(serverUrl);
        }
      } catch (err) {
        console.warn("Parcel image server upload notice (using local data URL):", err);
      } finally {
        setUploadLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

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
      let row = null;
      if (encodedData) {
        row = JSON.parse(decodeURIComponent(encodedData));
      } else if (typeof window !== "undefined") {
        const saved = sessionStorage.getItem("cabkn_ride_draft");
        if (saved) {
          row = JSON.parse(saved);
        }
      }

      if (row) {
        setFavUserId(row?.favUserId || row?.FavUserId || "");
        setRowData(row);

        // 1. Restore Category & Tab
        const cat = row?.rideType || row?.category || "driver";
        setTypeRide(cat);
        setValue("category", cat);

        // 2. Restore Parcel Fields
        if (row?.parcelTitle || row?.title) {
          setParcelTitle(row.parcelTitle || row.title);
        }
        if (row?.parcelImage || row?.image) {
          setParcelImage(row.parcelImage || row.image);
        }

        // 3. Restore Start Location
        const startAddr = row?.name || row?.start_address || "";
        if (startAddr) {
          setValue("name", startAddr);
          setSearchQuery(startAddr);
          if (row?.start && Array.isArray(row.start) && row.start.length === 2 && row.start[0] && row.start[1]) {
            setLocationDetails({
              address: startAddr,
              lng: row.start[0],
              lat: row.start[1],
            });
          }
        }

        // 4. Restore End Location
        const endAddr = row?.metaTitle || row?.end_address || row?.address || "";
        if (endAddr) {
          setValue("metaTitle", endAddr);
          setSearchQueryEnd(endAddr);
          if (row?.end && Array.isArray(row.end) && row.end.length === 2 && row.end[0] && row.end[1]) {
            setLocationDetails1({
              address: endAddr,
              lng: row.end[0],
              lat: row.end[1],
            });
          }
        }

        // 5. Restore Stops
        if (row?.stop && Array.isArray(row.stop) && row.stop.length > 0) {
          setLocationDetails3(row.stop);
        }

        // 6. Restore Distance
        if (row?.distance) {
          setDistance(row.distance);
        }

        // 7. Trigger route drawing on map
        if (row?.end && Array.isArray(row.end) && row.end.length === 2 && row.end[1]) {
          locationSet({
            lat: row.end[1],
            lng: row.end[0],
          });
        }
      }
    } catch (error) {
      console.error("Error parsing row or data:", error);
    }
  }, [encodedData]);

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
    if (uploadLoading) {
      message.warning("Please wait for parcel image to finish uploading");
      return;
    }
    if (Number(distance) === 0) {
      message.error("Distance cannot be 0 Km");
      return;
    }
    if (TypeRide === "parcel" && !parcelTitle.trim()) {
      message.error("Please enter a parcel title");
      return;
    }

    const body = {
      ...data,
      name: data.name || searchQuery || locationDetails?.address,
      start_address: searchQuery || locationDetails?.address,
      metaTitle: data.metaTitle || SearchQueryEnd || locationDetails1?.address,
      end_address: SearchQueryEnd || locationDetails1?.address,
      bookingtype: "live",
      rideType: TypeRide,
      category: TypeRide,
      distance: distance,
      start: [
        locationDetails?.lng || Currentlocation?.longitude,
        locationDetails?.lat || Currentlocation?.latitude,
      ],
      end: [locationDetails1?.lng, locationDetails1.lat],
      stop: LocationDetails3,
      title: parcelTitle || "",
      image: parcelImage || "",
      parcelTitle: parcelTitle || "",
      parcelImage: parcelImage || "",
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
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("cabkn_ride_draft", JSON.stringify(body));
      } catch (err) {
        console.warn("Could not save to sessionStorage:", err);
      }
    }
    router.push(`/bookRide?data=${encodedData}`);
  };

  const hasAnyLocation = (locationDetails?.lng && locationDetails?.lat) || (Currentlocation?.longitude && Currentlocation?.latitude) || (locationDetails1?.lng && locationDetails1?.lat) || (LocationDetails3 && LocationDetails3.length > 0) || (selectedStop && selectedStop.latLng && selectedStop.latLng.lng);

  return (
    <div className={`min-h-screen bg-[#f8fafc] font-poppins ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      {/* ===== HERO BANNER ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#001726] via-[#002842] to-[#002f4a] !pt-28 !pb-14 sm:!pb-16 text-white">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }} />
        
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: "12s" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-family-medium !mb-4">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors no-underline">Home</Link>
            <span className="text-slate-500">/</span>
            <span className="text-slate-200">
              {TypeRide === "parcel" ? "Send a Parcel" : "Book a Ride"}
            </span>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center shrink-0 shadow-inner">
                {TypeRide === "parcel" ? (
                  <FaBox className="text-white text-2xl" />
                ) : (
                  <FaCar className="text-white text-2xl" />
                )}
              </div>
              <div>
                <h1 className="text-white text-2xl sm:text-3xl font-family-bold tracking-tight !m-0 leading-tight">
                  {TypeRide === "parcel" ? "Send a Parcel" : "Book a Driver"}
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm !mt-1 !m-0 font-family-regular">
                  {TypeRide === "parcel"
                    ? "Schedule direct package delivery across Saint Kitts & Nevis"
                    : "Set pickup, drop-off, and find professional drivers in real-time"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NAVIGATION TABS (Perfect 50/50 Top/Bottom Centered on Edge with Position) ===== */}
      <div className="relative z-30 -translate-y-1/2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
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
                  className={`cursor-pointer transition-all duration-200 select-none flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-family-semibold whitespace-nowrap !border shadow-[0_4px_16px_rgba(0,0,0,0.08)] ${
                    isSelected
                      ? "text-white bg-[#004a70] !border-[#004a70] shadow-md"
                      : "text-slate-700 bg-white !border-slate-200/90 hover:!border-[#004a70] hover:bg-slate-50 hover:text-[#004a70]"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* ===== FORM & MAP CONTAINER ===== */}
      <div className="!-mt-2 sm:!-mt-3 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 !pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Form Card (5 Cols) with Auth Styling */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 !p-5 sm:!p-6 shadow-[0_4px_25px_rgba(0,0,0,0.04)] lg:sticky lg:top-24 z-10">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-family-bold text-slate-800 !m-0">
                  {TypeRide === "parcel" ? "Parcel Details" : "Ride Request"}
                </h2>
                <p className="text-xs text-slate-500 font-family-regular !m-0 mt-0.5">
                  {TypeRide === "parcel"
                    ? "Enter item information and delivery route"
                    : "Specify your pickup & destination"}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-sky-50 text-[#004a70] text-[11px] font-family-bold uppercase tracking-wider">
                {TypeRide === "parcel" ? "Parcel" : "Driver"}
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Category */}
              <div className="relative z-30">
                <label className="text-xs text-slate-700 block !mb-1.5 font-family-semibold flex items-center gap-1.5">
                  <FaCar size={12} className="text-[#004a70]" />
                  <span>Category</span>
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
                          { value: "driver", label: "Driver / Ride" },
                          { value: "parcel", label: "Parcel Delivery" },
                        ]}
                        styles={selectStyles(errors.category)}
                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                        menuPosition="fixed"
                        onChange={(selectedOption) => {
                          const val = selectedOption?.value || "driver";
                          setTypeRide(val);
                          onChange(val);
                        }}
                        value={
                          value
                            ? {
                                value,
                                label: value === "parcel" ? "Parcel Delivery" : "Driver / Ride",
                              }
                            : { value: "driver", label: "Driver / Ride" }
                        }
                        isClearable={false}
                      />
                      {errors.category && (
                        <span className="text-[11px] text-rose-500 block !mt-1 font-family-medium">
                          {errors.category.message}
                        </span>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Parcel Title & Image Upload (Only shown when category is parcel) */}
              {TypeRide === "parcel" && (
                <div className="space-y-3.5 p-3.5 bg-sky-50/60 rounded-2xl border border-sky-100 animate-fade-in">
                  {/* Parcel Title */}
                  <div>
                    <label className="text-xs text-slate-700 block !mb-1.5 font-family-semibold flex items-center gap-1.5">
                      <FaBox size={12} className="text-[#004a70]" />
                      <span>Parcel Title <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter parcel title (e.g. Documents, Gift, Food)"
                      value={parcelTitle}
                      onChange={(e) => setParcelTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-[13.5px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:ring-offset-1 focus:border-none transition-all duration-200 shadow-xs hover:shadow-sm font-family-medium"
                    />
                  </div>

                  {/* Parcel Image Upload */}
                  <div>
                    <label className="text-xs text-slate-700 block !mb-1.5 font-family-semibold flex items-center gap-1.5">
                      <FiCamera size={13} className="text-[#004a70]" />
                      <span>Parcel Image (Optional)</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      ref={parcelInputRef}
                      onChange={handleParcelImageChange}
                      className="hidden"
                    />
                    {parcelImage ? (
                      <div className="relative rounded-xl border border-slate-200 bg-white p-2.5 flex items-center gap-3 shadow-xs">
                        <img
                          src={parcelImage}
                          alt="Parcel"
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-family-semibold text-slate-800 block truncate">
                            Parcel photo attached
                          </span>
                          {uploadLoading ? (
                            <span className="text-[11px] text-brand-600 font-family-medium flex items-center gap-1 mt-0.5">
                              <div className="w-3 h-3 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                              Uploading...
                            </span>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-family-medium block mt-0.5">
                              Ready to send with courier
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setParcelImage(null)}
                          className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center border-none transition-colors cursor-pointer mr-1"
                          title="Remove photo"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => parcelInputRef.current?.click()}
                        className="border-2 border-dashed border-sky-200 hover:border-[#004a70] bg-white hover:bg-sky-50/50 rounded-xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#004a70] flex items-center justify-center border border-sky-100 mb-1.5 transition-colors group-hover:scale-105">
                          <FiUploadCloud size={18} />
                        </div>
                        <span className="text-xs font-family-semibold text-slate-800 group-hover:text-[#004a70] transition-colors">
                          Click to upload parcel photo
                        </span>
                        <span className="text-[10.5px] text-slate-400 font-family-medium mt-0.5">
                          PNG, JPG or JPEG (Max 5MB)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Start Location Input with Inside Locate Button & Loading Spinner */}
              <div>
                <label className="text-xs text-slate-700 block !mb-1.5 font-family-semibold flex items-center gap-1.5">
                  <FaLocationDot size={11} className="text-[#004a70]" />
                  <span>Start Location</span>
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                          <FaSearch className="w-3.5 h-3.5" />
                        </div>
                        <input
                          {...field}
                          placeholder="Enter start location"
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-white border border-gray-200 text-[13.5px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:ring-offset-1 focus:border-none transition-all duration-200 shadow-xs hover:shadow-sm font-family-medium"
                        />

                        {/* Inside End Locate Icon / Spinner */}
                        <div className="absolute right-2.5 flex items-center gap-1 z-10">
                          {geoLoading || PridicLoading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
                          ) : (
                            <button
                              type="button"
                              onClick={getLocation}
                              title="Use Current Location"
                              className="w-7 h-7 rounded-lg bg-brand-50 hover:bg-brand-100 text-[#004a70] flex items-center justify-center border-none transition-colors cursor-pointer"
                            >
                              <BiCurrentLocation size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {errors.name && (
                        <span className="text-[11px] text-rose-500 block !mt-1 font-family-medium">
                          {errors.name.message}
                        </span>
                      )}

                      {predictions.length > 0 && (
                        <ListGroup className="absolute z-30 w-full bg-white rounded-2xl shadow-xl border border-slate-100 max-h-[220px] overflow-y-auto !mt-1.5 p-1">
                          {predictions.map((prediction) => (
                            <ListGroupItem
                              key={prediction.place_id}
                              onClick={() => handlePredictionPress(prediction)}
                              className="px-3 py-2 text-xs text-slate-700 font-family-medium cursor-pointer hover:bg-slate-50 hover:text-[#004a70] rounded-xl transition-colors border-none"
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

              {/* Add Stop */}
              <div>
                <label className="text-xs text-slate-700 block !mb-1.5 font-family-semibold flex items-center gap-1.5">
                  <MdOutlinePlace size={14} className="text-[#004a70]" />
                  <span>Add Stop (Optional)</span>
                </label>
                <Controller
                  name="stop"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                          <FaSearch className="w-3.5 h-3.5" />
                        </div>
                        <input
                          {...field}
                          placeholder="Enter stop location"
                          value={SearchQueryStop}
                          onChange={(e) => HandleStopSearch(e.target.value)}
                          className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-white border border-gray-200 text-[13.5px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:ring-offset-1 focus:border-none transition-all duration-200 shadow-xs hover:shadow-sm font-family-medium"
                        />

                        {/* Inside Add Button / Spinner */}
                        <div className="absolute right-2.5 flex items-center gap-1 z-10">
                          {PridicLoadingStop ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
                          ) : (
                            <button
                              type="button"
                              onClick={addlocation}
                              disabled={!selectedStop}
                              title="Add Stop"
                              className="w-7 h-7 rounded-lg bg-[#004a70] hover:bg-[#003855] text-white flex items-center justify-center border-none transition-colors disabled:opacity-35 cursor-pointer shadow-xs"
                            >
                              <IoMdAddCircleOutline size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {StopPredictions.length > 0 && (
                        <ListGroup className="absolute z-30 w-full bg-white rounded-2xl shadow-xl border border-slate-100 max-h-[220px] overflow-y-auto !mt-1.5 p-1">
                          {StopPredictions.map((prediction) => (
                            <ListGroupItem
                              key={prediction.place_id}
                              onClick={() => HadleStopPridication(prediction)}
                              className="px-3 py-2 text-xs text-slate-700 font-family-medium cursor-pointer hover:bg-slate-50 hover:text-[#004a70] rounded-xl transition-colors border-none"
                            >
                              {prediction.description}
                            </ListGroupItem>
                          ))}
                        </ListGroup>
                      )}
                    </div>
                  )}
                />

                {LocationDetails3.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl !mt-2 shadow-2xs"
                  >
                    <span className="text-xs font-family-medium text-slate-800 truncate">
                      {item?.address}
                    </span>
                    <button
                      type="button"
                      onClick={() => RemoveStop(index)}
                      className="text-rose-500 hover:text-rose-700 bg-transparent border-none p-0 flex items-center shrink-0 cursor-pointer"
                    >
                      <IoMdCloseCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* End Location */}
              <div>
                <label className="text-xs text-slate-700 block !mb-1.5 font-family-semibold flex items-center gap-1.5">
                  <MdOutlineMyLocation size={12} className="text-[#004a70]" />
                  <span>End Location</span>
                </label>
                <Controller
                  name="metaTitle"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                          <FaSearch className="w-3.5 h-3.5" />
                        </div>
                        <input
                          {...field}
                          placeholder="Enter destination location"
                          value={SearchQueryEnd}
                          onChange={(e) => HandleEndSearch(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-gray-200 text-[13.5px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:ring-offset-1 focus:border-none transition-all duration-200 shadow-xs hover:shadow-sm font-family-medium"
                        />

                        {PridicLoadingEnd && (
                          <div className="absolute right-3 flex items-center z-10">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
                          </div>
                        )}
                      </div>

                      {errors.metaTitle && (
                        <span className="text-[11px] text-rose-500 block !mt-1 font-family-medium">
                          {errors.metaTitle.message}
                        </span>
                      )}

                      {EndPredictions.length > 0 && (
                        <ListGroup className="absolute z-30 w-full bg-white rounded-2xl shadow-xl border border-slate-100 max-h-[220px] overflow-y-auto !mt-1.5 p-1">
                          {EndPredictions.map((prediction) => (
                            <ListGroupItem
                              key={prediction.place_id}
                              onClick={() => HadleEndPridication(prediction)}
                              className="px-3 py-2 text-xs text-slate-700 font-family-medium cursor-pointer hover:bg-slate-50 hover:text-[#004a70] rounded-xl transition-colors border-none"
                            >
                              {prediction.description}
                            </ListGroupItem>
                          ))}
                        </ListGroup>
                      )}
                    </div>
                  )}
                />
                <p className="text-[11px] text-slate-400 !mt-1.5 !m-0 font-family-regular">
                  Copy and paste End location if it doesn&rsquo;t fetch automatically
                </p>
              </div>

              {/* Submit CTA (Disabled when uploading parcel image or loading) */}
              <div className="!pt-3">
                <button
                  type="submit"
                  disabled={isLoading || uploadLoading}
                  className="w-full !py-3 rounded-xl bg-[#004a70] hover:bg-[#003855] text-white font-family-semibold text-sm shadow-md hover:shadow-lg transition-all border-none cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading || uploadLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>{uploadLoading ? "Uploading Image..." : "Please wait..."}</span>
                    </div>
                  ) : (
                    <span>Next</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Map Card (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.04)] overflow-hidden min-h-[480px] h-[540px] relative">
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
  control: (base, state) => ({
    ...base,
    borderRadius: 12,
    borderColor: error ? "#f43f5e" : state.isFocused ? "#004a70" : "#e2e8f0",
    borderWidth: 1,
    minHeight: 44,
    fontSize: 13.5,
    fontFamily: "Inter, sans-serif",
    boxShadow: state.isFocused ? "0 0 0 1px #004a70" : "none",
    backgroundColor: "#ffffff",
    "&:hover": { borderColor: "#004a70" },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 99999,
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 99999,
  }),
  placeholder: (base) => ({ ...base, fontSize: 13.5, color: "#94a3b8" }),
  option: (base, state) => ({
    ...base,
    fontSize: 13,
    backgroundColor: state.isSelected ? "#004a70" : state.isFocused ? "#f0f9ff" : "#fff",
    color: state.isSelected ? "#fff" : "#1e293b",
    cursor: "pointer",
  }),
});

const MakeRIde = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-12"><Spinner animation="border" /></div>}>
      <RidePage />
    </Suspense>
  );
};

export default MakeRIde;
