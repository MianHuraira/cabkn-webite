"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaStar, FaStarHalfAlt, FaRegStar, FaUserCircle } from "react-icons/fa";
import { MdRateReview } from "react-icons/md";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import moment from "moment";

export default function Page() {
  const [Reviews, setReviews] = useState([]);
  const [Loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { getData, header1 } = ApiFunction();
  const userData = useSelector((state) => state.auth.user?.user);

  const getReviews = async () => {
    try {
      const response = await getData(
        "rating/all/" + userData?._id,
        header1
      );
      setReviews(response.ratings || []);
    } catch (error) {
      console.log("errr----", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) {
      getReviews();
    }
  }, [userData]);

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push(<FaStar key={i} size={16} color="#eab308" className="drop-shadow-sm" />);
      else if (i === full && half)
        stars.push(<FaStarHalfAlt key={i} size={16} color="#eab308" className="drop-shadow-sm" />);
      else stars.push(<FaRegStar key={i} size={16} color="#d1d5db" />);
    }
    return stars;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div
        className="bg-gradient-to-br from-brand-800 to-brand-950 relative overflow-hidden"
        style={{ padding: "28px 0 44px" }}
      >
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <div className="font-family-medium" style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 16 }}>
            <a href="/" className="font-family-regular" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#fff"} onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>Home</a>
            <span className="font-family-regular" style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
            <span className="font-family-regular" style={{ color: "rgba(255,255,255,0.8)" }}>Reviews</span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "clamp(10px, 2vw, 16px)" }}>
              <div style={{ width: "clamp(40px, 6vw, 52px)", height: "clamp(40px, 6vw, 52px)", borderRadius: "clamp(12px, 2vw, 16px)", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MdRateReview size="clamp(20px, 3vw, 26px)" color="#fff" />
              </div>
              <div>
                <h1 className="font-family-bold" style={{ color: "#fff", fontSize: "clamp(20px, 5vw, 30px)", margin: 0, letterSpacing: "-0.5px", lineHeight: 1.2, wordBreak: "break-word" }}>Reviews</h1>
                <p className="font-family-regular" style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(12px, 2vw, 14px)", margin: "4px 0 0", wordBreak: "break-word", maxWidth: "450px", lineHeight: 1.5 }}>See what our customers are saying about us.</p>
              </div>
            </div>
            {Reviews.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", borderRadius: 12, padding: "6px 14px", border: "1px solid rgba(255,255,255,0.06)", height: 36 }}>
                <FaStar size={14} color="#fbbf24" />
                <span className="font-family-medium" style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>{Reviews.length} Reviews</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(12px, 3vw, 24px) clamp(40px, 6vw, 64px)", width: "100%", position: "relative", zIndex: 10 }}>

        {/* Page Title & Context */}
        <div className="w-full mb-10 md:mb-14 mt-8 md:mt-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="text-sm font-family-bold text-brand-500 tracking-[0.2em] uppercase mb-2">
              Feedback
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-family-bold text-gray-700 leading-tight">
              Real Experiences
            </h1>
          </div>
          <p className="max-w-md text-gray-500 text-sm md:text-base font-family-regular leading-relaxed">
            From daily planners to frequent travelers, people across the globe rely on Cabkn for simple, reliable bookings. Here's what they have to say.
          </p>
        </div>

        {Loading ? (
          // Skeleton Loader Grid
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 w-full">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gradient-to-br from-[#eff9ff] to-white rounded-[24px] p-6 md:p-8 border border-brand-100 shadow-sm flex items-center gap-6">
                <div className="flex-shrink-0 w-24 h-24 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="flex-1 w-full">
                  <div className="h-4 bg-gray-200 rounded w-full mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5 mb-5 animate-pulse"></div>
                  <div className="flex gap-1.5 mb-5">
                    {[1, 2, 3, 4, 5].map(j => <div key={j} className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>)}
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : Reviews.length === 0 ? (
          // Empty State
          <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 mt-8">
            <div className="w-24 h-24 mx-auto bg-brand-50 rounded-full flex items-center justify-center mb-6">
              <MdRateReview size={48} className="text-brand-400" />
            </div>
            <h3 className="text-2xl font-family-bold text-gray-800 mb-3">No reviews yet</h3>
            <p className="text-gray-500 text-lg font-family-regular">Reviews from your customers will appear here once they rate your service.</p>
          </div>
        ) : (
          // Review Grid
          <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {Reviews.map((item, index) => (
                <div key={index} className="relative bg-gradient-to-r from-[#eff9ff] via-[#f7fcff] to-[#eff9ff] rounded-[24px] overflow-hidden min-h-[180px] md:min-h-[200px] flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow border border-brand-50 w-full group">

                  {/* Left: Mobile Image */}
                  <div className="md:hidden w-24 h-24 mx-auto mt-6 rounded-full border-4 border-white ring-2 ring-brand-400 overflow-hidden relative z-10 shadow-lg">
                    {item.user?.image ? (
                      <img src={item.user.image} alt={item.user?.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
                        <FaUserCircle size={40} className="text-brand-300 opacity-50" />
                      </div>
                    )}
                  </div>

                  {/* Left: Desktop Image with curved right edge */}
                  <div
                    className="hidden md:block absolute top-0 bottom-0 left-0 w-[30%] lg:w-[28%] z-0 overflow-hidden border-r-[5px] border-white transform transition-transform duration-700 group-hover:scale-[1.02] origin-left"
                    style={{
                      borderTopRightRadius: '120px',
                      borderBottomRightRadius: '120px',
                      boxShadow: '2px 0 0 1px #4fb4ff'
                    }}
                  >
                    {item.user?.image ? (
                      <img src={item.user.image} alt={item.user?.name || "User"} className="w-full h-full object-cover object-center" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
                        <FaUserCircle size={60} className="text-brand-300 opacity-50" />
                      </div>
                    )}
                  </div>

                  {/* Right: Review Content */}
                  <div className="relative z-10 flex-1 flex flex-col justify-center text-center md:text-left px-6 py-4 md:py-6 md:pl-[36%] lg:pl-[34%] xl:pl-[34%] md:pr-8">

                    {/* Quote Text */}
                    <h2 className="text-sm md:text-base lg:text-lg font-family-medium text-gray-800 leading-snug md:leading-snug mb-3">
                      <span className="text-3xl md:text-4xl text-gray-700 font-serif mr-1 leading-none">"</span>
                      {item.review || "No review text provided."}
                      <span className="text-3xl md:text-4xl text-gray-700 font-serif ml-1 leading-none">"</span>
                    </h2>

                    {/* User Info */}
                    <div className="flex flex-col items-center md:items-start justify-center md:justify-start mb-3">
                      <p className="text-base md:text-lg font-family-bold text-gray-700 mb-0.5 leading-tight">{item.user?.name || "Anonymous User"}</p>
                      <p className="text-xs md:text-sm text-brand-600 font-family-medium capitalize">{item.user?.type || 'User'}</p>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                      {renderStars(item.rating || 0)}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
