export abstract class DocumentStoragePort {
	abstract uploadResume(fileBuffer: Buffer, fileName: string): Promise<string>;
	abstract uploadCoverLetter(fileBuffer: Buffer, fileName: string): Promise<string>;
	abstract deleteDocument(publicId: string): Promise<void>;
}
