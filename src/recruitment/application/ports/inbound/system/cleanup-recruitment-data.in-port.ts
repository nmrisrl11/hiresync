export abstract class CleanupRecruitmentDataUseCasePort {
	abstract execute(userId: string): Promise<void>;
}
