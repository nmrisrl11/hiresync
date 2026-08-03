import { ErrorResponse } from "@/shared/types";
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import type { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
	public catch(exception: HttpException, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();

		//! Safely extract the response payload
		const exceptionResponse: unknown = exception.getResponse();
		let message: string | string[] = exception.message;
		let error = exception.name;

		//! Type guard to check if the response is an object
		if (
			typeof exceptionResponse === "object" &&
			exceptionResponse !== null &&
			!Array.isArray(exceptionResponse)
		) {
			const payload = exceptionResponse as Record<string, unknown>;

			if (typeof payload.message === "string" || Array.isArray(payload.message)) {
				message = payload.message as string | string[];
			}

			if (typeof payload.error === "string") {
				error = payload.error;
			}
		}

		const errorResponse: ErrorResponse = {
			statusCode: status,
			message,
			error,
			path: request.url,
			timestamp: new Date().toISOString(),
		};

		response.status(status).json(errorResponse);
	}
}
