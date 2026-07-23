import { ApplicantProfile } from "../entities";
import { ApplicantId } from "../value-objects";

export abstract class ApplicantProfileRepository {
	abstract findById(id: ApplicantId): Promise<ApplicantProfile | null>;
	abstract findByUserId(userId: string): Promise<ApplicantProfile | null>;
	abstract save(profile: ApplicantProfile): Promise<void>;
}
