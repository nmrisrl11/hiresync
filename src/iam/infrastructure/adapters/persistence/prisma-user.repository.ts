import { User } from "@/iam/domain/entities";
import { UserRepository } from "@/iam/domain/repositories";
import { OAuthProviderType } from "@/iam/domain/types";
import { Email, UserId } from "@/iam/domain/value-objects";
import { PrismaService } from "@/shared/database/prisma.service";
import { Injectable } from "@nestjs/common";
import { IamMapper } from "../../mappers/iam.mapper";

@Injectable()
export class PrismaUserRepository implements UserRepository {
	constructor(private readonly prisma: PrismaService) {}

	async findAll(limit: number, offset: number): Promise<User[]> {
		const users = await this.prisma.user.findMany({
			take: limit,
			skip: offset,
			orderBy: { createdAt: "desc" },
			include: { role: true, account: true, sessions: true, oauthAccounts: true },
		});

		return users.map((user) => IamMapper.toDomain(user));
	}

	async countAll(): Promise<number> {
		return await this.prisma.user.count();
	}

	async findById(id: UserId): Promise<User | null> {
		const user = await this.prisma.user.findUnique({
			where: { id: id.getValue() },
			include: { role: true, account: true, sessions: true, oauthAccounts: true },
		});

		if (!user) return null;
		return IamMapper.toDomain(user);
	}

	async findByEmail(email: Email): Promise<User | null> {
		const user = await this.prisma.user.findUnique({
			where: { email: email.getValue() },
			include: { role: true, account: true, sessions: true, oauthAccounts: true },
		});

		if (!user) return null;
		return IamMapper.toDomain(user);
	}

	async findByVerificationToken(verificationToken: string): Promise<User | null> {
		const user = await this.prisma.user.findFirst({
			where: { account: { verificationToken } },
			include: { role: true, account: true, sessions: true, oauthAccounts: true },
		});

		if (!user) return null;
		return IamMapper.toDomain(user);
	}

	async findByResetToken(resetToken: string): Promise<User | null> {
		const user = await this.prisma.user.findFirst({
			where: { account: { resetToken } },
			include: { role: true, account: true, sessions: true, oauthAccounts: true },
		});

		if (!user) return null;
		return IamMapper.toDomain(user);
	}

	async findPendingDeletions(date: Date): Promise<User[]> {
		const users = await this.prisma.user.findMany({
			where: {
				account: {
					scheduledForDeletionAt: { lte: date },
				},
			},
			include: { role: true, account: true, sessions: true, oauthAccounts: true },
		});

		return users.map((user) => IamMapper.toDomain(user));
	}

	async findByOAuth(provider: OAuthProviderType, providerAccountId: string): Promise<User | null> {
		const user = await this.prisma.user.findFirst({
			where: {
				oauthAccounts: {
					some: {
						provider,
						providerAccountId,
					},
				},
			},
			include: { role: true, account: true, sessions: true, oauthAccounts: true },
		});

		if (!user) return null;
		return IamMapper.toDomain(user);
	}

	async deleteExpiredSessions(date: Date): Promise<number> {
		const result = await this.prisma.session.deleteMany({
			where: {
				expiresAt: { lte: date },
			},
		});
		return result.count;
	}

	async delete(id: UserId): Promise<void> {
		await this.prisma.$transaction([
			this.prisma.account.deleteMany({
				where: { id: id.getValue() },
			}),
			this.prisma.user.delete({
				where: { id: id.getValue() },
			}),
		]);
	}

