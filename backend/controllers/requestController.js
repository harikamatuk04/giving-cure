const Request = require("../models/Request");

// GET ALL REQUESTS
exports.getRequests = async (req, res) => {
  try {
    const items = await Request.find();
    res.json(items);
  } catch (error) {
    console.error("Get Requests Error:", error);
    res.status(500).json({ error: "Failed to fetch requests", details: error.message });
  }
};

// ADD REQUEST
exports.addRequest = async (req, res) => {
  try {
    console.log("Incoming request payload:", req.body);
    const newRequest = await Request.create(req.body);
    res.json(newRequest);
  } catch (error) {
    console.error("Add request error:", error);
    res.status(500).json({ error: "Failed to add request", details: error.message });
  }
};

// DELETE REQUEST
exports.deleteRequest = async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete Request Error:", error);
    res.status(500).json({ error: "Failed to delete request", details: error.message });
  }
};

// UPDATE REQUEST
exports.updateRequest = async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    console.error("Update Request Error:", error);
    res.status(500).json({ error: "Failed to update request", details: error.message });
  }
};
