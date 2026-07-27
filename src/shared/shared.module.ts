import { Global, Module } from "@nestjs/common";
import {
	NestjsDomainEventPublisherAdapter,
	NestjsIntegrationEventPublisherAdapter,
} from "./events/adapters";
import { DomainEventPublisherPort, IntegrationEventPublisherPort } from "./events/ports";
import { NestjsLoggerAdapter } from "./logger/adapters/nestjs-logger.adapter";
import { LoggerPort } from "./logger/ports/logger.port";
import { NodeCryptoAdapter } from "./utils/adapters";
import { IdGeneratorPort } from "./utils/ports";

@Global()
@Module({
	providers: [
		{ provide: LoggerPort, useClass: NestjsLoggerAdapter },
		{ provide: IdGeneratorPort, useClass: NodeCryptoAdapter },
		{ provide: DomainEventPublisherPort, useClass: NestjsDomainEventPublisherAdapter },
		{ provide: IntegrationEventPublisherPort, useClass: NestjsIntegrationEventPublisherAdapter },
	],
	exports: [LoggerPort, IdGeneratorPort, DomainEventPublisherPort, IntegrationEventPublisherPort],
})
export class SharedModule {}
