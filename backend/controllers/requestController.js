const Request = require("../models/Request");

// GET ALL REQUESTS
exports.getRequests = async (req, res) => {
  const items = await Request.find();
  res.json(items);
};

// ADD REQUEST
exports.addRequest = async (req, res) => {
  const newRequest = await Request.create(req.body);
  res.json(newRequest);
};

// DELETE REQUEST
exports.deleteRequest = async (req, res) => {
  await Request.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

// UPDATE REQUEST
exports.updateRequest = async (req, res) => {
  const updated = await Request.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
};
