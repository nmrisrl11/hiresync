import { ApplicationBaseException, DomainBaseException } from "@/shared/core";
import { ErrorResponse } from "@/shared/types";
import { ArgumentsHost, ExceptionFilter, HttpStatus } from "@nestjs/common";
import type { Request, Response } from "express";

export abstract class BaseExceptionFilter implements ExceptionFilter<
	ApplicationBaseException | DomainBaseException
> {
	protected abstract getStatus(
		exception: ApplicationBaseException | DomainBaseException,
	): HttpStatus;

	public catch(
		exception: ApplicationBaseException | DomainBaseException,
		host: ArgumentsHost,
	): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const status = this.getStatus(exception);

		const errorResponse: ErrorResponse = {
			statusCode: status,
			message: exception.message,
			error: exception.name,
			path: request.path,
			timestamp: new Date().toISOString(),
		};

		response.status(status).json(errorResponse);
	}
}
