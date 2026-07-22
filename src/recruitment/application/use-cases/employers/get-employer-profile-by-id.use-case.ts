import { EmployerProfileRepository } from "@/recruitment/domain/repositories";
import { EmployerId } from "@/recruitment/domain/value-objects";
import { Injectable } from "@nestjs/common";
import { EmployerProfileNotFoundException } from "../../exceptions";
import {
	GetEmployerProfileByIdQuery,
	GetEmployerProfileByIdUseCasePort,
	PublicEmployerProfileResult,
} from "../../ports/inbound/employers";

@Injectable()
export class GetEmployerProfileByIdUseCase implements GetEmployerProfileByIdUseCasePort {
	constructor(private readonly employerProfileRepository: EmployerProfileRepository) {}

	public async execute(query: GetEmployerProfileByIdQuery): Promise<PublicEmployerProfileResult> {
		const employerIdVo = new EmployerId(query.employerId);

		const employerProfile = await this.employerProfileRepository.findById(employerIdVo);
		if (!employerProfile) throw new EmployerProfileNotFoundException();

		return {
			id: employerProfile.id.getValue(),
			companyName: employerProfile.companyName,
			description: employerProfile.description,
			website: employerProfile.website ? employerProfile.website.getValue() : null,
			logoUrl: employerProfile.logoUrl,
			industry: employerProfile.industry,
			createdAt: employerProfile.createdAt,
		};
	}
}
