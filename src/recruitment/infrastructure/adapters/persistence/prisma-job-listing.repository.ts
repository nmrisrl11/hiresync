import { JobListing } from "@/recruitment/domain/entities";
import { FindJobsFilter, JobListingRepository } from "@/recruitment/domain/repositories";
import { JobListingId } from "@/recruitment/domain/value-objects";
import { PrismaService } from "@/shared/database/prisma.service";
import { Injectable } from "@nestjs/common";
import { RecruitmentMapper } from "../../mappers/recruitment.mapper";
import { Prisma } from "@/generated/prisma/client";

@Injectable()
export class PrismaJobListingRepository implements JobListingRepository {
	constructor(private readonly prisma: PrismaService) {}

	private buildWhereClause(filter: Partial<FindJobsFilter>): Prisma.JobListingWhereInput {
		const where: Prisma.JobListingWhereInput = {};

		if (filter.status) where.status = filter.status;
		if (filter.employerId) where.employerId = filter.employerId.getValue();
		if (filter.searchQuery)
			where.OR = [
				{ title: { contains: filter.searchQuery, mode: "insensitive" } },
				{ description: { contains: filter.searchQuery, mode: "insensitive" } },
			];

		return where;
	}

	async findById(id: JobListingId): Promise<JobListing | null> {
		const job = await this.prisma.jobListing.findUnique({
			where: { id: id.getValue() },
		});

		if (!job) return null;
		return RecruitmentMapper.toJobListingDomain(job);
	}

	async findMany(filter: FindJobsFilter): Promise<JobListing[]> {
		const jobs = await this.prisma.jobListing.findMany({
			where: this.buildWhereClause(filter),
			take: filter.limit,
			skip: filter.offset,
			orderBy: { createdAt: "desc" },
		});

		return jobs.map((job) => RecruitmentMapper.toJobListingDomain(job));
	}

	async count(filter: Omit<FindJobsFilter, "limit" | "offset">): Promise<number> {
		return await this.prisma.jobListing.count({
			where: this.buildWhereClause(filter),
		});
	}

	async save(jobListing: JobListing): Promise<void> {
		await this.prisma.jobListing.upsert({
			where: { id: jobListing.id.getValue() },
			update: {
				title: jobListing.title,
				description: jobListing.description,
				requirements: jobListing.requirements,
				employmentType: jobListing.employmentType,
				locationType: jobListing.location.type,
				locationAddress: jobListing.location.address,
				salaryMin: jobListing.salaryRange?.min ?? null,
				salaryMax: jobListing.salaryRange?.max ?? null,
				salaryCurrency: jobListing.salaryRange?.currency ?? "USD",
				status: jobListing.status,
				expiresAt: jobListing.expiresAt,
				updatedAt: jobListing.updatedAt,
			},
			create: {
				id: jobListing.id.getValue(),
				employerId: jobListing.employerId.getValue(),
				title: jobListing.title,
				description: jobListing.description,
				requirements: jobListing.requirements,
				employmentType: jobListing.employmentType,
				locationType: jobListing.location.type,
				locationAddress: jobListing.location.address,
				salaryMin: jobListing.salaryRange?.min ?? null,
				salaryMax: jobListing.salaryRange?.max ?? null,
				salaryCurrency: jobListing.salaryRange?.currency ?? "USD",
				status: jobListing.status,
				expiresAt: jobListing.expiresAt,
				createdAt: jobListing.createdAt,
				updatedAt: jobListing.updatedAt,
			},
		});
	}

	async delete(id: JobListingId): Promise<void> {
		await this.prisma.jobListing.delete({ where: { id: id.getValue() } });
	}
}
