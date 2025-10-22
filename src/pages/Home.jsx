export default function Home() {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-indigo-700 mb-4">
          Our Mission
        </h1>
        <p className="text-gray-600 mb-12">
          Giving Cure connects healthcare organizations to share life-saving
          supplies efficiently — reducing waste and increasing accessibility
          across communities.
        </p>
  
        <div className="grid md:grid-cols-3 gap-6 text-indigo-700 font-semibold">
          <div className="bg-indigo-50 rounded-2xl p-6 shadow">
            <h2 className="text-3xl mb-2">300+</h2>
            <p>Hospitals Participating</p>
          </div>
          <div className="bg-indigo-50 rounded-2xl p-6 shadow">
            <h2 className="text-3xl mb-2">25 000+</h2>
            <p>Supplies Matched</p>
          </div>
          <div className="bg-indigo-50 rounded-2xl p-6 shadow">
            <h2 className="text-3xl mb-2">40%</h2>
            <p>Reduction in Wastage</p>
          </div>
        </div>
      </div>
    );
  }
  