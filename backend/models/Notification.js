const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ["request_added", "request_modified"] },
  requestId: { type: String, required: true },
  hospital: { type: String, required: true },
  city: { type: String, required: true },
  item: { type: String, required: true },
  quantity: { type: Number, required: true },
  urgency: { type: String },
  message: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);

