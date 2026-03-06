import { useCallback, useEffect, useState } from "react";

interface RateLimitState {
	isLimited: boolean;
	retryAfter: number | null;
	retryAfterFormatted: string | null;
}

interface RateLimitEventDetail {
	seconds: number;
	formatted: string;
	message: string;
}

/**
 * Format retry seconds into a compact human-readable string
 * e.g., 600 -> "10m", 90 -> "1m 30s"
 */
function formatCompactRetryTime(seconds: number): string {
	if (seconds < 60) {
		return `${seconds}s`;
	}

	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) {
		const remainingSeconds = seconds % 60;
		if (remainingSeconds === 0) {
			return `${minutes}m`;
		}
		return `${minutes}m ${remainingSeconds}s`;
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	if (remainingMinutes === 0) {
		return `${hours}h`;
	}
	return `${hours}h ${remainingMinutes}m`;
}

/**
 * Hook to track rate limit state for a specific endpoint or globally.
 * Listens for rate limit events from the auth client and manages countdown state.
 *
 * @example
 * function SignInForm() {
 *   const { isLimited, retryAfterFormatted } = useRateLimit();
 *
 *   return (
 *     <button disabled={isLimited}>
 *       {isLimited ? `Retry in ${retryAfterFormatted}` : "Sign In"}
 *     </button>
 *   );
 * }
 */
export function useRateLimit(): RateLimitState {
	const [state, setState] = useState<RateLimitState>({
		isLimited: false,
		retryAfter: null,
		retryAfterFormatted: null,
	});

	useEffect(() => {
		const handleRateLimit = (event: Event) => {
			const customEvent = event as CustomEvent<RateLimitEventDetail>;
			const { seconds, formatted } = customEvent.detail;

			setState({
				isLimited: true,
				retryAfter: seconds,
				retryAfterFormatted: formatted,
			});

			// Start countdown
			const intervalId = setInterval(() => {
				setState((prev) => {
					if (!prev.retryAfter || prev.retryAfter <= 1) {
						clearInterval(intervalId);
						return {
							isLimited: false,
							retryAfter: null,
							retryAfterFormatted: null,
						};
					}
					const newSeconds = prev.retryAfter - 1;
					return {
						...prev,
						retryAfter: newSeconds,
						retryAfterFormatted: formatCompactRetryTime(newSeconds),
					};
				});
			}, 1000);

			// Cleanup interval after the full duration
			setTimeout(() => {
				clearInterval(intervalId);
				setState({
					isLimited: false,
					retryAfter: null,
					retryAfterFormatted: null,
				});
			}, seconds * 1000);
		};

		window.addEventListener("better-auth:rate-limit", handleRateLimit);

		return () => {
			window.removeEventListener("better-auth:rate-limit", handleRateLimit);
		};
	}, []);

	return state;
}

/**
 * Hook to manually set rate limit state (useful for per-request handling)
 *
 * @example
 * function SignInForm() {
 *   const { isLimited, retryAfterFormatted, setRateLimited } = useRateLimitManual();
 *
 *   const handleSignIn = async () => {
 *     try {
 *       await authClient.signIn.email({ email, password });
 *     } catch (error) {
 *       if (error.status === 429) {
 *         setRateLimited(600); // 10 minutes
 *       }
 *     }
 *   };
 *
 *   return (
 *     <button disabled={isLimited} onClick={handleSignIn}>
 *       {isLimited ? `Retry in ${retryAfterFormatted}` : "Sign In"}
 *     </button>
 *   );
 * }
 */
export function useRateLimitManual(): RateLimitState & {
	setRateLimited: (seconds: number) => void;
	clearRateLimit: () => void;
} {
	const [state, setState] = useState<RateLimitState>({
		isLimited: false,
		retryAfter: null,
		retryAfterFormatted: null,
	});
	const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
	const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

	const clearTimers = useCallback(() => {
		if (intervalId) {
			clearInterval(intervalId);
			setIntervalId(null);
		}
		if (timeoutId) {
			clearTimeout(timeoutId);
			setTimeoutId(null);
		}
	}, [intervalId, timeoutId]);

	const setRateLimited = useCallback(
		(seconds: number) => {
			clearTimers();

			setState({
				isLimited: true,
				retryAfter: seconds,
				retryAfterFormatted: formatCompactRetryTime(seconds),
			});

			// Start countdown
			const newIntervalId = setInterval(() => {
				setState((prev) => {
					if (!prev.retryAfter || prev.retryAfter <= 1) {
						return {
							isLimited: false,
							retryAfter: null,
							retryAfterFormatted: null,
						};
					}
					const newSeconds = prev.retryAfter - 1;
					return {
						...prev,
						retryAfter: newSeconds,
						retryAfterFormatted: formatCompactRetryTime(newSeconds),
					};
				});
			}, 1000);
			setIntervalId(newIntervalId);

			// Clear after full duration
			const newTimeoutId = setTimeout(() => {
				clearInterval(newIntervalId);
				setState({
					isLimited: false,
					retryAfter: null,
					retryAfterFormatted: null,
				});
				setIntervalId(null);
				setTimeoutId(null);
			}, seconds * 1000);
			setTimeoutId(newTimeoutId);
		},
		[clearTimers],
	);

	const clearRateLimit = useCallback(() => {
		clearTimers();
		setState({
			isLimited: false,
			retryAfter: null,
			retryAfterFormatted: null,
		});
	}, [clearTimers]);

	useEffect(() => {
		return () => {
			clearTimers();
		};
	}, [clearTimers]);

	return {
		...state,
		setRateLimited,
		clearRateLimit,
	};
}
