import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

type FetchContext = {
	response: Response;
};

/**
 * Format retry seconds into human-readable string
 * e.g., 600 -> "10 minutes", 90 -> "1 minute 30 seconds"
 */
function formatRetryTime(seconds: number): string {
	if (seconds < 60) {
		return `${seconds} second${seconds !== 1 ? "s" : ""}`;
	}

	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;

	if (minutes < 60) {
		if (remainingSeconds === 0) {
			return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
		}
		return `${minutes} minute${minutes !== 1 ? "s" : ""} ${remainingSeconds} second${remainingSeconds !== 1 ? "s" : ""}`;
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (remainingMinutes === 0) {
		return `${hours} hour${hours !== 1 ? "s" : ""}`;
	}
	return `${hours} hour${hours !== 1 ? "s" : ""} ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`;
}

/**
 * Dispatch a rate limit event that can be listened to by the toast system
 */
function dispatchRateLimitEvent(seconds: number, formatted: string): void {
	if (typeof window !== "undefined") {
		window.dispatchEvent(
			new CustomEvent("better-auth:rate-limit", {
				detail: { seconds, formatted, message: `Too many attempts. Please try again in ${formatted}.` },
			}),
		);
	}
}

export const authClient = createAuthClient({
	plugins: [convexClient(), organizationClient(), emailOTPClient()],
	fetchOptions: {
		onError: async (context: FetchContext) => {
			const { response } = context;

			if (response.status === 429) {
				const retryAfter = response.headers.get("X-Retry-After");
				const seconds = retryAfter ? Number.parseInt(retryAfter, 10) : 60;
				const formatted = formatRetryTime(seconds);

				dispatchRateLimitEvent(seconds, formatted);
			}
		},
	},
});
