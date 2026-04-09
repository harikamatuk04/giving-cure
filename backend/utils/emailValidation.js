// Email validation utility
// Validates email domains based on environment

const getHospitalFromEmail = (email) => {
  const domain = email.split("@")[1]?.toLowerCase();
  
  // Production: Only allow @rush.edu
  if (process.env.NODE_ENV === "production") {
    if (domain === "rush.edu") {
      return "RUSH";
    }
    return null; // Invalid domain in production
  }
  
  // Development: Allow @rush.edu and test emails
  // Add your personal email here for testing
  const allowedTestEmails = [
    "harikam.style@gmail.com", // Your personal email for testing
  ];
  
  // You can also set it via environment variable: TEST_EMAILS="email1@test.com,email2@test.com"
  const envTestEmails = process.env.TEST_EMAILS?.split(",").map(e => e.trim()) || [];
  const allTestEmails = [...allowedTestEmails, ...envTestEmails];
  
  // Check if it's a test email (add your email to allowedTestEmails array or TEST_EMAILS env var)
  if (allTestEmails.some(testEmail => email.toLowerCase() === testEmail.toLowerCase())) {
    return "RUSH"; // Treat test emails as RUSH for development
  }
  
  // Check if it's @rush.edu
  if (domain === "rush.edu") {
    return "RUSH";
  }
  
  // Development: Allow any email for testing (you can restrict this if needed)
  // For now, we'll allow any email in development and assign to RUSH
  return "RUSH";
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateEmailDomain = (email) => {
  if (!isValidEmail(email)) {
    return { valid: false, error: "Invalid email format" };
  }
  
  const hospital = getHospitalFromEmail(email);
  
  if (!hospital) {
    return { 
      valid: false, 
      error: process.env.NODE_ENV === "production" 
        ? "Only @rush.edu emails are allowed" 
        : "Email domain not recognized" 
    };
  }
  
  return { valid: true, hospital };
};

module.exports = {
  validateEmailDomain,
  getHospitalFromEmail,
  isValidEmail
};

