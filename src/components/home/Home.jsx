"use client";
import React from "react";

import Tingstodo from "./Tingstodo";
import IntroVideo from "./IntroVideo";
import DownloadApp from "./DownloadApp";
import { CarBanner, mainBanner } from "../assets/Images";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { FiArrowRight, FiShield, FiClock, FiStar } from "react-icons/fi";

const HomeComponent = () => {
  const router = useRouter();
  const userData = useSelector((state) => state.auth.user?.user);

  const Routing = () => {
    router.push(userData ? "/ride" : "/auth/login");
  };

  return (
    <>
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          background: "linear-gradient(179.02deg, rgb(0, 74, 112) -69.5%, rgb(177, 176, 176) 99.16%)",
        }} >
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url(${mainBanner.src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",

          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
        // style={{
        //   background: `
        //     radial-gradient(ellipse at 20% 50%, rgba(0, 74, 112, 0.3) 0%, transparent 60%),
        //     radial-gradient(ellipse at 80% 20%, rgba(0, 74, 112, 0.08) 0%, transparent 50%),
        //     radial-gradient(ellipse at 50% 80%, rgba(0, 100, 148, 0.15) 0%, transparent 50%)
        //   `,
        // }}
        />

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center pt-28 pb-16 lg:pt-36 lg:pb-20">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-2 text-brand-600 text-[11px] sm:text-xs uppercase tracking-[0.08em] font-medium w-fit backdrop-blur-sm">
              <span
                className="w-1.5 h-1.5 bg-brand-600 rounded-full"
                style={{ animation: "pulse-dot 2s ease-in-out infinite" }}
              />
              Premium Ride Service
            </div>

            <h1 className="text-white font-bold leading-[1.15] tracking-tight m-0 text-[clamp(1.8rem,5vw,3.5rem)] sm:text-[clamp(2rem,4vw,3.5rem)]">
              Experience seamless rides with{" "}
              <span className="bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">
                reliable
              </span>{" "}
              and affordable travel options
            </h1>

            <p className="text-white/65 leading-relaxed m-0 max-w-[520px] text-[clamp(0.85rem,1.2vw,1.1rem)] sm:text-[clamp(0.9rem,1.2vw,1.1rem)]">
              Discover a smarter way to travel with our reliable ride services.
              Book effortlessly, track your rides in real-time, and enjoy a
              hassle-free journey. Your comfort and convenience are our priority.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={Routing}
                className="inline-flex items-center gap-2.5 bg-brand-600 text-white font-semibold text-[0.9rem] sm:text-[0.95rem] px-6 sm:px-8 py-3.5 sm:py-4 rounded-full border-none cursor-pointer shadow-[0_8px_30px_rgba(0,74,112,0.3)] hover:shadow-[0_12px_40px_rgba(0,74,112,0.4)] hover:-translate-y-1 transition-all duration-300"
              >
                Book a Ride
                <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-[520px]">
              <Image
                src={CarBanner}
                alt="Cabkn premium car service"
                className="w-full h-auto object-contain relative z-10"
                style={{
                  filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.3))",
                  animation: "float-car 6s ease-in-out infinite",
                }}
                priority
              />
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] z-0 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(0,74,112,0.12) 0%, transparent 70%)",
                }}
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-[3] leading-none pointer-events-none">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto block">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section >

      <div id="whyUs">
        <Tingstodo />
      </div>

      <div id="introVideo">
        <IntroVideo />
      </div>

      <DownloadApp />
    </>
  );
};

export default HomeComponent;
