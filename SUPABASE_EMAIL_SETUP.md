# Supabase Email Template Configuration

## Issue: Emails still show "Supabase Auth" instead of "Gnymble Auth"

The email templates are configured in the Supabase dashboard, not in the client code. Here's how to fix it:

## Steps to Configure Email Templates:

### 1. Access Supabase Dashboard
- Go to [supabase.com](https://supabase.com)
- Sign in to your account
- Select the Gnymble project

### 2. Navigate to Authentication Settings
- Go to **Authentication** → **Settings**
- Scroll down to **Email Templates**

### 3. Configure Email Templates

#### **Confirm Signup Template:**
- **Subject**: `[Gnymble] Confirm your email address`
- **From Name**: `Gnymble Auth`
- **From Email**: `auth@gnymble.com` (or your custom domain)
- **Template Content**: Customize the email body to include Gnymble branding

#### **Reset Password Template:**
- **Subject**: `[Gnymble] Reset your password`
- **From Name**: `Gnymble Auth`
- **From Email**: `auth@gnymble.com` (or your custom domain)
- **Template Content**: Customize the email body to include Gnymble branding

#### **Magic Link Template:**
- **Subject**: `[Gnymble] Your magic link`
- **From Name**: `Gnymble Auth`
- **From Email**: `auth@gnymble.com` (or your custom domain)
- **Template Content**: Customize the email body to include Gnymble branding

### 4. Custom Domain Setup (Optional)
For better branding, set up a custom domain:
- Go to **Authentication** → **Settings** → **SMTP Settings**
- Configure custom SMTP server or use Supabase's email service with custom domain

### 5. Template Variables Available
You can use these variables in your email templates:
- `{{ .ConfirmationURL }}` - Confirmation link
- `{{ .Token }}` - Token for manual verification
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address

### 6. Example Template Content

**Reset Password Email:**
```
Subject: [Gnymble] Reset your password

Hi there,

You requested a password reset for your Gnymble account.

Click the link below to reset your password:
{{ .ConfirmationURL }}

If you didn't request this, you can safely ignore this email.

Best regards,
The Gnymble Team
```

## For PercyMD Project:
Follow the same steps but replace:
- "Gnymble" with "PercyMD"
- "gnymble.com" with "percymd.com"
- Update all branding references

## Testing:
1. Deploy the updated code
2. Test the forgot password functionality
3. Check that emails now show "Gnymble Auth" instead of "Supabase Auth"
4. Verify that reset links work correctly

## Note:
The client-side configuration in `src/config/auth.ts` is for future use and documentation, but the actual email templates must be configured in the Supabase dashboard. 