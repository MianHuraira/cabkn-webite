"use client";

import React, { useEffect, useState, useRef } from "react";
import { Spinner } from "react-bootstrap";
import { useApi } from "../ApiFunction/ApiFunction";
import { FaCheckCircle } from "react-icons/fa";
import {
  FaPlay,
  FaPause,
  FaVolumeHigh,
  FaVolumeXmark,
  FaExpand,
  FaCompress,
} from "react-icons/fa6";
import Image from "next/image";
import { logoBlue, whiteLogo } from "../assets/Images";

function IntroVideo() {
  const { header1, getData } = useApi();
  const [FooterData, setFooterData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Custom Video Player States
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [durationTime, setDurationTime] = useState("0:00");
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasStarted, setHasStarted] = useState(true);

  const getProfile = async () => {
    try {
      setHasError(false);
      const response = await getData("users/footer", header1);
      setFooterData(response?.footer);
    } catch (error) {
      console.error("Failed to load footer data:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  // Autoplay video on load (default muted: false)
  useEffect(() => {
    if (videoRef.current && FooterData?.videourl) {
      videoRef.current.muted = false;
      setIsMuted(false);
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setHasStarted(true);
          })
          .catch((err) => {
            console.log("Unmuted autoplay restricted by browser policy:", err);
            setIsPlaying(false);
          });
      }
    }
  }, [FooterData?.videourl]);

  // Format seconds to mm:ss
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds === null) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      setHasStarted(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Toggle Mute
  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  // Seek video
  const handleSeek = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const seekTime = clickPosition * videoRef.current.duration;
    videoRef.current.currentTime = seekTime;
    setProgress(clickPosition * 100);
  };

  // Toggle Fullscreen
  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting fullscreen:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Auto-hide controls when playing
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    if (!isNaN(total) && total > 0) {
      setProgress((current / total) * 100);
    }
    setCurrentTime(formatTime(current));
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDurationTime(formatTime(videoRef.current.duration));
    setLoaded(true);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setShowControls(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const features = [
    "Premium Ride Service",
    "Certified Drivers",
    "Competitive Pricing",
    "24/7 Support",
    "Safe & Reliable",
    "Easy Booking",
  ];

  return (
    <section className="py-20 sm:py-24 select-none bg-slate-100/70">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 1400 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Custom Video Player */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              if (isPlaying) setShowControls(false);
            }}
            className={`relative rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] bg-slate-900 aspect-video group cursor-pointer ${loaded ? "animate-fade-in" : "opacity-0"
              }`}
            onClick={togglePlay}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full w-full bg-slate-800">
                <Spinner animation="border" variant="light" />
              </div>
            ) : hasError ? (
              <div className="flex flex-col items-center justify-center h-full w-full bg-slate-800 text-center p-6">
                <p className="text-slate-400 font-family-regular text-base">
                  Unable to load video
                </p>
              </div>
            ) : (
              FooterData?.videourl && (
                <>
                  {/* HTML5 Video with Autoplay & Enhanced AI Thumbnail Poster */}
                  <video
                    ref={videoRef}
                    poster="/video-thumbnail.jpg"
                    autoPlay
                    loop
                    playsInline
                    preload="auto"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleVideoEnded}
                    className="w-full h-full object-cover"
                  >
                    <source src={FooterData?.videourl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Thumbnail Poster & Branding Overlay (shown whenever paused) */}
                  {!isPlaying && (
                    <div className="absolute inset-0 z-10 select-none">
                      {/* Background AI Thumbnail Image */}
                      <img
                        src="/video-thumbnail.jpg"
                        alt="Welcome to Saint Kitts Video"
                        className="w-full h-full object-cover"
                      />

                      {/* Subtle Dark Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/50" />

                      {/* Top Brand Logo & Title Badge */}
                      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-2xl !border border-white/10 shadow-lg">
                        <Image
                          src={logoBlue}
                          alt="Welcome to Saint Kitts"
                          height={30}
                          width={65}
                          className="h-6 sm:h-7 w-auto object-contain"
                        />
                        <div className="h-5 w-px bg-white/20" />
                        <span className="text-white text-xs sm:text-sm font-family-semibold tracking-wide">
                          Welcome to Saint Kitts
                        </span>
                      </div>

                      {/* Center Glowing Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative flex items-center justify-center">
                          {/* Outer Glow Pulse */}
                          <div className="absolute w-24 h-24 rounded-full bg-white/20 animate-ping" />
                          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-white/95 backdrop-blur-md shadow-[0_10px_35px_rgba(0,0,0,0.35)] flex items-center justify-center text-[#004A70] group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                            <FaPlay className="text-xl sm:text-2xl ml-1" />
                          </div>
                        </div>
                      </div>


                    </div>
                  )}

                  {/* Custom Auto-Hiding Controls Bar (ONLY visible when playing) */}
                  {isPlaying && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 sm:p-5 pt-12 flex flex-col gap-2 transition-all duration-300 cursor-default ${showControls
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-3 pointer-events-none"
                        }`}
                    >
                      {/* Interactive Progress Bar */}
                      <div
                        onClick={handleSeek}
                        className="w-full h-1.5 hover:h-2.5 bg-white/30 rounded-full cursor-pointer transition-all relative overflow-hidden group/bar"
                      >
                        <div
                          className="h-full bg-gradient-to-r from-brand-400 to-sky-400 rounded-full transition-all duration-100"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Controls Row */}
                      <div className="flex items-center justify-between gap-3 text-white pt-1">
                        <div className="flex items-center gap-3">
                          {/* Play/Pause Button */}
                          <button
                            type="button"
                            onClick={togglePlay}
                            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-105 border-0 cursor-pointer"
                          >
                            <FaPause size={14} />
                          </button>

                          {/* Mute/Unmute */}
                          <button
                            type="button"
                            onClick={toggleMute}
                            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-105 border-0 cursor-pointer"
                          >
                            {isMuted ? (
                              <FaVolumeXmark size={15} />
                            ) : (
                              <FaVolumeHigh size={15} />
                            )}
                          </button>

                          {/* Time Indicator */}
                          <span className="text-xs font-family-medium text-white/80 select-none">
                            {currentTime} / {durationTime}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Fullscreen Button */}
                          <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-105 border-0 cursor-pointer"
                          >
                            {isFullscreen ? (
                              <FaCompress size={14} />
                            ) : (
                              <FaExpand size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )
            )}
          </div>

          {/* Right: Content */}
          <div className="flex flex-col gap-6 sm:gap-8">
            <span className="inline-block px-4 py-1.5 bg-white text-brand-700 rounded-full text-xs font-family-bold w-fit shadow-sm border border-slate-200/60 uppercase tracking-wider">
              Watch Our Story
            </span>
            <h2 className="text-3xl md:text-4xl font-family-bold text-slate-900 leading-tight m-0">
              See How We're Transforming Travel
            </h2>
            <p className="text-slate-600 text-base md:text-lg font-family-regular leading-relaxed m-0">
              Discover what makes Welcome to Saint Kitts the preferred choice for riders across Saint Kitts and Nevis.
            </p>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 pt-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <FaCheckCircle className="text-[#004A70] w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-family-medium text-slate-700">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default IntroVideo;
