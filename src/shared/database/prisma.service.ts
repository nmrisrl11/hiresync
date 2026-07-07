import { PrismaClient } from "@/generated/prisma/client";
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(PrismaService.name);

	async onModuleInit() {
		this.logger.log("Initializing PostgreSQL connection via Prisma...");
		await this.$connect();
		this.logger.log("Database connected successfully.");
	}
	async onModuleDestroy() {
		this.logger.log("Closing database connection...");
		await this.$disconnect();
	}
}
