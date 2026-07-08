import { Role } from "@/iam/domain/entities/role.entity";
import { User } from "@/iam/domain/entities/user.entity";
import { Email } from "@/iam/domain/value-objects/email.value-object";

export abstract class IamRepositoryPort {
	abstract findAll(): Promise<User[]>;
	abstract findById(id: string): Promise<User | null>;
	abstract findByEmail(email: Email): Promise<User | null>;
	abstract findByVerificationToken(verificationToken: string): Promise<User | null>;
	abstract findByResetToken(resetToken: string): Promise<User | null>;
	abstract findRoleByCode(code: string): Promise<Role | null>;
	abstract save(user: User): Promise<void>;
}
