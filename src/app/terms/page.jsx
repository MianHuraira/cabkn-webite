"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaFileContract, FaChevronRight } from "react-icons/fa";

export default function TermsPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch("https://api.cabkn.com/api/users/terms")
      .then((res) => res.json())
      .then((data) => {
        setContent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className={mounted ? 'animate-fade-in' : 'opacity-0'} style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <section className={`relative overflow-hidden bg-gradient-to-br from-[#001726] via-[#002f4a] to-[#001f33] !pt-20 sm:!pt-24 !pb-14 sm:!pb-16 text-white ${mounted ? 'animate-fade-in-down' : 'opacity-0'}`} style={{ animationDelay: "50ms" }}>
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001726]/90 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-family-medium mb-3">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors no-underline">Home</Link>
            <span className="text-slate-400">/</span>
            <span className="text-white font-family-semibold">Terms & Conditions</span>
          </div>
          <h1 className="font-family-semibold text-white text-2xl sm:text-3xl m-0">
            Terms & Conditions
          </h1>
        </div>
      </section>

      {/* Content */}
      <div className={mounted ? 'animate-fade-in-up' : 'opacity-0'} style={{ maxWidth: 1200, margin: "-20px auto 0", padding: "0 16px 48px", animationDelay: "150ms", position: "relative", zIndex: 20 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: "clamp(20px, 3vw, 40px)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#004a70", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <p className="font-family-regular" style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>Loading...</p>
            </div>
          ) : content?.terms?.description ? (
            <div
              className="terms-content"
              dangerouslySetInnerHTML={{ __html: content.terms.description }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p className="font-family-regular" style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>No terms content available at the moment.</p>
            </div>
          )}

          <div style={{ marginTop: 32, textAlign: "center", paddingTop: 24, borderTop: "1px solid #f0f0f0" }}>
            <Link href="/" className="hover:-translate-y-0.5 hover:shadow-lg font-family-semibold" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #004a70 0%, #002d47 100%)", color: "#fff", fontSize: 14, padding: "10px 28px", borderRadius: 9999, textDecoration: "none", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,74,112,0.2)" }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .terms-content {
          font-family: var(--font-poppins-local);
          font-size: 15px;
          line-height: 1.8;
          color: #374151;
        }
        .terms-content h1, .terms-content h2, .terms-content h3, .terms-content h4 {
          font-family: var(--font-poppins-local);
          color: #1f2937;
          margin-top: 28px;
          margin-bottom: 12px;
        }
        .terms-content h1 { font-size: 22px; }
        .terms-content h2 { font-size: 18px; }
        .terms-content h3 { font-size: 16px; }
        .terms-content p { margin-bottom: 14px; }
        .terms-content ul, .terms-content ol { padding-left: 24px; margin-bottom: 14px; }
        .terms-content li { margin-bottom: 8px; }
        .terms-content a { color: #004a70; text-decoration: underline; }
        .terms-content strong { font-family: var(--font-poppins-local); }
      `}</style>
    </div>
  );
}
