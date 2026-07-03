"use client";

import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaHeart, FaRegHeart, FaStar, FaUser, FaTimes } from "react-icons/fa";
import { MdArrowForward } from "react-icons/md";

const Page = () => {
  const { getData, header1, putData } = ApiFunction();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favLoadingId, setFavLoadingId] = useState(null);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const getFavorites = async () => {
    setLoading(true);
    try {
      const res = await getData("users/favorite/1", header1);
      if (res?.success) {
        setFavorites(res?.users);
      }
    } catch (error) {
      console.log("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const addRideToFavRider = (data) => {
    let apiBody = { favUserId: data?._id };
    const encodedData = encodeURIComponent(JSON.stringify(apiBody));
    router.push(`/ride?data=${encodedData}`);
  };

  const onAddFavorite = async (data) => {
    setFavLoadingId(data?._id);
    try {
      const res = await putData(`users/like/${data?._id}`, {}, header1);
      if (res?.message) {
        getFavorites();
      }
    } catch (error) {
      console.log("Error adding to favorites: ", error);
    } finally {
      setFavLoadingId(null);
    }
  };

  useEffect(() => {
    getFavorites();
  }, []);

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-5 !border !border-slate-100 shadow-sm animate-pulse">
      <div className="flex items-center gap-3 !mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
        <div className="flex-grow space-y-2">
          <div className="h-3 w-1/2 bg-slate-100 rounded-full" />
          <div className="h-2.5 w-1/4 bg-slate-50 rounded-full" />
        </div>
      </div>
      <div className="h-10 bg-slate-50/50 rounded-xl" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
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
            <a href="/" className="text-slate-400 hover:text-white transition-colors">Home</a>
            <span className="text-slate-500">/</span>
            <span className="text-slate-200">Favorites</span>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                <FaHeart size={22} color="#f87171" />
              </div>
              <div>
                <h1 className="text-white text-3xl font-family-bold tracking-tight !m-0 leading-tight">
                  My{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-rose-300 to-pink-200">
                    Favorites
                  </span>
                </h1>
                <p className="text-slate-400 text-sm !mt-1 !m-0 font-family-regular">
                  {favorites.length} saved {favorites.length === 1 ? "driver" : "drivers"}
                </p>
              </div>
            </div>

            {favorites.length > 0 && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl px-3.5 py-1.5 !border !border-white/10">
                <FaHeart size={12} color="#f87171" />
                <span className="font-family-semibold text-white text-xs whitespace-nowrap">
                  {favorites.length} saved
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== CONTENT LAYOUT ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 !-mt-12 !pb-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : favorites.length === 0 ? (
          <div className="py-16 bg-white rounded-3xl !border !border-slate-100 text-center shadow-sm w-full   mt-8">
            <div className="w-14 h-14 rounded-3xl bg-rose-50 flex items-center justify-center !border !border-rose-100 !mb-4 mx-auto relative">
              <FaHeart size={24} className="text-rose-400 opacity-50" />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white">
                <FaTimes size={8} className="text-slate-400" />
              </div>
            </div>
            <h3 className="text-sm font-family-semibold text-slate-800 !m-0 !mb-1">
              No favorites yet
            </h3>
            <p className="text-xs text-slate-400 font-family-medium max-w-xs !m-0 mx-auto leading-relaxed">
              Start adding drivers to your favorites and they will appear here for quick booking.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {favorites.map((item, index) => {
              const isFavorite = item?.likes;

              return (
                <div
                  key={item?._id}
                  className={`relative bg-white !border !border-slate-100 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center !border !border-slate-200 shrink-0 overflow-hidden">
                        {item?.image ? (
                          <img
                            src={item?.image}
                            alt={item?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaUser size={20} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-family-semibold text-sm text-slate-800 !m-0 leading-tight truncate max-w-[120px]">{item?.name}</h4>
                        <div className="flex items-center gap-1 !mt-1">
                          <FaStar size={10} color="#004a70" />
                          <span className="text-[11px] text-slate-500 font-family-medium block">
                            {item?.rating || "0.0"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Heart toggle */}
                    <button
                      onClick={() => onAddFavorite(item)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer transition-all shrink-0 ${isFavorite ? "bg-rose-50" : "bg-slate-50 hover:bg-rose-50"}`}
                      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      {favLoadingId === item?._id ? (
                        <div className="w-3.5 h-3.5 border-2 border-brand-900 border-t-transparent rounded-full animate-spin" />
                      ) : isFavorite ? (
                        <FaHeart className="text-rose-600" size={13} />
                      ) : (
                        <FaRegHeart className="text-slate-400 hover:text-rose-400 transition-colors" size={13} />
                      )}
                    </button>
                  </div>

                  <div className="!mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => addRideToFavRider(item)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-900 hover:bg-brand-950 border-none text-white text-xs font-family-semibold cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm"
                    >
                      Request a Ride
                      <MdArrowForward size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

