import { ApiProperty } from "@nestjs/swagger";

export class RefreshResponseDto {
	@ApiProperty({ description: "The newly generated JWT access token." })
	public readonly accessToken!: string;
}
