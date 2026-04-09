# Authentication Setup Guide

## Testing with Your Personal Email

To test the authentication system locally with your personal email:

### Option 1: Add to Code (Recommended)
Edit `backend/utils/emailValidation.js` and add your email to the `allowedTestEmails` array:

```javascript
const allowedTestEmails = [
  "your.email@gmail.com", // Add your email here
];
```

### Option 2: Use Environment Variable
Add to your `backend/.env` file:

```
TEST_EMAILS=your.email@gmail.com
```

## How It Works

### Development Mode (Local)
- ✅ Accepts `@rush.edu` emails
- ✅ Accepts your personal email (if added to allowedTestEmails or TEST_EMAILS)
- ✅ Logs verification codes to console (no real emails sent)
- ✅ All test emails are treated as RUSH hospital

### Production Mode (Deployed)
- ✅ Only accepts `@rush.edu` emails
- ❌ Rejects all other emails
- ✅ Sends real verification emails (when Resend is configured)

## Testing Flow

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Go to `http://localhost:5173/signin`
4. Enter your test email
5. Check backend console for verification code
6. Enter code and create password
7. Sign in and test features

## Next Steps

1. Add your personal email to `backend/utils/emailValidation.js`
2. Test the sign-up flow locally
3. When ready for production, set up Resend API key in environment variables

