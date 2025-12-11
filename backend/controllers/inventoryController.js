const Inventory = require("../models/Inventory");

// GET ALL INVENTORY
exports.getInventory = async (req, res) => {
  const items = await Inventory.find();
  res.json(items);
};

// ADD INVENTORY
exports.addInventory = async (req, res) => {
  const newItem = await Inventory.create(req.body);
  res.json(newItem);
};

// DELETE INVENTORY
exports.deleteInventory = async (req, res) => {
  await Inventory.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

// UPDATE INVENTORY
exports.updateInventory = async (req, res) => {
  const updated = await Inventory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
};

