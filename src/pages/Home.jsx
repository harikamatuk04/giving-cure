import React from "react";

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      {/* Hero Section (your current section) */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-indigo-700 mb-4">
          Our Mission
        </h1>
        <p className="text-gray-600 mb-12 text-lg">
          Giving CURE connects healthcare organizations to share life-saving
          supplies efficiently — reducing waste and increasing accessibility
          across communities.
        </p>

        <div className="grid md:grid-cols-3 gap-6 text-indigo-700 font-semibold">
          <div className="bg-indigo-50 rounded-2xl p-6 shadow">
            <h2 className="text-3xl mb-2">300+</h2>
            <p>Hospitals Participating</p>
          </div>
          <div className="bg-indigo-50 rounded-2xl p-6 shadow">
            <h2 className="text-3xl mb-2">25,000+</h2>
            <p>Supplies Matched</p>
          </div>
          <div className="bg-indigo-50 rounded-2xl p-6 shadow">
            <h2 className="text-3xl mb-2">40%</h2>
            <p>Reduction in Wastage</p>
          </div>
        </div>
      </section>

      {/* Purpose Section */}
      <section className="max-w-5xl mx-auto px-6 py-12 text-center">
        <h2 className="text-3xl font-semibold text-indigo-700 mb-4">
          Our Purpose
        </h2>
        <p className="text-lg leading-relaxed text-gray-700">
          Giving CURE advances health equity by redistributing medical supplies
          from Rush to under-resourced hospitals — nationally and internationally —
          in an accessible and patient-centered manner. Through accountability
          and increasing equity, we strive to ensure that no usable supply goes
          to waste and every shipment contributes to healing, dignity, and hope.
        </p>
      </section>

      {/* Mission Statement */}
      <section className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-indigo-700 mb-4">
            Our Mission Statement
          </h2>
          <p className="text-lg leading-relaxed text-gray-700">
            “Giving CURE reduces global health disparities by rescuing surplus
            inventory and mobilizing need-matched medical supplies to
            under-resourced hospitals and communities both domestically and
            abroad. Guided by accountability and equity, we prevent waste by
            ensuring no usable supply is discarded. Through informed and
            collaborative planning we match the right supplies to the right
            clinical setting — strengthening hospital capacity, advancing
            environmental stewardship, and upholding patient dignity.
            Collaboratively we equip those in need with supplies that bear
            inherent medical value but also embody a message of solidarity,
            respect, and compassion.”
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="max-w-5xl mx-auto px-6 py-12 text-center">
        <h2 className="text-3xl font-semibold text-indigo-700 mb-6">
          The Giving CURE Values
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-lg font-semibold">
          <div className="bg-white rounded-xl shadow p-4 border-t-4 border-indigo-600">
            Compassion
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-t-4 border-indigo-600">
            Unity
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-t-4 border-indigo-600">
            Responsibility
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-t-4 border-indigo-600">
            Equity
          </div>
        </div>
      </section>

      {/* Motto Section */}
      <section className="bg-gradient-to-r from-indigo-700 to-blue-600 text-white py-16 text-center">
        <h2 className="text-3xl font-semibold mb-3">Our Motto</h2>
        <p className="text-2xl font-light italic">
          “Delivering Care. Giving Cure.”
        </p>
      </section>

      {/* Impact Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-semibold text-indigo-700 mb-4">
          Our Impact
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          From local hospitals to international clinics, Giving CURE’s outreach
          helps close the global gap in access to medical care. By ensuring no
          usable supply goes to waste, every shipment we send strengthens
          hospital capacity, advances sustainability, and upholds the dignity of
          patients worldwide.
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 text-center text-sm">
        © {new Date().getFullYear()} Giving CURE — Advancing Health Equity
      </footer>
    </div>
  );
}
