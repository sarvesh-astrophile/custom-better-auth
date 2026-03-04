import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type Theme = "dark" | "light" | "system";

export function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>("system");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const stored = localStorage.getItem("theme") as Theme | null;
		if (stored) {
			setTheme(stored);
		}
	}, []);

	useEffect(() => {
		if (!mounted) return;

		const root = document.documentElement;
		const isDark =
			theme === "dark" ||
			(theme === "system" &&
				window.matchMedia("(prefers-color-scheme: dark)").matches);

		if (isDark) {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}

		localStorage.setItem("theme", theme);
	}, [theme, mounted]);

	useEffect(() => {
		if (theme !== "system") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			const root = document.documentElement;
			if (mediaQuery.matches) {
				root.classList.add("dark");
			} else {
				root.classList.remove("dark");
			}
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	const cycleTheme = () => {
		setTheme((current) => {
			if (current === "light") return "dark";
			if (current === "dark") return "system";
			return "light";
		});
	};

	if (!mounted) {
		return (
			<Button variant="ghost" size="icon" disabled>
				<Sun className="h-5 w-5" />
			</Button>
		);
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={cycleTheme}
			title={`Current: ${theme} mode`}
		>
			{theme === "light" && <Sun className="h-5 w-5" />}
			{theme === "dark" && <Moon className="h-5 w-5" />}
			{theme === "system" && (
				<span className="relative">
					<Sun className="h-5 w-5" />
					<span className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full bg-muted-foreground" />
				</span>
			)}
		</Button>
	);
}
