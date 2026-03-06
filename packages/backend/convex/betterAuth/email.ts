/**
 * Email sending functions for Better Auth organization plugin
 * Uses Plunk API for transactional emails
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

interface OTPData {
	email: string;
	otp: string;
	type: "email-verification" | "forget-password";
}

interface InvitationData {
	id: string;
	email: string;
	organization: {
		id: string;
		name: string;
		slug: string;
	};
	inviter: {
		user: {
			id: string;
			name: string;
			email: string;
		};
	};
	role: string;
	expiresAt: number;
}

/**
 * Send organization invitation email via Plunk
 * Graceful error handling - logs errors but doesn't throw
 */
export async function sendInvitationEmail(data: InvitationData): Promise<void> {
	try {
		const plunkApiKey = process.env.PLUNK_API_KEY;

		if (!plunkApiKey) {
			console.error("PLUNK_API_KEY not configured");
			return;
		}

		const siteUrl = process.env.SITE_URL;
		if (!siteUrl) {
			console.error("SITE_URL not configured");
			return;
		}

		const inviteLink = `${siteUrl}/accept-invitation/${data.id}`;

		const response = await fetch("https://api.useplunk.com/v1/send", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${plunkApiKey}`,
			},
			body: JSON.stringify({
				to: data.email,
				subject: `You've been invited to join ${data.organization.name}`,
				body: `
Hello,

${data.inviter.user.name} has invited you to join ${data.organization.name}.

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
			return;
		}

		console.log(
			`Invitation email sent to ${data.email} for organization ${data.organization.name}`,
		);
	} catch (error) {
		console.error("Failed to send invitation email:", error);
	}
}

/**
 * Query to fetch user name by email for email personalization
 */
export const getUserNameByEmail = query({
	args: { email: v.string() },
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("user")
			.withIndex("email_name", (q) => q.eq("email", args.email))
			.first();
		return user?.name ?? null;
	},
});

/**
 * Send OTP email via Plunk
 * Graceful error handling - logs errors but doesn't throw
 */
export async function sendOTPEmail(data: OTPData): Promise<void> {
	try {
		const plunkApiKey = process.env.PLUNK_API_KEY;

		if (!plunkApiKey) {
			console.error("PLUNK_API_KEY not configured");
			return;
		}

		// Fetch user name for personalization
		// Note: We can't call Convex functions directly from here, so we'll use a generic greeting
		// The name will be included in the email if available from the auth context

		const isVerification = data.type === "email-verification";
		const subject = isVerification
			? "Verify your email address"
			: "Reset your password";
		const actionText = isVerification
			? "verification code"
			: "password reset code";
		const extraMessage = isVerification
			? "If you didn't create an account, you can safely ignore this email."
			: "If you didn't request a password reset, you can safely ignore this email.";

		const response = await fetch("https://api.useplunk.com/v1/send", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${plunkApiKey}`,
			},
			body: JSON.stringify({
				to: data.email,
				subject,
				body: `
Hello,

Your ${actionText} is: ${data.otp}

This code will expire in 5 minutes.

${extraMessage}
				`,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Plunk API error:", errorText);
			return;
		}

		console.log(`OTP email sent to ${data.email} for ${data.type}`);
	} catch (error) {
		console.error("Failed to send OTP email:", error);
	}
}
