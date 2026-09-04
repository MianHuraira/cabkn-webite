"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  FiArrowRight,
  FiShield,
  FiClock,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { FaCar } from "react-icons/fa";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import CustomButton from "../CustomButton";
import { AuthSpinner } from "@/components/auth/AuthShell";

mapboxgl.accessToken =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  "pk.eyJ1IjoibWFybGVncmFudCIsImEiOiJjbTgwdmV0MjkweXB2MnFzNXBjM2x6NThnIn0.3oz3YGaDHiFDh8W5ALk09w";

// Default St. Kitts coordinates (Basseterre)
const DEFAULT_COORDS = {
  lng: -62.7303,
  lat: 17.3026,
};

// Clustering threshold zoom level
const MAX_CLUSTER_ZOOM = 14.2;

// Generate realistic nearby simulated points if API returns empty or invalid coordinates
const generateMockDriversAround = (lat, lng, isGps = false) => {
  // Includes 3 drivers grouped near each other to clearly demonstrate the 3-driver cluster & separation
  const offsets = [
    { dLat: 0.0018, dLng: 0.0018, name: "Gunnar Carmack", vehicle: "18–20 Yards (Standard Sedan)", dist: "0.3 km away" },
    { dLat: 0.0019, dLng: 0.0020, name: "Sarah Jenkins", vehicle: "Economy Sedan (Comfort)", dist: "0.3 km away" },
    { dLat: 0.0017, dLng: 0.0019, name: "Marcus Reid", vehicle: "Executive Van (7-Seater)", dist: "0.3 km away" },
    { dLat: -0.007, dLng: 0.006, name: "Michael Vance", vehicle: "Executive Van (7-Seater)", dist: "1.1 km away" },
    { dLat: 0.008, dLng: -0.008, name: "James Wilson", vehicle: "Standard Cab (Clean & Vetted)", dist: "1.3 km away" },
    { dLat: -0.006, dLng: -0.007, name: "Emma Watson", vehicle: "Premium SUV (Island Tour)", dist: "1.0 km away" },
  ];
  return offsets.map((off, i) => ({
    _id: `mock-${i}`,
    name: off.name,
    vehicle: off.vehicle,
    address: isGps ? `Nearby Driver • ${off.dist}` : `Basseterre, St. Kitts • ${off.dist}`,
    parsedLng: lng + off.dLng,
    parsedLat: lat + off.dLat,
  }));
};

