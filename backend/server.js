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

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
