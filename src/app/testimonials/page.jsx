"use client";
import React, { useEffect, useState, useRef } from "react";
import { mainBanner } from "@/components/assets/Images";
import { FaStar, FaStarHalfAlt, FaRegStar, FaQuoteLeft } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import CustomButton from "../../components/CustomButton";
import { useRouter } from "next/navigation";

export default function Testimonials() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

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
      <div ref={ref} className={`transition-all duration-700 transform ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`} style={{ transitionDelay: `${delay}ms` }}>
        {children}
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-slate-50 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 to-brand-950 pt-24 pb-20 md:pt-32 md:pb-28">
        <div
          className="absolute inset-0 opacity-5 bg-cover bg-center"
          style={{ backgroundImage: `url(${mainBanner.src})` }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-white/60 text-xs sm:text-sm font-semibold tracking-widest uppercase">Rider Testimonials</span>
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mt-4 mb-5 leading-tight tracking-tight">
            What Our <span className="!text-brand-400">Riders</span> Say
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Real feedback from real riders. Here is why the community loves Cabkn.
          </p>
        </div>
      </section>

      {/* Rating Summary */}
      <section className="relative z-20 px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-slate-900 leading-none">4.9</div>
                <div className="flex gap-0.5 mt-2 justify-center">{renderStars(4.9)}</div>
                <div className="text-xs text-slate-500 mt-1">Average Rating</div>
              </div>
              <div className="hidden md:block w-px h-16 bg-slate-200" />
              <div>
                <div className="text-sm text-slate-500 leading-relaxed">
                  Based on <strong className="text-slate-900">2,500+</strong> verified reviews<br className="hidden md:block" />
                  from riders across Nevis and Saint Kitts
                </div>
              </div>
            </div>
            <CustomButton
              onClick={() => router.push('/auth/stepOne')}
              variant="primary"
              size="lg"
            >
              Book a Ride
            </CustomButton>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <SectionReveal>
        <section className="max-w-7xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <SectionReveal key={i} delay={i * 100}>
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative h-full flex flex-col">
                  <FaQuoteLeft className="absolute top-6 right-6 text-primary opacity-10" size={24} />
                  <div className="flex gap-0.5 mb-4">{renderStars(t.rating)}</div>
                  <p className="text-sm text-slate-600 leading-relaxed italic mb-6 flex-grow">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-brand-400 flex items-center justify-center text-white font-semibold shrink-0">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.role}</div>
                    </div>
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
          <div className="max-w-2xl mx-auto">
            <h2 className="text-white text-2xl md:text-4xl font-bold mb-4">
              Ready to Become Our Next Happy Rider?
            </h2>
            <p className="text-white/70 text-base md:text-lg !mb-6 leading-relaxed">
              Sign up today and experience the Cabkn difference for yourself.
            </p>
            <CustomButton
              onClick={() => router.push('/auth/stepOne')}
              variant="primary"
              size="lg"
              className="!bg-white !text-primary hover:!bg-slate-50 hover:!shadow-[0_8px_24px_rgba(255,255,255,0.2)]"
              endContent={<FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />}
            >
              Get Started Today
            </CustomButton>
          </div>
        </section>
      </SectionReveal>
    </div>
  );
}
