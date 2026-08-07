export abstract class DocumentStoragePort {
	abstract uploadResume(fileBuffer: Buffer, fileName: string): Promise<string>;
	abstract uploadCoverLetter(fileBuffer: Buffer, fileName: string): Promise<string>;
	abstract deleteDocument(fileKey: string): Promise<void>;
}
