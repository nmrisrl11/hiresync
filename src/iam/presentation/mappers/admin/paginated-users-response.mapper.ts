import { PaginatedUserResult } from "@/iam/application/ports/inbound/users";
import { PaginatedUsersResponseDto } from "../../dtos/admin";
import { AdminUserResponseMapper } from "./admin-user-response.mapper";

export class PaginatedUsersResponseMapper {
	public static toDto(
		result: PaginatedUserResult,
		limit: number,
		offset: number,
	): PaginatedUsersResponseDto {
		return {
			data: result.items.map((user) => AdminUserResponseMapper.toDto(user)),
			meta: {
				totalRecords: result.total,
				count: result.items.length,
				limit,
				offset,
			},
		};
	}
}
