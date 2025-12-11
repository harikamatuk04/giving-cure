const Inventory = require("../models/Inventory");

// GET ALL INVENTORY
exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (error) {
    console.error("Get Inventory Error:", error);
    res.status(500).json({ error: "Failed to fetch inventory", details: error.message });
  }
};

// ADD INVENTORY
exports.addInventory = async (req, res) => {
  try {
    console.log("Incoming inventory payload:", req.body);
    const newItem = await Inventory.create(req.body);
    res.json(newItem);
  } catch (error) {
    console.error("Add Inventory Error:", error);
    res.status(500).json({ error: "Failed to add inventory", details: error.message });
  }
};

// DELETE INVENTORY
exports.deleteInventory = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete Inventory Error:", error);
    res.status(500).json({ error: "Failed to delete inventory", details: error.message });
  }
};

// UPDATE INVENTORY
exports.updateInventory = async (req, res) => {
  try {
    const updated = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    console.error("Update Inventory Error:", error);
    res.status(500).json({ error: "Failed to update inventory", details: error.message });
  }
};

