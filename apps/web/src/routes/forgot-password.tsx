import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";

import { OTPInput } from "@/components/otp-input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/forgot-password")({
	component: ForgotPasswordPage,
});

type Step = "email" | "otp" | "password";

function ForgotPasswordPage() {
	const { add: toast } = useToast();

	const [step, setStep] = useState<Step>("email");
	const [email, setEmail] = useState("");
	const [currentOtp, setCurrentOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSendOTP = async (emailToSend: string) => {
		setIsLoading(true);
		setError(null);

		try {
			const result = await authClient.emailOtp.sendVerificationOtp({
				email: emailToSend,
				type: "forget-password",
			});

			if (result.error) {
				// Still show the OTP screen even on error (silent failure for security)
				// But log the error for debugging
				console.error("Failed to send OTP:", result.error);
			}

			// Always proceed to OTP screen (silent success for security)
			setEmail(emailToSend);
			setStep("otp");
			toast({
				title: "Code sent",
				description: "If an account exists, you'll receive a reset code",
				type: "success",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleVerifyOTP = (otp: string) => {
		// Store OTP and proceed to password reset
		setCurrentOtp(otp);
		setStep("password");
	};

	const handleResetPassword = async (newPassword: string) => {
		setIsLoading(true);
		setError(null);

		try {
			const result = await authClient.emailOtp.resetPassword({
				email,
				otp: currentOtp,
				password: newPassword,
			});

			if (result.error) {
				setError(result.error.message || "Failed to reset password");
				toast({
					title: "Reset failed",
					description: result.error.message || "Failed to reset password",
					type: "error",
				});
			} else {
				toast({
					title: "Password reset successful",
					description: "Please sign in with your new password",
					type: "success",
				});
				// Navigate to dashboard where auth forms are shown
				window.location.href = "/dashboard";
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="container mx-auto flex h-full max-w-md items-center justify-center p-6">
			<div className="w-full space-y-6">
				<div className="text-center">
					<h1 className="font-bold text-2xl">
						{step === "email" && "Forgot your password?"}
						{step === "otp" && "Enter reset code"}
						{step === "password" && "Create new password"}
					</h1>
					<p className="mt-2 text-muted-foreground text-sm">
						{step === "email" &&
							"Enter your email and we'll send you a reset code"}
						{step === "otp" && `Enter the 6-digit code sent to ${email}`}
						{step === "password" && "Enter your new password below"}
					</p>
				</div>

				{step === "email" && (
					<EmailForm
						onSubmit={handleSendOTP}
						isLoading={isLoading}
						error={error}
						onBack={() => (window.location.href = "/dashboard")}
					/>
				)}

				{step === "otp" && (
					<OTPInput
						email={email}
						onVerify={handleVerifyOTP}
						onResend={() => handleSendOTP(email)}
						error={error}
						isLoading={isLoading}
					/>
				)}

				{step === "password" && (
					<PasswordForm
						onSubmit={handleResetPassword}
						isLoading={isLoading}
						error={error}
					/>
				)}
			</div>
		</div>
	);
}

interface EmailFormProps {
	onSubmit: (email: string) => void;
	isLoading: boolean;
	error: string | null;
	onBack: () => void;
}

function EmailForm({ onSubmit, isLoading, error, onBack }: EmailFormProps) {
	const form = useForm({
		defaultValues: {
			email: "",
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
						{isLoading ? "Sending..." : "Send reset code"}
					</Button>
				)}
			</form.Subscribe>

			<div className="text-center">
				<Button
					type="button"
					variant="link"
					size="sm"
					onClick={onBack}
					className="text-xs"
				>
					Back to sign in
				</Button>
			</div>
		</form>
	);
}

interface PasswordFormProps {
	onSubmit: (password: string) => void;
	isLoading: boolean;
	error: string | null;
}

function PasswordForm({ onSubmit, isLoading, error }: PasswordFormProps) {
	const form = useForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			await onSubmit(value.password);
		},
		validators: {
			onSubmit: z
				.object({
					password: z.string().min(8, "Password must be at least 8 characters"),
					confirmPassword: z.string(),
				})
				.refine((data) => data.password === data.confirmPassword, {
					message: "Passwords don't match",
					path: ["confirmPassword"],
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
			<form.Field name="password">
				{(field) => (
					<Field name={field.name} invalid={field.state.meta.errors.length > 0}>
						<FieldLabel>New Password</FieldLabel>
						<Input
							type="password"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							disabled={isLoading}
						/>
						{field.state.meta.errors.map((err) => (
							<FieldError key={err?.message}>{err?.message}</FieldError>
						))}
					</Field>
				)}
			</form.Field>

			<form.Field name="confirmPassword">
				{(field) => (
					<Field name={field.name} invalid={field.state.meta.errors.length > 0}>
						<FieldLabel>Confirm Password</FieldLabel>
						<Input
							type="password"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							disabled={isLoading}
						/>
						{field.state.meta.errors.map((err) => (
							<FieldError key={err?.message}>{err?.message}</FieldError>
						))}
					</Field>
				)}
			</form.Field>

			{error && <div className="text-destructive text-sm">{error}</div>}

			<form.Subscribe>
				{(state) => (
					<Button
						type="submit"
						className="w-full"
						disabled={!state.canSubmit || state.isSubmitting || isLoading}
					>
						{isLoading ? "Resetting..." : "Reset Password"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
