import {
	BackupCodesGeneratorPort,
	VerificationTokenGeneratorPort,
} from "@/iam/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";

@Injectable()
export class NodeCryptoAdapter implements VerificationTokenGeneratorPort, BackupCodesGeneratorPort {
	public generateHexToken(length: number): string {
		return crypto.randomBytes(length).toString("hex");
	}

	generateBackupCodes(length: number): string[] {
		return Array.from({ length }, () => crypto.randomBytes(4).toString("hex").toUpperCase());
	}
}
