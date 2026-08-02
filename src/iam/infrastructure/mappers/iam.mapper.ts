import {
	Account as PrismaAccount,
	OAuthAccount as PrismaOAuthAccount,
	Role as PrismaRole,
	Session as PrismaSession,
	User as PrismaUser,
} from "@/generated/prisma/client";
import { Account, OAuthAccount, Role, Session, User } from "@/iam/domain/entities";
import { OAuthProviderType } from "@/iam/domain/types";
import {
	AccountId,
	Email,
	FailedLoginState,
	MfaConfiguration,
	OAuthAccountId,
	OAuthProvider,
	RoleCode,
	RoleId,
	SessionId,
	UserId,
} from "@/iam/domain/value-objects";

type PrismaUserWithRelations = PrismaUser & {
	role: PrismaRole;
	account: PrismaAccount | null;
	sessions: PrismaSession[];
	oauthAccounts: PrismaOAuthAccount[];
};

export class IamMapper {
	public static toDomain(raw: PrismaUserWithRelations): User {
		const role = new Role(
			new RoleId(raw.role.id),
			new RoleCode(raw.role.code),
			raw.role.description,
		);

		const mfaConfiguration = raw.account
			? new MfaConfiguration(
					raw.account.isMfaEnabled ?? false,
					raw.account.mfaSecret ?? null,
					raw.account.mfaPendingSecret ?? null,
					raw.account.mfaBackupCodes ?? [],
				)
			: MfaConfiguration.empty();

		const account = raw.account
			? new Account(
					new AccountId(raw.account.id),
					raw.account.passwordHash,
					raw.account.verificationToken,
					raw.account.verificationTokenExpiresAt,
					raw.account.resetToken,
					raw.account.resetTokenExpiresAt,
					raw.account.scheduledForDeletionAt,
					new FailedLoginState(raw.account.failedLoginAttempts, raw.account.lockedUntil),
					mfaConfiguration,
				)
			: null;

		const sessions = Array.isArray(raw.sessions)
			? raw.sessions.map(
					(s) =>
						new Session(
							new SessionId(s.id),
							new UserId(s.userId),
							s.refreshTokenHash,
							s.userAgent,
							s.ipAddress,
							s.isRevoked,
							s.lastActiveAt,
							s.expiresAt,
							s.createdAt,
						),
				)
			: [];

		const oauthAccounts = Array.isArray(raw.oauthAccounts)
			? raw.oauthAccounts.map(
					(oa) =>
						new OAuthAccount(
							new OAuthAccountId(oa.id),
							new UserId(oa.userId),
							new OAuthProvider(oa.provider as OAuthProviderType),
							oa.providerAccountId,
						),
				)
			: [];

		return new User(
			new UserId(raw.id),
			new Email(raw.email),
			raw.name,
			raw.isVerified,
			role,
			account,
			raw.image,
			raw.createdAt,
			raw.pendingEmail,
			sessions,
			oauthAccounts,
		);
	}
}
