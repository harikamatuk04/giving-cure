const express = require("express");
const router = express.Router();
const {
  sendVerificationCode,
  verifyCode,
  createPassword,
  signIn,
  getCurrentUser,
  deleteAccount,
  sendPasswordResetCode,
  verifyPasswordResetCode,
  resetPassword
} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/send-code", sendVerificationCode);
router.post("/verify-code", verifyCode);
router.post("/create-password", createPassword);
router.post("/signin", signIn);
router.post("/forgot-password", sendPasswordResetCode);
router.post("/verify-reset-code", verifyPasswordResetCode);
router.post("/reset-password", resetPassword);
router.get("/me", authenticate, getCurrentUser);
router.delete("/delete-account", authenticate, deleteAccount);

module.exports = router;

