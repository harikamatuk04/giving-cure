const Inventory = require("../models/Inventory");
const { checkAndCreateMatchNotifications } = require("../utils/matchHelper");

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
    
    // Validate required fields
    const { org, city, item, qty, expiry } = req.body;
    if (!org || !city || !item || qty === undefined || !expiry) {
      return res.status(400).json({ 
        error: "Validation error", 
        details: "All fields (org, city, item, qty, expiry) are required" 
      });
    }
    
    // Validate qty is a number
    if (isNaN(Number(qty)) || Number(qty) <= 0) {
      return res.status(400).json({ 
        error: "Validation error", 
        details: "Quantity must be a positive number" 
      });
    }
    
    // Check if an inventory item with the same org, item, and expiry already exists
    const existingItem = await Inventory.findOne({
      org: org,
      item: item,
      expiry: expiry
    });
    
    let resultItem;
    if (existingItem) {
      // If exists, update the quantity by adding the new quantity to existing quantity
      existingItem.qty = existingItem.qty + Number(qty);
      resultItem = await existingItem.save();
      console.log(`Updated existing inventory item ${existingItem._id}: added ${qty} to existing ${existingItem.qty - Number(qty)}, new total: ${resultItem.qty}`);
    } else {
      // If not exists, create a new inventory item
      resultItem = await Inventory.create({
        org,
        city,
        item,
        qty: Number(qty),
        expiry
      });
      console.log(`Created new inventory item ${resultItem._id}`);
    }
    
    // Check for potential matches after adding/updating inventory
    await checkAndCreateMatchNotifications();
    
    res.json(resultItem);
  } catch (error) {
    console.error("Add Inventory Error:", error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ 
        error: "Validation error", 
        details: validationErrors 
      });
    }
    
    // Handle MongoDB connection errors
    if (error.name === 'MongoServerError' || error.message.includes('buffering')) {
      return res.status(503).json({ 
        error: "Database connection error", 
        details: "Cannot connect to MongoDB. Please check your connection." 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to add inventory", 
      details: error.message 
    });
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
    // Convert qty to number if provided
    const updateData = { ...req.body };
    if (updateData.qty !== undefined) {
      updateData.qty = Number(updateData.qty);
    }
    
    const updated = await Inventory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    // Check for potential matches after updating inventory
    await checkAndCreateMatchNotifications();
    
    res.json(updated);
  } catch (error) {
    console.error("Update Inventory Error:", error);
    res.status(500).json({ error: "Failed to update inventory", details: error.message });
  }
};

