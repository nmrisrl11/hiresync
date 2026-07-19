import { VerificationTokenGeneratorPort } from "@/iam/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";

@Injectable()
export class NodeCryptoAdapter implements VerificationTokenGeneratorPort {
	public generateHexToken(length: number): string {
		return crypto.randomBytes(length).toString("hex");
	}
}
