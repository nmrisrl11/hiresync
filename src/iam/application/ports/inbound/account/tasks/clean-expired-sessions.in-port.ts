export abstract class CleanExpiredSessionsUseCasePort {
	abstract execute(): Promise<void>;
}
