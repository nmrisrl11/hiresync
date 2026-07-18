import {
	User as PrismaUser,
	Account as PrismaAccount,
	Role as PrismaRole,
} from "@/generated/prisma/client";
import { Account, Role, User } from "@/iam/domain/entities";
import { AccountId, Email, RoleCode, RoleId, UserId } from "@/iam/domain/value-objects";

type PrismaUserWithRelations = PrismaUser & { role: PrismaRole; account: PrismaAccount | null };

export class IamMapper {
	public static toDomain(raw: PrismaUserWithRelations): User {
		const role = new Role(
			new RoleId(raw.role.id),
			new RoleCode(raw.role.code),
			raw.role.description,
		);

		const account = raw.account
			? new Account(
					new AccountId(raw.account.id),
					raw.account.passwordHash,
					raw.account.verificationToken,
					raw.account.verificationTokenExpiresAt,
					raw.account.resetToken,
					raw.account.resetTokenExpiresAt,
					raw.account.refreshTokenHash,
				)
			: null;

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
		);
	}
}
