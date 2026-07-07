import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("Seeding database with default roles...");

	const roles = [
		{ code: "ADMIN", description: "System administrator with full access" },
		{ code: "EMPLOYER", description: "Can create and manage job postings" },
		{ code: "APPLICANT", description: "Can browse jobs and submit applications" },
	];

	for (const role of roles) {
		await prisma.role.upsert({
			where: { code: role.code },
			update: {},
			create: {
				code: role.code,
				description: role.description,
			},
		});
	}

	console.log("Roles seeded successfully.");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
