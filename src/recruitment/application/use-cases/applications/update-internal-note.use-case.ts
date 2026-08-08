import { JobApplicationHistory } from "@/recruitment/domain/entities";
import {
	EmployerProfileRepository,
	JobApplicationRepository,
} from "@/recruitment/domain/repositories";
import { APPLICATION_EVENT_TYPE } from "@/recruitment/domain/types";
import { JobApplicationHistoryId, JobApplicationId } from "@/recruitment/domain/value-objects";
import { IdGeneratorPort } from "@/shared/utils/ports";
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
		private readonly idGenerator: IdGeneratorPort,
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

		//! Create and push private history event
		const historyRecord = new JobApplicationHistory(
			new JobApplicationHistoryId(this.idGenerator.generateId()),
			application.id,
			APPLICATION_EVENT_TYPE.NOTE_ADDED,
			command.note ? "An internal note was added or updated." : "Internal note was removed.",
			null,
			false, //! PRIVATE: Only employers can see this timeline event
			new Date(),
		);
		application.addHistory(historyRecord);

		await this.jobApplicationRepository.save(application);
	}
}
