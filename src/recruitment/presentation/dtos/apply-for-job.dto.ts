import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";

export class ApplyForJobDto {
	@ApiProperty({ description: "The ID of the job listing being applied for" })
	@IsString()
	@IsUUID()
	jobListingId: string;
}
