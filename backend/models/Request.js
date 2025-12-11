const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  org: { type: String, required: true },
  city: { type: String, required: true },
  item: { type: String, required: true },
  qty: { type: Number, required: true },
  urgency: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Request", RequestSchema);
