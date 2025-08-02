# Supabase Configuration Guide

## Issues to Fix:
1. **Email branding**: Still shows "Supabase Auth" instead of "Gnymble Auth"
2. **Reset password links**: Redirecting to localhost instead of production
3. **Google OAuth redirects**: Also redirecting to localhost instead of production

## All configurations must be done in Supabase Dashboard

### 1. Fix OAuth Redirect URLs (Google Sign-in)

**Go to Supabase Dashboard:**
- Visit [supabase.com](https://supabase.com)
- Sign in and select your Gnymble project

**Configure OAuth Redirect URLs:**
- Go to **Authentication** → **Settings** → **URL Configuration**
- Update **Site URL** to: `https://gnymble-signup-pwykig7sx-percy-tech.vercel.app`
- Update **Redirect URLs** to include:
  ```
  https://gnymble-signup-pwykig7sx-percy-tech.vercel.app/auth/callback
  https://gnymble-signup-pwykig7sx-percy-tech.vercel.app/login
  https://gnymble-signup-pwykig7sx-percy-tech.vercel.app/signup
  https://gnymble-signup-pwykig7sx-percy-tech.vercel.app/dashboard
  ```

**For Development (Optional):**
- Add localhost URLs for development:
  ```
  http://localhost:5173/auth/callback
  http://localhost:5173/login
  http://localhost:5173/signup
  http://localhost:5173/dashboard
  ```

### 2. Configure Email Templates

**Navigate to Email Templates:**
- Go to **Authentication** → **Settings** → **Email Templates**

**Update Reset Password Template:**
- **From Name**: `Gnymble Auth`
- **Subject**: `[Gnymble] Reset your password`
- **From Email**: `auth@gnymble.com` (or your custom domain)

**Template Content:**
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

**Update Confirm Signup Template:**
- **From Name**: `Gnymble Auth`
- **Subject**: `[Gnymble] Confirm your email address`
- **From Email**: `auth@gnymble.com`

**Update Magic Link Template:**
- **From Name**: `Gnymble Auth`
- **Subject**: `[Gnymble] Your magic link`
- **From Email**: `auth@gnymble.com`

### 3. Configure Google OAuth Provider

**Go to Authentication Providers:**
- Go to **Authentication** → **Providers** → **Google**

**Update Google OAuth Settings:**
- **Client ID**: Your Google OAuth client ID
- **Client Secret**: Your Google OAuth client secret
- **Redirect URL**: `https://gnymble-signup-pwykig7sx-percy-tech.vercel.app/auth/callback`

### 4. Template Variables Available

You can use these variables in your email templates:
- `{{ .ConfirmationURL }}` - Confirmation link
- `{{ .Token }}` - Token for manual verification
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address

### 5. For PercyMD Project

Follow the same steps but replace:
- "Gnymble" with "PercyMD"
- "gnymble.com" with "percymd.com"
- Update all URLs to PercyMD's Vercel deployment URL
- Update all branding references

### 6. Testing Checklist

After making these changes:
1. ✅ Test Google sign-in (should redirect to production, not localhost)
2. ✅ Test forgot password (should redirect to production, not localhost)
3. ✅ Check email branding (should show "Gnymble Auth" not "Supabase Auth")
4. ✅ Verify all OAuth flows work correctly

### 7. Important Notes

- **Client-side code changes won't fix these issues** - they must be configured in Supabase dashboard
- **URLs are case-sensitive** - make sure to use exact URLs
- **Changes may take a few minutes to propagate**
- **Test in incognito mode** to avoid cached redirects

### 8. Current Production URLs

For the current deployment:
- **Site URL**: `https://gnymble-signup-pwykig7sx-percy-tech.vercel.app`
- **Auth Callback**: `https://gnymble-signup-pwykig7sx-percy-tech.vercel.app/auth/callback`
- **Login**: `https://gnymble-signup-pwykig7sx-percy-tech.vercel.app/login`
- **Signup**: `https://gnymble-signup-pwykig7sx-percy-tech.vercel.app/signup`
- **Dashboard**: `https://gnymble-signup-pwykig7sx-percy-tech.vercel.app/dashboard`
