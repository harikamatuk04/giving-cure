# Resend Email Setup Guide

## Getting Your Resend API Key

1. Go to https://resend.com and sign in
2. Navigate to **API Keys** in the dashboard
3. Click **Create API Key**
4. Give it a name (e.g., "Giving Cure Production")
5. Copy the API key (you'll only see it once!)

## Setting Up Environment Variables

### For Local Development (backend/.env):
```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Note:** `onboarding@resend.dev` is Resend's test email domain. You can use this for testing without verifying a domain.

### For Production (Render/Vercel):
Add these environment variables in your deployment settings:
- `RESEND_API_KEY` - Your Resend API key
- `RESEND_FROM_EMAIL` - Use `onboarding@resend.dev` for testing, or your verified domain for production

## Using Your Own Domain (Optional - for Production)

1. In Resend dashboard, go to **Domains**
2. Add your domain (e.g., `givingcure.com`)
3. Add the DNS records Resend provides to your domain
4. Wait for verification
5. Update `RESEND_FROM_EMAIL` to use your domain (e.g., `noreply@givingcure.com`)

## Testing

- **Development:** Codes are logged to console AND sent via email (if API key is set)
- **Production:** Codes are sent via email only

Your personal email (`harikam.style@gmail.com`) is already added to the test emails list for local testing!

