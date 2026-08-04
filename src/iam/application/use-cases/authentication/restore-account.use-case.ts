import { Session } from "@/iam/domain/entities";
import { UserRepository } from "@/iam/domain/repositories";
import { Email, SessionId } from "@/iam/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { IdGeneratorPort } from "@/shared/utils/ports";
import { Injectable } from "@nestjs/common";
import { InvalidLoginException } from "../../exceptions";
import {
	RestoreAccountCommand,
	RestoreAccountResult,
	RestoreAccountUseCasePort,
} from "../../ports/inbound/authentication";
import {
	EnvConfigPort,
	HashServicePort,
	JwtServicePort,
	TimeFormatterPort,
} from "../../ports/outbound";

@Injectable()
export class RestoreAccountUseCase implements RestoreAccountUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtService: JwtServicePort,
		private readonly hashService: HashServicePort,
		private readonly idGenerator: IdGeneratorPort,
		private readonly envConfig: EnvConfigPort,
		private readonly timeFormatter: TimeFormatterPort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: RestoreAccountCommand): Promise<RestoreAccountResult> {
		const emailVo = new Email(command.email);
		const user = await this.userRepository.findByEmail(emailVo);

		if (!user || !user.account) throw new InvalidLoginException();

		//! Guard against OAuth-only accounts attempting credentials-based restore
		if (!user.account.hasPassword())
			throw new InvalidLoginException(
				"Please sign in using your linked social account to restore your account.",
			);

		const isPasswordValid = await this.hashService.compare(
			command.password,
			user.account.getPasswordHash()!,
		);
		if (!isPasswordValid) throw new InvalidLoginException();

		user.cancelDeletion();

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
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
		};
	}
}
