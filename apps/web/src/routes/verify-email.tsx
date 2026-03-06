import { useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";

import { OTPInput } from "@/components/otp-input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

// Search params validation
const searchSchema = z.object({
	email: z.string().email().optional(),
});

type SearchParams = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/verify-email")({
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		const result = searchSchema.safeParse(search);
		return result.success ? result.data : {};
	},
	component: VerifyEmailPage,
});

function VerifyEmailPage() {
	const navigate = useNavigate();
	const search = useSearch({ from: Route.fullPath });
	const { add: toast } = useToast();
	const { data: session, isPending: isSessionLoading } =
		authClient.useSession();

	const [email, setEmail] = useState(search.email ?? "");
	const [showOTPInput, setShowOTPInput] = useState(!!search.email);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Show loading state while session is loading
	if (isSessionLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		);
	}

	// If user is already verified, redirect to dashboard
	if (session?.user?.emailVerified) {
		navigate({ to: "/dashboard" });
		return null;
	}

	// Get email from session if available
	const sessionEmail = session?.user?.email;
	const displayEmail = sessionEmail || email;

	const handleSendVerificationCode = async (emailToVerify: string) => {
		setIsLoading(true);
		setError(null);

		try {
			const result = await authClient.emailOtp.sendVerificationOtp({
				email: emailToVerify,
				type: "email-verification",
			});

			if (result.error) {
				setError(result.error.message || "Failed to send verification code");
				toast({
					title: "Error",
					description:
						result.error.message || "Failed to send verification code",
					type: "error",
				});
			} else {
				setShowOTPInput(true);
				setEmail(emailToVerify);
				toast({
					title: "Code sent",
					description: "Check your email for the verification code",
					type: "success",
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleVerify = async (otp: string) => {
		setIsLoading(true);
		setError(null);

		try {
			const result = await authClient.emailOtp.verifyEmail({
				email: displayEmail,
				otp,
			});

			if (result.error) {
				setError(result.error.message || "Invalid verification code");
				toast({
					title: "Verification failed",
					description: result.error.message || "Invalid verification code",
					type: "error",
				});
			} else {
				toast({
					title: "Email verified",
					description: "Your email has been verified successfully",
					type: "success",
				});
				navigate({ to: "/dashboard" });
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleResend = () => {
		handleSendVerificationCode(displayEmail);
	};

	// Email input form for users without session
	if (!showOTPInput) {
		return (
			<div className="container mx-auto flex h-full max-w-md items-center justify-center p-6">
				<div className="w-full space-y-6">
					<div className="text-center">
						<h1 className="font-bold text-2xl">Verify your email</h1>
						<p className="mt-2 text-muted-foreground text-sm">
							Enter your email address to receive a verification code
						</p>
					</div>

					<EmailForm
						onSubmit={handleSendVerificationCode}
						isLoading={isLoading}
						error={error}
						defaultEmail={sessionEmail}
					/>
				</div>
			</div>
		);
	}

	// OTP verification screen
	return (
		<div className="container mx-auto flex h-full max-w-md items-center justify-center p-6">
			<div className="w-full space-y-6">
				<div className="text-center">
					<h1 className="font-bold text-2xl">Enter verification code</h1>
					{session?.user?.name && (
						<p className="mt-1 text-muted-foreground text-sm">
							Hello, {session.user.name}
						</p>
					)}
				</div>

				<OTPInput
					email={displayEmail}
					onVerify={handleVerify}
					onResend={handleResend}
					error={error}
					isLoading={isLoading}
				/>

				{!session && (
					<div className="text-center">
						<Button
							variant="link"
							size="sm"
							onClick={() => setShowOTPInput(false)}
							className="text-xs"
						>
							Use a different email
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

interface EmailFormProps {
	onSubmit: (email: string) => void;
	isLoading: boolean;
	error: string | null;
	defaultEmail?: string;
}

function EmailForm({
	onSubmit,
	isLoading,
	error,
	defaultEmail,
}: EmailFormProps) {
	const form = useForm({
		defaultValues: {
			email: defaultEmail ?? "",
		},
		onSubmit: async ({ value }) => {
			await onSubmit(value.email);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("Please enter a valid email address"),
			}),
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<form.Field name="email">
				{(field) => (
					<Field
						name={field.name}
						invalid={field.state.meta.errors.length > 0 || !!error}
					>
						<FieldLabel>Email</FieldLabel>
						<Input
							type="email"
							placeholder="you@example.com"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							disabled={isLoading}
						/>
						{field.state.meta.errors.map((err) => (
							<FieldError key={err?.message}>{err?.message}</FieldError>
						))}
						{error && <FieldError>{error}</FieldError>}
					</Field>
				)}
			</form.Field>

			<form.Subscribe>
				{(state) => (
					<Button
						type="submit"
						className="w-full"
						disabled={!state.canSubmit || state.isSubmitting || isLoading}
					>
						{isLoading ? "Sending..." : "Send verification code"}
					</Button>
				)}
			</form.Subscribe>

			<div className="text-center">
				<Button
					type="button"
					variant="link"
					size="sm"
					onClick={() => (window.location.href = "/dashboard")}
					className="text-xs"
				>
					Don't have an account? Sign up
				</Button>
			</div>
		</form>
	);
}
