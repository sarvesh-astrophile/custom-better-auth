import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center gap-1 rounded-none px-1.5 py-0.5 font-medium text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				default: "bg-primary/10 text-primary",
				secondary: "bg-secondary text-secondary-foreground",
				destructive: "bg-destructive/10 text-destructive",
				outline: "border border-border bg-background text-foreground",
				success: "bg-success/10 text-success",
				warning: "bg-warning/10 text-warning",
				info: "bg-info/10 text-info",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({
	className,
	variant,
	...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
	return (
		<span
			data-slot="badge"
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
