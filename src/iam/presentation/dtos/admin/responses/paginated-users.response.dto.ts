import { ApiProperty } from "@nestjs/swagger";
import { AdminUserResponseDto } from "./admin-user.response.dto";

class PaginationMetaDto {
	@ApiProperty({ description: "The total number of records available." })
	public readonly totalRecords!: number;

	@ApiProperty({ description: "The number of records returned in this request." })
	public readonly count!: number;

	@ApiProperty({ description: "The pagination limit applied." })
	public readonly limit!: number;

	@ApiProperty({ description: "The pagination offset applied." })
	public readonly offset!: number;
}

export class PaginatedUsersResponseDto {
	@ApiProperty({ type: [AdminUserResponseDto], description: "The paginated list of users." })
	public readonly data!: AdminUserResponseDto[];

	@ApiProperty({ type: PaginationMetaDto, description: "Pagination metadata." })
	public readonly meta!: PaginationMetaDto;
}
