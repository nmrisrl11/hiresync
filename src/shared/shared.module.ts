import { Global, Module } from "@nestjs/common";
import { NestjsLoggerAdapter } from "./logger/adapters/nestjs-logger.adapter";
import { LoggerPort } from "./logger/ports/logger.port";
import { IdGeneratorPort } from "./application/ports/outbound";
import { NodeCryptoAdapter } from "./infrastructure/adapters";

@Global()
@Module({
	providers: [
		{ provide: LoggerPort, useClass: NestjsLoggerAdapter },
		{ provide: IdGeneratorPort, useClass: NodeCryptoAdapter },
	],
	exports: [LoggerPort, IdGeneratorPort],
})
export class SharedModule {}
