import { JobListing } from "@/recruitment/domain/entities";
import { SavedJobRepository } from "@/recruitment/domain/repositories";
import { PrismaService } from "@/shared/database/prisma.service";
import { Injectable } from "@nestjs/common";
import { RecruitmentMapper } from "../../mappers/recruitment.mapper";

@Injectable()
export class PrismaSavedJobRepository implements SavedJobRepository {
	constructor(private readonly prisma: PrismaService) {}

	async saveJob(applicantId: string, jobListingId: string): Promise<void> {
		await this.prisma.savedJob.upsert({
			where: {
				applicantId_jobListingId: { applicantId, jobListingId },
			},
			update: {}, //! Do nothing if it already exists
			create: { applicantId, jobListingId },
		});
	}

	async removeSavedJob(applicantId: string, jobListingId: string): Promise<void> {
		await this.prisma.savedJob
			.delete({
				where: {
					applicantId_jobListingId: { applicantId, jobListingId },
				},
			})
			.catch(() => {
				//! Catch silently if it doesn't exist to prevent thrown 404 errors on toggles
			});
	}

	async hasSavedJob(applicantId: string, jobListingId: string): Promise<boolean> {
		const count = await this.prisma.savedJob.count({
			where: { applicantId, jobListingId },
		});
		return count > 0;
	}

	async getSavedJobsByApplicant(
		applicantId: string,
		limit: number,
		offset: number,
	): Promise<JobListing[]> {
		const savedJobs = await this.prisma.savedJob.findMany({
			where: { applicantId },
			take: limit,
			skip: offset,
			orderBy: { createdAt: "desc" },
			include: { jobListing: true }, //! Join the actual job listing data
		});

		return savedJobs.map((sj) => RecruitmentMapper.toJobListingDomain(sj.jobListing));
	}

	async countByApplicant(applicantId: string): Promise<number> {
		return await this.prisma.savedJob.count({
			where: { applicantId },
		});
	}
}
