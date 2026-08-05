import { GetEmployerProfileResult } from "@/recruitment/application/ports/inbound/employers";
import { EmployerProfileResponseDto } from "../../dtos/employers";

export class EmployerProfileResponseMapper {
	public static toDto(result: GetEmployerProfileResult): EmployerProfileResponseDto {
		return {
			id: result.id,
			companyName: result.companyName,
			description: result.description,
			website: result.website,
			logoUrl: result.logoUrl,
			industry: result.industry,
		};
	}
}
