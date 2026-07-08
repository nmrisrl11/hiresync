import { HashServicePort } from "@/iam/application/ports/outbound/hash.service.port";
import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

@Injectable()
export class BcryptHashAdapter implements HashServicePort {
	public async hash(plainText: string, length: number): Promise<string> {
		return bcrypt.hash(plainText, length);
	}
}
