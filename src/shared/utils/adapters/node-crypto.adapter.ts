import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { IdGeneratorPort } from "../ports";

@Injectable()
export class NodeCryptoAdapter implements IdGeneratorPort {
	public generateId(): string {
		return randomUUID();
	}
}
