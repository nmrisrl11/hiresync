import { Injectable } from "@nestjs/common";
import {
	GetEmployerProfileQuery,
	GetEmployerProfileResult,
	GetEmployerProfileUseCasePort,
} from "../../ports/inbound/employers";
import { EmployerProfileRepository } from "@/recruitment/domain/repositories";
import { EmployerProfileNotFoundException } from "../../exceptions";

@Injectable()
export class GetEmployerProfileUseCase implements GetEmployerProfileUseCasePort {
	constructor(private readonly employerProfileRepository: EmployerProfileRepository) {}

	public async execute(query: GetEmployerProfileQuery): Promise<GetEmployerProfileResult> {
		const employerProfile = await this.employerProfileRepository.findByUserId(query.userId);
		if (!employerProfile) throw new EmployerProfileNotFoundException();

		return {
			id: employerProfile.id.getValue(),
			companyName: employerProfile.companyName,
			description: employerProfile.description,
			website: employerProfile.website ? employerProfile.website.getValue() : null,
			logoUrl: employerProfile.logoUrl,
			industry: employerProfile.industry,
		};
	}
}
