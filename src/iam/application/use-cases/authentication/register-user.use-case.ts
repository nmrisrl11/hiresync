import { User } from "@/iam/domain/entities";
import { Email } from "@/iam/domain/value-objects";
import { Injectable } from "@nestjs/common";
import {
	RoleNotFoundException,
	UnauthorizedRoleException,
	UserAlreadyExistsException,
} from "../../exceptions";
import {
	AuthConfigPort,
	EmailQueueServicePort,
	HashServicePort,
	IamRepositoryPort,
	IdGeneratorPort,
	TimeFormatterPort,
	VerificationTokenGeneratorPort,
} from "../../ports/outbound";
import {
	RegisterUserCommand,
	RegisterUserResult,
	RegisterUserUseCasePort,
} from "../../ports/inbound/authentication";
import { LoggerPort } from "@/shared/logger/ports/logger.port";

@Injectable()
export class RegisterUserUseCase implements RegisterUserUseCasePort {
	constructor(
		private readonly iamRepository: IamRepositoryPort,
		private readonly hashService: HashServicePort,
		private readonly idGenerator: IdGeneratorPort,
		private readonly verificationTokenGenerator: VerificationTokenGeneratorPort,
		private readonly emailQueueService: EmailQueueServicePort,
		private readonly timeFormatter: TimeFormatterPort,
		private readonly authConfig: AuthConfigPort,
		private readonly logger: LoggerPort,
	) {}

	public async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
		const emailVo = new Email(command.email);

		const existingUser = await this.iamRepository.findByEmail(emailVo);
		if (existingUser) throw new UserAlreadyExistsException();

		const role = await this.iamRepository.findRoleByCode(command.roleCode);
		if (!role) throw new RoleNotFoundException();

		if (role.isAdmin()) throw new UnauthorizedRoleException();

		const passwordHash = await this.hashService.hash(command.password, 12);

		const verificationToken = this.verificationTokenGenerator.generateHexToken(32);

		const expiresInEnv = this.authConfig.getVerificationTokenExpiration();
		const tokenExpiresInMs = this.timeFormatter.parseToMilliseconds(expiresInEnv);
		const tokenExpiresInText = this.timeFormatter.formatToHumanReadable(tokenExpiresInMs);

		const newUser = User.createForRegistration(
			this.idGenerator.generateId(),
			this.idGenerator.generateId(),
			command.email,
			command.name,
			role,
			passwordHash,
			verificationToken,
			tokenExpiresInMs,
		);

		await this.iamRepository.save(newUser);

		let verificationEmailEnqueued = true;

		try {
			await this.emailQueueService.enqueueVerificationEmail(
				newUser.email.getValue(),
				verificationToken,
				tokenExpiresInText,
			);
		} catch {
			this.logger.warn(`Unable to queue verification email for ${newUser.email.getValue()}`);

			verificationEmailEnqueued = false;
		}

		return { verificationEmailEnqueued };
	}
}
