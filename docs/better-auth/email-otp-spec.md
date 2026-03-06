# Email OTP Implementation Specification

## Overview
Replace magic link authentication with Email OTP for email verification and password reset flows. This implementation does NOT use OTP for sign-in (email/password remains the primary sign-in method).

## Requirements Summary

### Backend Configuration

#### Plugin Setup
- **File**: `packages/backend/convex/auth.ts`
- Add `emailOTP` plugin to `createAuthOptions()`
- Configure with:
  - `otpLength`: 6 (default)
  - `expiresIn`: 300 (5 minutes)
  - `allowedAttempts`: 3
  - `storeOTP`: "encrypted" (reversible encryption)
  - `overrideDefaultEmailVerification`: true
  - `sendVerificationOnSignUp`: true
  - `disableSignUp`: true (prevent OTP sign-in from creating new accounts)

#### Rate Limiting
- Add custom rate limit rules in `rateLimit.customRules`:
  - `/email-otp/send-verification-otp`: 3 requests per 600 seconds (10 minutes)
  - `/email-otp/request-password-reset`: 3 requests per 600 seconds (10 minutes)
- Use Better Auth's built-in rate limiter with database storage

#### Email Function
- **File**: `packages/backend/convex/betterAuth/email.ts`
- Create new function `sendOTPEmail` following the pattern of `sendInvitationEmail`
- Type-specific messaging for "email-verification" vs "forget-password"
- Include user name from database lookup for personalization
- Use same Plunk API integration with graceful error handling

#### Auth Configuration Changes
- Set `requireEmailVerification: true` in `emailAndPassword` config
- Add `emailOTPClient()` to auth client plugins

### Client Implementation

#### Auth Client Update
- **File**: `apps/web/src/lib/auth-client.ts`
- Add `emailOTPClient()` to plugins array

#### New Components

1. **OTPInput Component** (`apps/web/src/components/otp-input.tsx`)
   - Single input field (not 6 separate boxes)
   - Auto-submit on 6 digits entered
   - Paste-friendly (accept full code on paste)
   - Clear error display
   - Resend button with 30-second countdown

2. **EmailVerificationPage** (`apps/web/src/routes/verify-email.tsx`)
   - Full page route (not modal)
   - Two states:
     - Email input state (for direct navigation without session)
     - OTP verification state (after signup or email entered)
   - Query param support: `?email=user@example.com` as fallback
   - Auto-redirect verified users to `/dashboard`
   - Auto-redirect unauthenticated users to `/sign-up`
   - Shows user name from auth session when available

3. **ForgotPasswordPage** (`apps/web/src/routes/forgot-password.tsx`)
   - Full page route
   - Single-page flow with 3 states:
     1. Email input + "Send OTP" button
     2. OTP input (auto-submitted on 6 digits)
     3. New password input + "Reset Password" button
   - Silent success on non-existent emails (security)
   - Resend button with 30-second countdown
   - After successful reset, redirect to `/sign-in` with success message

#### Route Protection Updates

1. **Root Route** (`apps/web/src/routes/__root.tsx`)
   - Add check for `emailVerified` in auth state
   - If user is authenticated but not verified, redirect to `/verify-email`
   - Exclude `/verify-email`, `/forgot-password`, and auth routes from this check

2. **SignUpPage** (`apps/web/src/routes/sign-up.tsx`)
   - After successful signup, user is redirected to `/verify-email`
   - OTP is auto-sent via `sendVerificationOnSignUp: true`
   - Pass email in query param for convenience

3. **SignInPage** (`apps/web/src/routes/sign-in.tsx`)
   - Add "Forgot Password?" link that navigates to `/forgot-password`
   - If unverified user tries to sign in, redirect to `/verify-email`

### Flow Details

#### Email Verification Flow
1. User signs up → redirected to `/verify-email?email=user@example.com`
2. OTP auto-sent via Better Auth
3. User receives email with 6-digit code
4. User enters code → auto-submitted
5. On success → auto-redirect to `/dashboard`
6. On failure → inline error, allow resend after 30s

#### Password Reset Flow
1. User clicks "Forgot Password?" on sign-in page
2. Navigates to `/forgot-password`
3. Enters email → clicks "Send OTP"
4. OTP sent (silent if email doesn't exist)
5. User receives email → enters code
6. Auto-advances to new password form
7. Enters new password → clicks "Reset Password"
8. Success → redirect to `/sign-in` with success toast

#### Direct Verify Page Access
1. User navigates to `/verify-email` without session
2. Shows email input form
3. User enters email → clicks "Send Verification Code"
4. Proceeds to OTP verification state
5. Rest of flow continues as normal

### Email Templates

Both use same Plunk integration pattern as `sendInvitationEmail`:

**Verification Email:**
```
Subject: Verify your email address

Hello {name},

Your verification code is: {otp}

This code will expire in 5 minutes.

If you didn't create an account, you can safely ignore this email.
```

**Password Reset Email:**
```
Subject: Reset your password

Hello {name},

Your password reset code is: {otp}

This code will expire in 5 minutes.

If you didn't request a password reset, you can safely ignore this email.
```

### Error Handling

All client-side operations use TanStack Router's data loading patterns:
- Form submissions use Better Auth client methods
- Errors displayed inline with FieldError components
- Rate limit errors show retry-after time
- Network errors show generic "Please try again" message

### Security Considerations

1. **OTP Storage**: Encrypted in database (not plain text)
2. **Rate Limiting**: 3 requests per 10 minutes per email
3. **Email Enumeration**: Silent success on forgot password for non-existent emails
4. **Invalidation**: Previous OTP invalidated immediately on resend (Better Auth default)
5. **Auto-login after reset**: Disabled for security (user must re-enter new password)
6. **Attempt Limiting**: 3 attempts per OTP before requiring new code

### Files to Create/Modify

**Backend:**
- `packages/backend/convex/auth.ts` - Add emailOTP plugin, rate limit rules
- `packages/backend/convex/betterAuth/email.ts` - Add `sendOTPEmail` function

**Frontend:**
- `apps/web/src/lib/auth-client.ts` - Add emailOTPClient plugin
- `apps/web/src/components/otp-input.tsx` - New reusable OTP input component
- `apps/web/src/routes/verify-email.tsx` - New verification page
- `apps/web/src/routes/forgot-password.tsx` - New forgot password page
- `apps/web/src/routes/__root.tsx` - Update verified email check
- `apps/web/src/routes/sign-in.tsx` - Add forgot password link
- `apps/web/src/routes/sign-up.tsx` - Update redirect after signup

### Testing Checklist

- [ ] Signup auto-sends OTP
- [ ] Verify page blocks unverified users
- [ ] OTP auto-submits on 6 digits
- [ ] Resend button has 30s cooldown
- [ ] Rate limiting works (3 req/10min)
- [ ] Verified users auto-redirect from verify page
- [ ] Forgot password flow completes end-to-end
- [ ] Non-existent emails show silent success
- [ ] After password reset, user must re-login
- [ ] Direct navigation to verify page works with email input
- [ ] Email includes user name personalization
