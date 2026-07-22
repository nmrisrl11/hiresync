# Cloudinary Company Logo URL Builder (`buildCompanyLogoUrl`)

## Overview
The `buildCompanyLogoUrl` utility is a strictly typed TypeScript function designed to reconstruct a full Cloudinary CDN URL from a stored `public_id`. 

While avatars usually require face-detection and strict square cropping, company logos come in various aspect ratios (horizontal, vertical, or square). This utility uses Cloudinary's `c_limit` transformation to ensure the logo is optimized and resized to fit within designated boundaries without distorting its original proportions or inappropriately cropping out parts of the branding.

## Location
`src/shared/lib/utils/cloudinary.ts`

## Prerequisites
Your frontend environment must have the Cloudinary Cloud Name configured:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
```

## The Utility Function
Add this alongside your existing `buildAvatarUrl` function.

```typescript
/**
 * Builds an optimized Cloudinary URL for company logos.
 * Automatically applies webp/avif formatting (f_auto) and optimal compression (q_auto).
 * Uses c_limit to preserve the logo's aspect ratio without stretching.
 * 
 * @param publicId - The unique Cloudinary identifier stored in the database.
 * @param maxWidth - The maximum desired width in pixels (default: 500).
 * @param maxHeight - The maximum desired height in pixels (default: 500).
 * @returns The fully qualified CDN URL, or null if no publicId is provided.
 */
export function buildCompanyLogoUrl(
	publicId: string | null | undefined,
	maxWidth: number = 500,
	maxHeight: number = 500,
): string | null {
	if (!publicId) return null;

	const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
	
	if (!cloudName) {
		console.warn("Cloudinary cloud name is missing in environment variables.");
		return null;
	}

	// c_limit: Resizes the image to fit within the given bounds without upscaling or distorting
	// f_auto: Serves AVIF/WebP based on browser support
	// q_auto: Applies optimal algorithmic compression
	const transformations = `c_limit,w_${maxWidth},h_${maxHeight},f_auto,q_auto`;

	return `[https://res.cloudinary.com/$](https://res.cloudinary.com/$){cloudName}/image/upload/${transformations}/${publicId}`;
}
```

## Usage with shadcn/ui
Because company logos often look better with rounded corners rather than full circles, you can still use shadcn's `<Avatar>` component by applying utility classes like `rounded-md`, or simply use a standard `<img>` tag with a fallback UI.

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buildCompanyLogoUrl } from "@/shared/lib/utils/cloudinary";
import { Building2 } from "lucide-react";

interface EmployerProfileProps {
	profile: {
		companyName: string;
		logoUrl: string | null;
	};
}

export function EmployerProfileCard({ profile }: EmployerProfileProps) {
	// Request a max 256x256 bounding box for the logo
	const logoUrl = buildCompanyLogoUrl(profile.logoUrl, 256, 256); 
	const initials = profile.companyName.substring(0, 2).toUpperCase();

	return (
		<div className="flex items-center gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
			<Avatar className="h-16 w-16 rounded-md border bg-muted">
				{logoUrl && (
					<AvatarImage alt="{`${profile.companyName}" className="object-contain p-1" logo`} src="{logoUrl}"/>
				)}
				<AvatarFallback className="rounded-md">
					<Building2 className="h-6 w-6 text-muted-foreground"/>
				</AvatarFallback>
			</Avatar>
			
			<div>
				<h3 className="font-semibold text-lg">{profile.companyName}</h3>
				<p className="text-sm text-muted-foreground">Verified Employer</p>
			</div>
		</div>
	);
}
```
