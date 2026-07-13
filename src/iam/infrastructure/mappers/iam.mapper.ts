import {
	User as PrismaUser,
	Account as PrismaAccount,
	Role as PrismaRole,
} from "@/generated/prisma/client";
import { Account, Role, User } from "@/iam/domain/entities";
import { Email } from "@/iam/domain/value-objects";

type PrismaUserWithRelations = PrismaUser & { role: PrismaRole; account: PrismaAccount | null };

export class IamMapper {
	public static toDomain(raw: PrismaUserWithRelations): User {
		const role = new Role(raw.role.id, raw.role.code, raw.role.description);
		let account: Account | null = null;

		if (raw.account) {
			account = new Account(
				raw.account.id,
				raw.account.passwordHash,
				raw.account.verificationToken,
				raw.account.verificationTokenExpiresAt,
				raw.account.resetToken,
				raw.account.resetTokenExpiresAt,
				raw.account.refreshTokenHash,
			);
		}

		return new User(
			raw.id,
			new Email(raw.email),
			raw.name,
			raw.isVerified,
			role,
			account,
			raw.image,
			raw.createdAt,
		);
	}
}
