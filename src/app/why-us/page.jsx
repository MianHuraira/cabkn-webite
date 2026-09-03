"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { CarBanner, Heroimg } from "@/components/assets/Images";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "next/navigation";
import {
  FiAward, FiUsers, FiMapPin, FiShield, FiArrowRight,
  FiStar, FiClock, FiHeart, FiTarget, FiTrendingUp,
  FiCheckCircle, FiLayers, FiThumbsUp, FiHeadphones, FiFlag
} from "react-icons/fi";

function Counter({ end, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function SectionReveal({ children, delay = 0, className = "" }) {
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
    <div
      ref={ref}
      className={`transition-all duration-700 transform ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function WhyUs() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  useEffect(() => { setMounted(true); }, []);

  const stats = [
    { icon: <FiUsers size={20} />, value: 10000, suffix: "+", label: "Happy Riders", color: "from-blue-500 to-blue-600 shadow-blue-500/10" },
    { icon: <FiMapPin size={20} />, value: 50, suffix: "+", label: "Locations Covered", color: "from-emerald-500 to-emerald-600 shadow-emerald-500/10" },
    { icon: <FiStar size={20} />, value: 49, suffix: "", label: "Average Rating", color: "from-amber-500 to-amber-600 shadow-amber-500/10", decimals: 1 },
    { icon: <FiShield size={20} />, value: 100, suffix: "%", label: "Safe Rides", color: "from-violet-500 to-violet-600 shadow-violet-500/10" },
  ];

  const usps = [
    {
      icon: <FiThumbsUp size={20} />, title: "Why We're Different",
      desc: "Fixed affordable fares, live GPS tracking and full island coverage you won't find anywhere else.",
      color: "text-emerald-600", bg: "bg-emerald-50",
    },
    {
      icon: <FiAward size={20} />, title: "Experience & Expertise",
      desc: "5+ years on the road, every driver certified, trained and rigorously vetted.",
      color: "text-brand-600", bg: "bg-brand-50",
    },
    {
      icon: <FiShield size={20} />, title: "Quality Guarantee",
      desc: "Every ride quality-checked and backed by our no-compromise safety promise.",
      color: "text-violet-600", bg: "bg-violet-50",
    },
    {
      icon: <FiHeadphones size={20} />, title: "Customer Support",
      desc: "24/7 live support with an average response time of under 5 minutes.",
      color: "text-amber-600", bg: "bg-amber-50",
    },
    {
      icon: <FiFlag size={20} />, title: "Awards & Recognition",
      desc: "Recognised as the most reliable island transport service by local tourism partners.",
      color: "text-rose-600", bg: "bg-rose-50",
    },
  ];

  const values = [
    {
      icon: <FiTarget size={24} />, title: "Reliability You Can Trust",
      desc: "Every ride is tracked, verified, and backed by our commitment to punctuality and safety.",
      color: "text-brand-600", bg: "bg-brand-50",
    },
    {
      icon: <FiTrendingUp size={24} />, title: "Affordable transparent Pricing",
      desc: "No hidden fees, no surge pricing surprises. What you see is what you pay.",
      color: "text-emerald-600", bg: "bg-emerald-50",
    },
    {
      icon: <FiLayers size={24} />, title: "Professional Drivers",
      desc: "Our drivers are thoroughly vetted, trained, and dedicated to giving you a first-class experience.",
      color: "text-violet-600", bg: "bg-violet-50",
    },
    {
      icon: <FiHeart size={24} />, title: "24/7 Customer Support",
      desc: "We are always here to help, day or night. Your comfort is our priority.",
      color: "text-rose-600", bg: "bg-rose-50",
    },
  ];

  return (
    <div className={`min-h-screen bg-slate-50/50 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      {/* ===== HERO ===== */}
      <section
        className={`relative min-h-screen select-none flex items-center overflow-hidden pt-20 md:pt-24 ${mounted ? "animate-fade-in" : "opacity-0"}`}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 pointer-events-none bg-cover bg-no-repeat bg-[85%_center] md:bg-center"
          style={{
            backgroundImage: `url(${Heroimg.src})`,
          }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col gap-3">
            <div
              className={`inline-flex items-center gap-2 text-brand-300 text-[11px] sm:text-xs uppercase tracking-[0.15em] font-family-semibold w-fit ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "100ms" }}
            >
              Why Choose Cabkn
            </div>

            <h1
              className={`text-white font-family-medium leading-[1.2] tracking-tight m-0 text-[clamp(2rem,5vw,3.5rem)] sm:text-[clamp(2.25rem,6vw,3rem)] ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "200ms" }}
            >
              Why Choose{" "}
              <span className="font-family-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
                Us
              </span>
              ?
            </h1>

            <div
              className={`flex gap-6 mt-4 flex-wrap ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "300ms" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#004a70] flex items-center justify-center">
                  <FiCheckCircle size={12} color="#fff" />
                </div>
                <span className="text-white/80 font-family-regular text-sm">
                  Verified & vetted drivers
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#004a70] flex items-center justify-center">
                  <FiCheckCircle size={12} color="#fff" />
                </div>
                <span className="text-white/80 font-family-regular text-sm">
                  Transparent upfront pricing
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#004a70] flex items-center justify-center">
                  <FiCheckCircle size={12} color="#fff" />
                </div>
                <span className="text-white/80 font-family-regular text-sm">
                  24/7 support & live tracking
                </span>
              </div>
            </div>

            <div
              className={`flex flex-wrap gap-4 mt-4 ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "400ms" }}
            >
              <CustomButton
                onClick={() => router.push('/auth/stepOne')}
                variant="primary"
                size="lg"
                endContent={
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                }
                className="group !bg-green-500 !border-0 !shadow-lg !shadow-black/20 font-family-semibold text-base"
              >
                Get Started
              </CustomButton>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NUMBERS & USP ===== */}
      <section className="relative max-w-7xl mx-auto py-14 md:py-20 px-4 sm:px-6 lg:px-8">
   
        <div className="relative">
          <SectionReveal>
            <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 !border !border-brand-100 text-brand-700 text-[11px] sm:text-xs font-family-semibold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                Why Cabkn
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-family-semibold text-slate-800 mt-4 tracking-tight leading-tight">
                Trusted Numbers,{" "}
                <span className="text-brand-600">Real Results</span>
              </h2>
              <p className="text-slate-500 text-sm sm:text-[15px] mt-3 font-family-regular leading-relaxed">
                From our safety record to our customer-first approach, here's why thousands of riders
                choose Cabkn over anything else on the islands.
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-3xl bg-white p-4 md:p-5 text-center !border !border-slate-100  hover:-translate-y-1.5 transition-all duration-500 ${mounted ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${200 + i * 100}ms` }}
              >
                <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.08] rounded-full blur-2xl group-hover:opacity-[0.16] transition-opacity duration-500`} />
                <div className={`relative inline-flex w-11 h-11 rounded-2xl bg-gradient-to-br ${stat.color} text-white items-center justify-center mb-2.5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <h3 className="text-2xl md:text-[28px] font-family-semibold text-slate-900 m-0 tracking-tight">
                  {stat.decimals ? (
                    <><Counter end={4} />.<Counter end={9} /></>
                  ) : (
                    <Counter end={stat.value} suffix={stat.suffix} />
                  )}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 font-family-semibold m-0 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-10 md:mt-12 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 !border !border-brand-100 text-brand-700 text-[11px] sm:text-xs font-family-semibold uppercase tracking-widest whitespace-nowrap">
              <FiStar size={12} className="text-amber-500" />
              What Makes Us Different
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {usps.map((usp, i) => (
              <SectionReveal key={i} delay={i * 80}>
                <div className="group h-full flex items-start gap-3.5 rounded-3xl bg-white p-4 !border !border-slate-100 shadow-[0_10px_36px_rgba(0,0,0,0.03)] hover:shadow-[0_24px_60px_rgba(0,74,112,0.12)] hover:-translate-y-2 hover:!border-brand-200 transition-all duration-500">
                  <div className={`w-10 h-10 shrink-0 rounded-2xl ${usp.bg} ${usp.color} flex items-center justify-center !border !border-slate-100/60 shadow-inner group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                    {usp.icon}
                  </div>
                  <div>
                    <h4 className="text-[15px] sm:text-[16px] font-family-semibold text-slate-800 leading-tight">{usp.title}</h4>
                    <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-family-regular mt-1 m-0">{usp.desc}</p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STORY ===== */}
      <SectionReveal>
        <section className="max-w-7xl mx-auto py-20 md:py-28 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div className="text-left">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 !border !border-brand-100 text-brand-700 text-[11px] sm:text-xs font-family-semibold uppercase tracking-widest mb-0">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                Our Story
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-family-semibold text-slate-800 mt-5 mb-6 leading-tight tracking-tight">
                Making Travel Between{" "}
                <span className="relative text-brand-600">
                  Islands
                  <span className="absolute -bottom-1 left-0 w-full h-[3px] rounded-full bg-gradient-to-r from-brand-600 to-sky-400" />
                </span>{" "}
                Effortless
              </h2>
              <p className="text-slate-550 text-sm sm:text-[15px] leading-relaxed font-family-regular max-w-xl m-0">
                Welcome to Saint Kitts was born from a simple idea: travel between Nevis and Saint Kitts should be as easy as booking a ride across town.
                We built a platform that connects riders with trusted drivers, providing real-time tracking, transparent pricing, and
                a seamless booking experience. Today, thousands of riders rely on Welcome to Saint Kitts for their daily commute, airport transfers,
                and island explorations.
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                {[
                  { label: "Years Experience", value: "5+" },
                  { label: "Daily Rides", value: "500+" },
                  { label: "Driver Partners", value: "200+" },
                ].map((item, i) => (
                  <div key={i} className="group bg-white !border !border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,74,112,0.12)] rounded-2xl px-6 py-5 min-w-[125px] text-center md:text-left hover:-translate-y-1 hover:!border-brand-100 transition-all duration-300">
                    <div className="text-2xl font-family-semibold text-brand-600 leading-none">{item.value}</div>
                    <div className="text-[10px] text-slate-400 font-family-semibold uppercase tracking-wider mt-2">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative max-w-[440px] w-full rounded-[1.75rem] overflow-hidden">
                <Image
                  src={CarBanner}
                  alt="Welcome to Saint Kitts service"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ===== VALUES ===== */}
      <section className="bg-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 !border-y !border-slate-100 relative overflow-hidden">
        {/* <div className="absolute top-0 right-0 w-72 h-72 bg-brand-600/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-400/5 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" /> */}

        <div className="max-w-7xl mx-auto relative z-10">
          <SectionReveal>
            <div className="text-center mb-12 md:mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 !border !border-brand-100 text-brand-700 text-[11px] sm:text-xs font-family-semibold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                Our Values
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-family-semibold text-slate-800 mt-5 tracking-tight">
                What Sets Us Apart
              </h2>
              <p className="text-slate-500 text-sm sm:text-[15px] mt-3 max-w-xl mx-auto font-family-regular">
                Four pillars that guide everything we do — from the way we treat our riders to how we build our platform.
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {values.map((v, i) => (
              <SectionReveal key={i} delay={i * 100}>
                <div className="group relative bg-white rounded-3xl p-6 sm:p-7 !border !border-slate-100 shadow-[0_10px_36px_rgba(0,0,0,0.03)] hover:shadow-[0_24px_60px_rgba(0,74,112,0.12)] hover:-translate-y-2 hover:!border-brand-200 transition-all duration-500 h-full flex flex-col justify-between relative overflow-hidden">
                  <div className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br ${v.color.replace('text-', 'from-').split(' ')[0]}/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none`} />

                  <div className="flex-grow flex flex-col justify-start">
                    <div className={`w-12 h-12 rounded-2xl ${v.bg} ${v.color} flex items-center justify-center mb-3 !border !border-slate-100/55 shadow-inner group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                      {v.icon}
                    </div>
                    <h3 className="text-[15px] sm:text-[17px] font-family-semibold text-slate-800 mb-2">{v.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-family-regular m-0">{v.desc}</p>
                  </div>

                  <div className="mt-auto pt-4 !border-t !border-slate-100 flex items-center justify-between text-xs text-brand-650 font-family-semibold group-hover:text-brand-700 transition-colors">
                    <span>Learn details</span>
                    <span className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-brand-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-all duration-300">
                      <FiArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <SectionReveal>
        <section className="max-w-7xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <span className="inline-flex items-center gap-2 text-brand-600 text-xs md:text-sm font-family-semibold tracking-widest uppercase !mb-3">
                Features
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-family-semibold text-slate-800 !mt-2 !mb-6 leading-tight tracking-tight">
                Designed to Protect & Support
              </h2>
              <p className="text-slate-550 text-sm sm:text-[15px] leading-relaxed font-family-regular !mb-8">
                Every feature we build is focused on one thing — giving you the best possible ride experience from start to finish.
              </p>

              <div className="space-y-4">
                {[
                  { icon: <FiClock size={18} />, title: "Real-Time Tracking", desc: "Know exactly where your ride is at all times with live GPS tracking." },
                  { icon: <FiTrendingUp size={18} />, title: "Transparent Pricing", desc: "Get upfront fare estimates with no hidden fees or surge surprises." },
                  { icon: <FiShield size={18} />, title: "Safety First Operations", desc: "All drivers are background-checked and every ride is monitored 24/7." },
                ].map((feature, i) => (
                  <SectionReveal key={i} delay={i * 80}>
                    <div className="group flex items-start gap-4 bg-white !border !border-slate-150/60 p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_14px_44px_rgba(0,74,112,0.1)] hover:-translate-y-0.5 hover:!border-brand-150 transition-all duration-300 max-w-xl">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 !border !border-brand-100 group-hover:bg-brand-600 group-hover:text-white group-hover:scale-105 transition-all duration-300">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-family-semibold text-slate-900 m-0 leading-tight">{feature.title}</h4>
                        <p className="text-xs text-slate-500 m-0 mt-1 leading-relaxed font-family-regular">{feature.desc}</p>
                      </div>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="relative bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 !border !border-slate-855 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl overflow-hidden flex flex-col justify-between min-h-[440px]">
                <div className="absolute inset-0 opacity-[0.04]" style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                  backgroundSize: "24px 24px"
                }} />
                <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -top-16 -left-16 w-44 h-44 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 !border !border-white/20 text-brand-300 flex items-center justify-center mb-5 backdrop-blur-md shadow-inner">
                    <FiAward size={22} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-family-semibold mb-3">Our Commitment</h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-family-regular mb-8">
                    We are dedicated to providing the safest, most reliable transportation service in Saint Kitts and Nevis. Every ride is an opportunity to earn your trust.
                  </p>
                </div>

                <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 !border-t !border-white/10">
                  {[
                    { value: "99%", label: "Satisfaction" },
                    { value: "<5m", label: "Avg Pickup" },
                    { value: "24/7", label: "Support" },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/5 !border !border-white/10 rounded-2xl p-3.5 text-center backdrop-blur-sm hover:bg-white/10 transition-colors">
                      <div className="text-base font-family-semibold text-white leading-none">{item.value}</div>
                      <div className="text-[9px] text-slate-300 font-family-semibold uppercase tracking-wider mt-1.5 leading-none">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ===== CTA ===== */}
      <SectionReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-28 pt-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 rounded-[2.5rem] py-16 md:py-20 px-6 sm:px-10 text-center shadow-2xl">
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "24px 24px"
            }} />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-brand-500/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-16 w-72 h-72 bg-sky-400/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 !border !border-white/15 text-brand-200 text-[11px] sm:text-xs font-family-semibold uppercase tracking-widest backdrop-blur-md mb-8">
              
                Join Us Today
              </span>
              <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-family-semibold mb-3 leading-tight tracking-tight">
                Ready to Experience the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
                  Welcome to Saint Kitts Difference
                </span>
                ?
              </h2>
              <p className="text-slate-400 text-sm sm:text-[15px] mb-10 leading-relaxed max-w-xl mx-auto font-family-regular">
                Join thousands of satisfied riders and enjoy the most reliable transportation service between Nevis and Saint Kitts.
              </p>

              <div className="flex flex-wrap justify-center items-center gap-4 mt-3">
                <button
                  onClick={() => router.push('/auth/stepOne')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 hover:shadow-xl shadow-black/10 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 font-family-semibold text-sm group !border-none"
                >
                  <span>Create Your Account</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300 text-slate-800" />
                </button>
                <button
                  onClick={() => router.push('/ride')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full !border !border-white/25 text-slate-200 hover:text-white hover:!border-white/50 hover:bg-white/5 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 font-family-semibold text-sm"
                >
                  Book a Ride
                </button>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>
    </div>
  );
}
