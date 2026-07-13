import { Injectable, Logger } from "@nestjs/common";
import { LoggerPort } from "../../application/ports/outbound";

@Injectable()
export class NestjsLoggerAdapter implements LoggerPort {
	private readonly logger = new Logger();

	public log(message: string, context?: string): void {
		this.logger.log(message, context);
	}

	public error(message: string, trace?: string, context?: string): void {
		this.logger.error(message, trace, context);
	}

	public warn(message: string, context?: string): void {
		this.logger.warn(message, context);
	}

	public debug(message: string, context?: string): void {
		this.logger.debug(message, context);
	}
}
