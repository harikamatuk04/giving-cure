const express = require("express");
const router = express.Router();

const {
  getRequests,
  addRequest,
  deleteRequest,
  updateRequest
} = require("../controllers/requestController");

router.get("/", getRequests);
router.post("/", addRequest);
router.delete("/:id", deleteRequest);
router.put("/:id", updateRequest);

module.exports = router;
