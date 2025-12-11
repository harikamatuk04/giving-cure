const Notification = require("../models/Notification");

// GET ALL NOTIFICATIONS (newest first)
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({ error: "Failed to fetch notifications", details: error.message });
  }
};

// DELETE NOTIFICATION
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    res.status(500).json({ error: "Failed to delete notification", details: error.message });
  }
};

// CREATE NOTIFICATION (helper function, can be called from other controllers)
exports.createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    return notification;
  } catch (error) {
    console.error("Create Notification Error:", error);
    throw error;
  }
};

