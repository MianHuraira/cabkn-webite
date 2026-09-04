"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader } from "@googlemaps/js-api-loader";
import {
  FaPlaneArrival,
  FaLocationDot,
  FaUsers,
  FaCar,
  FaShieldHalved,
  FaClock,
  FaCircleCheck,
  FaArrowRight,
} from "react-icons/fa6";
import { MdFlightTakeoff, MdLuggage } from "react-icons/md";
import { IoCloseCircle } from "react-icons/io5";
import { message } from "antd";
import moment from "moment";
import axios from "axios";
import ApiFunction from "@/components/ApiFunction/ApiFunction";

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  "pk.eyJ1IjoibWFybGVncmFudCIsImEiOiJjbTgwdmV0MjkweXB2MnFzNXBjM2x6NThnIn0.3oz3YGaDHiFDh8W5ALk09w";

mapboxgl.accessToken = MAPBOX_TOKEN;

// Fixed St. Kitts Robert L. Bradshaw International Airport (SKB) Coordinates
const SKB_AIRPORT = {
  address: "Robert L. Bradshaw International Airport (SKB), St. Kitts",
  name: "Robert L. Bradshaw International Airport (SKB)",
  latitude: 17.311189,
  longitude: -62.718667,
  coordinates: [-62.718667, 17.311189],
};

const XCD_PER_USD = 2.7;
const LUGGAGE_FEE_PER_PIECE_XCD = 6;
const FLAT_CONVENIENCE_FEE_XCD = 3;

// Popular St. Kitts Hotel & Resort Destinations for Quick Selection
const POPULAR_DESTINATIONS = [
  {
    name: "St. Kitts Marriott Resort & Beach Club",
    area: "Frigate Bay, St. Kitts",
    lat: 17.2831,
    lng: -62.6975,
    tag: "Frigate Bay",
  },
  {
    name: "Park Hyatt St. Kitts Christophe Harbour",
    area: "Banana Bay, South Peninsula",
    lat: 17.2285,
    lng: -62.6469,
    tag: "South Peninsula",
  },
  {
    name: "Koi Resort St. Kitts, Curio Collection",
    area: "Half Moon Bay, St. Kitts",
    lat: 17.3015,
    lng: -62.6954,
    tag: "Half Moon Bay",
  },
  {
    name: "Timothy Beach Resort",
    area: "South Frigate Bay, St. Kitts",
    lat: 17.2798,
    lng: -62.6942,
    tag: "South Frigate",
  },
  {
    name: "Four Seasons Nevis Water Taxi Pier",
    area: "Major's Bay, South Peninsula",
    lat: 17.2215,
    lng: -62.6512,
    tag: "Nevis Transfer",
  },
  {
    name: "Port Zante & Basseterre Town",
    area: "Basseterre, St. Kitts",
    lat: 17.2942,
    lng: -62.7238,
    tag: "City Center",
  },
];

