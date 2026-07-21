export abstract class UserIntegrationPort {
	abstract getUserEmail(userId: string): Promise<string | null>;
}
