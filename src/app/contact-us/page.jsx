"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Spinner } from "reactstrap";
import { message } from "antd";
import { mainBanner } from "@/components/assets/Images";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { LuPhoneCall } from "react-icons/lu";
import { GrLocation } from "react-icons/gr";
import { MdEmail } from "react-icons/md";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  message: yup.string().required("Message is required").min(10, "Message must be at least 10 characters"),
});

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

function ContactForm() {
  const [loading, setLoading] = useState(false);
  const { postData, header3 } = ApiFunction();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const body = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
      };
      const res = await postData("users/contact", body, header3);
      if (res?.success) {
        message.success(res?.message || "Message sent successfully!");
        reset({ name: "", email: "", phone: "", message: "" });
      } else {
        message.error(res?.message || "Something went wrong");
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#f8fafc", borderRadius: 20, padding: "clamp(24px, 4vw, 36px)", border: "1px solid rgba(0,0,0,0.04)" }}>
      <h2 style={{ fontSize: "clamp(18px, 2vw, 22px)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>Send Us a Message</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "clamp(12px, 1vw, 13px)", fontWeight: 500, color: "#374151", marginBottom: 6 }}>Name *</label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Your name"
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: errors.name ? "1px solid #ef4444" : "1px solid #e5e7eb",
                    fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "inherit",
                  }}
                />
              )}
            />
            {errors.name && <p style={{ color: "#ef4444", fontSize: 12, margin: "4px 0 0" }}>{errors.name.message}</p>}
          </div>
          <div>
            <label style={{ display: "block", fontSize: "clamp(12px, 1vw, 13px)", fontWeight: 500, color: "#374151", marginBottom: 6 }}>Email *</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Your email"
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: errors.email ? "1px solid #ef4444" : "1px solid #e5e7eb",
                    fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "inherit",
                  }}
                />
              )}
            />
            {errors.email && <p style={{ color: "#ef4444", fontSize: 12, margin: "4px 0 0" }}>{errors.email.message}</p>}
          </div>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "clamp(12px, 1vw, 13px)", fontWeight: 500, color: "#374151", marginBottom: 6 }}>Phone Number *</label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                country={"us"}
                value={field.value}
                onChange={(value) => field.onChange(value)}
                onBlur={field.onBlur}
                inputStyle={{
                  width: "100%", padding: "10px 14px 10px 48px", borderRadius: 10,
                  border: errors.phone ? "1px solid #ef4444" : "1px solid #e5e7eb",
                  fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "inherit", height: "auto",
                }}
                buttonStyle={{
                  border: "none", background: "transparent", borderRadius: "10px 0 0 10px",
                }}
                dropdownStyle={{
                  borderRadius: 10,
                }}
              />
            )}
          />
          {errors.phone && <p style={{ color: "#ef4444", fontSize: 12, margin: "4px 0 0" }}>{errors.phone.message}</p>}
        </div>
        <div>
          <label style={{ display: "block", fontSize: "clamp(12px, 1vw, 13px)", fontWeight: 500, color: "#374151", marginBottom: 6 }}>Message *</label>
          <Controller
            name="message"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={4}
                placeholder="Write your message..."
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10,
                  border: errors.message ? "1px solid #ef4444" : "1px solid #e5e7eb",
                  fontSize: 14, outline: "none", background: "#fff", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
            )}
          />
          {errors.message && <p style={{ color: "#ef4444", fontSize: 12, margin: "4px 0 0" }}>{errors.message.message}</p>}
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSubmit(onSubmit)()}
          style={{
            width: "100%", padding: "12px 28px", borderRadius: 9999, background: loading ? "#6b7280" : "#004a70",
            color: "#fff", fontSize: "clamp(14px, 1.2vw, 15px)", fontWeight: 600,
            border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {loading && (
            <span style={{ display: "inline-flex" }}>
              <Spinner size="sm" style={{ color: "#fff" }} />
            </span>
          )}
          {loading ? "Sending..." : "Send Message"}
        </button>
      </div>
    </div>
  );
}

const MemoizedMap = React.memo(function MapSection() {
  return (
    <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)", height: "100%", minHeight: 350 }}>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387555.5496957033!2d-62.84503236205066!3d17.25410677905199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c0e8b2e1d3b2f8b%3A0x2e8e8e8e8e8e8e8e!2sSaint%20Kitts%20and%20Nevis!5e0!3m2!1sen!2s!4v1"
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: 350, display: "block" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Cabkn Location"
      />
    </div>
  );
});

export default function ContactUs() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className={mounted ? "animate-fade-in" : "opacity-0"} style={{ minHeight: "100vh", background: "#fff" }}>
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

      {useMemo(() => (
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
      ), [])}

      <SectionReveal>
        <div style={{ maxWidth: 1200, margin: "clamp(40px, 8vw, 80px) auto", padding: "0 clamp(16px, 4vw, 24px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(20px, 3vw, 40px)", alignItems: "stretch" }}>
            <ContactForm />
            <MemoizedMap />
          </div>
        </div>
      </SectionReveal>
    </div>
  );
}
