"use client";
import React, { useEffect, useState, useRef } from "react";

import Tingstodo from "./Tingstodo";
import IntroVideo from "./IntroVideo";
import DownloadApp from "./DownloadApp";
import { CarBanner, Heroimg } from "../assets/Images";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  FiArrowRight,
  FiShield,
  FiClock,
  FiStar,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import CustomButton from "../CustomButton";

function SectionReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const WhyChooseUs = () => {
  const features = [
    {
      icon: <FiCheckCircle className="w-6 h-6" />,
      title: "Easy & Fast Booking",
      description:
        "Car service is essential for maintaining performance and longevity of vehicle. Book your ride in just a few taps.",
    },
    {
      icon: <FiMapPin className="w-6 h-6" />,
      title: "Many Pickup Locations",
      description:
        "We have extensive coverage across Saint Kitts and Nevis, so you're never far from a ride.",
    },
    {
      icon: <FaStar className="w-6 h-6" />,
      title: "Customer Satisfaction",
      description:
        "Your happiness is our priority. We go the extra mile to ensure you have a great experience.",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-brand-50/50">
      <div
        className="w-full mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 1400 }}
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-family-bold text-slate-900 mb-4">
            WE ARE INNOVATIVE AND PASSIONATE
            <br />
            ABOUT THE WORK WE DO.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="relative group">
              <div className="bg-slate-900 rounded-3xl p-8 pr-12 pb-10 relative overflow-hidden transition-all duration-500 hover:-translate-y-3">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-bl-[60px] z-10">
                  <div className="absolute bottom-0 left-0 w-full h-full bg-slate-900 rounded-br-[40px]"></div>
                </div>
                <div className="absolute top-4 right-4 w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center text-white z-20 shadow-lg">
                  {feature.icon}
                </div>
                <div className="pt-8">
                  <h3 className="text-2xl font-family-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 font-family-regular leading-relaxed mb-8">
                    {feature.description}
                  </p>
                  <button className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-family-bold px-6 py-3 rounded-xl transition-all duration-300">
                    Book Now
                    <FiArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HomeComponent = () => {
  const router = useRouter();
  const userData = useSelector((state) => state.auth.user?.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const Routing = () => {
    router.push(userData ? "/ride" : "/auth/login");
  };

  return (
    <>
      <section
        className={`relative min-h-screen flex items-center overflow-hidden pt-20 pb-20 md:pt-24 md:pb-28 ${mounted ? "animate-fade-in" : "opacity-0"}`}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 pointer-events-none bg-cover bg-center"
          style={{ backgroundImage: `url(${Heroimg.src})` }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40"></div>

        <div
          className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: 1200 }}
        >
          <div className="flex flex-col gap-3">
            <div className={`inline-flex items-center gap-2 text-brand-300 text-[11px] sm:text-xs uppercase tracking-[0.15em] font-family-semibold w-fit ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "100ms" }}>
              Find Your Perfect Ride
            </div>

            <h1 className={`text-white font-family-medium leading-[1.2] tracking-tight m-0 text-[clamp(2rem,5vw,3.5rem)] sm:text-[clamp(2.25rem,6vw,3rem)] ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "200ms" }}>
              Looking for a ride?
              <br />
              You're in the perfect spot.
            </h1>

            <div className={`flex gap-6 mt-4 flex-wrap ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "300ms" }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <FiCheckCircle size={12} color="#fff" />
                </div>
                <span className="text-white/80 font-family-regular text-sm">High quality at a low cost</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <FiCheckCircle size={12} color="#fff" />
                </div>
                <span className="text-white/80 font-family-regular text-sm">Premium services</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <FiCheckCircle size={12} color="#fff" />
                </div>
                <span className="text-white/80 font-family-regular text-sm">24/7 roadside support</span>
              </div>
            </div>

            <div className={`flex flex-wrap gap-4 mt-4 ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "400ms" }}>
              <CustomButton
                onClick={Routing}
                variant="primary"
                size="lg"
                endContent={<FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />}
                className="group !bg-green-500 !border-0 !shadow-lg !shadow-black/20 font-family-semibold text-base"
              >
                Book a Ride
              </CustomButton>
            </div>
          </div>


        </div>
      </section>

      <SectionReveal>
        <WhyChooseUs />
      </SectionReveal>

      <SectionReveal>
        <div id="why-us">
          <Tingstodo />
        </div>
      </SectionReveal>

      <SectionReveal>
        <IntroVideo />
      </SectionReveal>

      <SectionReveal>
        <DownloadApp />
      </SectionReveal>
    </>
  );
};

export default HomeComponent;
