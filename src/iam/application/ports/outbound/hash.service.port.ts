export abstract class HashServicePort {
	abstract hash(plainText: string, length: number): Promise<string>;
}
