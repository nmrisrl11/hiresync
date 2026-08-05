import { PublicEmployerProfileResult } from "@/recruitment/application/ports/inbound/employers";
import { PublicEmployerProfileResponseDto } from "../../dtos/employers";

export class PublicEmployerProfileResponseMapper {
	public static toDto(result: PublicEmployerProfileResult): PublicEmployerProfileResponseDto {
		return {
			id: result.id,
			companyName: result.companyName,
			description: result.description,
			website: result.website,
			logoUrl: result.logoUrl,
			industry: result.industry,
			createdAt: result.createdAt,
		};
	}
}
