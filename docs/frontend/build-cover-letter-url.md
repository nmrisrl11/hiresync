# Cloudinary Cover Letter URL Builder (`buildCoverLetterUrl`)

## Overview
The `buildCoverLetterUrl` utility is a strictly typed TypeScript function designed to reconstruct a full Cloudinary CDN URL from a stored `public_id` path specifically for applicant cover letters.

Unlike PDFs, standard text (`.txt`) files are treated as `raw` resources by Cloudinary. Therefore, they are served from the `/raw/upload/` route. The `public_id` generated during the upload process already contains the `.txt` extension, so no additional formatting is needed on the URL string.

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
 * Builds a Cloudinary URL for a TXT Cover Letter.
 * Text files are treated as raw files by Cloudinary, requiring the /raw/upload/ route.
 * 
 * @param publicId - The unique Cloudinary identifier stored in the database.
 * @returns The fully qualified CDN URL, or null if no publicId is provided.
 */
export function buildCoverLetterUrl(publicId: string | null | undefined): string | null {
	if (!publicId) return null;

	const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
	
	if (!cloudName) {
		console.warn("Cloudinary cloud name is missing in environment variables.");
		return null;
	}

	// Raw files do not need format appending, the publicId already includes the .txt extension
	return `[https://res.cloudinary.com/$](https://res.cloudinary.com/$){cloudName}/raw/upload/${publicId}`;
}
```

## Usage Example
This utility can be used in your components to provide direct access to the applicant's text-based cover letter.

```tsx
import { buildCoverLetterUrl } from "@/shared/lib/utils/cloudinary-documents";
import { Paperclip } from "lucide-react";
import Link from "next/link";

interface CoverLetterActionProps {
	coverLetterUrl: string | null; // The public_id stored in the DB
}

export function CoverLetterAction({ coverLetterUrl }: CoverLetterActionProps) {
	const coverLetterLink = buildCoverLetterUrl(coverLetterUrl);

	if (!coverLetterLink) return null;

	return (
		<Link className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline" href="{coverLetterLink}" rel="noopener noreferrer" target="_blank">
			<Paperclip className="h-4 w-4"/>
			View Cover Letter
		</Link>
	);
}
```
