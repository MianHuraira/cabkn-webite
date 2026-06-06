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
      <div className={mounted ? 'animate-fade-in-down' : 'opacity-0'} style={{ background: "linear-gradient(135deg, #004a70 0%, #002d47 100%)", padding: "28px 0 44px", animationDelay: "50ms" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Home</Link>
            <FaChevronRight size={8} />
            <span>Terms & Conditions</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
            <FaFileContract size={24} />
            Terms & Conditions
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className={mounted ? 'animate-fade-in-up' : 'opacity-0'} style={{ maxWidth: 1200, margin: "-28px auto 0", padding: "0 16px 48px", animationDelay: "150ms" }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: "clamp(20px, 3vw, 40px)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#004a70", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: "#9ca3af", fontFamily: "Inter-Regular", fontSize: 14, margin: 0 }}>Loading...</p>
            </div>
          ) : content?.terms?.description ? (
            <div
              className="terms-content"
              dangerouslySetInnerHTML={{ __html: content.terms.description }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p style={{ color: "#9ca3af", fontFamily: "Inter-Regular", fontSize: 14, margin: 0 }}>No terms content available at the moment.</p>
            </div>
          )}

          <div style={{ marginTop: 32, textAlign: "center", paddingTop: 24, borderTop: "1px solid #f0f0f0" }}>
            <Link href="/" className="hover:-translate-y-0.5 hover:shadow-lg" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #004a70 0%, #002d47 100%)", color: "#fff", fontFamily: "Inter-SemiBold", fontSize: 14, padding: "10px 28px", borderRadius: 9999, textDecoration: "none", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,74,112,0.2)" }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .terms-content {
          font-family: "Inter-Regular", sans-serif;
          font-size: 15px;
          line-height: 1.8;
          color: #374151;
        }
        .terms-content h1, .terms-content h2, .terms-content h3, .terms-content h4 {
          font-family: "Inter-SemiBold", sans-serif;
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
        .terms-content strong { font-family: "Inter-SemiBold"; }
      `}</style>
    </div>
  );
}
