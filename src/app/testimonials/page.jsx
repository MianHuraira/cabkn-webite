"use client";
import React, { useEffect, useState, useRef } from "react";
import { mainBanner } from "@/components/assets/Images";
import { FaStar, FaStarHalfAlt, FaRegStar, FaQuoteLeft, FaQuoteRight } from "react-icons/fa";
import { FiArrowRight, FiAward, FiStar, FiMessageCircle } from "react-icons/fi";
import CustomButton from "../../components/CustomButton";
import { useRouter } from "next/navigation";

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

const gradients = [
  "from-brand-600 to-brand-400",
  "from-violet-600 to-purple-400",
  "from-emerald-600 to-teal-400",
  "from-rose-600 to-pink-400",
  "from-amber-600 to-orange-400",
  "from-blue-600 to-cyan-400",
];

const renderStars = (rating) => {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push(<FaStar key={i} size={13} color="#f59e0b" />);
    else if (i === full && half) stars.push(<FaStarHalfAlt key={i} size={13} color="#f59e0b" />);
    else stars.push(<FaRegStar key={i} size={13} color="#d1d5db" />);
  }
  return stars;
};

export default function Testimonials() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  useEffect(() => { setMounted(true); }, []);

  const testimonials = [
    { name: "Sarah Johnson", role: "Regular Commuter", rating: 5, text: "Cabkn has completely changed how I travel between Nevis and Saint Kitts. The drivers are always on time, professional, and the cars are spotless. I use it every day for work and have never been let down." },
    { name: "Michael Thompson", role: "Business Traveler", rating: 5, text: "As a frequent business traveler, reliability is everything. Cabkn delivers every single time. The real-time tracking and transparent pricing give me peace of mind. Highly recommended." },
    { name: "Emily Davis", role: "Tourist", rating: 4.5, text: "Discovered Cabkn during my vacation in St. Kitts and it made my trip so much easier. The drivers were friendly and gave great local tips. Will definitely use again on my next visit!" },
    { name: "James Williams", role: "University Student", rating: 5, text: "Affordable rides that actually show up on time! As a student, the fair pricing is a lifesaver. The app is super easy to use and I love being able to track my ride." },
    { name: "Maria Garcia", role: "Healthcare Professional", rating: 5, text: "I work late shifts and Cabkn has been a godsend. The safety features like ride sharing and 24/7 support mean I always feel secure, no matter what time I need to travel." },
    { name: "David Brown", role: "Tour Guide", rating: 4.5, text: "I recommend Cabkn to all my clients looking for reliable transportation. The service is consistent, the drivers know the islands well, and the booking process couldn't be simpler." },
  ];

  return (
    <div className={`min-h-screen bg-white ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 pt-28 pb-28 md:pt-36 md:pb-32">
        <div className="absolute inset-0 opacity-[0.07] bg-cover bg-center" style={{ backgroundImage: `url(${mainBanner.src})` }} />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-brand-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-20 w-96 h-96 bg-brand-300/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent" />
        <div className={`relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
          <span className={`inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-xs sm:text-sm font-family-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6 ${mounted ? "animate-fade-in-down" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
            <FiMessageCircle size={14} />
            Rider Testimonials
          </span>
          <h1 className={`text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-family-bold mt-4 mb-6 leading-[1.1] tracking-tight ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "300ms" }}>
            What Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-100">
              Riders
            </span>{" "}
            Say
          </h1>
          <p className={`text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-family-regular ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "400ms" }}>
            Real feedback from real riders. Here is why the community loves Cabkn.
          </p>
        </div>
      </section>

      {/* ===== RATING SUMMARY ===== */}
      <section className="relative z-20 px-4 sm:px-6 lg:px-8 -mt-14">
        <div className="max-w-5xl mx-auto">
          <div className={`bg-white rounded-2xl p-6 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "250ms" }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 w-full md:w-auto">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="text-5xl md:text-6xl font-family-bold text-slate-900 leading-none tracking-tight">4.9</div>
                    <div className="flex gap-0.5 mt-2 justify-center md:justify-start">{renderStars(4.9)}</div>
                  </div>
                  <div className="hidden md:block w-px h-16 bg-slate-200" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <FiStar className="text-amber-400" size={16} />
                    <span className="text-sm font-family-semibold text-slate-900">Average Rating</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed font-family-regular m-0">
                    Based on <strong className="text-slate-900">2,500+</strong> verified reviews from riders across Nevis and Saint Kitts
                  </p>
                </div>
              </div>
              <CustomButton
                onClick={() => router.push('/auth/stepOne')}
                variant="primary"
                size="lg"
                className="!shrink-0 font-family-semibold"
              >
                Book a Ride
              </CustomButton>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS GRID ===== */}
      <SectionReveal>
        <section className="max-w-7xl mx-auto py-20 md:py-28 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 md:mb-18">
            <span className="inline-flex items-center gap-2 text-brand-600 text-xs md:text-sm font-family-semibold tracking-widest uppercase mb-4">
              <span className="w-8 h-px bg-brand-600" />
              Real Stories
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-family-bold text-slate-900 mt-3 tracking-tight">
              What Our Community Says
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-4 max-w-xl mx-auto font-family-regular">
              Hear from the people who ride with us every day.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <SectionReveal key={i} delay={i * 80}>
                <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 relative h-full flex flex-col overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradients[i % gradients.length]} opacity-[0.03]`} />
                  <div className="absolute top-5 right-5 text-slate-200 group-hover:text-brand-600/20 transition-colors duration-300">
                    <FaQuoteRight size={20} />
                  </div>
                  <div className="p-7 md:p-8 flex flex-col flex-grow relative z-10">
                    <div className="flex gap-0.5 mb-4">{renderStars(t.rating)}</div>
                    <p className="text-sm text-slate-600 leading-relaxed flex-grow font-family-regular">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white text-sm font-family-semibold shrink-0 shadow-sm`}>
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-family-semibold text-slate-900">{t.name}</div>
                        <div className="text-xs text-slate-400 font-family-regular flex items-center gap-1">
                          <FiAward size={10} className="text-brand-400" />
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </section>
      </SectionReveal>

      {/* ===== CTA ===== */}
      <SectionReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-28">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 rounded-[2rem] py-16 md:py-20 px-6 sm:px-10 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-400/5 rounded-full blur-3xl" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-family-bold mb-5 leading-tight tracking-tight">
                Ready to Become Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-100">
                  Next Happy Rider
                </span>
                ?
              </h2>
              <p className="text-white/60 text-base md:text-lg mb-10 leading-relaxed max-w-2xl mx-auto font-family-regular">
                Sign up today and experience the Cabkn difference for yourself.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <CustomButton
                  onClick={() => router.push('/auth/stepOne')}
                  variant="primary"
                  size="lg"
                  className="!bg-white !text-slate-900 hover:!bg-slate-100 !shadow-lg !shadow-black/10 font-family-semibold"
                  endContent={<FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />}
                >
                  Get Started Today
                </CustomButton>
                <button
                  onClick={() => router.push('/ride')}
className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 font-family-medium text-sm"
            >
              Book a Ride
            </button>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>
    </div>
  );
}
