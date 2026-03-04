import { api } from "@custom-better-auth/backend/convex/_generated/api";
import { useQuery } from "convex/react";

import {
	Menu,
	MenuGroup,
	MenuGroupLabel,
	MenuItem,
	MenuPopup,
	MenuSeparator,
	MenuTrigger,
} from "@/components/ui/menu";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";

export default function UserMenu() {
	const user = useQuery(api.auth.getCurrentUser);

	return (
		<Menu>
			<MenuTrigger render={<Button variant="outline" />}>{user?.name}</MenuTrigger>
			<MenuPopup className="bg-card">
				<MenuGroup>
					<MenuGroupLabel>My Account</MenuGroupLabel>
					<MenuSeparator />
					<MenuItem>{user?.email}</MenuItem>
					<MenuItem
						variant="destructive"
						onClick={() => {
							authClient.signOut({
								fetchOptions: {
									onSuccess: () => {
										location.reload();
									},
								},
							});
						}}
					>
						Sign Out
					</MenuItem>
				</MenuGroup>
			</MenuPopup>
		</Menu>
	);
}
