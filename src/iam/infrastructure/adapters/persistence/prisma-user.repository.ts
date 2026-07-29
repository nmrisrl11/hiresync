import { User } from "@/iam/domain/entities";
import { UserRepository } from "@/iam/domain/repositories";
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
			include: { role: true, account: true, sessions: true },
		});

		return users.map((user) => IamMapper.toDomain(user));
	}

	async countAll(): Promise<number> {
		return await this.prisma.user.count();
	}

	async findById(id: UserId): Promise<User | null> {
		const user = await this.prisma.user.findUnique({
			where: { id: id.getValue() },
			include: { role: true, account: true, sessions: true },
		});

		if (!user) return null;
		return IamMapper.toDomain(user);
	}

	async findByEmail(email: Email): Promise<User | null> {
		const user = await this.prisma.user.findUnique({
			where: { email: email.getValue() },
			include: { role: true, account: true, sessions: true },
		});

		if (!user) return null;
		return IamMapper.toDomain(user);
	}

	async findByVerificationToken(verificationToken: string): Promise<User | null> {
		const user = await this.prisma.user.findFirst({
			where: { account: { verificationToken } },
			include: { role: true, account: true, sessions: true },
		});

		if (!user) return null;
		return IamMapper.toDomain(user);
	}

	async findByResetToken(resetToken: string): Promise<User | null> {
		const user = await this.prisma.user.findFirst({
			where: { account: { resetToken } },
			include: { role: true, account: true, sessions: true },
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
			include: { role: true, account: true, sessions: true },
		});

		return users.map((user) => IamMapper.toDomain(user));
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
					},
				},
				sessions: {
					upsert: sessionUpserts,
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
			},
		});
	}
}
