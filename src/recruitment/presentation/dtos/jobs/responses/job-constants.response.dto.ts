import { ApiProperty } from "@nestjs/swagger";

export class JobConstantsResponseDto {
	@ApiProperty({ type: [String], description: "Available employment types." })
	public readonly employmentTypes!: string[];

	@ApiProperty({ type: [String], description: "Available location types." })
	public readonly locationTypes!: string[];

	@ApiProperty({ type: [String], description: "Available job statuses." })
	public readonly jobStatuses!: string[];
}
