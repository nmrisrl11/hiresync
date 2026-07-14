export class ResponseMapper {
	public static toRegistrationMessage(verificationEmailEnqueued: boolean): { message: string } {
		if (!verificationEmailEnqueued) {
			return {
				message:
					"Account created successfully, but we encountered an issue sending the verification email. Please use the resend verification option later.",
			};
		}

		return {
			message: "Registration successful. Please check your email to verify your account.",
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
