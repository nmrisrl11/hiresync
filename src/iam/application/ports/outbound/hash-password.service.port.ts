export abstract class HashPasswordServicePort {
	abstract hashPassword(plainText: string): Promise<string>;
}
