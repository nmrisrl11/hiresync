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
		const profile = await this.employerProfileRepository.findByUserId(query.userId);
		if (!profile) throw new EmployerProfileNotFoundException();

		return {
			id: profile.id.getValue(),
			companyName: profile.companyName,
			description: profile.description,
			website: profile.website ? profile.website.getValue() : null,
			logoUrl: profile.logoUrl,
			industry: profile.industry,
		};
	}
}
