import { User } from "@/iam/domain/entities";
import { Email } from "@/iam/domain/value-objects";
import { Injectable, Logger } from "@nestjs/common";
import {
	RoleNotFoundException,
	UnauthorizedRoleException,
	UserAlreadyExistsException,
} from "../exceptions";
import { RegisterUserCommand, RegisterUserResult, RegisterUserUseCasePort } from "../ports/inbound";
import {
	AuthConfigPort,
	EmailQueueServicePort,
	HashServicePort,
	IamRepositoryPort,
	IdGeneratorPort,
	TimeFormatterPort,
	VerificationTokenGeneratorPort,
} from "../ports/outbound";

@Injectable()
export class RegisterUserUseCase implements RegisterUserUseCasePort {
	private readonly logger = new Logger(RegisterUserUseCase.name);

	constructor(
		private readonly iamRepository: IamRepositoryPort,
		private readonly hashService: HashServicePort,
		private readonly idGenerator: IdGeneratorPort,
		private readonly verificationTokenGenerator: VerificationTokenGeneratorPort,
		private readonly emailQueueService: EmailQueueServicePort,
		private readonly timeFormatter: TimeFormatterPort,
		private readonly authConfig: AuthConfigPort,
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
		} catch (error) {
			this.logger.warn(`Unable to queue verification email for ${newUser.email.getValue()}`, error);

			verificationEmailEnqueued = false;
		}

		return { verificationEmailEnqueued };
	}
}
