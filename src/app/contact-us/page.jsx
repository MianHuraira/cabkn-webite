"use client";
import React, { useEffect, useState, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { message } from "antd";
import { mainBanner } from "@/components/assets/Images";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { LuPhoneCall, LuMail, LuMapPin } from "react-icons/lu";
import { FiArrowRight, FiSend, FiMessageCircle, FiClock, FiShield, FiExternalLink } from "react-icons/fi";
import CustomButton from "../../components/CustomButton";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  message: yup.string().required("Message is required").min(10, "Message must be at least 10 characters"),
});

const contactInfo = [
  {
    icon: <LuPhoneCall size={22} />,
    title: "Phone Support",
    details: ["+1 (869) 123-4567", "+1 (869) 765-4321"],
    link: "tel:+18691234567",
    linkText: "Call Now",
    gradient: "from-brand-600 to-brand-400",
    bg: "bg-brand-50",
    color: "text-brand-600",
  },
  {
    icon: <LuMail size={22} />,
    title: "Email Inquiry",
    details: ["info@cabkn.com", "support@cabkn.com"],
    link: "mailto:info@cabkn.com",
    linkText: "Send Email",
    gradient: "from-violet-600 to-purple-400",
    bg: "bg-violet-50",
    color: "text-violet-600",
  },
  {
    icon: <LuMapPin size={22} />,
    title: "Office Location",
    details: ["Basseterre, Saint Kitts", "Charlestown, Nevis"],
    link: "https://maps.google.com/?q=Basseterre,+Saint+Kitts+and+Nevis",
    linkText: "Get Directions",
    gradient: "from-emerald-600 to-teal-400",
    bg: "bg-emerald-50",
    color: "text-emerald-600",
  },
];

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
      const body = { name: data.name, email: data.email, phone: data.phone, message: data.message };
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
    <div className="bg-white text-slate-800 rounded-3xl p-6 md:p-8 lg:p-10 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden flex flex-col justify-between h-full min-h-[580px]">
      {/* Decorative Blob */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-650 flex items-center justify-center border border-brand-100">
            <FiSend size={18} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-family-bold text-slate-900 m-0">Send Us a Message</h2>
            <p className="text-xs text-slate-400 font-family-regular mt-0.5">We typically respond within 24 hours</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div>
              <div className={`rounded-xl border p-3.5 transition-all duration-300 ${
                errors.name 
                  ? 'border-red-400 bg-red-50/10 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100' 
                  : 'border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10'
              }`}>
                <label className="block text-[10px] font-family-semibold uppercase tracking-wider text-slate-400 mb-1">Name *</label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      placeholder="Your name"
                      className="w-full bg-transparent text-sm text-slate-800 outline-none border-none p-0 focus:ring-0 placeholder-slate-400"
                    />
                  )}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1.5 ml-1 font-family-regular">{errors.name.message}</p>}
            </div>

            <div>
              <div className={`rounded-xl border p-3.5 transition-all duration-300 ${
                errors.email 
                  ? 'border-red-400 bg-red-50/10 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100' 
                  : 'border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10'
              }`}>
                <label className="block text-[10px] font-family-semibold uppercase tracking-wider text-slate-400 mb-1">Email *</label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      placeholder="Your email"
                      className="w-full bg-transparent text-sm text-slate-800 outline-none border-none p-0 focus:ring-0 placeholder-slate-400"
                    />
                  )}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-1 font-family-regular">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <div className={`rounded-xl border p-3.5 transition-all duration-300 ${
              errors.phone 
                ? 'border-red-400 bg-red-50/10 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100' 
                : 'border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10'
            }`}>
              <label className="block text-[10px] font-family-semibold uppercase tracking-wider text-slate-400 mb-1">Phone Number *</label>
              
              <style>{`
                .react-tel-input {
                  display: flex !important;
                  align-items: center !important;
                  height: 24px !important;
                }
                .react-tel-input .form-control {
                  height: 24px !important;
                  line-height: 24px !important;
                  padding-top: 0 !important;
                  padding-bottom: 0 !important;
                  margin-top: 0 !important;
                  margin-bottom: 0 !important;
                }
                .react-tel-input .flag-dropdown {
                  height: 24px !important;
                  top: 50% !important;
                  transform: translateY(-50%) !important;
                  border: none !important;
                  background: transparent !important;
                }
                .react-tel-input .selected-flag {
                  height: 24px !important;
                  padding: 0 !important;
                  background: transparent !important;
                }
              `}</style>

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
                      width: "100%",
                      padding: "0px 0px 0px 42px",
                      borderRadius: "0",
                      border: "none",
                      fontSize: "0.875rem",
                      outline: "none",
                      background: "transparent",
                      height: "24px",
                      lineHeight: "24px",
                      color: "#1e293b",
                      fontFamily: "inherit",
                    }}
                    buttonStyle={{
                      border: "none",
                      background: "transparent",
                      borderRadius: "0",
                      paddingLeft: "0",
                      height: "24px",
                      minWidth: "auto",
                    }}
                    dropdownStyle={{ borderRadius: "0.75rem", color: "#333" }}
                  />
                )}
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1.5 ml-1 font-family-regular">{errors.phone.message}</p>}
          </div>

          <div>
            <div className={`rounded-xl border p-3.5 transition-all duration-300 ${
              errors.message 
                ? 'border-red-400 bg-red-50/10 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100' 
                : 'border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10'
            }`}>
              <label className="block text-[10px] font-family-semibold uppercase tracking-wider text-slate-400 mb-1">Message *</label>
              <Controller
                name="message"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    placeholder="Write your message..."
                    className="w-full bg-transparent text-sm text-slate-850 outline-none border-none p-0 focus:ring-0 placeholder-slate-400 resize-none h-[110px]"
                  />
                )}
              />
            </div>
            {errors.message && <p className="text-red-500 text-xs mt-1.5 ml-1 font-family-regular">{errors.message.message}</p>}
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-8">
        <CustomButton
          type="button"
          loading={loading}
          onClick={() => handleSubmit(onSubmit)()}
          variant="primary"
          size="lg"
          className="w-full font-family-semibold shadow-lg shadow-brand-600/25 bg-gradient-to-r from-brand-600 to-brand-700 border-none hover:from-brand-700 hover:to-brand-800 hover:shadow-brand-600/35 hover:!-translate-y-0.5 active:!translate-y-0"
          endContent={!loading && <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />}
        >
          {loading ? "Sending..." : "Send Message"}
        </CustomButton>
        
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 px-1">
          <span className="flex items-center gap-1"><FiClock size={12} /> Live response: &lt; 24h</span>
          <span className="flex items-center gap-1"><FiShield size={12} /> Secure encryption</span>
        </div>
      </div>
    </div>
  );
}

const MemoizedMap = React.memo(function MapSection() {
  return (
    <div className="rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-slate-100 h-full min-h-[450px] lg:min-h-full relative">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387555.5496957033!2d-62.84503236205066!3d17.25410677905199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c0e8b2e1d3b2f8b%3A0x2e8e8e8e8e8e8e8e!2sSaint%20Kitts%20and%20Nevis!5e0!3m2!1sen!2s!4v1"
        width="100%"
        height="100%"
        className="border-0 block w-full h-full min-h-[450px]"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Cabkn Location"
      />
      <div className="absolute bottom-4 left-4 max-w-[260px] bg-white/95 backdrop-blur-md border border-slate-200/50 rounded-xl p-2.5 shadow-lg flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
          <LuMapPin size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-family-bold text-slate-900 m-0 leading-tight">Headquarters</p>
          <p className="text-[10px] text-slate-500 m-0 mt-0.5 leading-tight truncate">Basseterre, Saint Kitts</p>
        </div>
        <a 
          href="https://maps.google.com/?q=Basseterre,+Saint+Kitts+and+Nevis" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors flex-shrink-0"
        >
          <FiExternalLink size={12} />
        </a>
      </div>
    </div>
  );
});

export default function ContactUs() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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
            <span>24/7 Active Support</span>
          </div>
          <h1 className={`text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-family-bold mt-4 mb-6 leading-[1.1] tracking-tight ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "300ms" }}>
            Contact{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
              Us
            </span>
          </h1>
          <p className={`text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-family-regular ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "400ms" }}>
            Have a question, feedback, or need assistance? Connect with our dedicated support agents or send us a message below.
          </p>
        </div>
      </section>

      {/* ===== CONTACT INFO CARDS ===== */}
      <section className="relative z-20 px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {contactInfo.map((info, i) => (
            <div
              key={i}
              className={`group relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_20px_40px_rgba(0,74,112,0.08)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden ${mounted ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${250 + i * 100}ms` }}
            >
              {/* Radial glow background on hover */}
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-brand-500/10 to-indigo-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
              
              <div className={`relative inline-flex w-14 h-14 rounded-2xl bg-slate-50 text-slate-800 items-center justify-center mb-5 border border-slate-100 shadow-inner group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300`} style={{ width: 56, height: 56 }}>
                {info.icon}
              </div>
              <h3 className="text-lg font-family-semibold text-slate-900 mb-2">{info.title}</h3>
              {info.details.map((d, j) => (
                <p key={j} className="text-sm text-slate-500 leading-relaxed m-0 font-family-regular">{d}</p>
              ))}
              
              <div className="mt-5">
                <a
                  href={info.link}
                  className="inline-flex items-center gap-1.5 text-xs text-brand-600 font-family-semibold hover:text-brand-700 transition-colors"
                >
                  {info.linkText}
                  <FiArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FORM + MAP ===== */}
      <SectionReveal>
        <section className="max-w-7xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <ContactForm />
            <MemoizedMap />
          </div>
        </section>
      </SectionReveal>
    </div>
  );
}
