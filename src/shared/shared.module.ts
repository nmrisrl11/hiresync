import { Global, Module } from "@nestjs/common";
import { NestjsLoggerAdapter } from "./logger/adapters/nestjs-logger.adapter";
import { LoggerPort } from "./logger/ports/logger.port";

@Global()
@Module({
	providers: [{ provide: LoggerPort, useClass: NestjsLoggerAdapter }],
	exports: [LoggerPort],
})
export class SharedModule {}
