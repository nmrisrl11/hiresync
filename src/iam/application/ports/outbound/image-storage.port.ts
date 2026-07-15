export abstract class ImageStoragePort {
	abstract uploadAvatar(fileBuffer: Buffer, fileName: string): Promise<string>;
	abstract deleteImage(publicId: string): Promise<void>;
}
