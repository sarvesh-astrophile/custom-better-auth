# Organization Plugin Implementation Spec

## Overview

Add Better Auth organization plugin to the local Convex Better Auth setup with Plunk email integration for invitations.

## Configuration Summary

| Setting | Value |
|---------|-------|
| Creator Role | `owner` |
| Organization Deletion | Disabled |
| Invitation URL Pattern | `/accept-invitation/:id` |
| Org Creation | Open to all authenticated users |
| Member Limit | Unlimited |
| Invitation Expiration | 48 hours (default) |
| Access Control | Default roles (owner/admin/member) |
| Email Verification | Required for accepting invitations |
| Pending Invites | Cancel on re-invite |
| Active Organization | Remember last active (session storage) |
| Slug Generation | Auto-generate from org name |
| Invitation Limit | Unlimited |
| Email Sender | No-reply address |
| Email Content | Minimal |
| Error Handling | Graceful (log only, invitation still created) |
| Slug Collision | Reject duplicate |

---

## Implementation Steps

### Step 1: Update Server Auth Configuration

**File:** `packages/backend/convex/auth.ts`

Add the organization plugin to `createAuthOptions()`:

```typescript
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { organization } from "better-auth/plugins"; // [!code ++]

import type { DataModel } from "./_generated/dataModel";

import { components } from "./_generated/api";
import { query } from "./_generated/server";
import authConfig from "./auth.config";
import authSchema from "./betterAuth/schema";
import { sendInvitationEmail } from "./betterAuth/email"; // [!code ++]

const siteUrl = process.env.SITE_URL!;

export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: {
      schema: authSchema,
    },
    verbose: true,
  },
);

export const createAuthOptions = () => {
  return {
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
      organization({ // [!code ++]
        creatorRole: "owner", // [!code ++]
        disableOrganizationDeletion: true, // [!code ++]
        membershipLimit: undefined, // unlimited // [!code ++]
        invitationExpiresIn: 60 * 60 * 48, // 48 hours // [!code ++]
        cancelPendingInvitationsOnReInvite: true, // [!code ++]
        requireEmailVerificationOnInvitation: true, // [!code ++]
        sendInvitationEmail, // [!code ++]
      }), // [!code ++]
    ],
  } satisfies BetterAuthOptions;
};

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    ...createAuthOptions(),
    database: authComponent.adapter(ctx),
  });
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.safeGetAuthUser(ctx);
  },
});
```

---

### Step 2: Create Email Sending Function

**File:** `packages/backend/convex/betterAuth/email.ts` (new file)

```typescript
import { internalAction } from "./_generated/server";
import { v } from "convex/values";

/**
 * Send organization invitation email via Plunk
 * Called by Better Auth when inviting users to an organization
 */
export const sendInvitationEmail = internalAction({
	args: {
		id: v.string(), // invitation ID
		email: v.string(),
		organization: v.object({
			id: v.string(),
			name: v.string(),
			slug: v.string(),
		}),
		inviter: v.object({
			user: v.object({
				id: v.string(),
				name: v.string(),
				email: v.string(),
			}),
		}),
		role: v.string(),
		expiresAt: v.number(),
	},
	returns: v.null(),
	handler: async (_ctx, args): Promise<null> => {
		try {
			const plunkApiKey = process.env.PLUNK_API_KEY;

			if (!plunkApiKey) {
				console.error("PLUNK_API_KEY not configured");
				// Graceful: log error but don't throw - invitation still created
				return null;
			}

			// Get site URL for invitation link
			const siteUrl = process.env.SITE_URL;
			if (!siteUrl) {
				console.error("SITE_URL not configured");
				return null;
			}

			const inviteLink = `${siteUrl}/accept-invitation/${args.id}`;

			const response = await fetch("https://api.useplunk.com/v1/send", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${plunkApiKey}`,
				},
				body: JSON.stringify({
					to: args.email,
					subject: `You've been invited to join ${args.organization.name}`,
					body: `
Hello,

${args.inviter.user.name} has invited you to join ${args.organization.name}.

Click here to accept your invitation:
${inviteLink}

This invitation will expire in 48 hours.

If you did not expect this invitation, you can safely ignore this email.
					`,
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Plunk API error:", errorText);
				// Graceful: log error but don't throw
			}

			return null;
		} catch (error) {
			console.error("Failed to send invitation email:", error);
			// Graceful: log error but don't throw
			return null;
		}
	},
});
```

---

### Step 3: Update Better Auth Static Instance

**File:** `packages/backend/convex/betterAuth/auth.ts`

The static auth instance needs the organization plugin for schema generation:

```typescript
import { createAuth } from "../auth";
import { organization } from "better-auth/plugins"; // [!code ++]

// Export a static instance for Better Auth schema generation
// This file should NOT be imported at runtime (will error due to missing env vars)
export const auth = createAuth({} as any);

