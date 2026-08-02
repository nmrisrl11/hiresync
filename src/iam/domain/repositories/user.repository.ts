import { User } from "../entities";
import { OAuthProviderType } from "../types";
import { Email, UserId } from "../value-objects";

export abstract class UserRepository {
	abstract findAll(limit: number, offset: number): Promise<User[]>;
	abstract countAll(): Promise<number>;
	abstract findById(id: UserId): Promise<User | null>;
	abstract findByEmail(email: Email): Promise<User | null>;
	abstract findByVerificationToken(verificationToken: string): Promise<User | null>;
	abstract findByResetToken(resetToken: string): Promise<User | null>;
	abstract findPendingDeletions(date: Date): Promise<User[]>;
	abstract findByOAuth(
		provider: OAuthProviderType,
		providerAccountId: string,
	): Promise<User | null>;
	abstract deleteExpiredSessions(date: Date): Promise<number>;
	abstract delete(id: UserId): Promise<void>;
	abstract save(user: User): Promise<void>;
}