export default function AirportPickupsPage() {
  const router = useRouter();
  const { getData, header1 } = ApiFunction();

  // Booking Form States (Exact Google Places Autocomplete from Signup Page)
  const [dropoffQuery, setDropoffQuery] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [pridicLoading, setPridicLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const [flightNumber, setFlightNumber] = useState("");
  const [arrivalDate, setArrivalDate] = useState(() => moment().format("YYYY-MM-DD"));
  const [arrivalTime, setArrivalTime] = useState(() => moment().add(2, "hours").format("HH:mm"));
  const [passengerCount, setPassengerCount] = useState(2);
  const [luggageCount, setLuggageCount] = useState(2);

  // Map & Route Calculation States
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const airportMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);

  const [distanceKM, setDistanceKM] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [routeLoading, setRouteLoading] = useState(false);

  // Luggage Fee calculation
  const luggageFeeXCD = useMemo(() => {
    return Math.max(0, luggageCount) * LUGGAGE_FEE_PER_PIECE_XCD;
  }, [luggageCount]);

  // Estimated Ride Fare Calculation
  const estimatedFare = useMemo(() => {
    const baseRate = 25;
    const perKmRate = 3.246;
    const distanceCost = (distanceKM || 8) * perKmRate;
    const rideFare = Number((baseRate + distanceCost).toFixed(2));
    const totalXCD = Number((rideFare + FLAT_CONVENIENCE_FEE_XCD + luggageFeeXCD).toFixed(2));
    const totalUSD = Number((totalXCD / XCD_PER_USD).toFixed(2));

    return {
      baseRideFare: rideFare,
      convenienceFee: FLAT_CONVENIENCE_FEE_XCD,
      luggageFee: luggageFeeXCD,
      totalXCD,
      totalUSD,
    };
  }, [distanceKM, luggageFeeXCD]);

  // Google Places Autocomplete Handler - Exactly matching Signup Page (signup/page.jsx:L80-L156)
  const handleAddressSearch = async (text) => {
    setDropoffQuery(text);
    if (!text.trim()) {
      setPredictions([]);
      setNoData(false);
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
        async (predictionsList, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictionsList) {
            const placesService = new google.maps.places.PlacesService(
              document.createElement("div")
            );
            const detailedPredictions = await Promise.all(
              predictionsList.map(
                (prediction) =>
                  new Promise((resolve) => {
                    placesService.getDetails(
                      { placeId: prediction.place_id },
                      (result, detailsStatus) => {
                        if (
                          detailsStatus === google.maps.places.PlacesServiceStatus.OK &&
                          result?.geometry?.location
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
            setPredictions([]);
          }
        }
      );
    } catch (error) {
      console.error("Error importing Places API library:", error);
      setNoData(true);
      setPridicLoading(false);
      setPredictions([]);
    }
  };

  const handlePredictionPress = (prediction) => {
    setDropoffQuery(prediction?.description || "");
    setDropoffLocation({
      name: prediction?.description,
      address: prediction?.description,
      lat: prediction?.latLng?.lat,
      lng: prediction?.latLng?.lng,
    });
    setPredictions([]);
    setNoData(false);
  };

  const handleSelectQuickDestination = (dest) => {
    setDropoffQuery(dest.name);
    setDropoffLocation({
      name: dest.name,
      address: dest.area || dest.name,
      lat: dest.lat,
      lng: dest.lng,
    });
    setPredictions([]);
    setNoData(false);
  };

  // Initialize Mapbox Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: SKB_AIRPORT.coordinates,
      zoom: 12,
      cooperativeGestures: true,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");

    // Add Airport Marker
    const airportEl = document.createElement("div");
    airportEl.className = "skb-airport-marker";
    airportEl.innerHTML = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; cursor: pointer;">
        <span style="position: absolute; width: 40px; height: 40px; border-radius: 9999px; background: rgba(0, 74, 112, 0.28); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 34px; height: 34px; border-radius: 9999px; background: #004a70; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0, 74, 112, 0.4); display: flex; align-items: center; justify-content: center; color: #ffffff;">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
          </svg>
        </div>
      </div>
    `;

    const popup = new mapboxgl.Popup({ offset: 24, closeButton: false }).setHTML(`
      <div style="font-family: inherit; padding: 4px; min-width: 170px;">
        <strong style="color: #004a70; font-size: 13px; font-weight: 700; display: block; margin-bottom: 2px;">
          SKB Airport Terminal
        </strong>
        <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.3;">
          Robert L. Bradshaw International Airport (SKB)
        </p>
        <span style="display: inline-block; margin-top: 4px; font-size: 10px; color: #059669; font-weight: 600;">
          Pickup Point
        </span>
      </div>
    `);

    airportMarkerRef.current = new mapboxgl.Marker({ element: airportEl, anchor: "center" })
      .setLngLat(SKB_AIRPORT.coordinates)
      .setPopup(popup)
      .addTo(map);

    map.on("load", () => {
      airportMarkerRef.current?.togglePopup();
      map.resize();
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Route and Destination on Map when Dropoff changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !dropoffLocation?.lng || !dropoffLocation?.lat) return;

    if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.remove();
    }

    const dropoffEl = document.createElement("div");
    dropoffEl.innerHTML = `
      <div style="width: 34px; height: 34px; border-radius: 9999px; background: #dc2626; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4); display: flex; align-items: center; justify-content: center; color: #ffffff;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    `;

    const dropoffPopup = new mapboxgl.Popup({ offset: 24, closeButton: false }).setHTML(`
      <div style="font-family: inherit; padding: 4px; min-width: 170px;">
        <strong style="color: #dc2626; font-size: 13px; font-weight: 700; display: block; margin-bottom: 2px;">
          Dropoff Location
        </strong>
        <p style="margin: 0; font-size: 11px; color: #475569; line-height: 1.3;">
          ${dropoffLocation.name || dropoffLocation.address}
        </p>
      </div>
    `);

    dropoffMarkerRef.current = new mapboxgl.Marker({ element: dropoffEl, anchor: "center" })
      .setLngLat([dropoffLocation.lng, dropoffLocation.lat])
      .setPopup(dropoffPopup)
      .addTo(map);

    // Fetch driving directions from Mapbox Directions API
    const fetchRoute = async () => {
      setRouteLoading(true);
      try {
        const coords = `${SKB_AIRPORT.longitude},${SKB_AIRPORT.latitude};${dropoffLocation.lng},${dropoffLocation.lat}`;
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
        const res = await axios.get(url);
        const route = res.data?.routes?.[0];

        if (route) {
          const distKm = Number((route.distance / 1000).toFixed(1));
          const durMins = Math.round(route.duration / 60);
          setDistanceKM(distKm);
          setDurationMinutes(durMins);

          const geojson = {
            type: "Feature",
            geometry: route.geometry,
          };

          if (map.getSource("airport-route")) {
            map.getSource("airport-route").setData(geojson);
          } else {
            map.addSource("airport-route", {
              type: "geojson",
              data: geojson,
            });

            map.addLayer({
              id: "airport-route-line",
              type: "line",
              source: "airport-route",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#004a70",
                "line-width": 5,
                "line-opacity": 0.85,
              },
            });
          }

          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend(SKB_AIRPORT.coordinates);
          bounds.extend([dropoffLocation.lng, dropoffLocation.lat]);
          map.fitBounds(bounds, { padding: 60, duration: 1000 });
        }
      } catch (err) {
        console.error("Mapbox route error:", err);
      } finally {
        setRouteLoading(false);
      }
    };

    fetchRoute();
  }, [dropoffLocation]);

  // Submit and Proceed to BookRide / Checkout Flow
  const handleProceedToBooking = () => {
    if (!dropoffLocation?.lng || !dropoffLocation?.lat) {
      message.error("Please enter or select your dropoff destination in St. Kitts");
      return;
    }

    if (!flightNumber.trim()) {
      message.error("Please enter your incoming flight number (e.g. AA 1234)");
      return;
    }

    if (!arrivalDate) {
      message.error("Please select estimated flight arrival date");
      return;
    }

    if (!arrivalTime) {
      message.error("Please select estimated flight arrival time");
      return;
    }

    const pCount = Number(passengerCount) || 1;
    if (pCount < 1 || pCount > 12) {
      message.error("Passengers must be between 1 and 12");
      return;
    }

    // Build Payload matching rest of website and mobile app
    const airportPayload = {
      isAirportPickup: true,
      flightNumber: flightNumber.trim().toUpperCase(),
      bookingtype: "schedule",
      schedule_date: arrivalDate,
      schedule_time: arrivalTime,
      passengerCount: pCount,
      luggageCount: Number(luggageCount) || 0,
      luggageFee: luggageFeeXCD,
      name: SKB_AIRPORT.name,
      address: SKB_AIRPORT.address,
      start: SKB_AIRPORT.coordinates,
      start_address: SKB_AIRPORT.address,
      start_lat: SKB_AIRPORT.latitude,
      start_lng: SKB_AIRPORT.longitude,
      metaTitle: dropoffLocation.name || dropoffLocation.address,
      end_address: dropoffLocation.name || dropoffLocation.address,
      end: [dropoffLocation.lng, dropoffLocation.lat],
      end_lat: dropoffLocation.lat,
      end_lng: dropoffLocation.lng,
      distance: distanceKM || 8,
      duration: durationMinutes || 20,
      tourPrice: estimatedFare.baseRideFare,
      type: "driver",
      rideType: "driver",
      category: "airport_pickup",
    };

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("cabkn_ride_draft", JSON.stringify(airportPayload));
      } catch (e) {
        console.warn("Could not write to sessionStorage:", e);
      }
    }

    const encoded = encodeURIComponent(JSON.stringify(airportPayload));
    router.push(`/bookRide?data=${encoded}`);
  };

  return (
    <div className="!min-h-screen !bg-slate-50/70 font-poppins">
      {/* ===== HEADER BANNER (Matches Ride Details / Luxury Navy) ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#001726] via-[#002f4a] to-[#001f33] !pt-20 sm:!pt-24 !pb-12 sm:!pb-14 text-white">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001726]/90 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm font-family-medium mb-2.5">
            <Link href="/" className="hover:text-white transition-colors no-underline text-slate-300 font-family-medium">
              Home
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-white font-family-semibold">Airport Pickups</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-family-semibold text-white tracking-tight !m-0 leading-tight">
              St. Kitts (SKB){" "}
              <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent font-family-semibold">
                Airport Pickups
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-family-regular !m-0 mt-1.5 max-w-2xl leading-relaxed">
              Pre-book your private transfer from Robert L. Bradshaw International Airport (SKB) to any hotel, resort, or villa with flight tracking and transparent flat rates.
            </p>
          </div>
        </div>
      </section>

      {/* ===== MAIN CONTENT CONTAINER ===== */}
      <div className="!max-w-7xl !mx-auto !px-3 sm:!px-6 lg:!px-8 !pt-8 !pb-16 !relative !z-30 !space-y-6">
        <div className="!grid !grid-cols-1 lg:!grid-cols-12 !gap-6 lg:!gap-8 !items-start">
          
          {/* LEFT: BOOKING FORM CARD (7 COLS) */}
          <div className="lg:!col-span-7 !bg-white !rounded-2xl sm:!rounded-3xl !p-5 sm:!p-7 !border !border-slate-200/80 !shadow-xs sm:!shadow-[0_4px_25px_rgba(0,0,0,0.04)] !space-y-5">
            
            {/* Form Title & Subtitle */}
            <div className="!pb-3.5 !border-b !border-slate-100">
              <h2 className="!text-base sm:!text-lg !font-family-semibold !text-slate-900 !m-0">
                Airport Transfer Details
              </h2>
              <p className="!text-xs !text-slate-500 !font-family-regular !m-0 !mt-0.5">
                Provide your flight and destination information for guaranteed pickup
              </p>
            </div>

            {/* 1. PICKUP POINT (LOCKED TO SKB AIRPORT) */}
            <div className="!space-y-1.5">
              <label className="!inline-block !w-fit !text-[13px] !font-family-semibold !text-slate-700 !select-none !pl-0.5">
                1. Airport Pickup Point
              </label>

              <div className="!flex !items-center !gap-3 !p-3 !bg-slate-50/80 !border !border-slate-200/80 !rounded-xl">
                <div className="!w-9 !h-9 !rounded-lg !bg-[#004a70] !text-white !flex !items-center !justify-center !shrink-0 !shadow-xs">
                  <FaPlaneArrival size={15} />
                </div>
                <div className="!min-w-0 !flex-1">
                  <p className="!text-xs sm:!text-[13.5px] !font-family-semibold !text-slate-800 !m-0 !truncate">
                    {SKB_AIRPORT.name}
                  </p>
                  <p className="!text-[11px] !text-slate-500 !font-family-regular !m-0 !truncate">
                    Basseterre, Saint Kitts &amp; Nevis (SKB)
                  </p>
                </div>
                <span className="!px-2.5 !py-1 !bg-emerald-50 !border !border-emerald-200/70 !text-emerald-700 !text-[10.5px] !font-family-semibold !rounded-lg !shrink-0">
                  Terminal Pickup
                </span>
              </div>
            </div>

            {/* 2. DROPOFF DESTINATION (EXACT MATCH WITH SIGNUP PAGE GOOGLE PLACES AUTOCOMPLETE) */}
            <div className="!space-y-1 !relative">
              <label htmlFor="address" className="!inline-block !w-fit !text-[13px] !font-family-semibold !text-slate-700 !select-none !pl-0.5 !cursor-pointer">
                2. Where are you heading in St. Kitts? *
              </label>

              <div className="!relative">
                <input
                  id="address"
                  type="text"
                  name="address"
                  placeholder="Enter your destination or resort"
                  value={dropoffQuery}
                  onChange={(e) => handleAddressSearch(e.target.value)}
                  onBlur={() => {
                    setTimeout(() => {
                      setPredictions([]);
                      setNoData(false);
                    }, 250);
                  }}
                  className="input-field !font-family-regular"
                  autoComplete="street-address"
                />

                {pridicLoading && (
                  <div className="!absolute !right-3.5 !top-1/2 !-translate-y-1/2 !z-10">
                    <div className="!h-4 !w-4 !animate-spin !rounded-full !border-2 !border-slate-200 !border-t-[#004a70]" />
                  </div>
                )}

                {dropoffQuery && !pridicLoading && (
                  <button
                    type="button"
                    onClick={() => {
                      setDropoffQuery("");
                      setDropoffLocation(null);
                      setPredictions([]);
                      setNoData(false);
                    }}
                    title="Clear address"
                    className="!absolute !right-3 !top-1/2 !-translate-y-1/2 !text-slate-400 hover:!text-slate-600 !transition-colors !cursor-pointer !border-none !bg-transparent !p-0 !z-10"
                  >
                    <IoCloseCircle className="!w-4 !h-4" />
                  </button>
                )}
              </div>

              {/* Exact Autocomplete Predictions Dropdown from Signup Page */}
              {predictions.length > 0 && (
                <div className="!absolute !z-50 !left-0 !right-0 !mt-1 !max-h-52 !overflow-y-auto !rounded-2xl !border !border-slate-200/90 !bg-white/95 !backdrop-blur-md !py-1.5 !shadow-xl">
                  {predictions.map((prediction, idx) => (
                    <div
                      key={idx}
                      onClick={() => handlePredictionPress(prediction)}
                      className="!font-family-regular !w-full !text-left !px-4 !py-2.5 !text-[13.5px] !text-slate-700 hover:!bg-slate-50 !transition !cursor-pointer"
                    >
                      {prediction.description}
                    </div>
                  ))}
                </div>
              )}

              {noData && (
                <div className="!font-family-regular !absolute !z-50 !left-0 !right-0 !mt-1 !rounded-2xl !border !border-slate-200/90 !bg-white/95 !backdrop-blur-md !py-2.5 !px-4 !shadow-xl !text-[13.5px] !text-slate-500">
                  No results found
                </div>
              )}

              {/* Popular St. Kitts Resorts Quick Select Chips */}
              <div className="!pt-1.5">
                <p className="!text-[11px] !font-family-semibold !text-slate-500 !m-0 !mb-1.5">
                  Popular Resorts &amp; Destinations:
                </p>
                <div className="!flex !flex-wrap !gap-1.5">
                  {POPULAR_DESTINATIONS.map((dest, i) => (
                    <button
                      key={`pop-${i}`}
                      type="button"
                      onClick={() => handleSelectQuickDestination(dest)}
                      className={`!px-2.5 !py-1 !rounded-lg !text-[11px] !font-family-medium !transition-all !cursor-pointer !border ${
                        dropoffLocation?.name === dest.name
                          ? "!bg-[#004a70] !text-white !border-[#004a70] !shadow-xs"
                          : "!bg-slate-100/90 hover:!bg-slate-200/90 !text-slate-700 !border-slate-200/70"
                      }`}
                    >
                      <span className="!font-family-medium">{dest.name.split(" ")[0]} {dest.name.split(" ")[1]}</span>
                      <span className="!text-[9.5px] !opacity-75 !ml-1 !font-family-regular">({dest.tag})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. FLIGHT NUMBER & ARRIVAL SCHEDULE */}
            <div className="!grid !grid-cols-1 sm:!grid-cols-3 !gap-3 !pt-1">
              <div className="!space-y-1">
                <label className="!inline-block !w-fit !text-[13px] !font-family-semibold !text-slate-700 !select-none !pl-0.5">
                  Flight Number *
                </label>
                <div className="!relative !flex !items-center">
                  <div className="!absolute !left-3.5 !flex !items-center !pointer-events-none !text-slate-400 !z-10">
                    <MdFlightTakeoff className="!w-4 !h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. AA 1234"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    className="input-field !pl-10 !font-family-semibold !uppercase"
                  />
                </div>
              </div>

              <div className="!space-y-1">
                <label className="!inline-block !w-fit !text-[13px] !font-family-semibold !text-slate-700 !select-none !pl-0.5">
                  Arrival Date *
                </label>
                <input
                  type="date"
                  value={arrivalDate}
                  min={moment().format("YYYY-MM-DD")}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="input-field !cursor-pointer !font-family-medium"
                />
              </div>

              <div className="!space-y-1">
                <label className="!inline-block !w-fit !text-[13px] !font-family-semibold !text-slate-700 !select-none !pl-0.5">
                  Arrival Time *
                </label>
                <input
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="input-field !cursor-pointer !font-family-medium"
                />
              </div>
            </div>

            {/* 4. PASSENGERS & LUGGAGE COUNTERS */}
            <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-3.5 !pt-1">
              
              {/* Passengers Stepper Card */}
              <div className="!p-3.5 !bg-slate-50/80 !border !border-slate-200/80 !rounded-xl !space-y-2">
                <div className="!flex !items-center !justify-between">
                  <div>
                    <p className="!text-xs !font-family-semibold !text-slate-800 !m-0">Passengers</p>
                    <p className="!text-[10px] !text-slate-500 !font-family-regular !m-0">1 to 12 passengers</p>
                  </div>
                  <div className="!flex !items-center !gap-2 !bg-white !rounded-lg !border !border-slate-200 !p-1">
                    <button
                      type="button"
                      disabled={passengerCount <= 1}
                      onClick={() => setPassengerCount((p) => Math.max(1, p - 1))}
                      className="!w-7 !h-7 !rounded-md !bg-slate-100 hover:!bg-slate-200 disabled:!opacity-30 disabled:!pointer-events-none !text-slate-700 !font-family-semibold !flex !items-center !justify-center !cursor-pointer !border-none"
                    >
                      -
                    </button>
                    <span className="!w-6 !text-center !text-xs !font-family-semibold !text-slate-900">
                      {passengerCount}
                    </span>
                    <button
                      type="button"
                      disabled={passengerCount >= 12}
                      onClick={() => setPassengerCount((p) => Math.min(12, p + 1))}
                      className="!w-7 !h-7 !rounded-md !bg-slate-100 hover:!bg-slate-200 disabled:!opacity-30 disabled:!pointer-events-none !text-slate-700 !font-family-semibold !flex !items-center !justify-center !cursor-pointer !border-none"
                    >
                      +
                    </button>
                  </div>
                </div>

               
              </div>

              {/* Luggage Pieces Stepper Card */}
              <div className="!p-3.5 !bg-slate-50/80 !border !border-slate-200/80 !rounded-xl !space-y-2">
                <div className="!flex !items-center !justify-between">
                  <div>
                    <p className="!text-xs !font-family-semibold !text-slate-800 !m-0">Luggage Pieces</p>
                    <p className="!text-[10px] !text-slate-500 !font-family-regular !m-0">$6.00 XCD (~$2.22 USD) per piece</p>
                  </div>
                  <div className="!flex !items-center !gap-2 !bg-white !rounded-lg !border !border-slate-200 !p-1">
                    <button
                      type="button"
                      disabled={luggageCount <= 0}
                      onClick={() => setLuggageCount((l) => Math.max(0, l - 1))}
                      className="!w-7 !h-7 !rounded-md !bg-slate-100 hover:!bg-slate-200 disabled:!opacity-30 disabled:!pointer-events-none !text-slate-700 !font-family-semibold !flex !items-center !justify-center !cursor-pointer !border-none"
                    >
                      -
                    </button>
                    <span className="!w-6 !text-center !text-xs !font-family-semibold !text-slate-900">
                      {luggageCount}
                    </span>
                    <button
                      type="button"
                      disabled={luggageCount >= 20}
                      onClick={() => setLuggageCount((l) => Math.min(20, l + 1))}
                      className="!w-7 !h-7 !rounded-md !bg-slate-100 hover:!bg-slate-200 disabled:!opacity-30 disabled:!pointer-events-none !text-slate-700 !font-family-semibold !flex !items-center !justify-center !cursor-pointer !border-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="!pt-1.5 !border-t !border-slate-200/60 !flex !items-center !justify-between !text-[11px]">
                  <span className="!text-slate-500 !font-family-regular">Luggage Surcharge:</span>
                  <span className="!font-family-semibold !text-slate-800">
                    ${luggageFeeXCD.toFixed(2)} XCD{" "}
                    <span className="!text-[10px] !text-slate-400 !font-family-regular">
                      (≈ ${(luggageFeeXCD / XCD_PER_USD).toFixed(2)} USD)
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* 5. FARE BREAKDOWN BOX */}
            <div className="!p-4 !bg-slate-50/90 !border !border-slate-200/90 !rounded-2xl !space-y-2">
              <div className="!flex !justify-between !items-center !text-xs !text-slate-600">
                <span className="!font-family-regular">Base Airport Transfer ({distanceKM ? `${distanceKM} km` : "Standard Route"})</span>
                <span className="!font-family-semibold !text-slate-800">
                  ${estimatedFare.baseRideFare.toFixed(2)} XCD
                </span>
              </div>

              <div className="!flex !justify-between !items-center !text-xs !text-slate-600">
                <span className="!font-family-regular">Platform Convenience Fee</span>
                <span className="!font-family-semibold !text-slate-800">
                  $3.00 XCD - $1.11 USD
                </span>
              </div>

              {luggageFeeXCD > 0 && (
                <div className="!flex !justify-between !items-center !text-xs !text-slate-600">
                  <span className="!font-family-regular">Luggage Surcharge ({luggageCount} pieces × $6 XCD)</span>
                  <span className="!font-family-semibold !text-slate-800">
                    +${luggageFeeXCD.toFixed(2)} XCD
                  </span>
                </div>
              )}

              <div className="!pt-2.5 !border-t !border-slate-200 !flex !justify-between !items-baseline">
                <div>
                  <span className="!text-xs !font-family-semibold !text-slate-900 !block">
                    Total Estimated Fare
                  </span>
                  <span className="!text-[11px] !text-slate-400 !font-family-regular">
                    Includes all taxes &amp; fees
                  </span>
                </div>

                <div className="!text-right">
                  <div className="!text-xl sm:!text-2xl !font-family-semibold !text-[#004a70]">
                    ${estimatedFare.totalXCD.toFixed(2)}{" "}
                    <span className="!text-xs !font-family-semibold !text-slate-500">XCD</span>
                  </div>
                  <div className="!text-xs !font-family-medium !text-slate-400">
                    ≈ ${estimatedFare.totalUSD.toFixed(2)} USD
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION SUBMIT BUTTON */}
            <button
              type="button"
              onClick={handleProceedToBooking}
              className="!w-full !py-3.5 !bg-[#004a70] hover:!bg-[#003855] !text-white !font-family-semibold !rounded-xl sm:!rounded-2xl !shadow-md !transition-all !cursor-pointer !border-none !text-sm !flex !items-center !justify-center !gap-2"
            >
              <span className="!font-family-semibold">Proceed to Book Ride</span>
            </button>
          </div>

          {/* RIGHT: MAPBOX VISUALIZER & AIRPORT PERKS (5 COLS) */}
          <div className="lg:!col-span-5 !space-y-5">
            
            {/* Map Card */}
            <div className="!bg-white !rounded-2xl sm:!rounded-3xl !overflow-hidden !border !border-slate-200/80 !shadow-xs !relative !min-h-[380px] !h-[420px]">
              <div ref={mapContainerRef} className="!w-full !h-full" />

              {/* Floating Route Distance & Estimated Time Badge */}
              {distanceKM > 0 && (
                <div className="!absolute !top-3.5 !left-3.5 !bg-white/95 !backdrop-blur-md !px-3.5 !py-2 !rounded-xl !border !border-slate-200 !shadow-sm !text-xs !text-slate-800 !flex !items-center !gap-3 !z-10">
                  <div>
                    <span className="!text-slate-400 !block !text-[10px] !font-family-medium">DISTANCE</span>
                    <span className="!font-family-semibold !text-[#004a70]">{distanceKM} km</span>
                  </div>
                  <div className="!h-6 !w-px !bg-slate-200" />
                  <div>
                    <span className="!text-slate-400 !block !text-[10px] !font-family-medium">EST. TIME</span>
                    <span className="!font-family-semibold !text-[#004a70]">{durationMinutes} mins</span>
                  </div>
                </div>
              )}
            </div>

            {/* Transfer Guarantees Card */}
            <div className="!bg-white !rounded-2xl sm:!rounded-3xl !p-5 !border !border-slate-200/80 !shadow-xs !space-y-3.5">
              <h3 className="!text-sm !font-family-semibold !text-slate-900 !m-0 !flex !items-center !gap-2">
                <FaShieldHalved className="!text-[#004a70]" />
                <span className="!font-family-semibold">Why Travelers Choose Cabkn Airport Transfers:</span>
              </h3>

              <div className="!space-y-3 !text-xs !text-slate-600">
                <div className="!flex !items-start !gap-2.5">
                  <div className="!w-6 !h-6 !rounded-lg !bg-emerald-50 !text-emerald-600 !flex !items-center !justify-center !shrink-0 !mt-0.5">
                    <FaClock size={12} />
                  </div>
                  <div>
                    <p className="!font-family-semibold !text-slate-800 !m-0">Flight Delay Tracking</p>
                    <p className="!text-[11px] !text-slate-500 !font-family-regular !m-0 !mt-0.5 !leading-relaxed">
                      Your driver monitors your flight in real time and automatically adjusts your pickup time without penalty.
                    </p>
                  </div>
                </div>

                <div className="!flex !items-start !gap-2.5">
                  <div className="!w-6 !h-6 !rounded-lg !bg-sky-50 !text-[#004a70] !flex !items-center !justify-center !shrink-0 !mt-0.5">
                    <MdLuggage size={14} />
                  </div>
                  <div>
                    <p className="!font-family-semibold !text-slate-800 !m-0">Full Luggage Assistance</p>
                    <p className="!text-[11px] !text-slate-500 !font-family-regular !m-0 !mt-0.5 !leading-relaxed">
                      Driver greets you with a name sign at SKB terminal exit and assists with loading all baggage.
                    </p>
                  </div>
                </div>

                <div className="!flex !items-start !gap-2.5">
                  <div className="!w-6 !h-6 !rounded-lg !bg-purple-50 !text-purple-600 !flex !items-center !justify-center !shrink-0 !mt-0.5">
                    <FaCar size={12} />
                  </div>
                  <div>
                    <p className="!font-family-semibold !text-slate-800 !m-0">Air-Conditioned Comfort</p>
                    <p className="!text-[11px] !text-slate-500 !font-family-regular !m-0 !mt-0.5 !leading-relaxed">
                      Clean, inspected sedans, SUVs, and passenger vans suited for Caribbean island journeys.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ===== 3-STEP PROCESS SECTION ===== */}
        <div className="!bg-white !rounded-2xl sm:!rounded-3xl !p-6 sm:!p-8 !border !border-slate-200/80 !shadow-xs !mt-8">
          <div className="!text-center !max-w-2xl !mx-auto !mb-8">
            <span className="!inline-flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !bg-sky-50 !text-[#004a70] !text-xs !font-family-semibold !uppercase !tracking-wider">
              Easy 3-Step Process
            </span>
            <h2 className="!text-lg sm:!text-2xl !font-family-semibold !text-slate-900 !mt-2.5 !m-0">
              How St. Kitts Airport Transfers Work
            </h2>
            <p className="!text-xs sm:!text-sm !text-slate-500 !font-family-regular !mt-1 !m-0">
              Direct private transfers from Robert L. Bradshaw International Airport (SKB)
            </p>
          </div>

          <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-5">
            <div className="!p-5 !rounded-2xl !bg-slate-50/80 !border !border-slate-200/70 !text-center !space-y-2">
              <div className="!w-10 !h-10 !rounded-xl !bg-[#004a70] !text-white !font-family-semibold !text-sm !flex !items-center !justify-center !mx-auto !shadow-xs">
                1
              </div>
              <h3 className="!text-sm !font-family-semibold !text-slate-800 !m-0">Pre-Book Online</h3>
              <p className="!text-xs !text-slate-500 !font-family-regular !m-0 !leading-relaxed">
                Select your resort and enter your flight number. Your rate is locked in with zero surprises.
              </p>
            </div>

            <div className="!p-5 !rounded-2xl !bg-slate-50/80 !border !border-slate-200/70 !text-center !space-y-2">
              <div className="!w-10 !h-10 !rounded-xl !bg-[#004a70] !text-white !font-family-semibold !text-sm !flex !items-center !justify-center !mx-auto !shadow-xs">
                2
              </div>
              <h3 className="!text-sm !font-family-semibold !text-slate-800 !m-0">Flight Tracking &amp; Meet</h3>
              <p className="!text-xs !text-slate-500 !font-family-regular !m-0 !leading-relaxed">
                Your driver tracks your flight live. As you exit customs at SKB, look for your driver holding your name sign.
              </p>
            </div>

            <div className="!p-5 !rounded-2xl !bg-slate-50/80 !border !border-slate-200/70 !text-center !space-y-2">
              <div className="!w-10 !h-10 !rounded-xl !bg-[#004a70] !text-white !font-family-semibold !text-sm !flex !items-center !justify-center !mx-auto !shadow-xs">
                3
              </div>
              <h3 className="!text-sm !font-family-semibold !text-slate-800 !m-0">Direct Resort Dropoff</h3>
              <p className="!text-xs !text-slate-500 !font-family-regular !m-0 !leading-relaxed">
                Sit back in air-conditioned comfort as you are driven straight to your resort or villa.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
