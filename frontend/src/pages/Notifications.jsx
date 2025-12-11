export default function Notifications() {
    const notifications = [
      { id: 1, message: "Match proposed: N95 Masks from Northwestern Memorial → Carle Hospital" },
      { id: 2, message: "Match proposed: IV Sets from Rush University → OSF Heart of Mary" },
    ];
  
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6 text-center">
          Notifications
        </h1>
        <div className="bg-white rounded-2xl shadow p-6">
          <ul className="space-y-3">
            {notifications.map(n => (
              <li key={n.id} className="border-b pb-2 text-gray-700 text-sm">
                {n.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  