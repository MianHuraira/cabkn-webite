"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Modal from "react-bootstrap/Modal";
import moment from "moment";
import { MdContentCopy, MdLocalOffer } from "react-icons/md";
import { FaTag, FaGift, FaPercentage } from "react-icons/fa";
import ApiFunction from "@/components/ApiFunction/ApiFunction";

export default function CouponPage() {
  const { getData, header1 } = ApiFunction();
  const [Coupons, setCoupons] = useState([]);
  const [show, setShow] = useState(false);
  const [CouponCode, setCouponCode] = useState("");
  const [loading, setloading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleClose = () => setShow(false);

  const GetCoupns = async () => {
    try {
      const res = await getData("coupon/me/1", header1);
      if (res?.success) {
        setCoupons(res?.coupons ?? []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    GetCoupns();
  }, []);

  const handleShow = (data) => {
    setShow(true);
    setCouponCode(data);
    setCopied(false);
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [gridCols, setGridCols] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setGridCols(1);
      else if (window.innerWidth < 900) setGridCols(2);
      else if (window.innerWidth < 1200) setGridCols(3);
      else setGridCols(4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getDiscountLabel = (item) => {
    if (item?.discount_type === "percentage") return `${item.discount}% OFF`;
    if (item?.discount) return `$${item.discount} OFF`;
    return null;
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden !border !border-slate-100 p-5 shadow-sm">
      <div className="h-1 bg-slate-100" />
      <div className="flex gap-4 items-center !mt-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse shrink-0" />
        <div className="flex-grow space-y-2">
          <div className="h-3 w-2/3 bg-slate-100 rounded-full animate-pulse" />
          <div className="h-2.5 w-1/3 bg-slate-50 rounded-full animate-pulse" />
        </div>
      </div>
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
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
            <span className="text-slate-500">/</span>
            <span className="text-slate-200">Offers</span>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                <MdLocalOffer size={22} color="#fbbf24" />
              </div>
              <div>
                <h1 className="text-white text-3xl font-family-bold tracking-tight !m-0 leading-tight">
                  Special{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
                    Coupons
                  </span>
                </h1>
                <p className="text-slate-400 text-sm !mt-1 !m-0 font-family-regular">
                  {loading ? "Loading offers..." : `${Coupons.length} offer${Coupons.length !== 1 ? "s" : ""} available`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTENT LAYOUT ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 !-mt-12 !pb-24">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : Coupons?.length === 0 ? (
          <div className="py-16 bg-white rounded-3xl !border !border-slate-100 text-center shadow-sm">
            <div className="w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center !border !border-slate-150/85 shadow-[0_2px_10px_rgba(0,0,0,0.01)] text-slate-450 !mb-4 mx-auto">
              <MdLocalOffer size={22} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-family-semibold text-slate-800 !m-0 !mb-1">
              No Coupons Available
            </h3>
            <p className="text-xs text-slate-400 font-family-medium max-w-xs !m-0 mx-auto leading-relaxed">
              You don't have any special offers or coupons assigned yet. Check back soon for exclusive commuter deals!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Coupons?.map((item, index) => (
              <div
                key={index}
                onClick={() => handleShow(item)}
                className={`relative bg-white !border !border-slate-100 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer ${mounted ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                style={{ animationDelay: `${100 + index * 60}ms` }}
              >

                {/* Ticket side notches */}
                <div className="absolute top-1/2 -left-2 w-4 h-4 bg-slate-50/50 rounded-full !border !border-slate-150/40 z-10" />
                <div className="absolute top-1/2 -right-2 w-4 h-4 bg-slate-50/50 rounded-full !border !border-slate-150/40 z-10" />

                <div className="p-3.5 flex gap-3 items-start relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <FaTag className="text-amber-600" size={15} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-sm font-family-bold text-slate-800 truncate !m-0 leading-tight">
                      {item?.title}
                    </h3>

                    <div className="inline-flex items-center gap-1.5 !mt-2 bg-brand-50/50 !border !border-brand-100/60 rounded px-2 py-0.5">
                      <MdContentCopy size={10} className="text-brand-900" />
                      <span className="text-[11px] font-family-semibold text-brand-950 font-mono tracking-wider">
                        {item?.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 !mt-2.5">
                      {getDiscountLabel(item) && (
                        <span className="text-[10px] font-family-bold text-amber-900 bg-amber-100/80 rounded px-1.5 py-0.5 uppercase tracking-wide">
                          {getDiscountLabel(item)}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-family-medium">
                        Exp: {moment(item?.expirey_date).format("MMM DD, YYYY")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Coupon Modal */}
      <Modal
        centered
        show={show}
        onHide={handleClose}
        style={{ borderRadius: 16, overflow: "hidden" }}
        size="sm"
      >
        <div className="relative text-center px-4 py-4 bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 w-6 h-6 rounded bg-white/10 hover:bg-white/20 border-none text-white text-[10px] flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>

          <h2 className="text-white text-base font-family-bold !m-0">Special Offer</h2>
          <p className="text-slate-400 text-[11px] !mt-0.5 !m-0 font-family-regular">Use this coupon code to save</p>
        </div>

        <div className="p-4 text-center">
          <p className="text-xs text-slate-500 font-family-semibold !m-0 !mb-3 leading-normal">
            {CouponCode?.title}
          </p>

          {getDiscountLabel(CouponCode) && (
            <div className="inline-flex items-center gap-1.5 bg-amber-50 !border !border-amber-200 rounded px-2.5 py-0.5 !mb-3">
              <FaPercentage size={9} className="text-amber-700" />
              <span className="text-[11px] font-family-bold text-amber-800">
                {getDiscountLabel(CouponCode)}
              </span>
            </div>
          )}

          <div className="bg-slate-50 !border !border-dashed !border-slate-300 rounded-lg p-2.5 flex items-center justify-between gap-2 !mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <MdContentCopy size={13} className="text-slate-400" />
              <span className="text-xs font-family-bold text-slate-800 font-mono tracking-widest truncate">
                {CouponCode?.code}
              </span>
            </div>
            <button
              onClick={() => handleCopy(CouponCode?.code)}
              className={`px-3 py-1 rounded text-white font-family-semibold text-[11px] border-none cursor-pointer transition-colors ${copied ? "bg-emerald-600" : "bg-brand-900 hover:bg-brand-950"
                }`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 font-family-medium !m-0">
            Expires: {moment(CouponCode?.expirey_date).format("MMM DD, YYYY")}
          </p>
        </div>
      </Modal>
    </div>
  );
}
