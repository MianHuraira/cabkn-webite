"use client";
import React, { useEffect, useState, useRef } from "react";
import { Heroimg } from "@/components/assets/Images";
import { FaStar, FaStarHalfAlt, FaRegStar, FaQuoteRight } from "react-icons/fa";
import { FiArrowRight, FiAward, FiStar, FiMessageCircle, FiCheckCircle } from "react-icons/fi";
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

const renderStars = (rating, size = 13) => {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push(<FaStar key={i} size={size} color="#f59e0b" />);
    else if (i === full && half) stars.push(<FaStarHalfAlt key={i} size={size} color="#f59e0b" />);
    else stars.push(<FaRegStar key={i} size={size} color="#d1d5db" />);
  }
  return stars;
};

const ratingsBreakdown = [
  { stars: 5, percentage: 92, count: "2,300" },
  { stars: 4, percentage: 6, count: "150" },
  { stars: 3, percentage: 2, count: "50" },
  { stars: 2, percentage: 0, count: "0" },
  { stars: 1, percentage: 0, count: "0" },
];

export default function Testimonials() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const router = useRouter();
  useEffect(() => { setMounted(true); }, []);

  const testimonials = [
    { name: "Sarah Johnson", role: "Regular Commuter", category: "Commuter", rating: 5, text: "Welcome to Saint Kitts has completely changed how I travel between Nevis and Saint Kitts. The drivers are always on time, professional, and the cars are spotless. I use it every day for work and have never been let down." },
    { name: "Michael Thompson", role: "Business Traveler", category: "Business", rating: 5, text: "As a frequent business traveler, reliability is everything. Welcome to Saint Kitts delivers every single time. The real-time tracking and transparent pricing give me peace of mind. Highly recommended." },
    { name: "Emily Davis", role: "Tourist", category: "Tourist", rating: 4.5, text: "Discovered Welcome to Saint Kitts during my vacation in St. Kitts and it made my trip so much easier. The drivers were friendly and gave great local tips. Will definitely use again on my next visit!" },
    { name: "James Williams", role: "University Student", category: "Commuter", rating: 5, text: "Affordable rides that actually show up on time! As a student, the fair pricing is a lifesaver. The app is super easy to use and I love being able to track my ride." },
    { name: "Maria Garcia", role: "Healthcare Professional", category: "Business", rating: 5, text: "I work late shifts and Welcome to Saint Kitts has been a godsend. The safety features like ride sharing and 24/7 support mean I always feel secure, no matter what time I need to travel." },
    { name: "David Brown", role: "Tour Guide", category: "Tourist", rating: 4.5, text: "I recommend Welcome to Saint Kitts to all my clients looking for reliable transportation. The service is consistent, the drivers know the islands well, and the booking process couldn't be simpler." },
  ];

  const filteredTestimonials = activeTab === "All"
    ? testimonials
    : testimonials.filter((t) => t.category === activeTab);

  const categories = ["All", "Commuter", "Business", "Tourist"];

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
              Verified Customer Reviews
            </div>

            <h1
              className={`text-white font-family-medium leading-[1.2] tracking-tight m-0 text-[clamp(2rem,5vw,3.5rem)] sm:text-[clamp(2.25rem,6vw,3rem)] ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
              style={{ animationDelay: "200ms" }}
            >
              What Our{" "}
              <span className="font-family-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
                Riders
              </span>{" "}
              Say
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
                  2,500+ verified reviews
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#004a70] flex items-center justify-center">
                  <FiCheckCircle size={12} color="#fff" />
                </div>
                <span className="text-white/80 font-family-regular text-sm">
                  4.9 average rider rating
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#004a70] flex items-center justify-center">
                  <FiCheckCircle size={12} color="#fff" />
                </div>
                <span className="text-white/80 font-family-regular text-sm">
                  Trusted by locals & visitors
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

      {/* ===== RATING SUMMARY ===== */}
      <section className="max-w-7xl mx-auto py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <SectionReveal>
            <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 !border !border-brand-100 text-brand-700 text-[11px] sm:text-xs font-family-semibold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                Rider Ratings
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-family-semibold text-slate-800 mt-4 tracking-tight leading-tight">
                Loved by Riders Across{" "}
                <span className="text-brand-600">the Islands</span>
              </h2>
              <p className="text-slate-500 text-sm sm:text-[15px] mt-3 font-family-regular leading-relaxed">
                Real scores from real riders — here's how we're rated by the community we serve.
              </p>
            </div>
          </SectionReveal>

          <div className="max-w-5xl mx-auto">
          <div className={`bg-white rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] !border !border-slate-100 relative overflow-hidden ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "150ms" }}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Avg rating score */}
              <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left gap-2 lg:border-r lg:border-slate-100 lg:pr-8">
                <span className="text-sm font-family-semibold text-brand-600 uppercase tracking-widest">Average Rating</span>
                <h2 className="text-4xl sm:text-5xl font-family-semibold text-slate-900 m-0">4.9</h2>
                <div className="flex gap-1 mt-1 justify-center lg:justify-start">{renderStars(4.9, 18)}</div>
                <p className="text-xs text-slate-400 font-family-regular mt-2 m-0">
                  Based on <strong className="text-slate-800 font-family-semibold">2,500+</strong> reviews from verified riders.
                </p>
              </div>

              {/* Progress chart breakdown */}
              <div className="lg:col-span-5 flex flex-col gap-2.5">
                {ratingsBreakdown.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <span className="w-3 text-slate-500 font-family-medium text-right">{row.stars}</span>
                    <FiStar className="text-amber-400 fill-amber-400 flex-shrink-0" size={12} />
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${mounted ? row.percentage : 0}%` }}
                      />
                    </div>
                    <span className="w-8 text-slate-400 font-family-regular text-right">{row.percentage}%</span>
                    <span className="w-12 text-slate-350 text-right hidden sm:inline-block">({row.count})</span>
                  </div>
                ))}
              </div>

              {/* CTA button */}
              <div className="lg:col-span-3 flex justify-center lg:justify-end lg:pl-6">
                <CustomButton
                  onClick={() => router.push('/auth/stepOne')}
                  variant="primary"
                  size="lg"
                  className="w-full font-family-semibold shadow-lg shadow-brand-600/20 bg-gradient-to-r from-brand-600 to-brand-700 border-none hover:from-brand-700 hover:to-brand-800 hover:shadow-brand-600/35 hover:!-translate-y-0.5 active:!translate-y-0"
                >
                  Book a Ride
                </CustomButton>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS GRID ===== */}
      <section className="max-w-7xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 !border !border-brand-100 text-brand-700 text-[11px] sm:text-xs font-family-semibold uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
            Rider Stories
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-family-semibold text-slate-800 mt-2 tracking-tight">
            What Our Community Says
          </h2>
          <p className="text-slate-500 text-sm sm:text-[15px] mt-3 max-w-xl mx-auto font-family-regular">
            Hear first-hand details from local daily commuters and visiting tourists.
          </p>

          {/* Interactive filter tabs */}
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 mt-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-5 py-2 rounded-full text-xs font-family-semibold transition-all duration-300 border ${activeTab === cat
                  ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10 scale-105"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:text-slate-700"
                  }`}
              >
                {cat} Reviews
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic masonry/grid review items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 items-stretch">
          {filteredTestimonials.map((t, i) => (
            <SectionReveal key={`${activeTab}-${i}`} delay={i * 60}>
              <div className="group bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,74,112,0.06)] hover:-translate-y-2 transition-all duration-500 relative h-full flex flex-col overflow-hidden">
                {/* Visual glow backdrop overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradients[i % gradients.length]} opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-300`} />

                {/* Floating quote bubble icon */}
                <div className="absolute top-6 right-6 text-slate-100 group-hover:text-brand-600/10 transition-colors duration-500 pointer-events-none">
                  <FaQuoteRight size={32} />
                </div>

                <div className="p-7 md:p-8 flex flex-col justify-between flex-grow relative z-10 h-full">
                  <div>
                    {/* Stars rating */}
                    <div className="flex gap-0.5 mb-5">{renderStars(t.rating)}</div>

                    {/* Testimonial message content */}
                    <p className="text-slate-655 text-[13.5px] sm:text-sm leading-relaxed font-family-regular m-0 italic">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </div>

                  {/* User bio element */}
                  <div className="flex items-center gap-3.5 mt-8 pt-5 border-t border-slate-100">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white text-xs font-family-semibold shrink-0 shadow-sm border border-white`}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-family-semibold text-slate-900 leading-tight">{t.name}</div>
                      <div className="text-[11px] text-slate-400 font-family-regular flex items-center gap-1 mt-0.5">
                        <FiAward size={11} className="text-brand-500" />
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

      {/* ===== BOTTOM CTA CARD ===== */}
      <SectionReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-28">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#001726] via-[#002f4a] to-[#001f33] !border !border-white/10 rounded-[2.5rem] py-16 md:py-20 px-6 sm:px-10 text-center shadow-xl">
            {/* Mesh background overlays */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "24px 24px"
            }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-family-semibold mb-3 leading-tight tracking-tight">
                Ready to Become Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
                  Next Happy Rider
                </span>
                ?
              </h2>
              <p className="text-slate-400 text-sm sm:text-[15px] mb-2 leading-relaxed max-w-xl mx-auto font-family-regular">
                Sign up today and experience Nevis and Saint Kitts transport optimized around your convenience.
              </p>

              <div className="flex flex-wrap justify-center items-center gap-3 !mt-4">
                <button
                  onClick={() => router.push('/auth/stepOne')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-950 shadow-lg shadow-black/10 transition-all duration-300 font-family-semibold text-sm hover:-translate-y-1 active:translate-y-0 group border-none"
                >
                  <span>Get Started Today</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300 text-slate-800" />
                </button>
                <button
                  onClick={() => router.push('/ride')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full !border !border-slate-700/85 text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-900/50 transition-all duration-300 font-family-semibold text-sm hover:-translate-y-1 active:translate-y-0"
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
