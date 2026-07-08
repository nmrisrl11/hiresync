import { env } from "@/env";
import { PrismaClient } from "@/generated/prisma/client";
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(PrismaService.name);

	constructor() {
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
