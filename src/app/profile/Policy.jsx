"use client"
import React, { useEffect, useState } from 'react'

export default function Policy() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.cabkn.com/api/users/privacy")
      .then((res) => res.json())
      .then((data) => {
        setContent(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className={mounted ? 'animate-fade-in-up' : 'opacity-0'}>
      <h2 className="font-family-semibold" style={{ fontSize: 18, color: "#1f2937", margin: "0 0 16px" }}>Privacy & Policy</h2>
      {loading ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{ width: 28, height: 28, border: "2px solid #e5e7eb", borderTopColor: "#004a70", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
        </div>
      ) : content?.privacy?.description ? (
        <div className="profile-policy-content" dangerouslySetInnerHTML={{ __html: content.privacy.description }} />
      ) : (
        <p className="font-family-regular" style={{ color: "#9ca3af", fontSize: 14 }}>No content available.</p>
      )}
      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        :global(.profile-policy-content) {
          font-family: var(--font-poppins-local);
          font-size: 14px;
          line-height: 1.7;
          color: #374151;
        }
        :global(.profile-policy-content h1),
        :global(.profile-policy-content h2),
        :global(.profile-policy-content h3),
        :global(.profile-policy-content h4) {
          font-family: var(--font-poppins-local);
          font-weight: 600;
          color: #1f2937;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        :global(.profile-policy-content h2) { font-size: 16px; }
        :global(.profile-policy-content h3) { font-size: 15px; }
        :global(.profile-policy-content p) { margin-bottom: 12px; }
        :global(.profile-policy-content ul),
        :global(.profile-policy-content ol) { padding-left: 20px; margin-bottom: 12px; }
        :global(.profile-policy-content li) { margin-bottom: 6px; }
      `}</style>
    </div>
  )
}
