require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const inventoryRoutes = require("./routes/inventoryRoutes");
const requestRoutes = require("./routes/requestRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/inventory", inventoryRoutes);
app.use("/api/requests", requestRoutes);

// Simple data viewer endpoint (for development)
app.get("/api/view", async (req, res) => {
  try {
    const Inventory = require("./models/Inventory");
    const Request = require("./models/Request");
    const inventories = await Inventory.find();
    const requests = await Request.find();
    res.json({ inventories, requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
