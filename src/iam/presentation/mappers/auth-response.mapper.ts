export class AuthResponseMapper {
	public static toRegistrationMessage(isEmailQueued: boolean): { message: string } {
		if (!isEmailQueued) {
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
