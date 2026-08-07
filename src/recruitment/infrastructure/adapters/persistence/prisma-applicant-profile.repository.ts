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
			include: { documents: true },
		});

		if (!profile) return null;
		return RecruitmentMapper.toApplicantProfileDomain(profile);
	}

	async findByUserId(userId: string): Promise<ApplicantProfile | null> {
		const profile = await this.prisma.applicantProfile.findUnique({
			where: { userId },
			include: { documents: true },
		});

		if (!profile) return null;
		return RecruitmentMapper.toApplicantProfileDomain(profile);
	}
	async save(profile: ApplicantProfile): Promise<void> {
		const currentDocumentIds = profile.getDocuments().map((doc) => doc.id.getValue());

		await this.prisma.$transaction(async (tx) => {
			//! Optimistic Concurrency Check: Reject if the database was modified after this profile was loaded
			const existingProfile = await tx.applicantProfile.findUnique({
				where: { id: profile.id.getValue() },
				select: { updatedAt: true },
			});

			if (
				existingProfile &&
				existingProfile.updatedAt.getTime() > profile.baseUpdatedAt.getTime()
			) {
				throw new Error("Concurrency conflict: The profile was updated by another request.");
			}

			//! Upsert the core profile data
			await tx.applicantProfile.upsert({
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

			//! Delete any documents from the database that are no longer in the Aggregate Root
			await tx.applicantDocument.deleteMany({
				where: {
					applicantId: profile.id.getValue(),
					id: { notIn: currentDocumentIds.length > 0 ? currentDocumentIds : [""] },
				},
			});

			//! Upsert all current documents to reflect additions or changes (like isPrimary toggles)
			for (const doc of profile.getDocuments()) {
				await tx.applicantDocument.upsert({
					where: { id: doc.id.getValue() },
					update: {
						isPrimary: doc.isPrimary,
						updatedAt: doc.updatedAt,
					},
					create: {
						id: doc.id.getValue(),
						applicantId: doc.applicantId.getValue(),
						type: doc.type,
						originalFilename: doc.originalFilename,
						fileKey: doc.fileKey,
						isPrimary: doc.isPrimary,
						createdAt: doc.createdAt,
						updatedAt: doc.updatedAt,
					},
				});
			}
		});
	}
}
