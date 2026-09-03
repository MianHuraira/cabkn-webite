"use client";
import React, { useEffect, useState, useRef } from "react";
import { Heroimg } from "@/components/assets/Images";
import {
  FiClock,
  FiDollarSign,
  FiSmartphone,
  FiShield,
  FiHeadphones,
  FiHeart,
  FiArrowRight,
  FiAward,
  FiTrendingUp,
  FiCheckCircle,
  FiZap,
  FiTag,
  FiStar,
} from "react-icons/fi";
import CustomButton from "../../components/CustomButton";
import { useRouter } from "next/navigation";

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
      className={`transition-all duration-700 transform ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Benefits() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setMounted(true);
  }, []);

  const benefits = [
    {
      icon: <FiClock size={22} />,
      title: "Real-Time Tracking",
      desc: "Follow your ride in real time. Know exactly when your driver will arrive and track your journey live.",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: <FiDollarSign size={22} />,
      title: "Fair & Transparent Pricing",
      desc: "Get upfront pricing with no hidden fees. Our fare estimator gives you the cost before you book.",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: <FiSmartphone size={22} />,
      title: "Easy Booking",
      desc: "Book a ride in under 30 seconds. Choose your pickup, select your destination, and you are on your way.",
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      icon: <FiShield size={22} />,
      title: "Safety First",
      desc: "All drivers are background-checked and verified. Share your trip with loved ones for added peace of mind.",
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      icon: <FiHeadphones size={22} />,
      title: "24/7 Support",
      desc: "Our dedicated support team is available around the clock to assist with any questions or concerns.",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      icon: <FiHeart size={22} />,
      title: "Rider Rewards",
      desc: "Earn points with every ride and unlock exclusive discounts, priority booking, and special perks.",
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
  ];

  const highlights = [
    {
      icon: <FiZap size={20} />,
      value: "2x",
      label: "Faster than public transit",
      color: "text-violet-600",
      bg: "bg-violet-50",
      gradient: "from-violet-500 to-violet-600",
    },
    {
      icon: <FiTag size={20} />,
      value: "30%",
      label: "Cheaper than taxis",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      icon: <FiCheckCircle size={20} />,
      value: "99%",
      label: "On-time arrival rate",
      color: "text-blue-600",
      bg: "bg-blue-50",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: <FiStar size={20} />,
      value: "4.9★",
      label: "Rider satisfaction",
      color: "text-amber-600",
      bg: "bg-amber-50",
      gradient: "from-amber-500 to-amber-600",
    },
  ];

  return (
    <div
      className={`min-h-screen bg-slate-50/50 ${mounted ? "animate-fade-in" : "opacity-0"}`}
    >
      {/* ===== HERO ===== */}
      <section
        className={`relative min-h-screen select-none flex items-center overflow-hidden pt-20 pb-20 md:pt-24 md:pb-28 ${mounted ? "animate-fade-in" : "opacity-0"}`}
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
              Cabkn Value Proposition
            </div>

            <h1
              className={`text-white font-family-medium leading-[1.2] tracking-tight m-0 text-[clamp(2rem,5vw,3.5rem)] sm:text-[clamp(2.25rem,6vw,3rem)] ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "200ms" }}
            >
              Benefits of Using{" "}
              <span className="font-family-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
                Cabkn
              </span>
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
                  Real-time ride tracking
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#004a70] flex items-center justify-center">
                  <FiCheckCircle size={12} color="#fff" />
                </div>
                <span className="text-white/80 font-family-regular text-sm">
                  Fair & transparent pricing
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#004a70] flex items-center justify-center">
                  <FiCheckCircle size={12} color="#fff" />
                </div>
                <span className="text-white/80 font-family-regular text-sm">
                  Easy fast booking
                </span>
              </div>
            </div>

            <div
              className={`flex flex-wrap gap-4 mt-4 ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "400ms" }}
            >
              <CustomButton
                onClick={() => router.push("/auth/stepOne")}
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

      {/* ===== HIGHLIGHTS ===== */}
      <section className="max-w-7xl mx-auto py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <SectionReveal>
            <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 !border !border-brand-100 text-brand-700 text-[11px] sm:text-xs font-family-semibold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                Proven Performance
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-family-semibold text-slate-800 mt-4 tracking-tight leading-tight">
                Numbers That{" "}
                <span className="text-brand-600">Speak for Themselves</span>
              </h2>
              <p className="text-slate-500 text-sm sm:text-[15px] mt-3 font-family-regular leading-relaxed">
                Real results we deliver to every rider, every single day across
                Nevis and Saint Kitts.
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {highlights.map((h, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-3xl bg-white p-4 md:p-5 text-center !border !border-slate-100 shadow-[0_12px_40px_rgba(0,74,112,0.06)] hover:shadow-[0_24px_60px_rgba(0,74,112,0.14)] hover:-translate-y-1.5 transition-all duration-500 ${mounted ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${200 + i * 100}ms` }}
              >
                <div
                  className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${h.gradient} opacity-[0.08] rounded-full blur-2xl group-hover:opacity-[0.16] transition-opacity duration-500`}
                />
                <div
                  className={`relative inline-flex w-11 h-11 rounded-2xl bg-gradient-to-br ${h.gradient} text-white items-center justify-center mb-2.5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {h.icon}
                </div>
                <h3
                  className={`text-2xl md:text-[28px] font-family-semibold m-0 tracking-tight ${h.color}`}
                >
                  {h.value}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1 font-family-semibold m-0 uppercase tracking-widest">
                  {h.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BENEFITS GRID ===== */}
      <section className="bg-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 !border-y !border-slate-100 relative overflow-hidden">
     
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionReveal>
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 !border !border-brand-100 text-brand-700 text-[11px] sm:text-xs font-family-semibold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                Everything You Need
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-family-semibold text-slate-800 mt-4 tracking-tight">
                The <span className="text-brand-600">Cabkn Advantage</span>
              </h2>
              <p className="text-slate-500 text-sm sm:text-[15px] mt-3 max-w-xl mx-auto font-family-regular">
                Six powerful benefits that make Cabkn the smartest choice for
                your Nevis & Saint Kitts commute.
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {benefits.map((b, i) => (
              <SectionReveal key={i} delay={i * 80}>
                <div className="group relative bg-white rounded-3xl p-6 sm:p-7 !border !border-slate-100 shadow-[0_10px_36px_rgba(0,0,0,0.03)] hover:shadow-[0_24px_60px_rgba(0,74,112,0.12)] hover:-translate-y-2 hover:!border-brand-200 transition-all duration-500 h-full flex flex-col justify-between relative overflow-hidden">
                  <div
                    className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br ${b.color.replace("text-", "from-").split(" ")[0]}/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none`}
                  />

                  <div className="flex-grow flex flex-col justify-start">
                    <div
                      className={`w-12 h-12 rounded-2xl ${b.bg} ${b.color} flex items-center justify-center mb-3 !border !border-slate-100/55 shadow-inner group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}
                    >
                      {b.icon}
                    </div>
                    <h3 className="text-[15px] sm:text-[17px] font-family-semibold text-slate-800 mb-2">
                      {b.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-family-regular mb-1">
                      {b.desc}
                    </p>
                  </div>

                  <div className="mt-auto pt-2 !border-t !border-slate-100 flex items-center justify-between text-xs text-brand-650 font-family-semibold group-hover:text-brand-700 transition-colors">
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

      {/* ===== FEATURES COMPARISON ===== */}
      <section className="max-w-7xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 !border !border-brand-100 text-brand-700 text-[11px] sm:text-xs font-family-semibold uppercase tracking-widest mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
              Why Cabkn
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-family-semibold text-slate-800 mt-6 mb-8 leading-tight tracking-tight mb-2">
              Designed to Make Your{" "}
              <span className="relative text-brand-600">
                Journey Better
              </span>
            </h2>
            <p className="text-slate-550 text-sm sm:text-[15px] leading-relaxed font-family-regular mb-2">
              Every feature we build is focused on one thing — giving you a
              seamless and stress-free island ride experience.
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: <FiTrendingUp size={18} />,
                  title: "Smart Routing Optimization",
                  desc: "Avoid transit delays through navigation systems built specifically for local routes.",
                },
                {
                  icon: <FiCheckCircle size={18} />,
                  title: "Verified & Vetted Drivers",
                  desc: "Every driver passes detailed background screens and in-person vehicle checks.",
                },
                {
                  icon: <FiClock size={18} />,
                  title: "Real-Time ETA Updates",
                  desc: "Keep colleagues or family in the loop with live shareable trip links.",
                },
              ].map((item, i) => (
                <SectionReveal key={i} delay={i * 80}>
                  <div className="group flex items-start gap-4 bg-white !border !border-slate-150/60 p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_14px_44px_rgba(0,74,112,0.1)] hover:-translate-y-0.5 hover:!border-brand-150 transition-all duration-300 max-w-xl">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 !border !border-brand-100 group-hover:bg-brand-600 group-hover:text-white group-hover:scale-105 transition-all duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-family-semibold text-slate-900 m-0 leading-tight">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 m-0 mt-1 leading-relaxed font-family-regular">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </SectionReveal>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="relative bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 !border !border-slate-855 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl overflow-hidden flex flex-col justify-between min-h-[440px]">
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-16 -left-16 w-44 h-44 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 !border !border-white/20 text-brand-300 flex items-center justify-center mb-5 backdrop-blur-md shadow-inner">
                  <FiAward size={22} />
                </div>
                <h3 className="text-lg sm:text-xl font-family-semibold mb-3">
                  Rider Satisfaction Guaranteed
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-family-regular mb-8">
                  We measure our success by your comfort. Every trip is
                  structured to gain your trust and offer a reliable transfer.
                </p>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-4 pt-6 !border-t !border-white/10">
                {[
                  { value: "10,000+", label: "Happy Riders" },
                  { value: "4.9★", label: "Avg Rating" },
                  { value: "99%", label: "On-Time Rate" },
                  { value: "24/7", label: "Live Support" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white/5 !border !border-white/10 rounded-2xl p-4 text-center backdrop-blur-sm hover:bg-white/10 transition-colors"
                  >
                    <div className="text-lg font-family-semibold text-white leading-none">
                      {item.value}
                    </div>
                    <div className="text-[9px] text-slate-300 font-family-semibold uppercase tracking-wider mt-1.5 leading-none">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BOTTOM CTA CARD ===== */}
      <SectionReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-28 pt-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 rounded-[2.5rem] py-16 md:py-20 px-6 sm:px-10 text-center shadow-2xl">
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: "24px 24px",
              }}
            />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-brand-500/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-16 w-72 h-72 bg-sky-400/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 !border !border-white/15 text-brand-200 text-[11px] sm:text-xs font-family-semibold uppercase tracking-widest backdrop-blur-md mb-2">
                Join Us Today
              </span>
              <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-family-semibold mb-3 leading-tight tracking-tight">
                Start Enjoying{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
                  These Benefits
                </span>{" "}
                Today
              </h2>
              <p className="text-slate-400 text-sm sm:text-[15px]  leading-relaxed max-w-xl mx-auto font-family-regular">
                Sign up today and experience the smartest way to travel across
                Nevis and Saint Kitts.
              </p>

              <div className="flex flex-wrap justify-center items-center gap-3 mt-2">
                <button
                  onClick={() => router.push("/auth/stepOne")}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 hover:shadow-xl shadow-black/10 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 font-family-semibold text-sm group !border-none"
                >
                  <span>Create Your Account</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300 text-slate-800" />
                </button>
                <button
                  onClick={() => router.push("/ride")}
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
