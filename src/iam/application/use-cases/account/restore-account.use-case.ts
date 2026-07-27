import { Injectable } from "@nestjs/common";
import { RestoreAccountCommand, RestoreAccountUseCasePort } from "../../ports/inbound/account";
import { UserRepository } from "@/iam/domain/repositories";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { HashServicePort, JwtServicePort } from "../../ports/outbound";
import { Email } from "@/iam/domain/value-objects";
import { InvalidLoginException } from "../../exceptions";

@Injectable()
export class RestoreAccountUseCase implements RestoreAccountUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtService: JwtServicePort,
		private readonly hashService: HashServicePort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(
		command: RestoreAccountCommand,
	): Promise<{ accessToken: string; refreshToken: string }> {
		const emailVo = new Email(command.email);
		const user = await this.userRepository.findByEmail(emailVo);

		if (!user || !user.account) throw new InvalidLoginException();

		const isPasswordValid = await this.hashService.compare(
			command.password,
			user.account.getPasswordHash(),
		);
		if (!isPasswordValid) throw new InvalidLoginException();

		user.cancelDeletion();

		const tokens = await this.jwtService.generateTokens({
			sub: user.id.getValue(),
			email: user.email.getValue(),
			role: user.role.code.getValue(),
		});

		const refreshTokenHash = await this.hashService.hash(tokens.refreshToken, 10);
		user.updateRefreshToken(refreshTokenHash);

		await this.userRepository.save(user);

		await this.domainEventPublisher.publishMultipleAsync(user.domainEvents);
		user.clearEvents();

		return {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
		};
	}
}
