"use client";
import React, { useEffect, useState, useRef } from "react";

import Tingstodo from "./Tingstodo";
import IntroVideo from "./IntroVideo";
import DownloadApp from "./DownloadApp";
import { CarBanner, mainBanner } from "../assets/Images";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { FiArrowRight } from "react-icons/fi";
import CustomButton from "../CustomButton";

function SectionReveal({ children }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${inView ? "visible" : ""}`}>
      {children}
    </div>
  );
}

const HomeComponent = () => {
  const router = useRouter();
  const userData = useSelector((state) => state.auth.user?.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const Routing = () => {
    router.push(userData ? "/ride" : "/auth/login");
  };

  return (
    <>
      <section className={`relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 pt-16 pb-20 md:pt-20 md:pb-28 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-brand-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-300/5 rounded-full blur-3xl"></div>
        </div>
        
        <div
          className="absolute inset-0 opacity-3 pointer-events-none bg-cover bg-center"
          style={{ backgroundImage: `url(${mainBanner.src})` }}
        />

        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center" style={{ maxWidth: 1200 }}>
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className={`inline-flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-full px-3 py-2.5 text-white text-[11px] sm:text-xs uppercase tracking-[0.15em] font-['Inter-SemiBold'] w-fit backdrop-blur-md transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.15)] cursor-default ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "100ms" }}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              Premium Ride Service
            </div>

            <h1 className={`text-white font-['Inter-Bold'] leading-[1.1] tracking-tight m-0 text-[clamp(2.25rem,6vw,3.75rem)] sm:text-[clamp(2.5rem,5vw,4rem)] ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "200ms" }}>
              Experience seamless rides with{" "}
              <span className="!text-brand-300">
                reliable
              </span>{" "}
              and affordable travel
            </h1>

            <p className={`text-white/80 leading-relaxed m-0 max-w-[540px] text-[clamp(1rem,1.3vw,1.15rem)] sm:text-[clamp(1rem,1.3vw,1.15rem)] font-['Inter-Regular'] ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "300ms" }}>
              Discover a smarter way to travel with our premium ride services. Book effortlessly, track your rides in real-time, and enjoy a hassle-free journey across Saint Kitts and Nevis. Your comfort, safety, and convenience are our top priorities.
            </p>

            <div className={`flex flex-wrap gap-4 mt-3 ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "400ms" }}>
              <CustomButton
                onClick={Routing}
                variant="primary"
                size="lg"
                endContent={<FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />}
                className="group !border !border-white/20 !shadow-lg !shadow-black/20"
              >
                Book a Ride
              </CustomButton>
            </div>
          </div>

          <div className={`relative flex items-center justify-center ${mounted ? "animate-slide-from-right" : "opacity-0 translate-x-16"}`}
            style={{ animationDelay: "200ms" }}>
            <div className="relative w-full max-w-[620px]">
              <Image
                src={CarBanner}
                alt="Cabkn premium car service"
                className="w-full h-auto object-contain relative z-10"
                style={{
                  filter: "drop-shadow(0 25px 70px rgba(0,0,0,0.35))",
                  animation: "float-car 6s ease-in-out infinite",
                }}
                priority
              />
              <div
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[85%] h-[45%] z-0 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(0,74,112,0.18) 0%, transparent 70%)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <SectionReveal>
        <div id="whyUs">
          <Tingstodo />
        </div>
      </SectionReveal>

      <SectionReveal>
        <div id="introVideo">
          <IntroVideo />
        </div>
      </SectionReveal>

      <SectionReveal>
        <DownloadApp />
      </SectionReveal>
    </>
  );
};

export default HomeComponent;
