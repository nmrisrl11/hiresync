import { IdGeneratorPort } from "@/iam/application/ports/outbound/id-generator.port";
import { VerificationTokenGeneratorPort } from "@/iam/application/ports/outbound/verification-token-generator.port";
import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";

@Injectable()
export class NodeCryptoAdapter implements IdGeneratorPort, VerificationTokenGeneratorPort {
	public generateId(): string {
		return crypto.randomUUID();
	}

	public generateHexToken(length: number): string {
		return crypto.randomBytes(length).toString("hex");
	}
}
