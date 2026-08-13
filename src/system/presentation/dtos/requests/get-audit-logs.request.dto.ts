import { PaginationDto } from "@/shared/http/dtos";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class GetAuditLogsRequestDto extends PaginationDto {
	@ApiPropertyOptional({ description: "Filter by exact event name" })
	@IsOptional()
	@IsString()
	public readonly eventName?: string;

	@ApiPropertyOptional({ description: "Filter by the ID of the actor (User/Employer/Applicant)" })
	@IsOptional()
	@IsString()
	public readonly actorId?: string;
}
