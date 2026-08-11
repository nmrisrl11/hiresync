import { ApiSuccessResponse, Roles } from "@/shared/http/decorators";
import { ROLES } from "@/shared/types";
import { GetAuditLogsQuery, GetAuditLogsUseCasePort } from "@/system/application/ports/inbound";
import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { GetAuditLogsRequestDto } from "../dtos/requests";
import { PaginatedAuditLogsResponseDto } from "../dtos/responses";
import { PaginatedAuditLogsResponseMapper } from "../mappers";

@ApiTags("System Administration")
@ApiBearerAuth()
@Roles(ROLES.ADMIN)
@Controller("admin/audit-logs")
export class SystemAdminController {
	constructor(private readonly getAuditLogsUseCase: GetAuditLogsUseCasePort) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 30 } })
	@ApiOperation({ summary: "Retrieve paginated system audit logs." })
	@ApiSuccessResponse(
		PaginatedAuditLogsResponseDto,
		HttpStatus.OK,
		"Audit logs retrieved successfully.",
	)
	public async getAuditLogs(
		@Query() queryDto: GetAuditLogsRequestDto,
	): Promise<PaginatedAuditLogsResponseDto> {
		const query = new GetAuditLogsQuery(
			queryDto.limit,
			queryDto.offset,
			queryDto.eventName,
			queryDto.actorId,
		);

		const result = await this.getAuditLogsUseCase.execute(query);

		return PaginatedAuditLogsResponseMapper.toDto(result, queryDto.limit, queryDto.offset);
	}
}
