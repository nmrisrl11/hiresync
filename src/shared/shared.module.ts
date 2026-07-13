import { Global, Module } from "@nestjs/common";
import { NestjsLoggerAdapter } from "./logger/infrastructure/adapters/nestjs-logger.adapter";
import { LoggerPort } from "./logger/application/ports/outbound";

@Global()
@Module({
	providers: [{ provide: LoggerPort, useClass: NestjsLoggerAdapter }],
	exports: [LoggerPort],
})
export class SharedModule {}
