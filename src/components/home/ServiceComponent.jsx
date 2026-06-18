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
  const [Count, setCount] = useState(1);
  const [Pagelength, setPagelength] = useState("");
  const [MoreLoading, setMoreLoading] = useState(false);

  const getCategory = async () => {
    try {
      const response = await getData("/servicecat/all/1", header1);
      const staticCategory = { _id: 0, name: "All" };
      const updatedCategories = [
        staticCategory,
        ...(response?.categories || []),
      ];

      setCategory(updatedCategories);
    } catch (error) {
      console.log(error);
    }
  };

  const getCategorydata = async () => {
    setloading(true);
    try {
      const response = await getData(
        selectedCategoryId === 0
          ? `/servicesubcat/all/${1}`
          : `/servicesubcat/all/${1}/${selectedCategoryId}`,
        header1
      );

      setSubCategory(response?.categories);
      setPagelength(response?.count?.currentPageSize);
      setloading(false);
    } catch (error) {
      setloading(false);
      console.log(error);
    }
  };

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
        className={`bg-gradient-to-br from-brand-800 to-brand-950 ${mounted ? "animate-fade-in-down" : "opacity-0"}`}
        style={{
          padding: "28px 0 44px",
          animationDelay: "50ms",
        }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8 }}>
            Home / Our Products
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h1
                style={{
                  color: "#fff",
                  fontSize: "clamp(22px, 4vw, 28px)",
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: "-0.3px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Our Products
              </h1>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: "4px 0 0" }}>
                Browse our collection of products and services
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "20px 16px", width: "100%" }}>
        {/* Category Pills */}
        <div className="slider-container" style={{ marginBottom: 24 }}>
          <Slider {...settings2} key={Category.length}>
            {Category.map((category, index) => {
              const isSelected = selectedCategoryId === category._id;
              return (
                <div className="p-2" key={index}>
                  <div
                    className={`CategoryMain text-center cursor-pointer ${!isSelected ? "hover:border-brand-700 hover:bg-slate-100" : ""}`}
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
                      fontWeight: 500,
                      fontFamily: "Inter-Medium",
                    }}
                    onClick={() => setSelectedCategoryId(category._id)}
                  >
                    <span style={{ fontSize: 13, fontFamily: "Inter-Medium" }}>{category?.name}</span>
                  </div>
                </div>
              );
            })}
          </Slider>
        </div>

        {/* Products Grid */}
        {SubCategory.length > 0 ? (
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
                  loading={MoreLoading}
                  style={{ minWidth: 140 }}
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
