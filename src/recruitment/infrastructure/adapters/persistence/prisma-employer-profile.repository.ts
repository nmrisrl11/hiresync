import { EmployerProfile } from "@/recruitment/domain/entities";
import { EmployerProfileRepository } from "@/recruitment/domain/repositories";
import { EmployerId } from "@/recruitment/domain/value-objects";
import { PrismaService } from "@/shared/database/prisma.service";
import { Injectable } from "@nestjs/common";
import { RecruitmentMapper } from "../../mappers/recruitment.mapper";

@Injectable()
export class PrismaEmployerProfileRepository implements EmployerProfileRepository {
	constructor(private readonly prisma: PrismaService) {}

	async findById(id: EmployerId): Promise<EmployerProfile | null> {
		const profile = await this.prisma.employerProfile.findUnique({
			where: { id: id.getValue() },
		});

		if (!profile) return null;
		return RecruitmentMapper.toEmployerProfileDomain(profile);
	}

	async findByUserId(userId: string): Promise<EmployerProfile | null> {
		const profile = await this.prisma.employerProfile.findUnique({
			where: { userId },
		});

		if (!profile) return null;
		return RecruitmentMapper.toEmployerProfileDomain(profile);
	}

	async save(profile: EmployerProfile): Promise<void> {
		await this.prisma.employerProfile.upsert({
			where: { id: profile.id.getValue() },
			update: {
				companyName: profile.companyName,
				description: profile.description,
				website: profile.website?.getValue() ?? null,
				logoUrl: profile.logoUrl,
				industry: profile.industry,
				updatedAt: profile.updatedAt,
			},
			create: {
				id: profile.id.getValue(),
				userId: profile.userId,
				companyName: profile.companyName,
				description: profile.description,
				website: profile.website?.getValue() ?? null,
				logoUrl: profile.logoUrl,
				industry: profile.industry,
				createdAt: profile.createdAt,
				updatedAt: profile.updatedAt,
			},
		});
	}
	async delete(id: EmployerId): Promise<void> {
		await this.prisma.employerProfile.delete({ where: { id: id.getValue() } });
	}
}
