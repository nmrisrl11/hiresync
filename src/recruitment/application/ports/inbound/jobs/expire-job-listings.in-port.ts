export abstract class ExpireJobListingsUseCasePort {
	abstract execute(): Promise<void>;
}
