import { Role } from "@/iam/domain/entities";
import { RoleRepository } from "@/iam/domain/repositories";
import { RoleCode, RoleId } from "@/iam/domain/value-objects";
import { PrismaService } from "@/shared/database/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PrismaRoleRepository implements RoleRepository {
	constructor(private readonly prisma: PrismaService) {}

	async findByCode(code: RoleCode): Promise<Role | null> {
		const role = await this.prisma.role.findUnique({
			where: { code: code.getValue() },
		});

		if (!role) return null;
		return new Role(new RoleId(role.id), new RoleCode(role.code), role.description);
	}

	async findAll(): Promise<Role[]> {
		const roles = await this.prisma.role.findMany({
			orderBy: { code: "asc" },
		});

		return roles.map(
			(role) => new Role(new RoleId(role.id), new RoleCode(role.code), role.description),
		);
	}
}
