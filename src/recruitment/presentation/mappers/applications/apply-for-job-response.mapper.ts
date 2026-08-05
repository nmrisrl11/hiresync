import { ApplyForJobResponseDto } from "../../dtos/applications";

export class ApplyForJobResponseMapper {
	public static toDto(applicationId: string): ApplyForJobResponseDto {
		return {
			applicationId,
		};
	}
}
