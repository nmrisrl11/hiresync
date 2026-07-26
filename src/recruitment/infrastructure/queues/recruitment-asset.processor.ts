import {
	AssetDeletionPayload,
	DocumentStoragePort,
	ImageStoragePort,
} from "@/recruitment/application/ports/outbound";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";

@Processor("recruitment-asset-queue")
export class RecruitmentAssetProcessor extends WorkerHost {
	constructor(
		private readonly imageStorage: ImageStoragePort,
		private readonly documentStorage: DocumentStoragePort,
		private readonly logger: LoggerPort,
	) {
		super();
	}

	public async process(job: Job<AssetDeletionPayload>): Promise<any> {
		const { urls, type } = job.data;

		const deletePromises = urls.map(async (url) => {
			try {
				if (type === "image") {
					await this.imageStorage.deleteImage(url);
				} else {
					await this.documentStorage.deleteDocument(url);
				}
			} catch (error) {
				this.logger.error(
					`Failed to delete ${type}: ${url}`,
					error instanceof Error ? error.stack : String(error),
				);
			}
		});

		await Promise.all(deletePromises);
	}
}
