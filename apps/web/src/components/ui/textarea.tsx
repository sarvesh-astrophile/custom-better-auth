import { cn } from "@/lib/utils";

interface TextareaProps extends React.ComponentProps<"textarea"> {}

function Textarea({ className, ...props }: TextareaProps) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"flex min-h-16 w-full resize-none border border-input bg-transparent px-2.5 py-1.5 text-xs",
				"rounded-none transition-colors",
				"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"placeholder:text-muted-foreground",
				"dark:bg-input/30",
				"aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
