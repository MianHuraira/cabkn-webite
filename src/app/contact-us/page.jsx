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
    <div ref={ref} className={`transition-all duration-700 transform ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`} style={{ transitionDelay: `${delay}ms` }}>
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
    <div className="bg-slate-50 rounded-2xl p-6 md:p-8 lg:p-10 border border-slate-100">
      <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">Send Us a Message</h2>
      <div className="flex flex-col gap-4 md:gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div>
            <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1.5">Name *</label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Your name"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'} text-sm outline-none bg-white transition-all focus:ring-4`}
                />
              )}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1.5">Email *</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Your email"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'} text-sm outline-none bg-white transition-all focus:ring-4`}
                />
              )}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1.5">Phone Number *</label>
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
                  width: "100%", padding: "12px 16px 12px 48px", borderRadius: "0.75rem",
                  border: errors.phone ? "1px solid #ef4444" : "1px solid #e2e8f0",
                  fontSize: "0.875rem", outline: "none", background: "#fff", height: "auto",
                }}
                buttonStyle={{
                  border: "none", background: "transparent", borderRadius: "0.75rem 0 0 0.75rem", paddingLeft: "8px"
                }}
                dropdownStyle={{
                  borderRadius: "0.75rem",
                }}
              />
            )}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1.5">Message *</label>
          <Controller
            name="message"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={5}
                placeholder="Write your message..."
                className={`w-full px-4 py-3 rounded-xl border ${errors.message ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'} text-sm outline-none bg-white resize-y transition-all focus:ring-4`}
              />
            )}
          />
          {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
        </div>
        <CustomButton
          type="button"
          loading={loading}
          onClick={() => handleSubmit(onSubmit)()}
          variant="primary"
          size="lg"
          className="w-full mt-2"
        >
          {loading ? "Sending..." : "Send Message"}
        </CustomButton>
      </div>
    </div>
  );
}

const MemoizedMap = React.memo(function MapSection() {
  return (
    <div className="rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 h-full min-h-[350px] lg:min-h-full">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387555.5496957033!2d-62.84503236205066!3d17.25410677905199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c0e8b2e1d3b2f8b%3A0x2e8e8e8e8e8e8e8e!2sSaint%20Kitts%20and%20Nevis!5e0!3m2!1sen!2s!4v1"
        width="100%"
        height="100%"
        className="border-0 min-h-[350px] block"
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
    <div className={`min-h-screen bg-white ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 to-brand-950 pt-24 pb-20 md:pt-32 md:pb-28">
        <div 
          className="absolute inset-0 opacity-5 bg-cover bg-center" 
          style={{ backgroundImage: `url(${mainBanner.src})` }} 
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-white/60 text-xs sm:text-sm font-semibold tracking-widest uppercase">Get In Touch</span>
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mt-4 mb-5 leading-tight tracking-tight">
            Contact <span className="!text-brand-400">Us</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Have a question, feedback, or need assistance? We would love to hear from you.
          </p>
        </div>
      </section>

      {useMemo(() => (
        <section className="relative z-20 px-4 sm:px-6 lg:px-8 -mt-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {contactInfo.map((info, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-slate-100 !text-primary flex items-center justify-center mx-auto mb-4">
                  {info.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{info.title}</h3>
                {info.details.map((d, j) => (
                  <p key={j} className="text-sm text-slate-500 leading-relaxed m-0">{d}</p>
                ))}
              </div>
            ))}
          </div>
        </section>
      ), [])}

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