// Note: The organization plugin is already included in createAuthOptions
// which is used by createAuth. Schema generation will pick up the org tables.
```

> **Note:** Since `createAuth` uses `createAuthOptions()` which now includes the organization plugin, running the CLI generate command will automatically detect and generate the organization schema tables.

---

### Step 4: Regenerate Schema

Run the Better Auth CLI to generate the organization tables:

```bash
cd packages/backend/convex/betterAuth
npx @better-auth/cli generate -y
```

This will update `schema.ts` to include:
- `organization` table
- `member` table
- `invitation` table
- Updated `session` table with `activeOrganizationId` field

---

### Step 5: Update Client Auth Configuration

**File:** `apps/web/src/lib/auth-client.ts`

```typescript
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins"; // [!code ++]
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	plugins: [
		convexClient(),
		organizationClient(), // [!code ++]
	],
});
```

---

### Step 6: Create Accept Invitation Route

**File:** `apps/web/src/routes/accept-invitation.$id.tsx` (new file)

```typescript
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/accept-invitation/$id")({
	component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const acceptInvitation = async () => {
			try {
				// Check if user is logged in
				const session = await authClient.getSession();
				if (!session.data) {
					// Redirect to login with return URL
					navigate({
						to: "/sign-in",
						search: { redirect: `/accept-invitation/${id}` },
					});
					return;
				}

				// Accept the invitation
				const result = await authClient.organization.acceptInvitation({
					invitationId: id,
				});

				if (result.error) {
					setStatus("error");
					setError(result.error.message || "Failed to accept invitation");
				} else {
					setStatus("success");
					// Redirect to dashboard after short delay
					setTimeout(() => {
						navigate({ to: "/dashboard" });
					}, 2000);
				}
			} catch (err) {
				setStatus("error");
				setError(err instanceof Error ? err.message : "An unexpected error occurred");
			}
		};

		acceptInvitation();
	}, [id, navigate]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				{status === "loading" && <p>Processing invitation...</p>}
				{status === "success" && (
					<div>
						<h1 className="text-2xl font-bold">Welcome!</h1>
						<p>You've successfully joined the organization.</p>
						<p className="text-muted-foreground">Redirecting to dashboard...</p>
					</div>
				)}
				{status === "error" && (
					<div>
						<h1 className="text-2xl font-bold text-destructive">Error</h1>
						<p>{error}</p>
						<button
							type="button"
							onClick={() => navigate({ to: "/dashboard" })}
							className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
						>
							Go to Dashboard
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
```

---

## Database Schema

After running `npx @better-auth/cli generate`, the following tables will be added/updated:

### organization table
| Field | Type | Description |
|-------|------|-------------|
| id | string | Primary key |
| name | string | Organization name |
| slug | string | URL-friendly identifier |
| logo | string? | Optional logo URL |
| metadata | string? | Optional JSON metadata |
| createdAt | number | Creation timestamp |

### member table
| Field | Type | Description |
|-------|------|-------------|
| id | string | Primary key |
| userId | string | FK to user |
| organizationId | string | FK to organization |
| role | string | Member role (owner/admin/member) |
| createdAt | number | Creation timestamp |

### invitation table
| Field | Type | Description |
|-------|------|-------------|
| id | string | Primary key |
| email | string | Invitee email |
| inviterId | string | FK to user who invited |
| organizationId | string | FK to organization |
| role | string | Role to assign |
| status | string | pending/accepted/rejected/canceled |
| expiresAt | number | Expiration timestamp |
| createdAt | number | Creation timestamp |

### session table (updated)
| Field | Type | Description |
|-------|------|-------------|
| ... | ... | Existing fields |
| activeOrganizationId | string? | Currently active organization |

---

## Testing Commands

### 1. Create an Organization

```bash
# First, sign in to get a session cookie, then:
curl -X POST http://localhost:3000/api/auth/organization/create \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{
    "name": "Test Organization",
    "slug": "test-org"
  }'
```

### 2. List Organizations

```bash
curl http://localhost:3000/api/auth/organization/list \
  -H "Cookie: <session-cookie>"
```

### 3. Invite a Member

```bash
curl -X POST http://localhost:3000/api/auth/organization/invite-member \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{
    "email": "newmember@example.com",
    "role": "member"
  }'
```

### 4. Check if Slug is Available

```bash
curl -X POST http://localhost:3000/api/auth/organization/check-slug \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{
    "slug": "test-org"
  }'
```

### 5. Set Active Organization

```bash
curl -X POST http://localhost:3000/api/auth/organization/set-active \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{
    "organizationId": "<org-id>"
  }'
```

### 6. List Members

```bash
curl http://localhost:3000/api/auth/organization/list-members \
  -H "Cookie: <session-cookie>"
```

---

## Environment Variables

Ensure these are set in `packages/backend/.env.local`:

| Variable | Description |
|----------|-------------|
| `SITE_URL` | Base URL for invitation links (e.g., `http://localhost:3000`) |
| `PLUNK_API_KEY` | API key for Plunk email service |

---

## Files Changed Summary

| File | Action |
|------|--------|
| `packages/backend/convex/auth.ts` | Modify - add organization plugin |
| `packages/backend/convex/betterAuth/email.ts` | Create - Plunk email sender |
| `packages/backend/convex/betterAuth/auth.ts` | No changes needed |
| `packages/backend/convex/betterAuth/schema.ts` | Auto-generated by CLI |
| `apps/web/src/lib/auth-client.ts` | Modify - add organizationClient |
| `apps/web/src/routes/accept-invitation.$id.tsx` | Create - invitation acceptance page |

---

## Notes

- **No custom hooks**: Placeholder hooks were skipped as requested. Add them later by extending `organizationHooks` in the plugin config.
- **Default roles**: Using built-in owner/admin/member roles. For custom permissions, see the [Custom Permissions](https://www.better-auth.com/docs/plugins/organization#custom-permissions) section in Better Auth docs.
- **Graceful email errors**: If Plunk fails, the invitation is still created and logged. The inviter may need to manually share the invite link.
- **Session-based active org**: The `activeOrganizationId` is stored in the session table and persists across logins/devices.
