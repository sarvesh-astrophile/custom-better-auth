import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import GeneralSettingsTab from "@/components/organization/general-settings-tab";
import MembersTab from "@/components/organization/members-tab";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";

export const Route = createFileRoute("/dashboard/org/settings")({
	component: OrganizationSettingsPage,
});

function OrganizationSettingsPage() {
	const [activeTab, setActiveTab] = useState("general");

	return (
		<div className="space-y-4">
			<div>
				<h1 className="font-medium text-lg">Organization Settings</h1>
				<p className="text-muted-foreground text-xs">
					Manage your organization settings and members
				</p>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTab value="general">General</TabsTab>
					<TabsTab value="members">Members</TabsTab>
				</TabsList>

				<TabsPanel value="general">
					<GeneralSettingsTab />
				</TabsPanel>

				<TabsPanel value="members">
					<MembersTab />
				</TabsPanel>
			</Tabs>
		</div>
	);
}
