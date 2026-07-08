import { HashPasswordServicePort } from "@/iam/application/ports/outbound/hash-password.service.port";
import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

@Injectable()
export class BcryptHashPasswordAdapter implements HashPasswordServicePort {
	public async hashPassword(plainText: string): Promise<string> {
		return bcrypt.hash(plainText, 12);
	}
}
