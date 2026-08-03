import { ApiProperty } from "@nestjs/swagger";

export class ActiveSessionDto {
	@ApiProperty()
	public readonly id!: string;

	@ApiProperty()
	public readonly userAgent!: string | null;

	@ApiProperty()
	public readonly ipAddress!: string | null;

	@ApiProperty()
	public readonly lastActiveAt!: Date;

	@ApiProperty()
	public readonly isCurrentDevice!: boolean;
}

export class ActiveSessionsResponseDto {
	@ApiProperty({ type: [ActiveSessionDto], description: "List of active login sessions." })
	public readonly sessions!: ActiveSessionDto[];
}
