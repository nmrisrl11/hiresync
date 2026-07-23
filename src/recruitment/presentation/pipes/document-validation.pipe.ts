import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

export interface ApplicationFilesPayload {
	resume?: Express.Multer.File[];
	coverLetter?: Express.Multer.File[];
}

@Injectable()
export class DocumentValidationPipe implements PipeTransform<
	ApplicationFilesPayload,
	ApplicationFilesPayload
> {
	private readonly MAX_SIZE = 5 * 1024 * 1024; // 5MB

	transform(value: ApplicationFilesPayload): ApplicationFilesPayload {
		const resumeFile = value?.resume?.[0];
		const coverLetterFile = value?.coverLetter?.[0];

		//! Validate Resume
		if (!resumeFile) throw new BadRequestException("A PDF resume is strictly required to apply.");

		if (resumeFile.mimetype !== "application/pdf")
			throw new BadRequestException("Resume must be a PDF file.");

		if (resumeFile.size > this.MAX_SIZE)
			throw new BadRequestException("Resume size cannot exceed 5MB.");

		//! Validate Cover Letter
		if (coverLetterFile) {
			if (coverLetterFile.mimetype !== "text/plain")
				throw new BadRequestException("Cover letter must be a standard .txt file.");

			if (coverLetterFile.size > this.MAX_SIZE)
				throw new BadRequestException("Cover letter size cannot exceed 5MB.");
		}

		return value;
	}
}
