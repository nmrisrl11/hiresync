export class ResponseMapper {
	public static toRegistrationMessage(): { message: string } {
		return {
			message:
				"Registration successful. Please check your email to verify your account. If you do not receive it within a few minutes, you can use the resend verification option.",
		};
	}

	public static toRequestEmailChangeMessage(): {
		message: string;
	} {
		return {
			message:
				"Change email requested successfully. Please check your new email inbox to confirm. If you do not receive it within a few minutes, you can request it again.",
		};
	}
}
