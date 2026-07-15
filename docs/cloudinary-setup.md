# Cloudinary Infrastructure & Integration Setup

## Overview
Our application uses Cloudinary as a managed image storage and CDN service. This replaces the need for AWS S3 and eliminates complex image optimization pipelines. The backend handles secure uploads via a memory buffer stream, while the frontend dynamically requests optimized formats (WebP/AVIF).

## 1. Account Setup & Credentials
1. Create a free account at [Cloudinary](https://cloudinary.com/).
2. Navigate to your **Programmable Media Dashboard**.
3. Locate your **Product Environment Credentials**. You will need three specific values:
   - `Cloud Name`
   - `API Key`
   - `API Secret`

## 2. Environment Variables

### Backend (`.env`)
The NestJS backend requires full API access to authenticate upload and destroy commands.

```env
# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### Frontend (`.env.local`)
The frontend only needs the Cloud Name to construct public CDN URLs. **Never expose the API Key or Secret to the frontend.**

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
```

## 3. Backend Implementation (Hexagonal Architecture)

Our upload logic is strictly decoupled using the Adapter pattern. 

### The Port (`ImageStoragePort`)
The application layer defines a contract that knows nothing about Cloudinary:
```typescript
export abstract class ImageStoragePort {
	abstract uploadAvatar(fileBuffer: Buffer, fileName: string): Promise<string>;
	abstract deleteImage(publicId: string): Promise<void>;
}
```

### The Adapter (`CloudinaryImageStorageAdapter`)
The infrastructure layer implements the SDK. It streams `Express.Multer.File` buffers directly to Cloudinary without writing to the local disk.

- **Storage Location:** Images are automatically routed to an `avatars/` folder in your Cloudinary media library.
- **Overwrites:** We use `overwrite: true` and pass `user_${id}` as the filename to ensure a user's new avatar automatically replaces their old one in storage.
- **Return Value:** The adapter returns *only* the `public_id` (e.g., `avatars/user_12345`), which is saved to the database.

## 4. Security & Validation
- **File Size:** Limited to `2MB` at the controller level using NestJS `ParseFilePipe`.
- **File Type:** Restricted to `.png`, `.jpeg`, `.jpg`, and `.webp` using `FileTypeValidator`.
- **Authorization:** All upload and delete endpoints are protected by the global `@ApiBearerAuth()` JWT guard.