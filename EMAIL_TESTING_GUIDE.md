# Email Testing Guide

## Testing Email Delivery

Since Resend shows emails as "delivered" but Gmail might filter them, here's how to verify email delivery is working:

### Step 1: Check Resend Dashboard
1. Go to https://resend.com/emails
2. Find the email you just sent
3. Check the status:
   - ✅ **Delivered** = Email reached recipient's mail server
   - ❌ **Bounced** = Email was rejected (wrong address, etc.)
   - ⏱️ **Pending** = Still being sent
   - 📧 **Opened** = Recipient opened the email (tracking pixel)

### Step 2: Test with Different Email Providers
Gmail is aggressive with filtering. Test with:
- **Outlook.com** (hotmail.com, live.com)
- **Yahoo Mail**
- **ProtonMail**
- **iCloud Mail**

### Step 3: Check Gmail Thoroughly
If testing with Gmail:
1. **Primary inbox**
2. **Promotions tab** (check the tabs at top)
3. **Social tab**
4. **Spam folder**
5. **All Mail** (search for "Giving Cure")
6. **Search**: `from:onboarding@resend.dev` or `"verification code"`

### Step 4: Check Gmail Filters
1. Go to Gmail Settings → Filters and Blocked Addresses
2. Check if any filters are blocking emails from `resend.dev`

## Common Issues

### Issue: Email shows "Delivered" in Resend but not received
**Possible causes:**
- Gmail is filtering it to Promotions/Spam (most common)
- Email provider has aggressive spam filters
- Email is delayed (rare, wait a few minutes)

**Solution:**
- Test with a different email provider first
- If other providers work, it's Gmail-specific filtering
- Users can always use the console code (always logged)

### Issue: Email shows "Bounced" in Resend
**Possible causes:**
- Invalid email address
- Recipient's mail server is blocking emails
- Domain reputation issue

**Solution:**
- Verify email address is correct
- Check Resend dashboard for bounce reason
- May need to verify a custom domain in Resend

### Issue: Production emails not working
**Possible causes:**
- `RESEND_API_KEY` not set in production environment
- Production using different domain that's not verified

**Solution:**
- Verify environment variables are set in production (Render, Vercel, etc.)
- Check Resend dashboard for any domain verification requirements

## Testing Checklist Before Deployment

- [ ] Send test email to Gmail → Check all folders
- [ ] Send test email to Outlook/Yahoo → Verify receipt
- [ ] Send test email to production domain email → Verify receipt
- [ ] Check Resend dashboard shows "Delivered" status
- [ ] Verify verification code works when entered
- [ ] Confirm email arrives within 30 seconds

## Production Recommendations

1. **Use a custom domain** (not `onboarding@resend.dev`)
   - Better deliverability
   - More professional
   - Less likely to be filtered

2. **Set up SPF/DKIM records** (if using custom domain)
   - Improves email deliverability
   - Reduces spam filtering

3. **Monitor Resend dashboard** in production
   - Track bounce rates
   - Monitor delivery times
   - Check for any issues

4. **Always log codes to console** (already done)
   - Backup method if emails are delayed
   - Useful for development/debugging

