"use client";
import React, { useEffect, useState, useRef } from "react";
import { mainBanner } from "@/components/assets/Images";
import { FiClock, FiDollarSign, FiHeart, FiSmartphone, FiShield, FiHeadphones } from "react-icons/fi";

export default function Benefits() {
  const [mounted, setMounted] = useState(false);
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
    { value: "2x", label: "Faster than public transit", color: "#004a70" },
    { value: "30%", label: "Cheaper than traditional taxis", color: "#059669" },
    { value: "99%", label: "On-time arrival rate", color: "#2563eb" },
    { value: "4.9★", label: "Average rider satisfaction", color: "#d97706" },
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
          padding: "clamp(60px, 10vw, 100px) 0 clamp(50px, 8vw, 80px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: `url(${mainBanner.src})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 4vw, 24px)", textAlign: "center", position: "relative", zIndex: 1 }}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(12px, 1.2vw, 14px)", fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>Why Ride With Us</span>
          <h1 style={{ color: "#fff", fontSize: "clamp(1.8rem, 5vw, 3.5rem)", fontWeight: 700, margin: "16px 0 20px", lineHeight: 1.15, letterSpacing: "-0.5px" }}>
            Benefits of Using <span style={{ color: "#60a5fa" }}>Cabkn</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "clamp(0.9rem, 1.2vw, 1.15rem)", maxWidth: 640, margin: "0 auto", lineHeight: 1.7 }}>
            Discover why thousands of riders choose Cabkn for their daily commute and island travels.
          </p>
        </div>
      </section>

      {/* Highlights */}
      <section style={{ marginTop: -40, position: "relative", zIndex: 2, padding: "0 clamp(16px, 4vw, 24px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "clamp(10px, 1.5vw, 16px)" }}>
          {highlights.map((h, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "clamp(20px, 3vw, 24px) clamp(16px, 2vw, 20px)", textAlign: "center", boxShadow: "0 8px 30px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: "clamp(24px, 3.5vw, 32px)", fontWeight: 700, color: h.color, margin: 0 }}>{h.value}</h3>
              <p style={{ fontSize: "clamp(12px, 1.2vw, 13px)", color: "#6b7280", margin: "4px 0 0" }}>{h.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Grid */}
      <SectionReveal>
        <div style={{ maxWidth: 1200, margin: "clamp(40px, 8vw, 80px) auto", padding: "0 clamp(16px, 4vw, 24px)" }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(24px, 4vw, 48px)" }}>
            <span style={{ color: "#004a70", fontSize: "clamp(12px, 1.2vw, 13px)", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>Everything You Need</span>
            <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "#1a1a2e", margin: "12px 0 0" }}>The Cabkn Advantage</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "clamp(12px, 2vw, 20px)" }}>
            {benefits.map((b, i) => (
              <div key={i}
                className="flex flex-col items-start text-left"
                style={{
                  gap: 16,
                  background: "#fff",
                  borderRadius: 16,
                  padding: "clamp(20px, 3vw, 24px)",
                  border: "1px solid rgba(0,0,0,0.04)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "rgba(0,74,112,0.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.04)"; }}
              >
                <div style={{ width: 48, height: 48, minWidth: 48, borderRadius: 12, background: "#eef2f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#004a70", flexShrink: 0 }}>{b.icon}</div>
                <div>
                  <h3 style={{ fontSize: "clamp(15px, 1.3vw, 16px)", fontWeight: 600, color: "#1a1a2e", margin: "0 0 6px" }}>{b.title}</h3>
                  <p style={{ fontSize: "clamp(13px, 1.2vw, 14px)", color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* CTA */}
      <SectionReveal>
        <div style={{ maxWidth: 800, margin: "clamp(40px, 8vw, 80px) auto", padding: "0 clamp(16px, 4vw, 24px)", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 12px" }}>Start Enjoying These Benefits Today</h2>
          <p style={{ color: "#6b7280", fontSize: "clamp(14px, 1.2vw, 15px)", maxWidth: 500, margin: "0 auto 24px", lineHeight: 1.7 }}>Sign up now and experience the best way to travel between Nevis and Saint Kitts.</p>
          <a href="/auth/stepOne" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 32px", borderRadius: 9999, background: "#004a70", color: "#fff", fontSize: "clamp(14px, 1.2vw, 15px)", fontWeight: 600, textDecoration: "none", border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(0,74,112,0.3)", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#003353"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,74,112,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#004a70"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,74,112,0.3)"; }}
          >
            Create Your Account
            <span style={{ fontSize: 18 }}>→</span>
          </a>
        </div>
      </SectionReveal>
    </div>
  );
}
