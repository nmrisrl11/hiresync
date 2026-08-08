import {
	ApplicantDocument as PrismaApplicantDocument,
	ApplicantProfile as PrismaApplicantProfile,
	EmployerProfile as PrismaEmployerProfile,
	JobApplication as PrismaJobApplication,
	JobApplicationHistory as PrismaJobApplicationHistory,
	JobListing as PrismaJobListing,
} from "@/generated/prisma/client";
import {
	ApplicantDocument,
	ApplicantProfile,
	EmployerProfile,
	JobApplication,
	JobApplicationHistory,
	JobListing,
} from "@/recruitment/domain/entities";
import {
	ApplicantDocumentId,
	ApplicantId,
	CompanyWebsite,
	EmployerId,
	JobApplicationHistoryId,
	JobApplicationId,
	JobListingId,
	JobLocation,
	SalaryRange,
} from "@/recruitment/domain/value-objects";

export class RecruitmentMapper {
	public static toEmployerProfileDomain(raw: PrismaEmployerProfile): EmployerProfile {
		const websiteVo = raw.website ? new CompanyWebsite(raw.website) : null;

		return new EmployerProfile(
			new EmployerId(raw.id),
			raw.userId,
			raw.companyName,
			raw.description,
			websiteVo,
			raw.logoUrl,
			raw.industry,
			raw.createdAt,
			raw.updatedAt,
		);
	}

	public static toJobListingDomain(raw: PrismaJobListing): JobListing {
		const locationVo = new JobLocation(raw.locationType, raw.locationAddress);

		let salaryVo: SalaryRange | null = null;
		if (raw.salaryMin !== null && raw.salaryMax !== null) {
			salaryVo = new SalaryRange(raw.salaryMin, raw.salaryMax, raw.salaryCurrency);
		}

		return new JobListing(
			new JobListingId(raw.id),
			new EmployerId(raw.employerId),
			raw.title,
			raw.description,
			raw.requirements,
			raw.employmentType,
			locationVo,
			salaryVo,
			raw.status,
			raw.expiresAt,
			raw.createdAt,
			raw.updatedAt,
		);
	}

	public static toApplicantProfileDomain(
		raw: PrismaApplicantProfile & { documents?: PrismaApplicantDocument[] },
	): ApplicantProfile {
		const documents = raw.documents
			? raw.documents.map((doc) => this.toApplicantDocumentDomain(doc))
			: [];

		return new ApplicantProfile(
			new ApplicantId(raw.id),
			raw.userId,
			raw.firstName,
			raw.lastName,
			raw.headline,
			raw.bio,
			documents,
			raw.createdAt,
			raw.updatedAt,
		);
	}

	public static toApplicantDocumentDomain(raw: PrismaApplicantDocument): ApplicantDocument {
		return new ApplicantDocument(
			new ApplicantDocumentId(raw.id),
			new ApplicantId(raw.applicantId),
			raw.type,
			raw.originalFilename,
			raw.fileKey,
			raw.isPrimary,
			raw.createdAt,
			raw.updatedAt,
		);
	}

	public static toJobApplicationHistoryDomain(
		raw: PrismaJobApplicationHistory,
	): JobApplicationHistory {
		return new JobApplicationHistory(
			new JobApplicationHistoryId(raw.id),
			new JobApplicationId(raw.jobApplicationId),
			raw.eventType,
			raw.message,
			raw.metadata ? (raw.metadata as Record<string, unknown>) : null,
			raw.isPublic,
			raw.createdAt,
		);
	}

	public static toJobApplicationDomain(
		raw: PrismaJobApplication & { history?: PrismaJobApplicationHistory[] },
	): JobApplication {
		const history = raw.history
			? raw.history.map((record) => this.toJobApplicationHistoryDomain(record))
			: [];

		return new JobApplication(
			new JobApplicationId(raw.id),
			new ApplicantId(raw.applicantId),
			new JobListingId(raw.jobListingId),
			new EmployerId(raw.employerId),
			raw.resumeUrl,
			raw.coverLetterUrl,
			raw.status,
			raw.internalNote,
			history,
			raw.appliedAt,
			raw.updatedAt,
		);
	}
}
