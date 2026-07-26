import {
	AssetDeletionPayload,
	RecruitmentAssetQueuePort,
} from "@/recruitment/application/ports/outbound";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";

@Injectable()
export class BullMqRecruitmentAssetQueueAdapter implements RecruitmentAssetQueuePort {
	constructor(@InjectQueue("recruitment-asset-queue") private readonly assetQueue: Queue) {}

	public async enqueueDeletion(payload: AssetDeletionPayload): Promise<void> {
		await this.assetQueue.add("delete-assets", payload, {
			attempts: 3,
			backoff: { type: "exponential", delay: 2000 },
			removeOnComplete: true,
			removeOnFail: false,
		});
	}
}
