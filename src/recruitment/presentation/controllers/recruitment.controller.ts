import {
	GetEmployerProfileByIdQuery,
	GetEmployerProfileByIdUseCasePort,
} from "@/recruitment/application/ports/inbound/employers";
import {
	GetJobListingByIdQuery,
	GetJobListingByIdUseCasePort,
	SearchJobListingQuery,
	SearchJobListingUseCasePort,
} from "@/recruitment/application/ports/inbound/jobs";
import { EMPLOYMENT_TYPE, JOB_STATUS, LOCATION_TYPE } from "@/recruitment/domain/types";
import { ApiSuccessResponse, Public } from "@/shared/http/decorators";
import { Controller, Get, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { PublicEmployerProfileResponseDto } from "../dtos/employers";
import {
	JobConstantsResponseDto,
	PaginatedJobListingsResponseDto,
	PublicJobListingResponseDto,
	SearchJobListingRequestDto,
} from "../dtos/jobs";
import { PublicEmployerProfileResponseMapper } from "../mappers/employers";
import {
	PaginatedJobListingsResponseMapper,
	PublicJobListingResponseMapper,
} from "../mappers/jobs";

@ApiTags("Recruitment")
@Controller("recruitments")
export class RecruitmentController {
	constructor(
		private readonly getEmployerProfileByIdUseCase: GetEmployerProfileByIdUseCasePort,
		private readonly getJobListingByIdUseCase: GetJobListingByIdUseCasePort,
		private readonly searchJobListingUseCase: SearchJobListingUseCasePort,
	) {}

	@Public()
	@Get("companies/:id")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 30 } })
	@ApiOperation({ summary: "Get a company (employer) profile by ID." })
	@ApiSuccessResponse(
		PublicEmployerProfileResponseDto,
		HttpStatus.OK,
		"Company profile retrieved successfully.",
	)
	public async getCompanyProfile(
		@Param("id") companyId: string,
	): Promise<PublicEmployerProfileResponseDto> {
		const query = new GetEmployerProfileByIdQuery(companyId);
		const profile = await this.getEmployerProfileByIdUseCase.execute(query);

		return PublicEmployerProfileResponseMapper.toDto(profile);
	}

	@Public()
	@Get("jobs")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 30 } })
	@ApiOperation({ summary: "Search, filter, and paginate published job listings." })
	@ApiSuccessResponse(
		PaginatedJobListingsResponseDto,
		HttpStatus.OK,
		"Job listings retrieved successfully.",
	)
	public async searchJobs(
		@Query() dto: SearchJobListingRequestDto,
	): Promise<PaginatedJobListingsResponseDto> {
		const query = new SearchJobListingQuery(
			dto.limit,
			dto.offset,
			dto.searchQuery,
			dto.employmentType,
			dto.locationType,
		);

		const result = await this.searchJobListingUseCase.execute(query);

		return PaginatedJobListingsResponseMapper.toDto(result, dto.limit, dto.offset);
	}

	@Public()
	@Get("jobs/:id")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 30 } })
	@ApiOperation({ summary: "Get a specific job listing by ID." })
	@ApiSuccessResponse(
		PublicJobListingResponseDto,
		HttpStatus.OK,
		"Job listing retrieved successfully.",
	)
	public async getJobListing(@Param("id") jobId: string): Promise<PublicJobListingResponseDto> {
		const query = new GetJobListingByIdQuery(jobId);
		const job = await this.getJobListingByIdUseCase.execute(query);

		return PublicJobListingResponseMapper.toDto(job);
	}

	@Public()
	@Get("meta")
	@Throttle({ default: { ttl: 60000, limit: 60 } })
	@ApiOperation({ summary: "Get job listing constants for dropdowns and filters." })
	@ApiSuccessResponse(
		JobConstantsResponseDto,
		HttpStatus.OK,
		"Job constants retrieved successfully.",
	)
	public getJobConstants(): JobConstantsResponseDto {
		return {
			employmentTypes: Object.values(EMPLOYMENT_TYPE),
			locationTypes: Object.values(LOCATION_TYPE),
			jobStatuses: Object.values(JOB_STATUS),
		};
	}
}
