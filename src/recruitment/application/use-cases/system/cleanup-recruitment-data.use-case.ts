import {
	ApplicantProfileRepository,
	EmployerProfileRepository,
	JobApplicationRepository,
} from "@/recruitment/domain/repositories";
import { Injectable } from "@nestjs/common";
import { CleanupRecruitmentDataUseCasePort } from "../../ports/inbound/system";
import { DocumentStoragePort, ImageStoragePort } from "../../ports/outbound";

@Injectable()
export class CleanupRecruitmentDataUseCase implements CleanupRecruitmentDataUseCasePort {
	constructor(
		private readonly applicantProfileRepository: ApplicantProfileRepository,
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly jobApplicationRepository: JobApplicationRepository,
		private readonly imageStorage: ImageStoragePort,
		private readonly documentStorage: DocumentStoragePort,
	) {}

	public async execute(userId: string): Promise<void> {
		const [applicant, employer] = await Promise.all([
			this.applicantProfileRepository.findByUserId(userId),
			this.employerProfileRepository.findByUserId(userId),
		]);

		const deletePromises: Promise<void>[] = [];

		if (employer?.logoUrl) deletePromises.push(this.imageStorage.deleteImage(employer.logoUrl));

		if (applicant) {
			const applications = await this.jobApplicationRepository.findAllByApplicantId(applicant.id);
			//! Use a Set to ensure we don't try to delete the exact same Cloudinary file twice
			const uniqueDocumentUrls = new Set<string>();

			for (const app of applications) {
				if (app.resumeUrl) uniqueDocumentUrls.add(app.resumeUrl);
				if (app.coverLetterUrl) uniqueDocumentUrls.add(app.coverLetterUrl);
			}

			uniqueDocumentUrls.forEach((url) => {
				deletePromises.push(this.documentStorage.deleteDocument(url));
			});
		}

		await Promise.allSettled(deletePromises);
	}
}
