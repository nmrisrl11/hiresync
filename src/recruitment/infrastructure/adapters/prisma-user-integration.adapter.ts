import { UserIntegrationPort } from "@/recruitment/application/ports/outbound";
import { PrismaService } from "@/shared/database/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PrismaUserIntegrationAdapter implements UserIntegrationPort {
	constructor(private readonly prisma: PrismaService) {}

	public async getUserEmail(userId: string): Promise<string | null> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { email: true },
		});

		return user?.email ?? null;
	}
}
