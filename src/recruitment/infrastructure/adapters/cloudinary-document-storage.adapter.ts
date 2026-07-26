import { env } from "@/env";
import { DocumentStoragePort } from "@/recruitment/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import { v2 as cloudinary, UploadApiOptions } from "cloudinary";

@Injectable()
export class CloudinaryDocumentStorageAdapter implements DocumentStoragePort {
	constructor() {
		cloudinary.config({
			cloud_name: env.CLOUDINARY_CLOUD_NAME,
			api_key: env.CLOUDINARY_API_KEY,
			api_secret: env.CLOUDINARY_API_SECRET,
		});
	}

	public async uploadResume(fileBuffer: Buffer, fileName: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const options: UploadApiOptions = {
				folder: `${env.APP_NAME}/applicants/resumes`,
				public_id: fileName,
				overwrite: true,
				resource_type: "image", // Cloudinary uses 'image' for PDFs
				format: "pdf",
			};

			const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
				if (error) return reject(new Error(error.message || "Failed to upload resume."));
				if (!result) return reject(new Error("Cloudinary upload returned no result."));
				resolve(result.public_id);
			});
			uploadStream.end(fileBuffer);
		});
	}

	public async uploadCoverLetter(fileBuffer: Buffer, fileName: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const options: UploadApiOptions = {
				folder: `${env.APP_NAME}/applicants/cover_letters`,
				public_id: fileName,
				overwrite: true,
				resource_type: "raw", // Cloudinary requires 'raw' for .txt files
			};

			const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
				if (error) return reject(new Error(error.message || "Failed to upload cover letter."));
				if (!result) return reject(new Error("Cloudinary upload returned no result."));
				resolve(result.public_id);
			});
			uploadStream.end(fileBuffer);
		});
	}

	public async deleteDocument(publicId: string): Promise<void> {
		const isCoverLetter = publicId.includes("/cover_letters") || publicId.endsWith(".txt");
		const resourceType = isCoverLetter ? "raw" : "image";

		await cloudinary.uploader.destroy(publicId, {
			resource_type: resourceType,
		});
	}
}
