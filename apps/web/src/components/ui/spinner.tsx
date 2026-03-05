import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

function Spinner({
	className,
	size = "default",
	...props
}: React.ComponentProps<typeof Loader2> & { size?: "sm" | "default" | "lg" }) {
	const sizeClass =
		size === "sm" ? "size-3" : size === "lg" ? "size-6" : "size-4";

	return (
		<Loader2
			data-slot="spinner"
			className={cn("animate-spin", sizeClass, className)}
			{...props}
		/>
	);
}

export { Spinner };
