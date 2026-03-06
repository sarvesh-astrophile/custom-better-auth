import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import z from "zod";

import { useToast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const navigate = useNavigate({
		from: "/",
	});
	const { add: toast } = useToast();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						navigate({
							to: "/dashboard",
						});
						toast({ title: "Sign in successful", type: "success" });
					},
					onError: (error) => {
						// Check if error is due to unverified email
						const errorMessage = error.error.message || "";
						if (
							errorMessage.toLowerCase().includes("verify") ||
							errorMessage.toLowerCase().includes("verification") ||
							error.error.statusCode === 403
						) {
							navigate({
								to: "/verify-email",
								search: { email: value.email },
							});
							toast({
								title: "Email not verified",
								description: "Please verify your email to continue",
								type: "warning",
							});
						} else {
							toast({
								title: error.error.message || error.error.statusText,
								type: "error",
							});
						}
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-6 text-center font-bold text-3xl">Welcome Back</h1>

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
							invalid={field.state.meta.errors.length > 0}
						>
							<FieldLabel>Email</FieldLabel>
							<Input
								type="email"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors.map((error) => (
								<FieldError key={error?.message}>{error?.message}</FieldError>
							))}
						</Field>
					)}
				</form.Field>

				<form.Field name="password">
					{(field) => (
						<Field
							name={field.name}
							invalid={field.state.meta.errors.length > 0}
						>
							<FieldLabel>Password</FieldLabel>
							<Input
								type="password"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors.map((error) => (
								<FieldError key={error?.message}>{error?.message}</FieldError>
							))}
							<div className="flex justify-end">
								<Button
									type="button"
									variant="link"
									size="sm"
									onClick={() => navigate({ to: "/forgot-password" })}
									className="h-auto p-0 text-xs"
								>
									Forgot password?
								</Button>
							</div>
						</Field>
					)}
				</form.Field>

				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							className="w-full"
							disabled={!state.canSubmit || state.isSubmitting}
						>
							{state.isSubmitting ? "Submitting..." : "Sign In"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-4 text-center">
				<Button
					variant="link"
					onClick={onSwitchToSignUp}
					className="text-indigo-600 hover:text-indigo-800"
				>
					Need an account? Sign Up
				</Button>
			</div>
		</div>
	);
}
