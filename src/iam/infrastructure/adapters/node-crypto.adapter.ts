import {
	BackupCodesGeneratorPort,
	StateGeneratorPort,
	VerificationTokenGeneratorPort,
} from "@/iam/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";

@Injectable()
export class NodeCryptoAdapter
	implements VerificationTokenGeneratorPort, BackupCodesGeneratorPort, StateGeneratorPort
{
	public generateHexToken(length: number): string {
		return crypto.randomBytes(length).toString("hex");
	}

	generateBackupCodes(length: number): string[] {
		return Array.from({ length }, () => crypto.randomBytes(4).toString("hex").toUpperCase());
	}

	generateState(): string {
		return crypto.randomBytes(32).toString("hex");
	}
}
