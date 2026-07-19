import {
	EmployerProfile as PrismaEmployerProfile,
	JobListing as PrismaJobListing,
} from "@/generated/prisma/client";
import { EmployerProfile, JobListing } from "@/recruitment/domain/entities";
import { EmploymentType, JobStatus, LocationType } from "@/recruitment/domain/types";
import {
	CompanyWebsite,
	EmployerId,
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
		const locationVo = new JobLocation(raw.locationType as LocationType, raw.locationAddress);

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
			raw.employmentType as EmploymentType,
			locationVo,
			salaryVo,
			raw.status as JobStatus,
			raw.expiresAt,
			raw.createdAt,
			raw.updatedAt,
		);
	}
}
