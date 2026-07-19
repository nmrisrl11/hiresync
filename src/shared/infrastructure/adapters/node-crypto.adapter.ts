import { IdGeneratorPort } from "@/shared/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

@Injectable()
export class NodeCryptoAdapter implements IdGeneratorPort {
	public generateId(): string {
		return randomUUID();
	}
}
