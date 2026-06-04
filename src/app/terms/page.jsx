import Link from "next/link";

export default function TermsPage() {
  return (
    <section className="bg-white min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white rounded-xl p-8 text-gray-800 shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Terms & Conditions</h1>
        <section className="space-y-4">
          <p>
            This is a placeholder terms and conditions page for CabKN. Replace this content with your actual legal text.
          </p>
          <h2 className="text-xl font-semibold mt-4">User Agreement</h2>
          <p>
            By using our service, you agree to the following terms: ... (add detailed clauses here).
          </p>
          <h2 className="text-xl font-semibold mt-4">Liability</h2>
          <p>
            We are not liable for any indirect or consequential damages arising from the use of our platform.
          </p>
          <h2 className="text-xl font-semibold mt-4">Contact</h2>
          <p>
            If you have any questions about these terms, feel free to contact us via the "Contact Us" section in the footer.
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
