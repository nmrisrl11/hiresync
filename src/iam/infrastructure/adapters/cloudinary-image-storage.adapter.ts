import { env } from "@/env";
import { ImageStoragePort } from "@/iam/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import { v2 as cloudinary, UploadApiOptions } from "cloudinary";

@Injectable()
export class CloudinaryImageStorageAdapter implements ImageStoragePort {
	constructor() {
		cloudinary.config({
			cloud_name: env.CLOUDINARY_CLOUD_NAME,
			api_key: env.CLOUDINARY_API_KEY,
			api_secret: env.CLOUDINARY_API_SECRET,
		});
	}

	public async uploadAvatar(fileBuffer: Buffer, fileName: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const options: UploadApiOptions = {
				folder: "avatars",
				public_id: fileName,
				overwrite: true,
				gravity: "face", //! handles the automatic resizing and face detection
				crop: "thumb",
				width: 256,
				height: 256,
				fetch_format: "auto", //! enforce default optimization
				quality: "auto",
			};

			const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
				if (error)
					return reject(new Error(error.message || "Failed to upload image to Cloudinary"));

				if (!result)
					return reject(new Error("Cloudinary upload succeeded, but returned no result"));

				resolve(result.public_id);
			});

			uploadStream.end(fileBuffer);
		});
	}

	public async deleteImage(publicId: string): Promise<void> {
		await cloudinary.uploader.destroy(publicId);
	}
}
