import { APPLICATION_EVENT_TYPE, type ApplicationEventType } from "@/recruitment/domain/types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ApplicationHistoryResponseDto {
	@ApiProperty()
	public readonly id!: string;

	@ApiProperty({ enum: APPLICATION_EVENT_TYPE })
	public readonly eventType!: ApplicationEventType;

	@ApiProperty()
	public readonly message!: string;

	@ApiPropertyOptional({ type: "object", additionalProperties: true, nullable: true })
	public readonly metadata!: Record<string, unknown> | null;

	@ApiProperty()
	public readonly isPublic!: boolean;

	@ApiProperty()
	public readonly createdAt!: Date;
}
