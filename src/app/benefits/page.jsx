"use client";
import React, { useEffect, useState, useRef } from "react";
import { mainBanner } from "@/components/assets/Images";
import { FiClock, FiDollarSign, FiHeart, FiSmartphone, FiShield, FiHeadphones, FiArrowRight } from "react-icons/fi";
import CustomButton from "../../components/CustomButton";
import { useRouter } from "next/navigation";

export default function Benefits() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const benefits = [
    {
      icon: <FiClock size={24} />,
      title: "Real-Time Tracking",
      desc: "Follow your ride in real time. Know exactly when your driver will arrive and track your journey live.",
    },
    {
      icon: <FiDollarSign size={24} />,
      title: "Fair & Transparent Pricing",
      desc: "Get upfront pricing with no hidden fees. Our fare estimator gives you the cost before you book.",
    },
    {
      icon: <FiSmartphone size={24} />,
      title: "Easy Booking",
      desc: "Book a ride in under 30 seconds. Choose your pickup, select your destination, and you are on your way.",
    },
    {
      icon: <FiShield size={24} />,
      title: "Safety First",
      desc: "All drivers are background-checked and verified. Share your trip with loved ones for added peace of mind.",
    },
    {
      icon: <FiHeadphones size={24} />,
      title: "24/7 Support",
      desc: "Our dedicated support team is available around the clock to assist with any questions or concerns.",
    },
    {
      icon: <FiHeart size={24} />,
      title: "Rider Rewards",
      desc: "Earn points with every ride and unlock exclusive discounts, priority booking, and special perks.",
    },
  ];

  const highlights = [
    { value: "2x", label: "Faster than public transit", color: "text-brand-600" },
    { value: "30%", label: "Cheaper than traditional taxis", color: "text-emerald-600" },
    { value: "99%", label: "On-time arrival rate", color: "text-blue-600" },
    { value: "4.9★", label: "Average rider satisfaction", color: "text-amber-600" },
  ];

  const SectionReveal = ({ children, delay = 0 }) => {
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
      <div ref={ref} className={`transition-all duration-700 transform ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`} style={{ transitionDelay: `${delay}ms` }}>
        {children}
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-white ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 to-brand-950 pt-24 pb-20 md:pt-32 md:pb-28">
        <div
          className="absolute inset-0 opacity-5 bg-cover bg-center"
          style={{ backgroundImage: `url(${mainBanner.src})` }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-white/60 text-xs sm:text-sm font-semibold tracking-widest uppercase">Why Ride With Us</span>
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mt-4 mb-5 leading-tight tracking-tight">
            Benefits of Using <span className="!text-brand-400">Cabkn</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Discover why thousands of riders choose Cabkn for their daily commute and island travels.
          </p>
        </div>
      </section>

      {/* Highlights */}
      <section className="relative z-20 px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {highlights.map((h, i) => (
            <div key={i} className={`bg-white rounded-2xl p-6 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${(i + 1) * 100}ms` }}>
              <h3 className={`text-2xl md:text-3xl lg:text-4xl font-bold m-0 ${h.color}`}>{h.value}</h3>
              <p className="text-xs md:text-sm text-slate-500 mt-2">{h.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Grid */}
      <SectionReveal>
        <section className="max-w-7xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="!text-primary text-xs md:text-sm font-semibold tracking-widest uppercase">Everything You Need</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3">The Cabkn Advantage</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <SectionReveal key={i} delay={i * 100}>
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-brand-200 transition-all duration-300 flex flex-col h-full gap-5 items-start">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 !text-primary flex items-center justify-center shrink-0">
                    {b.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{b.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed m-0">{b.desc}</p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </section>
      </SectionReveal>

      {/* CTA */}
      <SectionReveal>
        <section className="bg-gradient-to-br from-brand-800 to-brand-950 py-16 md:py-20 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">
              Start Enjoying These Benefits Today
            </h2>
            <p className="text-white/70 text-base md:text-lg !mb-8 leading-relaxed">
              Sign up now and experience the best way to travel between Nevis and Saint Kitts.
            </p>
            <CustomButton
              onClick={() => router.push('/auth/stepOne')}
              variant="primary"
              size="lg"
              className="!bg-white !text-primary hover:!bg-slate-50 hover:!shadow-[0_8px_24px_rgba(255,255,255,0.2)]"
              endContent={<FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />}
            >
              Create Your Account
            </CustomButton>
          </div>
        </section>
      </SectionReveal>
    </div>
  );
}
