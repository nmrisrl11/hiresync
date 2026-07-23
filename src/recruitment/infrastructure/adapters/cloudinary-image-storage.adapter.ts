import { env } from "@/env";
import { ImageStoragePort } from "@/recruitment/application/ports/outbound";
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

	public async uploadLogo(fileBuffer: Buffer, fileName: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const options: UploadApiOptions = {
				folder: `${env.APP_NAME}/employers/logos`,
				public_id: fileName,
				overwrite: true,
				crop: "limit", //! Resizes only if the image exceeds the width/height, keeping aspect ratio
				width: 500,
				height: 500,
				fetch_format: "auto",
				quality: "auto",
			};

			const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
				if (error) return reject(new Error(error.message || "Failed to upload logo to Cloudinary"));

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
