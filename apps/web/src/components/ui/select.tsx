import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
	return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectTrigger({
	className,
	children,
	...props
}: SelectPrimitive.Trigger.Props) {
	return (
		<SelectPrimitive.Trigger
			data-slot="select-trigger"
			className={cn(
				"flex h-8 w-full items-center justify-between gap-2 border border-input bg-transparent px-2.5 py-1 text-xs",
				"rounded-none transition-colors",
				"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"placeholder:text-muted-foreground",
				"dark:bg-input/30",
				className,
			)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon>
				<ChevronDownIcon className="size-4 opacity-50" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function SelectValue(props: SelectPrimitive.Value.Props) {
	return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectContent({
	className,
	children,
	...props
}: SelectPrimitive.Popup.Props) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Positioner>
				<SelectPrimitive.Popup
					data-slot="select-content"
					className={cn(
						"relative z-50 max-h-96 min-w-[8rem] overflow-hidden border bg-popover text-popover-foreground shadow-md",
						"rounded-none",
						"data-closed:animate-out data-open:animate-in",
						"data-closed:fade-out-0 data-open:fade-in-0",
						"data-closed:zoom-out-95 data-open:zoom-in-95",
						"origin-(--transform-origin)",
						className,
					)}
					{...props}
				>
					<SelectPrimitive.Arrow className="fill-popover" />
					<SelectPrimitive.List className="p-1">
						{children}
					</SelectPrimitive.List>
				</SelectPrimitive.Popup>
			</SelectPrimitive.Positioner>
		</SelectPrimitive.Portal>
	);
}

function SelectItem({
	className,
	children,
	...props
}: SelectPrimitive.Item.Props) {
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			className={cn(
				"relative flex w-full cursor-default select-none items-center gap-2 py-1.5 pr-8 pl-2 text-xs outline-none",
				"focus:bg-accent focus:text-accent-foreground",
				"data-disabled:pointer-events-none data-disabled:opacity-50",
				className,
			)}
			{...props}
		>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
			<SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center justify-center">
				<CheckIcon className="size-4" />
			</SelectPrimitive.ItemIndicator>
		</SelectPrimitive.Item>
	);
}

function SelectGroup(props: SelectPrimitive.Group.Props) {
	return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectSeparator({
	className,
	...props
}: SelectPrimitive.Separator.Props) {
	return (
		<SelectPrimitive.Separator
			data-slot="select-separator"
			className={cn("-mx-1 my-1 h-px bg-muted", className)}
			{...props}
		/>
	);
}

export {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
	SelectGroup,
	SelectSeparator,
};
