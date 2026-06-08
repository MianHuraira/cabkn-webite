"use client";
import React, { useEffect, useState, useRef } from "react";
import { mainBanner } from "@/components/assets/Images";
import { FaStar, FaStarHalfAlt, FaRegStar, FaQuoteLeft } from "react-icons/fa";

export default function Testimonials() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Regular Commuter",
      avatar: null,
      rating: 5,
      text: "Cabkn has completely changed how I travel between Nevis and Saint Kitts. The drivers are always on time, professional, and the cars are spotless. I use it every day for work and have never been let down.",
    },
    {
      name: "Michael Thompson",
      role: "Business Traveler",
      avatar: null,
      rating: 5,
      text: "As a frequent business traveler, reliability is everything. Cabkn delivers every single time. The real-time tracking and transparent pricing give me peace of mind. Highly recommended.",
    },
    {
      name: "Emily Davis",
      role: "Tourist",
      avatar: null,
      rating: 4.5,
      text: "Discovered Cabkn during my vacation in St. Kitts and it made my trip so much easier. The drivers were friendly and gave great local tips. Will definitely use again on my next visit!",
    },
    {
      name: "James Williams",
      role: "University Student",
      avatar: null,
      rating: 5,
      text: "Affordable rides that actually show up on time! As a student, the fair pricing is a lifesaver. The app is super easy to use and I love being able to track my ride.",
    },
    {
      name: "Maria Garcia",
      role: "Healthcare Professional",
      avatar: null,
      rating: 5,
      text: "I work late shifts and Cabkn has been a godsend. The safety features like ride sharing and 24/7 support mean I always feel secure, no matter what time I need to travel.",
    },
    {
      name: "David Brown",
      role: "Tour Guide",
      avatar: null,
      rating: 4.5,
      text: "I recommend Cabkn to all my clients looking for reliable transportation. The service is consistent, the drivers know the islands well, and the booking process couldn't be simpler.",
    },
  ];

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push(<FaStar key={i} size={14} color="#f59e0b" />);
      else if (i === full && half) stars.push(<FaStarHalfAlt key={i} size={14} color="#f59e0b" />);
      else stars.push(<FaRegStar key={i} size={14} color="#d1d5db" />);
    }
    return stars;
  };

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
    <div className={mounted ? "animate-fade-in" : "opacity-0"} style={{ minHeight: "100vh", background: "#f8fafc" }}>
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
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(12px, 1.2vw, 14px)", fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>Rider Testimonials</span>
          <h1 style={{ color: "#fff", fontSize: "clamp(1.8rem, 5vw, 3.5rem)", fontWeight: 700, margin: "16px 0 20px", lineHeight: 1.15, letterSpacing: "-0.5px" }}>
            What Our <span style={{ color: "#60a5fa" }}>Riders</span> Say
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "clamp(0.9rem, 1.2vw, 1.15rem)", maxWidth: 640, margin: "0 auto", lineHeight: 1.7 }}>
            Real feedback from real riders. Here is why the community loves Cabkn.
          </p>
        </div>
      </section>

      {/* Rating Summary */}
      <section style={{ marginTop: -40, position: "relative", zIndex: 2, padding: "0 clamp(16px, 4vw, 24px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "clamp(24px, 3vw, 32px) clamp(24px, 4vw, 40px)", boxShadow: "0 8px 30px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "clamp(16px, 3vw, 20px)", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(36px, 5vw, 48px)", fontWeight: 700, color: "#1a1a2e", lineHeight: 1 }}>4.9</div>
                <div style={{ display: "flex", gap: 2, marginTop: 4, justifyContent: "center" }}>{renderStars(4.9)}</div>
                <div style={{ fontSize: "clamp(12px, 1vw, 13px)", color: "#6b7280", marginTop: 4 }}>Average Rating</div>
              </div>
              <div className="hidden md:block" style={{ width: 1, height: 60, background: "#e5e7eb" }} />
              <div>
                <div style={{ fontSize: "clamp(13px, 1.1vw, 14px)", color: "#6b7280", lineHeight: 1.6 }}>
                  Based on <strong style={{ color: "#1a1a2e" }}>2,500+</strong> verified reviews<br />
                  from riders across Nevis and Saint Kitts
                </div>
              </div>
            </div>
            <a href="/auth/stepOne" style={{ padding: "10px 24px", borderRadius: 9999, background: "#004a70", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", border: "none", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#003353"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#004a70"; }}
            >
              Book a Ride
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <SectionReveal>
        <div style={{ maxWidth: 1200, margin: "clamp(40px, 8vw, 80px) auto", padding: "0 clamp(16px, 4vw, 24px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "clamp(12px, 2vw, 20px)" }}>
            {testimonials.map((t, i) => (
              <div key={i}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "clamp(20px, 3vw, 28px)",
                  border: "1px solid rgba(0,0,0,0.04)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                  position: "relative",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.04)"; }}
              >
                <FaQuoteLeft size={18} color="#004a70" opacity={0.15} style={{ position: "absolute", top: 20, right: 20 }} />
                <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>{renderStars(t.rating)}</div>
                <p style={{ fontSize: "clamp(13px, 1.1vw, 14px)", color: "#6b7280", lineHeight: 1.8, margin: "0 0 16px", fontStyle: "italic" }}>&ldquo;{t.text}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid #f3f4f6", paddingTop: 16 }}>
                  <div style={{ width: 40, height: 40, minWidth: 40, borderRadius: "50%", background: "linear-gradient(135deg, #004a70, #60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 600, flexShrink: 0 }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: "clamp(14px, 1.2vw, 15px)", fontWeight: 600, color: "#1a1a2e" }}>{t.name}</div>
                    <div style={{ fontSize: "clamp(11px, 1vw, 12px)", color: "#9ca3af" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* CTA */}
      <SectionReveal>
        <div style={{ background: "linear-gradient(135deg, #004a70 0%, #002d47 100%)", padding: "clamp(40px, 6vw, 60px) clamp(16px, 4vw, 24px)", textAlign: "center" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ color: "#fff", fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)", fontWeight: 700, margin: "0 0 12px" }}>Ready to Become Our Next Happy Rider?</h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "clamp(14px, 1.2vw, 15px)", margin: "0 auto 24px", lineHeight: 1.7 }}>Sign up today and experience the Cabkn difference for yourself.</p>
            <a href="/auth/stepOne" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 32px", borderRadius: 9999, background: "#fff", color: "#004a70", fontSize: "clamp(14px, 1.2vw, 15px)", fontWeight: 600, textDecoration: "none", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f0f4f8"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = ""; }}
            >
              Get Started Today
              <span style={{ fontSize: 18 }}>→</span>
            </a>
          </div>
        </div>
      </SectionReveal>
    </div>
  );
}
