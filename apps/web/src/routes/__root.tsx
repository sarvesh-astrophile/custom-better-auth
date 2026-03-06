import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import type { ConvexQueryClient } from "@convex-dev/react-query";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Navigate,
	Outlet,
	Scripts,
	useLocation,
	useRouteContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import type React from "react";

import { ToastProvider } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { getToken } from "@/lib/auth-server";
import { useRateLimitToast } from "@/hooks/useRateLimitToast";

import Header from "../components/header";
import appCss from "../index.css?url";

const getAuth = createServerFn({ method: "GET" }).handler(async () => {
	return await getToken();
});

export interface RouterAppContext {
	queryClient: QueryClient;
	convexQueryClient: ConvexQueryClient;
}

// Routes that should be excluded from email verification check
const EXCLUDED_FROM_VERIFICATION_CHECK = [
	"/verify-email",
	"/forgot-password",
	"/sign-in",
	"/sign-up",
	"/accept-invitation",
];

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "My App",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	component: RootDocument,
	beforeLoad: async (ctx) => {
		const token = await getAuth();
		if (token) {
			ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
		}

		// Email verification check happens client-side in EmailVerificationGuard
		// Server-side we just pass through since we don't have easy access to user data here

		return {
			isAuthenticated: !!token,
			token,
		};
	},
});

function RootDocument() {
	const context = useRouteContext({ from: Route.id });

	// Listen for rate limit events and show toast notifications
	useRateLimitToast();

	return (
		<ConvexBetterAuthProvider
			client={context.convexQueryClient.convexClient}
			authClient={authClient}
			initialToken={context.token}
		>
			<ToastProvider position="bottom-right">
				<html lang="en">
					<head>
						<HeadContent />
						<script
							// biome-ignore lint/security/noDangerouslySetInnerHtml: Required to prevent theme flash
							dangerouslySetInnerHTML={{
								__html: `
									(function() {
										const theme = localStorage.getItem('theme');
										const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
										if (isDark) document.documentElement.classList.add('dark');
									})();
								`,
							}}
						/>
					</head>
					<body>
						<div className="grid h-svh grid-rows-[auto_1fr]">
							<Header />
							<EmailVerificationGuard>
								<Outlet />
							</EmailVerificationGuard>
						</div>
						<TanStackRouterDevtools position="bottom-left" />
						<Scripts />
					</body>
				</html>
			</ToastProvider>
		</ConvexBetterAuthProvider>
	);
}

function EmailVerificationGuard({ children }: { children: React.ReactNode }) {
	const location = useLocation();
	const { data: session, isPending } = authClient.useSession();

	// Don't check on excluded routes
	const isExcluded = EXCLUDED_FROM_VERIFICATION_CHECK.some((path) =>
		location.pathname.startsWith(path),
	);

	if (isExcluded || isPending) {
		return <>{children}</>;
	}

	// If user is authenticated but email is not verified, redirect to verify page
	if (session?.user && !session.user.emailVerified) {
		return (
			<Navigate to="/verify-email" search={{ email: session.user.email }} />
		);
	}

	return <>{children}</>;
}
