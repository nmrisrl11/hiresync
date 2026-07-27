import { APPLICATION_STATUS, type ApplicationStatus } from "@/recruitment/domain/types";
import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsEnum, IsUUID } from "class-validator";

export class BulkUpdateApplicationStatusDto {
	@ApiProperty({
		description: "Array of application IDs to update",
		type: [String],
	})
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID("4", { each: true })
	applicationIds!: string[];

	@ApiProperty({
		enum: APPLICATION_STATUS,
		description: "The new status to apply to all selected applications",
	})
	@IsEnum(APPLICATION_STATUS)
	newStatus!: ApplicationStatus;
}
