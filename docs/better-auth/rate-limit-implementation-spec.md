# Rate Limit Implementation Spec

Based on interview and [Rate Limit Documentation](./rate-limit.md)

## Architecture Decisions

| Decision | Choice |
|----------|--------|
| **IP Detection** | Multiple headers (`cf-connecting-ip`, `x-forwarded-for`) with Cloudflare sanitization |
| **Storage Backend** | Better Auth default memory-based storage (see limitations below) |
| **Rate Limit Strategy** | IP-based only (not account-specific) to prevent account lockout DoS |
| **Retry UX** | Human-readable time display ("10 minutes" instead of 600 seconds) via toast |
| **Environment Handling** | Build-time environment variables for different prod/dev limits |
| **Limit Type** | Static limits (not dynamic per-request) |
| **Frontend Pattern** | Global event-based toast + optional `useRateLimit` hook for critical flows |

## Implementation Summary

### Backend Changes

**File:** `packages/backend/convex/betterAuth/schema.ts`

Added the rateLimit table to the auth schema:

```ts
rateLimit: defineTable({
  key: v.string(),
  count: v.number(),
  lastRequest: v.number(),
})
  .index("by_key", ["key"]),
```

**Note:** This table is available for future use but not currently used (see storage limitation below).

**File:** `packages/backend/convex/betterAuth/rateLimitStorage.ts`

Created storage adapter functions for future use:
- `get` - Query rate limit data by key
- `set` - Update rate limit data (internal mutation)
- `cleanup` - Remove old entries (for cron job use)

**File:** `packages/backend/convex/auth.ts`

Updated auth configuration with:
1. **Advanced IP Configuration** - Cloudflare headers support
2. **Environment-based Rate Limits** - Different limits for production vs development
3. **Custom Rules** for sensitive endpoints:
   - OTP endpoints (3 per 10 min in prod)
   - Sign-in (5 per 10 sec)
   - Sign-up (3 per 60 sec)
   - Session retrieval (disabled)

### Frontend Changes

**File:** `apps/web/src/lib/auth-client.ts`

Added global error handling for 429 responses:
- Formats retry time into human-readable strings
- Dispatches custom `better-auth:rate-limit` events

**File:** `apps/web/src/hooks/useRateLimit.ts`

Created two hooks:
- `useRateLimit()` - Listens for global rate limit events with countdown
- `useRateLimitManual()` - Manual control for per-request handling

**File:** `apps/web/src/hooks/useRateLimitToast.ts`

Created toast notification hook that listens for rate limit events and displays error toasts.

**File:** `apps/web/src/routes/__root.tsx`

Added `useRateLimitToast()` hook to root component for global toast notifications.

## Rate Limits (Production vs Development)

| Endpoint | Production | Development |
|----------|------------|-------------|
| Default | 100 / 60s | 1000 / 60s |
| `/sign-in/email` | 5 / 10s | 20 / 10s |
| `/sign-up/email` | 3 / 60s | 10 / 60s |
| `/email-otp/send-*` | 3 / 600s | 10 / 60s |
| `/email-otp/verify-otp` | 10 / 600s | 20 / 60s |
| `/get-session` | Disabled | Disabled |

## Known Limitations

### Storage Constraint

Better Auth's rate limit storage interface expects synchronous `get`/`set` calls:

```ts
storage: {
  get: (key: string) => { count: number; lastRequest: number } | null;
  set: (key: string, value: { count: number; lastRequest: number }) => void;
}
```

However, Convex operations (`ctx.runQuery`, `ctx.runMutation`) are asynchronous and must be called via the Convex API. This architectural mismatch means:

- **Current Implementation**: Uses Better Auth's default memory-based storage
- **Rate limits reset on**: Cold starts, function instance recycling, deployments
- **Impact**: In a multi-instance deployment, each instance tracks its own rate limits
- **Workaround**: For production, consider using Redis or a similar external store via Better Auth's secondary storage

### IPv6 Configuration

The `ipv6Subnet` option is not supported in the current version of Better Auth. IPv6 addresses are rate-limited individually by default.

## Files Modified

1. `packages/backend/convex/betterAuth/schema.ts` - Added rateLimit table
2. `packages/backend/convex/betterAuth/rateLimitStorage.ts` - New: Storage adapter (for future use)
3. `packages/backend/convex/auth.ts` - Updated rate limit config with IP settings and custom rules
4. `apps/web/src/lib/auth-client.ts` - Added global error handler with event dispatch
5. `apps/web/src/hooks/useRateLimit.ts` - New: Rate limit state hooks
6. `apps/web/src/hooks/useRateLimitToast.ts` - New: Toast notification hook
7. `apps/web/src/routes/__root.tsx` - Added toast listener

## Usage Examples

### Global Toast Notifications (Automatic)

Toast notifications are automatically shown when rate limits are hit - no additional code needed.

### Per-Component Rate Limit State

```tsx
import { useRateLimit } from "@/hooks/useRateLimit";

function SignInForm() {
  const { isLimited, retryAfterFormatted } = useRateLimit();

  return (
    <button disabled={isLimited}>
      {isLimited ? `Retry in ${retryAfterFormatted}` : "Sign In"}
    </button>
  );
}
```

### Manual Rate Limit Handling

```tsx
import { useRateLimitManual } from "@/hooks/useRateLimit";

function CustomForm() {
  const { isLimited, retryAfterFormatted, setRateLimited, clearRateLimit } = useRateLimitManual();

  const handleSubmit = async () => {
    try {
      await submitData();
      clearRateLimit();
    } catch (error) {
      if (error.status === 429) {
        setRateLimited(600); // 10 minutes
      }
    }
  };

  return (
    <button disabled={isLimited} onClick={handleSubmit}>
      {isLimited ? `Retry in ${retryAfterFormatted}` : "Submit"}
    </button>
  );
}
```

## Future Improvements

1. **Persistent Storage**: Implement Redis/Upstash integration for cross-instance rate limiting
2. **IPv6 Subnet**: Upgrade to /64 subnet limiting when Better Auth supports it
3. **Account-Specific Limits**: Add per-account soft limits for credential stuffing protection
4. **Metrics**: Add rate limit hit metrics for monitoring abuse patterns
