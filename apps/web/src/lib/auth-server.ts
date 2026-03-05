import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start";
import { env } from "@custom-better-auth/env/web";

export const {
	handler,
	getToken,
	fetchAuthQuery,
	fetchAuthMutation,
	fetchAuthAction,
} = convexBetterAuthReactStart({
	convexUrl: env.VITE_CONVEX_URL,
	convexSiteUrl: env.VITE_CONVEX_SITE_URL,
});
