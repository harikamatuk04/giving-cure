const Request = require("../models/Request");
const Notification = require("../models/Notification");
const { checkAndCreateMatchNotifications } = require("../utils/matchHelper");

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
    
    // Create notification for new request
    const message = `${req.body.org} requests ${req.body.qty} of ${req.body.item} (Urgency: ${req.body.urgency})`;
    await Notification.create({
      type: "request_added",
      requestId: newRequest._id.toString(),
      hospital: req.body.org,
      city: req.body.city,
      item: req.body.item,
      quantity: req.body.qty,
      urgency: req.body.urgency,
      message: message
    });
    
    // Check for potential matches after creating request
    await checkAndCreateMatchNotifications();
    
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
    
    // Create notification for modified request
    const hospital = req.body.org || updated.org;
    const qty = req.body.qty || updated.qty;
    const item = req.body.item || updated.item;
    const urgency = req.body.urgency || updated.urgency;
    const message = `Request from ${hospital} was modified: ${qty} of ${item} (Urgency: ${urgency})`;
    await Notification.create({
      type: "request_modified",
      requestId: req.params.id,
      hospital: hospital,
      city: req.body.city || updated.city,
      item: item,
      quantity: qty,
      urgency: urgency,
      message: message
    });
    
    res.json(updated);
  } catch (error) {
    console.error("Update Request Error:", error);
    res.status(500).json({ error: "Failed to update request", details: error.message });
  }
};
