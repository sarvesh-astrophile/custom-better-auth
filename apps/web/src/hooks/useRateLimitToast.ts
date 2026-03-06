import { useEffect } from "react";

import { useToast } from "@/components/ui/toast";

interface RateLimitEventDetail {
	seconds: number;
	formatted: string;
	message: string;
}

/**
 * Hook that listens for rate limit events and displays toast notifications.
 * Place this in a component high in the React tree (e.g., in __root.tsx or a provider).
 *
 * @example
 * // In your root component:
 * function RootComponent() {
 *   useRateLimitToast();
 *   return <Outlet />;
 * }
 */
export function useRateLimitToast(): void {
	const toast = useToast();

	useEffect(() => {
		const handleRateLimit = (event: Event) => {
			const customEvent = event as CustomEvent<RateLimitEventDetail>;
			const { message } = customEvent.detail;

			toast.add({
				type: "error",
				title: "Rate Limit Exceeded",
				description: message,
			});
		};

		window.addEventListener("better-auth:rate-limit", handleRateLimit);

		return () => {
			window.removeEventListener("better-auth:rate-limit", handleRateLimit);
		};
	}, [toast]);
}
