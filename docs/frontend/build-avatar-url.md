# Cloudinary Avatar URL Builder (`buildAvatarUrl`)

## Overview
The `buildAvatarUrl` utility is a strict TypeScript function designed to reconstruct a full Cloudinary CDN URL from a stored `public_id`. 

By storing only the `public_id` in our database (rather than the full URL), we decouple our database from our storage provider. This utility handles the dynamic application of Cloudinary's edge transformations (sizing, cropping, and formatting) on the client side.

## Location
`src/shared/lib/utils/cloudinary.ts`

## Prerequisites
Your frontend environment must have the Cloudinary Cloud Name configured:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
```

## The Utility Function
```typescript
/**
 * Builds an optimized Cloudinary URL for avatars.
 * Automatically applies webp/avif formatting (f_auto) and optimal compression (q_auto).
 * * @param publicId - The unique Cloudinary identifier stored in the database.
 * @param size - The desired square dimension in pixels (default: 256).
 * @returns The fully qualified CDN URL, or null if no publicId is provided.
 */
export function buildAvatarUrl(
	publicId: string | null | undefined,
	size: number = 256,
): string | null {
	if (!publicId) return null;

	const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
	
	if (!cloudName) {
		console.warn("Cloudinary cloud name is missing in environment variables.");
		return null;
	}

	// c_fill: Ensures the image covers the square perfectly without distortion
	// g_face: Centers the crop on the detected face
	// f_auto: Serves AVIF/WebP based on browser support
	// q_auto: Applies optimal algorithmic compression
	const transformations = `c_fill,g_face,h_${size},w_${size},f_auto,q_auto`;

	return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
}
```

## Usage with shadcn/ui
This utility pairs perfectly with fallback avatars. If the user hasn't uploaded an image, it safely returns `null`, allowing the `<AvatarFallback>` to render initials.

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buildAvatarUrl } from "@/shared/lib/utils/cloudinary";

interface UserProfileProps {
	user: {
		name: string;
		image: string | null;
	};
}

export function UserProfile({ user }: UserProfileProps) {
	const avatarUrl = buildAvatarUrl(user.image, 128); // Request a 128x128 optimized image
	const initials = user.name.substring(0, 2).toUpperCase();

	return (
		<Avatar className="h-12 w-12">
			{avatarUrl && <AvatarImage src={avatarUrl} alt={`${user.name}'s avatar`} />}
			<AvatarFallback>{initials}</AvatarFallback>
		</Avatar>
	);
}
```