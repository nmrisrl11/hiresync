export class ResponseMapper {
	public static toRegistrationMessage(): { message: string } {
		return {
			message:
				"Registration successful. Please check your email to verify your account. If you do not receive it within a few minutes, you can use the resend verification option.",
		};
	}

	public static toRequestEmailChangeMessage(changeEmailRequestEnqueued: boolean): {
		message: string;
	} {
		if (!changeEmailRequestEnqueued) {
			return {
				message:
					"Change email requested successfully, but we encountered an issue sending the confirmation email. Please try again later.",
			};
		}

		return {
			message: "Change email requested successful. Please check your email to confirm.",
		};
	}
}
