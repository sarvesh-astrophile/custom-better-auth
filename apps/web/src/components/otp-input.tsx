import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "./ui/button";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

interface OTPInputProps {
	email: string;
	onVerify: (otp: string) => void;
	onResend: () => void;
	error?: string | null;
	isLoading?: boolean;
}

export function OTPInput({
	email,
	onVerify,
	onResend,
	error,
	isLoading,
}: OTPInputProps) {
	const [otp, setOtp] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);
	const [resendCooldown, setResendCooldown] = useState(30);
	const inputRef = useRef<HTMLInputElement>(null);

	// Auto-focus input on mount
	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	// Countdown timer for resend button
	useEffect(() => {
		if (resendCooldown <= 0) return;

		const timer = setInterval(() => {
			setResendCooldown((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [resendCooldown]);

	// Auto-submit when 6 digits entered
	useEffect(() => {
		if (otp.length === 6 && !isLoading) {
			onVerify(otp);
		}
	}, [otp, isLoading, onVerify]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, "").slice(0, 6);
		setOtp(value);
		setLocalError(null);
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pastedData = e.clipboardData
			.getData("text")
			.replace(/\D/g, "")
			.slice(0, 6);
		setOtp(pastedData);
		setLocalError(null);
	};

	const handleResend = () => {
		setOtp("");
		setResendCooldown(30);
		onResend();
		inputRef.current?.focus();
	};

	const displayError = error || localError;

	return (
		<div className="space-y-4">
			<div className="text-center">
				<p className="text-muted-foreground text-sm">
					Enter the 6-digit code sent to{" "}
					<span className="font-medium text-foreground">{email}</span>
				</p>
			</div>

			<Field invalid={!!displayError}>
				<FieldLabel className="sr-only">Verification Code</FieldLabel>
				<Input
					ref={inputRef}
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					autoComplete="one-time-code"
					placeholder="000000"
					value={otp}
					onChange={handleChange}
					onPaste={handlePaste}
					disabled={isLoading}
					className={cn(
						"h-12 text-center font-mono text-lg tracking-[0.5em]",
						isLoading && "opacity-50",
					)}
				/>
				{displayError && <FieldError>{displayError}</FieldError>}
			</Field>

			<div className="flex items-center justify-center gap-2">
				<Button
					type="button"
					variant="link"
					size="sm"
					onClick={handleResend}
					disabled={resendCooldown > 0 || isLoading}
					className="text-xs"
				>
					{resendCooldown > 0
						? `Resend code in ${resendCooldown}s`
						: "Didn't receive it? Resend"}
				</Button>
			</div>
		</div>
	);
}
