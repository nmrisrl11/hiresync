import { env } from "@/env";
import { PrismaClient } from "@/generated/prisma/client";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { LoggerPort } from "../logger/ports/logger.port";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	constructor(private readonly logger: LoggerPort) {
		const adapter = new PrismaPg({
			connectionString: env.DATABASE_URL,
		});
		super({ adapter });
	}

	async onModuleInit() {
		this.logger.log("Initializing PostgreSQL connection via Prisma...");
		await this.$connect();
		this.logger.log("Database connected successfully.");
	}
	async onModuleDestroy() {
		this.logger.log("Closing database connection...");
		await this.$disconnect();
		this.logger.log("Database connection closed.");
	}
}
