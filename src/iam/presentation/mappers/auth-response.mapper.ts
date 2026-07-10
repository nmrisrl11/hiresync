export class AuthResponseMapper {
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
}
