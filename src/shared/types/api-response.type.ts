export interface SuccessResponse<T> {
	statusCode: number;
	message: string;
	data: T | null;
	timestamp: string;
}

export interface ErrorResponse {
	statusCode: number;
	message: string | string[];
	error: string;
	path: string;
	timestamp: string;
}
