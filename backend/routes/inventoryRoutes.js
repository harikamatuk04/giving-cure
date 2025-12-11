const express = require("express");
const router = express.Router();

const {
  getInventory,
  addInventory,
  deleteInventory,
  updateInventory
} = require("../controllers/inventoryController");

router.get("/", getInventory);
router.post("/", addInventory);
router.delete("/:id", deleteInventory);
router.put("/:id", updateInventory);

module.exports = router;
