import { PrismaService } from "@/shared/database/prisma.service";
import { Injectable } from "@nestjs/common";
import { IamMapper } from "../mappers/iam.mapper";
import { Prisma } from "@/generated/prisma/client";
import { Role, User } from "@/iam/domain/entities";
import { Email } from "@/iam/domain/value-objects";
import { UserAlreadyExistsException } from "@/iam/application/exceptions";
import { IamRepositoryPort } from "@/iam/application/ports/outbound";

@Injectable()
export class PrismaIamRepository implements IamRepositoryPort {
	constructor(private readonly prisma: PrismaService) {}

	async findAll(limit: number, offset: number): Promise<User[]> {
		const users = await this.prisma.user.findMany({
			take: limit,
			skip: offset,
			orderBy: { createdAt: "desc" },
			include: { role: true, account: true },
		});

		return users.map((user) => IamMapper.toDomain(user));
	}

	async countAll(): Promise<number> {
		return await this.prisma.user.count();
	}

	async findById(id: string): Promise<User | null> {
		const user = await this.prisma.user.findUnique({
			where: { id },
			include: { role: true, account: true },
		});

		if (!user) return null;
		return IamMapper.toDomain(user);
	}

	async findByEmail(email: Email): Promise<User | null> {
		const user = await this.prisma.user.findUnique({
			where: { email: email.getValue() },
			include: { role: true, account: true },
		});

		if (!user) return null;
		return IamMapper.toDomain(user);
	}

	async findByVerificationToken(verificationToken: string): Promise<User | null> {
		const user = await this.prisma.user.findFirst({
			where: {
				account: { verificationToken },
			},
			include: { role: true, account: true },
		});

		if (!user) return null;
		return IamMapper.toDomain(user);
	}

	async findByResetToken(resetToken: string): Promise<User | null> {
		const user = await this.prisma.user.findFirst({
			where: {
				account: { resetToken },
			},
			include: { role: true, account: true },
		});

		if (!user) return null;
		return IamMapper.toDomain(user);
	}

	async findRoleByCode(code: string): Promise<Role | null> {
		const role = await this.prisma.role.findUnique({ where: { code } });

		if (!role) return null;
		return new Role(role.id, role.code, role.description);
	}

	async findAllRoles(): Promise<Role[]> {
		const roles = await this.prisma.role.findMany({
			orderBy: { code: "asc" },
		});

		return roles.map((role) => new Role(role.id, role.code, role.description));
	}

	async save(user: User): Promise<void> {
		if (!user.account) throw new Error("Cannot persist a new user without an account.");

		try {
			await this.prisma.user.upsert({
				where: {
					id: user.id,
				},
				update: {
					email: user.email.getValue(),
					pendingEmail: user.pendingEmail,
					name: user.name,
					isVerified: user.isVerified,
					image: user.image,
					roleId: user.role.id,
					account: {
						update: {
							passwordHash: user.account.getPasswordHash(),
							verificationToken: user.account.getVerificationToken(),
							verificationTokenExpiresAt: user.account.getVerificationTokenExpiresAt(),
							resetToken: user.account.getResetToken(),
							resetTokenExpiresAt: user.account.getResetTokenExpiresAt(),
							refreshTokenHash: user.account.getRefreshTokenHash(),
						},
					},
				},
				create: {
					id: user.id,
					email: user.email.getValue(),
					name: user.name,
					isVerified: user.isVerified,
					roleId: user.role.id,
					image: user.image,
					account: {
						create: {
							id: user.account.id,
							passwordHash: user.account.getPasswordHash(),
							verificationToken: user.account.getVerificationToken(),
							verificationTokenExpiresAt: user.account.getVerificationTokenExpiresAt(),
							refreshTokenHash: user.account.getRefreshTokenHash(),
						},
					},
				},
			});
		} catch (error: unknown) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
				throw new UserAlreadyExistsException("An account with this email already exists.");
			throw error;
		}
	}

	async delete(id: string): Promise<void> {
		await this.prisma.$transaction([
			this.prisma.account.deleteMany({
				where: { id },
			}),
			this.prisma.user.delete({
				where: { id },
			}),
		]);
	}
}
