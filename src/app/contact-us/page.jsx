"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { message } from "antd";
import { Heroimg } from "@/components/assets/Images";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { LuPhoneCall, LuMail, LuMapPin } from "react-icons/lu";
import { FiArrowRight, FiSend, FiMessageCircle, FiClock, FiShield, FiExternalLink, FiCheckCircle } from "react-icons/fi";
import CustomButton from "../../components/CustomButton";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  "pk.eyJ1IjoibWFybGVncmFudCIsImEiOiJjbTgwdmV0MjkweXB2MnFzNXBjM2x6NThnIn0.3oz3YGaDHiFDh8W5ALk09w";

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
  const [phoneFocused, setPhoneFocused] = useState(false);
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
    <div className="bg-white text-slate-800 rounded-3xl !p-6 md:!p-8 !border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden flex flex-col justify-between h-full min-h-[580px]">
      {/* Decorative Blob */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-650 flex items-center justify-center border border-brand-100">
            <FiSend size={18} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-family-semibold text-slate-900 m-0">Send Us a Message</h2>
            <p className="text-xs text-slate-400 font-family-regular mt-0.5">We typically respond within 24 hours</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div className="space-y-1.5">
              <label htmlFor="name" className="inline-block w-fit text-[13px] font-family-semibold text-slate-700 select-none pl-0.5 cursor-pointer">Name *</label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <input
                    id="name"
                    {...field}
                    placeholder="Your name"
                    aria-invalid={Boolean(errors.name)}
                    className={`input-field ${errors.name ? "!border-rose-400 !focus:border-rose-500 !focus:ring-rose-500/20" : ""}`}
                  />
                )}
              />
              {errors.name && <p className="text-[11px] text-rose-500 font-family-medium mt-0.5 pl-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="inline-block w-fit text-[13px] font-family-semibold text-slate-700 select-none pl-0.5 cursor-pointer">Email *</label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <input
                    id="email"
                    {...field}
                    placeholder="Your email"
                    aria-invalid={Boolean(errors.email)}
                    className={`input-field ${errors.email ? "!border-rose-400 !focus:border-rose-500 !focus:ring-rose-500/20" : ""}`}
                  />
                )}
              />
              {errors.email && <p className="text-[11px] text-rose-500 font-family-medium mt-0.5 pl-1">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
              <label htmlFor="phone" className="inline-block w-fit text-[13px] font-family-semibold text-slate-700 select-none pl-0.5 cursor-pointer">Phone Number *</label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    country={"us"}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    onBlur={field.onBlur}
                    onFocus={() => setPhoneFocused(true)}
                    inputClass="!w-full !rounded-xl !bg-white !text-gray-900"
                    buttonClass="!rounded-l-xl !bg-white !border-0"
                    inputStyle={{
                      width: "100%",
                      paddingLeft: "48px",
                      paddingRight: "14px",
                      borderRadius: "12px",
                      border: errors.phone
                        ? "1px solid #fb7185"
                        : phoneFocused
                          ? "1px solid #004a70"
                          : "1px solid #e5e7eb",
                      boxShadow: errors.phone
                        ? "0 0 0 2px rgba(244, 63, 94, 0.2)"
                        : phoneFocused
                          ? "0 0 0 2px rgba(0, 74, 112, 0.2)"
                          : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                      fontSize: "13.5px",
                      fontFamily: "var(--font-poppins-local), 'Inter', sans-serif",
                      color: "#111827",
                      outline: "none",
                      background: "#ffffff",
                      height: "42px",
                      transition: "all 0.2s ease-in-out",
                    }}
                    buttonStyle={{
                      border: "none",
                      background: "#ffffff",
                      borderRadius: "12px 0 0 12px",
                      paddingLeft: "10px",
                    }}
                    dropdownStyle={{
                      borderRadius: "12px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                      fontFamily: "var(--font-poppins-local), 'Inter', sans-serif",
                      fontSize: "13px",
                    }}
                    placeholder="Enter your phone number"
                  />
                )}
              />
              {errors.phone && <p className="text-[11px] text-rose-500 font-family-medium mt-0.5 pl-1">{errors.phone.message}</p>}
            </div>

          <div className="space-y-1.5">
              <label htmlFor="message" className="inline-block w-fit text-[13px] font-family-semibold text-slate-700 select-none pl-0.5 cursor-pointer">Message *</label>
              <Controller
                name="message"
                control={control}
                render={({ field }) => (
                  <textarea
                    id="message"
                    {...field}
                    rows={4}
                    placeholder="Write your message..."
                    aria-invalid={Boolean(errors.message)}
                    className={`input-field !min-h-[110px] ${errors.message ? "!border-rose-400 !focus:border-rose-500 !focus:ring-rose-500/20" : ""}`}
                  />
                )}
              />
              {errors.message && <p className="text-[11px] text-rose-500 font-family-medium mt-0.5 pl-1">{errors.message.message}</p>}
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
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const basseterreCoords = [-62.7238, 17.2965];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: basseterreCoords,
      zoom: 13,
      cooperativeGestures: true,
    });

    mapRef.current = map;

    // Add navigation controls (zoom in/out, compass)
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: true }),
      "top-right"
    );

    // Custom Marker Element for Cabkn Headquarters
    const markerEl = document.createElement("div");
    markerEl.className = "cabkn-map-marker";
    markerEl.style.position = "relative";
    markerEl.style.width = "40px";
    markerEl.style.height = "40px";
    markerEl.style.cursor = "pointer";
    markerEl.style.display = "flex";
    markerEl.style.alignItems = "center";
    markerEl.style.justifyContent = "center";

    // Pulsing outer ripple
    const ripple = document.createElement("div");
    ripple.style.position = "absolute";
    ripple.style.width = "100%";
    ripple.style.height = "100%";
    ripple.style.borderRadius = "50%";
    ripple.style.backgroundColor = "rgba(0, 74, 112, 0.25)";
    ripple.style.animation = "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite";
    markerEl.appendChild(ripple);

    // Inner pin badge
    const pin = document.createElement("div");
    pin.style.position = "relative";
    pin.style.width = "34px";
    pin.style.height = "34px";
    pin.style.borderRadius = "50%";
    pin.style.backgroundColor = "#004a70";
    pin.style.border = "2.5px solid #ffffff";
    pin.style.boxShadow = "0 4px 12px rgba(0, 74, 112, 0.4)";
    pin.style.display = "flex";
    pin.style.alignItems = "center";
    pin.style.justifyContent = "center";
    pin.style.color = "#ffffff";
    pin.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    `;
    markerEl.appendChild(pin);

    // Popup with Cabkn Headquarters info
    const popup = new mapboxgl.Popup({
      offset: 24,
      closeButton: false,
      className: "cabkn-map-popup",
    }).setHTML(`
      <div style="font-family: inherit; padding: 4px 2px; min-width: 170px;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
          <strong style="color: #004a70; font-size: 13px; font-weight: 700;">Cabkn HQ</strong>
        </div>
        <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.35;">
          Basseterre, Saint Kitts &amp; Nevis
        </p>
        <div style="margin-top: 6px; font-size: 10px; color: #004a70; font-weight: 600; background: rgba(0, 74, 112, 0.08); padding: 2px 7px; border-radius: 6px; display: inline-block;">
          24/7 Operations
        </div>
      </div>
    `);

    const marker = new mapboxgl.Marker({
      element: markerEl,
      anchor: "center",
    })
      .setLngLat(basseterreCoords)
      .setPopup(popup)
      .addTo(map);

    map.on("load", () => {
      marker.togglePopup();
      map.resize();
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-slate-100 h-full min-h-[450px] lg:min-h-full relative">
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px]" />
      <div className="absolute bottom-4 left-4 max-w-[270px] bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl p-2.5 shadow-lg flex items-center gap-2.5 z-10">
        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
          <LuMapPin size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-family-semibold text-slate-900 m-0 leading-tight">Headquarters</p>
          <p className="text-[10px] text-slate-500 m-0 mt-0.5 leading-tight truncate">Basseterre, Saint Kitts</p>
        </div>
        <a 
          href="https://maps.google.com/?q=Basseterre,+Saint+Kitts+and+Nevis" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors flex-shrink-0"
          title="Get Directions"
        >
          <FiExternalLink size={12} />
        </a>
      </div>
    </div>
  );
});

export default function ContactUs() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className={`min-h-screen bg-slate-50/50 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      {/* ===== HERO ===== */}
      <section
        className={`relative min-h-screen select-none flex items-center overflow-hidden pt-20 pb-20 md:pt-24 md:pb-28 ${mounted ? "animate-fade-in" : "opacity-0"}`}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 pointer-events-none bg-cover bg-no-repeat bg-[85%_center] md:bg-center"
          style={{
            backgroundImage: `url(${Heroimg.src})`,
          }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col gap-3">
            <div
              className={`inline-flex items-center gap-2 text-brand-300 text-[11px] sm:text-xs uppercase tracking-[0.15em] font-family-semibold w-fit ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "100ms" }}
            >
              24/7 Active Support
            </div>

            <h1
              className={`text-white font-family-medium leading-[1.2] tracking-tight m-0 text-[clamp(2rem,5vw,3.5rem)] sm:text-[clamp(2.25rem,6vw,3rem)] ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "200ms" }}
            >
              Get in touch with{" "}
              <span className="font-family-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
                Us
              </span>
            </h1>

            <div
              className={`flex gap-6 mt-4 flex-wrap ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "300ms" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#004a70] flex items-center justify-center">
                  <FiCheckCircle size={12} color="#fff" />
                </div>
                <span className="text-white/80 font-family-regular text-sm">
                  24/7 support team
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#004a70] flex items-center justify-center">
                  <FiCheckCircle size={12} color="#fff" />
                </div>
                <span className="text-white/80 font-family-regular text-sm">
                  Live response under 24h
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#004a70] flex items-center justify-center">
                  <FiCheckCircle size={12} color="#fff" />
                </div>
                <span className="text-white/80 font-family-regular text-sm">
                  Secure contact form
                </span>
              </div>
            </div>

            <div
              className={`flex flex-wrap gap-4 mt-4 ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "400ms" }}
            >
              <CustomButton
                onClick={() => router.push('/auth/stepOne')}
                variant="primary"
                size="lg"
                endContent={
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                }
                className="group !bg-green-500 !border-0 !shadow-lg !shadow-black/20 font-family-semibold text-base"
              >
                Get Started
              </CustomButton>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT INFO CARDS ===== */}
      <section className="max-w-7xl mx-auto pt-14 md:pt-20 px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <SectionReveal>
            <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 !border !border-brand-100 text-brand-700 text-[11px] sm:text-xs font-family-semibold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                Reach Us
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-family-semibold text-slate-800 mt-4 tracking-tight leading-tight">
                We're Here to{" "}
                <span className="text-brand-600">Help You</span>
              </h2>
              <p className="text-slate-500 text-sm sm:text-[15px] mt-3 font-family-regular leading-relaxed">
                Reach out through any of the channels below — our team is always ready to assist.
              </p>
            </div>
          </SectionReveal>

          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
            {contactInfo.map((info, i) => (
              <div
                key={i}
                className={`group relative bg-white rounded-3xl p-6 sm:p-7 !border !border-slate-100 shadow-[0_10px_36px_rgba(0,0,0,0.03)] hover:shadow-[0_24px_60px_rgba(0,74,112,0.12)] hover:-translate-y-2 hover:!border-brand-200 transition-all duration-500 h-full flex flex-col justify-between relative overflow-hidden ${mounted ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${250 + i * 100}ms` }}
              >
                <div className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br ${info.gradient} opacity-[0.08] rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none`} />

                <div className="flex-grow">
                  <div className={`w-12 h-12 rounded-2xl ${info.bg} ${info.color} flex items-center justify-center mb-3 !border !border-slate-100/55 shadow-inner group-hover:bg-brand-600 group-hover:text-white group-hover:!border-brand-600 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                    {info.icon}
                  </div>
                  <h3 className="text-[15px] sm:text-[17px] font-family-semibold text-slate-800 mb-2">{info.title}</h3>
                  {info.details.map((d, j) => (
                    <p key={j} className="text-xs sm:text-sm text-slate-500 leading-relaxed font-family-regular m-2">{d}</p>
                  ))}
                </div>

                <div className="mt-auto pt-2 !border-t !border-slate-100 flex items-center justify-between text-xs text-brand-650 font-family-semibold group-hover:text-brand-700 transition-colors">
                  <a href={info.link} className="flex items-center gap-1.5">
                    {info.linkText}
                  </a>
                  <span className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-brand-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-all duration-300">
                    <FiArrowRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
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
