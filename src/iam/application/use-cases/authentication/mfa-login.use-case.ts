import { Session } from "@/iam/domain/entities";
import { InvalidMfaTokenException } from "@/iam/domain/exceptions";
import { UserRepository } from "@/iam/domain/repositories";
import { SessionId, UserId } from "@/iam/domain/value-objects";
import { IdGeneratorPort } from "@/shared/utils/ports";
import { Injectable } from "@nestjs/common";
import { InvalidLoginException, InvalidMfaChallengeException } from "../../exceptions";
import {
	MfaLoginCommand,
	MfaLoginResult,
	MfaLoginUseCasePort,
} from "../../ports/inbound/authentication";
import {
	EnvConfigPort,
	HashServicePort,
	JwtServicePort,
	MfaChallengePayload,
	MfaServicePort,
	TimeFormatterPort,
} from "../../ports/outbound";

@Injectable()
export class MfaLoginUseCase implements MfaLoginUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtService: JwtServicePort,
		private readonly mfaService: MfaServicePort,
		private readonly hashService: HashServicePort,
		private readonly idGenerator: IdGeneratorPort,
		private readonly envConfig: EnvConfigPort,
		private readonly timeFormatter: TimeFormatterPort,
	) {}

	public async execute(command: MfaLoginCommand): Promise<MfaLoginResult> {
		let payload: MfaChallengePayload;

		try {
			//! Verify the short-lived challenge token with strict return typing
			payload = await this.jwtService.verifyMfaChallengeToken(command.mfaChallengeToken);
			if (payload.type !== "MFA_CHALLENGE") throw new Error();
		} catch {
			throw new InvalidMfaChallengeException();
		}

		const userIdVo = new UserId(payload.sub);
		const user = await this.userRepository.findById(userIdVo);

		if (!user || !user.account || !user.isMfaEnabled())
			throw new InvalidLoginException("Authentication failed.");

		const mfaConfig = user.account.getMfaConfiguration();
		const secret = mfaConfig.getSecret();

		if (!secret) throw new InvalidMfaTokenException("MFA configuration is invalid.");

		//! Check if the provided code is a standard 6-digit TOTP token
		const isTotpValid = this.mfaService.verifyTotpToken(secret, command.code);

		if (!isTotpValid) {
			//! If TOTP failed, check if it matches any hashed backup recovery code
			let isBackupCodeValid = false;
			const backupCodes = mfaConfig.getBackupCodes();

			for (const hashedCode of backupCodes) {
				const matches = await this.hashService.compare(command.code, hashedCode);
				if (matches) {
					isBackupCodeValid = true;
					//! Consume the backup code so it can never be used again
					user.consumeMfaBackupCode(hashedCode);
					break;
				}
			}

			if (!isBackupCodeValid)
				throw new InvalidMfaTokenException("Invalid MFA code or backup recovery code.");
		}

		//! If MFA Verified, create the Multi-Device Session
		const sessionIdStr = this.idGenerator.generateId();
		const tokens = await this.jwtService.generateTokens({
			sub: user.id.getValue(),
			email: user.email.getValue(),
			role: user.role.code.getValue(),
			sessionId: sessionIdStr,
		});

		const refreshTokenHash = await this.hashService.hash(tokens.refreshToken, 10);
		const expiresInEnv = this.envConfig.getRefreshTokenExpiration();
		const expiresInMs = this.timeFormatter.parseToMilliseconds(expiresInEnv);
		const expiresAt = new Date(Date.now() + expiresInMs);

		const session = new Session(
			new SessionId(sessionIdStr),
			user.id,
			refreshTokenHash,
			command.userAgent,
			command.ipAddress,
			false,
			new Date(),
			expiresAt,
			new Date(),
		);

		user.addSession(session);
		await this.userRepository.save(user);

		return {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			user: {
				id: user.id.getValue(),
				email: user.email.getValue(),
				name: user.name,
				role: user.role.code.getValue(),
			},
		};
	}
}
