import { EmployerProfile } from "../entities";
import { EmployerId } from "../value-objects";

export abstract class EmployerProfileRepository {
	abstract findById(id: EmployerId): Promise<EmployerProfile | null>;
	abstract findByUserId(userId: string): Promise<EmployerProfile | null>;
	abstract save(profile: EmployerProfile): Promise<void>;
	abstract delete(id: EmployerId): Promise<void>;
}
