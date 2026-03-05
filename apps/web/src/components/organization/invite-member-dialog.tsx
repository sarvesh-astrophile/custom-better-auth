import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

interface InviteMemberDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

type Role = "member" | "admin" | "owner";

export default function InviteMemberDialog({
	open,
	onOpenChange,
	onSuccess,
}: InviteMemberDialogProps) {
	const toast = useToast();
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<Role>("member");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Validation
		const newErrors: Record<string, string> = {};
		if (!email.trim()) {
			newErrors.email = "Email is required";
		} else if (!isValidEmail(email)) {
			newErrors.email = "Please enter a valid email";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await authClient.organization.inviteMember({
				email: email.trim(),
				role,
			});

			if (result.error) {
				toast.add({
					type: "error",
					title: "Failed to send invitation",
					description: result.error.message || "Please try again",
				});
			} else {
				toast.add({
					type: "success",
					title: "Invitation sent",
					description: `An invitation has been sent to ${email}`,
				});
				// Reset form but keep dialog open
				setEmail("");
				setRole("member");
				onSuccess?.();
			}
		} catch (error) {
			toast.add({
				type: "error",
				title: "Failed to send invitation",
				description:
					error instanceof Error ? error.message : "Please try again",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setEmail("");
		setRole("member");
		setErrors({});
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invite Member</DialogTitle>
					<DialogDescription>
						Send an invitation to join your organization
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<Field>
						<FieldLabel>Email</FieldLabel>
						<Input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="colleague@example.com"
							disabled={isSubmitting}
						/>
						{errors.email && <FieldError>{errors.email}</FieldError>}
					</Field>

					<Field>
						<FieldLabel>Role</FieldLabel>
						<Select
							value={role}
							onValueChange={(value) => setRole(value as Role)}
							disabled={isSubmitting}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="member">Member</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
								<SelectItem value="owner">Owner</SelectItem>
							</SelectContent>
						</Select>
					</Field>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Spinner size="sm" />
									Sending...
								</>
							) : (
								"Send Invite"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}
