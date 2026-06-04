import Link from "next/link";

export default function PrivacyPage() {
  return (
    <section className="bg-white min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white rounded-xl p-8 text-gray-800 shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>
        <section className="space-y-4">
          <p>
            Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal information when you use the CabKN service.
          </p>
          <h2 className="text-xl font-semibold mt-4">Information We Collect</h2>
          <p>
            We may collect personal data such as your name, email address, phone number, and location when you create an account or use our services. We also collect usage data to improve our platform.
          </p>
          <h2 className="text-xl font-semibold mt-4">How We Use Your Data</h2>
          <p>
            Your information helps us provide and enhance ride‑booking services, process payments, and communicate important updates. We never sell your personal data to third parties.
          </p>
          <h2 className="text-xl font-semibold mt-4">Data Security</h2>
          <p>
            We implement industry‑standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
          </p>
          <h2 className="text-xl font-semibold mt-4">Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data by contacting us at support@cabkn.com.
          </p>
        </section>
        <div className="mt-8 text-center">
          <Link href="/" className="inline-block bg-[#004a70] text-white font-semibold py-2 px-6 rounded hover:bg-[#003d5e] transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
