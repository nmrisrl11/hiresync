import { Prisma } from "@/generated/prisma/client";
import { JobApplication } from "@/recruitment/domain/entities";
import {
	FindApplicationsFilter,
	JobApplicationRepository,
} from "@/recruitment/domain/repositories";
import { ApplicantId, JobApplicationId, JobListingId } from "@/recruitment/domain/value-objects";
import { PrismaService } from "@/shared/database/prisma.service";
import { Injectable } from "@nestjs/common";
import { RecruitmentMapper } from "../../mappers/recruitment.mapper";

@Injectable()
export class PrismaJobApplicationRepository implements JobApplicationRepository {
	constructor(private readonly prisma: PrismaService) {}

	private buildWhereClause(
		filter: Partial<FindApplicationsFilter>,
	): Prisma.JobApplicationWhereInput {
		const where: Prisma.JobApplicationWhereInput = {};

		if (filter.employerId) where.employerId = filter.employerId;
		if (filter.applicantId) where.applicantId = filter.applicantId;
		if (filter.jobListingId) where.jobListingId = filter.jobListingId;
		if (filter.status) where.status = filter.status;

		return where;
	}

	async findById(id: JobApplicationId): Promise<JobApplication | null> {
		const application = await this.prisma.jobApplication.findUnique({
			where: { id: id.getValue() },
		});

		if (!application) return null;
		return RecruitmentMapper.toJobApplicationDomain(application);
	}

	async findByIds(ids: JobApplicationId[]): Promise<JobApplication[]> {
		const applications = await this.prisma.jobApplication.findMany({
			where: { id: { in: ids.map((id) => id.getValue()) } },
		});

		return applications.map((app) => RecruitmentMapper.toJobApplicationDomain(app));
	}

	async findByApplicantAndJob(
		applicantId: ApplicantId,
		jobListingId: JobListingId,
	): Promise<JobApplication | null> {
		const application = await this.prisma.jobApplication.findUnique({
			where: {
				applicantId_jobListingId: {
					applicantId: applicantId.getValue(),
					jobListingId: jobListingId.getValue(),
				},
			},
		});

		if (!application) return null;
		return RecruitmentMapper.toJobApplicationDomain(application);
	}

	async findMany(filter: FindApplicationsFilter): Promise<JobApplication[]> {
		const applications = await this.prisma.jobApplication.findMany({
			where: this.buildWhereClause(filter),
			take: filter.limit,
			skip: filter.offset,
			orderBy: { appliedAt: "desc" }, //! Order by newest applications first
		});

		return applications.map((app) => RecruitmentMapper.toJobApplicationDomain(app));
	}

	async count(filter: FindApplicationsFilter): Promise<number> {
		return await this.prisma.jobApplication.count({
			where: this.buildWhereClause(filter),
		});
	}

	async save(application: JobApplication): Promise<void> {
		await this.prisma.jobApplication.upsert({
			where: { id: application.id.getValue() },
			update: {
				status: application.status,
				updatedAt: application.updatedAt,
			},
			create: {
				id: application.id.getValue(),
				applicantId: application.applicantId.getValue(),
				jobListingId: application.jobListingId.getValue(),
				employerId: application.employerId.getValue(),
				resumeUrl: application.resumeUrl,
				coverLetterUrl: application.coverLetterUrl,
				status: application.status,
				appliedAt: application.appliedAt,
				updatedAt: application.updatedAt,
			},
		});
	}

	async saveMany(applications: JobApplication[]): Promise<void> {
		//! Use a transaction to ensure all updates succeed or fail together
		await this.prisma.$transaction(
			applications.map((app) =>
				this.prisma.jobApplication.upsert({
					where: { id: app.id.getValue() },
					update: {
						status: app.status,
						updatedAt: app.updatedAt,
					},
					create: {
						id: app.id.getValue(),
						applicantId: app.applicantId.getValue(),
						jobListingId: app.jobListingId.getValue(),
						employerId: app.employerId.getValue(),
						resumeUrl: app.resumeUrl,
						coverLetterUrl: app.coverLetterUrl,
						status: app.status,
						appliedAt: app.appliedAt,
						updatedAt: app.updatedAt,
					},
				}),
			),
		);
	}
}
