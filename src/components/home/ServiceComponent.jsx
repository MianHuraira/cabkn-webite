/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
"use client"
import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col } from "react-bootstrap";
import ThingstodoCard from "./ThingstodoCard";
import { Button, Spinner } from "reactstrap";
import Image from "next/image";
import Link from "next/link";
import { NoshowData } from "../assets/Images";
import ApiFunction from "../ApiFunction/ApiFunction";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/CustomButton";
import EmptyState from "@/components/EmptyState";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, openCart } from "@/components/Redux/Slices/CartSlice";
import { message } from "antd";
import { FiShoppingBag, FiArrowRight } from "react-icons/fi";

export default function ServiceComponent() {
  const [currentPage, setCurrentPage] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart?.cartItems) || [];
  const totalPrice = useSelector((state) => state.cart?.totalPrice) || 0;
  const { getData, header1 } = ApiFunction();
  const [Category, setCategory] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [SubCategory, setSubCategory] = useState([]);
  const [loading, setloading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [Count, setCount] = useState(1);
  const [Pagelength, setPagelength] = useState("");
  const [MoreLoading, setMoreLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const tabsRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDown(true);
    setStartX(e.pageX - tabsRef.current.offsetLeft);
    setScrollLeft(tabsRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - tabsRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    tabsRef.current.scrollLeft = scrollLeft - walk;
  };

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

  const handleSelection = (category) => {
    router.push(`/service/${category?._id}?isServices=true`);
  };

  const handleQuickAddToCart = (item) => {
    dispatch(addToCart(item));
    message.success(`Added ${item?.title || "product"} to cart!`);
  };

  const handleItemClick = (item) => {
    dispatch(addToCart(item));
    dispatch(openCart());
  };

  return (
    <div className={`min-h-screen bg-slate-50/50 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      {/* ===== HERO BANNER ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#001726] via-[#002f4a] to-[#001f33] !pt-20 sm:!pt-24 !pb-20 sm:!pb-24 text-white">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001726]/90 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-family-medium !mb-4">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors no-underline">Home</Link>
            <span className="text-slate-400">/</span>
            <span className="text-white">Shop</span>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-white text-2xl sm:text-3xl font-family-semibold tracking-tight !m-0 leading-tight">
                Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
                  Products
                </span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm !mt-1 !m-0 font-family-regular">
                Browse our collection of products and services
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTENT LAYOUT ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 !-mt-12 !pb-24">
        <div className="bg-white rounded-3xl !border !border-slate-100 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          
          {/* Drag scrollable category tab bar */}
          <div
            ref={tabsRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex gap-2.5 overflow-x-auto pb-3 scrollbar-hide !my-4 select-none ${
              isDown ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {catLoading ? (
              <div className="flex gap-2.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="animate-pulse bg-slate-100 rounded-full h-9 w-24 shrink-0" />
                ))}
              </div>
            ) : (
              Category.map((category, index) => {
                const isSelected = selectedCategoryId === category._id;
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedCategoryId(category._id)}
                    className={`cursor-pointer capitalize font-family-medium text-xs px-5 py-2.5 rounded-full shrink-0 transition-all duration-300 border ${
                      isSelected
                        ? "bg-brand-900 text-white border-brand-900 shadow-md shadow-brand-900/10 font-family-semibold"
                        : "bg-slate-50 text-slate-700 border-slate-150 hover:bg-slate-100"
                    }`}
                  >
                    {category?.name}
                  </div>
                );
              })
            )}
          </div>

          {/* Cards list container */}
          {loading ? (
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
          ) : fetchError ? (
            <div className="py-12 text-center">
              <EmptyState
                showBg={false}
                title="Couldn't load products"
                description="Something went wrong while loading products. Please check your connection and try again."
              />
              <button
                onClick={getCategorydata}
                className="px-6 py-2.5 !mt-4 bg-brand-900 hover:bg-brand-950 text-white font-family-semibold text-xs rounded-full shadow-md transition-colors border-none cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : SubCategory.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
                {SubCategory?.map((testimonial, index) => (
                  <div
                    key={index}
                    className={`flex h-full ${mounted ? "animate-fade-in-up" : "opacity-0"}`}
                    style={{ animationDelay: `${60 + index * 40}ms` }}
                  >
                    <ThingstodoCard
                      testimonial={testimonial}
                      onClick={() => handleItemClick(testimonial)}
                      onClick2={() => handleSelection(testimonial)}
                      onAddToCart={() => handleQuickAddToCart(testimonial)}
                      btnTitle={'Buy Now'}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-center items-center !mt-8">
                {Pagelength > 1 ? (
                  <CustomButton
                    onClick={ShowMoreDAta}
                    variant="primary"
                    size="md"
                    loading={MoreLoading}
                    className="px-6 py-2 bg-slate-900 hover:bg-black text-white rounded-full font-family-semibold text-xs shadow-md transition-colors"
                  >
                    See more
                  </CustomButton>
                ) : null}
              </div>
            </>
          ) : (
            <div className="py-12">
              <EmptyState
                title="No Products Found"
                showBg={false}
                description="We couldn't find any products matching your selected category."
              />
            </div>
          )}

        </div>
      </div>

      {/* ===== STICKY FLOATING VIEW CART BAR (CENTERED, UNOBSTRUCTED BY CHAT) ===== */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] sm:w-[440px] z-40 animate-fade-in-up">
          <div
            onClick={() => dispatch(openCart())}
            className="bg-[#004a70] text-white p-3 sm:p-3.5 rounded-2xl shadow-[0_12px_36px_rgba(0,74,112,0.35)] border border-white/20 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#003855] transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0">
                <FiShoppingBag size={20} />
              </div>
              <div className="min-w-0">
                <span className="font-family-semibold text-xs sm:text-[13.5px] block truncate">
                  View Cart ({cartItems.reduce((acc, i) => acc + (i.cartQuantity || 1), 0)} items)
                </span>
                <span className="text-[11px] text-sky-200 font-family-medium block">
                  Total: ${Number(totalPrice).toFixed(2)} XCD
                </span>
              </div>
            </div>

            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-white text-[#004a70] font-family-semibold text-xs border-none shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 hover:bg-slate-100 transition-colors"
            >
              <span>Checkout</span>
              <FiArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
