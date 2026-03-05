import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import z from "zod";

import { useToast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const navigate = useNavigate({
		from: "/",
	});
	const { add: toast } = useToast();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: () => {
						navigate({
							to: "/dashboard",
						});
						toast({ title: "Sign up successful", type: "success" });
					},
					onError: (error) => {
						toast({
							title: error.error.message || error.error.statusText,
							type: "error",
						});
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-6 text-center font-bold text-3xl">Create Account</h1>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.Field name="name">
					{(field) => (
						<Field
							name={field.name}
							invalid={field.state.meta.errors.length > 0}
						>
							<FieldLabel>Name</FieldLabel>
							<Input
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
							{state.isSubmitting ? "Submitting..." : "Sign Up"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-4 text-center">
				<Button
					variant="link"
					onClick={onSwitchToSignIn}
					className="text-indigo-600 hover:text-indigo-800"
				>
					Already have an account? Sign In
				</Button>
			</div>
		</div>
	);
}
