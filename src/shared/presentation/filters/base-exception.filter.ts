import { ApplicationBaseException, DomainBaseException } from "@/shared/exceptions/base.exception";
import { ArgumentsHost, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";

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
		const response = host.switchToHttp().getResponse<Response>();

		const status = this.getStatus(exception);

		response.status(status).json({
			statusCode: status,
			message: exception.message,
			error: exception.name,
			timestamp: new Date().toISOString(),
		});
	}
}
