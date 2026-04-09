const User = require("../models/User");
const { validateEmailDomain } = require("../utils/emailValidation");
const { generateVerificationCode, sendVerificationCode } = require("../utils/emailService");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const AUTH_ADMIN_ONLY = process.env.AUTH_ADMIN_ONLY === "true";
const ADMIN_EMAIL = (process.env.ADMIN_LOGIN_EMAIL || "").toLowerCase().trim();
const ADMIN_USERNAME = (process.env.ADMIN_LOGIN_USERNAME || "GivingCureAdmin").trim();
const ADMIN_PASSWORD = (process.env.ADMIN_LOGIN_PASSWORD || "givingcurepass1@").trim();

const resolveAdminEmailFromIdentifier = (identifier) => {
  if (!AUTH_ADMIN_ONLY) return identifier;
  if (!identifier) return "";

  const normalized = identifier.toLowerCase().trim();
  if (normalized.includes("@")) return normalized;
  if (ADMIN_USERNAME && identifier.trim() === ADMIN_USERNAME) {
    return ADMIN_EMAIL;
  }
  return normalized;
};

const isAdminOnlyBlocked = (identifier) => {
  if (!AUTH_ADMIN_ONLY) return false;
  if (!ADMIN_EMAIL) return true;
  const resolvedEmail = resolveAdminEmailFromIdentifier(identifier);
  return resolvedEmail !== ADMIN_EMAIL;
};

const adminOnlyDisabledResponse = (res) =>
  res.status(403).json({
    error:
      "Sign-up and password reset are temporarily disabled. Please use the shared admin account.",
  });

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

// Step 1: Submit email and send verification code
exports.sendVerificationCode = async (req, res) => {
  try {
    console.log("\n📥 Received request to send verification code");
    const { email, isPasswordReset } = req.body;
    console.log("📧 Email received:", email);
    console.log("🔐 Is password reset:", isPasswordReset);
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (AUTH_ADMIN_ONLY) {
      return adminOnlyDisabledResponse(res);
    }
    
    // Validate email domain
    const validation = validateEmailDomain(email);
    console.log("✅ Email validation result:", validation);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    // For password reset, user must exist and be verified
    if (isPasswordReset) {
      if (!existingUser) {
        return res.status(400).json({ error: "Email not found. Please sign up first." });
      }
      if (!existingUser.emailVerified) {
        return res.status(400).json({ error: "Email not verified. Please verify your email first." });
      }
      if (!existingUser.password) {
        return res.status(400).json({ error: "No password set. Please sign up first." });
      }
    } else {
      // For sign up, user shouldn't already be registered
      if (existingUser && existingUser.emailVerified) {
        return res.status(400).json({ error: "Email already registered. Please sign in instead." });
      }
    }
    
    // Generate verification code
    const code = generateVerificationCode();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    console.log("🔑 Generated code:", code);
    
    if (existingUser) {
      // Update existing unverified user
      existingUser.verificationCode = code;
      existingUser.codeExpiry = codeExpiry;
      await existingUser.save();
      console.log("✅ Updated existing user");
    } else {
      // Create new user
      await User.create({
        email: email.toLowerCase(),
        hospital: validation.hospital,
        verificationCode: code,
        codeExpiry: codeExpiry,
        emailVerified: false
      });
      console.log("✅ Created new user");
    }
    
    // Send verification code
    console.log("📤 Calling sendVerificationCode function...");
    const emailResult = await sendVerificationCode(email, code);
    if (emailResult && emailResult.success) {
      console.log("✅ Email sent successfully");
      if (emailResult.emailId) {
        console.log(`📧 Track email: https://resend.com/emails/${emailResult.emailId}`);
      }
    } else if (emailResult && !emailResult.success) {
      console.warn(`⚠️  Email sending had issues: ${emailResult.error}`);
      console.warn(`⚠️  Verification code is still logged above and can be used`);
    }
    console.log("✅ sendVerificationCode completed");
    
    res.json({ 
      success: true, 
      message: "Verification code sent to your email",
      email: email.toLowerCase() // Return email for frontend to use
    });
  } catch (error) {
    console.error("❌ Send verification code error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Failed to send verification code", details: error.message });
  }
};

// Step 2: Verify code
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: "Email and verification code are required" });
    }

    if (AUTH_ADMIN_ONLY) {
      return adminOnlyDisabledResponse(res);
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(400).json({ error: "Email not found. Please request a new code." });
    }
    
    // Check if code matches
    if (user.verificationCode !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }
    
    // Check if code expired
    if (new Date() > user.codeExpiry) {
      return res.status(400).json({ error: "Verification code expired. Please request a new one." });
    }
    
    // Code is valid - mark email as verified (but password not set yet)
    user.emailVerified = true;
    user.verificationCode = null;
    user.codeExpiry = null;
    await user.save();
    
    res.json({ 
      success: true, 
      message: "Email verified successfully",
      email: user.email
    });
  } catch (error) {
    console.error("Verify code error:", error);
    res.status(500).json({ error: "Failed to verify code", details: error.message });
  }
};

