export abstract class VerificationTokenGeneratorPort {
	abstract generateHexToken(length: number): string;
}