const RidesNearYou = () => {
  const router = useRouter();
  const { postData, header1 } = ApiFunction();
  const userData = useSelector((state) => state.auth.user?.user);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const allMarkersRef = useRef([]);

  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [hasGps, setHasGps] = useState(false);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);

  // Store latest refs for map event callbacks without adding function dependencies
  const driversRef = useRef([]);
  const coordsRef = useRef(DEFAULT_COORDS);
  const hasGpsRef = useRef(false);
  const updateMapMarkersRef = useRef(null);
  const fitMapToDriversAndUserRef = useRef(null);

  driversRef.current = drivers;
  coordsRef.current = coords;
  hasGpsRef.current = hasGps;

  const handleBookNow = () => {
    router.push(userData ? "/ride" : "/auth/login");
  };

  // Helper to reliably fit and center camera to active drivers and/or user location
  const fitMapToDriversAndUser = (customDrivers, customCoords, isGps) => {
    const map = mapRef.current;
    if (!map) return;

    const currentDrivers = customDrivers || driversRef.current || [];
    const currentCoords = customCoords || coordsRef.current || DEFAULT_COORDS;

    map.resize();

    const bounds = new mapboxgl.LngLatBounds();
    let pointCount = 0;

    // Extend bounds for all active drivers
    if (Array.isArray(currentDrivers) && currentDrivers.length > 0) {
      currentDrivers.forEach((driver) => {
        const lng = typeof driver?.parsedLng === "number" ? driver.parsedLng : null;
        const lat = typeof driver?.parsedLat === "number" ? driver.parsedLat : null;
        if (lng !== null && lat !== null && !isNaN(lng) && !isNaN(lat)) {
          bounds.extend([lng, lat]);
          pointCount++;
        }
      });
    }

    // Extend bounds for user coordinates
    if (currentCoords && typeof currentCoords.lng === "number" && typeof currentCoords.lat === "number") {
      bounds.extend([currentCoords.lng, currentCoords.lat]);
      pointCount++;
    }

    if (pointCount > 0) {
      try {
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const latDiff = Math.abs(ne.lat - sw.lat);
        const lngDiff = Math.abs(ne.lng - sw.lng);

        if (latDiff < 0.002 && lngDiff < 0.002) {
          const center = bounds.getCenter();
          map.flyTo({
            center: [center.lng, center.lat],
            zoom: 14.5,
            duration: 850,
            essential: true,
          });
        } else {
          map.fitBounds(bounds, {
            padding: { top: 90, bottom: 120, left: 80, right: 80 },
            maxZoom: 13.8,
            duration: 850,
            essential: true,
          });
        }
      } catch (err) {
        console.warn("fitBounds failed, using flyTo center:", err);
        if (currentCoords) {
          map.flyTo({
            center: [currentCoords.lng, currentCoords.lat],
            zoom: 13.5,
            duration: 850,
            essential: true,
          });
        }
      }
    } else if (currentCoords) {
      map.flyTo({
        center: [currentCoords.lng, currentCoords.lat],
        zoom: 13.5,
        duration: 850,
        essential: true,
      });
    }
  };

  fitMapToDriversAndUserRef.current = fitMapToDriversAndUser;

  // Intelligently parse coordinates into valid { lng, lat }
  const parseDriverCoords = (driver) => {
    let raw = driver?.location?.coordinates || driver?.coordinates;
    let lng, lat;

    if (Array.isArray(raw) && raw.length >= 2) {
      // Standard GeoJSON is [longitude, latitude]
      lng = Number(raw[0]);
      lat = Number(raw[1]);

      // If latitude is out of bounds (-90 to 90) but longitude is within -90 to 90, flip them
      if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
        const temp = lng;
        lng = lat;
        lat = temp;
      }
    } else if (driver?.longitude !== undefined && driver?.latitude !== undefined) {
      lng = Number(driver.longitude);
      lat = Number(driver.latitude);
    } else if (driver?.lng !== undefined && driver?.lat !== undefined) {
      lng = Number(driver.lng);
      lat = Number(driver.lat);
    }

    if (typeof lng !== "number" || typeof lat !== "number" || isNaN(lng) || isNaN(lat)) {
      return null;
    }

    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return null;
    }

    return { lng, lat };
  };

  // Fetch nearby drivers from backend API
  const fetchNearbyDrivers = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await postData(
        "users/nearby/1",
        { lat, lng },
        header1
      );
      const userList = response?.users || response?.data?.users || [];

      const validList = [];
      userList.forEach((driver) => {
        const parsed = parseDriverCoords(driver);
        if (parsed && typeof parsed.lng === "number" && typeof parsed.lat === "number") {
          const distKm = Math.hypot(parsed.lat - lat, parsed.lng - lng) * 111;
          // Filter to drivers within 100km of the search center
          if (distKm <= 100) {
            validList.push({
              ...driver,
              parsedLng: parsed.lng,
              parsedLat: parsed.lat,
            });
          }
        }
      });

      let chosenDrivers = [];
      if (validList.length === 0) {
        chosenDrivers = generateMockDriversAround(lat, lng, hasGpsRef.current);
      } else {
        chosenDrivers = validList;
      }
      setDrivers(chosenDrivers);
      driversRef.current = chosenDrivers;
      updateMapMarkersRef.current?.();
      fitMapToDriversAndUserRef.current?.(chosenDrivers, { lat, lng }, hasGpsRef.current);
    } catch (error) {
      console.warn("Could not fetch nearby drivers, generating active preview fleet:", error);
      const fallbackDrivers = generateMockDriversAround(lat, lng, hasGpsRef.current);
      setDrivers(fallbackDrivers);
      driversRef.current = fallbackDrivers;
      updateMapMarkersRef.current?.();
      fitMapToDriversAndUserRef.current?.(fallbackDrivers, { lat, lng }, hasGpsRef.current);
    } finally {
      setLoading(false);
    }
  };

  // Core clustering, spiderfy separation & marker rendering
  const updateMapMarkers = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const currentCoords = coordsRef.current;
    const currentDrivers = driversRef.current;
    const isGps = hasGpsRef.current;

    // 1. Remove old markers cleanly
    allMarkersRef.current.forEach((m) => m.remove());
    allMarkersRef.current = [];

    // 2. Add "My Location" marker (Only shows toast on click, NO permanent label above it!)
    if (currentCoords && typeof currentCoords.lng === "number" && typeof currentCoords.lat === "number") {
      const userEl = document.createElement("div");
      userEl.style.width = "36px";
      userEl.style.height = "36px";
      userEl.style.cursor = "pointer";
      userEl.innerHTML = `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; pointer-events: auto;">
          <div style="position: absolute; inset: 0; border-radius: 50%; background-color: rgba(0, 74, 112, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 30px; height: 30px; border-radius: 50%; background-color: #004a70; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,74,112,0.45); display: flex; align-items: center; justify-content: center; color: #ffffff;">
            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 384 512" height="15" width="15" xmlns="http://www.w3.org/2000/svg">
              <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"></path>
            </svg>
          </div>
        </div>
      `;

      // Toast popup for My Location ONLY ON CLICK
      const userToastPopup = new mapboxgl.Popup({
        offset: 20,
        closeButton: true,
        closeOnClick: true,
        className: "driver-toast-card-popup",
      }).setHTML(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 180px; padding: 2px;">
          <div style="font-size: 14px; font-weight: 700; color: #004a70; margin-bottom: 3px; display: flex; align-items: center; gap: 5px;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background-color: #004a70; display: inline-block;"></span>
            ${isGps ? "My Location" : "Default Location"}
          </div>
          <div style="font-size: 11.5px; color: #64748b; line-height: 1.4;">
            ${isGps ? "Your live GPS position is locked." : "Saint Kitts & Nevis (Central)"}
          </div>
        </div>
      `);

      const userMarker = new mapboxgl.Marker({ element: userEl, anchor: "center" })
        .setLngLat([currentCoords.lng, currentCoords.lat])
        .setPopup(userToastPopup)
        .addTo(map);

      allMarkersRef.current.push(userMarker);
    }

    // 3. Dynamic Clustering & Threshold Calculation
    const currentZoom = map.getZoom();
    const shouldCluster = currentZoom < MAX_CLUSTER_ZOOM;

    // Dynamic cluster radius in screen pixels that shrinks as zoom increases
    const thresholdPixels = shouldCluster ? Math.max(28, 52 - (currentZoom - 10) * 6) : 0;

    const clusters = [];

    currentDrivers.forEach((driver) => {
      const lng = driver.parsedLng;
      const lat = driver.parsedLat;
      if (typeof lng !== "number" || typeof lat !== "number") return;

      const pt = map.project([lng, lat]);
      let match = null;

      if (shouldCluster) {
        for (const c of clusters) {
          if (Math.hypot(c.x - pt.x, c.y - pt.y) < thresholdPixels) {
            match = c;
            break;
          }
        }
      }

      if (match) {
        match.drivers.push(driver);
        match.lng = (match.lng * (match.drivers.length - 1) + lng) / match.drivers.length;
        match.lat = (match.lat * (match.drivers.length - 1) + lat) / match.drivers.length;
        const newPt = map.project([match.lng, match.lat]);
        match.x = newPt.x;
        match.y = newPt.y;
      } else {
        clusters.push({
          lng,
          lat,
          x: pt.x,
          y: pt.y,
          drivers: [driver],
        });
      }
    });

    // Helper to get a stable unique key for each driver
    const getDriverKey = (d, idx) => d?._id || d?.id || d?.phone || d?.name || `driver-${idx}`;

    // 4. Extract unclustered drivers for guaranteed collision separation (spiderfy)
    const unclusteredDrivers = [];
    clusters.forEach((cluster) => {
      if (cluster.drivers.length === 1) {
        unclusteredDrivers.push(cluster.drivers[0]);
      }
    });

    // Group close unclustered drivers into collision groups (< 48px on screen)
    const collisionGroups = [];
    const assignedKeys = new Set();

    unclusteredDrivers.forEach((d1, i) => {
      const key1 = getDriverKey(d1, i);
      if (assignedKeys.has(key1)) return;
      const pt1 = map.project([d1.parsedLng, d1.parsedLat]);
      const group = [d1];
      assignedKeys.add(key1);

      unclusteredDrivers.forEach((d2, j) => {
        const key2 = getDriverKey(d2, j);
        if (key1 === key2 || assignedKeys.has(key2)) return;
        const pt2 = map.project([d2.parsedLng, d2.parsedLat]);
        if (Math.hypot(pt1.x - pt2.x, pt1.y - pt2.y) < 48) {
          group.push(d2);
          assignedKeys.add(key2);
        }
      });
      collisionGroups.push(group);
    });

    // Calculate clear radial offsets for each driver so NO TWO PINS EVER OVERLAP
    const spiderfyMap = new Map();
    collisionGroups.forEach((group) => {
      const count = group.length;
      if (count === 1) {
        spiderfyMap.set(getDriverKey(group[0], 0), { x: 0, y: 0, animIndex: 0 });
      } else if (count === 2) {
        // 68px center-to-center distance gives generous 32px clear gap
        spiderfyMap.set(getDriverKey(group[0], 0), { x: -34, y: 0, animIndex: 0 });
        spiderfyMap.set(getDriverKey(group[1], 1), { x: 34, y: 0, animIndex: 1 });
      } else if (count === 3) {
        // Equilateral triangle (radius 42px) -> 72.7px between pins
        spiderfyMap.set(getDriverKey(group[0], 0), { x: 0, y: -42, animIndex: 0 });
        spiderfyMap.set(getDriverKey(group[1], 1), { x: 36, y: 22, animIndex: 1 });
        spiderfyMap.set(getDriverKey(group[2], 2), { x: -36, y: 22, animIndex: 2 });
      } else {
        // 4+ drivers circular orbit with dynamic radius
        const radius = Math.max(48, count * 8);
        group.forEach((d, idx) => {
          const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
          spiderfyMap.set(getDriverKey(d, idx), {
            x: Math.round(Math.cos(angle) * radius),
            y: Math.round(Math.sin(angle) * radius),
            animIndex: idx,
          });
        });
      }
    });

    // 5. Render Clusters and Separated Driver Pins
    clusters.forEach((cluster) => {
      if (cluster.drivers.length > 1) {
        // === CLUSTER BUBBLE (Primary Color with Merge Animation & Expanding Wave) ===
        // IMPORTANT: Root element clusterEl NEVER gets transform/animation in CSS to preserve Mapbox translation!
        const clusterEl = document.createElement("div");
        clusterEl.style.width = "52px";
        clusterEl.style.height = "52px";
        clusterEl.style.cursor = "pointer";
        clusterEl.innerHTML = `
          <div class="cluster-inner-box cluster-anim-merge" style="position: relative; width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; pointer-events: auto;">
            <div class="cluster-radar-ring" style="position: absolute; inset: -4px; border-radius: 50%; background-color: rgba(0, 74, 112, 0.28); pointer-events: none;"></div>
            <div class="cluster-badge-body" style="position: relative; width: 44px; height: 44px; border-radius: 50%; background-color: #004a70; border: 3px solid #ffffff; box-shadow: 0 4px 16px rgba(0,74,112,0.5); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 800; font-size: 17px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;">
              ${cluster.drivers.length}
            </div>
          </div>
        `;

        const badgeBody = clusterEl.querySelector(".cluster-badge-body");
        const innerBox = clusterEl.querySelector(".cluster-inner-box");

        clusterEl.addEventListener("mouseenter", () => {
          if (badgeBody) badgeBody.style.transform = "scale(1.14)";
        });
        clusterEl.addEventListener("mouseleave", () => {
          if (badgeBody) badgeBody.style.transform = "scale(1)";
        });

        // Click to smoothly fit ALL drivers of this clicked cluster in the frame (NOT max zoom!)
        clusterEl.addEventListener("click", (e) => {
          e.stopPropagation();
          if (innerBox) innerBox.classList.add("exploding");

          const clusterBounds = new mapboxgl.LngLatBounds();
          let count = 0;

          cluster.drivers.forEach((d) => {
            if (typeof d.parsedLng === "number" && typeof d.parsedLat === "number") {
              clusterBounds.extend([d.parsedLng, d.parsedLat]);
              count++;
            }
          });

          if (count > 0) {
            const sw = clusterBounds.getSouthWest();
            const ne = clusterBounds.getNorthEast();
            const latDiff = Math.abs(ne.lat - sw.lat);
            const lngDiff = Math.abs(ne.lng - sw.lng);
            // If drivers in this cluster are all at the exact same location or within 100 meters
            const isVeryClose = latDiff < 0.001 && lngDiff < 0.001;

            if (isVeryClose) {
              // Moderate, comfortable zoom (15.0) so all spiderfied pins and area fit nicely (NOT max zoom!)
              map.flyTo({
                center: [cluster.lng, cluster.lat],
                zoom: 15.0,
                duration: 850,
                essential: true,
              });
            } else {
              // Drivers are distributed across an area: fit bounds so ALL drivers of this cluster are in frame!
              map.fitBounds(clusterBounds, {
                padding: { top: 90, bottom: 120, left: 80, right: 80 },
                maxZoom: 15.2, // Moderate zoom, guarantees all cluster drivers fit in the viewport
                duration: 850,
                essential: true,
              });
            }
          }
        });

        const clusterMarker = new mapboxgl.Marker({ element: clusterEl, anchor: "center" })
          .setLngLat([cluster.lng, cluster.lat])
          .addTo(map);

        allMarkersRef.current.push(clusterMarker);
      } else {
        // === INDIVIDUAL DRIVER PIN (Primary Color Teardrop with Burst Out Animation & Spiderfy Separation) ===
        const driver = cluster.drivers[0];
        const driverKey = getDriverKey(driver, 0);
        const offsetInfo = spiderfyMap.get(driverKey) || { x: 0, y: 0, animIndex: 0 };
        const { x: offX, y: offY, animIndex } = offsetInfo;

        const carEl = document.createElement("div");
        carEl.style.width = "40px";
        carEl.style.height = "50px";
        carEl.style.cursor = "pointer";

        const burstAnimClass = `driver-pin-burst-${Math.min(animIndex, 4)}`;

        carEl.innerHTML = `
          <div class="driver-pin-spiderfy" style="transform: translate(${offX}px, ${offY}px); transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); width: 40px; height: 50px; display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
            <div class="driver-pin-pop ${burstAnimClass}" style="width: 40px; height: 50px; display: flex; flex-direction: column; align-items: center;">
              <!-- Teardrop Pin body in Primary Color -->
              <div class="driver-pin-teardrop" style="width: 36px; height: 36px; border-radius: 50% 50% 50% 0; background-color: #004a70; transform: rotate(-45deg); border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,74,112,0.45); display: flex; align-items: center; justify-content: center; transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s;">
                <div style="transform: rotate(45deg); color: #ffffff; display: flex; align-items: center; justify-content: center;">
                  <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="17" width="17" xmlns="http://www.w3.org/2000/svg">
                    <path d="M499.99 176h-59.87l-16.64-41.6C416.38 116.63 399.78 106 381.76 106H130.24c-18.01 0-34.61 10.63-41.71 28.4L71.88 176H12.01C5.38 176 0 181.38 0 188.01v47.98C0 242.62 5.38 248 12.01 248h8.55l19.53 156.24C42.87 426.31 65.86 448 93.99 448h24.03c26.51 0 48-21.49 48-48v-16h180v16c0 26.51 21.49 48 48 48h24.03c28.13 0 51.12-21.69 53.9-43.76L491.44 248h8.55c6.63 0 12.01-5.38 12.01-12.01v-47.98c0-6.63-5.38-12.01-12.01-12.01zM116.62 146.4c2.37-5.92 7.9-9.4 13.62-9.4h251.52c5.72 0 11.25 3.48 13.62 9.4L407.26 176H104.74l11.88-29.6zM112 304c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32zm288 0c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        `;

        const teardropEl = carEl.querySelector(".driver-pin-teardrop");
        carEl.addEventListener("mouseenter", () => {
          if (teardropEl) {
            teardropEl.style.transform = "rotate(-45deg) scale(1.15)";
            teardropEl.style.boxShadow = "0 6px 18px rgba(0,74,112,0.6)";
          }
        });
        carEl.addEventListener("mouseleave", () => {
          if (teardropEl) {
            teardropEl.style.transform = "rotate(-45deg) scale(1)";
            teardropEl.style.boxShadow = "0 4px 14px rgba(0,74,112,0.45)";
          }
        });

        // === TOAST MODAL CARD (Clean Info Card in Primary Color, NO Qty / NO Status / NO Book Button) ===
        const toastPopupHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 200px; padding: 2px;">
           
            <div style="font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 3px;">
              Driver: ${driver.name || "Cabkn Driver"}
            </div>
            <div style="font-size: 11.5px; color: #64748b; line-height: 1.4;">
              ${driver.address || "Basseterre, St. Kitts • Available now"}
            </div>
          </div>
        `;

        // Offset popup accurately to the displaced pin tip
        const driverPopup = new mapboxgl.Popup({
          offset: [offX, offY - 24],
          closeButton: true,
          closeOnClick: true,
          className: "driver-toast-card-popup",
        }).setHTML(toastPopupHtml);

        const driverMarker = new mapboxgl.Marker({ element: carEl, anchor: "bottom" })
          .setLngLat([driver.parsedLng, driver.parsedLat])
          .setPopup(driverPopup)
          .addTo(map);

        allMarkersRef.current.push(driverMarker);
      }
    });
  };

  // Keep ref synchronized
  updateMapMarkersRef.current = updateMapMarkers;

  // Initial Geolocation check on mount
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          coordsRef.current = newCoords;
          hasGpsRef.current = true;
          setCoords(newCoords);
          setHasGps(true);

          // Fly map immediately to user's location as soon as GPS is locked
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [newCoords.lng, newCoords.lat],
              zoom: 13.5,
              duration: 850,
              essential: true,
            });
          }

          fetchNearbyDrivers(newCoords.lat, newCoords.lng);
        },
        (error) => {
          console.warn("Geolocation denied or timed out:", error?.message);
          fetchNearbyDrivers(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      fetchNearbyDrivers(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize Mapbox Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialCenter = [coordsRef.current.lng, coordsRef.current.lat];
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCenter,
      zoom: 12,
      attributionControl: false,
    });

    // Assign map instance immediately so subsequent callbacks can move camera
    mapRef.current = map;

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    map.on("load", () => {
      map.resize();
      updateMapMarkersRef.current?.();
      fitMapToDriversAndUserRef.current?.();
    });

    // In-flight animated cluster-to-pins threshold detection
    let lastIsClustered = map.getZoom() < MAX_CLUSTER_ZOOM;
    map.on("zoom", () => {
      const isClustered = map.getZoom() < MAX_CLUSTER_ZOOM;
      if (lastIsClustered !== isClustered) {
        lastIsClustered = isClustered;
        updateMapMarkersRef.current?.();
      }
    });

    // Re-cluster on zoom/pan end dynamically
    map.on("zoomend", () => {
      lastIsClustered = map.getZoom() < MAX_CLUSTER_ZOOM;
      updateMapMarkersRef.current?.();
    });

    map.on("moveend", () => {
      updateMapMarkersRef.current?.();
    });

    return () => {
      allMarkersRef.current.forEach((m) => m.remove());
      allMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Automatically update markers and fit bounds whenever coordinates or drivers update
  useEffect(() => {
    if (!mapRef.current) return;

    updateMapMarkers();
    fitMapToDriversAndUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords.lat, coords.lng, drivers, hasGps]);

  return (
    <section className="py-16 select-none bg-gradient-to-b from-white via-slate-50/60 to-brand-50/40 relative overflow-hidden">
      {/* Dynamic Keyframes and Animations for Clusters, Pins, and Popups */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes clusterMergePop {
              0% {
                transform: scale(0.3);
                opacity: 0;
              }
              65% {
                transform: scale(1.18);
                opacity: 1;
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }

            @keyframes clusterRadarPulse {
              0% {
                transform: scale(0.85);
                opacity: 0.75;
              }
              70% {
                transform: scale(1.65);
                opacity: 0.15;
              }
              100% {
                transform: scale(2.2);
                opacity: 0;
              }
            }

            @keyframes clusterExplode {
              0% {
                transform: scale(1);
                opacity: 1;
              }
              45% {
                transform: scale(1.35);
                opacity: 0.7;
              }
              100% {
                transform: scale(1.8);
                opacity: 0;
              }
            }

            @keyframes driverPinBurstOut {
              0% {
                opacity: 0;
                transform: scale(0.15) translateY(10px);
              }
              65% {
                opacity: 1;
                transform: scale(1.18) translateY(-2px);
              }
              100% {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }

            .cluster-anim-merge {
              animation: clusterMergePop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }

            .cluster-radar-ring {
              animation: clusterRadarPulse 2.2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
            }

            .cluster-inner-box.exploding {
              animation: clusterExplode 0.35s ease-out forwards;
              pointer-events: none;
            }

            .driver-pin-burst-0 {
              animation: driverPinBurstOut 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0ms forwards;
            }
            .driver-pin-burst-1 {
              animation: driverPinBurstOut 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 70ms forwards;
            }
            .driver-pin-burst-2 {
              animation: driverPinBurstOut 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 140ms forwards;
            }
            .driver-pin-burst-3 {
              animation: driverPinBurstOut 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 210ms forwards;
            }
            .driver-pin-burst-4 {
              animation: driverPinBurstOut 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 280ms forwards;
            }

            /* Custom Toast Card Popup Styling */
            .driver-toast-card-popup .mapboxgl-popup-content {
              border-radius: 18px !important;
              box-shadow: 0 14px 34px -4px rgba(0, 74, 112, 0.18), 0 4px 14px rgba(0, 0, 0, 0.08) !important;
              border: 1.5px solid rgba(0, 74, 112, 0.12) !important;
              padding: 14px 16px !important;
              background: #ffffff !important;
            }
            .driver-toast-card-popup .mapboxgl-popup-close-button {
              font-size: 16px !important;
              color: #94a3b8 !important;
              padding: 6px 10px !important;
              outline: none !important;
            }
            .driver-toast-card-popup .mapboxgl-popup-close-button:hover {
              color: #004a70 !important;
              background: transparent !important;
            }
            .driver-toast-card-popup .mapboxgl-popup-tip {
              border-top-color: #ffffff !important;
            }
          `,
        }}
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-family-semibold text-slate-900 tracking-tight m-0">
              Rides Near You
            </h2>
            <p className="text-slate-600 font-family-regular text-sm sm:text-base mt-2 max-w-2xl">
              {hasGps
                ? "See real-time available drivers on duty around your current location. Book in seconds and get moving."
                : "See real-time available drivers on duty around your location in Saint Kitts & Nevis. Book in seconds and get moving."}
            </p>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => {
                fetchNearbyDrivers(coords.lat, coords.lng);
                fitMapToDriversAndUser();
              }}
              disabled={loading}
              title="Refresh nearby drivers"
              className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <AuthSpinner
                  variant="dark"
                  style={{
                    display: "inline-block",
                    width: "16px",
                    height: "16px",
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderColor: "#cbd5e1",
                    borderTopColor: "#004a70",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <FiRefreshCw className="text-[#004a70]" size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Map Container Card */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-white">
          {/* Map canvas */}
          <div
            ref={mapContainerRef}
            className="w-full h-[400px] sm:h-[460px] md:h-[500px]"
          />

          {/* Prominent Central Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 z-20 bg-white/65 backdrop-blur-[2px] flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300">
              <div className="p-4 sm:p-5 bg-white rounded-2xl shadow-xl border border-slate-200/80 flex flex-col items-center gap-3">
                <AuthSpinner
                  variant="dark"
                  style={{
                    display: "inline-block",
                    width: "36px",
                    height: "36px",
                    borderWidth: "3.5px",
                    borderStyle: "solid",
                    borderColor: "#e2e8f0",
                    borderTopColor: "#004a70",
                    borderRadius: "50%",
                  }}
                />
                <span className="text-xs sm:text-sm font-family-semibold text-slate-800">
                  Scanning for nearby drivers...
                </span>
              </div>
            </div>
          )}

          {/* Top Floating Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 pointer-events-none">
            <div className="pointer-events-auto inline-flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 text-xs font-family-semibold text-slate-800 shadow-sm">
              {loading ? (
                <AuthSpinner
                  variant="dark"
                  style={{
                    display: "inline-block",
                    width: "13px",
                    height: "13px",
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderColor: "#cbd5e1",
                    borderTopColor: "#004a70",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
              <span>
                {loading
                  ? "Scanning area..."
                  : drivers.length > 0
                    ? `${drivers.length} Driver${drivers.length > 1 ? "s" : ""} Online Nearby`
                    : "Active Drivers Near You"}
              </span>
            </div>

            <div className="pointer-events-auto hidden sm:inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 text-xs font-family-medium text-slate-600 shadow-sm">
              <FiClock className="text-[#004a70]" />
              <span>Avg. Pickup: ~3-5 mins</span>
            </div>
          </div>

          {/* Bottom Floating Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
            <div className="pointer-events-auto max-w-3xl mx-auto bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-2xl bg-[#004a70]/10 border border-[#004a70]/20 flex items-center justify-center text-[#004a70] shrink-0">
                  <FaCar size={22} />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-family-semibold text-slate-900 m-0">
                    Ready to hit the road?
                  </h4>
                  <p className="text-xs text-slate-500 font-family-regular m-0 mt-0.5">
                    Choose your pickup, select vehicle tier, and track live.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <CustomButton
                  onClick={handleBookNow}
                  variant="primary"
                  size="md"
                  endContent={<FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />}
                  className="w-full sm:w-auto !bg-emerald-600 hover:!bg-emerald-700 !border-0 !shadow-md !font-family-semibold text-sm group"
                >
                  Book a Ride Now
                </CustomButton>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights beneath map */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#004a70]/10 flex items-center justify-center text-[#004a70]">
              <FiShield size={20} />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-family-semibold text-slate-900 m-0">
                100% Verified Drivers
              </h5>
              <p className="text-[11px] sm:text-xs text-slate-500 font-family-regular m-0 mt-0.5">
                Licensed, vetted & locally rated drivers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FiClock size={20} />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-family-semibold text-slate-900 m-0">
                Fast Pickup Times
              </h5>
              <p className="text-[11px] sm:text-xs text-slate-500 font-family-regular m-0 mt-0.5">
                Quick arrival across Basseterre & island-wide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <FiCheckCircle size={20} />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-family-semibold text-slate-900 m-0">
                Fixed & Transparent Fares
              </h5>
              <p className="text-[11px] sm:text-xs text-slate-500 font-family-regular m-0 mt-0.5">
                Upfront pricing in XCD & USD, no hidden fees
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RidesNearYou;
