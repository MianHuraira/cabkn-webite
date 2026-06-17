"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { CarBanner, mainBanner } from "@/components/assets/Images";
import { FiAward, FiUsers, FiMapPin, FiShield, FiArrowRight } from "react-icons/fi";
import CustomButton from "../../components/CustomButton";
import { useRouter } from "next/navigation";

export default function WhyUs() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const stats = [
    { icon: <FiUsers size={24} />, value: "10,000+", label: "Happy Riders" },
    { icon: <FiMapPin size={24} />, value: "50+", label: "Locations Covered" },
    { icon: <FiAward size={24} />, value: "4.9", label: "Average Rating" },
    { icon: <FiShield size={24} />, value: "100%", label: "Safe Rides" },
  ];

  const values = [
    {
      title: "Reliability You Can Trust",
      desc: "Every ride is tracked, verified, and backed by our commitment to punctuality and safety.",
      icon: "🚀",
    },
    {
      title: "Affordable Transparent Pricing",
      desc: "No hidden fees, no surge pricing surprises. What you see is what you pay.",
      icon: "💰",
    },
    {
      title: "Professional Drivers",
      desc: "Our drivers are thoroughly vetted, trained, and dedicated to giving you a first-class experience.",
      icon: "👨‍✈️",
    },
    {
      title: "24/7 Customer Support",
      desc: "We are always here to help, day or night. Your comfort is our priority.",
      icon: "🎧",
    },
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
          <span className="text-white/60 text-xs sm:text-sm font-semibold tracking-widest uppercase">About Cabkn</span>
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mt-4 mb-5 leading-tight tracking-tight">
            Why Choose <span className="!text-brand-500">Cabkn</span>?
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            We are on a mission to transform the way people travel between Nevis and Saint Kitts — making it seamless, safe, and stress-free.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-20 px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <div key={i} className={`bg-white rounded-2xl p-6 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${(i + 1) * 100}ms` }}>
              <div className="w-12 h-12 rounded-xl bg-slate-100 !text-primary flex items-center justify-center mx-auto mb-4">
                {stat.icon}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 m-0">{stat.value}</h3>
              <p className="text-xs md:text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <SectionReveal>
        <section className="max-w-7xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="text-start md:text-left">
              <span className="!text-primary text-xs md:text-sm font-semibold tracking-widest uppercase">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-5 leading-tight">
                Making Travel Between Islands Effortless
              </h2>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-xl mx-auto md:mx-0">
                Cabkn was born from a simple idea: travel between Nevis and Saint Kitts should be as easy as booking a ride across town.
                We built a platform that connects riders with trusted drivers, providing real-time tracking, transparent pricing, and
                a seamless booking experience. Today, thousands of riders rely on Cabkn for their daily commute, airport transfers,
                and island explorations.
              </p>
            </div>
            <div className="relative rounded-3xl overflow-hidden ">
              <Image src={CarBanner} alt="Cabkn service" className="w-full h-auto object-cover" />
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Values */}
      <section className="bg-slate-50 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-12 md:mb-16">
              <span className="!text-primary text-xs md:text-sm font-semibold tracking-widest uppercase">Our Values</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3">What Sets Us Apart</h2>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <SectionReveal key={i} delay={i * 100}>
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 text-center h-full">
                  <span className="text-4xl block mb-4">{v.icon}</span>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">{v.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed m-0">{v.desc}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <SectionReveal>
        <section className="bg-gradient-to-br from-brand-800 to-brand-950 py-16 md:py-20 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience the Cabkn Difference?
            </h2>
            <p className="text-white/70 text-base md:text-lg !mb-8 leading-relaxed max-w-2xl mx-auto">
              Join thousands of satisfied riders and enjoy the most reliable transportation service between Nevis and Saint Kitts.
            </p>
            <CustomButton
              onClick={() => router.push('/auth/stepOne')}
              variant="primary"
              size="lg"
              className="!bg-white !text-primary hover:!bg-slate-50 hover:!shadow-[0_8px_24px_rgba(255,255,255,0.2)]"
              endContent={<FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />}
            >
              Get Started
            </CustomButton>
          </div>
        </section>
      </SectionReveal>
    </div>
  );
}
