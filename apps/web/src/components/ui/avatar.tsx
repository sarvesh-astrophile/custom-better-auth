import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";

import { cn } from "@/lib/utils";

function Avatar({
	className,
	size = "default",
	...props
}: AvatarPrimitive.Root.Props & { size?: "sm" | "default" | "lg" }) {
	const sizeClass =
		size === "sm"
			? "size-6 text-xs"
			: size === "lg"
				? "size-12 text-lg"
				: "size-8 text-sm";

	return (
		<AvatarPrimitive.Root
			data-slot="avatar"
			className={cn(
				"relative flex shrink-0 items-center justify-center overflow-hidden bg-muted",
				sizeClass,
				className,
			)}
			{...props}
		/>
	);
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
	return (
		<AvatarPrimitive.Image
			data-slot="avatar-image"
			className={cn("aspect-square h-full w-full object-cover", className)}
			{...props}
		/>
	);
}

function AvatarFallback({
	className,
	...props
}: AvatarPrimitive.Fallback.Props) {
	return (
		<AvatarPrimitive.Fallback
			data-slot="avatar-fallback"
			className={cn(
				"flex h-full w-full items-center justify-center bg-muted font-medium",
				className,
			)}
			{...props}
		/>
	);
}

export { Avatar, AvatarImage, AvatarFallback };
