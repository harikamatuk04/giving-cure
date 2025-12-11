const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  org: { type: String, required: true },
  city: { type: String, required: true },
  item: { type: String, required: true },
  qty: { type: Number, required: true },
  expiry: { type: String, required: true },
});

module.exports = mongoose.model("Inventory", inventorySchema);