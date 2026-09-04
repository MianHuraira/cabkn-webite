/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
"use client";
import React, { useEffect, useState, useRef } from "react";
import { Container } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import ThingstodoCard from "./ThingstodoCard";
import EmptyState from "../EmptyState";
import { NoshowData } from "../assets/Images";
import { useApi } from "../ApiFunction/ApiFunction";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { FiArrowRight } from "react-icons/fi";

export default function Tingstodo() {
  const swiperRef = useRef(null);
  const router = useRouter();
  const { getData, header1 } = useApi();
  const [selectedCategoryId] = useState(0);
  const [SubCategory, setSubCategory] = useState([]);
  const [loading, setloading] = useState(false);
  const [Count, setCount] = useState(1);
  const [Pagelength, setPagelength] = useState("");

  const getCategory = async () => {
    // category filter removed from UI - no-op
  };

  const getCategorydata = async () => {
    setloading(true);
    try {
      const response = await getData(
        selectedCategoryId === 0
          ? `/websubcat/all/${1}`
          : `/websubcat/all/${1}/${selectedCategoryId}`,
        header1
      );
      setSubCategory(response?.categories || []);
      setPagelength(response?.count?.currentPageSize);
    } catch (error) {
      console.error("Failed to load category data:", error);
      setSubCategory([]);
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    getCategorydata();
  }, [selectedCategoryId]);

  useEffect(() => {
    getCategorydata();
  }, []);


  const handleSelection = (category) => {
    if (category?._id) {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`tour_${category._id}`, JSON.stringify(category));
          sessionStorage.setItem("selected_tour", JSON.stringify(category));
        } catch (e) {
          console.warn("sessionStorage save error:", e);
        }
      }
      router.push(`/popular/${category._id}`);
    }
  };

  const handleItemClick = (item) => {
    if (item?._id) {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`tour_${item._id}`, JSON.stringify(item));
          sessionStorage.setItem("selected_tour", JSON.stringify(item));
        } catch (e) {
          console.warn("sessionStorage save error:", e);
        }
      }
      router.push(`/popular/${item._id}`);
    }
  };

  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="w-full max-w-full overflow-hidden py-6">
      <Container>
        {/* Header Row */}
        <div
          className={`flex flex-row justify-between items-center mb-6 px-1 reveal ${
            inView ? "visible" : ""
          }`}
          style={{ transitionDelay: "50ms" }}
        >
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-family-semibold text-slate-800 tracking-tight m-0 leading-tight">
              Top Locations
            </h2>
            <p className="text-slate-500 font-family-regular text-sm sm:text-[15px] !m-0 mt-1">
              Places travelers love right now
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                aria-label="Previous locations"
                className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-white hover:bg-[#004a70] hover:border-[#004a70] shadow-xs flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95"
              >
                <FaChevronLeft size={12} />
              </button>
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                aria-label="Next locations"
                className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-white hover:bg-[#004a70] hover:border-[#004a70] shadow-xs flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95"
              >
                <FaChevronRight size={12} />
              </button>
            </div>

            <Link
              href="/top-locations"
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-brand-50 hover:bg-brand-100 text-[#004a70] font-family-semibold text-xs sm:text-sm transition-all duration-200 no-underline shrink-0 group shadow-xs"
            >
              <span>See All</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      <div className="p-1 w-full max-w-full overflow-hidden">
        {/* Show skeleton when loading */}
        {loading ? (
          <div className="w-full py-4">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="w-[280px] sm:w-[300px] shrink-0 bg-white rounded-[20px] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col h-[380px] animate-pulse">
                  <div className="bg-slate-200/70 h-[180px] w-full"></div>
                  <div className="p-4 flex-1 flex flex-col gap-4">
                    <div className="flex justify-between items-center gap-4">
                      <div className="bg-slate-200/70 h-5 w-3/4 rounded-full"></div>
                      <div className="bg-slate-200/70 h-5 w-1/4 rounded-full"></div>
                    </div>
                    <div className="bg-slate-200/70 h-4 w-1/2 rounded-full"></div>
                    <div className="mt-auto bg-slate-200/70 h-11 w-full rounded-[9999px]"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : /* Show content when not loading */
          SubCategory.length > 0 ? (
            <div className="w-full max-w-full overflow-hidden pb-1">
              <Swiper
                onSwiper={(sw) => { swiperRef.current = sw; }}
                slidesPerView={1.15}
                spaceBetween={14}
                className="w-full top-locations-swiper !py-1"
                breakpoints={{
                  0: { slidesPerView: 1.15, spaceBetween: 12 },
                  480: { slidesPerView: 1.5, spaceBetween: 14 },
                  640: { slidesPerView: 2.2, spaceBetween: 16 },
                  768: { slidesPerView: 2.8, spaceBetween: 18 },
                  1024: { slidesPerView: 3.5, spaceBetween: 20 },
                  1280: { slidesPerView: 4.1, spaceBetween: 20 },
                }}
              >
                {SubCategory?.map((testimonial, index) => (
                  <SwiperSlide key={testimonial._id || index} className="h-auto flex">
                    <div className="w-full h-full flex flex-col">
                      <ThingstodoCard
                        testimonial={testimonial}
                        onClick={() => handleItemClick(testimonial)}
                        onClick2={() => handleSelection(testimonial)}
                      />
                    </div>
                  </SwiperSlide>
                ))}

                {/* Final "See More" Card Slide */}
                <SwiperSlide className="h-auto flex">
                  <div
                    onClick={() => router.push("/top-locations")}
                    className="w-full h-full min-h-[240px] sm:min-h-[250px] rounded-2xl bg-gradient-to-br from-[#002842] via-[#004a70] to-[#006699] p-4 sm:p-5 flex flex-col items-center justify-center text-center text-white cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden !border !border-white/15 select-none"
                  >
                    {/* Ambient Glow */}
                    <div className="absolute -top-12 -right-12 w-28 h-28 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-sky-400/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                    {/* Icon Badge */}
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/15 backdrop-blur-md !border !border-white/30 flex items-center justify-center text-white mb-2 sm:mb-2.5 shadow-inner group-hover:scale-105 group-hover:bg-white/30 transition-all duration-300">
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="text-white group-hover:translate-x-0.5 transition-transform duration-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>

                    <h3 className="text-base sm:text-lg font-family-semibold !font-bold text-white !m-0 mb-1 tracking-tight">
                      Explore All
                    </h3>
                    <p className="text-white/80 text-[11.5px] sm:text-xs font-family-regular !font-normal !m-0 mb-3 sm:mb-3.5 max-w-[200px] leading-relaxed">
                      Discover all top attractions, restaurants & places.
                    </p>

                    <span className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white text-[#004a70] font-family-semibold !font-semibold text-[11px] sm:text-xs shadow-xs group-hover:bg-sky-50 transition-all">
                      <span>View All</span>
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform duration-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>
          ) : (
            <EmptyState
              imageSrc={NoshowData}
              inView={inView}
              title="No Recommendations Found"
              description="We couldn't find any tours or activities matching your selection. Try exploring other categories!"
            />
          )}
        </div>
      </Container>
    </div>
  );
}
