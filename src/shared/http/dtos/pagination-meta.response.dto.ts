import { ApiProperty } from "@nestjs/swagger";

export class PaginationMetaResponseDto {
	@ApiProperty()
	public readonly totalRecords!: number;

	@ApiProperty()
	public readonly count!: number;

	@ApiProperty()
	public readonly limit!: number;

	@ApiProperty()
	public readonly offset!: number;
}
