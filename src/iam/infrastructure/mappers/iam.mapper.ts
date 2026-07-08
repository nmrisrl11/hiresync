import {
	User as PrismaUser,
	Account as PrismaAccount,
	Role as PrismaRole,
} from "@/generated/prisma/client";
import { Account } from "@/iam/domain/entities/account.entity";
import { Role } from "@/iam/domain/entities/role.entity";
import { User } from "@/iam/domain/entities/user.entity";
import { Email } from "@/iam/domain/value-objects/email.value-object";

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
		);
	}
}
