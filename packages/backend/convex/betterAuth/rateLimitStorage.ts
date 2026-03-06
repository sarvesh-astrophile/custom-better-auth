import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Custom storage adapter for Better Auth rate limiting using Convex tables.
 * Provides get/set operations for rate limit data.
 */

export interface RateLimitData {
	count: number;
	lastRequest: number;
}

/**
 * Get rate limit data for a key.
 * Called by Better Auth to check current rate limit state.
 */
export const get = query({
	args: { key: v.string() },
	handler: async (ctx, args) => {
		const record = await ctx.db
			.query("rateLimit")
			.withIndex("by_key", (q) => q.eq("key", args.key))
			.unique();

		if (!record) {
			return null;
		}

		return {
			count: record.count,
			lastRequest: record.lastRequest,
		};
	},
});

/**
 * Set rate limit data for a key.
 * Called by Better Auth to update rate limit state after each request.
 */
export const set = internalMutation({
	args: {
		key: v.string(),
		value: v.object({
			count: v.number(),
			lastRequest: v.number(),
		}),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("rateLimit")
			.withIndex("by_key", (q) => q.eq("key", args.key))
			.unique();

		if (existing) {
			await ctx.db.patch(existing._id, {
				count: args.value.count,
				lastRequest: args.value.lastRequest,
			});
		} else {
			await ctx.db.insert("rateLimit", {
				key: args.key,
				count: args.value.count,
				lastRequest: args.value.lastRequest,
			});
		}
	},
});

const CLEANUP_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Clean up old rate limit entries.
 * Called by cron job to prevent table bloat.
 */
export const cleanup = internalMutation({
	args: {},
	handler: async (ctx) => {
		const cutoff = Date.now() - CLEANUP_AGE_MS;

		// Query for old rate limit entries
		const oldEntries = await ctx.db
			.query("rateLimit")
			.filter((q) => q.lt(q.field("lastRequest"), cutoff))
			.collect();

		// Delete them
		for (const entry of oldEntries) {
			await ctx.db.delete(entry._id);
		}

		return { deleted: oldEntries.length };
	},
});
