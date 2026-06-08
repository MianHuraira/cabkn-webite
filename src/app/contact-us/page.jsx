"use client";
import React, { useEffect, useState, useRef } from "react";
import { mainBanner } from "@/components/assets/Images";
import { LuPhoneCall } from "react-icons/lu";
import { GrLocation } from "react-icons/gr";
import { MdEmail } from "react-icons/md";

export default function ContactUs() {
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  useEffect(() => { setMounted(true); }, []);

  const contactInfo = [
    {
      icon: <LuPhoneCall size={22} />,
      title: "Phone",
      details: ["+1 (869) 123-4567", "+1 (869) 765-4321"],
    },
    {
      icon: <MdEmail size={22} />,
      title: "Email",
      details: ["info@cabkn.com", "support@cabkn.com"],
    },
    {
      icon: <GrLocation size={22} />,
      title: "Address",
      details: ["Basseterre, Saint Kitts", "Charlestown, Nevis"],
    },
  ];

  const faqs = [
    { q: "How do I book a ride?", a: "Simply create an account, enter your pickup and drop-off locations, choose your ride, and confirm. Your driver will be on the way!" },
    { q: "Is my payment information secure?", a: "Absolutely. We use industry-standard encryption and never store your full payment details on our servers." },
    { q: "Can I cancel a ride?", a: "Yes, you can cancel your ride at any time. Cancellation fees may apply depending on how close the driver is to your pickup location." },
    { q: "What areas do you serve?", a: "We currently operate across Saint Kitts and Nevis, covering all major towns, hotels, and airports on both islands." },
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
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(12px, 1.2vw, 14px)", fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>Get In Touch</span>
          <h1 style={{ color: "#fff", fontSize: "clamp(1.8rem, 5vw, 3.5rem)", fontWeight: 700, margin: "16px 0 20px", lineHeight: 1.15, letterSpacing: "-0.5px" }}>
            Contact <span style={{ color: "#60a5fa" }}>Us</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "clamp(0.9rem, 1.2vw, 1.15rem)", maxWidth: 640, margin: "0 auto", lineHeight: 1.7 }}>
            Have a question, feedback, or need assistance? We would love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section style={{ marginTop: -40, position: "relative", zIndex: 2, padding: "0 clamp(16px, 4vw, 24px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "clamp(10px, 1.5vw, 16px)" }}>
          {contactInfo.map((info, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "clamp(24px, 3vw, 28px) clamp(20px, 3vw, 24px)", textAlign: "center", boxShadow: "0 8px 30px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "#eef2f6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#004a70" }}>{info.icon}</div>
              <h3 style={{ fontSize: "clamp(15px, 1.3vw, 16px)", fontWeight: 600, color: "#1a1a2e", margin: "0 0 8px" }}>{info.title}</h3>
              {info.details.map((d, j) => (
                <p key={j} style={{ fontSize: "clamp(13px, 1.1vw, 14px)", color: "#6b7280", margin: 0, lineHeight: 1.8 }}>{d}</p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Form + Map */}
      <SectionReveal>
        <div style={{ maxWidth: 1200, margin: "clamp(40px, 8vw, 80px) auto", padding: "0 clamp(16px, 4vw, 24px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(20px, 3vw, 40px)", alignItems: "start" }}>
            {/* Form */}
            <div style={{ background: "#f8fafc", borderRadius: 20, padding: "clamp(24px, 4vw, 36px)", border: "1px solid rgba(0,0,0,0.04)" }}>
              <h2 style={{ fontSize: "clamp(18px, 2vw, 22px)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>Send Us a Message</h2>
              <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "clamp(12px, 1vw, 13px)", fontWeight: 500, color: "#374151", marginBottom: 6 }}>Name *</label>
                    <input type="text" placeholder="Your name" style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "clamp(12px, 1vw, 13px)", fontWeight: 500, color: "#374151", marginBottom: 6 }}>Email</label>
                    <input type="email" placeholder="Your email" style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "clamp(12px, 1vw, 13px)", fontWeight: 500, color: "#374151", marginBottom: 6 }}>Phone Number *</label>
                  <input type="tel" placeholder="Your phone number" style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "clamp(12px, 1vw, 13px)", fontWeight: 500, color: "#374151", marginBottom: 6 }}>Message</label>
                  <textarea rows={4} placeholder="Write your message..." style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, outline: "none", background: "#fff", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>
                <button type="submit" style={{ padding: "12px 28px", borderRadius: 9999, background: "#004a70", color: "#fff", fontSize: "clamp(14px, 1.2vw, 15px)", fontWeight: 600, border: "none", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#003353"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#004a70"; }}
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Map */}
            <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)", height: "100%", minHeight: 300 }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387555.5496957033!2d-62.84503236205066!3d17.25410677905199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c0e8b2e1d3b2f8b%3A0x2e8e8e8e8e8e8e8e!2sSaint%20Kitts%20and%20Nevis!5e0!3m2!1sen!2s!4v1"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: 300 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Cabkn Location"
              />
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* FAQ */}
      {/* <SectionReveal>
        <div style={{ background: "#f8fafc", padding: "clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px)" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "clamp(24px, 4vw, 48px)" }}>
              <span style={{ color: "#004a70", fontSize: "clamp(12px, 1.2vw, 13px)", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>FAQ</span>
              <h2 style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", fontWeight: 700, color: "#1a1a2e", margin: "12px 0 0" }}>Frequently Asked Questions</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.04)", overflow: "hidden" }}>
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      style={{ width: "100%", padding: "clamp(14px, 2vw, 16px) clamp(16px, 2vw, 20px)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "inherit", fontSize: "clamp(14px, 1.2vw, 15px)", fontWeight: 500, color: "#1a1a2e", textAlign: "left" }}
                    >
                      {faq.q}
                      <span style={{ fontSize: 18, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "", flexShrink: 0, marginLeft: 8 }}>▾</span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 clamp(16px, 2vw, 20px) clamp(14px, 2vw, 16px)", fontSize: "clamp(13px, 1.1vw, 14px)", color: "#6b7280", lineHeight: 1.7 }}>{faq.a}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SectionReveal> */}
    </div>
  );
}