	async save(user: User): Promise<void> {
		if (!user.account) throw new Error("Cannot persist a new user without an account.");

		const mfaConfiguration = user.account.getMfaConfiguration();

		//! Extract current IDs to tell Prisma what to keep vs. what to delete
		const currentSessionIds = user.getSessions().map((s) => s.id.getValue());
		const currentOAuthAccountIds = user.getOAuthAccounts().map((oa) => oa.id.getValue());

		//! Prepare Session Upserts
		const sessionUpserts = user.getSessions().map((session) => ({
			where: { id: session.id.getValue() },
			update: {
				refreshTokenHash: session.getRefreshTokenHash(),
				userAgent: session.userAgent,
				ipAddress: session.ipAddress,
				isRevoked: session.getIsRevoked(),
				lastActiveAt: session.getLastActiveAt(),
				expiresAt: session.expiresAt,
			},
			create: {
				id: session.id.getValue(),
				refreshTokenHash: session.getRefreshTokenHash(),
				userAgent: session.userAgent,
				ipAddress: session.ipAddress,
				isRevoked: session.getIsRevoked(),
				lastActiveAt: session.getLastActiveAt(),
				expiresAt: session.expiresAt,
			},
		}));

		//! Prepare OAuth Account Upserts
		const oauthAccountUpserts = user.getOAuthAccounts().map((oa) => ({
			where: { id: oa.id.getValue() },
			update: {
				provider: oa.getProviderValue(),
				providerAccountId: oa.getProviderAccountId(),
			},
			create: {
				id: oa.id.getValue(),
				provider: oa.getProviderValue(),
				providerAccountId: oa.getProviderAccountId(),
			},
		}));

		await this.prisma.user.upsert({
			where: { id: user.id.getValue() },
			update: {
				email: user.email.getValue(),
				pendingEmail: user.pendingEmail,
				name: user.name,
				isVerified: user.isVerified,
				image: user.image,
				roleId: user.role.id.getValue(),
				account: {
					update: {
						passwordHash: user.account.getPasswordHash(),
						verificationToken: user.account.getVerificationToken(),
						verificationTokenExpiresAt: user.account.getVerificationTokenExpiresAt(),
						resetToken: user.account.getResetToken(),
						resetTokenExpiresAt: user.account.getResetTokenExpiresAt(),
						scheduledForDeletionAt: user.account.getScheduledForDeletionAt(),
						failedLoginAttempts: user.account.getFailedLoginState().getCount(),
						lockedUntil: user.account.getFailedLoginState().getLockedUntil(),
						isMfaEnabled: mfaConfiguration.getIsEnabled(),
						mfaSecret: mfaConfiguration.getSecret(),
						mfaPendingSecret: mfaConfiguration.getPendingSecret(),
						mfaBackupCodes: mfaConfiguration.getBackupCodes(),
					},
				},
				sessions: { deleteMany: { id: { notIn: currentSessionIds } }, upsert: sessionUpserts },
				oauthAccounts: {
					deleteMany: { id: { notIn: currentOAuthAccountIds } },
					upsert: oauthAccountUpserts,
				},
			},
			create: {
				id: user.id.getValue(),
				email: user.email.getValue(),
				name: user.name,
				isVerified: user.isVerified,
				roleId: user.role.id.getValue(),
				image: user.image,
				account: {
					create: {
						id: user.account.id.getValue(),
						passwordHash: user.account.getPasswordHash(),
						verificationToken: user.account.getVerificationToken(),
						verificationTokenExpiresAt: user.account.getVerificationTokenExpiresAt(),
						failedLoginAttempts: user.account.getFailedLoginState().getCount(),
						lockedUntil: user.account.getFailedLoginState().getLockedUntil(),
						isMfaEnabled: mfaConfiguration.getIsEnabled(),
						mfaSecret: mfaConfiguration.getSecret(),
						mfaPendingSecret: mfaConfiguration.getPendingSecret(),
						mfaBackupCodes: mfaConfiguration.getBackupCodes(),
					},
				},
				sessions: {
					create: user.getSessions().map((session) => ({
						id: session.id.getValue(),
						refreshTokenHash: session.getRefreshTokenHash(),
						userAgent: session.userAgent,
						ipAddress: session.ipAddress,
						isRevoked: session.getIsRevoked(),
						lastActiveAt: session.getLastActiveAt(),
						expiresAt: session.expiresAt,
					})),
				},
				oauthAccounts: {
					create: user.getOAuthAccounts().map((oa) => ({
						id: oa.id.getValue(),
						provider: oa.getProviderValue(),
						providerAccountId: oa.getProviderAccountId(),
					})),
				},
			},
		});
	}
}
