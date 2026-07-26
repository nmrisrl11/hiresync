import { Inject, Injectable, Logger, Scope } from "@nestjs/common";
import { INQUIRER } from "@nestjs/core";
import { LoggerPort } from "../ports/logger.port";

@Injectable({ scope: Scope.TRANSIENT })
export class NestjsLoggerAdapter implements LoggerPort {
	constructor(@Inject(INQUIRER) private readonly parentClass: object) {
		//! Automatically grab the name of the class where this logger was injected
		const context = this.parentClass?.constructor?.name || "Application";
		this.logger = new Logger(context);
	}

	private readonly logger: Logger;

	public log(message: string, context?: string): void {
		if (context) {
			this.logger.log(message, context);
		} else {
			this.logger.log(message);
		}
	}

	public error(message: string, trace?: string, context?: string): void {
		if (context) {
			this.logger.error(message, trace, context);
		} else {
			this.logger.error(message, trace);
		}
	}

	public warn(message: string, context?: string): void {
		if (context) {
			this.logger.warn(message, context);
		} else {
			this.logger.warn(message);
		}
	}

	public debug(message: string, context?: string): void {
		if (context) {
			this.logger.debug(message, context);
		} else {
			this.logger.debug(message);
		}
	}
}
