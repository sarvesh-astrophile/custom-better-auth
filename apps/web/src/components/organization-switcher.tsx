import { Link } from "@tanstack/react-router";
import { Building2, ChevronsUpDown, Plus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Menu,
	MenuGroup,
	MenuGroupLabel,
	MenuItem,
	MenuPopup,
	MenuSeparator,
	MenuTrigger,
} from "@/components/ui/menu";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils";

export default function OrganizationSwitcher() {
	const { data: organizations, isPending } = authClient.useListOrganizations();
	const { data: activeOrganization } = authClient.useActiveOrganization();

	const handleSwitch = async (organizationId: string) => {
		await authClient.organization.setActive({
			organizationId,
		});
	};

	if (isPending) {
		return (
			<div className="flex items-center gap-2">
				<Skeleton className="size-6 rounded-full" />
				<Skeleton className="h-4 w-24" />
			</div>
		);
	}

	if (!organizations || organizations.length === 0) {
		return (
			<Button variant="outline" size="sm">
				<Link to="/create-organization">
					<Plus className="size-3" />
					Create Organization
				</Link>
			</Button>
		);
	}

	const currentOrg = activeOrganization;

	return (
		<Menu>
			<MenuTrigger
				render={
					<Button variant="outline" size="sm" className="gap-2">
						{currentOrg?.logo ? (
							<Avatar size="sm">
								<AvatarImage src={currentOrg.logo} alt={currentOrg.name} />
								<AvatarFallback>{getInitials(currentOrg.name)}</AvatarFallback>
							</Avatar>
						) : (
							<Avatar size="sm">
								<AvatarFallback>
									{getInitials(currentOrg?.name || "O")}
								</AvatarFallback>
							</Avatar>
						)}
						<span className="max-w-32 truncate">{currentOrg?.name}</span>
						<ChevronsUpDown className="size-3 opacity-50" />
					</Button>
				}
			/>
			<MenuPopup className="w-64 bg-card">
				<MenuGroup>
					<MenuGroupLabel>Organizations</MenuGroupLabel>
					<MenuSeparator />
					{organizations.map((org) => (
						<MenuItem
							key={org.id}
							className="flex items-center justify-between"
							onClick={() => handleSwitch(org.id)}
						>
							<div className="flex items-center gap-2">
								{org.logo ? (
									<Avatar size="sm">
										<AvatarImage src={org.logo} alt={org.name} />
										<AvatarFallback>{getInitials(org.name)}</AvatarFallback>
									</Avatar>
								) : (
									<Avatar size="sm">
										<AvatarFallback>{getInitials(org.name)}</AvatarFallback>
									</Avatar>
								)}
								<div className="flex flex-col">
									<span className="truncate">{org.name}</span>
								</div>
							</div>
							{activeOrganization?.id === org.id && (
								<Badge variant="secondary" className="text-[10px]">
									Active
								</Badge>
							)}
						</MenuItem>
					))}
				</MenuGroup>
				<MenuSeparator />
				<MenuGroup>
					<MenuItem>
						<Link to="/create-organization" className="flex items-center gap-2">
							<Plus className="size-3" />
							Create Organization
						</Link>
					</MenuItem>
					<MenuItem>
						<Link
							to="/dashboard/org/settings"
							className="flex items-center gap-2"
						>
							<Building2 className="size-3" />
							Organization Settings
						</Link>
					</MenuItem>
				</MenuGroup>
			</MenuPopup>
		</Menu>
	);
}
