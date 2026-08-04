import { ApiProperty } from "@nestjs/swagger";

export class AdminRoleDto {
	@ApiProperty({ description: "The unique identifier of the role." })
	public readonly id!: string;

	@ApiProperty({ description: "The system code identifying the role." })
	public readonly code!: string;

	@ApiProperty({ description: "A brief description of the role's permissions.", nullable: true })
	public readonly description!: string | null;
}

class RolesListMetaDto {
	@ApiProperty({ description: "The total number of roles returned." })
	public readonly count!: number;
}

export class AdminRolesListResponseDto {
	@ApiProperty({ type: [AdminRoleDto], description: "List of system roles." })
	public readonly data!: AdminRoleDto[];

	@ApiProperty({ type: RolesListMetaDto, description: "Metadata for the roles list." })
	public readonly meta!: RolesListMetaDto;
}
