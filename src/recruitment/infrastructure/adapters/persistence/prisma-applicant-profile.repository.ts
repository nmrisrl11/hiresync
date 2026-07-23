import { ApplicantProfile } from "@/recruitment/domain/entities";
import { ApplicantProfileRepository } from "@/recruitment/domain/repositories";
import { ApplicantId } from "@/recruitment/domain/value-objects";
import { PrismaService } from "@/shared/database/prisma.service";
import { Injectable } from "@nestjs/common";
import { RecruitmentMapper } from "../../mappers/recruitment.mapper";

@Injectable()
export class PrismaApplicantProfileRepository implements ApplicantProfileRepository {
	constructor(private readonly prisma: PrismaService) {}

	async findById(id: ApplicantId): Promise<ApplicantProfile | null> {
		const profile = await this.prisma.applicantProfile.findUnique({
			where: { id: id.getValue() },
		});

		if (!profile) return null;
		return RecruitmentMapper.toApplicantProfileDomain(profile);
	}

	async findByUserId(userId: string): Promise<ApplicantProfile | null> {
		const profile = await this.prisma.applicantProfile.findUnique({
			where: { userId },
		});

		if (!profile) return null;
		return RecruitmentMapper.toApplicantProfileDomain(profile);
	}
	async save(profile: ApplicantProfile): Promise<void> {
		await this.prisma.applicantProfile.upsert({
			where: { id: profile.id.getValue() },
			update: {
				firstName: profile.firstName,
				lastName: profile.lastName,
				headline: profile.headline,
				bio: profile.bio,
				updatedAt: profile.updatedAt,
			},
			create: {
				id: profile.id.getValue(),
				userId: profile.userId,
				firstName: profile.firstName,
				lastName: profile.lastName,
				headline: profile.headline,
				bio: profile.bio,
				createdAt: profile.createdAt,
				updatedAt: profile.updatedAt,
			},
		});
	}
}
