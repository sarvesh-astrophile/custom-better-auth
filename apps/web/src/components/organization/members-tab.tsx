import {
	Copy,
	MoreHorizontal,
	RefreshCw,
	Search,
	UserPlus,
	X,
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyIcon,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
	Menu,
	MenuItem,
	MenuPopup,
	MenuSeparator,
	MenuTrigger,
} from "@/components/ui/menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils";

import InviteMemberDialog from "./invite-member-dialog";

type Member = {
	id: string;
	userId: string;
	role: string;
	createdAt: Date;
	user: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};
};

type Invitation = {
	id: string;
	email: string;
	role: string;
	status: string;
	createdAt: Date;
	expiresAt: Date;
	inviterId: string;
};

export default function MembersTab() {
	const toast = useToast();
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [sortOrder, setSortOrder] = useState("newest");
	const [isInviteOpen, setIsInviteOpen] = useState(false);

	const {
		data: activeOrganization,
		isPending,
		refetch,
	} = authClient.useActiveOrganization();
	const { data: activeMember } = authClient.useActiveMember();

	const canManage =
		activeMember?.role === "owner" || activeMember?.role === "admin";

	const members = (activeOrganization?.members as Member[] | undefined) || [];
	const invitations =
		(activeOrganization?.invitations as Invitation[] | undefined) || [];

	// Helper to get inviter name from members list
	const getInviterName = (inviterId: string) => {
		const inviter = members.find((m) => m.userId === inviterId);
		return inviter?.user.name ?? "Unknown";
	};

	// Filter and sort
	const filteredMembers = members
		.filter((member) => {
			const matchesSearch =
				member.user.name.toLowerCase().includes(search.toLowerCase()) ||
				member.user.email.toLowerCase().includes(search.toLowerCase());
			const matchesRole = roleFilter === "all" || member.role === roleFilter;
			return matchesSearch && matchesRole;
		})
		.sort((a, b) => {
			if (sortOrder === "newest") {
				return (
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
			}
			if (sortOrder === "alphabetical") {
				return a.user.name.localeCompare(b.user.name);
			}
			// By role (owner first)
			const roleOrder = { owner: 0, admin: 1, member: 2 };
			return (
				roleOrder[a.role as keyof typeof roleOrder] -
				roleOrder[b.role as keyof typeof roleOrder]
			);
		});

	const filteredInvitations = invitations
		.filter((inv) => {
			const matchesSearch = inv.email
				.toLowerCase()
				.includes(search.toLowerCase());
			const matchesRole = roleFilter === "all" || inv.role === roleFilter;
			return matchesSearch && matchesRole && inv.status === "pending";
		})
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);

	const handleRefresh = () => {
		refetch();
	};

	const handleCopyInviteLink = async (invitationId: string) => {
		const siteUrl = window.location.origin;
		const inviteLink = `${siteUrl}/accept-invitation/${invitationId}`;
		await navigator.clipboard.writeText(inviteLink);
		toast.add({
			type: "success",
			title: "Invite link copied",
		});
	};

	const handleCancelInvite = async (invitationId: string) => {
		try {
			const result = await authClient.organization.cancelInvitation({
				invitationId,
			});
			if (result.error) {
				toast.add({
					type: "error",
					title: "Failed to cancel invitation",
					description: result.error.message,
				});
			} else {
				toast.add({
					type: "success",
					title: "Invitation cancelled",
				});
				refetch();
			}
		} catch (error) {
			toast.add({
				type: "error",
				title: "Failed to cancel invitation",
			});
		}
	};

	const handleRemoveMember = async (memberIdOrEmail: string) => {
		try {
			const result = await authClient.organization.removeMember({
				memberIdOrEmail,
			});
			if (result.error) {
				toast.add({
					type: "error",
					title: "Failed to remove member",
					description: result.error.message,
				});
			} else {
				toast.add({
					type: "success",
					title: "Member removed",
				});
				refetch();
			}
		} catch (error) {
			toast.add({
				type: "error",
				title: "Failed to remove member",
			});
		}
	};

	if (isPending) {
		return (
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-8 w-32" />
					<Skeleton className="h-8 w-32" />
				</div>
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	const hasMembers =
		filteredMembers.length > 0 || filteredInvitations.length > 0;

	return (
		<div className="space-y-4">
			{/* Toolbar */}
			<div className="flex flex-wrap items-center gap-2">
				<div className="relative min-w-[200px] flex-1">
					<Search className="absolute top-1/2 left-2 size-3 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search members..."
						className="pl-7"
					/>
				</div>
				<Select
					value={roleFilter}
					onValueChange={(v) => setRoleFilter(v as string)}
				>
					<SelectTrigger className="w-32">
						<SelectValue placeholder="Role" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Roles</SelectItem>
						<SelectItem value="owner">Owner</SelectItem>
						<SelectItem value="admin">Admin</SelectItem>
						<SelectItem value="member">Member</SelectItem>
					</SelectContent>
				</Select>
				<Select
					value={sortOrder}
					onValueChange={(v) => setSortOrder(v as string)}
				>
					<SelectTrigger className="w-32">
						<SelectValue placeholder="Sort" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="newest">Newest</SelectItem>
						<SelectItem value="alphabetical">Alphabetical</SelectItem>
						<SelectItem value="role">By Role</SelectItem>
					</SelectContent>
				</Select>
				<Button variant="outline" size="icon" onClick={handleRefresh}>
					<RefreshCw className="size-3" />
				</Button>
				{canManage && (
					<Button onClick={() => setIsInviteOpen(true)}>
						<UserPlus className="size-3" />
						Invite
					</Button>
				)}
			</div>

			{/* Member Table */}
			{hasMembers ? (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Member</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Joined</TableHead>
							<TableHead className="w-12" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{/* Pending Invitations */}
						{filteredInvitations.map((invitation) => (
							<TableRow key={invitation.id}>
								<TableCell>
									<div className="flex items-center gap-2">
										<Avatar size="sm">
											<AvatarFallback>
												{getInitials(invitation.email)}
											</AvatarFallback>
										</Avatar>
										<div>
											<div className="text-muted-foreground">
												{invitation.email}
											</div>
										</div>
									</div>
								</TableCell>
								<TableCell>
									<Badge variant="secondary">{invitation.role}</Badge>
								</TableCell>
								<TableCell>
									<span className="text-muted-foreground">
										Invited by {getInviterName(invitation.inviterId)}
									</span>
								</TableCell>
								<TableCell>
									{canManage && (
										<Menu>
											<MenuTrigger
												render={
													<Button variant="ghost" size="icon-xs">
														<MoreHorizontal className="size-3" />
													</Button>
												}
											/>
											<MenuPopup className="bg-card">
												<MenuItem
													onClick={() => handleCopyInviteLink(invitation.id)}
												>
													<Copy className="size-3" />
													Copy Invite Link
												</MenuItem>
												<MenuSeparator />
												<MenuItem
													variant="destructive"
													onClick={() => handleCancelInvite(invitation.id)}
												>
													<X className="size-3" />
													Cancel Invite
												</MenuItem>
											</MenuPopup>
										</Menu>
									)}
								</TableCell>
							</TableRow>
						))}

						{/* Active Members */}
						{filteredMembers.map((member) => (
							<TableRow key={member.id}>
								<TableCell>
									<div className="flex items-center gap-2">
										<Avatar size="sm">
											<AvatarImage src={member.user.image || undefined} />
											<AvatarFallback>
												{getInitials(member.user.name)}
											</AvatarFallback>
										</Avatar>
										<div>
											<div>{member.user.name}</div>
											<div className="text-muted-foreground">
												{member.user.email}
											</div>
										</div>
									</div>
								</TableCell>
								<TableCell>
									<Badge
										variant={
											member.role === "owner"
												? "default"
												: member.role === "admin"
													? "secondary"
													: "outline"
										}
									>
										{member.role}
									</Badge>
								</TableCell>
								<TableCell>
									{new Date(member.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell>
									{canManage && member.role !== "owner" && (
										<Menu>
											<MenuTrigger
												render={
													<Button variant="ghost" size="icon-xs">
														<MoreHorizontal className="size-3" />
													</Button>
												}
											/>
											<MenuPopup className="bg-card">
												<MenuItem
													variant="destructive"
													onClick={() => handleRemoveMember(member.id)}
												>
													<X className="size-3" />
													Remove
												</MenuItem>
											</MenuPopup>
										</Menu>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			) : (
				<Empty>
					<EmptyIcon>
						<UserPlus className="size-6 text-muted-foreground" />
					</EmptyIcon>
					<EmptyTitle>No members found</EmptyTitle>
					<EmptyDescription>
						{search || roleFilter !== "all"
							? "Try adjusting your search or filters"
							: "Invite your first team member to get started"}
					</EmptyDescription>
					{canManage && !search && roleFilter === "all" && (
						<Button onClick={() => setIsInviteOpen(true)}>
							<UserPlus className="size-3" />
							Invite Member
						</Button>
					)}
				</Empty>
			)}

			{/* Invite Dialog */}
			<InviteMemberDialog
				open={isInviteOpen}
				onOpenChange={setIsInviteOpen}
				onSuccess={() => {
					refetch();
				}}
			/>
		</div>
	);
}
