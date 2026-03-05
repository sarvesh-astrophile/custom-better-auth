import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useState } from "react";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { generateSlug } from "@/lib/utils";

export const Route = createFileRoute("/create-organization")({
	component: CreateOrganizationPage,
});

function CreateOrganizationPage() {
	const [showSignIn, setShowSignIn] = useState(false);

	return (
		<div className="flex min-h-[calc(100vh-60px)] items-center justify-center p-4">
			<Authenticated>
				<CreateOrganizationForm />
			</Authenticated>
			<Unauthenticated>
				<div className="w-full max-w-sm space-y-4">
					<div className="text-center">
						<h1 className="font-medium text-lg">Create an Organization</h1>
						<p className="text-muted-foreground text-xs">
							Sign in or create an account to get started
						</p>
					</div>
					{showSignIn ? (
						<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
					) : (
						<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
					)}
				</div>
			</Unauthenticated>
			<AuthLoading>
				<div className="flex items-center gap-2">
					<Spinner />
					<span>Loading...</span>
				</div>
			</AuthLoading>
		</div>
	);
}

function CreateOrganizationForm() {
	const navigate = useNavigate();
	const toast = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [slugState, setSlugState] = useState<
		"idle" | "checking" | "available" | "taken"
	>("idle");
	const [suggestedSlug, setSuggestedSlug] = useState<string | null>(null);
	const [logo, setLogo] = useState("");
	const [description, setDescription] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Auto-generate slug from name
	const handleNameChange = (newName: string) => {
		setName(newName);
		if (!slug) {
			setSlug(generateSlug(newName));
		}
	};

	// Check slug availability with debounce
	const checkSlug = (newSlug: string) => {
		if (!newSlug) {
			setSlugState("idle");
			return;
		}

		setSlugState("checking");
		const timeoutId = setTimeout(async () => {
			try {
				const result = await authClient.organization.checkSlug({
					slug: newSlug,
				});
				if (result.error) {
					setSlugState("taken");
					setSuggestedSlug(`${newSlug}-${Date.now().toString(36).slice(-4)}`);
				} else {
					setSlugState("available");
					setSuggestedSlug(null);
				}
			} catch {
				setSlugState("idle");
			}
		}, 300);

		return () => clearTimeout(timeoutId);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Validation
		const newErrors: Record<string, string> = {};
		if (!name.trim()) {
			newErrors.name = "Organization name is required";
		} else if (name.trim().length < 2) {
			newErrors.name = "Name must be at least 2 characters";
		}
		if (!slug.trim()) {
			newErrors.slug = "Slug is required";
		}
		if (logo && !isValidUrl(logo)) {
			newErrors.logo = "Please enter a valid URL";
		}
		if (description && description.length > 500) {
			newErrors.description = "Description must be less than 500 characters";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await authClient.organization.create({
				name: name.trim(),
				slug: slug.trim(),
				logo: logo.trim() || undefined,
			});

			if (result.error) {
				toast.add({
					type: "error",
					title: "Failed to create organization",
					description: result.error.message || "Please try again",
				});
			} else {
				toast.add({
					type: "success",
					title: "Organization created",
					description: "Redirecting to dashboard...",
				});
				navigate({ to: "/dashboard" });
			}
		} catch (error) {
			toast.add({
				type: "error",
				title: "Failed to create organization",
				description:
					error instanceof Error ? error.message : "Please try again",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="w-full max-w-md space-y-6">
			<div className="text-center">
				<h1 className="font-medium text-lg">Create Your Organization</h1>
				<p className="text-muted-foreground text-xs">
					Get started by creating your first organization
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<Field>
					<FieldLabel>Organization Name</FieldLabel>
					<Input
						value={name}
						onChange={(e) => handleNameChange(e.target.value)}
						placeholder="My Organization"
						disabled={isSubmitting}
					/>
					{errors.name && <FieldError>{errors.name}</FieldError>}
				</Field>

				<Field>
					<FieldLabel>Slug</FieldLabel>
					<div className="relative">
						<Input
							value={slug}
							onChange={(e) => {
								setSlug(e.target.value);
								checkSlug(e.target.value);
							}}
							placeholder="my-organization"
							disabled={isSubmitting}
							className={slugState === "taken" ? "border-warning" : ""}
						/>
						{slugState === "checking" && (
							<Spinner
								className="absolute top-1/2 right-2 -translate-y-1/2"
								size="sm"
							/>
						)}
					</div>
					{slugState === "taken" && suggestedSlug && (
						<p className="text-warning text-xs">
							This slug is already taken. Try:{" "}
							<button
								type="button"
								className="underline"
								onClick={() => setSlug(suggestedSlug)}
							>
								{suggestedSlug}
							</button>
						</p>
					)}
					{slugState === "available" && (
						<p className="text-success text-xs">Slug is available</p>
					)}
					{errors.slug && <FieldError>{errors.slug}</FieldError>}
				</Field>

				<Field>
					<FieldLabel>Logo URL (optional)</FieldLabel>
					<Input
						value={logo}
						onChange={(e) => setLogo(e.target.value)}
						placeholder="https://example.com/logo.png"
						disabled={isSubmitting}
					/>
					{errors.logo && <FieldError>{errors.logo}</FieldError>}
				</Field>

				<Field>
					<FieldLabel>Description (optional)</FieldLabel>
					<Textarea
						value={description}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
							setDescription(e.target.value)
						}
						placeholder="A brief description of your organization..."
						disabled={isSubmitting}
						rows={3}
					/>
					{errors.description && <FieldError>{errors.description}</FieldError>}
				</Field>

				<Button type="submit" className="w-full" disabled={isSubmitting}>
					{isSubmitting ? (
						<>
							<Spinner size="sm" />
							Creating...
						</>
					) : (
						"Create Organization"
					)}
				</Button>
			</form>
		</div>
	);
}

function isValidUrl(string: string): boolean {
	try {
		new URL(string);
		return true;
	} catch {
		return false;
	}
}
