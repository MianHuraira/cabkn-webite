"use client";
import React, { useEffect, useState, useRef } from "react";
import { mainBanner } from "@/components/assets/Images";
import { FiClock, FiDollarSign, FiSmartphone, FiShield, FiHeadphones, FiHeart, FiArrowRight, FiAward, FiTrendingUp, FiCheckCircle } from "react-icons/fi";
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
      icon: <FiClock size={22} />, title: "Real-Time Tracking",
      desc: "Follow your ride in real time. Know exactly when your driver will arrive and track your journey live.",
      color: "text-blue-600", bg: "bg-blue-50",
    },
    {
      icon: <FiDollarSign size={22} />, title: "Fair & Transparent Pricing",
      desc: "Get upfront pricing with no hidden fees. Our fare estimator gives you the cost before you book.",
      color: "text-emerald-600", bg: "bg-emerald-50",
    },
    {
      icon: <FiSmartphone size={22} />, title: "Easy Booking",
      desc: "Book a ride in under 30 seconds. Choose your pickup, select your destination, and you are on your way.",
      color: "text-violet-600", bg: "bg-violet-50",
    },
    {
      icon: <FiShield size={22} />, title: "Safety First",
      desc: "All drivers are background-checked and verified. Share your trip with loved ones for added peace of mind.",
      color: "text-rose-600", bg: "bg-rose-50",
    },
    {
      icon: <FiHeadphones size={22} />, title: "24/7 Support",
      desc: "Our dedicated support team is available around the clock to assist with any questions or concerns.",
      color: "text-amber-600", bg: "bg-amber-50",
    },
    {
      icon: <FiHeart size={22} />, title: "Rider Rewards",
      desc: "Earn points with every ride and unlock exclusive discounts, priority booking, and special perks.",
      color: "text-pink-600", bg: "bg-pink-50",
    },
  ];

  const highlights = [
    { value: "2x", label: "Faster than public transit", color: "text-brand-600" },
    { value: "30%", label: "Cheaper than taxis", color: "text-emerald-600" },
    { value: "99%", label: "On-time arrival rate", color: "text-blue-600" },
    { value: "4.9★", label: "Rider satisfaction", color: "text-amber-600" },
  ];

  return (
    <div className={`min-h-screen bg-slate-50/50 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 pt-28 pb-32 md:pt-36 md:pb-40">
        {/* Banner Overlay */}
        <div className="absolute inset-0 opacity-[0.05] bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: `url(${mainBanner.src})` }} />

        {/* High-tech Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }} />

        {/* Neon blurred blobs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "12s" }} />

        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent" />

        <div className={`relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
          <div className={`inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 text-white/80 text-xs sm:text-sm font-family-semibold tracking-wider uppercase px-4 py-2 rounded-full mb-6 ${mounted ? "animate-fade-in-down" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Cabkn Value Proposition</span>
          </div>
          <h1 className={`text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-family-bold mt-4 !mb-6 leading-[1.1] tracking-tight ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "300ms" }}>
            Benefits of Using{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
              Cabkn
            </span>
          </h1>
          <p className={`text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-family-regular ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "400ms" }}>
            Discover why thousands of riders choose Cabkn for their daily commute and island transfers.
          </p>

          <div className="mt-10 flex flex-wrap justify-center items-center gap-2">
            <button
              onClick={() => router.push('/auth/stepOne')}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-950 shadow-lg shadow-black/10 transition-all duration-300 font-family-semibold text-sm hover:-translate-y-1 active:translate-y-0 group border-none"
            >
              <span>Get Started</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300 text-slate-800" />
            </button>
            <button
              onClick={() => router.push('/ride')}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full !border !border-slate-700/80 text-slate-350 text-white hover:border-slate-550 hover:bg-slate-900/50 transition-all duration-300 font-family-semibold text-sm hover:-translate-y-1 active:translate-y-0"
            >
              Book a Ride
            </button>
          </div>
        </div>
      </section>

      {/* ===== HIGHLIGHTS ===== */}
      <section className="relative z-20 px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {highlights.map((h, i) => (
            <div
              key={i}
              className={`group relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_20px_40px_rgba(0,74,112,0.06)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden ${mounted ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${200 + i * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${h.color.replace("text-", "from-").replace("brand-", "brand-").split(" ")[0]} to-transparent opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-300`} />
              <h3 className={`text-3xl md:text-4xl font-family-black m-0 tracking-tight ${h.color}`}>{h.value}</h3>
              <p className="text-xs text-slate-500 mt-2 font-family-semibold m-0 uppercase tracking-wide">{h.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BENEFITS GRID ===== */}
      <SectionReveal>
        <section className="max-w-7xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 text-brand-600 text-xs md:text-sm font-family-semibold tracking-widest uppercase mb-3">
              Everything You Need
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-family-bold text-slate-900 mt-2 tracking-tight">
              The Cabkn Advantage
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-3 max-w-xl mx-auto font-family-regular">
              Six powerful benefits that make Cabkn the smartest choice for your Nevis & Saint Kitts commute.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {benefits.map((b, i) => (
              <SectionReveal key={i} delay={i * 80}>
                <div className="group bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,74,112,0.06)] hover:-translate-y-2 hover:border-brand-200 transition-all duration-500 h-full flex flex-col relative overflow-hidden">
                  <div className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br ${b.color.replace('text-', 'from-').split(' ')[0]}/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none`} />

                  <div className="flex-grow flex flex-col justify-start">
                    <div className={`w-12 h-12 rounded-2xl ${b.bg} ${b.color} flex items-center justify-center mb-5 border border-slate-100/50 shadow-inner group-hover:scale-110 transition-transform duration-300`} style={{ width: 48, height: 48 }}>
                      {b.icon}
                    </div>
                    <h3 className="text-lg font-family-semibold text-slate-900 mb-2">{b.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-family-regular m-0 mb-6">{b.desc}</p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-brand-650 font-family-semibold group-hover:text-brand-700 transition-colors">
                    <span>Learn details</span>
                    <FiArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </section>
      </SectionReveal>

      {/* ===== FEATURES COMPARISON ===== */}
      <SectionReveal>
        <section className="bg-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-y border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-600/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-2 text-brand-600 text-xs md:text-sm font-family-semibold tracking-widest uppercase mb-3">
                  {/* <span className="w-6 h-px bg-brand-600" /> */}
                  Why Cabkn
                </span>
                <h2 className="text-3xl sm:text-4xl font-family-bold text-slate-900 mt-2 !mb-6 leading-tight tracking-tight">
                  Designed to Make Your{" "}
                  <span className="text-brand-600">Journey Better</span>
                </h2>
                <p className="text-slate-550 text-sm md:text-base leading-relaxed font-family-regular !mb-8">
                  Every feature we build is focused on one thing — giving you a seamless and stress-free island ride experience.
                </p>

                <div className="space-y-4">
                  {[
                    { icon: <FiTrendingUp size={18} />, title: "Smart Routing Optimization", desc: "Avoid transit delays through navigation systems built specifically for local routes." },
                    { icon: <FiCheckCircle size={18} />, title: "Verified & Vetted Drivers", desc: "Every driver passes detailed background screens and in-person vehicle checks." },
                    { icon: <FiClock size={18} />, title: "Real-Time ETA Updates", desc: "Keep colleagues or family in the loop with live shareable trip links." },
                  ].map((item, i) => (
                    <SectionReveal key={i} delay={i * 80}>
                      <div className="flex items-start gap-4 bg-white border border-slate-150/60 p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.015)] max-w-xl">
                        <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-family-semibold text-slate-900 m-0 leading-tight">{item.title}</p>
                          <p className="text-xs text-slate-500 m-0 mt-1 leading-relaxed font-family-regular">{item.desc}</p>
                        </div>
                      </div>
                    </SectionReveal>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 border border-slate-850 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[420px]">
                {/* Dotted Grid backdrop */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                  backgroundSize: "24px 24px"
                }} />

                <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 !border border-brand-500/20 text-brand-400 flex items-center justify-center mb-3">
                    <FiAward size={22} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-family-bold mb-3">Rider Satisfaction Guaranteed</h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-family-regular mb-8">
                    We measure our success by your comfort. Every trip is structured to gain your trust and offer a reliable transfer.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 !border-t !border-slate-800/80 relative z-10">
                  {[
                    { value: "10,000+", label: "Happy Riders" },
                    { value: "4.9★", label: "Avg Rating" },
                    { value: "99%", label: "On-Time Rate" },
                    { value: "24/7", label: "Live Support" },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-900/50 !border border-slate-400/60 rounded-2xl p-4 text-center">
                      <div className="text-lg font-family-bold text-white leading-none">{item.value}</div>
                      <div className="text-[9px] text-slate-500 font-family-semibold uppercase tracking-wider mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ===== BOTTOM CTA CARD ===== */}
      <SectionReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-28 pt-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 rounded-[2.5rem] py-16 md:py-20 px-6 sm:px-10 text-center shadow-xl">
            {/* Mesh background overlays */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "24px 24px"
            }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-family-bold mb-5 leading-tight tracking-tight">
                Start Enjoying{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
                  These Benefits
                </span>{" "}
                Today
              </h2>
              <p className="text-slate-400 text-sm md:text-base mb-10 leading-relaxed max-w-xl mx-auto font-family-regular">
                Sign up today and experience the smartest way to travel across Nevis and Saint Kitts.
              </p>

              <div className="flex flex-wrap justify-center items-center gap-4 !mt-10">
                <button
                  onClick={() => router.push('/auth/stepOne')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-950 shadow-lg shadow-black/10 transition-all duration-300 font-family-semibold text-sm hover:-translate-y-1 active:translate-y-0 group border-none"
                >
                  <span>Create Your Account</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300 text-slate-800" />
                </button>
                <button
                  onClick={() => router.push('/ride')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-slate-700/85 text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-900/50 transition-all duration-300 font-family-semibold text-sm hover:-translate-y-1 active:translate-y-0 !border !border-slate-700/85"
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
