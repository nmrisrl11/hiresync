import { Role, User } from "@/iam/domain/entities";
import { Email } from "@/iam/domain/value-objects";

export abstract class IamRepositoryPort {
	abstract findAll(limit: number, offset: number): Promise<User[]>;
	abstract countAll(): Promise<number>;
	abstract findById(id: string): Promise<User | null>;
	abstract findByEmail(email: Email): Promise<User | null>;
	abstract findByVerificationToken(verificationToken: string): Promise<User | null>;
	abstract findByResetToken(resetToken: string): Promise<User | null>;
	abstract findRoleByCode(code: string): Promise<Role | null>;
	abstract delete(id: string): Promise<void>;
	abstract save(user: User): Promise<void>;
}
