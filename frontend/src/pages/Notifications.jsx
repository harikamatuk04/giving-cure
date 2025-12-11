import React, { useState, useEffect } from "react";
import { getNotifications, deleteNotification } from "../api/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = async () => {
    try {
      setError(null);
      const response = await getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      loadNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getNotificationColors = (type, urgency) => {
    // Base colors for notification type
    const typeColors = {
      request_added: {
        border: "border-l-4 border-l-green-500",
        bg: "bg-green-50",
        badge: "bg-green-100 text-green-800",
        badgeText: "New Request"
      },
      request_modified: {
        border: "border-l-4 border-l-orange-500",
        bg: "bg-orange-50",
        badge: "bg-orange-100 text-orange-800",
        badgeText: "Modified"
      }
    };

    // Urgency colors
    const urgencyColors = {
      High: "bg-red-100 text-red-800 border-red-300",
      Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Low: "bg-blue-100 text-blue-800 border-blue-300"
    };

    return {
      ...typeColors[type],
      urgencyColor: urgencyColors[urgency] || "bg-gray-100 text-gray-800 border-gray-300"
    };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">
          Notifications
        </h1>
        <button
          onClick={loadNotifications}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow p-6">
        {loading && notifications.length === 0 ? (
          <div className="text-center text-gray-500">Loading notifications...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500">
            No notifications yet. Create or edit a request to see notifications here.
          </div>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => {
              const colors = getNotificationColors(n.type, n.urgency);
              return (
                <li 
                  key={n._id} 
                  className={`${colors.border} ${colors.bg} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`${colors.badge} px-2 py-1 rounded text-xs font-semibold`}>
                          {colors.badgeText}
                        </span>
                        {n.urgency && (
                          <span className={`${colors.urgencyColor} px-2 py-1 rounded text-xs font-semibold border`}>
                            {n.urgency} Priority
                          </span>
                        )}
                      </div>
                      <div className="text-gray-800 text-sm font-medium mb-1">{n.message}</div>
                      <div className="text-xs text-gray-600 mt-2">
                        <span className="font-mono text-gray-500">ID: {n.requestId.slice(-8)}</span> • {formatDate(n.createdAt)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(n._id)}
                      className="text-red-500 hover:text-red-700 ml-4 hover:bg-red-50 rounded p-1 transition-colors"
                      title="Delete notification"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
  