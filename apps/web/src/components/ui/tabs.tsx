import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			className={cn("w-full", className)}
			{...props}
		/>
	);
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			className={cn(
				"inline-flex h-9 items-center justify-start gap-1 border-b bg-transparent p-0 text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

function TabsTab({
	className,
	...props
}: TabsPrimitive.Tab.Props & { active?: boolean }) {
	return (
		<TabsPrimitive.Tab
			data-slot="tabs-tab"
			className={cn(
				"relative inline-flex h-9 items-center justify-center px-4 pb-2 font-medium text-xs ring-offset-background",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"disabled:pointer-events-none disabled:opacity-50",
				"data-[selected=true]:text-foreground",
				"after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-transparent",
				"data-[selected=true]:after:bg-primary",
				"hover:text-foreground",
				className,
			)}
			{...props}
		/>
	);
}

function TabsPanel({
	className,
	...props
}: TabsPrimitive.Panel.Props & { keepMounted?: boolean }) {
	return (
		<TabsPrimitive.Panel
			data-slot="tabs-panel"
			className={cn(
				"mt-4 ring-offset-background",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				className,
			)}
			{...props}
		/>
	);
}

export { Tabs, TabsList, TabsTab, TabsPanel };
