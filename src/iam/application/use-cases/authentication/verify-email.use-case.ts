import { Session } from "@/iam/domain/entities";
import { UserRepository } from "@/iam/domain/repositories";
import { SessionId } from "@/iam/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { IdGeneratorPort } from "@/shared/utils/ports";
import { Injectable } from "@nestjs/common";
import { InvalidTokenException } from "../../exceptions";
import {
	VerifyEmailCommand,
	VerifyEmailResult,
	VerifyEmailUseCasePort,
} from "../../ports/inbound/authentication";
import {
	EnvConfigPort,
	HashServicePort,
	JwtServicePort,
	TimeFormatterPort,
} from "../../ports/outbound";

@Injectable()
export class VerifyEmailUseCase implements VerifyEmailUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtService: JwtServicePort,
		private readonly hashService: HashServicePort,
		private readonly idGenerator: IdGeneratorPort,
		private readonly envConfig: EnvConfigPort,
		private readonly timeFormatter: TimeFormatterPort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: VerifyEmailCommand): Promise<VerifyEmailResult> {
		const user = await this.userRepository.findByVerificationToken(command.token);

		if (!user) throw new InvalidTokenException("Verification token not found or invalid.");

		user.verifyEmail(command.token);

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

		const session = new Session(
			new SessionId(sessionIdStr),
			user.id,
			refreshTokenHash,
			command.userAgent,
			command.ipAddress,
			false,
			new Date(),
			new Date(Date.now() + expiresInMs),
			new Date(),
		);

		user.addSession(session);
		await this.userRepository.save(user);

		await this.domainEventPublisher.publishMultipleAsync(user.domainEvents);
		user.clearEvents();

		return {
			message: "Email verified successfully.",
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
