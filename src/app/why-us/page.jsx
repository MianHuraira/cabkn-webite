"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { CarBanner, mainBanner } from "@/components/assets/Images";
import { FiAward, FiUsers, FiMapPin, FiShield } from "react-icons/fi";

export default function WhyUs() {
  const [mounted, setMounted] = useState(false);
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
      <div ref={ref} className={`reveal ${inView ? "visible" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
        {children}
      </div>
    );
  };

  return (
    <div className={mounted ? "animate-fade-in" : "opacity-0"} style={{ minHeight: "100vh", background: "#fff" }}>
      {/* Hero */}
      <section
        className={mounted ? "animate-fade-in-down" : "opacity-0"}
        style={{
          background: "linear-gradient(135deg, #004a70 0%, #002d47 100%)",
          padding: "100px 0 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: `url(${mainBanner.src})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>About Cabkn</span>
          <h1 style={{ color: "#fff", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, margin: "16px 0 20px", lineHeight: 1.15, letterSpacing: "-0.5px" }}>
            Why Choose <span style={{ color: "#60a5fa" }}>Cabkn</span>?
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "clamp(0.95rem, 1.2vw, 1.15rem)", maxWidth: 640, margin: "0 auto", lineHeight: 1.7 }}>
            We are on a mission to transform the way people travel between Nevis and Saint Kitts — making it seamless, safe, and stress-free.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ marginTop: -40, position: "relative", zIndex: 2, padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {stats.map((stat, i) => (
            <div key={i} className="reveal visible" style={{ animationDelay: `${i * 100}ms` }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: "28px 20px", textAlign: "center", boxShadow: "0 8px 30px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#eef2f6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#004a70" }}>{stat.icon}</div>
                <h3 style={{ fontSize: 28, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>{stat.value}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <SectionReveal>
        <div style={{ maxWidth: 1200, margin: "80px auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 48, alignItems: "center" }}>
            <div>
              <span style={{ color: "#004a70", fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>Our Story</span>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 700, color: "#1a1a2e", margin: "12px 0 16px", lineHeight: 1.2 }}>Making Travel Between Islands Effortless</h2>
              <p style={{ color: "#6b7280", fontSize: 15, lineHeight: 1.8, margin: 0 }}>
                Cabkn was born from a simple idea: travel between Nevis and Saint Kitts should be as easy as booking a ride across town. 
                We built a platform that connects riders with trusted drivers, providing real-time tracking, transparent pricing, and 
                a seamless booking experience. Today, thousands of riders rely on Cabkn for their daily commute, airport transfers, 
                and island explorations.
              </p>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}>
                <Image src={CarBanner} alt="Cabkn service" style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* Values */}
      <SectionReveal>
        <div style={{ background: "#f8fafc", padding: "80px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={{ color: "#004a70", fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>Our Values</span>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, color: "#1a1a2e", margin: "12px 0 0" }}>What Sets Us Apart</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              {values.map((v, i) => (
                <div key={i}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: 28,
                    border: "1px solid rgba(0,0,0,0.04)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.04)"; }}
                >
                  <span style={{ fontSize: 32, display: "block", marginBottom: 12 }}>{v.icon}</span>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: "#1a1a2e", margin: "0 0 8px" }}>{v.title}</h3>
                  <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* CTA */}
      <SectionReveal>
        <div style={{ maxWidth: 800, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 12px" }}>Ready to Experience the Cabkn Difference?</h2>
          <p style={{ color: "#6b7280", fontSize: 15, maxWidth: 500, margin: "0 auto 24px", lineHeight: 1.7 }}>Join thousands of satisfied riders and enjoy the most reliable transportation service between Nevis and Saint Kitts.</p>
          <a href="/auth/stepOne" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", borderRadius: 9999, background: "#004a70", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(0,74,112,0.3)", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#003353"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,74,112,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#004a70"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,74,112,0.3)"; }}
          >
            Get Started
            <span style={{ fontSize: 18 }}>→</span>
          </a>
        </div>
      </SectionReveal>
    </div>
  );
}
