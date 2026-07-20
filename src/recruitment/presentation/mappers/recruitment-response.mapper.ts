import { JobListing } from "@/recruitment/domain/entities";

export class RecruitmentResponseMapper {
	public static toJobListingResponse(job: JobListing) {
		return {
			id: job.id.getValue(),
			employerId: job.employerId.getValue(),
			title: job.title,
			description: job.description,
			requirements: job.requirements,
			employmentType: job.employmentType,
			location: {
				type: job.location.type,
				address: job.location.address,
			},
			salaryRange: job.salaryRange
				? {
						min: job.salaryRange.min,
						max: job.salaryRange.max,
						currency: job.salaryRange.currency,
					}
				: null,
			status: job.status,
			expiresAt: job.expiresAt,
			createdAt: job.createdAt,
			updatedAt: job.updatedAt,
		};
	}
}
