import { Role } from "../entities";
import { RoleCode } from "../value-objects";

export abstract class RoleRepository {
	abstract findByCode(code: RoleCode): Promise<Role | null>;
	abstract findAll(): Promise<Role[]>;
}
