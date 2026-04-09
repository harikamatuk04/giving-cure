// Email service utility
// Uses Resend for sending emails
// In development: logs to console AND sends email (if RESEND_API_KEY is set)
// In production: sends real emails via Resend

const { Resend } = require("resend");

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

const sendVerificationCode = async (email, code) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const isProduction = process.env.NODE_ENV === "production";
  
  // Always log to console for development/testing
  console.log(`\n🔐 ============================================`);
  console.log(`📧 Verification Code for: ${email}`);
  console.log(`🔑 Code: ${code}`);
  console.log(`⏰ Code expires in 10 minutes`);
  console.log(`============================================\n`);
  
  // Send email via Resend if API key is configured
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      
      // Use your verified domain or the default Resend domain
      // For testing, you can use: onboarding@resend.dev
      // For production, use your verified domain: noreply@yourdomain.com
      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
      
      const result = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "Your Giving Cure Verification Code",
        text: `Your Giving Cure Verification Code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4F46E5; margin-bottom: 20px;">Giving Cure Verification Code</h2>
            <p style="font-size: 16px; color: #374151;">Your verification code is:</p>
            <div style="background-color: #F3F4F6; padding: 30px; text-align: center; margin: 30px 0; border-radius: 8px; border: 2px solid #E5E7EB;">
              <h1 style="color: #4F46E5; font-size: 42px; margin: 0; letter-spacing: 8px; font-weight: bold;">${code}</h1>
            </div>
            <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
              This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
            <p style="color: #9CA3AF; font-size: 12px;">
              Having trouble finding this email? Check your spam folder, or look for the verification code in your backend console logs.
            </p>
          </div>
        `,
      });
      
      // Check if there was an error in the response
      if (result.error) {
        console.error(`❌ Resend API Error:`, result.error);
        console.error(`❌ Error details:`, JSON.stringify(result.error, null, 2));
        throw new Error(`Resend API Error: ${result.error.message}`);
      } else if (result.data && result.data.id) {
        console.log(`✅ Email sent successfully via Resend to ${email}`);
        console.log(`📧 Email ID: ${result.data.id}`);
        console.log(`📬 IMPORTANT: Check your inbox AND spam/promotions folder`);
        console.log(`🔗 View delivery status in Resend dashboard: https://resend.com/emails/${result.data.id}`);
        console.log(`⚠️  If email not received, check Resend dashboard for delivery/bounce status`);
        
        // Return email ID for tracking
        return { success: true, emailId: result.data.id };
      } else {
        console.warn(`⚠️  Unexpected Resend response format:`, JSON.stringify(result, null, 2));
        throw new Error(`Unexpected Resend response format`);
      }
    } catch (error) {
      console.error(`❌ Failed to send email via Resend:`, error.message);
      console.error(`❌ Full error:`, error);
      // Don't throw error - code is already logged to console for development
      // But log the error so we know there's an issue
      return { success: false, error: error.message };
    }
  } else {
    if (isProduction) {
      console.warn(`⚠️  RESEND_API_KEY not set. Email not sent. Code: ${code}`);
      return { success: false, error: "RESEND_API_KEY not configured" };
    } else {
      console.log(`ℹ️  RESEND_API_KEY not set. Email not sent, but code is logged above.`);
      return { success: false, error: "RESEND_API_KEY not configured (development mode)" };
    }
  }
};

module.exports = {
  generateVerificationCode,
  sendVerificationCode
};

