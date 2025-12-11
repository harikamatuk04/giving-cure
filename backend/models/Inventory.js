const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
  org: { type: String, required: true },
  city: { type: String, required: true },
  item: { type: String, required: true },
  qty: { type: Number, required: true },
  expiry: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Inventory", InventorySchema);
