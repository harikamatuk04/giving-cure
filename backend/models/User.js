const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: false // Password not required until user creates it
  },
  hospital: { 
    type: String, 
    required: true 
  },
  emailVerified: { 
    type: Boolean, 
    default: false 
  },
  verificationCode: { 
    type: String 
  },
  codeExpiry: { 
    type: Date 
  }
}, { timestamps: true });

// Note: Password hashing is handled in the controller, not in pre-save hook
// This avoids issues with Mongoose version compatibility

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false; // No password set yet
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);

