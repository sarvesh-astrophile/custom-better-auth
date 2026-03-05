/**
 * Email sending functions for Better Auth organization plugin
 * Uses Plunk API for transactional emails
 */

interface InvitationData {
	id: string;
	email: string;
	organization: {
		id: string;
		name: string;
		slug: string;
	};
	inviter: {
		user: {
			id: string;
			name: string;
			email: string;
		};
	};
	role: string;
	expiresAt: number;
}

/**
 * Send organization invitation email via Plunk
 * Graceful error handling - logs errors but doesn't throw
 */
export async function sendInvitationEmail(data: InvitationData): Promise<void> {
	try {
		const plunkApiKey = process.env.PLUNK_API_KEY;

		if (!plunkApiKey) {
			console.error("PLUNK_API_KEY not configured");
			return;
		}

		const siteUrl = process.env.SITE_URL;
		if (!siteUrl) {
			console.error("SITE_URL not configured");
			return;
		}

		const inviteLink = `${siteUrl}/accept-invitation/${data.id}`;

		const response = await fetch("https://api.useplunk.com/v1/send", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${plunkApiKey}`,
			},
			body: JSON.stringify({
				to: data.email,
				subject: `You've been invited to join ${data.organization.name}`,
				body: `
Hello,

${data.inviter.user.name} has invited you to join ${data.organization.name}.

Click here to accept your invitation:
${inviteLink}

This invitation will expire in 48 hours.

If you did not expect this invitation, you can safely ignore this email.
				`,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Plunk API error:", errorText);
			return;
		}

		console.log(
			`Invitation email sent to ${data.email} for organization ${data.organization.name}`,
		);
	} catch (error) {
		console.error("Failed to send invitation email:", error);
	}
}
