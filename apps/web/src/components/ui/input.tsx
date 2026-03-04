import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<typeof InputPrimitive> & {
	sizeVariant?: "sm" | "default" | "lg";
	unstyled?: boolean;
};

function Input({
	className,
	sizeVariant = "default",
	unstyled = false,
	...props
}: InputProps) {
	const sizeClass =
		sizeVariant === "sm" ? "h-7" : sizeVariant === "lg" ? "h-9" : "h-8";

	return (
		<InputPrimitive
			data-slot="input"
			className={cn(
				!unstyled && [
					"border-input bg-transparent px-2.5 py-1 text-xs",
					"rounded-none border transition-colors",
					"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
					"disabled:cursor-not-allowed disabled:opacity-50",
					"placeholder:text-muted-foreground",
					"dark:bg-input/30",
					"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50",
					"min-w-0 w-full outline-none",
					sizeClass,
				],
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
export type { InputProps };
