export abstract class HashServicePort {
	abstract hash(plainText: string, length: number): Promise<string>;

	abstract compare(currentValue: string, existingValue: string): Promise<boolean>;
}
