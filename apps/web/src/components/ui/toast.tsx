import { Toast } from "@base-ui/react/toast";
import { createContext, useContext, useState } from "react";

import { cn } from "@/lib/utils";

type ToastData = {
	id: string;
	title?: string;
	description?: string;
	type?: "success" | "error" | "info" | "warning";
};

type ToastContextType = {
	add: (toast: Omit<ToastData, "id">) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const typeStyles = {
	success: "border-l-2 border-l-success bg-success/10",
	error: "border-l-2 border-l-destructive bg-destructive/10",
	info: "border-l-2 border-l-info bg-info/10",
	warning: "border-l-2 border-l-warning bg-warning/10",
};

function ToastProvider({
	children,
	position = "bottom-right",
}: {
	children: React.ReactNode;
	position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
}) {
	const [toasts, setToasts] = useState<ToastData[]>([]);

	const add = (toast: Omit<ToastData, "id">) => {
		const id = crypto.randomUUID();
		setToasts((prev) => [...prev, { ...toast, id }]);
	};

	const remove = (id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	};

	const positionClasses = {
		"top-left": "top-0 left-0",
		"top-center": "top-0 left-1/2 -translate-x-1/2",
		"top-right": "top-0 right-0",
		"bottom-left": "bottom-0 left-0",
		"bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
		"bottom-right": "bottom-0 right-0",
	};

	return (
		<ToastContext.Provider value={{ add }}>
			<Toast.Provider>
				{children}
				<Toast.Viewport
					data-slot="toast-viewport"
					className={cn("fixed z-50 flex flex-col gap-2 p-4", positionClasses[position])}
				>
					{toasts.map((toast) => (
						<Toast.Root
							key={toast.id}
							toast={{
								id: toast.id,
								type: toast.type ?? "info",
								title: toast.title ?? "",
								description: toast.description,
							}}
							data-slot="toast"
							data-type={toast.type}
							className={cn(
								"bg-card text-card-foreground rounded-none shadow-lg",
								"ring-1 ring-foreground/10",
								"data-open:animate-in data-closed:animate-out",
								"data-closed:fade-out-0 data-open:fade-in-0",
								"data-closed:slide-out-to-right data-open:slide-in-from-right",
								"p-4 pr-8 relative min-w-72",
								toast.type && typeStyles[toast.type],
							)}
						>
							{toast.title && (
								<Toast.Title className="text-sm font-medium">
									{toast.title}
								</Toast.Title>
							)}
							{toast.description && (
								<Toast.Description className="text-xs text-muted-foreground">
									{toast.description}
								</Toast.Description>
							)}
							<Toast.Close
								className="absolute right-2 top-2 opacity-50 hover:opacity-100"
								onClick={() => remove(toast.id)}
							>
								×
							</Toast.Close>
						</Toast.Root>
					))}
				</Toast.Viewport>
			</Toast.Provider>
		</ToastContext.Provider>
	);
}

function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}

export { ToastProvider, useToast };
