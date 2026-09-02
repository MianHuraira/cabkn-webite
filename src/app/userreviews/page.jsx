"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
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
      if (i < full) stars.push(<FaStar key={i} size={14} color="#004a70" className="drop-shadow-sm" />);
      else if (i === full && half)
        stars.push(<FaStarHalfAlt key={i} size={14} color="#004a70" className="drop-shadow-sm" />);
      else stars.push(<FaRegStar key={i} size={14} color="#9ca3af" />);
    }
    return stars;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ===== HERO BANNER ===== */}
      <section className={`relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 !pt-28 !pb-28 ${mounted ? 'animate-fade-in-down' : 'opacity-0'}`} style={{ animationDelay: "50ms" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }} />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: "12s" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-family-medium !mb-4">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
            <span className="text-slate-500">/</span>
            <span className="text-slate-200">Reviews</span>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                <MdRateReview size={24} color="#fff" />
              </div>
              <div>
                <h1 className="text-white text-3xl font-family-bold tracking-tight !m-0 leading-tight">
                  My{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
                    Reviews
                  </span>
                </h1>
                <p className="text-slate-400 text-sm !mt-1 !m-0 font-family-regular">
                  See what our customers are saying about us
                </p>
              </div>
            </div>
            {Reviews.length > 0 && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 !border !border-white/10">
                <FaStar size={13} className="text-amber-400" />
                <span className="text-xs font-family-semibold text-white">{Reviews.length} Reviews</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== CONTENT LAYOUT ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 !-mt-12 !pb-24 w-full">

        {Loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 !border !border-slate-100 shadow-sm animate-pulse">
                <div className="flex items-center gap-3 !mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
                  <div className="flex-grow space-y-2">
                    <div className="h-3 w-1/2 bg-slate-100 rounded-full" />
                    <div className="h-2.5 w-1/4 bg-slate-50 rounded-full" />
                  </div>
                </div>
                <div className="h-10 bg-slate-50/50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : Reviews.length === 0 ? (
          <div className="py-16 bg-white rounded-3xl !border !border-slate-100 text-center shadow-sm w-full mx-auto mt-8">
            <div className="w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center !border !border-slate-150/80 !mb-4 mx-auto">
              <MdRateReview size={24} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-family-semibold text-slate-800 !m-0 !mb-1">
              No Reviews Yet
            </h3>
            <p className="text-xs text-slate-400 font-family-medium max-w-xs !m-0 mx-auto leading-relaxed">
              Reviews from your customers will appear here once they rate your service.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Reviews.map((item, index) => (
              <div
                key={index}
                className={`relative bg-white !border !border-slate-100 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Background decorative quotation glyph */}
                <span className="absolute -right-2 -bottom-6 text-7xl font-family-black text-slate-50 select-none pointer-events-none">”</span>

                <div>
                  <div className="flex justify-between items-start gap-4 relative z-10">
                    <div className="flex items-center gap-3">
                      {item.user?.image ? (
                        <img
                          src={item.user.image}
                          alt={item.user?.name || "User"}
                          className="w-11 h-11 rounded-xl object-cover !border !border-slate-100 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center !border !border-slate-100 shrink-0">
                          <FaUserCircle size={24} />
                        </div>
                      )}
                      <div>
                        <h4 className="font-family-semibold text-sm text-slate-800 !m-0 leading-tight">{item.user?.name || "Anonymous User"}</h4>
                        <span className="text-[11px] text-slate-500 font-family-medium block !mt-0.5 capitalize">{item.user?.type || 'User'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card feedback comment block */}
                  <div className="!mt-3 p-2.5 bg-slate-50/50 rounded-xl !border !border-slate-100/60 text-xs text-slate-600 font-family-medium leading-relaxed relative z-10">
                    "{item.review || "No review text provided."}"
                  </div>
                </div>

                {/* Footer ratings and date segment */}
                <div className="flex items-center justify-between !mt-3 pt-2.5 border-t border-slate-100 relative z-10">
                  <div className="flex gap-0.5">
                    {renderStars(item.rating || 0)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-family-medium">
                    {item.createdAt ? moment(item.createdAt).format("MMM DD, YYYY") : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
