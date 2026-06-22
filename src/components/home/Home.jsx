"use client";
import React, { useEffect, useState, useRef } from "react";

import Tingstodo from "./Tingstodo";
import IntroVideo from "./IntroVideo";
import DownloadApp from "./DownloadApp";
import { CarBanner, mainBanner } from "../assets/Images";
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

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Book Your Ride",
      description:
        "Enter your destination and choose from our available ride options.",
    },
    {
      number: "02",
      title: "Get Matched",
      description: "We'll connect you with a nearby driver in minutes.",
    },
    {
      number: "03",
      title: "Track Your Ride",
      description: "Follow your driver's arrival in real-time on the map.",
    },
    {
      number: "04",
      title: "Enjoy the Journey",
      description: "Sit back, relax, and arrive safely at your destination.",
    },
  ];
};

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "Basseterre",
      rating: 5,
      text: "Excellent service! The driver was on time and the ride was very comfortable. Highly recommend!",
    },
    {
      name: "Michael Chen",
      location: "Charlestown",
      rating: 5,
      text: "Best ride service in Saint Kitts and Nevis. Always reliable and professional.",
    },
    {
      name: "Emily Williams",
      location: "Frigate Bay",
      rating: 5,
      text: "So convenient! The app is easy to use and the drivers are always friendly.",
    },
  ];
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
        className={`relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 pt-16 pb-20 md:pt-20 md:pb-28 ${mounted ? "animate-fade-in" : "opacity-0"}`}
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-brand-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-300/5 rounded-full blur-3xl"></div>
        </div>

        <div
          className="absolute inset-0 opacity-3 pointer-events-none bg-cover bg-center"
          style={{ backgroundImage: `url(${mainBanner.src})` }}
        />

        <div
          className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          style={{ maxWidth: 1200 }}
        >
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className={`inline-flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-full px-3 py-2.5 text-white text-[11px] sm:text-xs uppercase tracking-[0.15em] font-family-semibold w-fit backdrop-blur-md transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.15)] cursor-default ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "100ms" }}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              Premium Ride Service
            </div>

            <h1 className={`text-white font-family-bold leading-[1.1] tracking-tight m-0 text-[clamp(2.25rem,6vw,3.75rem)] sm:text-[clamp(2.5rem,5vw,4rem)] ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "200ms" }}>
              Experience seamless rides with{" "}
              <span className="!text-brand-300 font-family-extrabold">
                reliable
              </span>{" "}
              and affordable travel
            </h1>

            <p className={`text-white/80 leading-relaxed m-0 max-w-[540px] text-[clamp(1rem,1.3vw,1.15rem)] sm:text-[clamp(1rem,1.3vw,1.15rem)] font-family-regular ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
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
                className="group !border !border-white/20 !shadow-lg !shadow-black/20 font-family-medium"
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
        <WhyChooseUs />
      </SectionReveal>

      <SectionReveal>
        <div id="whyUs">
          <Tingstodo />
        </div>
      </SectionReveal>

      <SectionReveal>
        <HowItWorks />
      </SectionReveal>

      <SectionReveal>
        <div id="introVideo">
          <IntroVideo />
        </div>
      </SectionReveal>

      <SectionReveal>
        <Testimonials />
      </SectionReveal>

      <SectionReveal>
        <DownloadApp />
      </SectionReveal>
    </>
  );
};

export default HomeComponent;
