"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { CarBanner, mainBanner } from "@/components/assets/Images";
import { useRouter } from "next/navigation";
import {
  FiAward, FiUsers, FiMapPin, FiShield, FiArrowRight,
  FiStar, FiClock, FiHeart, FiTarget, FiTrendingUp,
  FiCheckCircle, FiLayers
} from "react-icons/fi";
import CustomButton from "../../components/CustomButton";

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
    { icon: <FiUsers size={22} />, value: 10000, suffix: "+", label: "Happy Riders", color: "from-blue-500 to-blue-600" },
    { icon: <FiMapPin size={22} />, value: 50, suffix: "+", label: "Locations Covered", color: "from-emerald-500 to-emerald-600" },
    { icon: <FiStar size={22} />, value: 49, suffix: "", label: "Average Rating", color: "from-amber-500 to-amber-600", decimals: 1 },
    { icon: <FiShield size={22} />, value: 100, suffix: "%", label: "Safe Rides", color: "from-violet-500 to-violet-600" },
  ];

  const values = [
    {
      icon: <FiTarget size={28} />, title: "Reliability You Can Trust",
      desc: "Every ride is tracked, verified, and backed by our commitment to punctuality and safety.",
      color: "text-brand-600", bg: "bg-brand-50",
    },
    {
      icon: <FiTrendingUp size={28} />, title: "Affordable Transparent Pricing",
      desc: "No hidden fees, no surge pricing surprises. What you see is what you pay.",
      color: "text-emerald-600", bg: "bg-emerald-50",
    },
    {
      icon: <FiLayers size={28} />, title: "Professional Drivers",
      desc: "Our drivers are thoroughly vetted, trained, and dedicated to giving you a first-class experience.",
      color: "text-violet-600", bg: "bg-violet-50",
    },
    {
      icon: <FiHeart size={28} />, title: "24/7 Customer Support",
      desc: "We are always here to help, day or night. Your comfort is our priority.",
      color: "text-rose-600", bg: "bg-rose-50",
    },
  ];

  return (
    <div className={`min-h-screen bg-white ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 pt-28 pb-28 md:pt-36 md:pb-32">
        <div className="absolute inset-0 opacity-[0.07] bg-cover bg-center" style={{ backgroundImage: `url(${mainBanner.src})` }} />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-brand-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-20 w-96 h-96 bg-brand-300/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent" />

        <div className={`relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
          <span className={`inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-xs sm:text-sm font-family-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6 ${mounted ? "animate-fade-in-down" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
            <FiAward size={14} />
            About Cabkn
          </span>
          <h1 className={`text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-family-bold mt-4 mb-6 leading-[1.1] tracking-tight ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "300ms" }}>
            Why Choose{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-100">
              Cabkn
            </span>
            ?
          </h1>
          <p className={`text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-family-regular ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "400ms" }}>
            We are on a mission to transform the way people travel between Nevis and Saint Kitts — making it seamless, safe, and stress-free.
          </p>
          <div className={`mt-8 flex flex-wrap justify-center gap-4 ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "500ms" }}>
            <CustomButton
              onClick={() => router.push('/auth/stepOne')}
              variant="primary"
              size="lg"
              className="!shadow-lg !shadow-brand-600/30 font-family-semibold"
              endContent={<FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />}
            >
              Get Started
            </CustomButton>
            <button
              onClick={() => router.push('/ride')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 font-family-medium text-sm"
            >
              Book a Ride
            </button>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="relative z-20 px-4 sm:px-6 lg:px-8 -mt-14">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`group relative bg-white rounded-2xl p-6 md:p-7 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 overflow-hidden ${mounted ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${200 + i * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-300`} />
              <div className={`relative inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} text-white items-center justify-center mx-auto mb-4 shadow-lg`}>
                {stat.icon}
              </div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-family-bold text-slate-900 m-0 tracking-tight">
                {stat.decimals ? (
                  <><Counter end={4} />.<Counter end={9} /></>
                ) : (
                  <Counter end={stat.value} suffix={stat.suffix} />
                )}
              </h3>
              <p className="text-xs md:text-sm text-slate-500 mt-1.5 font-family-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== STORY ===== */}
      <SectionReveal>
        <section className="max-w-7xl mx-auto py-20 md:py-28 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="text-start">
              <span className="inline-flex items-center gap-2 text-brand-600 text-xs md:text-sm font-family-semibold tracking-widest uppercase mb-4">
                <span className="w-8 h-px bg-brand-600" />
                Our Story
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-family-bold text-slate-900 mt-3 mb-6 leading-tight tracking-tight">
                Making Travel Between{" "}
                <span className="text-brand-600">Islands</span> Effortless
              </h2>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed font-family-regular max-w-xl">
                Cabkn was born from a simple idea: travel between Nevis and Saint Kitts should be as easy as booking a ride across town.
                We built a platform that connects riders with trusted drivers, providing real-time tracking, transparent pricing, and
                a seamless booking experience. Today, thousands of riders rely on Cabkn for their daily commute, airport transfers,
                and island explorations.
              </p>
              <div className="flex flex-wrap gap-6 mt-8">
                {[
                  { label: "Years Experience", value: "5+" },
                  { label: "Daily Rides", value: "500+" },
                  { label: "Driver Partners", value: "200+" },
                ].map((item, i) => (
                  <div key={i} className="text-center md:text-left">
                    <div className="text-2xl font-family-bold text-brand-600">{item.value}</div>
                    <div className="text-xs text-slate-400 font-family-medium mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-brand-600/10 to-brand-600/5 rounded-[2rem] -z-10" />
              <div className="relative rounded-[1.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
                <Image src={CarBanner} alt="Cabkn service" className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-950/20 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] px-5 py-4 border border-slate-100 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                    <FiCheckCircle className="text-green-600" size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-family-semibold text-slate-900">Trusted Service</div>
                    <div className="text-xs text-slate-400 font-family-regular">4.9 avg rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ===== VALUES ===== */}
      <section className="bg-slate-50/80 py-20 md:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/5 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-600/5 rounded-full blur-3xl -ml-20 -mb-20" />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionReveal>
            <div className="text-center mb-14 md:mb-18">
              <span className="inline-flex items-center gap-2 text-brand-600 text-xs md:text-sm font-family-semibold tracking-widest uppercase mb-4">
                Our Values
                <span className="w-8 h-px bg-brand-600" />
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-family-bold text-slate-900 mt-3 tracking-tight">
                What Sets Us Apart
              </h2>
              <p className="text-slate-400 text-sm md:text-base mt-4 max-w-xl mx-auto font-family-regular">
                Four pillars that guide everything we do — from the way we treat our riders to how we build our platform.
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <SectionReveal key={i} delay={i * 100}>
                <div className="group bg-white rounded-2xl p-7 md:p-8 border border-slate-100 shadow-sm hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 text-center h-full flex flex-col">
                  <div className={`w-14 h-14 rounded-2xl ${v.bg} ${v.color} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    {v.icon}
                  </div>
                  <h3 className="text-lg font-family-semibold text-slate-900 mb-3">{v.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-family-regular flex-grow">{v.desc}</p>
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <span className="text-xs text-brand-600 font-family-semibold inline-flex items-center gap-1">
                      Learn more <FiArrowRight size={12} />
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
        <section className="max-w-7xl mx-auto py-20 md:py-28 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="space-y-6">
                {[
                  { icon: <FiClock size={20} />, title: "Real-Time Tracking", desc: "Know exactly where your ride is at all times with live GPS tracking." },
                  { icon: <FiTrendingUp size={20} />, title: "Transparent Pricing", desc: "Get upfront fare estimates with no hidden fees or surge surprises." },
                  { icon: <FiShield size={20} />, title: "Safety First", desc: "All drivers are background-checked and every ride is monitored 24/7." },
                ].map((feature, i) => (
                  <SectionReveal key={i} delay={i * 80}>
                    <div className="flex gap-4 items-start group">
                      <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="text-base font-family-semibold text-slate-900 mb-1">{feature.title}</h4>
                        <p className="text-sm text-slate-500 font-family-regular leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-[1.5rem] p-8 md:p-10 text-white shadow-[0_20px_60px_rgba(0,74,112,0.2)]">
                <FiAward size={32} className="text-brand-200 mb-4" />
                <h3 className="text-xl md:text-2xl font-family-bold mb-3">Our Commitment</h3>
                <p className="text-white/70 text-sm leading-relaxed font-family-regular mb-6">
                  We are dedicated to providing the safest, most reliable transportation service in Saint Kitts and Nevis. Every ride is an opportunity to earn your trust.
                </p>
                <div className="flex flex-wrap gap-6">
                  {[
                    { value: "99%", label: "Satisfaction" },
                    { value: "<5min", label: "Avg Pickup" },
                    { value: "24/7", label: "Support" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="text-xl font-family-bold text-white">{item.value}</div>
                      <div className="text-xs text-white/50 font-family-medium">{item.label}</div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-28">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 rounded-[2rem] py-16 md:py-20 px-6 sm:px-10 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-400/5 rounded-full blur-3xl" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-family-bold mb-5 leading-tight tracking-tight">
                Ready to Experience the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-100">
                  Cabkn Difference
                </span>
                ?
              </h2>
              <p className="text-white/60 text-base md:text-lg mb-10 leading-relaxed max-w-2xl mx-auto font-family-regular">
                Join thousands of satisfied riders and enjoy the most reliable transportation service between Nevis and Saint Kitts.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <CustomButton
                  onClick={() => router.push('/auth/stepOne')}
                  variant="primary"
                  size="lg"
                  className="!bg-white !text-slate-900 hover:!bg-slate-100 !shadow-lg !shadow-black/10 font-family-semibold"
                  endContent={<FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />}
                >
                  Create Your Account
                </CustomButton>
                <button
                  onClick={() => router.push('/ride')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 font-family-medium text-sm"
                >
                  Book a Ride Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>
    </div>
  );
}
