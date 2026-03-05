import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import UserMenu from "@/components/user-menu";

export const Route = createFileRoute("/dashboard")({
	component: DashboardLayout,
});

function DashboardLayout() {
	const [showSignIn, setShowSignIn] = useState(false);

	return (
		<>
			<Authenticated>
				<div className="p-4">
					<div className="mb-4 flex items-center justify-between">
						<h1 className="text-lg font-medium">Dashboard</h1>
						<UserMenu />
					</div>
					<Outlet />
				</div>
			</Authenticated>
			<Unauthenticated>
				<div className="flex min-h-[400px] items-center justify-center p-4">
					<div className="w-full max-w-sm space-y-4">
						{showSignIn ? (
							<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
						) : (
							<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
						)}
					</div>
				</div>
			</Unauthenticated>
			<AuthLoading>
				<div className="flex min-h-[400px] items-center justify-center">
					<span>Loading...</span>
				</div>
			</AuthLoading>
		</>
	);
}
