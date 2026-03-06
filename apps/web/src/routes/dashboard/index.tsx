import { api } from "@custom-better-auth/backend/convex/_generated/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";

export const Route = createFileRoute("/dashboard/")({
	component: DashboardIndex,
});

function DashboardIndex() {
	const privateData = useQuery(api.privateData.get);

	return (
		<div className="space-y-4">
			<p className="text-muted-foreground text-xs">
				{privateData?.message || "Welcome to your dashboard"}
			</p>
			<div className="flex gap-2">
				<Link
					to="/dashboard/org/settings"
					className="text-primary text-xs underline"
				>
					Organization Settings
				</Link>
			</div>
		</div>
	);
}
