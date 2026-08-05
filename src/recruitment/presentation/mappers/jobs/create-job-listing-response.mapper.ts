import { CreateJobListingResponseDto } from "../../dtos/jobs";

export class CreateJobListingResponseMapper {
	public static toDto(jobId: string): CreateJobListingResponseDto {
		return { jobId };
	}
}
