"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Spinner } from "react-bootstrap";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { IoArrowBack } from "react-icons/io5";
import { MdMyLocation } from "react-icons/md";
import { Flag, User } from "react-feather";
import { renderToString } from "react-dom/server";

const MapPage = () => {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const { token } = useParams();
  const router = useRouter();
  const api = ApiFunction();
  const { getData, header1 } = api;

  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const watchId = useRef(null);

  const fetchOrderDetails = async () => {
    try {
      const res = await getData(`assign-driver/${token}`, header1);
      if (res?.success || res?.order) {
        setOrderDetails(res?.order || res?.request);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrderDetails();
    }
  }, [token]);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setDriverLocation({ lat: latitude, lng: longitude });
          if (driverMarkerRef.current) {
            driverMarkerRef.current.setLngLat([longitude, latitude]);
          }
        },
        (error) => console.error("Error watching position:", error),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 },
      );
    }
    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  const calculateBounds = () => {
    if (!orderDetails) return null;

    const pickupCoords = orderDetails.start_location?.coordinates || [0, 0];
    const dropoffCoords = orderDetails.end_location?.coordinates || [0, 0];
    const driverCoords = driverLocation
      ? [driverLocation.lng, driverLocation.lat]
      : pickupCoords;
    const stopCoords =
      orderDetails.stops?.map(
        (s) => s.location?.coordinates || [s.longitude, s.latitude],
      ) || [];

    const bounds = new mapboxgl.LngLatBounds();
    if (pickupCoords[0] !== 0) bounds.extend(pickupCoords);
    if (dropoffCoords[0] !== 0) bounds.extend(dropoffCoords);
    if (driverLocation) bounds.extend(driverCoords);
    stopCoords.forEach((c) => c && c[0] && c[1] && bounds.extend(c));

    return bounds.isEmpty()
      ? new mapboxgl.LngLatBounds([-62.8, 17.2], [-62.6, 17.4])
      : bounds;
  };

  const initMap = () => {
    if (!orderDetails || !mapContainerRef.current) return;

    if (mapRef.current) mapRef.current.remove();

    const finalBounds = calculateBounds();
    const pickupCoords = orderDetails.start_location?.coordinates || [0, 0];
    const dropoffCoords = orderDetails.end_location?.coordinates || [0, 0];
    const driverCoords = driverLocation
      ? [driverLocation.lng, driverLocation.lat]
      : pickupCoords;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      bounds: finalBounds,
      fitBoundsOptions: { padding: 50 },
    });

    mapRef.current = map;

    // Driver Marker
    const driverEl = document.createElement("div");
    driverEl.innerHTML = `<div style="background-color: #004a70; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(0,0,0,0.3);"><span style="font-size: 16px;">🚗</span></div>`;
    driverMarkerRef.current = new mapboxgl.Marker(driverEl)
      .setLngLat(driverCoords)
      .addTo(map);

    // 2. Pickup Marker (Icon only)
    const pickupEl = document.createElement("div");
    pickupEl.className = "marker-pin pickup-pin";
    pickupEl.innerHTML = `
      <div class="pin-content">
        ${renderToString(<User size={18} color="white" />)}
      </div>
      <div class="pin-beak"></div>
    `;
    new mapboxgl.Marker(pickupEl, { anchor: "bottom" })
      .setLngLat(pickupCoords)
      .setPopup(
        new mapboxgl.Popup({ closeButton: false, offset: 25 }).setHTML(`
          <div class="custom-popup">
            <span class="popup-label">PICKUP</span>
            <p class="popup-address">${orderDetails.start_location?.address || "Pickup Point"}</p>
          </div>
        `),
      )
      .addTo(map);

    // 3. Stops (B, C...)
    orderDetails.stops?.forEach((stop, index) => {
      const coords = stop.location?.coordinates || [
        stop.longitude,
        stop.latitude,
      ];
      if (coords && coords[0] && coords[1]) {
        const letter = String.fromCharCode(65 + index); // A, B, C...
        const stopEl = document.createElement("div");
        stopEl.className = "marker-pin stop-pin";
        stopEl.innerHTML = `
          <div class="pin-content">
            ${letter}
          </div>
          <div class="pin-beak"></div>
        `;
        new mapboxgl.Marker(stopEl, { anchor: "bottom" })
          .setLngLat([coords[0], coords[1]])
          .setPopup(
            new mapboxgl.Popup({ closeButton: false, offset: 25 }).setHTML(`
              <div class="custom-popup">
                <span class="popup-label" style="color: #9ca3af;">STOP (${letter})</span>
                <p class="popup-address">${stop.address || `Stop ${index + 1}`}</p>
              </div>
            `),
          )
          .addTo(map);
      }
    });

    // 4. Dropoff (Final Letter)
    // 4. Dropoff (Icon only)
    const dropoffEl = document.createElement("div");
    dropoffEl.className = "marker-pin dropoff-pin";
    dropoffEl.innerHTML = `
      <div class="pin-content">
        ${renderToString(<Flag size={18} color="white" />)}
      </div>
      <div class="pin-beak"></div>
    `;
    new mapboxgl.Marker(dropoffEl, { anchor: "bottom" })
      .setLngLat(dropoffCoords)
      .setPopup(
        new mapboxgl.Popup({ closeButton: false, offset: 25 }).setHTML(`
          <div class="custom-popup">
            <span class="popup-label" style="color: #ef4444;">DROPOFF</span>
            <p class="popup-address">${orderDetails.end_location?.address || "Dropoff Point"}</p>
          </div>
        `),
      )
      .addTo(map);

    if (map.loaded()) {
      updateRouteLine();
    } else {
      map.on("load", () => {
        updateRouteLine();
      });
    }
  };

  const updateRouteLine = () => {
    if (!mapRef.current || !orderDetails) return;

    const pickupCoords = orderDetails.start_location?.coordinates || [0, 0];
    const dropoffCoords = orderDetails.end_location?.coordinates || [0, 0];
    const driverCoords = driverLocation
      ? [driverLocation.lng, driverLocation.lat]
      : pickupCoords;

    const allWaypoints = [
      driverCoords,
      pickupCoords,
      ...(orderDetails.stops?.map(
        (s) => s.location?.coordinates || [s.longitude, s.latitude],
      ) || []),
      dropoffCoords,
    ].filter((c) => c && c[0] && c[1]);

    const coordsString = allWaypoints.map((c) => `${c[0]},${c[1]}`).join(";");
    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsString}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    fetch(directionsUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.routes?.[0] && mapRef.current) {
          const route = data.routes[0].geometry.coordinates;
          const geojson = {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: route,
            },
          };

          if (mapRef.current.getSource("route")) {
            mapRef.current.getSource("route").setData(geojson);
          } else {
            mapRef.current.addSource("route", {
              type: "geojson",
              data: geojson,
            });

            // Route Casing (White border)
            mapRef.current.addLayer({
              id: "route-casing",
              type: "line",
              source: "route",
              layout: { "line-join": "round", "line-cap": "round" },
              paint: {
                "line-color": "#ffffff",
                "line-width": 8,
                "line-opacity": 0.8,
              },
            });

            // Main Route Line (Primary Color)
            mapRef.current.addLayer({
              id: "route",
              type: "line",
              source: "route",
              layout: { "line-join": "round", "line-cap": "round" },
              paint: {
                "line-color": "#004a70",
                "line-width": 5,
                "line-opacity": 1,
              },
            });
          }
        }
      })
      .catch((err) => console.error("Error updating route:", err));
  };

  useEffect(() => {
    if (mapRef.current) {
      updateRouteLine();
    }
  }, [driverLocation, orderDetails]);

  useEffect(() => {
    if (!loading && orderDetails) initMap();
  }, [loading, orderDetails]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Spinner animation="border" className="text-[#004a70]" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-10 bg-white p-1.5 rounded-full shadow-lg border-0 flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <IoArrowBack className="text-base text-[#004a70]" />
      </button>

      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Header Badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full shadow-md border border-gray-100 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm font-family-semibold text-gray-800">
          Live Ride Tracking
        </span>
      </div>

      {/* Recenter Button */}
      <button
        onClick={() => {
          const bounds = calculateBounds();
          mapRef.current?.fitBounds(bounds, { padding: 50 });
        }}
        className="absolute bottom-8 left-4 z-10 bg-white p-1.5 rounded-full shadow-lg border-0 flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Reset Zoom"
      >
        <MdMyLocation className="text-base text-[#004a70]" />
      </button>

      <style jsx global>{`
        .mapboxgl-popup {
          z-index: 20;
        }
        .mapboxgl-popup-content {
          padding: 12px 16px !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid rgba(0, 0, 0, 0.05) !important;
        }
        .mapboxgl-popup-tip {
          border-top-color: white !important;
        }
        .custom-popup {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .popup-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #004a70;
          text-transform: uppercase;
        }
        .popup-address {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          line-height: 1.25;
          max-width: 200px;
        }
        .mapboxgl-ctrl-bottom-right,
        .mapboxgl-ctrl-bottom-left {
          display: none !important;
        }

        .marker-pin {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        }
        .pin-content {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          font-weight: bold;
          font-size: 14px;
          z-index: 2;
        }
        .pickup-pin .pin-content {
          background-color: #004a70;
        }
        .stop-pin .pin-content {
          background-color: #9ca3af;
          width: 32px;
          height: 32px;
          font-size: 12px;
        }
        .dropoff-pin .pin-content {
          background-color: #ef4444;
        }

        .pin-beak {
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid white;
          margin-top: -2px;
          filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
          z-index: 1;
        }
        .pickup-pin .pin-beak {
          border-top-color: #004a70;
        }
        .stop-pin .pin-beak {
          border-top-color: #9ca3af;
          border-top-width: 6px;
        }
        .dropoff-pin .pin-beak {
          border-top-color: #ef4444;
        }
      `}</style>
    </div>
  );
};

export default MapPage;
