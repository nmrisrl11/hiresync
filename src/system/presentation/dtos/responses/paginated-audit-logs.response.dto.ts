import { PaginationMetaResponseDto } from "@/shared/http/dtos";
import { ApiProperty } from "@nestjs/swagger";
import { AuditLogResponseDto } from "./audit-log.response.dto";

export class PaginatedAuditLogsResponseDto {
	@ApiProperty({ type: [AuditLogResponseDto], description: "The paginated list of audit logs." })
	public readonly data!: AuditLogResponseDto[];

	@ApiProperty({ type: PaginationMetaResponseDto, description: "Pagination metadata." })
	public readonly meta!: PaginationMetaResponseDto;
}