// Step 3: Create password
exports.createPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (AUTH_ADMIN_ONLY) {
      return adminOnlyDisabledResponse(res);
    }
    
    // Validate password requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: "Password must be at least 8 characters with at least one uppercase letter, one number, and one special character" 
      });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    
    if (!user.emailVerified) {
      return res.status(400).json({ error: "Email not verified. Please verify your email first." });
    }
    
    // Hash password before saving
    const bcrypt = require("bcryptjs");
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    
    // Generate token and return user info
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        hospital: user.hospital
      }
    });
  } catch (error) {
    console.error("Create password error:", error);
    res.status(500).json({ error: "Failed to create password", details: error.message });
  }
};

// Sign in
exports.signIn = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = username || email;
    
    if (!identifier || !password) {
      return res.status(400).json({ error: "Username/email and password are required" });
    }

    if (isAdminOnlyBlocked(identifier)) {
      return res.status(403).json({
        error: "Only the shared admin credentials can sign in right now.",
      });
    }

    if (AUTH_ADMIN_ONLY) {
      if (!ADMIN_EMAIL) {
        return res.status(500).json({
          error: "Admin login is not configured. Please set ADMIN_LOGIN_EMAIL.",
        });
      }

      const isUsernameMatch = identifier.trim() === ADMIN_USERNAME;
      const isPasswordMatch = password === ADMIN_PASSWORD;
      if (!isUsernameMatch || !isPasswordMatch) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const adminUser = await User.findOne({ email: ADMIN_EMAIL });
      if (!adminUser) {
        return res.status(401).json({ error: "Admin account not found" });
      }
      if (!adminUser.emailVerified) {
        return res.status(401).json({ error: "Admin account is not verified" });
      }

      const token = generateToken(adminUser._id);
      return res.json({
        success: true,
        token,
        user: {
          id: adminUser._id,
          email: adminUser.email,
          hospital: adminUser.hospital,
        },
      });
    }

    const loginEmail = resolveAdminEmailFromIdentifier(identifier);
    
    const user = await User.findOne({ email: loginEmail.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    if (!user.emailVerified) {
      return res.status(401).json({ error: "Email not verified. Please verify your email first." });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        hospital: user.hospital
      }
    });
  } catch (error) {
    console.error("Sign in error:", error);
    res.status(500).json({ error: "Failed to sign in", details: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password -verificationCode");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Failed to get user", details: error.message });
  }
};

// Forgot password - send reset code
exports.sendPasswordResetCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (AUTH_ADMIN_ONLY) {
      return adminOnlyDisabledResponse(res);
    }
    
    // Validate email domain
    const validation = validateEmailDomain(email);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(400).json({ error: "Email not found. Please sign up first." });
    }
    
    if (!user.emailVerified) {
      return res.status(400).json({ error: "Email not verified. Please verify your email first." });
    }
    
    // Generate verification code
    const code = generateVerificationCode();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Store code for password reset
    user.verificationCode = code;
    user.codeExpiry = codeExpiry;
    await user.save();
    
    // Send verification code
    const emailResult = await sendVerificationCode(email, code);
    
    res.json({ 
      success: true, 
      message: "Password reset code sent to your email",
      email: email.toLowerCase()
    });
  } catch (error) {
    console.error("Send password reset code error:", error);
    res.status(500).json({ error: "Failed to send password reset code", details: error.message });
  }
};

// Verify password reset code
exports.verifyPasswordResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: "Email and verification code are required" });
    }

    if (AUTH_ADMIN_ONLY) {
      return adminOnlyDisabledResponse(res);
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(400).json({ error: "Email not found." });
    }
    
    // Check if code matches
    if (user.verificationCode !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }
    
    // Check if code expired
    if (new Date() > user.codeExpiry) {
      return res.status(400).json({ error: "Verification code expired. Please request a new one." });
    }
    
    // Code is valid - don't clear it yet, keep it for password reset
    res.json({ 
      success: true, 
      message: "Code verified successfully",
      email: user.email
    });
  } catch (error) {
    console.error("Verify password reset code error:", error);
    res.status(500).json({ error: "Failed to verify code", details: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;
    
    if (!email || !code || !password) {
      return res.status(400).json({ error: "Email, verification code, and password are required" });
    }

    if (AUTH_ADMIN_ONLY) {
      return adminOnlyDisabledResponse(res);
    }
    
    // Validate password requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: "Password must be at least 8 characters with at least one uppercase letter, one number, and one special character" 
      });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    
    // Verify code again
    if (user.verificationCode !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }
    
    if (new Date() > user.codeExpiry) {
      return res.status(400).json({ error: "Verification code expired. Please request a new one." });
    }
    
    // Hash and update password
    const bcrypt = require("bcryptjs");
    user.password = await bcrypt.hash(password, 10);
    user.verificationCode = null;
    user.codeExpiry = null;
    await user.save();
    
    // Generate token and return user info
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      message: "Password reset successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        hospital: user.hospital
      }
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password", details: error.message });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    if (AUTH_ADMIN_ONLY) {
      return res.status(403).json({
        error: "Account deletion is disabled while admin-only mode is enabled.",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    await User.findByIdAndDelete(req.userId);
    console.log(`✅ Account deleted: ${user.email}`);
    
    res.json({ 
      success: true, 
      message: "Account deleted successfully" 
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ error: "Failed to delete account", details: error.message });
  }
};

