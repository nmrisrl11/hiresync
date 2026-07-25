import {
	EmployerProfileRepository,
	JobApplicationRepository,
} from "@/recruitment/domain/repositories";
import { JobApplicationId } from "@/recruitment/domain/value-objects";
import { Injectable } from "@nestjs/common";
import {
	EmployerProfileNotFoundException,
	JobApplicationNotFoundException,
	UnauthorizedApplicationAccessException,
} from "../../exceptions";
import {
	UpdateInternalNoteCommand,
	UpdateInternalNoteUseCasePort,
} from "../../ports/inbound/applications";

@Injectable()
export class UpdateInternalNoteUseCase implements UpdateInternalNoteUseCasePort {
	constructor(
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly jobApplicationRepository: JobApplicationRepository,
	) {}

	public async execute(command: UpdateInternalNoteCommand): Promise<void> {
		const employer = await this.employerProfileRepository.findByUserId(command.employerUserId);
		if (!employer) throw new EmployerProfileNotFoundException();

		const application = await this.jobApplicationRepository.findById(
			new JobApplicationId(command.applicationId),
		);
		if (!application) throw new JobApplicationNotFoundException();

		if (!application.employerId.equals(employer.id))
			throw new UnauthorizedApplicationAccessException(
				"This application does not belong to your job listings.",
			);

		application.updateInternalNote(command.note);

		await this.jobApplicationRepository.save(application);
	}
}
