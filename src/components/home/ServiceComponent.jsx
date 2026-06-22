/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
"use client"
import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Slider from "react-slick";
import ThingstodoCard from "./ThingstodoCard";
// import { useSelector } from "react-redux";
import { Button, Spinner } from "reactstrap";
import Image from "next/image";
import { NoshowData } from "../assets/Images";
import ApiFunction from "../ApiFunction/ApiFunction";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/CustomButton";
import EmptyState from "@/components/EmptyState";

export default function ServiceComponent() {
  const [currentPage, setCurrentPage] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const router = useRouter();
  const { getData, header1 } = ApiFunction();
  const [Category, setCategory] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [SubCategory, setSubCategory] = useState([]);
  // const userData = useSelector((state) => state.auth.user?.user);
  const [loading, setloading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [Count, setCount] = useState(1);
  const [Pagelength, setPagelength] = useState("");
  const [MoreLoading, setMoreLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const getCategory = async () => {
    setCatLoading(true);
    try {
      const response = await getData("/servicecat/all/1", header1);
      const staticCategory = { _id: 0, name: "All" };
      const updatedCategories = [
        staticCategory,
        ...(response?.categories || []),
      ];

      setCategory(updatedCategories);
      setCatLoading(false);
    } catch (error) {
      setCatLoading(false);
      console.log(error);
    }
  };

  const getCategorydata = async () => {
    setloading(true);
    setFetchError(false);
    try {
      const response = await getData(
        selectedCategoryId === 0
          ? `/servicesubcat/all/${1}`
          : `/servicesubcat/all/${1}/${selectedCategoryId}`,
        header1
      );

      if (response) {
        setSubCategory(response?.categories);
        setPagelength(response?.count?.currentPageSize);
      } else {
        setFetchError(true);
      }
      setloading(false);
    } catch (error) {
      setFetchError(true);
      setloading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      if (loading) {
        setloading(false);
        setFetchError(true);
      }
    }, 12000);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    getCategorydata();
  }, [selectedCategoryId]);

  const ShowMoreDAta = async () => {
    setCount(Count + 1);
    setMoreLoading(true);

    try {
      const response = await getData(
        selectedCategoryId === 0
          ? `/servicesubcat/all/${Count + 1}`
          : `/servicesubcat/all/${Count + 1}/${selectedCategoryId}`,
        header1
      );
      setSubCategory((prevCategories) => [
        ...prevCategories,
        ...response?.categories,
      ]);
      setCount(response?.count?.totalPage);
      setPagelength(response?.count?.currentPageSize);
      setMoreLoading(false);
    } catch (error) {
      setMoreLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);




  const settings2 = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 8,
    slidesToScroll: 3,
    arrows: false,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const handleSelection = (category) => {
    router.push(`/service/${category?._id}?isServices=true`);
  };


  const handleItemClick = (item) => {
    const encodedData = encodeURIComponent(JSON.stringify(item));
    router.push(`/ride?data=${encodedData}`);
  };

  return (
    <div className={mounted ? "animate-fade-in" : "opacity-0"}>
      {/* Blue Gradient Header */}
      <div
        className="bg-gradient-to-br from-brand-800 to-brand-950"
        style={{
          padding: "28px 0 44px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <div className="font-family-medium" style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 16 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>
              Home
            </a>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>Shop</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 2vw, 16px)" }}>
            <div style={{ width: "clamp(40px, 6vw, 52px)", height: "clamp(40px, 6vw, 52px)", borderRadius: "clamp(12px, 2vw, 16px)", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="clamp(20px, 3vw, 26px)" height="clamp(20px, 3vw, 26px)" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div>
              <h1 className="font-family-bold" style={{ color: "#fff", fontSize: "clamp(20px, 5vw, 30px)", margin: 0, letterSpacing: "-0.5px", lineHeight: 1.2, wordBreak: "break-word" }}>
                Our Products
              </h1>
              <p className="font-family-regular" style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(12px, 2vw, 14px)", margin: "2px 0 0", wordBreak: "break-word" }}>
                Browse our collection of products and services
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px", width: "100%" }}>
        {/* Category Pills */}
        <div className="slider-container" style={{ marginBottom: 24 }}>
          {catLoading ? (
            <div style={{ display: "flex", gap: 10, overflow: "hidden" }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="animate-pulse" style={{ flexShrink: 0, width: 120 }}>
                  <div style={{ height: 42, borderRadius: 9999, background: "#e2e8f0" }} />
                </div>
              ))}
            </div>
          ) : (
            <Slider {...settings2} key={Category.length}>
              {Category.map((category, index) => {
                const isSelected = selectedCategoryId === category._id;
                return (
                  <div className="p-2" key={index}>
                    <div
                      className={`CategoryMain text-center cursor-pointer capitalize ${!isSelected ? "hover:border-brand-700 hover:bg-slate-100" : ""}`}
                      style={{
                        padding: "10px 14px",
                        background: isSelected
                          ? "#004a70"
                          : "#fff",
                        color: isSelected ? "white" : "#1e293b",
                        borderRadius: "9999px",
                        minWidth: "120px",
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease",
                        border: isSelected ? "none" : "1px solid #e2e8f0",
                        boxShadow: isSelected ? "0 2px 8px rgba(0,74,112,0.25)" : "none",
                        margin: "0 auto",
                        whiteSpace: "nowrap",
                        fontSize: 14,
                        fontFamily: "Inter-Medium",
                      }}
                      onClick={() => setSelectedCategoryId(category._id)}
                    >
                      <span className="font-family-medium" style={{ fontSize: 13 }}>{category?.name}</span>
                    </div>
                  </div>
                );
              })}
            </Slider>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col h-[380px] animate-pulse">
                  <div className="bg-slate-200/70 h-[180px] w-full"></div>
                  <div className="p-4 flex-1 flex flex-col gap-4">
                    <div className="flex justify-between items-center gap-4">
                      <div className="bg-slate-200/70 h-5 w-3/4 rounded-full"></div>
                      <div className="bg-slate-200/70 h-5 w-1/4 rounded-full"></div>
                    </div>
                    <div className="bg-slate-200/70 h-4 w-1/2 rounded-full"></div>
                    <div className="mt-auto pt-3">
                      <div className="flex items-center gap-2 bg-slate-200/70 h-[38px] w-[135px] rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : fetchError ? (
          <div className="py-10 text-center">
            <EmptyState
              showBg={false}
              title="Couldn't load products"
              description="Something went wrong while loading products. Please check your connection and try again."
            />
            <button
              onClick={getCategorydata}
              style={{
                marginTop: 12,
                padding: "10px 24px",
                background: "#004a70",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                cursor: "pointer",
              }}
              className="font-family-medium"
            >
              Try Again
            </button>
          </div>
        ) : SubCategory.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {SubCategory?.map((testimonial, index) => (
                <div
                  key={index}
                  className={`${mounted ? "animate-fade-in-up" : "opacity-0"}`}
                  style={{ animationDelay: `${60 + index * 40}ms` }}
                >
                  <ThingstodoCard
                    testimonial={testimonial}
                    onClick={() => handleItemClick(testimonial)}
                    onClick2={() => handleSelection(testimonial)}
                    btnTitle={'Buy Product'}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-center items-center mt-6 mb-8">
              {Pagelength > 1 ? (
                <CustomButton
                  onClick={ShowMoreDAta}
                  variant="primary"
                  size="md"
                  loading={MoreLoading}
                >
                  See more
                </CustomButton>
              ) : null}
            </div>
          </>
        ) : (
          <div className="py-10">
            <EmptyState
              title="No Products Found"
              showBg={false}
              description="We couldn't find any products matching your selected category."
            />
          </div>
        )}
      </div>
    </div>
  );
}
