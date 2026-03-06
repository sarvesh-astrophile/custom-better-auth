import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { type BetterAuthOptions, betterAuth } from "better-auth/minimal";
import { emailOTP, organization } from "better-auth/plugins";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";
import { sendInvitationEmail, sendOTPEmail } from "./betterAuth/email";
import authSchema from "./betterAuth/schema";

const siteUrl = process.env.SITE_URL!;

// Environment-based rate limit configuration
const isProd = process.env.NODE_ENV === "production";

// Rate limits per environment
const RATE_LIMITS = {
	production: {
		window: 60,
		max: 100,
		signInWindow: 10,
		signInMax: 5,
		signUpWindow: 60,
		signUpMax: 3,
		otpSendWindow: 600, // 10 minutes
		otpSendMax: 3,
		otpVerifyWindow: 600,
		otpVerifyMax: 10,
	},
	development: {
		window: 60,
		max: 1000, // More lenient in dev
		signInWindow: 10,
		signInMax: 20,
		signUpWindow: 60,
		signUpMax: 10,
		otpSendWindow: 60, // 1 minute in dev
		otpSendMax: 10,
		otpVerifyWindow: 60,
		otpVerifyMax: 20,
	},
};

const limits = isProd ? RATE_LIMITS.production : RATE_LIMITS.development;

export const authComponent = createClient<DataModel, typeof authSchema>(
	components.betterAuth,
	{
		local: {
			schema: authSchema,
		},
		verbose: false,
	},
);

export const createAuthOptions = () => {
	return {
		baseURL: siteUrl,
		trustedOrigins: [siteUrl],
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: true,
		},
		// Advanced IP configuration for Cloudflare
		advanced: {
			ipAddress: {
				// Check multiple headers for IP detection
				// Cloudflare sanitizes x-forwarded-for, so we include it
				ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"],
			},
		},
		// Rate limit configuration
		rateLimit: {
			// Default rate limits
			window: limits.window,
			max: limits.max,
			// Custom rules for sensitive endpoints
			customRules: {
				// OTP endpoints - strict limits to prevent abuse
				"/email-otp/send-verification-otp": {
					window: limits.otpSendWindow,
					max: limits.otpSendMax,
				},
				"/email-otp/request-password-reset": {
					window: limits.otpSendWindow,
					max: limits.otpSendMax,
				},
				"/email-otp/verify-otp": {
					window: limits.otpVerifyWindow,
					max: limits.otpVerifyMax,
				},
				// Authentication endpoints
				"/sign-in/email": {
					window: limits.signInWindow,
					max: limits.signInMax,
				},
				"/sign-up/email": {
					window: limits.signUpWindow,
					max: limits.signUpMax,
				},
				// Disable rate limiting for session retrieval
				"/get-session": false,
			},
		},
		plugins: [
			convex({
				authConfig,
				jwksRotateOnTokenGenerationError: true,
			}),
			organization({
				creatorRole: "owner",
				disableOrganizationDeletion: true,
				membershipLimit: undefined, // unlimited
				invitationExpiresIn: 60 * 60 * 48, // 48 hours
				cancelPendingInvitationsOnReInvite: true,
				requireEmailVerificationOnInvitation: false,
				sendInvitationEmail: async (data) => {
					await sendInvitationEmail({
						id: data.id,
						email: data.email,
						organization: {
							id: data.organization.id,
							name: data.organization.name,
							slug: data.organization.slug,
						},
						inviter: {
							user: {
								id: data.inviter.user.id,
								name: data.inviter.user.name,
								email: data.inviter.user.email,
							},
						},
						role: data.role,
						expiresAt: new Date(data.invitation.expiresAt).getTime(),
					});
				},
			}),
			emailOTP({
				otpLength: 6,
				expiresIn: 300, // 5 minutes
				allowedAttempts: 3,
				disableSignUp: true, // Prevent OTP sign-in from creating new accounts
				sendVerificationOnSignUp: true, // Auto-send OTP on signup
				overrideDefaultEmailVerification: true, // Use OTP instead of magic link
				async sendVerificationOTP({
					email,
					otp,
					type,
				}: {
					email: string;
					otp: string;
					type: "email-verification" | "forget-password" | "sign-in";
				}) {
					await sendOTPEmail({
						email,
						otp,
						type: type as "email-verification" | "forget-password",
					});
				},
			}),
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
