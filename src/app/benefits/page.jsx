"use client";
import React, { useEffect, useState, useRef } from "react";
import { mainBanner } from "@/components/assets/Images";
import { FiClock, FiDollarSign, FiHeart, FiSmartphone, FiShield, FiHeadphones, FiArrowRight, FiAward, FiTrendingUp, FiCheckCircle } from "react-icons/fi";
import CustomButton from "../../components/CustomButton";
import { useRouter } from "next/navigation";

function SectionReveal({ children, delay = 0 }) {
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
    <div ref={ref} className={`transition-all duration-700 transform ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function Benefits() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  useEffect(() => { setMounted(true); }, []);

  const benefits = [
    {
      icon: <FiClock size={24} />, title: "Real-Time Tracking",
      desc: "Follow your ride in real time. Know exactly when your driver will arrive and track your journey live.",
      color: "text-blue-600", bg: "bg-blue-50",
    },
    {
      icon: <FiDollarSign size={24} />, title: "Fair & Transparent Pricing",
      desc: "Get upfront pricing with no hidden fees. Our fare estimator gives you the cost before you book.",
      color: "text-emerald-600", bg: "bg-emerald-50",
    },
    {
      icon: <FiSmartphone size={24} />, title: "Easy Booking",
      desc: "Book a ride in under 30 seconds. Choose your pickup, select your destination, and you are on your way.",
      color: "text-violet-600", bg: "bg-violet-50",
    },
    {
      icon: <FiShield size={24} />, title: "Safety First",
      desc: "All drivers are background-checked and verified. Share your trip with loved ones for added peace of mind.",
      color: "text-rose-600", bg: "bg-rose-50",
    },
    {
      icon: <FiHeadphones size={24} />, title: "24/7 Support",
      desc: "Our dedicated support team is available around the clock to assist with any questions or concerns.",
      color: "text-amber-600", bg: "bg-amber-50",
    },
    {
      icon: <FiHeart size={24} />, title: "Rider Rewards",
      desc: "Earn points with every ride and unlock exclusive discounts, priority booking, and special perks.",
      color: "text-pink-600", bg: "bg-pink-50",
    },
  ];

  const highlights = [
    { value: "2x", label: "Faster than public transit", color: "text-brand-600" },
    { value: "30%", label: "Cheaper than traditional taxis", color: "text-emerald-600" },
    { value: "99%", label: "On-time arrival rate", color: "text-blue-600" },
    { value: "4.9★", label: "Average rider satisfaction", color: "text-amber-600" },
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
            Why Ride With Us
          </span>
          <h1 className={`text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-family-bold mt-4 mb-6 leading-[1.1] tracking-tight ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "300ms" }}>
            Benefits of Using{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-100">
              Cabkn
            </span>
          </h1>
          <p className={`text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-family-regular ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "400ms" }}>
            Discover why thousands of riders choose Cabkn for their daily commute and island travels.
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

      {/* ===== HIGHLIGHTS ===== */}
      <section className="relative z-20 px-4 sm:px-6 lg:px-8 -mt-14">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {highlights.map((h, i) => (
            <div
              key={i}
              className={`group relative bg-white rounded-2xl p-6 md:p-7 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 overflow-hidden ${mounted ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${200 + i * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${h.color.replace("text-", "from-").replace("brand-", "brand-").split(" ")[0]} to-transparent opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-300`} />
              <h3 className={`text-2xl md:text-3xl lg:text-4xl font-family-bold m-0 tracking-tight ${h.color}`}>{h.value}</h3>
              <p className="text-xs md:text-sm text-slate-500 mt-1.5 font-family-medium">{h.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BENEFITS GRID ===== */}
      <SectionReveal>
        <section className="max-w-7xl mx-auto py-20 md:py-28 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 md:mb-18">
            <span className="inline-flex items-center gap-2 text-brand-600 text-xs md:text-sm font-family-semibold tracking-widest uppercase mb-4">
              <span className="w-8 h-px bg-brand-600" />
              Everything You Need
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-family-bold text-slate-900 mt-3 tracking-tight">
              The Cabkn Advantage
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-4 max-w-xl mx-auto font-family-regular">
              Six powerful benefits that make Cabkn the smartest choice for your commute.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <SectionReveal key={i} delay={i * 80}>
                <div className="group bg-white rounded-2xl p-7 md:p-8 border border-slate-100 shadow-sm hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 hover:border-brand-200 transition-all duration-300 h-full flex flex-col">
                  <div className={`w-13 h-13 rounded-2xl ${b.bg} ${b.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`} style={{ width: 52, height: 52 }}>
                    {b.icon}
                  </div>
                  <h3 className="text-lg font-family-semibold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-family-regular flex-grow">{b.desc}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-xs text-brand-600 font-family-semibold inline-flex items-center gap-1">
                      Learn more <FiArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </section>
      </SectionReveal>

      {/* ===== FEATURES COMPARISON ===== */}
      <SectionReveal>
        <section className="bg-slate-50/80 py-20 md:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/5 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-600/5 rounded-full blur-3xl -ml-20 -mb-20" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-brand-600 text-xs md:text-sm font-family-semibold tracking-widest uppercase mb-4">
                  <span className="w-8 h-px bg-brand-600" />
                  Why Cabkn
                </span>
                <h2 className="text-3xl sm:text-4xl font-family-bold text-slate-900 mt-3 mb-6 leading-tight tracking-tight">
                  Designed to Make Your{" "}
                  <span className="text-brand-600">Journey Better</span>
                </h2>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed font-family-regular mb-8">
                  Every feature we build is focused on one thing — giving you the best possible ride experience from start to finish.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: <FiTrendingUp size={18} />, text: "Smart route optimization for faster trips" },
                    { icon: <FiCheckCircle size={18} />, text: "Verified drivers with background checks" },
                    { icon: <FiClock size={18} />, text: "Real-time ETA updates and live tracking" },
                  ].map((item, i) => (
                    <SectionReveal key={i} delay={i * 80}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                          {item.icon}
                        </div>
                        <span className="text-sm text-slate-600 font-family-regular">{item.text}</span>
                      </div>
                    </SectionReveal>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-[1.5rem] p-8 md:p-10 text-white shadow-[0_20px_60px_rgba(0,74,112,0.2)]">
                <FiAward size={36} className="text-brand-200 mb-4" />
                <h3 className="text-xl md:text-2xl font-family-bold mb-3">Rider Satisfaction Guaranteed</h3>
                <p className="text-white/70 text-sm leading-relaxed font-family-regular mb-6">
                  We measure our success by your satisfaction. Every ride is an opportunity to earn your trust and keep you coming back.
                </p>
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                  {[
                    { value: "10,000+", label: "Happy Riders" },
                    { value: "4.9★", label: "Avg Rating" },
                    { value: "99%", label: "On-Time" },
                    { value: "24/7", label: "Support" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="text-lg font-family-bold text-white">{item.value}</div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-28 pt-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 rounded-[2rem] py-16 md:py-20 px-6 sm:px-10 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-400/5 rounded-full blur-3xl" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-family-bold mb-5 leading-tight tracking-tight">
                Start Enjoying{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-100">
                  These Benefits
                </span>{" "}
                Today
              </h2>
              <p className="text-white/60 text-base md:text-lg mb-10 leading-relaxed max-w-2xl mx-auto font-family-regular">
                Sign up now and experience the best way to travel between Nevis and Saint Kitts.
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
