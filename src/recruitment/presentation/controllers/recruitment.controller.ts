import {
	GetEmployerProfileByIdQuery,
	GetEmployerProfileByIdUseCasePort,
} from "@/recruitment/application/ports/inbound/employers";
import {
	GetJobListingByIdQuery,
	GetJobListingByIdUseCasePort,
} from "@/recruitment/application/ports/inbound/jobs";
import { EMPLOYMENT_TYPE, JOB_STATUS, LOCATION_TYPE } from "@/recruitment/domain/types";
import { Public } from "@/shared/presentation/decorators/public.decorator";
import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

@ApiTags("Recruitment")
@Controller("recruitments")
export class RecruitmentController {
	constructor(
		private readonly getEmployerProfileByIdUseCase: GetEmployerProfileByIdUseCasePort,
		private readonly getJobListingByIdUseCase: GetJobListingByIdUseCasePort,
	) {}

	@Public()
	@Get("companies/:id")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 30 } })
	@ApiOperation({ summary: "Get a company (employer) profile by ID." })
	public async getCompanyProfile(@Param("id") companyId: string) {
		const query = new GetEmployerProfileByIdQuery(companyId);
		const profile = await this.getEmployerProfileByIdUseCase.execute(query);

		return { data: profile };
	}

	@Public()
	@Get("jobs/:id")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 30 } })
	@ApiOperation({ summary: "Get a specific job listing by ID." })
	public async getJobListing(@Param("id") jobId: string) {
		const query = new GetJobListingByIdQuery(jobId);
		const job = await this.getJobListingByIdUseCase.execute(query);

		return { data: job };
	}

	@Public()
	@Get("meta")
	@Throttle({ default: { ttl: 60000, limit: 60 } })
	@ApiOperation({ summary: "Get job listing constants for dropdowns and filters." })
	public getJobConstants() {
		return {
			employmentTypes: Object.values(EMPLOYMENT_TYPE),
			locationTypes: Object.values(LOCATION_TYPE),
			jobStatuses: Object.values(JOB_STATUS),
		};
	}
}
