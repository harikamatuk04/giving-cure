// Test script to verify email delivery
// Run with: node test-email.js <email-address>

require("dotenv").config();
const { Resend } = require("resend");

const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address");
  console.log("Usage: node test-email.js your-email@example.com");
  process.exit(1);
}

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error("❌ RESEND_API_KEY not found in .env file");
  process.exit(1);
}

const resend = new Resend(resendApiKey);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const testCode = "123456"; // Test code

console.log("\n🧪 Testing email delivery...");
console.log(`📧 From: ${fromEmail}`);
console.log(`📬 To: ${email}`);
console.log(`🔑 Test Code: ${testCode}\n`);

resend.emails.send({
  from: fromEmail,
  to: email,
  subject: "🧪 TEST: Giving Cure Verification Code",
  text: `TEST EMAIL - Your verification code is: ${testCode}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #4F46E5; border-radius: 8px;">
      <h2 style="color: #4F46E5;">🧪 TEST EMAIL</h2>
      <p>This is a test email to verify delivery is working.</p>
      <div style="background-color: #F3F4F6; padding: 30px; text-align: center; margin: 30px 0; border-radius: 8px;">
        <h1 style="color: #4F46E5; font-size: 42px; margin: 0; letter-spacing: 8px;">${testCode}</h1>
      </div>
      <p><strong>If you received this email, delivery is working! ✅</strong></p>
      <p style="color: #6B7280; font-size: 14px;">
        Check your inbox, spam, and promotions folders. If you don't see it, check the Resend dashboard for delivery status.
      </p>
    </div>
  `,
})
.then((result) => {
  if (result.error) {
    console.error("❌ Error sending email:", result.error);
    process.exit(1);
  }
  
  if (result.data && result.data.id) {
    console.log("✅ Test email sent successfully!");
    console.log(`📧 Email ID: ${result.data.id}`);
    console.log(`\n🔗 View in Resend dashboard: https://resend.com/emails/${result.data.id}`);
    console.log(`\n📬 Next steps:`);
    console.log(`   1. Check your inbox for: ${email}`);
    console.log(`   2. Check spam/promotions folders`);
    console.log(`   3. Check Resend dashboard for delivery status`);
    console.log(`   4. If delivered but not received, it's likely email filtering\n`);
  } else {
    console.warn("⚠️  Unexpected response:", JSON.stringify(result, null, 2));
  }
})
.catch((error) => {
  console.error("❌ Failed to send test email:", error);
  process.exit(1);
});

