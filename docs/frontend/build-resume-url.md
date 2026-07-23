# Cloudinary Resume URL Builder (`buildResumeUrl`)

## Overview
The `buildResumeUrl` utility is a strictly typed TypeScript function designed to reconstruct a full Cloudinary CDN URL from a stored `public_id` path specifically for applicant resumes.

Because Cloudinary treats PDFs as `image` resources (for rendering and thumbnail generation), they are served from the `/image/upload/` route. To force the browser to view or download the actual PDF, the URL must append the `.pdf` extension.

## Location
`src/shared/lib/utils/cloudinary-documents.ts`

## Prerequisites
Your frontend environment must have the Cloudinary Cloud Name configured:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
```

## The Utility Function

```typescript
/**
 * Builds a Cloudinary URL for a PDF Resume.
 * Cloudinary treats PDFs as images, so we use the /image/upload/ route and append the .pdf extension.
 * 
 * @param publicId - The unique Cloudinary identifier stored in the database.
 * @returns The fully qualified CDN URL, or null if no publicId is provided.
 */
export function buildResumeUrl(publicId: string | null | undefined): string | null {
	if (!publicId) return null;

	const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
	
	if (!cloudName) {
		console.warn("Cloudinary cloud name is missing in environment variables.");
		return null;
	}

	// Append .pdf because the file was formatted as pdf during the upload stream
	return `[https://res.cloudinary.com/$](https://res.cloudinary.com/$){cloudName}/image/upload/${publicId}.pdf`;
}
```

## Usage Example
This utility can be used in your components to render a download link or an `<iframe>` viewer for the employer dashboard.

```tsx
import { buildResumeUrl } from "@/shared/lib/utils/cloudinary-documents";
import { FileText } from "lucide-react";
import Link from "next/link";

interface ResumeActionProps {
	resumeUrl: string; // The public_id stored in the DB
}

export function ResumeAction({ resumeUrl }: ResumeActionProps) {
	const resumeLink = buildResumeUrl(resumeUrl);

	if (!resumeLink) return null;

	return (
		<Link className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline" href="{resumeLink}" rel="noopener noreferrer" target="_blank">
			<FileText className="h-4 w-4"/>
			View Resume
		</Link>
	);
}
```
