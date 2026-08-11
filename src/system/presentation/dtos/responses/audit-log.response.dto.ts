import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AuditLogResponseDto {
	@ApiProperty() public readonly id!: string;
	@ApiProperty() public readonly eventName!: string;
	@ApiPropertyOptional({ nullable: true }) public readonly actorId!: string | null;
	@ApiProperty({ type: "object", additionalProperties: true }) public readonly payload!: Record<
		string,
		unknown
	>;
	@ApiProperty() public readonly occurredOn!: Date;
	@ApiProperty() public readonly createdAt!: Date;
}
