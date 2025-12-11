require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const inventoryRoutes = require("./routes/inventoryRoutes");
const requestRoutes = require("./routes/requestRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.error("Please ensure MongoDB is running and MONGO_URI is correct");
  });

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

// Routes
app.use("/api/inventory", inventoryRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/notifications", notificationRoutes);

// Simple data viewer endpoint (for development)
app.get("/api/view", async (req, res) => {
  try {
    const Inventory = require("./models/Inventory");
    const Request = require("./models/Request");
    const Notification = require("./models/Notification");
    const inventories = await Inventory.find();
    const requests = await Request.find();
    const notifications = await Notification.find();
    res.json({ 
      inventories, 
      requests, 
      notifications,
      summary: {
        totalInventories: inventories.length,
        totalRequests: requests.length,
        totalNotifications: notifications.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
