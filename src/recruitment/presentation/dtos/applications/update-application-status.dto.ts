import { APPLICATION_STATUS, type ApplicationStatus } from "@/recruitment/domain/types";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

export class UpdateApplicationStatusDto {
	@ApiProperty({ enum: APPLICATION_STATUS, description: "The new status of the application" })
	@IsEnum(APPLICATION_STATUS)
	newStatus!: ApplicationStatus;
}
