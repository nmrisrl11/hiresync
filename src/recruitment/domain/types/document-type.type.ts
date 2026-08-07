export const DOCUMENT_TYPE = {
	RESUME: "RESUME",
	COVER_LETTER: "COVER_LETTER",
} as const;

export type DocumentType = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE];
