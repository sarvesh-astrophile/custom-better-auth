import { AlertTriangle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

export default function GeneralSettingsTab() {
	const toast = useToast();
	const { data: activeOrganization, isPending } =
		authClient.useActiveOrganization();
	const { data: activeMember } = authClient.useActiveMember();

	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [logo, setLogo] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [slugState, setSlugState] = useState<
		"idle" | "checking" | "available" | "taken"
	>("idle");
	const [suggestedSlug, setSuggestedSlug] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const isOwner = activeMember?.role === "owner";

	// Initialize form when data loads
	const [initialized, setInitialized] = useState(false);
	if (activeOrganization && !initialized) {
		setName(activeOrganization.name || "");
		setSlug(activeOrganization.slug || "");
		setLogo(activeOrganization.logo || "");
		setInitialized(true);
	}

	// Check slug availability with debounce
	const checkSlug = async (newSlug: string) => {
		if (!newSlug || newSlug === activeOrganization?.slug) {
			setSlugState("idle");
			return;
		}

		setSlugState("checking");
		try {
			const result = await authClient.organization.checkSlug({ slug: newSlug });
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
	};

	const handleSlugChange = (newSlug: string) => {
		setSlug(newSlug);
		// Debounce slug check
		const timeoutId = setTimeout(() => checkSlug(newSlug), 300);
		return () => clearTimeout(timeoutId);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		if (!isOwner) {
			toast.add({
				type: "error",
				title: "Permission denied",
				description: "Only owners can update organization settings",
			});
			return;
		}

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

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await authClient.organization.update({
				data: {
					name: name.trim(),
					slug: slug.trim(),
					logo: logo.trim() || undefined,
				},
			});

			if (result.error) {
				toast.add({
					type: "error",
					title: "Failed to update organization",
					description: result.error.message || "Please try again",
				});
			} else {
				toast.add({
					type: "success",
					title: "Settings updated",
				});
				setSlugState("idle");
			}
		} catch (error) {
			toast.add({
				type: "error",
				title: "Failed to update organization",
				description:
					error instanceof Error ? error.message : "Please try again",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isPending) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-24" />
				<Skeleton className="h-32 w-full" />
				<Skeleton className="h-32 w-full" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<form onSubmit={handleSubmit} className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>General Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<Field>
							<FieldLabel>Organization Name</FieldLabel>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="My Organization"
								disabled={isSubmitting || !isOwner}
							/>
							{errors.name && <FieldError>{errors.name}</FieldError>}
						</Field>

						<Field>
							<FieldLabel>Slug</FieldLabel>
							<div className="relative">
								<Input
									value={slug}
									onChange={(e) => handleSlugChange(e.target.value)}
									placeholder="my-organization"
									disabled={isSubmitting || !isOwner}
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
							{errors.slug && <FieldError>{errors.slug}</FieldError>}
							{!isOwner && (
								<p className="text-muted-foreground text-xs">
									Only owners can change the organization slug
								</p>
							)}
						</Field>

						<Field>
							<FieldLabel>Logo URL</FieldLabel>
							<Input
								value={logo}
								onChange={(e) => setLogo(e.target.value)}
								placeholder="https://example.com/logo.png"
								disabled={isSubmitting || !isOwner}
							/>
							{errors.logo && <FieldError>{errors.logo}</FieldError>}
						</Field>
					</CardContent>
				</Card>

				{isOwner && (
					<div className="flex justify-end">
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Spinner size="sm" />
									Saving...
								</>
							) : (
								"Save Changes"
							)}
						</Button>
					</div>
				)}
			</form>

			{/* Danger Zone */}
			<Card className="border-destructive/50">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-destructive">
						<AlertTriangle className="size-4" />
						Danger Zone
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isOwner ? (
						<div className="flex items-center justify-between">
							<div>
								<div className="font-medium">Transfer Ownership</div>
								<div className="text-muted-foreground text-xs">
									Transfer this organization to another member
								</div>
							</div>
							<Button variant="outline" disabled>
								Transfer
							</Button>
						</div>
					) : (
						<div className="flex items-center justify-between">
							<div>
								<div className="font-medium">Leave Organization</div>
								<div className="text-muted-foreground text-xs">
									You will lose access to all organization resources
								</div>
							</div>
							<Button variant="destructive" disabled>
								Leave
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
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
