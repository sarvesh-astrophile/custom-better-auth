import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useEffect, useState } from "react";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/accept-invitation/$id")({
	component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading",
	);
	const [error, setError] = useState<string | null>(null);
	const [showSignUp, setShowSignUp] = useState(false);

	useEffect(() => {
		const acceptInvitation = async () => {
			try {
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
				setError(
					err instanceof Error ? err.message : "An unexpected error occurred",
				);
			}
		};

		acceptInvitation();
	}, [id, navigate]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<Authenticated>
					{status === "loading" && <p>Processing invitation...</p>}
					{status === "success" && (
						<div>
							<h1 className="font-bold text-2xl">Welcome!</h1>
							<p>You've successfully joined the organization.</p>
							<p className="text-muted-foreground">
								Redirecting to dashboard...
							</p>
						</div>
					)}
					{status === "error" && (
						<div>
							<h1 className="font-bold text-2xl text-destructive">Error</h1>
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
				</Authenticated>
				<Unauthenticated>
					{showSignUp ? (
						<div className="space-y-4">
							<h1 className="font-bold text-2xl">Create account to accept invitation</h1>
							<p className="text-muted-foreground">
								Sign up to join this organization.
							</p>
							<SignUpForm onSwitchToSignIn={() => setShowSignUp(false)} />
						</div>
					) : (
						<div className="space-y-4">
							<h1 className="font-bold text-2xl">Sign in to accept invitation</h1>
							<p className="text-muted-foreground">
								You need to be signed in to accept this organization invitation.
							</p>
							<SignInForm onSwitchToSignUp={() => setShowSignUp(true)} />
						</div>
					)}
				</Unauthenticated>
				<AuthLoading>
					<div>Loading...</div>
				</AuthLoading>
			</div>
		</div>
	);
}
