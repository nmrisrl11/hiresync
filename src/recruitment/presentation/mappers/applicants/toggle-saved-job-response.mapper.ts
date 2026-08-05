import { ToggleSavedJobResponseDto } from "../../dtos/applicants";

export class ToggleSavedJobResponseMapper {
	public static toDto(result: { saved: boolean }): ToggleSavedJobResponseDto {
		return {
			saved: result.saved,
		};
	}
}
