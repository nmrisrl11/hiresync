export type AssetType = "image" | "document";

export interface AssetDeletionPayload {
	urls: string[];
	type: AssetType;
}

export abstract class RecruitmentAssetQueuePort {
	abstract enqueueDeletion(payload: AssetDeletionPayload): Promise<void>;
}
