import { ApiProperty } from "@nestjs/swagger";

export class RestoreAccountResponseDto {
	@ApiProperty({ description: "The newly generated JWT access token for the restored account." })
	public readonly accessToken!: string;
}
